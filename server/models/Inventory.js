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
      { fields: ['product_id', 'location'] }
    ]
  });

  return Inventory;
};