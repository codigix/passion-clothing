const express = require('express');
const { Inventory, Product, User, PurchaseOrder, Vendor, InventoryMovement, sequelize } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const router = express.Router();

// Get inventory stock
router.get('/stock', authenticateToken, checkDepartment(['inventory', 'admin', 'manufacturing', 'procurement']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      location,
      product_id,
      low_stock,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { is_active: true };

    if (location) where.location = location;
    if (product_id) where.product_id = product_id;
    if (low_stock === 'true') {
      where[require('sequelize').Op.and] = [
        require('sequelize').where(
          require('sequelize').col('current_stock'),
          require('sequelize').Op.lte,
          require('sequelize').col('reorder_level')
        )
      ];
    }

    const { count, rows } = await Inventory.findAndCountAll({
      where,
      include: [
        { 
          model: Product, 
          as: 'product',
          where: search ? {
            [require('sequelize').Op.or]: [
              { name: { [require('sequelize').Op.like]: `%${search}%` } },
              { product_code: { [require('sequelize').Op.like]: `%${search}%` } }
            ]
          } : undefined
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      inventory: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
});

// Create new stock row
router.post('/stock', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  try {
    const {
      product_id,
      location,
      batch_number,
      serial_number,
      current_stock = 0,
      reserved_stock = 0,
      unit_cost = 0,
      minimum_level = 0,
      maximum_level = 0,
      reorder_level = 0,
      notes
    } = req.body;

    if (!product_id || !location) {
      return res.status(400).json({ message: 'product_id and location are required' });
    }

    const payload = {
      product_id,
      location,
      batch_number,
      serial_number,
      current_stock,
      reserved_stock,
      available_stock: current_stock - reserved_stock,
      unit_cost,
      total_value: (current_stock || 0) * (unit_cost || 0),
      minimum_level,
      maximum_level,
      reorder_level,
      notes,
      movement_type: 'inward',
      last_movement_date: new Date(),
      created_by: req.user.id,
      updated_by: req.user.id
    };

    const created = await Inventory.create(payload);
    res.status(201).json({ message: 'Stock created successfully', stock: created });
  } catch (error) {
    console.error('Stock create error:', error);
    res.status(500).json({ message: 'Failed to create stock' });
  }
});

// Update stock
router.put('/stock/:id', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  try {
    const {
      current_stock,
      reserved_stock = 0,
      unit_cost,
      notes,
      adjustment_reason
    } = req.body;

    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const updateData = {
      updated_by: req.user.id,
      last_movement_date: new Date()
    };

    if (current_stock !== undefined) {
      updateData.current_stock = current_stock;
      updateData.available_stock = current_stock - reserved_stock;
      updateData.movement_type = current_stock > inventory.current_stock ? 'inward' : 'outward';
    }

    if (reserved_stock !== undefined) {
      updateData.reserved_stock = reserved_stock;
      updateData.available_stock = (current_stock || inventory.current_stock) - reserved_stock;
    }

    if (unit_cost !== undefined) {
      updateData.unit_cost = unit_cost;
      updateData.total_value = (current_stock || inventory.current_stock) * unit_cost;
    }

    if (notes) {
      updateData.notes = `${inventory.notes || ''}\n${new Date().toISOString()}: ${notes}${adjustment_reason ? ' (' + adjustment_reason + ')' : ''}`;
    }

    await inventory.update(updateData);

    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Stock update error:', error);
    res.status(500).json({ message: 'Failed to update stock' });
  }
});

// Get low stock alerts
router.get('/alerts/low-stock', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement']), async (req, res) => {
  try {
    // First, try a simple query without includes to test basic connectivity
    const inventoryCount = await Inventory.count({
      where: { is_active: true }
    });

    console.log(`Found ${inventoryCount} active inventory items`);

    if (inventoryCount === 0) {
      // No inventory data, return empty array
      return res.json({ lowStockItems: [] });
    }

    // Try to get inventory items without product association first
    const inventoryItems = await Inventory.findAll({
      where: {
        is_active: true,
        reorder_level: { [require('sequelize').Op.gt]: 0 }
      },
      limit: 10 // Limit for testing
    });

    console.log(`Found ${inventoryItems.length} inventory items with reorder levels`);

    // Filter for low stock items
    const lowStockItems = inventoryItems.filter(item => 
      item.current_stock <= item.reorder_level
    );

    console.log(`Found ${lowStockItems.length} low stock items`);

    res.json({ lowStockItems });
  } catch (error) {
    console.error('Low stock alerts error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch low stock alerts',
      error: error.message 
    });
  }
});

// Get inventory stats
router.get('/stats', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement', 'manufacturing']), async (req, res) => {
  try {
    const { Op } = require('sequelize');

    // Total items count
    const totalItems = await Inventory.count({
      where: { is_active: true }
    });

    // Low stock items (current_stock <= reorder_level)
    const lowStockItems = await Inventory.count({
      where: {
        is_active: true,
        [Op.and]: [
          require('sequelize').where(
            require('sequelize').col('current_stock'),
            Op.lte,
            require('sequelize').col('reorder_level')
          )
        ]
      }
    });

    // Out of stock items (current_stock = 0)
    const outOfStock = await Inventory.count({
      where: {
        is_active: true,
        current_stock: 0
      }
    });

    // Total value
    const totalValueResult = await Inventory.sum('total_value', {
      where: { is_active: true }
    });

    res.json({
      totalItems,
      lowStockItems,
      outOfStock,
      totalValue: totalValueResult || 0
    });
  } catch (error) {
    console.error('Inventory stats error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory stats' });
  }
});

// Get recent inventory movements
router.get('/movements/recent', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement', 'manufacturing']), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Check if Inventory table has any data
    const inventoryCount = await Inventory.count({ where: { is_active: true } });
    
    if (inventoryCount === 0) {
      // Return empty array if no inventory data
      return res.json({ movements: [] });
    }

    const movements = await Inventory.findAll({
      where: {
        is_active: true,
        last_movement_date: { [require('sequelize').Op.ne]: null }
      },
      include: [{ 
        model: Product, 
        as: 'product',
        required: false // LEFT JOIN instead of INNER JOIN
      }],
      order: [['last_movement_date', 'DESC']],
      limit: parseInt(limit)
    });

    const formattedMovements = movements.map(movement => ({
      id: movement.id,
      itemCode: movement.product?.product_code || 'N/A',
      itemName: movement.product?.name || 'Unknown Product',
      type: movement.movement_type || 'inward',
      quantity: movement.current_stock || 0,
      unit: movement.product?.unit_of_measurement || 'units',
      date: movement.last_movement_date,
      location: movement.location || 'N/A'
    }));

    res.json({ movements: formattedMovements });
  } catch (error) {
    console.error('Recent movements error:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch recent movements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get inventory categories summary
router.get('/categories', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement', 'manufacturing']), async (req, res) => {
  try {
    // Check if Inventory table has any data
    const inventoryCount = await Inventory.count({ where: { is_active: true } });
    
    if (inventoryCount === 0) {
      // Return empty array if no inventory data
      return res.json({ categories: [] });
    }

    const categories = await Inventory.findAll({
      where: { is_active: true },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('Inventory.id')), 'itemCount'],
        [require('sequelize').fn('SUM', require('sequelize').col('current_stock')), 'totalStock'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_value')), 'totalValue']
      ],
      include: [{
        model: Product,
        as: 'product',
        attributes: ['category'],
        where: { category: { [require('sequelize').Op.ne]: null } },
        required: false
      }],
      group: ['product.category'],
      raw: true
    });

    const formattedCategories = categories.map(cat => ({
      category: cat['product.category'] || 'Uncategorized',
      itemCount: parseInt(cat.itemCount),
      totalStock: parseInt(cat.totalStock || 0),
      totalValue: parseFloat(cat.totalValue || 0)
    }));

    res.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Categories error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Soft delete inventory item
router.delete('/:id', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    await inventory.update({ is_active: false });
    res.json({ message: 'Inventory item deactivated successfully' });
  } catch (error) {
    console.error('Inventory delete error:', error);
    res.status(500).json({ message: 'Failed to delete inventory item' });
  }
});

// Bulk update inventory
router.post('/bulk-update', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: 'Updates must be an array' });
    }

    const results = [];
    for (const update of updates) {
      const { id, ...updateData } = update;
      const inventory = await Inventory.findByPk(id);
      if (inventory) {
        await inventory.update(updateData);
        results.push({ id, success: true });
      } else {
        results.push({ id, success: false, error: 'Not found' });
      }
    }

    res.json({ message: 'Bulk update completed', results });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ message: 'Failed to perform bulk update' });
  }
});

// Get inventory dashboard stats
router.get('/dashboard/stats', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement', 'manufacturing']), async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const totalStock = await Inventory.sum('current_stock', { where: { is_active: true } });
    const lowStockCount = await Inventory.count({
      where: {
        is_active: true,
        [require('sequelize').Op.and]: [
          require('sequelize').where(
            require('sequelize').col('current_stock'),
            require('sequelize').Op.lte,
            require('sequelize').col('reorder_level')
          )
        ]
      }
    });
    const lastUpdated = await Inventory.max('updated_at');
    res.json({ totalProducts, totalStock, lowStockCount, lastUpdated });
  } catch (error) {
    console.error('Inventory dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory statistics' });
  }
});

// Get incoming orders ready for inventory (approved POs not yet added to inventory)
router.get('/orders/incoming', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement']), async (req, res) => {
  try {
    const { status } = req.query;
    const { Op } = require('sequelize');
    
    // Fetch POs that are ready for inventory (approved, sent, acknowledged)
    // Exclude: draft, pending_approval, rejected, cancelled, received, partially_received
    const where = {
      status: {
        [Op.in]: ['approved', 'sent', 'acknowledged']
      }
    };

    // If specific status requested, use that instead
    if (status && status !== 'ready_for_inventory') {
      where.status = status;
    }

    const orders = await PurchaseOrder.findAll({
      where,
      include: [
        { 
          model: Vendor, 
          as: 'vendor',
          attributes: ['id', 'name', 'contact_person', 'email', 'phone']
        }
      ],
      order: [['po_date', 'DESC']],
      limit: 50
    });

    res.json({ 
      orders: orders.map(po => ({
        id: po.id,
        order_number: po.po_number,
        vendor: po.vendor ? po.vendor.name : 'N/A',
        vendor_id: po.vendor ? po.vendor.id : null,
        po_date: po.po_date,
        expected_delivery_date: po.expected_delivery_date,
        total_amount: po.final_amount,
        items_count: (po.items || []).length,
        status: po.status,
        priority: po.priority,
        project_name: po.project_name,
        customer_id: po.customer_id,
        items: po.items || []
      }))
    });
  } catch (error) {
    console.error('Incoming orders error:', error);
    res.status(500).json({ message: 'Failed to fetch incoming orders' });
  }
});

// Get inventory items from specific Purchase Order
router.get('/from-po/:poId', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement', 'manufacturing']), async (req, res) => {
  try {
    const { poId } = req.params;

    const inventoryItems = await Inventory.findAll({
      where: { 
        purchase_order_id: poId,
        is_active: true 
      },
      include: [
        { model: Product, as: 'product' },
        { 
          model: PurchaseOrder, 
          as: 'purchaseOrder',
          include: [{ model: Vendor, as: 'vendor' }]
        }
      ],
      order: [['po_item_index', 'ASC']]
    });

    // Calculate summary
    const summary = {
      total_items: inventoryItems.length,
      total_initial_quantity: inventoryItems.reduce((sum, item) => sum + parseFloat(item.initial_quantity || 0), 0),
      total_current_quantity: inventoryItems.reduce((sum, item) => sum + parseFloat(item.current_stock || 0), 0),
      total_consumed: inventoryItems.reduce((sum, item) => sum + parseFloat(item.consumed_quantity || 0), 0),
      total_value: inventoryItems.reduce((sum, item) => sum + parseFloat(item.total_value || 0), 0)
    };

    res.json({
      inventory: inventoryItems,
      summary
    });
  } catch (error) {
    console.error('Error fetching PO inventory:', error);
    res.status(500).json({ message: 'Failed to fetch inventory from PO' });
  }
});

// Get inventory item with movements history
router.get('/item/:id/details', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement', 'manufacturing']), async (req, res) => {
  try {
    const { id } = req.params;

    const inventoryItem = await Inventory.findByPk(id, {
      include: [
        { model: Product, as: 'product' },
        { 
          model: PurchaseOrder, 
          as: 'purchaseOrder',
          include: [{ model: Vendor, as: 'vendor' }]
        },
        {
          model: InventoryMovement,
          as: 'movements',
          include: [{ model: User, as: 'performer' }],
          order: [['movement_date', 'DESC']]
        }
      ]
    });

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Calculate usage percentage
    const initialQty = parseFloat(inventoryItem.initial_quantity) || 0;
    const consumedQty = parseFloat(inventoryItem.consumed_quantity) || 0;
    const usagePercentage = initialQty > 0 ? (consumedQty / initialQty) * 100 : 0;

    res.json({
      inventory: inventoryItem,
      usage: {
        initial: initialQty,
        consumed: consumedQty,
        remaining: parseFloat(inventoryItem.current_stock) || 0,
        percentage_used: usagePercentage.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory details:', error);
    res.status(500).json({ message: 'Failed to fetch inventory details' });
  }
});

// Consume/Use inventory (reduce stock)
router.post('/item/:id/consume', authenticateToken, checkDepartment(['inventory', 'admin', 'manufacturing']), async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { quantity, notes, sales_order_id, production_order_id } = req.body;

    if (!quantity || parseFloat(quantity) <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const inventoryItem = await Inventory.findByPk(id, { transaction });
    
    if (!inventoryItem) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const consumeQty = parseFloat(quantity);
    const currentStock = parseFloat(inventoryItem.current_stock) || 0;

    if (consumeQty > currentStock) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${currentStock}, Requested: ${consumeQty}` 
      });
    }

    const newStock = currentStock - consumeQty;
    const newConsumed = (parseFloat(inventoryItem.consumed_quantity) || 0) + consumeQty;

    // Update inventory
    await inventoryItem.update({
      current_stock: newStock,
      consumed_quantity: newConsumed,
      available_stock: newStock - (parseFloat(inventoryItem.reserved_stock) || 0),
      total_value: newStock * (parseFloat(inventoryItem.unit_cost) || 0),
      last_issue_date: new Date(),
      movement_type: 'outward',
      last_movement_date: new Date(),
      updated_by: req.user.id
    }, { transaction });

    // Create movement record
    await InventoryMovement.create({
      inventory_id: inventoryItem.id,
      purchase_order_id: inventoryItem.purchase_order_id,
      sales_order_id: sales_order_id || null,
      production_order_id: production_order_id || null,
      movement_type: 'consume',
      quantity: -consumeQty, // Negative for consumption
      previous_quantity: currentStock,
      new_quantity: newStock,
      unit_cost: parseFloat(inventoryItem.unit_cost) || 0,
      total_cost: consumeQty * (parseFloat(inventoryItem.unit_cost) || 0),
      notes: notes || 'Stock consumed',
      location_from: inventoryItem.location,
      performed_by: req.user.id,
      movement_date: new Date(),
      metadata: {
        barcode: inventoryItem.barcode,
        batch_number: inventoryItem.batch_number
      }
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Stock consumed successfully',
      data: {
        previous_stock: currentStock,
        consumed: consumeQty,
        new_stock: newStock,
        total_consumed: newConsumed,
        remaining_percentage: ((newStock / (parseFloat(inventoryItem.initial_quantity) || 1)) * 100).toFixed(2)
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error consuming stock:', error);
    res.status(500).json({ message: 'Failed to consume stock', error: error.message });
  }
});

// Get all inventory with PO tracking
router.get('/with-po-tracking', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement']), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Inventory.findAndCountAll({
      where: { 
        is_active: true,
        purchase_order_id: { [require('sequelize').Op.ne]: null }
      },
      include: [
        { model: Product, as: 'product' },
        { 
          model: PurchaseOrder, 
          as: 'purchaseOrder',
          include: [{ model: Vendor, as: 'vendor' }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      inventory: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching PO-tracked inventory:', error);
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
});

module.exports = router;