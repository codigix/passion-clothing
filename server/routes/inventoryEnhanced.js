const express = require('express');
const router = express.Router();
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const db = require('../config/database');
const { Op } = require('sequelize');
const bwipjs = require('bwip-js');

// Generate unique barcode for inventory
const generateInventoryBarcode = async () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const barcode = `INV${timestamp}${random}`;
  
  // Check if barcode already exists
  const existing = await db.Inventory.findOne({ where: { barcode } });
  if (existing) {
    return generateInventoryBarcode(); // Recursive retry
  }
  
  return barcode;
};

// =================== INVENTORY CRUD ===================

// GET All Inventory with filtering and search
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      stock_type,
      category,
      location,
      sales_order_id,
      low_stock,
      sortBy = 'updated_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { is_active: true };

    // Build search conditions
    if (search) {
      where[Op.or] = [
        { product_name: { [Op.like]: `%${search}%` } },
        { product_code: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (stock_type) where.stock_type = stock_type;
    if (category) where.category = category;
    if (location) where.location = location;
    if (sales_order_id) where.sales_order_id = sales_order_id;
    
    if (low_stock === 'true') {
      where[Op.and] = db.sequelize.literal('current_stock <= reorder_level');
    }

    const { count, rows } = await db.Inventory.findAndCountAll({
      where,
      include: [
        {
          model: db.SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'order_number', 'customer_id', 'order_date'],
          required: false
        },
        {
          model: db.PurchaseOrder,
          as: 'purchaseOrder',
          attributes: ['id', 'po_number', 'vendor_id'],
          required: false
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      inventory: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Failed to fetch inventory', error: error.message });
  }
});

// GET Inventory Stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalItems = await db.Inventory.count({ where: { is_active: true } });
    
    const totalQuantity = await db.Inventory.sum('current_stock', {
      where: { is_active: true }
    });

    const totalValue = await db.Inventory.sum('total_value', {
      where: { is_active: true }
    });

    const lowStockItems = await db.Inventory.count({
      where: {
        is_active: true,
        [Op.and]: db.sequelize.literal('current_stock <= reorder_level')
      }
    });

    const outOfStock = await db.Inventory.count({
      where: { is_active: true, current_stock: 0 }
    });

    const factoryStock = await db.Inventory.sum('current_stock', {
      where: { is_active: true, stock_type: 'general_extra' }
    });

    const projectStock = await db.Inventory.sum('current_stock', {
      where: { is_active: true, stock_type: 'project_specific' }
    });

    res.json({
      success: true,
      stats: {
        totalItems,
        totalQuantity: totalQuantity || 0,
        totalValue: totalValue || 0,
        lowStockItems,
        outOfStock,
        factoryStock: factoryStock || 0,
        projectStock: projectStock || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

// GET Inventory by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await db.Inventory.findByPk(id, {
      include: [
        {
          model: db.SalesOrder,
          as: 'salesOrder',
          include: [
            { model: db.Customer, as: 'customer', attributes: ['id', 'company_name', 'contact_person'] }
          ]
        },
        {
          model: db.PurchaseOrder,
          as: 'purchaseOrder',
          include: [
            { model: db.Vendor, as: 'vendor', attributes: ['id', 'company_name', 'contact_person'] }
          ]
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ success: true, inventory });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ message: 'Failed to fetch inventory item', error: error.message });
  }
});

// POST Create new inventory item
router.post('/', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const {
      product_name,
      product_code,
      description,
      category,
      sub_category,
      product_type,
      unit_of_measurement,
      hsn_code,
      brand,
      color,
      size,
      material,
      specifications,
      images,
      cost_price,
      selling_price,
      mrp,
      tax_percentage,
      weight,
      dimensions,
      is_serialized,
      is_batch_tracked,
      quality_parameters,
      location,
      current_stock,
      unit_cost,
      batch_number,
      serial_number,
      expiry_date,
      manufacturing_date,
      quality_status,
      condition,
      notes,
      stock_type,
      sales_order_id,
      minimum_level,
      maximum_level,
      reorder_level
    } = req.body;

    // Validation
    if (!product_name) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Product name is required' });
    }

    if (!current_stock || parseFloat(current_stock) < 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Valid stock quantity is required' });
    }

    // Generate barcode
    const barcode = await generateInventoryBarcode();

    // Generate product code if not provided
    const generatedProductCode = product_code || `PRD${Date.now().toString().slice(-8)}`;

    // Create inventory item
    const inventory = await db.Inventory.create({
      product_name,
      product_code: generatedProductCode,
      description,
      category: category || 'raw_material',
      sub_category,
      product_type: product_type || 'raw_material',
      unit_of_measurement: unit_of_measurement || 'piece',
      hsn_code,
      brand,
      color,
      size,
      material,
      specifications,
      images,
      cost_price: parseFloat(cost_price) || 0,
      selling_price: parseFloat(selling_price) || 0,
      mrp: parseFloat(mrp) || 0,
      tax_percentage: parseFloat(tax_percentage) || 0,
      weight,
      dimensions,
      is_serialized: is_serialized || false,
      is_batch_tracked: is_batch_tracked || false,
      quality_parameters,
      location: location || 'Main Warehouse',
      batch_number,
      serial_number,
      current_stock: parseFloat(current_stock),
      initial_quantity: parseFloat(current_stock),
      available_stock: parseFloat(current_stock),
      unit_cost: parseFloat(unit_cost) || parseFloat(cost_price) || 0,
      total_value: parseFloat(current_stock) * (parseFloat(unit_cost) || parseFloat(cost_price) || 0),
      expiry_date,
      manufacturing_date,
      quality_status: quality_status || 'approved',
      condition: condition || 'new',
      notes,
      barcode,
      qr_code: JSON.stringify({
        barcode,
        product_name,
        product_code: generatedProductCode,
        location: location || 'Main Warehouse',
        timestamp: new Date().toISOString()
      }),
      movement_type: 'inward',
      last_movement_date: new Date(),
      stock_type: stock_type || 'general_extra',
      sales_order_id: sales_order_id || null,
      minimum_level: parseFloat(minimum_level) || 0,
      maximum_level: parseFloat(maximum_level) || 0,
      reorder_level: parseFloat(reorder_level) || 0,
      created_by: req.user.id,
      updated_by: req.user.id,
      is_active: true
    }, { transaction });

    // Create inventory movement record
    await db.InventoryMovement.create({
      inventory_id: inventory.id,
      movement_type: 'inward',
      quantity: parseFloat(current_stock),
      previous_quantity: 0,
      new_quantity: parseFloat(current_stock),
      unit_cost: parseFloat(unit_cost) || parseFloat(cost_price) || 0,
      total_cost: parseFloat(current_stock) * (parseFloat(unit_cost) || parseFloat(cost_price) || 0),
      reference_number: barcode,
      notes: `Initial stock addition - ${stock_type} ${sales_order_id ? '(Project Stock)' : '(Factory Stock)'}`,
      location_from: 'New Entry',
      location_to: location || 'Main Warehouse',
      performed_by: req.user.id,
      movement_date: new Date(),
      metadata: {
        created_via: 'inventory_creation',
        stock_type,
        sales_order_id
      }
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      inventory
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating inventory:', error);
    res.status(500).json({ message: 'Failed to create inventory item', error: error.message });
  }
});

// PUT Update inventory item
router.put('/:id', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const updateData = req.body;

    const inventory = await db.Inventory.findByPk(id, { transaction });
    if (!inventory) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Update fields
    await inventory.update({
      ...updateData,
      updated_by: req.user.id
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      inventory
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Failed to update inventory item', error: error.message });
  }
});

// DELETE (soft delete) inventory item
router.delete('/:id', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await db.Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    await inventory.update({
      is_active: false,
      updated_by: req.user.id
    });

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json({ message: 'Failed to delete inventory item', error: error.message });
  }
});

// =================== BARCODE OPERATIONS ===================

// GET Generate/Fetch Barcode
router.get('/barcode/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'png' } = req.query;

    const inventory = await db.Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Generate barcode image using bwip-js
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: inventory.barcode,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center'
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (error) {
    console.error('Error generating barcode:', error);
    res.status(500).json({ message: 'Failed to generate barcode', error: error.message });
  }
});

// GET Scan/Lookup by Barcode
router.get('/lookup/barcode/:barcode', authenticateToken, async (req, res) => {
  try {
    const { barcode } = req.params;

    const inventory = await db.Inventory.findOne({
      where: { barcode, is_active: true },
      include: [
        {
          model: db.SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'order_number', 'customer_id']
        }
      ]
    });

    if (!inventory) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ success: true, inventory });
  } catch (error) {
    console.error('Error looking up barcode:', error);
    res.status(500).json({ message: 'Failed to lookup barcode', error: error.message });
  }
});

// =================== PROJECT-WISE STOCK TRACKING ===================

// GET Project Materials by Sales Order ID
router.get('/projects/:salesOrderId/materials', authenticateToken, async (req, res) => {
  try {
    const { salesOrderId } = req.params;

    // Fetch sales order details
    const salesOrder = await db.SalesOrder.findByPk(salesOrderId, {
      include: [
        { model: db.Customer, as: 'customer', attributes: ['id', 'company_name', 'contact_person'] }
      ]
    });

    if (!salesOrder) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    // Fetch all materials for this project
    const materials = await db.Inventory.findAll({
      where: {
        sales_order_id: salesOrderId,
        is_active: true
      },
      order: [['updated_at', 'DESC']]
    });

    // Calculate summary
    const totalReceived = materials.reduce((sum, item) => sum + parseFloat(item.initial_quantity || 0), 0);
    const currentStock = materials.reduce((sum, item) => sum + parseFloat(item.current_stock || 0), 0);
    const sentToManufacturing = totalReceived - currentStock;

    // Fetch dispatch history
    const dispatches = await db.MaterialDispatch.findAll({
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest',
          where: { sales_order_id: salesOrderId },
          required: true
        }
      ],
      order: [['dispatched_at', 'DESC']]
    });

    res.json({
      success: true,
      project: {
        salesOrder,
        summary: {
          totalMaterials: materials.length,
          totalReceived,
          currentStock,
          sentToManufacturing,
          lastUpdated: materials.length > 0 ? materials[0].updated_at : null
        },
        materials,
        dispatches
      }
    });
  } catch (error) {
    console.error('Error fetching project materials:', error);
    res.status(500).json({ message: 'Failed to fetch project materials', error: error.message });
  }
});

// GET All Projects with Material Summary
router.get('/projects/all/summary', authenticateToken, async (req, res) => {
  try {
    const projects = await db.sequelize.query(`
      SELECT 
        so.id as sales_order_id,
        so.order_number,
        so.order_date,
        c.company_name as customer_name,
        COUNT(i.id) as material_count,
        SUM(i.initial_quantity) as total_received,
        SUM(i.current_stock) as current_stock,
        SUM(i.initial_quantity - i.current_stock) as sent_to_manufacturing,
        MAX(i.updated_at) as last_updated
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN inventory i ON i.sales_order_id = so.id AND i.is_active = 1
      WHERE i.id IS NOT NULL
      GROUP BY so.id, so.order_number, so.order_date, c.company_name
      ORDER BY so.order_date DESC
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching project summary:', error);
    res.status(500).json({ message: 'Failed to fetch project summary', error: error.message });
  }
});

// =================== SEND TO MANUFACTURING ===================

// POST Send materials to manufacturing
router.post('/send-to-manufacturing', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const {
      inventory_id,
      quantity,
      production_order_id,
      sales_order_id,
      notes,
      dispatched_by_name
    } = req.body;

    // Validate inventory item
    const inventory = await db.Inventory.findByPk(inventory_id, { transaction });
    if (!inventory) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const dispatchQty = parseFloat(quantity);
    if (dispatchQty <= 0 || dispatchQty > inventory.available_stock) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Invalid quantity. Must be positive and not exceed available stock.',
        available: inventory.available_stock
      });
    }

    // Permanently deduct from inventory
    const newStock = parseFloat(inventory.current_stock) - dispatchQty;
    const newAvailable = parseFloat(inventory.available_stock) - dispatchQty;
    const newConsumed = parseFloat(inventory.consumed_quantity || 0) + dispatchQty;

    await inventory.update({
      current_stock: newStock,
      available_stock: newAvailable,
      consumed_quantity: newConsumed,
      total_value: newStock * parseFloat(inventory.unit_cost || 0),
      last_issue_date: new Date(),
      movement_type: 'outward',
      last_movement_date: new Date(),
      updated_by: req.user.id
    }, { transaction });

    // Create movement record
    await db.InventoryMovement.create({
      inventory_id: inventory.id,
      movement_type: 'dispatch_to_manufacturing',
      quantity: -dispatchQty,
      previous_quantity: parseFloat(inventory.current_stock),
      new_quantity: newStock,
      unit_cost: inventory.unit_cost,
      total_cost: dispatchQty * parseFloat(inventory.unit_cost || 0),
      reference_type: 'production_order',
      reference_id: production_order_id,
      reference_number: `MFG-${Date.now()}`,
      notes: notes || 'Dispatched to manufacturing',
      location_from: inventory.location,
      location_to: 'Manufacturing Floor',
      performed_by: req.user.id,
      movement_date: new Date(),
      metadata: {
        sales_order_id,
        production_order_id,
        dispatched_by_name: dispatched_by_name || req.user.name
      }
    }, { transaction });

    // Send notification to manufacturing
    await db.Notification.create({
      type: 'material_dispatched',
      title: 'Materials Dispatched to Manufacturing',
      message: `${inventory.product_name} - Quantity: ${dispatchQty} ${inventory.unit_of_measurement}`,
      related_type: 'inventory',
      related_id: inventory.id,
      priority: 'high',
      metadata: {
        inventory_id,
        quantity: dispatchQty,
        product_name: inventory.product_name,
        sales_order_id,
        production_order_id
      }
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Materials dispatched to manufacturing successfully',
      inventory: {
        id: inventory.id,
        product_name: inventory.product_name,
        previous_stock: parseFloat(inventory.current_stock),
        dispatched_quantity: dispatchQty,
        remaining_stock: newStock
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error dispatching to manufacturing:', error);
    res.status(500).json({ message: 'Failed to dispatch materials', error: error.message });
  }
});

// =================== STOCK HISTORY ===================

// GET Stock movement history for an inventory item
router.get('/:id/history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const inventory = await db.Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const { count, rows } = await db.InventoryMovement.findAndCountAll({
      where: { inventory_id: id },
      include: [
        {
          model: db.User,
          as: 'performer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['movement_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      history: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Failed to fetch stock history', error: error.message });
  }
});

module.exports = router;