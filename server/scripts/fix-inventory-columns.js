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

async function addInventoryColumns() {
  console.log('🔧 Adding missing columns to inventory table...\n');

  try {
    // Check if columns exist first
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM inventory LIKE 'purchase_order_id'
    `);

    if (columns.length === 0) {
      console.log('✅ Adding purchase_order_id column...');
      await sequelize.query(`
        ALTER TABLE inventory
        ADD COLUMN purchase_order_id INT NULL,
        ADD CONSTRAINT fk_inventory_purchase_order
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
        ON UPDATE CASCADE ON DELETE SET NULL
      `);
    } else {
      console.log('⏭️  purchase_order_id column already exists');
    }

    // Add po_item_index
    const [poItemIndex] = await sequelize.query(`
      SHOW COLUMNS FROM inventory LIKE 'po_item_index'
    `);

    if (poItemIndex.length === 0) {
      console.log('✅ Adding po_item_index column...');
      await sequelize.query(`
        ALTER TABLE inventory
        ADD COLUMN po_item_index INT NULL COMMENT 'Index of item in PO items array'
      `);
    } else {
      console.log('⏭️  po_item_index column already exists');
    }

    // Add initial_quantity
    const [initialQty] = await sequelize.query(`
      SHOW COLUMNS FROM inventory LIKE 'initial_quantity'
    `);

    if (initialQty.length === 0) {
      console.log('✅ Adding initial_quantity column...');
      await sequelize.query(`
        ALTER TABLE inventory
        ADD COLUMN initial_quantity DECIMAL(10,2) NULL DEFAULT 0 COMMENT 'Initial quantity from PO'
      `);
    } else {
      console.log('⏭️  initial_quantity column already exists');
    }

    // Add consumed_quantity
    const [consumedQty] = await sequelize.query(`
      SHOW COLUMNS FROM inventory LIKE 'consumed_quantity'
    `);

    if (consumedQty.length === 0) {
      console.log('✅ Adding consumed_quantity column...');
      await sequelize.query(`
        ALTER TABLE inventory
        ADD COLUMN consumed_quantity DECIMAL(10,2) NULL DEFAULT 0 COMMENT 'Quantity consumed/used'
      `);
    } else {
      console.log('⏭️  consumed_quantity column already exists');
    }

    // Add index if it doesn't exist
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM inventory WHERE Key_name = 'purchase_order_id'
    `);

    if (indexes.length === 0) {
      console.log('✅ Adding index on purchase_order_id...');
      await sequelize.query(`
        ALTER TABLE inventory ADD INDEX purchase_order_id (purchase_order_id)
      `);
    } else {
      console.log('⏭️  Index on purchase_order_id already exists');
    }

    // Check if inventory_movements table exists
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'inventory_movements'
    `);

    if (tables.length === 0) {
      console.log('✅ Creating inventory_movements table...');
      await sequelize.query(`
        CREATE TABLE inventory_movements (
          id INT PRIMARY KEY AUTO_INCREMENT,
          inventory_id INT NOT NULL,
          purchase_order_id INT NULL,
          sales_order_id INT NULL,
          production_order_id INT NULL,
          movement_type ENUM('inward', 'outward', 'transfer', 'adjustment', 'return', 'consume') NOT NULL,
          quantity DECIMAL(10,2) NOT NULL,
          previous_quantity DECIMAL(10,2) NOT NULL,
          new_quantity DECIMAL(10,2) NOT NULL,
          unit_cost DECIMAL(10,2) NULL,
          total_cost DECIMAL(12,2) NULL,
          reference_number VARCHAR(100) NULL,
          notes TEXT NULL,
          location_from VARCHAR(100) NULL,
          location_to VARCHAR(100) NULL,
          performed_by INT NOT NULL,
          movement_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          metadata JSON NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
          FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL,
          FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE SET NULL,
          FOREIGN KEY (performed_by) REFERENCES users(id),
          INDEX idx_inventory_id (inventory_id),
          INDEX idx_purchase_order_id (purchase_order_id),
          INDEX idx_sales_order_id (sales_order_id),
          INDEX idx_movement_type (movement_type),
          INDEX idx_movement_date (movement_date)
        )
      `);
    } else {
      console.log('⏭️  inventory_movements table already exists');
    }

    console.log('\n🎉 Database schema update completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addInventoryColumns();