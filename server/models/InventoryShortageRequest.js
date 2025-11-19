const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InventoryShortageRequest = sequelize.define('InventoryShortageRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    request_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: ISR-YYYYMMDD-XXXXX'
    },
    request_type: {
      type: DataTypes.ENUM('shortage', 'overage'),
      allowNull: false,
      defaultValue: 'shortage'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'products', key: 'id' }
    },
    product_code: { type: DataTypes.STRING(50), allowNull: true },
    product_name: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    current_stock: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    minimum_stock: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    required_quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    uom: { type: DataTypes.STRING(20), allowNull: true },
    reason: { type: DataTypes.TEXT, allowNull: true },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('pending', 'pending_approval', 'approved', 'rejected', 'po_created', 'resolved'),
      defaultValue: 'pending'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    },
    approved_at: { type: DataTypes.DATE, allowNull: true },
    rejected_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    },
    rejection_reason: { type: DataTypes.TEXT, allowNull: true },
    rejected_at: { type: DataTypes.DATE, allowNull: true },
    related_po_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'purchase_orders', key: 'id' }
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'inventory_shortage_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['request_number'] },
      { fields: ['product_id'] },
      { fields: ['status'] },
      { fields: ['request_type'] },
      { fields: ['priority'] },
      { fields: ['created_by'] },
      { fields: ['created_at'] }
    ]
  });

  return InventoryShortageRequest;
};
