# Production-to-Shipment Workflow: Integration Guide

## Quick Start - 3 Main Components to Update

### 1. Backend: Add New Endpoint to `manufacturing.js`

**File**: `server/routes/manufacturing.js`

**What to do**:
- Copy the code from `PRODUCTION_SHIPMENT_ENDPOINT.js`
- Add it to the manufacturing.js router file (before the `module.exports`)
- The endpoint handles: validation → material reconciliation → shipment creation

**Key Imports Needed**:
```javascript
const { ProductionOrder, ProductionStage, Shipment, SalesOrder, Inventory, InventoryMovement } = require('../models');
const { NotificationService } = require('../services/NotificationService');
```

**Endpoint**: `POST /manufacturing/orders/:orderId/complete-and-ship`

---

### 2. Frontend: Update `ProductionOperationsViewPage.jsx`

**File**: `client/src/pages/manufacturing/ProductionOperationsViewPage.jsx`

**What to add**:

#### Step 1: Add State Variables (after existing useState declarations)
```javascript
const [allStagesCompleted, setAllStagesCompleted] = useState(false);
const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
const [materialReconciliationOpen, setMaterialReconciliationOpen] = useState(false);
const [completionSuccessOpen, setCompletionSuccessOpen] = useState(false);
const [availableMaterials, setAvailableMaterials] = useState([]);
const [selectedMaterials, setSelectedMaterials] = useState({});
const [loadingMaterials, setLoadingMaterials] = useState(false);
const [completingProduction, setCompletingProduction] = useState(false);
const [completionSummary, setCompletionSummary] = useState(null);
```

#### Step 2: Add useEffect to Check Completion Status
```javascript
useEffect(() => {
  if (productionOrder && productionOrder.stages) {
    const completed = productionOrder.stages.length > 0 && 
                     productionOrder.stages.every(s => s.status === 'completed');
    setAllStagesCompleted(completed);
  }
}, [productionOrder]);
```

#### Step 3: Add Handler Functions
Copy all the handlers from `PRODUCTION_OPERATIONS_COMPLETION_FRONTEND.jsx`:
- `fetchMaterialsForReconciliation`
- `handleCompleteProduction`
- `handleProceedToMaterialReconciliation`
- `handleToggleMaterialReturn`
- `handleCompleteAndShip`

#### Step 4: Add the Three Dialog Components
Copy from `PRODUCTION_OPERATIONS_COMPLETION_FRONTEND.jsx`:
- `CompletionConfirmationDialog`
- `MaterialReconciliationDialog`
- `CompletionSuccessDialog`

#### Step 5: Add Completion Button to Header
Add this button in the header area of ProductionOperationsViewPage:
```javascript
{allStagesCompleted && productionOrder?.status !== 'completed' && (
  <button
    onClick={handleCompleteProduction}
    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
  >
    <CheckCircle className="w-5 h-5" />
    Complete & Ready for Shipment
  </button>
)}
```

#### Step 6: Add Dialogs at End of Return Statement
```javascript
<CompletionConfirmationDialog />
<MaterialReconciliationDialog />
<CompletionSuccessDialog />
```

---

### 3. Backend: Update Database Model (Optional but Recommended)

**File**: `server/models/ProductionOrder.js`

**Add these fields** (if not already present):
```javascript
completed_at: {
  type: DataTypes.DATE,
  allowNull: true,
  comment: 'Timestamp when production was completed'
},
material_reconciliation_data: {
  type: DataTypes.JSON,
  allowNull: true,
  comment: 'Stores material reconciliation information'
},
production_order_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'production_orders',
    key: 'id'
  },
  comment: 'Link from shipment back to production order'
}
```

**File**: `server/models/Shipment.js`

**Add field**:
```javascript
production_order_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'production_orders',
    key: 'id'
  },
  comment: 'Link to production order that created this shipment'
}
```

---

### 4. Frontend: Update `ShipmentDashboard.jsx` (Optional Enhancement)

**File**: `client/src/pages/dashboards/ShipmentDashboard.jsx`

**Add "Ready for Shipment" Tab**:

In the tab definitions, add:
```javascript
const tabs = [
  'All Shipments',
  'Pending', // NEW - Shipments in "preparing" status
  'In Transit',
  'Delivered'
];
```

In the fetchShipments function, add status filtering:
```javascript
if (tabValue === 1) { // Pending tab
  params.append('status', 'preparing');
} else if (tabValue === 2) { // In Transit
  params.append('status', 'in_transit');
}
```

**Add Filter for "Ready for Production"**:
```javascript
const [readyForShipmentCount, setReadyForShipmentCount] = useState(0);

// Fetch in useEffect
const countReadyShipments = async () => {
  try {
    const response = await api.get('/shipments?status=preparing&limit=1');
    setReadyForShipmentCount(response.data.total || 0);
  } catch (error) {
    console.log('Could not fetch ready shipments count');
  }
};
```

---

## Database Migration (If Using Migrations)

**Create migration**: `create-production-shipment-link.js`

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('production_orders', 'completed_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('production_orders', 'material_reconciliation_data', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('shipments', 'production_order_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'production_orders',
        key: 'id'
      },
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('production_orders', 'completed_at');
    await queryInterface.removeColumn('production_orders', 'material_reconciliation_data');
    await queryInterface.removeColumn('shipments', 'production_order_id');
  }
};
```

---

## Testing Checklist

### Backend Tests
- [ ] Create production order with multiple stages
- [ ] Complete each stage one by one
- [ ] Try completing before all stages done (should fail)
- [ ] Call `/manufacturing/orders/{id}/complete-and-ship`
- [ ] Verify production order status → completed
- [ ] Verify shipment created with "preparing" status
- [ ] Verify materials returned to inventory
- [ ] Verify inventory movements recorded
- [ ] Verify notifications sent
- [ ] Test with no leftover materials
- [ ] Test with error scenarios (no approval qty, etc.)

### Frontend Tests
- [ ] Open Production Operations page
- [ ] Verify "Complete & Ready for Shipment" button shows when all stages done
- [ ] Button hidden when stages incomplete
- [ ] Click button → Confirmation dialog
- [ ] Proceed to material reconciliation
- [ ] Verify materials listed with quantities
- [ ] Toggle material selection
- [ ] Submit → Loading state
- [ ] Success dialog shows
- [ ] Auto-redirect to shipment dashboard
- [ ] Verify shipment appears in dashboard

### Integration Tests
- [ ] End-to-end: Create order → Complete production → Auto shipment
- [ ] Verify sales order status updated to "in_shipment"
- [ ] Verify notifications in inbox
- [ ] Verify audit trail/history recorded

---

## Workflow Flow Chart

```
[Production Order Created]
         ↓
[All Stages Progressed]
         ↓
[User Marks Last Stage Complete]
         ↓
[System Auto-Detects Completion]
         ↓
[Shows "Complete & Ready for Shipment" Button]
         ↓
[User Clicks Button]
         ↓
[Confirmation Dialog Shows Order Summary]
         ↓
[User Clicks "Proceed"]
         ↓
[Material Reconciliation Dialog]
- Fetches leftover materials
- Shows quantity used vs leftover
- User selects which to return
         ↓
[User Clicks "Complete & Create Shipment"]
         ↓
[Backend Processing (Transaction)]
1. Validate all conditions
2. Mark production as completed
3. Return selected materials to inventory
4. Create inventory movements
5. Create shipment (status: preparing)
6. Update sales order to in_shipment
7. Send notifications
         ↓
[Success Screen Shown (3 seconds)]
- Shows production number
- Shows shipment number
- Shows materials returned count
         ↓
[Auto-Redirect to Shipment Dashboard]
         ↓
[User Sees Shipment in "Preparing" Status]
         ↓
[Shipment Management Continues...]
```

---

## API Response Examples

### Success Response:
```json
{
  "success": true,
  "message": "Production completed and shipment created successfully",
  "production_order": {
    "id": 123,
    "production_number": "PRD-20250115-0001",
    "status": "completed",
    "completed_at": "2025-01-15T10:30:00Z",
    "approved_quantity": 100
  },
  "shipment": {
    "id": 456,
    "shipment_number": "SHP-20250115-0001",
    "status": "preparing",
    "total_quantity": 100,
    "expected_delivery_date": "2025-01-20"
  },
  "material_reconciliation": {
    "items_returned": 3,
    "total_quantity_returned": 25
  },
  "notifications_sent": true
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Cannot complete production. Only 5/8 stages are completed",
  "stages_progress": {
    "completed": 5,
    "total": 8
  }
}
```

---

## Environment Variables (If Needed)

Add to `.env`:
```
# Shipment defaults
SHIPMENT_DEFAULT_DELIVERY_DAYS=5
SHIPMENT_DEFAULT_METHOD=standard
SHIPMENT_NOTIFICATION_ENABLED=true
```

---

## Troubleshooting

### Issue: "Cannot complete production" error even though all stages show completed

**Solution**: 
- Check database directly: `SELECT status FROM production_stages WHERE production_order_id = ?`
- Ensure all stages have `status = 'completed'`
- Check if there are hidden pending stages

### Issue: Materials not appearing in reconciliation dialog

**Solution**:
- Verify `MaterialConsumption` records exist for this production order
- Check production stage has material consumption data
- Verify materials linked to production stages in database

### Issue: Shipment created but not appearing in dashboard

**Solution**:
- Check shipment status: `SELECT status FROM shipments WHERE id = ?`
- Verify sales_order_id is correct
- Check ShipmentDashboard API call parameters

### Issue: Materials returned but inventory not updated

**Solution**:
- Check `InventoryMovement` table for the transaction
- Verify `Inventory.quantity_available` was updated
- Check for transaction rollback in server logs

---

## Performance Considerations

1. **Material Reconciliation Fetch**: 
   - Could be slow if many materials
   - Consider pagination/lazy loading

2. **Transaction Size**: 
   - With many materials, transaction might be large
   - Monitor transaction time

3. **Notification Sending**: 
   - Run async if many recipients
   - Don't block main transaction

---

## Security Considerations

1. **Authentication**: Endpoint requires `authenticateToken`
2. **Authorization**: Requires `manufacturing` or `admin` department
3. **Data Validation**: All inputs validated before processing
4. **Audit Trail**: All changes logged with user info
5. **Transaction Safety**: Rollback on any error prevents partial updates

---

## Future Enhancements

1. **Batch Processing**: Complete multiple orders together
2. **Custom Delivery Dates**: User selects date before shipment creation
3. **Carrier Integration**: Auto-assign carrier based on location
4. **Document Generation**: Auto-generate packing slips, labels
5. **Return Management**: Track return shipments
6. **Analytics**: Track completion rate, avg time to shipment