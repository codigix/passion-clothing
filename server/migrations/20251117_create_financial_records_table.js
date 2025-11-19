'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('financial_records', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'invoices',
          key: 'id'
        }
      },
      sales_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      record_number: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      record_type: {
        type: Sequelize.ENUM('debit', 'credit', 'journal_entry'),
        defaultValue: 'debit'
      },
      account_head: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      project_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      department: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'recorded', 'approved', 'rejected'),
        defaultValue: 'recorded'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      recorded_by_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      recorded_by_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      recorded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      approved_by_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      approved_by_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('financial_records', ['invoice_id']);
    await queryInterface.addIndex('financial_records', ['sales_order_id']);
    await queryInterface.addIndex('financial_records', ['record_number']);
    await queryInterface.addIndex('financial_records', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('financial_records');
  }
};
