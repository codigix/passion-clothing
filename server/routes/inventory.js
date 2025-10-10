const express = require('express');
const { Inventory, Product, User, PurchaseOrder, Vendor, InventoryMovement, Approval, Notification, SalesOrder, sequelize } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const { parseBarcode, generateBarcode, generateInventoryQRData } = require('../utils/barcodeUtils');
const router = express.Router();
const { Op } = require('sequelize');

// =================== DASHBOARD ENDPOINTS ===================

// Get inventory statistics
router.get('/stats', authenticateToken, checkDepartment(['inventory', 'admin', 'manufacturing', 'procurement']), async (req, res) => {
  try {
    const [statsResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT id) as totalItems,
        SUM(current_stock) as totalQuantity,
        SUM(total_value) as totalValue,
        COUNT(CASE WHEN current_stock <= reorder_level AND current_stock > 0 THEN 1 END) as lowStockItems,
        COUNT(CASE WHEN current_stock = 0 THEN 1 END) as outOfStock,
        SUM(CASE WHEN stock_type = 'general_extra' THEN current_stock ELSE 0 END) as factoryStock,
        SUM(CASE WHEN stock_type = 'project_specific' THEN current_stock ELSE 0 END) as projectStock
      FROM inventory
      WHERE is_active = 1 AND purchase_order_id IS NOT NULL
    `);

    const stats = {
      totalItems: parseInt(statsResult[0].totalItems) || 0,
      totalQuantity: parseFloat(statsResult[0].totalQuantity) || 0,
      totalValue: parseFloat(statsResult[0].totalValue) || 0,
      lowStockItems: parseInt(statsResult[0].lowStockItems) || 0,
      outOfStock: parseInt(statsResult[0].outOfStock) || 0,
      factoryStock: parseFloat(statsResult[0].factoryStock) || 0,
      projectStock: parseFloat(statsResult[0].projectStock) || 0
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
});

// Get projects summary
router.get('/projects-summary', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement']), async (req, res) => {
  try {
    const projects = await Inventory.findAll({
      attributes: [
        'sales_order_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'material_count'],
        [sequelize.fn('SUM', sequelize.col('current_stock')), 'current_stock'],
        [sequelize.fn('SUM', sequelize.col('consumed_quantity')), 'sent_to_manufacturing'],
        [sequelize.fn('SUM', sequelize.col('total_value')), 'totalValue']
      ],
      where: {
        stock_type: 'project_specific',
        is_active: true,
        sales_order_id: { [Op.not]: null },
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      },
      group: ['sales_order_id'],
      raw: true
    });

    // Fetch sales order details
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        try {
          const salesOrder = await SalesOrder.findByPk(project.sales_order_id, {
            attributes: ['id', 'order_number', 'customer_name', 'project_name', 'status', 'order_date', 'created_at']
          });
          
          return {
            sales_order_id: project.sales_order_id,
            order_number: salesOrder?.order_number || `SO-${project.sales_order_id}`,
            customer_name: salesOrder?.customer_name || 'Unknown',
            project_name: salesOrder?.project_name || 'Unnamed Project',
            status: salesOrder?.status || 'active',
            order_date: salesOrder?.order_date || salesOrder?.created_at || new Date(),
            material_count: parseInt(project.material_count) || 0,
            current_stock: parseFloat(project.current_stock) || 0,
            sent_to_manufacturing: parseFloat(project.sent_to_manufacturing) || 0,
            totalValue: parseFloat(project.totalValue) || 0
          };
        } catch (err) {
          console.error('Error fetching SO details:', err);
          return {
            sales_order_id: project.sales_order_id,
            order_number: `SO-${project.sales_order_id}`,
            customer_name: 'Unknown',
            project_name: 'Unnamed Project',
            status: 'active',
            order_date: new Date(),
            material_count: parseInt(project.material_count) || 0,
            current_stock: parseFloat(project.current_stock) || 0,
            sent_to_manufacturing: parseFloat(project.sent_to_manufacturing) || 0,
            totalValue: parseFloat(project.totalValue) || 0
          };
        }
      })
    );

    res.json({ success: true, projects: projectsWithDetails });
  } catch (error) {
    console.error('Projects summary error:', error);
    res.status(500).json({ message: 'Failed to fetch projects summary', error: error.message });
  }
});

// Lookup inventory by barcode
router.get('/lookup/barcode/:barcode', authenticateToken, checkDepartment(['inventory', 'admin', 'manufacturing', 'procurement']), async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const inventory = await Inventory.findOne({
      where: { 
        barcode,
        is_active: true
      }
    });

    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, inventory });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    res.status(500).json({ message: 'Failed to lookup barcode', error: error.message });
  }
});

// Send to manufacturing
router.post('/send-to-manufacturing', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { inventory_id, quantity, sales_order_id, notes } = req.body;

    if (!inventory_id || !quantity || parseFloat(quantity) <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid inventory_id or quantity' });
    }

    const inventory = await Inventory.findByPk(inventory_id, { transaction });
    if (!inventory) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const dispatchQty = parseFloat(quantity);
    if (dispatchQty > inventory.available_stock) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${inventory.available_stock}`
      });
    }

    // Deduct stock permanently
    const newStock = parseFloat(inventory.current_stock) - dispatchQty;
    const newAvailable = parseFloat(inventory.available_stock) - dispatchQty;

    await inventory.update({
      current_stock: newStock,
      available_stock: newAvailable,
      consumed_quantity: parseFloat(inventory.consumed_quantity || 0) + dispatchQty,
      total_value: newStock * parseFloat(inventory.unit_cost || 0),
      last_movement_date: new Date(),
      movement_type: 'outward',
      updated_by: req.user.id
    }, { transaction });

    // Create movement record
    const movement = await InventoryMovement.create({
      inventory_id: inventory.id,
      product_id: inventory.product_id,
      movement_type: 'outward',
      quantity: -dispatchQty,
      previous_quantity: parseFloat(inventory.current_stock),
      new_quantity: newStock,
      unit_cost: parseFloat(inventory.unit_cost || 0),
      total_cost: dispatchQty * parseFloat(inventory.unit_cost || 0),
      reference_number: `MFG-DISPATCH-${Date.now()}`,
      notes: `Dispatched to manufacturing${notes ? `: ${notes}` : ''}`,
      location_from: inventory.location,
      location_to: 'Manufacturing',
      performed_by: req.user.id,
      movement_date: new Date(),
      metadata: {
        sales_order_id,
        dispatch_type: 'manufacturing',
        notes
      }
    }, { transaction });

    // Create notification for manufacturing
    try {
      await Notification.create({
        user_id: null,
        department: 'manufacturing',
        type: 'material_dispatched',
        title: 'Materials Dispatched',
        message: `${inventory.product_name || 'Material'} - Quantity: ${dispatchQty} ${inventory.unit_of_measurement || 'units'}`,
        related_type: 'inventory',
        related_id: inventory.id,
        priority: 'high',
        metadata: {
          inventory_id,
          quantity: dispatchQty,
          product_name: inventory.product_name,
          sales_order_id,
          movement_id: movement.id
        }
      }, { transaction });
    } catch (notifError) {
      console.warn('Failed to create notification:', notifError.message);
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Materials dispatched to manufacturing successfully',
      dispatch: {
        id: movement.id,
        inventory_id: inventory.id,
        product_name: inventory.product_name,
        previous_stock: parseFloat(inventory.current_stock),
        dispatched_quantity: dispatchQty,
        remaining_stock: newStock,
        unit_of_measurement: inventory.unit_of_measurement,
        dispatched_at: movement.movement_date
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Send to manufacturing error:', error);
    res.status(500).json({ message: 'Failed to dispatch materials', error: error.message });
  }
});

// Base route - Get inventory with optional filtering
router.get('/', authenticateToken, checkDepartment(['inventory', 'admin', 'manufacturing', 'procurement']), async (req, res) => {
  try {
    const {
      limit = 50,
      stock_type,
      location,
      project_id,
      search
    } = req.query;

    const { Op } = require('sequelize');
    const where = { 
      is_active: true,
      purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
    };

    if (stock_type) where.stock_type = stock_type;
    if (location) where.location = location;
    if (project_id) where.project_id = project_id;
    
    if (search) {
      where[Op.or] = [
        { product_name: { [Op.like]: `%${search}%` } },
        { product_code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const inventory = await Inventory.findAll({
      where,
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ inventory });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory', error: error.message });
  }
});

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
    const where = { 
      is_active: true,
      purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
    };

    if (location) where.location = location;
    if (product_id) where.product_id = product_id;
    if (low_stock === 'true') {
      where[Op.and] = [
        sequelize.where(
          sequelize.col('current_stock'),
          Op.lte,
          sequelize.col('reorder_level')
        )
      ];
    }
    
    if (search) {
      where[Op.or] = [
        { product_name: { [Op.like]: `%${search}%` } },
        { product_code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Inventory.findAndCountAll({
      where,
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
    res.status(500).json({ message: 'Failed to fetch inventory', error: error.message });
  }
});

// =================== UNIFIED INVENTORY MANAGEMENT ===================

// Create product and stock together (for manual additions)
router.post('/add-product-stock', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      // Product details
      product_code,
      name,
      category,
      product_type,
      unit_of_measurement,
      description,
      hsn_code,
      brand,
      color,
      specifications,

      // Stock details
      location = 'Main Warehouse',
      current_stock,
      unit_cost = 0,
      batch_number,
      serial_number,
      expiry_date,
      manufacturing_date,
      quality_status = 'approved',
      condition = 'new',
      notes,

      // Project and stock type
      project_id,
      stock_type = 'general_extra',
      project_name // For display purposes
    } = req.body;

    // Validate required fields
    if (!product_code || !name || !category || !product_type || !unit_of_measurement) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Product code, name, category, product type, and unit of measurement are required'
      });
    }

    if (!current_stock || parseFloat(current_stock) <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Valid stock quantity is required' });
    }

    // Check if product already exists
    let product = await Product.findOne({
      where: { product_code },
      transaction
    });

    if (!product) {
      // Create new product
      product = await Product.create({
        product_code,
        name,
        category,
        product_type,
        unit_of_measurement,
        description,
        hsn_code,
        brand,
        color,
        specifications,
        cost_price: unit_cost,
        selling_price: unit_cost * 1.2, // 20% markup
        minimum_stock_level: 10,
        reorder_level: 20,
        status: 'active',
        is_batch_tracked: !!batch_number,
        created_by: req.user.id
      }, { transaction });

      // Generate product barcode if not provided
      if (!product.barcode) {
        let barcode;
        let attempts = 0;
        do {
          barcode = `PRD${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
          attempts++;
        } while (attempts < 10 && await Product.findOne({ where: { barcode }, transaction }));

        await product.update({ barcode }, { transaction });
      }
    }

    // Generate inventory barcode
    const inventoryBarcode = generateBarcode('INV');

    // Create inventory entry
    const inventoryData = {
      product_id: product.id,
      location,
      batch_number,
      serial_number,
      current_stock: parseFloat(current_stock),
      initial_quantity: parseFloat(current_stock),
      available_stock: parseFloat(current_stock),
      unit_cost: parseFloat(unit_cost),
      total_value: parseFloat(current_stock) * parseFloat(unit_cost),
      expiry_date,
      manufacturing_date,
      quality_status,
      condition,
      notes: `${notes || ''}\nProject: ${project_name || 'General Stock'}\nStock Type: ${stock_type}`.trim(),
      barcode: inventoryBarcode,
      qr_code: generateInventoryQRData({
        barcode: inventoryBarcode,
        product_id: product.id,
        location,
        current_stock,
        batch_number
      }),
      movement_type: 'inward',
      last_movement_date: new Date(),
      project_id,
      stock_type,
      created_by: req.user.id,
      updated_by: req.user.id
    };

    const inventory = await Inventory.create(inventoryData, { transaction });

    // Create movement record
    await InventoryMovement.create({
      inventory_id: inventory.id,
      product_id: product.id,
      movement_type: 'inward',
      quantity: parseFloat(current_stock),
      previous_quantity: 0,
      new_quantity: parseFloat(current_stock),
      unit_cost: parseFloat(unit_cost),
      total_cost: parseFloat(current_stock) * parseFloat(unit_cost),
      reference_number: inventoryBarcode,
      notes: `Manual stock addition - ${stock_type} stock${project_name ? ` for project: ${project_name}` : ''}`,
      location_from: 'Manual Entry',
      location_to: location,
      performed_by: req.user.id,
      movement_date: new Date(),
      metadata: {
        barcode: inventoryBarcode,
        stock_type,
        project_id,
        project_name,
        added_by: req.user.name
      }
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: 'Product and stock added successfully',
      product,
      inventory: {
        ...inventory.toJSON(),
        stock_type_label: stock_type === 'project_specific' ? 'Project Specific' :
                         stock_type === 'general_extra' ? 'General/Extra Stock' :
                         stock_type === 'consignment' ? 'Consignment' : 'Returned'
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Add product-stock error:', error);
    res.status(500).json({ message: 'Failed to add product and stock', error: error.message });
  }
});

// Get inventory by stock type and project
router.get('/stock-by-type', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement', 'manufacturing']), async (req, res) => {
  try {
    const {
      stock_type,
      project_id,
      product_id,
      location,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { 
      is_active: true,
      purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
    };

    if (stock_type) where.stock_type = stock_type;
    if (project_id) where.project_id = project_id;
    if (product_id) where.product_id = product_id;
    if (location) where.location = location;

    const { count, rows } = await Inventory.findAndCountAll({
      where,
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Add stock type labels
    const inventoryWithLabels = rows.map(item => ({
      ...item.toJSON(),
      stock_type_label: item.stock_type === 'project_specific' ? 'Project Specific' :
                       item.stock_type === 'general_extra' ? 'General/Extra Stock' :
                       item.stock_type === 'consignment' ? 'Consignment' : 'Returned'
    }));

    res.json({
      inventory: inventoryWithLabels,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Stock by type error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory by type', error: error.message });
  }
});

// Transfer stock between projects or change stock type
router.post('/transfer-stock/:id', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      new_stock_type,
      new_project_id,
      quantity,
      reason,
      notes
    } = req.body;

    const inventory = await Inventory.findByPk(id, { transaction });
    if (!inventory) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const transferQty = parseFloat(quantity);
    if (transferQty <= 0 || transferQty > inventory.available_stock) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid transfer quantity' });
    }

    // Create new inventory entry for transferred stock
    const newInventoryData = {
      product_id: inventory.product_id,
      location: inventory.location,
      batch_number: inventory.batch_number,
      serial_number: inventory.serial_number,
      current_stock: transferQty,
      initial_quantity: transferQty,
      available_stock: transferQty,
      unit_cost: inventory.unit_cost,
      total_value: transferQty * inventory.unit_cost,
      expiry_date: inventory.expiry_date,
      manufacturing_date: inventory.manufacturing_date,
      quality_status: inventory.quality_status,
      condition: inventory.condition,
      notes: `${inventory.notes}\nTransferred: ${reason}`,
      barcode: generateBarcode('INV'),
      qr_code: inventory.qr_code, // Keep same QR for traceability
      movement_type: 'transfer',
      last_movement_date: new Date(),
      project_id: new_project_id || inventory.project_id,
      stock_type: new_stock_type,
      created_by: req.user.id,
      updated_by: req.user.id
    };

    const newInventory = await Inventory.create(newInventoryData, { transaction });

    // Update original inventory
    const remainingStock = inventory.current_stock - transferQty;
    await inventory.update({
      current_stock: remainingStock,
      available_stock: remainingStock - (inventory.reserved_stock || 0),
      total_value: remainingStock * inventory.unit_cost,
      updated_by: req.user.id
    }, { transaction });

    // Create movement records
    await InventoryMovement.create({
      inventory_id: inventory.id,
      product_id: inventory.product_id,
      movement_type: 'transfer_out',
      quantity: -transferQty,
      previous_quantity: inventory.current_stock + transferQty,
      new_quantity: remainingStock,
      unit_cost: inventory.unit_cost,
      total_cost: transferQty * inventory.unit_cost,
      reference_number: inventory.barcode,
      notes: `Stock transferred out: ${reason}${notes ? ` - ${notes}` : ''}`,
      location_from: inventory.location,
      location_to: inventory.location,
      performed_by: req.user.id,
      movement_date: new Date(),
      metadata: {
        transfer_type: 'stock_type_change',
        new_stock_type,
        new_project_id,
        reason
      }
    }, { transaction });

    await InventoryMovement.create({
      inventory_id: newInventory.id,
      product_id: inventory.product_id,
      movement_type: 'transfer_in',
      quantity: transferQty,
      previous_quantity: 0,
      new_quantity: transferQty,
      unit_cost: inventory.unit_cost,
      total_cost: transferQty * inventory.unit_cost,
      reference_number: newInventory.barcode,
      notes: `Stock transferred in: ${reason}${notes ? ` - ${notes}` : ''}`,
      location_from: inventory.location,
      location_to: inventory.location,
      performed_by: req.user.id,
      movement_date: new Date(),
      metadata: {
        transfer_type: 'stock_type_change',
        old_stock_type: inventory.stock_type,
        old_project_id: inventory.project_id,
        reason
      }
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'Stock transferred successfully',
      original_inventory: inventory,
      new_inventory: newInventory,
      transferred_quantity: transferQty
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Transfer stock error:', error);
    res.status(500).json({ message: 'Failed to transfer stock', error: error.message });
  }
});

// =================== LEGACY ENDPOINTS (Keep for compatibility) ===================

// Create new stock row (legacy - use /add-product-stock instead)
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

    // Generate unique barcode and QR code
    const barcode = generateBarcode('INV');
    const qrData = generateInventoryQRData({
      barcode,
      product_id,
      location,
      current_stock,
      batch_number
    });

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
      barcode: barcode,
      qr_code: qrData,
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
      where: { 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      }
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
      where: { 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      }
    });

    // Low stock items (current_stock <= reorder_level)
    const lowStockItems = await Inventory.count({
      where: {
        is_active: true,
        purchase_order_id: { [Op.not]: null },  // Only GRN-verified items
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
        purchase_order_id: { [Op.not]: null },  // Only GRN-verified items
        current_stock: 0
      }
    });

    // Total value
    const totalValueResult = await Inventory.sum('total_value', {
      where: { 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      }
    });

    // Total quantity
    const totalQuantityResult = await Inventory.sum('current_stock', {
      where: { 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      }
    });

    // Stock type breakdown
    const stockTypeStats = await Inventory.findAll({
      where: { 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      },
      attributes: [
        'stock_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('Inventory.id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('current_stock')), 'total_stock'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_value')), 'total_value']
      ],
      group: ['stock_type'],
      raw: true
    });

    // Format stock type stats
    const stockTypeBreakdown = {};
    let factoryStock = 0;
    let projectStock = 0;
    
    stockTypeStats.forEach(stat => {
      const type = stat.stock_type;
      const totalStock = parseFloat(stat.total_stock || 0);
      
      stockTypeBreakdown[type] = {
        count: parseInt(stat.count),
        total_stock: totalStock,
        total_value: parseFloat(stat.total_value || 0),
        label: type === 'project_specific' ? 'Project Specific' :
               type === 'general_extra' ? 'General/Extra Stock' :
               type === 'consignment' ? 'Consignment' : 'Returned'
      };
      
      // Calculate factory and project stock counts
      if (type === 'general_extra') {
        factoryStock += totalStock;
      } else if (type === 'project_specific') {
        projectStock += totalStock;
      }
    });

    res.json({
      stats: {
        totalItems,
        totalQuantity: totalQuantityResult || 0,
        totalValue: totalValueResult || 0,
        lowStockItems,
        outOfStock,
        factoryStock,
        projectStock,
        stockTypeBreakdown
      }
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
    const inventoryCount = await Inventory.count({ 
      where: { 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      } 
    });
    
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
    const inventoryCount = await Inventory.count({ 
      where: { 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      } 
    });
    
    if (inventoryCount === 0) {
      // Return empty array if no inventory data
      return res.json({ categories: [] });
    }

    const categories = await Inventory.findAll({
      where: { 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      },
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
    const totalStock = await Inventory.sum('current_stock', { 
      where: { 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      } 
    });
    const lowStockCount = await Inventory.count({
      where: {
        is_active: true,
        purchase_order_id: { [Op.not]: null },  // Only GRN-verified items
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

// =================== GRN REQUEST MANAGEMENT ===================

// Get all GRN creation requests (pending approvals)
router.get('/grn-requests', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: approvals } = await Approval.findAndCountAll({
      where: {
        entity_type: 'grn_creation',
        status: 'pending'
      },
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    // Get PO details for each approval
    const requests = [];
    for (const approval of approvals) {
      const po = await PurchaseOrder.findByPk(approval.entity_id, {
        include: [
          { model: Vendor, as: 'vendor' },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ]
      });

      requests.push({
        id: approval.id,
        po_id: approval.entity_id,
        po_number: po?.po_number,
        vendor_name: po?.vendor?.name,
        po_date: po?.po_date,
        expected_delivery_date: po?.expected_delivery_date,
        total_amount: po?.final_amount,
        items_count: (po?.items || []).length,
        requested_by: po?.creator?.name,
        requested_date: approval.created_at,
        status: approval.status,
        stage_label: approval.stage_label,
        assigned_to: approval.assignedUser?.name
      });
    }

    res.json({
      requests,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching GRN requests:', error);
    res.status(500).json({ message: 'Failed to fetch GRN requests', error: error.message });
  }
});

// Get specific GRN request details
router.get('/grn-requests/:id', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  try {
    const approval = await Approval.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!approval || approval.entity_type !== 'grn_creation') {
      return res.status(404).json({ message: 'GRN request not found' });
    }

    // Get PO details
    const po = await PurchaseOrder.findByPk(approval.entity_id, {
      include: [
        { model: Vendor, as: 'vendor' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'], required: false }
      ]
    });

    res.json({
      id: approval.id,
      po_id: approval.entity_id,
      po_number: po?.po_number,
      vendor: po?.vendor,
      po_date: po?.po_date,
      expected_delivery_date: po?.expected_delivery_date,
      items: po?.items || [],
      total_amount: po?.final_amount,
      project_name: po?.project_name,
      requested_by: po?.creator?.name,
      requested_date: approval.created_at,
      status: approval.status,
      stage_label: approval.stage_label,
      assigned_to: approval.assignedUser?.name,
      remarks: po?.internal_notes
    });
  } catch (error) {
    console.error('Error fetching GRN request:', error);
    res.status(500).json({ message: 'Failed to fetch GRN request', error: error.message });
  }
});

// Approve GRN creation request
router.post('/grn-requests/:id/approve', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { remarks } = req.body;

    const approval = await Approval.findByPk(req.params.id, { transaction });

    if (!approval || approval.entity_type !== 'grn_creation') {
      await transaction.rollback();
      return res.status(404).json({ message: 'GRN request not found' });
    }

    if (approval.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: 'GRN request is not pending' });
    }

    // Get PO
    const po = await PurchaseOrder.findByPk(approval.entity_id, { transaction });

    // Update approval status
    await approval.update({
      status: 'approved',
      reviewer_id: req.user.id,
      decided_at: new Date(),
      decision_note: remarks || ''
    }, { transaction });

    // Update PO status to allow GRN creation
    await po.update({
      status: 'grn_approved',
      internal_notes: `${po.internal_notes || ''}\n\nGRN creation approved by ${req.user.name} on ${new Date().toISOString()}`
    }, { transaction });

    // Create notification for procurement team
    await Notification.create({
      user_id: null, // Send to procurement department
      type: 'grn_approved',
      title: `GRN Creation Approved: PO ${po.po_number}`,
      message: `Inventory team has approved GRN creation for Purchase Order ${po.po_number}. You can now proceed with material receipt.`,
      data: { po_id: approval.entity_id, approval_id: approval.id },
      read: false
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'GRN creation request approved successfully',
      approval: {
        id: approval.id,
        status: 'approved',
        approved_by: req.user.name,
        approved_at: new Date()
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error approving GRN request:', error);
    res.status(500).json({ message: 'Failed to approve GRN request', error: error.message });
  }
});

// Reject GRN creation request
router.post('/grn-requests/:id/reject', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { reason } = req.body;

    if (!reason) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const approval = await Approval.findByPk(req.params.id, { transaction });

    if (!approval || approval.entity_type !== 'grn_creation') {
      await transaction.rollback();
      return res.status(404).json({ message: 'GRN request not found' });
    }

    if (approval.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: 'GRN request is not pending' });
    }

    // Get PO
    const po = await PurchaseOrder.findByPk(approval.entity_id, { transaction });

    // Update approval status
    await approval.update({
      status: 'rejected',
      reviewer_id: req.user.id,
      decided_at: new Date(),
      decision_note: reason
    }, { transaction });

    // Update PO status back
    await po.update({
      status: 'sent', // Back to sent status
      internal_notes: `${po.internal_notes || ''}\n\nGRN creation rejected by ${req.user.name} on ${new Date().toISOString()}. Reason: ${reason}`
    }, { transaction });

    // Create notification for procurement team
    await Notification.create({
      user_id: null, // Send to procurement department
      type: 'grn_rejected',
      title: `GRN Creation Rejected: PO ${po.po_number}`,
      message: `Inventory team has rejected GRN creation for Purchase Order ${po.po_number}. Reason: ${reason}`,
      data: { po_id: approval.entity_id, approval_id: approval.id },
      read: false
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'GRN creation request rejected',
      approval: {
        id: approval.id,
        status: 'rejected',
        rejected_by: req.user.name,
        rejected_at: new Date(),
        rejection_reason: reason
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error rejecting GRN request:', error);
    res.status(500).json({ message: 'Failed to reject GRN request', error: error.message });
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

// Get inventory item by barcode
router.get('/barcode/:barcode', authenticateToken, checkDepartment(['inventory', 'admin', 'manufacturing', 'procurement']), async (req, res) => {
  try {
    const { barcode } = req.params;

    const inventoryItem = await Inventory.findOne({
      where: { 
        barcode, 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      },
      include: [
        { model: Product, as: 'product' },
        { 
          model: PurchaseOrder, 
          as: 'purchaseOrder',
          include: [{ model: Vendor, as: 'vendor' }]
        },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found with this barcode' });
    }

    // Parse barcode to get additional info
    const barcodeInfo = parseBarcode(barcode);

    res.json({
      inventory: inventoryItem,
      barcode_info: barcodeInfo,
      qr_data: inventoryItem.qr_code ? JSON.parse(inventoryItem.qr_code) : null
    });
  } catch (error) {
    console.error('Error fetching inventory by barcode:', error);
    res.status(500).json({ message: 'Failed to fetch inventory item', error: error.message });
  }
});

// Get inventory item by batch number
router.get('/batch/:batchNumber', authenticateToken, checkDepartment(['inventory', 'admin', 'manufacturing', 'procurement']), async (req, res) => {
  try {
    const { batchNumber } = req.params;

    const inventoryItems = await Inventory.findAll({
      where: { 
        batch_number: batchNumber, 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      },
      include: [
        { model: Product, as: 'product' },
        { 
          model: PurchaseOrder, 
          as: 'purchaseOrder',
          include: [{ model: Vendor, as: 'vendor' }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    if (inventoryItems.length === 0) {
      return res.status(404).json({ message: 'No inventory items found with this batch number' });
    }

    res.json({
      batch_number: batchNumber,
      items_count: inventoryItems.length,
      total_quantity: inventoryItems.reduce((sum, item) => sum + parseFloat(item.current_stock || 0), 0),
      total_value: inventoryItems.reduce((sum, item) => sum + parseFloat(item.total_value || 0), 0),
      items: inventoryItems
    });
  } catch (error) {
    console.error('Error fetching inventory by batch:', error);
    res.status(500).json({ message: 'Failed to fetch inventory items', error: error.message });
  }
});

// Get barcode labels for printing (multiple items)
router.post('/barcodes/print', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  try {
    const { inventory_ids } = req.body;

    if (!inventory_ids || !Array.isArray(inventory_ids) || inventory_ids.length === 0) {
      return res.status(400).json({ message: 'inventory_ids array is required' });
    }

    const inventoryItems = await Inventory.findAll({
      where: { 
        id: inventory_ids,
        is_active: true 
      },
      include: [
        { model: Product, as: 'product' },
        { model: PurchaseOrder, as: 'purchaseOrder' }
      ]
    });

    if (inventoryItems.length === 0) {
      return res.status(404).json({ message: 'No inventory items found' });
    }

    // Format data for barcode printing
    const barcodeLabels = inventoryItems.map(item => {
      const qrData = item.qr_code ? JSON.parse(item.qr_code) : null;
      
      return {
        id: item.id,
        barcode: item.barcode,
        batch_number: item.batch_number,
        product_name: item.product ? item.product.name : 'Unknown Product',
        location: item.location,
        quantity: item.current_stock,
        unit_cost: item.unit_cost,
        po_number: item.purchaseOrder ? item.purchaseOrder.po_number : null,
        qr_code: item.qr_code,
        qr_data: qrData,
        created_at: item.created_at
      };
    });

    res.json({
      labels: barcodeLabels,
      count: barcodeLabels.length
    });
  } catch (error) {
    console.error('Error generating barcode labels:', error);
    res.status(500).json({ message: 'Failed to generate barcode labels', error: error.message });
  }
});

// Scan barcode and update inventory (for mobile/scanner apps)
router.post('/barcode/scan', authenticateToken, checkDepartment(['inventory', 'admin', 'manufacturing']), async (req, res) => {
  try {
    const { barcode, action, quantity, location, notes } = req.body;

    if (!barcode) {
      return res.status(400).json({ message: 'Barcode is required' });
    }

    const inventoryItem = await Inventory.findOne({
      where: { 
        barcode, 
        is_active: true,
        purchase_order_id: { [Op.not]: null }  // Only GRN-verified items
      },
      include: [
        { model: Product, as: 'product' },
        { model: PurchaseOrder, as: 'purchaseOrder' }
      ]
    });

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found with this barcode' });
    }

    // Parse barcode info
    const barcodeInfo = parseBarcode(barcode);

    // Return item info for scan action (no update)
    if (!action || action === 'view') {
      return res.json({
        inventory: inventoryItem,
        barcode_info: barcodeInfo,
        qr_data: inventoryItem.qr_code ? JSON.parse(inventoryItem.qr_code) : null
      });
    }

    // Handle different actions
    let updatedStock = parseFloat(inventoryItem.current_stock);
    let movementType = 'adjustment';

    switch (action) {
      case 'add':
        if (!quantity || quantity <= 0) {
          return res.status(400).json({ message: 'Valid quantity is required for add action' });
        }
        updatedStock += parseFloat(quantity);
        movementType = 'inward';
        break;

      case 'remove':
        if (!quantity || quantity <= 0) {
          return res.status(400).json({ message: 'Valid quantity is required for remove action' });
        }
        updatedStock -= parseFloat(quantity);
        if (updatedStock < 0) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
        movementType = 'outward';
        break;

      case 'relocate':
        if (!location) {
          return res.status(400).json({ message: 'Location is required for relocate action' });
        }
        movementType = 'transfer';
        break;

      default:
        return res.status(400).json({ message: 'Invalid action. Use: view, add, remove, or relocate' });
    }

    const transaction = await sequelize.transaction();

    try {
      // Update inventory
      const updateData = {
        current_stock: updatedStock,
        available_stock: updatedStock - parseFloat(inventoryItem.reserved_stock || 0),
        total_value: updatedStock * parseFloat(inventoryItem.unit_cost || 0),
        last_movement_date: new Date(),
        movement_type: movementType,
        updated_by: req.user.id
      };

      if (location && action === 'relocate') {
        updateData.location = location;
      }

      if (notes) {
        updateData.notes = notes;
      }

      await inventoryItem.update(updateData, { transaction });

      // Create movement record
      await InventoryMovement.create({
        inventory_id: inventoryItem.id,
        product_id: inventoryItem.product_id,
        purchase_order_id: inventoryItem.purchase_order_id,
        movement_type: movementType,
        quantity: quantity ? parseFloat(quantity) : 0,
        previous_quantity: parseFloat(inventoryItem.current_stock),
        new_quantity: updatedStock,
        unit_cost: parseFloat(inventoryItem.unit_cost || 0),
        total_cost: quantity ? parseFloat(quantity) * parseFloat(inventoryItem.unit_cost || 0) : 0,
        reference_number: barcode,
        notes: notes || `Barcode scan - ${action}`,
        location_from: action === 'relocate' ? inventoryItem.location : null,
        location_to: location || inventoryItem.location,
        performed_by: req.user.id,
        movement_date: new Date(),
        metadata: {
          barcode: barcode,
          action: action,
          scanned_at: new Date().toISOString()
        }
      }, { transaction });

      await transaction.commit();

      // Fetch updated item
      const updatedItem = await Inventory.findByPk(inventoryItem.id, {
        include: [
          { model: Product, as: 'product' },
          { model: PurchaseOrder, as: 'purchaseOrder' }
        ]
      });

      res.json({
        message: `Inventory ${action} successful`,
        inventory: updatedItem,
        previous_stock: inventoryItem.current_stock,
        new_stock: updatedStock,
        change: action === 'add' ? `+${quantity}` : action === 'remove' ? `-${quantity}` : 'relocated'
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error processing barcode scan:', error);
    res.status(500).json({ message: 'Failed to process barcode scan', error: error.message });
  }
});

// =================== BARCODE IMAGE GENERATION ===================

// GET Generate Barcode Image
router.get('/barcode-image/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const inventory = await Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (!inventory.barcode) {
      return res.status(400).json({ message: 'Barcode not found for this inventory item' });
    }

    // Try to use bwip-js if available, otherwise return barcode text
    try {
      const bwipjs = require('bwip-js');
      const png = await bwipjs.toBuffer({
        bcid: 'code128',
        text: inventory.barcode,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center'
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="${inventory.barcode}.png"`);
      res.send(png);
    } catch (bwipError) {
      // If bwip-js not installed, return SVG or JSON
      console.warn('bwip-js not available, returning barcode data:', bwipError.message);
      res.json({
        success: true,
        barcode: inventory.barcode,
        product_name: inventory.product_name,
        message: 'Install bwip-js for image generation. Use react-barcode on frontend.'
      });
    }
  } catch (error) {
    console.error('Error generating barcode:', error);
    res.status(500).json({ message: 'Failed to generate barcode', error: error.message });
  }
});

// =================== PROJECT-WISE MATERIAL TRACKING ===================

// GET Project Materials by Sales Order ID
router.get('/projects/:salesOrderId/materials', authenticateToken, async (req, res) => {
  try {
    const { salesOrderId } = req.params;

    // Fetch sales order details
    const salesOrder = await require('../config/database').SalesOrder.findByPk(salesOrderId, {
      include: [
        { model: require('../config/database').Customer, as: 'customer', attributes: ['id', 'company_name', 'contact_person'] }
      ]
    });

    if (!salesOrder) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    // Fetch all materials for this project
    const materials = await Inventory.findAll({
      where: {
        sales_order_id: salesOrderId,
        is_active: true
      },
      include: [
        { model: Product, as: 'product', required: false }
      ],
      order: [['updated_at', 'DESC']]
    });

    // Calculate summary
    const totalReceived = materials.reduce((sum, item) => sum + parseFloat(item.initial_quantity || 0), 0);
    const currentStock = materials.reduce((sum, item) => sum + parseFloat(item.current_stock || 0), 0);
    const sentToManufacturing = totalReceived - currentStock;

    // Fetch dispatch history via material movements
    const dispatches = await InventoryMovement.findAll({
      where: {
        movement_type: 'dispatch_to_manufacturing',
        metadata: {
          [require('sequelize').Op.like]: `%"sales_order_id":${salesOrderId}%`
        }
      },
      include: [
        {
          model: Inventory,
          as: 'inventory'
        },
        {
          model: User,
          as: 'performer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['movement_date', 'DESC']],
      limit: 50
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
router.get('/projects-summary', authenticateToken, async (req, res) => {
  try {
    const projects = await sequelize.query(`
      SELECT 
        so.id as sales_order_id,
        so.order_number,
        so.order_date,
        c.company_name as customer_name,
        COUNT(i.id) as material_count,
        COALESCE(SUM(i.initial_quantity), 0) as total_received,
        COALESCE(SUM(i.current_stock), 0) as current_stock,
        COALESCE(SUM(i.initial_quantity - i.current_stock), 0) as sent_to_manufacturing,
        MAX(i.updated_at) as last_updated
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN inventory i ON i.sales_order_id = so.id AND i.is_active = 1
      WHERE i.id IS NOT NULL
      GROUP BY so.id, so.order_number, so.order_date, c.company_name
      ORDER BY so.order_date DESC
    `, {
      type: require('sequelize').QueryTypes.SELECT
    });

    res.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching project summary:', error);
    res.status(500).json({ message: 'Failed to fetch project summary', error: error.message });
  }
});

// POST Send materials to manufacturing (with permanent deduction)
router.post('/send-to-manufacturing', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await sequelize.transaction();

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
    const inventory = await Inventory.findByPk(inventory_id, { transaction });
    if (!inventory) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const dispatchQty = parseFloat(quantity);
    if (dispatchQty <= 0 || dispatchQty > inventory.available_stock) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Invalid quantity. Must be positive and not exceed available stock.',
        available: inventory.available_stock,
        requested: dispatchQty
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
    const movement = await InventoryMovement.create({
      inventory_id: inventory.id,
      product_id: inventory.product_id,
      movement_type: 'dispatch_to_manufacturing',
      quantity: -dispatchQty,
      previous_quantity: parseFloat(inventory.current_stock),
      new_quantity: newStock,
      unit_cost: inventory.unit_cost,
      total_cost: dispatchQty * parseFloat(inventory.unit_cost || 0),
      reference_type: 'production_order',
      reference_id: production_order_id,
      reference_number: `MFG-DISP-${Date.now()}`,
      notes: notes || 'Dispatched to manufacturing',
      location_from: inventory.location,
      location_to: 'Manufacturing Floor',
      performed_by: req.user.id,
      movement_date: new Date(),
      metadata: {
        sales_order_id,
        production_order_id,
        dispatched_by_name: dispatched_by_name || req.user.name,
        product_name: inventory.product_name || 'N/A',
        barcode: inventory.barcode
      }
    }, { transaction });

    // Send notification to manufacturing department
    try {
      await Notification.create({
        type: 'material_dispatched',
        title: 'Materials Dispatched to Manufacturing',
        message: `${inventory.product_name || 'Material'} - Quantity: ${dispatchQty} ${inventory.unit_of_measurement || 'units'}`,
        related_type: 'inventory',
        related_id: inventory.id,
        priority: 'high',
        metadata: {
          inventory_id,
          quantity: dispatchQty,
          product_name: inventory.product_name,
          sales_order_id,
          production_order_id,
          movement_id: movement.id
        }
      }, { transaction });
    } catch (notifError) {
      console.warn('Failed to create notification:', notifError.message);
      // Continue even if notification fails
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Materials dispatched to manufacturing successfully',
      dispatch: {
        id: movement.id,
        inventory_id: inventory.id,
        product_name: inventory.product_name,
        previous_stock: parseFloat(inventory.current_stock) + dispatchQty,
        dispatched_quantity: dispatchQty,
        remaining_stock: newStock,
        unit_of_measurement: inventory.unit_of_measurement,
        dispatched_at: movement.movement_date
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error dispatching to manufacturing:', error);
    res.status(500).json({ message: 'Failed to dispatch materials', error: error.message });
  }
});

// GET Stock movement history for an inventory item
router.get('/:id/stock-history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const inventory = await Inventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const { count, rows } = await InventoryMovement.findAndCountAll({
      where: { inventory_id: id },
      include: [
        {
          model: User,
          as: 'performer',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['movement_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      inventory: {
        id: inventory.id,
        product_name: inventory.product_name,
        barcode: inventory.barcode,
        current_stock: inventory.current_stock
      },
      history: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ message: 'Failed to fetch stock history', error: error.message });
  }
});

module.exports = router;