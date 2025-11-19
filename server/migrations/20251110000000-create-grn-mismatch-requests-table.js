'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('grn_mismatch_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      request_number: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
        comment: 'Format: GMR-YYYYMMDD-XXXXX (GRN Mismatch Request)'
      },
      grn_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'goods_receipt_notes',
          key: 'id'
        },
        comment: 'Reference to the GRN with mismatches'
      },
      purchase_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'purchase_orders',
          key: 'id'
        },
        comment: 'Reference to the Purchase Order'
      },
      grn_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'GRN number for quick reference'
      },
      po_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'PO number for quick reference'
      },
      vendor_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Vendor name'
      },
      mismatch_type: {
        type: Sequelize.ENUM('shortage', 'overage', 'both'),
        allowNull: false,
        comment: 'Type of mismatch detected'
      },
      mismatch_items: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of mismatched items'
      },
      total_shortage_items: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Count of items with shortages'
      },
      total_overage_items: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Count of items with overages'
      },
      total_shortage_value: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00,
        comment: 'Total value of shortage items'
      },
      total_overage_value: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00,
        comment: 'Total value of overage items'
      },
      request_description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Detailed description of mismatches and impact'
      },
      requested_action: {
        type: Sequelize.ENUM(
          'accept_shortage',
          'return_overage',
          'wait_for_remaining',
          'accept_and_adjust',
          'request_replacement',
          'cancel_remaining',
          'other'
        ),
        allowNull: false,
        comment: 'Action requested from Procurement team'
      },
      requested_action_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional notes about requested action'
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'acknowledged',
          'under_review',
          'approved',
          'rejected',
          'in_progress',
          'resolved',
          'cancelled'
        ),
        defaultValue: 'pending',
        comment: 'Current status of the mismatch request'
      },
      approval_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Approval/rejection notes from procurement team'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Inventory user who created the request'
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Procurement user who reviewed/approved'
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when reviewed/approved'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('grn_mismatch_requests', ['request_number']);
    await queryInterface.addIndex('grn_mismatch_requests', ['grn_id']);
    await queryInterface.addIndex('grn_mismatch_requests', ['purchase_order_id']);
    await queryInterface.addIndex('grn_mismatch_requests', ['po_number']);
    await queryInterface.addIndex('grn_mismatch_requests', ['grn_number']);
    await queryInterface.addIndex('grn_mismatch_requests', ['status']);
    await queryInterface.addIndex('grn_mismatch_requests', ['mismatch_type']);
    await queryInterface.addIndex('grn_mismatch_requests', ['requested_action']);
    await queryInterface.addIndex('grn_mismatch_requests', ['created_by']);
    await queryInterface.addIndex('grn_mismatch_requests', ['reviewed_by']);
    await queryInterface.addIndex('grn_mismatch_requests', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('grn_mismatch_requests');
  }
};
