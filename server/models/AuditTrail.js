const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditTrail = sequelize.define('AuditTrail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    entity_type: {
      type: DataTypes.ENUM('purchase_order', 'invoice', 'payment', 'grn', 'production_order'),
      allowNull: false,
      comment: 'Type of entity being audited'
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the entity'
    },
    action: {
      type: DataTypes.ENUM('created', 'updated', 'approved', 'rejected', 'sent', 'payment_initiated', 'payment_completed', 'viewed'),
      allowNull: false,
      comment: 'Action performed'
    },
    status_before: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Status before the action'
    },
    status_after: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Status after the action'
    },
    performed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who performed the action'
    },
    department: {
      type: DataTypes.ENUM(
        'sales', 'procurement', 'manufacturing', 'outsourcing',
        'inventory', 'shipment', 'store', 'finance', 'admin', 'samples'
      ),
      allowNull: true,
      comment: 'Department of the user'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason for the action'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional metadata (e.g., invoice_id for approved PO, payment_id)'
    }
  }, {
    tableName: 'audit_trails',
    indexes: [
      { fields: ['entity_type', 'entity_id'] },
      { fields: ['entity_type'] },
      { fields: ['action'] },
      { fields: ['performed_by'] },
      { fields: ['department'] },
      { fields: ['created_at'] }
    ]
  });

  return AuditTrail;
};
