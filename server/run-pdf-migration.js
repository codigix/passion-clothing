const { Sequelize } = require('sequelize');
const config = require('./config/config.js');

async function runMigration() {
  const sequelize = new Sequelize(config.development);
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('Running PDF tracking migration...');
    
    // Add all the PDF tracking columns
    await queryInterface.addColumn('purchase_orders', 'po_pdf_path', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Path to generated PO PDF file'
    }).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('✓ po_pdf_path already exists');
      } else throw err;
    });

    await queryInterface.addColumn('purchase_orders', 'invoice_pdf_path', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Path to generated Invoice PDF file'
    }).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('✓ invoice_pdf_path already exists');
      } else throw err;
    });

    await queryInterface.addColumn('purchase_orders', 'po_pdf_generated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when PO PDF was generated'
    }).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('✓ po_pdf_generated_at already exists');
      } else throw err;
    });

    await queryInterface.addColumn('purchase_orders', 'invoice_pdf_generated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when Invoice PDF was generated'
    }).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('✓ invoice_pdf_generated_at already exists');
      } else throw err;
    });

    await queryInterface.addColumn('purchase_orders', 'accounting_notification_sent', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Flag to track if accounting department was notified with PDFs'
    }).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('✓ accounting_notification_sent already exists');
      } else throw err;
    });

    await queryInterface.addColumn('purchase_orders', 'accounting_notification_sent_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when accounting department notification was sent'
    }).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('✓ accounting_notification_sent_at already exists');
      } else throw err;
    });

    await queryInterface.addColumn('purchase_orders', 'accounting_sent_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User ID who sent notification to accounting'
    }).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('✓ accounting_sent_by already exists');
      } else throw err;
    });

    await queryInterface.addColumn('purchase_orders', 'pdf_generation_status', {
      type: Sequelize.ENUM('pending', 'generating', 'completed', 'failed'),
      defaultValue: 'pending',
      comment: 'Current status of PDF generation'
    }).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('✓ pdf_generation_status already exists');
      } else throw err;
    });

    await queryInterface.addColumn('purchase_orders', 'pdf_error_message', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Error message if PDF generation fails'
    }).catch(err => {
      if (err.message.includes('Duplicate column')) {
        console.log('✓ pdf_error_message already exists');
      } else throw err;
    });

    // Add indexes
    await queryInterface.addIndex('purchase_orders', {
      fields: ['accounting_notification_sent'],
      name: 'idx_purchase_orders_accounting_notification'
    }).catch(err => {
      if (err.message.includes('Duplicate') || err.message.includes('already exists')) {
        console.log('✓ Index idx_purchase_orders_accounting_notification already exists');
      } else throw err;
    });

    await queryInterface.addIndex('purchase_orders', {
      fields: ['pdf_generation_status'],
      name: 'idx_purchase_orders_pdf_status'
    }).catch(err => {
      if (err.message.includes('Duplicate') || err.message.includes('already exists')) {
        console.log('✓ Index idx_purchase_orders_pdf_status already exists');
      } else throw err;
    });

    console.log('✅ PDF tracking migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigration();