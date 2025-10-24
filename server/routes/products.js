const express = require('express');
const { Op } = require('sequelize');
const { Product, ProductLifecycle, ProductLifecycleHistory } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');

// Generate unique barcode
function generateBarcode() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PASH${timestamp.slice(-6)}${random}`;
}

const router = express.Router();

// List products with pagination and search
router.get('/', authenticateToken, checkDepartment(['inventory', 'procurement', 'manufacturing', 'admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, category, product_type } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { product_code: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;
    if (category) where.category = category;
    if (product_type) where.product_type = product_type;

    const { count, rows } = await Product.findAndCountAll({
      where,
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      products: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get single product (by ID or product_code)
router.get('/:id', authenticateToken, checkDepartment(['inventory', 'procurement', 'manufacturing', 'admin']), async (req, res) => {
  try {
    const identifier = req.params.id;
    
    // Try to find by ID first (numeric), then by product_code
    let product;
    if (/^\d+$/.test(identifier)) {
      product = await Product.findByPk(identifier);
    }
    
    // If not found by ID or identifier is not numeric, try product_code
    if (!product) {
      product = await Product.findOne({ 
        where: { product_code: identifier }
      });
    }
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    console.error('Product fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement']), async (req, res) => {
  try {
    // Validate required fields
    const { product_code, name, category, product_type, unit_of_measurement } = req.body;
    
    if (!product_code || !product_code.trim()) {
      return res.status(400).json({ message: 'Product code is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (!product_type) {
      return res.status(400).json({ message: 'Product type is required' });
    }
    if (!unit_of_measurement) {
      return res.status(400).json({ message: 'Unit of measurement is required' });
    }

    const data = { ...req.body, created_by: req.user.id };

    // Generate barcode if not provided
    if (!data.barcode) {
      let barcode;
      let attempts = 0;
      do {
        barcode = generateBarcode();
        attempts++;
        if (attempts > 10) {
          return res.status(500).json({ message: 'Failed to generate unique barcode' });
        }
      } while (await Product.findOne({ where: { barcode } }));

      data.barcode = barcode;
    }

    // Generate QR code data (can include product URL or details)
    if (!data.qr_code) {
      data.qr_code = JSON.stringify({
        id: data.product_code,
        barcode: data.barcode,
        name: data.name,
        type: 'product'
      });
    }

    const product = await Product.create(data);

    // Create initial product lifecycle entry
    const lifecycle = await ProductLifecycle.create({
      product_id: product.id,
      barcode: data.barcode,
      current_stage: 'created',
      current_status: 'active',
      quantity: 1,
      created_by: req.user.id
    });

    // Create initial lifecycle history entry
    await ProductLifecycleHistory.create({
      product_lifecycle_id: lifecycle.id,
      barcode: data.barcode,
      stage_from: null,
      stage_to: 'created',
      status_from: null,
      status_to: 'active',
      transition_time: new Date(),
      notes: 'Product created and barcode generated',
      scan_data: {
        scan_type: 'creation',
        barcode: data.barcode,
        timestamp: new Date(),
        user_id: req.user.id
      },
      created_by: req.user.id
    });

    res.status(201).json({ 
      message: 'Product created successfully', 
      product: {
        ...product.toJSON(),
        lifecycle_id: lifecycle.id
      }
    });
  } catch (err) {
    console.error('Product create error:', err);
    
    // Handle specific Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      const validationErrors = err.errors.map(error => error.message);
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }
    
    // Handle unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0]?.path;
      return res.status(400).json({ message: `${field} already exists` });
    }
    
    res.status(400).json({ message: 'Failed to create product', error: err.message });
  }
});

// Update product
router.put('/:id', authenticateToken, checkDepartment(['inventory', 'admin', 'procurement']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const updateData = { ...req.body };

    // Generate barcode if not provided and product doesn't have one
    if (!updateData.barcode && !product.barcode) {
      let barcode;
      let attempts = 0;
      do {
        barcode = generateBarcode();
        attempts++;
        if (attempts > 10) {
          return res.status(500).json({ message: 'Failed to generate unique barcode' });
        }
      } while (await Product.findOne({ where: { barcode, id: { [Op.ne]: product.id } } }));

      updateData.barcode = barcode;
    }

    // Update QR code data if barcode changed or if it doesn't exist
    if ((updateData.barcode || product.barcode) && (!product.qr_code || updateData.barcode !== product.barcode)) {
      updateData.qr_code = JSON.stringify({
        id: updateData.product_code || product.product_code,
        barcode: updateData.barcode || product.barcode,
        name: updateData.name || product.name,
        type: 'product'
      });
    }

    await product.update(updateData);
    res.json({ message: 'Product updated', product });
  } catch (err) {
    console.error('Product update error:', err);
    res.status(400).json({ message: 'Failed to update product', error: err.message });
  }
});

// Delete (soft) product
router.delete('/:id', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.update({ status: 'inactive' });
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    console.error('Product delete error:', err);
    res.status(400).json({ message: 'Failed to delete product', error: err.message });
  }
});

// Scan barcode to get product details with inventory status
router.get('/scan/:barcode', authenticateToken, checkDepartment(['inventory', 'procurement', 'manufacturing', 'sales', 'admin']), async (req, res) => {
  try {
    const { barcode } = req.params;
    const { Inventory } = require('../config/database');

    // Find product by barcode OR product_code (supports both scanning methods)
    const product = await Product.findOne({
      where: { 
        [Op.or]: [
          { barcode, status: 'active' },
          { product_code: barcode, status: 'active' }
        ]
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found with this code or barcode' });
    }

    // Get inventory details for this product
    const inventory = await Inventory.findAll({
      where: { product_id: product.id, is_active: true },
      attributes: [
        'current_stock', 'reserved_stock', 'available_stock', 'location',
        'last_movement_date', 'movement_type', 'quality_status', 'condition',
        'batch_number', 'serial_number', 'expiry_date', 'updated_at'
      ]
    });

    // Calculate total stock across all locations
    const totalStock = inventory.reduce((sum, item) => sum + item.current_stock, 0);
    const totalReserved = inventory.reduce((sum, item) => sum + item.reserved_stock, 0);
    const totalAvailable = inventory.reduce((sum, item) => sum + item.available_stock, 0);

    const productData = {
      ...product.toJSON(),
      inventory_summary: {
        total_stock: totalStock,
        total_reserved: totalReserved,
        total_available: totalAvailable,
        locations: inventory.map(inv => ({
          location: inv.location,
          current_stock: inv.current_stock,
          available_stock: inv.available_stock,
          last_movement: inv.last_movement_date,
          movement_type: inv.movement_type,
          quality_status: inv.quality_status,
          condition: inv.condition,
          batch_number: inv.batch_number,
          serial_number: inv.serial_number,
          expiry_date: inv.expiry_date
        }))
      }
    };

    res.json({ product: productData });
  } catch (err) {
    console.error('Barcode scan error:', err);
    res.status(500).json({ message: 'Failed to scan barcode', error: err.message });
  }
});

module.exports = router;