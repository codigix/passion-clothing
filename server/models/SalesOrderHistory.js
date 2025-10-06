const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SalesOrderHistory = sequelize.define('SalesOrderHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sales_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sales_orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Sales order associated with this lifecycle event'
    },
    status_from: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Previous status before transition'
    },
    status_to: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Status after transition'
    },
    approval_status_from: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Previous approval status before transition'
    },
    approval_status_to: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Approval status after transition'
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional context or remarks for the transition'
    },
    performed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who performed the action'
    },
    performed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the transition occurred'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Serialized metadata describing the lifecycle event'
    }
  }, {
    tableName: 'sales_order_history',
    underscored: true,
    indexes: [
      { fields: ['sales_order_id', 'performed_at'] },
      { fields: ['performed_by'] }
    ]
  });

  return SalesOrderHistory;
};