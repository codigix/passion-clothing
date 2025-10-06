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
    references: {
      model: 'production_orders',
      key: 'id'
    }
  },
  inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'inventory',
      key: 'id'
    }
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Barcode of the inventory item being allocated'
  },
  quantity_allocated: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total quantity allocated from inventory'
  },
  quantity_consumed: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Quantity consumed in production'
  },
  quantity_returned: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Unused quantity returned to inventory'
  },
  quantity_wasted: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Quantity wasted/damaged during production'
  },
  allocation_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When material was allocated to production'
  },
  allocated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who allocated the material'
  },
  current_stage_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'production_stages',
      key: 'id'
    },
    comment: 'Current production stage using this material'
  },
  consumption_log: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of consumption records: [{stage_id, stage_name, quantity, consumed_at, consumed_by, barcode_scan}]'
  },
  return_barcode: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'New barcode generated for returned unused materials (INV-RET-YYYYMMDD-XXXXX)'
  },
  return_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When unused material was returned to inventory'
  },
  returned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who returned the material'
  },
  status: {
    type: DataTypes.ENUM('allocated', 'in_use', 'consumed', 'partially_returned', 'fully_returned', 'wasted'),
    allowNull: false,
    defaultValue: 'allocated',
    comment: 'Current status of allocated material'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes about material usage'
  }
}, {
  tableName: 'material_allocations',
  timestamps: true,
  indexes: [
    { fields: ['production_order_id'] },
    { fields: ['inventory_id'] },
    { fields: ['barcode'] },
    { fields: ['current_stage_id'] },
    { fields: ['status'] },
    { fields: ['return_barcode'] }
  ]
  });

  return MaterialAllocation;
};