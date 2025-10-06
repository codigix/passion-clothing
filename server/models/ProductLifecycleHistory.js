const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductLifecycleHistory = sequelize.define('ProductLifecycleHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_lifecycle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product_lifecycle',
        key: 'id'
      }
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Product barcode for quick reference'
    },
    stage_from: {
      type: DataTypes.ENUM(
        'created', 'material_allocated', 'in_production', 'cutting', 
        'embroidery', 'printing', 'stitching', 'finishing', 'ironing', 
        'quality_check', 'packing', 'ready_for_dispatch', 'dispatched', 
        'in_transit', 'delivered', 'returned', 'rejected'
      ),
      allowNull: true,
      comment: 'Previous stage (null for initial creation)'
    },
    stage_to: {
      type: DataTypes.ENUM(
        'created', 'material_allocated', 'in_production', 'cutting', 
        'embroidery', 'printing', 'stitching', 'finishing', 'ironing', 
        'quality_check', 'packing', 'ready_for_dispatch', 'dispatched', 
        'in_transit', 'delivered', 'returned', 'rejected'
      ),
      allowNull: false,
      comment: 'New stage'
    },
    status_from: {
      type: DataTypes.ENUM('active', 'on_hold', 'completed', 'cancelled', 'returned'),
      allowNull: true
    },
    status_to: {
      type: DataTypes.ENUM('active', 'on_hold', 'completed', 'cancelled', 'returned'),
      allowNull: false
    },
    transition_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    duration_in_previous_stage_hours: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Time spent in the previous stage'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Location where transition occurred'
    },
    machine_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Machine or workstation where transition occurred'
    },
    operator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who performed the operation'
    },
    quantity_processed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Quantity processed in this transition'
    },
    quantity_approved: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Quantity approved in quality check'
    },
    quantity_rejected: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Quantity rejected in quality check'
    },
    rejection_reasons: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Reasons for rejection with details'
    },
    quality_parameters: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Quality check results'
    },
    cost_incurred: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: 'Cost incurred in this stage'
    },
    materials_consumed: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Materials consumed in this stage'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes for this transition'
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Images captured during this stage'
    },
    scan_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Barcode scan data and metadata'
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
    tableName: 'product_lifecycle_history',
    indexes: [
      { fields: ['product_lifecycle_id'] },
      { fields: ['barcode'] },
      { fields: ['stage_to'] },
      { fields: ['transition_time'] },
      { fields: ['operator_id'] },
      { fields: ['created_by'] },
      { fields: ['location'] },
      { fields: ['machine_id'] }
    ]
  });

  return ProductLifecycleHistory;
};