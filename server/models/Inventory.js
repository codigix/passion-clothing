const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for items without product mapping
      references: {
        model: 'products',
        key: 'id'
      }
    },
    purchase_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'purchase_orders',
        key: 'id'
      }
    },
    sales_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sales_orders',
        key: 'id'
      },
      comment: 'Link to Sales Order (project)'
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Project this stock belongs to (null means general/extra stock)'
    },
    // Product details merged into Inventory
    product_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Unique product code'
    },
    product_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: 'Unnamed Product'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM(
        'fabric', 'thread', 'button', 'zipper', 'elastic', 'lace',
        'uniform', 'shirt', 'trouser', 'skirt', 'blazer', 'tie',
        'belt', 'shoes', 'socks', 'accessories', 'raw_material', 'finished_goods'
      ),
      allowNull: true,
      defaultValue: 'raw_material'
    },
    sub_category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    product_type: {
      type: DataTypes.ENUM('raw_material', 'semi_finished', 'finished_goods', 'accessory'),
      allowNull: true,
      defaultValue: 'raw_material'
    },
    unit_of_measurement: {
      type: DataTypes.ENUM('piece', 'meter', 'yard', 'kg', 'gram', 'liter', 'dozen', 'set'),
      allowNull: true,
      defaultValue: 'piece'
    },
    hsn_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    size: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    material: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Detailed specifications like dimensions, weight, etc.'
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of image URLs'
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    selling_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    tax_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    weight: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: true,
      comment: 'Weight in kg'
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Length, width, height in cm'
    },
    is_serialized: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_batch_tracked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    quality_parameters: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Quality check parameters for this product'
    },
    stock_type: {
      type: DataTypes.ENUM('project_specific', 'general_extra', 'consignment', 'returned'),
      defaultValue: 'general_extra',
      comment: 'Type of stock for better categorization and tracking'
    },
    po_item_index: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Index of item in PO items array'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Warehouse, rack, bin location'
    },
    batch_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    serial_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    current_stock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Current stock quantity (can be decimal for fabrics)'
    },
    initial_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Initial quantity from PO'
    },
    consumed_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Quantity consumed/used'
    },
    reserved_stock: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Stock reserved for orders'
    },
    available_stock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'current_stock - reserved_stock'
    },
    minimum_level: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    maximum_level: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    reorder_level: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    unit_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    total_value: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'current_stock * unit_cost'
    },
    last_purchase_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_issue_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    manufacturing_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    quality_status: {
      type: DataTypes.ENUM('approved', 'pending', 'rejected', 'quarantine'),
      defaultValue: 'approved'
    },
    condition: {
      type: DataTypes.ENUM('new', 'good', 'fair', 'damaged', 'obsolete'),
      defaultValue: 'new'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    barcode: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_audit_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    audit_variance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Difference found during last audit'
    },
    movement_type: {
      type: DataTypes.ENUM('inward', 'outward', 'transfer', 'adjustment'),
      allowNull: true,
      comment: 'Last movement type'
    },
    last_movement_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'inventory',
    indexes: [
      { fields: ['product_id'] },
      { fields: ['location'] },
      { fields: ['batch_number'] },
      { fields: ['serial_number'] },
      { fields: ['current_stock'] },
      { fields: ['available_stock'] },
      { fields: ['quality_status'] },
      { fields: ['condition'] },
      { fields: ['expiry_date'] },
      { fields: ['is_active'] },
      { fields: ['barcode'] },
      { fields: ['product_id', 'location'] },
      { fields: ['project_id'] },
      { fields: ['stock_type'] },
      { fields: ['project_id', 'stock_type'] },
      { fields: ['product_code'] },
      { fields: ['product_name'] },
      { fields: ['category'] },
      { fields: ['sales_order_id'] },
      { fields: ['sales_order_id', 'stock_type'] }
    ]
  });

  return Inventory;
};