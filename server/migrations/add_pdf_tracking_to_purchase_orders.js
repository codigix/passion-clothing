'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('purchase_orders', 'po_pdf_path', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Path to generated PO PDF file'
    });

    await queryInterface.addColumn('purchase_orders', 'invoice_pdf_path', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Path to generated Invoice PDF file'
    });

    await queryInterface.addColumn('purchase_orders', 'po_pdf_generated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when PO PDF was generated'
    });

    await queryInterface.addColumn('purchase_orders', 'invoice_pdf_generated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when Invoice PDF was generated'
    });

    await queryInterface.addColumn('purchase_orders', 'accounting_notification_sent', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Flag to track if accounting department was notified with PDFs'
    });

    await queryInterface.addColumn('purchase_orders', 'accounting_notification_sent_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when accounting department notification was sent'
    });

    await queryInterface.addColumn('purchase_orders', 'accounting_sent_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User ID who sent notification to accounting'
    });

    await queryInterface.addColumn('purchase_orders', 'pdf_generation_status', {
      type: Sequelize.ENUM('pending', 'generating', 'completed', 'failed'),
      defaultValue: 'pending',
      comment: 'Current status of PDF generation'
    });

    await queryInterface.addColumn('purchase_orders', 'pdf_error_message', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Error message if PDF generation fails'
    });

    // Create index for accounting notifications
    await queryInterface.addIndex('purchase_orders', {
      fields: ['accounting_notification_sent'],
      name: 'idx_purchase_orders_accounting_notification'
    });

    await queryInterface.addIndex('purchase_orders', {
      fields: ['pdf_generation_status'],
      name: 'idx_purchase_orders_pdf_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('purchase_orders', 'idx_purchase_orders_accounting_notification');
    await queryInterface.removeIndex('purchase_orders', 'idx_purchase_orders_pdf_status');
    
    await queryInterface.removeColumn('purchase_orders', 'po_pdf_path');
    await queryInterface.removeColumn('purchase_orders', 'invoice_pdf_path');
    await queryInterface.removeColumn('purchase_orders', 'po_pdf_generated_at');
    await queryInterface.removeColumn('purchase_orders', 'invoice_pdf_generated_at');
    await queryInterface.removeColumn('purchase_orders', 'accounting_notification_sent');
    await queryInterface.removeColumn('purchase_orders', 'accounting_notification_sent_at');
    await queryInterface.removeColumn('purchase_orders', 'accounting_sent_by');
    await queryInterface.removeColumn('purchase_orders', 'pdf_generation_status');
    await queryInterface.removeColumn('purchase_orders', 'pdf_error_message');
  }
};