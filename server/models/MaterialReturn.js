const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialReturn = sequelize.define('MaterialReturn', {
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
    return_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'When materials are being returned'
    },
    status: {
      type: DataTypes.ENUM('pending_approval', 'approved', 'returned', 'rejected'),
      defaultValue: 'pending_approval'
    },
    total_materials: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of materials being returned with quantities: [{inventory_id, product_name, quantity, unit, reason}, ...]'
    },
    approval_notes: {
      type: DataTypes.TEXT,
      comment: 'Notes during approval'
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    returned_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    returned_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      comment: 'If rejected, why?'
    },
    inventory_movement_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'inventory_movements',
        key: 'id'
      },
      comment: 'Reference to the inventory movement created when materials are returned'
    }
  }, {
    tableName: 'material_returns',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['production_order_id'] },
      { fields: ['status'] },
      { fields: ['return_date'] }
    ]
  });

  return MaterialReturn;
};