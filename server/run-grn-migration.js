const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log
  }
);

async function runGRNMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Connected to database');

    // Check if table exists
    const [tables] = await sequelize.query(
      "SHOW TABLES LIKE 'goods_receipt_notes'"
    );
    
    if (tables.length > 0) {
      console.log('✓ Table goods_receipt_notes already exists');
      process.exit(0);
    }

    console.log('\n📋 Creating goods_receipt_notes table...');

    // Create the table
    await sequelize.query(`
      CREATE TABLE goods_receipt_notes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        grn_number VARCHAR(255) NOT NULL UNIQUE,
        purchase_order_id INT NOT NULL,
        bill_of_materials_id INT NULL,
        sales_order_id INT NULL,
        received_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        supplier_name VARCHAR(255) NOT NULL,
        supplier_invoice_number VARCHAR(255) NULL,
        inward_challan_number VARCHAR(255) NULL,
        items_received JSON NOT NULL,
        total_received_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        status ENUM('draft', 'received', 'inspected', 'approved', 'rejected') DEFAULT 'draft',
        inspection_notes TEXT NULL,
        quality_inspector INT NULL,
        created_by INT NOT NULL,
        approved_by INT NULL,
        approval_date DATETIME NULL,
        remarks TEXT NULL,
        attachments JSON NULL,
        verification_status ENUM('pending', 'verified', 'discrepancy', 'approved', 'rejected') DEFAULT 'pending' NOT NULL,
        verified_by INT NULL,
        verification_date DATETIME NULL,
        verification_notes TEXT NULL,
        discrepancy_details JSON NULL,
        discrepancy_approved_by INT NULL,
        discrepancy_approval_date DATETIME NULL,
        discrepancy_approval_notes TEXT NULL,
        inventory_added BOOLEAN NOT NULL DEFAULT FALSE,
        inventory_added_date DATETIME NULL,
        vendor_revert_requested BOOLEAN NOT NULL DEFAULT FALSE,
        vendor_revert_reason TEXT NULL,
        vendor_revert_items JSON NULL,
        vendor_revert_requested_by INT NULL,
        vendor_revert_requested_date DATETIME NULL,
        vendor_response TEXT NULL,
        vendor_response_date DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
        FOREIGN KEY (quality_inspector) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id),
        FOREIGN KEY (verified_by) REFERENCES users(id),
        FOREIGN KEY (discrepancy_approved_by) REFERENCES users(id),
        FOREIGN KEY (vendor_revert_requested_by) REFERENCES users(id),
        
        INDEX idx_purchase_order_id (purchase_order_id),
        INDEX idx_bill_of_materials_id (bill_of_materials_id),
        INDEX idx_sales_order_id (sales_order_id),
        INDEX idx_status (status),
        INDEX idx_verification_status (verification_status),
        INDEX idx_grn_number (grn_number)
      )
    `);

    console.log('✓ Table goods_receipt_notes created successfully');

    // Insert into SequelizeMeta to mark migration as run
    await sequelize.query(`
      INSERT IGNORE INTO SequelizeMeta (name) 
      VALUES ('20250304000000-create-goods-receipt-notes-table.js')
    `);

    console.log('✓ Migration marked as complete');
    console.log('\n✅ GRN table creation complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runGRNMigration();