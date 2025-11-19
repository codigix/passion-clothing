'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columns = await queryInterface.describeTable('purchase_orders', { transaction });

      // Add missing columns if they don't exist
      const addedColumns = [];

      if (!columns.po_pdf_path) {
        await queryInterface.addColumn('purchase_orders', 'po_pdf_path', {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: 'Path to generated PO PDF file'
        }, { transaction });
        addedColumns.push('po_pdf_path');
      }

      if (!columns.invoice_pdf_path) {
        await queryInterface.addColumn('purchase_orders', 'invoice_pdf_path', {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: 'Path to generated Invoice PDF file'
        }, { transaction });
        addedColumns.push('invoice_pdf_path');
      }

      if (!columns.po_pdf_generated_at) {
        await queryInterface.addColumn('purchase_orders', 'po_pdf_generated_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Timestamp when PO PDF was generated'
        }, { transaction });
        addedColumns.push('po_pdf_generated_at');
      }

      if (!columns.invoice_pdf_generated_at) {
        await queryInterface.addColumn('purchase_orders', 'invoice_pdf_generated_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Timestamp when Invoice PDF was generated'
        }, { transaction });
        addedColumns.push('invoice_pdf_generated_at');
      }

      if (!columns.accounting_notification_sent) {
        await queryInterface.addColumn('purchase_orders', 'accounting_notification_sent', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Flag to track if accounting department was notified with PDFs'
        }, { transaction });
        addedColumns.push('accounting_notification_sent');
      }

      if (!columns.accounting_notification_sent_at) {
        await queryInterface.addColumn('purchase_orders', 'accounting_notification_sent_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Timestamp when accounting department notification was sent'
        }, { transaction });
        addedColumns.push('accounting_notification_sent_at');
      }

      if (!columns.accounting_sent_by) {
        await queryInterface.addColumn('purchase_orders', 'accounting_sent_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          comment: 'User ID who sent notification to accounting'
        }, { transaction });
        addedColumns.push('accounting_sent_by');
      }

      if (!columns.pdf_generation_status) {
        await queryInterface.addColumn('purchase_orders', 'pdf_generation_status', {
          type: Sequelize.ENUM('pending', 'generating', 'completed', 'failed'),
          defaultValue: 'pending',
          comment: 'Current status of PDF generation'
        }, { transaction });
        addedColumns.push('pdf_generation_status');
      }

      if (!columns.pdf_error_message) {
        await queryInterface.addColumn('purchase_orders', 'pdf_error_message', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Error message if PDF generation fails'
        }, { transaction });
        addedColumns.push('pdf_error_message');
      }

      await transaction.commit();
      console.log('Migration completed. Added columns:', addedColumns);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columns = await queryInterface.describeTable('purchase_orders', { transaction });

      const columnsToRemove = [
        'po_pdf_path',
        'invoice_pdf_path',
        'po_pdf_generated_at',
        'invoice_pdf_generated_at',
        'accounting_notification_sent',
        'accounting_notification_sent_at',
        'accounting_sent_by',
        'pdf_generation_status',
        'pdf_error_message'
      ];

      for (const col of columnsToRemove) {
        if (columns[col]) {
          await queryInterface.removeColumn('purchase_orders', col, { transaction });
        }
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};