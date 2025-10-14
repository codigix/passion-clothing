const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionCompletion = sequelize.define('ProductionCompletion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    production_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'production_orders',
        key: 'id'
      }
    },
    required_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Total quantity required'
    },
    produced_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Total quantity produced'
    },
    approved_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Quantity approved in QC'
    },
    rejected_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Quantity rejected in QC'
    },
    all_quantity_received: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether all required quantity was produced'
    },
    quantity_shortfall_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason if quantity is short'
    },
    all_materials_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether all allocated materials were used'
    },
    remaining_materials: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Remaining materials snapshot when not all used'
    },
    material_returned_to_inventory: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether leftover materials returned to inventory'
    },
    material_reconciliation_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Flag if reconciliation workflow required'
    },
    material_reconciliation_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reconciliation_completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reconciliation_completed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reconciliation_audit: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Audit trail capturing reconciliation history'
    },
    total_duration_hours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    planned_duration_hours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    efficiency_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    quality_passed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    quality_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ready_for_shipment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sent_to_shipment_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    shipment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'shipments',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'production_completions',
    underscored: true,
    indexes: [
      { fields: ['production_order_id'], unique: true },
      { fields: ['shipment_id'] },
      { fields: ['ready_for_shipment'] },
      { fields: ['completed_at'] },
      { fields: ['reconciliation_completed_at'], name: 'idx_production_completions_reconciliation_completed_at' }
    ]
  });

  return ProductionCompletion;
};