const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InventoryMovement = sequelize.define('InventoryMovement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventory',
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
    sales_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sales_orders',
        key: 'id'
      }
    },
    production_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'production_orders',
        key: 'id'
      }
    },
    movement_type: {
      type: DataTypes.ENUM('inward', 'outward', 'transfer', 'adjustment', 'return', 'consume'),
      allowNull: false,
      comment: 'Type of inventory movement'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Quantity moved (positive for inward, negative for outward)'
    },
    previous_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Stock level before movement'
    },
    new_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Stock level after movement'
    },
    unit_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Cost per unit at time of movement'
    },
    total_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Total cost of movement'
    },
    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'External reference (GRN, invoice, etc.)'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location_from: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Source location for transfers'
    },
    location_to: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Destination location'
    },
    performed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    movement_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional movement data'
    }
  }, {
    tableName: 'inventory_movements',
    indexes: [
      { fields: ['inventory_id'] },
      { fields: ['purchase_order_id'] },
      { fields: ['sales_order_id'] },
      { fields: ['production_order_id'] },
      { fields: ['movement_type'] },
      { fields: ['movement_date'] },
      { fields: ['performed_by'] }
    ]
  });

  return InventoryMovement;
};