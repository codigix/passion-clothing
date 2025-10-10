const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.ENUM('order', 'inventory', 'manufacturing', 'shipment', 'procurement', 'finance', 'system', 'vendor_shortage', 'grn_verification', 'grn_verified', 'grn_discrepancy', 'grn_discrepancy_resolved'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read', 'archived'),
      defaultValue: 'sent'
    },
    recipient_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    recipient_department: {
      type: DataTypes.ENUM('sales', 'procurement', 'inventory', 'manufacturing', 'shipment', 'finance', 'admin', 'samples'),
      allowNull: true
    },
    related_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sales_orders',
        key: 'id'
      }
    },
    related_entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Can reference any related entity (PO, GRN, Production Order, etc.)'
    },
    related_entity_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Type of related entity (purchase_order, grn, production_order, etc.)'
    },
    action_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL to navigate to when clicking the notification'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional data for the notification'
    },
    trigger_event: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Key representing the event that generated the notification'
    },
    actor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User responsible for the action that generated the notification'
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the notification should be auto-archived'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      { fields: ['recipient_user_id', 'status'] },
      { fields: ['recipient_department', 'status'] },
      { fields: ['type', 'status'] },
      { fields: ['trigger_event'] },
      { fields: ['actor_id'] },
      { fields: ['created_at'] }
    ]
  });

  return Notification;
};