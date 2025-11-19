'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_trails', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      entity_type: {
        type: Sequelize.ENUM('purchase_order', 'invoice', 'payment', 'grn', 'production_order'),
        allowNull: false,
        comment: 'Type of entity being audited'
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID of the entity'
      },
      action: {
        type: Sequelize.ENUM('created', 'updated', 'approved', 'rejected', 'sent', 'payment_initiated', 'payment_completed', 'viewed'),
        allowNull: false,
        comment: 'Action performed'
      },
      status_before: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Status before the action'
      },
      status_after: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Status after the action'
      },
      performed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User who performed the action'
      },
      department: {
        type: Sequelize.ENUM(
          'sales', 'procurement', 'manufacturing', 'outsourcing',
          'inventory', 'shipment', 'store', 'finance', 'admin', 'samples'
        ),
        allowNull: true,
        comment: 'Department of the user'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Reason for the action'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional metadata (e.g., invoice_id for approved PO, payment_id)'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      indexes: [
        { fields: ['entity_type', 'entity_id'] },
        { fields: ['entity_type'] },
        { fields: ['action'] },
        { fields: ['performed_by'] },
        { fields: ['department'] },
        { fields: ['created_at'] }
      ]
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('audit_trails');
  }
};
