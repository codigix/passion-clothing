const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rejection = sequelize.define('Rejection', {
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
      type: DataTypes.ENUM(
        'material_allocation', 'cutting', 'embroidery', 'printing', 
        'stitching', 'finishing', 'ironing', 'packing', 'quality_check'
      ),
      allowNull: false
    },
    rejected_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rejection_reason: {
      type: DataTypes.ENUM(
        'material_defect', 'cutting_error', 'stitching_defect', 'size_mismatch',
        'color_variation', 'embroidery_defect', 'printing_defect', 'finishing_issue',
        'measurement_error', 'quality_standard_not_met', 'damage', 'other'
      ),
      allowNull: false
    },
    detailed_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    severity: {
      type: DataTypes.ENUM('minor', 'major', 'critical'),
      allowNull: false
    },
    action_taken: {
      type: DataTypes.ENUM('rework', 'scrap', 'downgrade', 'return_to_vendor', 'pending'),
      allowNull: false
    },
    rework_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    scrap_value: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    loss_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    responsible_party: {
      type: DataTypes.ENUM('internal', 'vendor', 'material_supplier', 'customer'),
      allowNull: false
    },
    responsible_person: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id'
      }
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of image URLs showing the defect'
    },
    corrective_action: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    preventive_action: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open'
    },
    resolution_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reported_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'rejections',
    indexes: [
      { fields: ['production_order_id'] },
      { fields: ['stage_name'] },
      { fields: ['rejection_reason'] },
      { fields: ['severity'] },
      { fields: ['action_taken'] },
      { fields: ['responsible_party'] },
      { fields: ['status'] },
      { fields: ['reported_by'] },
      { fields: ['created_at'] }
    ]
  });

  return Rejection;
};