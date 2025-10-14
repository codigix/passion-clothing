const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionStage = sequelize.define('ProductionStage', {
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
    stage_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Name of the production stage - supports custom values from wizard'
    },
    stage_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Order of this stage in the production process'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'on_hold', 'skipped'),
      defaultValue: 'pending'
    },
    planned_start_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    planned_end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_start_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    planned_duration_hours: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true
    },
    actual_duration_hours: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    machine_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Machine or workstation identifier'
    },
    quantity_processed: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    quantity_approved: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    quantity_rejected: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rejection_reasons: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of rejection reasons with quantities'
    },
    efficiency_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Efficiency calculated as (actual_time / planned_time) * 100'
    },
    delay_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quality_parameters: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Quality check results for this stage'
    },
    material_consumption: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Materials consumed in this stage'
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    outsourced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id'
      }
    },
    outsource_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    is_printing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this stage involves printing'
    },
    is_embroidery: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this stage involves embroidery'
    },
    customization_type: {
      type: DataTypes.ENUM('none', 'printing', 'embroidery', 'both'),
      defaultValue: 'none',
      comment: 'Type of customization for this stage'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Start date of the stage'
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'End date of the stage'
    },
    operations: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of operations for this stage'
    },
    outsource_type: {
      type: DataTypes.ENUM('none', 'printing', 'embroidery', 'both'),
      defaultValue: 'none',
      comment: 'Type of outsourcing for this stage'
    },
    outsource_dispatch_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when materials were dispatched to vendor'
    },
    outsource_return_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expected/actual return date from vendor'
    },
    challan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'challans',
        key: 'id'
      },
      comment: 'Challan for outsourced work'
    }
  }, {
    tableName: 'production_stages',
    indexes: [
      { fields: ['production_order_id'] },
      { fields: ['stage_name'] },
      { fields: ['status'] },
      { fields: ['assigned_to'] },
      { fields: ['stage_order'] },
      { fields: ['planned_start_time'] },
      { fields: ['actual_start_time'] },
      { fields: ['outsourced'] },
      { fields: ['vendor_id'] },
      { fields: ['is_printing'] },
      { fields: ['is_embroidery'] },
      { fields: ['customization_type'] },
      { fields: ['start_date'] },
      { fields: ['end_date'] },
      { fields: ['outsource_type'] },
      { fields: ['challan_id'] }
    ]
  });

  return ProductionStage;
};