'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns for enhanced sales order functionality
    await queryInterface.addColumn('sales_orders', 'advance_paid', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Advance payment received from customer'
    });

    await queryInterface.addColumn('sales_orders', 'balance_amount', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Remaining balance to be paid'
    });

    await queryInterface.addColumn('sales_orders', 'invoice_status', {
      type: Sequelize.ENUM('pending', 'generated', 'sent', 'paid', 'overdue'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Invoice generation and payment status'
    });

    await queryInterface.addColumn('sales_orders', 'challan_status', {
      type: Sequelize.ENUM('pending', 'created', 'dispatched', 'delivered'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Delivery challan status'
    });

    await queryInterface.addColumn('sales_orders', 'procurement_status', {
      type: Sequelize.ENUM('not_requested', 'requested', 'po_created', 'materials_ordered', 'materials_received', 'completed'),
      allowNull: false,
      defaultValue: 'not_requested',
      comment: 'Procurement workflow status'
    });

    await queryInterface.addColumn('sales_orders', 'design_files', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of uploaded design/logo/artwork files'
    });

    await queryInterface.addColumn('sales_orders', 'invoice_number', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Generated invoice number'
    });

    await queryInterface.addColumn('sales_orders', 'invoice_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Invoice generation date'
    });

    // Add indexes for new columns
    await queryInterface.addIndex('sales_orders', ['invoice_status']);
    await queryInterface.addIndex('sales_orders', ['challan_status']);
    await queryInterface.addIndex('sales_orders', ['procurement_status']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('sales_orders', ['procurement_status']);
    await queryInterface.removeIndex('sales_orders', ['challan_status']);
    await queryInterface.removeIndex('sales_orders', ['invoice_status']);

    // Remove columns
    await queryInterface.removeColumn('sales_orders', 'invoice_date');
    await queryInterface.removeColumn('sales_orders', 'invoice_number');
    await queryInterface.removeColumn('sales_orders', 'design_files');
    await queryInterface.removeColumn('sales_orders', 'procurement_status');
    await queryInterface.removeColumn('sales_orders', 'challan_status');
    await queryInterface.removeColumn('sales_orders', 'invoice_status');
    await queryInterface.removeColumn('sales_orders', 'balance_amount');
    await queryInterface.removeColumn('sales_orders', 'advance_paid');
  }
};