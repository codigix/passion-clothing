const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialConsumption = sequelize.define('MaterialConsumption', {
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
    production_stage_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'production_stages',
        key: 'id'
      },
      comment: 'Stage where material was consumed'
    },
    stage_operation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stage_operations',
        key: 'id'
      },
      comment: 'Specific operation where material was consumed'
    },
    material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventory',
        key: 'id'
      },
      comment: 'Inventory item used for production'
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
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Barcode of the material item'
    },
    allocated_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Total quantity originally allocated to production'
    },
    quantity_used: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Quantity consumed from allocated stock'
    },
    leftover_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Quantity remaining after production use'
    },
    reconciled_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Quantity confirmed during reconciliation'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    reconciliation_status: {
      type: DataTypes.ENUM('pending', 'partial', 'complete'),
      defaultValue: 'pending'
    },
    reconciliation_notes: {
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
    consumed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    consumed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
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
    tableName: 'material_consumptions',
    underscored: true,
    indexes: [
      { fields: ['production_order_id'] },
      { fields: ['production_stage_id'] },
      { fields: ['stage_operation_id'] },
      { fields: ['inventory_id'] },
      { fields: ['barcode'] },
      { fields: ['consumed_at'] },
      { fields: ['reconciliation_status'], name: 'idx_material_consumptions_reconciliation_status' }
    ]
  });

  return MaterialConsumption;
};