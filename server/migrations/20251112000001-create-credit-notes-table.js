'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('credit_notes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      credit_note_number: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
      },
      grn_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'goods_receipt_notes',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      purchase_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'purchase_orders',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vendors',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      credit_note_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      credit_note_type: {
        type: Sequelize.ENUM('full_return', 'partial_credit', 'adjustment'),
        allowNull: false,
        defaultValue: 'partial_credit'
      },
      items: {
        type: Sequelize.JSON,
        allowNull: false
      },
      subtotal_credit_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      tax_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      total_credit_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'issued', 'accepted', 'rejected', 'settled', 'cancelled'),
        defaultValue: 'draft'
      },
      settlement_method: {
        type: Sequelize.ENUM('cash_credit', 'return_material', 'adjust_invoice', 'future_deduction'),
        allowNull: true
      },
      settlement_status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      settlement_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      settlement_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      vendor_response: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      vendor_response_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      issued_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      issued_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      approved_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true
      },
      pdf_path: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      invoice_adjustment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'invoices',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('credit_notes', ['credit_note_number']);
    await queryInterface.addIndex('credit_notes', ['grn_id']);
    await queryInterface.addIndex('credit_notes', ['purchase_order_id']);
    await queryInterface.addIndex('credit_notes', ['vendor_id']);
    await queryInterface.addIndex('credit_notes', ['status']);
    await queryInterface.addIndex('credit_notes', ['settlement_status']);
    await queryInterface.addIndex('credit_notes', ['credit_note_date']);
    await queryInterface.addIndex('credit_notes', ['created_by']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('credit_notes');
  }
};
