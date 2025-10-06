const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionOrder = sequelize.define('ProductionOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    production_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: PRD-YYYYMMDD-XXXX'
    },
    sales_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sales_orders',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    produced_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rejected_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    approved_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM(
        'pending', 'material_allocated', 'cutting', 'embroidery', 
        'stitching', 'finishing', 'quality_check', 'completed', 
        'on_hold', 'cancelled'
      ),
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    production_type: {
      type: DataTypes.ENUM('in_house', 'outsourced', 'mixed'),
      defaultValue: 'in_house'
    },
    planned_start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    planned_end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    actual_start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estimated_hours: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true
    },
    actual_hours: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.00
    },
    material_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    labor_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    overhead_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    total_cost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Product specifications, measurements, colors, etc.'
    },
    materials_required: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'List of materials and quantities required'
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quality_parameters: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Quality check parameters and standards'
    },
    progress_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    supervisor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'production_orders',
    indexes: [
      { fields: ['production_number'] },
      { fields: ['sales_order_id'] },
      { fields: ['product_id'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['production_type'] },
      { fields: ['planned_start_date'] },
      { fields: ['planned_end_date'] },
      { fields: ['created_by'] },
      { fields: ['assigned_to'] }
    ]
  });

  return ProductionOrder;
};