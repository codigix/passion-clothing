# 🎯 QUICK START: Material Tracking Implementation

## 📌 INCOMING ORDERS REQUEST (Current)

### **Frontend Call:**
```javascript
// Location: client/src/pages/dashboards/InventoryDashboard.jsx:34
const response = await api.get('/inventory/orders/incoming?status=ready_for_inventory');
setIncomingOrders(response.data.orders || []);
```

### **Backend Endpoint:**
```javascript
// Location: server/routes/inventory.js:427
GET /api/inventory/orders/incoming

Query Parameters:
  ?status=ready_for_inventory  // or 'approved', 'sent', 'acknowledged'

Response:
{
  "orders": [
    {
      "id": 2,
      "order_number": "PO-20250105-001",
      "vendor": "ABC Fabrics",
      "items": [
        {
          "fabric_name": "Cotton Twill",
          "quantity": "500",
          "uom": "Meters"
        }
      ]
    }
  ]
}
```

### **Current Status Flow:**
```
PO Status: approved/sent/acknowledged
    ↓ [User clicks "Add to Inventory"]
POST /api/procurement/:id/add-to-inventory
    ↓ [Generates barcodes automatically]
    ✅ Creates inventory records with barcodes
    ✅ Status: "received"
```

---

## 🔧 STEP-BY-STEP IMPLEMENTATION

### **PHASE 1: Material Allocation Model (Do This First!)**

#### **Step 1.1: Create Material Allocation Model**

Create file: `server/models/MaterialAllocation.js`

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialAllocation = sequelize.define('MaterialAllocation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    production_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'production_orders', key: 'id' }
    },
    production_stage_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'production_stages', key: 'id' }
    },
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'inventory', key: 'id' }
    },
    barcode: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Barcode from inventory item'
    },
    quantity_allocated: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity_consumed: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    quantity_returned: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    uom: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('allocated', 'in_use', 'consumed', 'partially_returned', 'fully_returned'),
      defaultValue: 'allocated'
    },
    allocated_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    allocated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    consumption_log: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of consumption events with timestamps'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'material_allocations',
    timestamps: true,
    indexes: [
      { fields: ['production_order_id'] },
      { fields: ['inventory_id'] },
      { fields: ['barcode'] },
      { fields: ['status'] },
      { fields: ['production_stage_id'] }
    ]
  });

  return MaterialAllocation;
};
```

#### **Step 1.2: Add Model to Database Config**

Edit: `server/config/database.js`

```javascript
// Add after existing models
const MaterialAllocation = require('../models/MaterialAllocation')(sequelize);

// Add associations (find the associations section)
ProductionOrder.hasMany(MaterialAllocation, { 
  foreignKey: 'production_order_id', 
  as: 'materialAllocations' 
});
MaterialAllocation.belongsTo(ProductionOrder, { 
  foreignKey: 'production_order_id', 
  as: 'productionOrder' 
});

Inventory.hasMany(MaterialAllocation, { 
  foreignKey: 'inventory_id', 
  as: 'allocations' 
});
MaterialAllocation.belongsTo(Inventory, { 
  foreignKey: 'inventory_id', 
  as: 'inventory' 
});

ProductionStage.hasMany(MaterialAllocation, { 
  foreignKey: 'production_stage_id', 
  as: 'materialAllocations' 
});
MaterialAllocation.belongsTo(ProductionStage, { 
  foreignKey: 'production_stage_id', 
  as: 'stage' 
});

User.hasMany(MaterialAllocation, { 
  foreignKey: 'allocated_by', 
  as: 'allocatedMaterials' 
});
MaterialAllocation.belongsTo(User, { 
  foreignKey: 'allocated_by', 
  as: 'allocator' 
});

// Export MaterialAllocation
module.exports = {
  // ... existing exports
  MaterialAllocation,
};
```

---

### **PHASE 2: Material Allocation Endpoints**

#### **Step 2.1: Add Allocation Endpoint**

Edit: `server/routes/manufacturing.js`

Add at the end before `module.exports`:

```javascript
// Allocate materials to production order
router.post(
  '/orders/:id/allocate-materials',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { materials } = req.body; // [{ inventory_id, barcode, quantity }]

      // 1. Verify production order exists
      const productionOrder = await ProductionOrder.findByPk(id);
      if (!productionOrder) {
        return res.status(404).json({ message: 'Production order not found' });
      }

      // 2. Validate inventory availability
      const allocations = [];
      for (const material of materials) {
        const inventoryItem = await Inventory.findByPk(material.inventory_id);
        
        if (!inventoryItem) {
          return res.status(404).json({ 
            message: `Inventory item ${material.inventory_id} not found` 
          });
        }

        if (inventoryItem.quantity < material.quantity) {
          return res.status(400).json({ 
            message: `Insufficient quantity for ${inventoryItem.barcode}. Available: ${inventoryItem.quantity}, Requested: ${material.quantity}` 
          });
        }

        // 3. Create allocation record
        const allocation = await MaterialAllocation.create({
          production_order_id: id,
          inventory_id: material.inventory_id,
          barcode: inventoryItem.barcode,
          quantity_allocated: material.quantity,
          uom: inventoryItem.uom,
          allocated_by: req.user.id,
          consumption_log: []
        });

        allocations.push(allocation);

        // 4. Update inventory quantity (deduct allocated amount)
        await inventoryItem.update({
          quantity: inventoryItem.quantity - material.quantity,
          reserved_quantity: (inventoryItem.reserved_quantity || 0) + material.quantity
        });

        // 5. Create inventory movement record
        await InventoryMovement.create({
          inventory_id: material.inventory_id,
          production_order_id: id,
          movement_type: 'outward',
          quantity: -material.quantity,
          previous_quantity: inventoryItem.quantity,
          new_quantity: inventoryItem.quantity - material.quantity,
          notes: `Allocated to production order ${productionOrder.production_number}`,
          performed_by: req.user.id,
          location_to: 'Manufacturing Floor',
          metadata: {
            allocation_id: allocation.id,
            barcode: inventoryItem.barcode
          }
        });
      }

      // 6. Update production order status
      await productionOrder.update({ status: 'material_allocated' });

      // 7. Send notification
      await NotificationService.createNotification({
        type: 'material_allocated',
        title: 'Materials Allocated',
        message: `${allocations.length} materials allocated to ${productionOrder.production_number}`,
        department: 'manufacturing',
        link: `/manufacturing/orders/${id}`
      });

      res.json({
        message: 'Materials allocated successfully',
        allocations: allocations.map(a => ({
          id: a.id,
          barcode: a.barcode,
          quantity: a.quantity_allocated,
          uom: a.uom
        }))
      });

    } catch (error) {
      console.error('Material allocation error:', error);
      res.status(500).json({ message: 'Failed to allocate materials' });
    }
  }
);

// Get allocated materials for a production order
router.get(
  '/orders/:id/materials',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const allocations = await MaterialAllocation.findAll({
        where: { production_order_id: id },
        include: [
          {
            model: Inventory,
            as: 'inventory',
            include: [{ model: Product, as: 'product' }]
          },
          {
            model: ProductionStage,
            as: 'stage',
            attributes: ['id', 'stage_name', 'status']
          }
        ],
        order: [['allocated_at', 'ASC']]
      });

      const summary = {
        total_allocated: allocations.reduce((sum, a) => sum + parseFloat(a.quantity_allocated), 0),
        total_consumed: allocations.reduce((sum, a) => sum + parseFloat(a.quantity_consumed), 0),
        total_returned: allocations.reduce((sum, a) => sum + parseFloat(a.quantity_returned), 0),
        remaining: allocations.reduce((sum, a) => 
          sum + (parseFloat(a.quantity_allocated) - parseFloat(a.quantity_consumed) - parseFloat(a.quantity_returned)), 0
        )
      };

      res.json({
        allocations: allocations.map(a => ({
          id: a.id,
          barcode: a.barcode,
          item_name: a.inventory.product?.name || 'N/A',
          quantity_allocated: a.quantity_allocated,
          quantity_consumed: a.quantity_consumed,
          quantity_returned: a.quantity_returned,
          quantity_remaining: parseFloat(a.quantity_allocated) - parseFloat(a.quantity_consumed) - parseFloat(a.quantity_returned),
          uom: a.uom,
          status: a.status,
          stage: a.stage?.stage_name,
          allocated_at: a.allocated_at
        })),
        summary
      });

    } catch (error) {
      console.error('Error fetching materials:', error);
      res.status(500).json({ message: 'Failed to fetch materials' });
    }
  }
);
```

---

### **PHASE 3: Material Consumption Tracking**

Add to `server/routes/manufacturing.js`:

```javascript
// Consume material in a production stage
router.post(
  '/stages/:stageId/consume-material',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const { stageId } = req.params;
      const { barcode, quantity_consumed } = req.body;

      // 1. Find the stage
      const stage = await ProductionStage.findByPk(stageId);
      if (!stage) {
        return res.status(404).json({ message: 'Production stage not found' });
      }

      // 2. Find material allocation by barcode
      const allocation = await MaterialAllocation.findOne({
        where: {
          production_order_id: stage.production_order_id,
          barcode: barcode
        }
      });

      if (!allocation) {
        return res.status(404).json({ 
          message: `Material with barcode ${barcode} not allocated to this production order` 
        });
      }

      // 3. Validate quantity
      const remaining = parseFloat(allocation.quantity_allocated) - 
                       parseFloat(allocation.quantity_consumed) - 
                       parseFloat(allocation.quantity_returned);

      if (quantity_consumed > remaining) {
        return res.status(400).json({ 
          message: `Cannot consume ${quantity_consumed}. Only ${remaining} ${allocation.uom} remaining.` 
        });
      }

      // 4. Update consumption log
      const consumptionLog = allocation.consumption_log || [];
      consumptionLog.push({
        stage_id: stageId,
        stage_name: stage.stage_name,
        quantity: quantity_consumed,
        consumed_by: req.user.id,
        consumed_at: new Date(),
        notes: req.body.notes || ''
      });

      // 5. Update allocation
      const newConsumed = parseFloat(allocation.quantity_consumed) + parseFloat(quantity_consumed);
      const newStatus = newConsumed >= parseFloat(allocation.quantity_allocated) ? 'consumed' : 'in_use';

      await allocation.update({
        quantity_consumed: newConsumed,
        consumption_log: consumptionLog,
        status: newStatus,
        production_stage_id: stageId
      });

      // 6. Update stage material consumption
      const stageMaterialConsumption = stage.material_consumption || {};
      stageMaterialConsumption[barcode] = (stageMaterialConsumption[barcode] || 0) + quantity_consumed;

      await stage.update({
        material_consumption: stageMaterialConsumption
      });

      res.json({
        message: 'Material consumption recorded',
        allocation: {
          barcode: allocation.barcode,
          quantity_allocated: allocation.quantity_allocated,
          quantity_consumed: allocation.quantity_consumed,
          quantity_remaining: remaining - quantity_consumed,
          uom: allocation.uom,
          status: newStatus
        }
      });

    } catch (error) {
      console.error('Material consumption error:', error);
      res.status(500).json({ message: 'Failed to record material consumption' });
    }
  }
);

// Scan barcode and get material info
router.get(
  '/materials/scan/:barcode',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const { barcode } = req.params;

      const allocation = await MaterialAllocation.findOne({
        where: { barcode },
        include: [
          {
            model: Inventory,
            as: 'inventory',
            include: [{ model: Product, as: 'product' }]
          },
          {
            model: ProductionOrder,
            as: 'productionOrder'
          }
        ]
      });

      if (!allocation) {
        return res.status(404).json({ 
          message: 'Material not found or not allocated to any production order' 
        });
      }

      const remaining = parseFloat(allocation.quantity_allocated) - 
                       parseFloat(allocation.quantity_consumed) - 
                       parseFloat(allocation.quantity_returned);

      res.json({
        barcode: allocation.barcode,
        item_name: allocation.inventory.product?.name || allocation.inventory.item_name,
        production_order: allocation.productionOrder.production_number,
        quantity_allocated: allocation.quantity_allocated,
        quantity_consumed: allocation.quantity_consumed,
        quantity_returned: allocation.quantity_returned,
        quantity_remaining: remaining,
        uom: allocation.uom,
        status: allocation.status,
        consumption_log: allocation.consumption_log || []
      });

    } catch (error) {
      console.error('Barcode scan error:', error);
      res.status(500).json({ message: 'Failed to scan barcode' });
    }
  }
);
```

---

## 🚀 TESTING THE FLOW

### **Test 1: Create Production Order**
```bash
POST /api/manufacturing/orders
{
  "sales_order_id": 1,
  "product_id": 5,
  "quantity": 100,
  "planned_start_date": "2025-01-20",
  "planned_end_date": "2025-02-10"
}

Response: { "production_number": "PRD-20250120-0001" }
```

### **Test 2: Allocate Materials**
```bash
POST /api/manufacturing/orders/1/allocate-materials
{
  "materials": [
    {
      "inventory_id": 45,
      "barcode": "INV-20250105-00001",
      "quantity": 400
    }
  ]
}

Response: { "message": "Materials allocated successfully" }
```

### **Test 3: Scan Barcode**
```bash
GET /api/manufacturing/materials/scan/INV-20250105-00001

Response:
{
  "barcode": "INV-20250105-00001",
  "item_name": "Cotton Twill - Navy Blue",
  "quantity_allocated": 400,
  "quantity_consumed": 0,
  "quantity_remaining": 400,
  "uom": "Meters"
}
```

### **Test 4: Consume Material**
```bash
POST /api/manufacturing/stages/12/consume-material
{
  "barcode": "INV-20250105-00001",
  "quantity_consumed": 150,
  "notes": "Used in cutting stage"
}

Response:
{
  "allocation": {
    "quantity_consumed": 150,
    "quantity_remaining": 250
  }
}
```

---

## 📋 RESTART SERVER & TEST

```powershell
# 1. Restart server (it will auto-create material_allocations table)
npm start

# 2. Test incoming orders endpoint
curl http://localhost:5000/api/inventory/orders/incoming?status=ready_for_inventory

# 3. Create a production order (use Manufacturing Dashboard)

# 4. Allocate materials (use new endpoint)

# 5. Track consumption
```

---

## ✅ CHECKLIST

- [ ] Create `MaterialAllocation` model
- [ ] Add associations in `database.js`
- [ ] Add allocation endpoints to `manufacturing.js`
- [ ] Add consumption tracking endpoints
- [ ] Add barcode scanning endpoint
- [ ] Restart server (auto-creates table)
- [ ] Test material allocation
- [ ] Test material consumption
- [ ] Build frontend UI (next phase)

---

Ready to implement? Let me know if you want me to:
1. Create all the files now
2. Build the frontend UI for barcode scanning
3. Add QR code generation for production orders