const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
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
      allowNull: false
    },
    sub_category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    product_type: {
      type: DataTypes.ENUM('raw_material', 'semi_finished', 'finished_goods', 'accessory'),
      allowNull: false
    },
    unit_of_measurement: {
      type: DataTypes.ENUM('piece', 'meter', 'yard', 'kg', 'gram', 'liter', 'dozen', 'set'),
      allowNull: false
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
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    qr_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
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
    minimum_stock_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    maximum_stock_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    reorder_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lead_time_days: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    shelf_life_days: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
      defaultValue: 'active'
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
    production_time_hours: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Standard production time in hours'
    },
    materials_required: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Bill of materials - list of raw materials required'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'products',
    indexes: [
      { fields: ['product_code'] },
      { fields: ['name'] },
      { fields: ['category'] },
      { fields: ['product_type'] },
      { fields: ['status'] },
      { fields: ['barcode'] },
      { fields: ['brand'] },
      { fields: ['color'] },
      { fields: ['size'] }
    ]
  });

  return Product;
};