const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

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

async function fixInventorySchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get all existing columns
    const [existingColumns] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
        AND TABLE_NAME = 'inventory'
    `);

    const existingColumnNames = existingColumns.map(row => row.COLUMN_NAME);
    console.log(`\n📋 Found ${existingColumnNames.length} existing columns:`, existingColumnNames.join(', '));

    // Define all columns that should exist based on the model
    const requiredColumns = [
      { name: 'product_code', sql: 'ADD COLUMN product_code VARCHAR(50) NULL COMMENT "Unique product code"' },
      { name: 'product_name', sql: 'ADD COLUMN product_name VARCHAR(150) NOT NULL DEFAULT "Unnamed Product"' },
      { name: 'description', sql: 'ADD COLUMN description TEXT NULL' },
      { name: 'category', sql: `ADD COLUMN category ENUM('fabric', 'thread', 'button', 'zipper', 'elastic', 'lace', 'uniform', 'shirt', 'trouser', 'skirt', 'blazer', 'tie', 'belt', 'shoes', 'socks', 'accessories', 'raw_material', 'finished_goods') NULL DEFAULT 'raw_material'` },
      { name: 'sub_category', sql: 'ADD COLUMN sub_category VARCHAR(100) NULL' },
      { name: 'product_type', sql: `ADD COLUMN product_type ENUM('raw_material', 'semi_finished', 'finished_goods', 'accessory') NULL DEFAULT 'raw_material'` },
      { name: 'unit_of_measurement', sql: `ADD COLUMN unit_of_measurement ENUM('piece', 'meter', 'yard', 'kg', 'gram', 'liter', 'dozen', 'set') NULL DEFAULT 'piece'` },
      { name: 'hsn_code', sql: 'ADD COLUMN hsn_code VARCHAR(10) NULL' },
      { name: 'brand', sql: 'ADD COLUMN brand VARCHAR(100) NULL' },
      { name: 'color', sql: 'ADD COLUMN color VARCHAR(50) NULL' },
      { name: 'size', sql: 'ADD COLUMN size VARCHAR(20) NULL' },
      { name: 'material', sql: 'ADD COLUMN material VARCHAR(100) NULL' },
      { name: 'specifications', sql: 'ADD COLUMN specifications JSON NULL COMMENT "Detailed specifications like dimensions, weight, etc."' },
      { name: 'images', sql: 'ADD COLUMN images JSON NULL COMMENT "Array of image URLs"' },
      { name: 'cost_price', sql: 'ADD COLUMN cost_price DECIMAL(10, 2) DEFAULT 0.00' },
      { name: 'selling_price', sql: 'ADD COLUMN selling_price DECIMAL(10, 2) DEFAULT 0.00' },
      { name: 'mrp', sql: 'ADD COLUMN mrp DECIMAL(10, 2) DEFAULT 0.00' },
      { name: 'tax_percentage', sql: 'ADD COLUMN tax_percentage DECIMAL(5, 2) DEFAULT 0.00' },
      { name: 'weight', sql: 'ADD COLUMN weight DECIMAL(8, 3) NULL COMMENT "Weight in kg"' },
      { name: 'dimensions', sql: 'ADD COLUMN dimensions JSON NULL COMMENT "Length, width, height in cm"' },
      { name: 'is_serialized', sql: 'ADD COLUMN is_serialized BOOLEAN DEFAULT false' },
      { name: 'is_batch_tracked', sql: 'ADD COLUMN is_batch_tracked BOOLEAN DEFAULT false' },
      { name: 'quality_parameters', sql: 'ADD COLUMN quality_parameters JSON NULL COMMENT "Quality check parameters for this product"' },
      { name: 'stock_type', sql: `ADD COLUMN stock_type ENUM('project_specific', 'general_extra', 'consignment', 'returned') DEFAULT 'general_extra' COMMENT 'Type of stock for better categorization and tracking'` },
      { name: 'po_item_index', sql: 'ADD COLUMN po_item_index INT NULL COMMENT "Index of item in PO items array"' },
      { name: 'initial_quantity', sql: 'ADD COLUMN initial_quantity DECIMAL(10, 2) NULL DEFAULT 0 COMMENT "Initial quantity from PO"' },
      { name: 'consumed_quantity', sql: 'ADD COLUMN consumed_quantity DECIMAL(10, 2) NULL DEFAULT 0 COMMENT "Quantity consumed/used"' },
      { name: 'reserved_stock', sql: 'ADD COLUMN reserved_stock DECIMAL(10, 2) DEFAULT 0 COMMENT "Stock reserved for orders"' },
      { name: 'available_stock', sql: 'ADD COLUMN available_stock DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT "current_stock - reserved_stock"' },
      { name: 'minimum_level', sql: 'ADD COLUMN minimum_level DECIMAL(10, 2) DEFAULT 0' },
      { name: 'maximum_level', sql: 'ADD COLUMN maximum_level DECIMAL(10, 2) DEFAULT 0' },
      { name: 'reorder_level', sql: 'ADD COLUMN reorder_level DECIMAL(10, 2) DEFAULT 0' },
      { name: 'unit_cost', sql: 'ADD COLUMN unit_cost DECIMAL(10, 2) DEFAULT 0.00' },
      { name: 'total_value', sql: 'ADD COLUMN total_value DECIMAL(12, 2) DEFAULT 0.00 COMMENT "current_stock * unit_cost"' },
      { name: 'last_purchase_date', sql: 'ADD COLUMN last_purchase_date DATETIME NULL' },
      { name: 'last_issue_date', sql: 'ADD COLUMN last_issue_date DATETIME NULL' },
      { name: 'expiry_date', sql: 'ADD COLUMN expiry_date DATETIME NULL' },
      { name: 'manufacturing_date', sql: 'ADD COLUMN manufacturing_date DATETIME NULL' },
      { name: 'quality_status', sql: `ADD COLUMN quality_status ENUM('approved', 'pending', 'rejected', 'quarantine') DEFAULT 'approved'` },
      { name: 'condition', sql: `ADD COLUMN \`condition\` ENUM('new', 'good', 'fair', 'damaged', 'obsolete') DEFAULT 'new'` },
      { name: 'barcode', sql: 'ADD COLUMN barcode VARCHAR(200) NULL' },
      { name: 'qr_code', sql: 'ADD COLUMN qr_code TEXT NULL' },
      { name: 'is_active', sql: 'ADD COLUMN is_active BOOLEAN DEFAULT true' },
      { name: 'last_audit_date', sql: 'ADD COLUMN last_audit_date DATETIME NULL' },
      { name: 'audit_variance', sql: 'ADD COLUMN audit_variance DECIMAL(10, 2) DEFAULT 0 COMMENT "Difference found during last audit"' },
      { name: 'movement_type', sql: `ADD COLUMN movement_type ENUM('inward', 'outward', 'transfer', 'adjustment') NULL COMMENT 'Last movement type'` },
      { name: 'last_movement_date', sql: 'ADD COLUMN last_movement_date DATETIME NULL' },
      { name: 'project_id', sql: 'ADD COLUMN project_id INT NULL COMMENT "Project this stock belongs to (null means general/extra stock)"' },
      { name: 'sales_order_id', sql: 'ADD COLUMN sales_order_id INT NULL COMMENT "Link to Sales Order (project)"' },
      { name: 'created_by', sql: 'ADD COLUMN created_by INT NOT NULL' },
      { name: 'updated_by', sql: 'ADD COLUMN updated_by INT NULL' }
    ];

    console.log('\n🔍 Checking for missing columns...\n');
    
    const missingColumns = [];
    for (const col of requiredColumns) {
      if (!existingColumnNames.includes(col.name)) {
        missingColumns.push(col);
        console.log(`❌ Missing: ${col.name}`);
      } else {
        console.log(`✅ Exists: ${col.name}`);
      }
    }

    if (missingColumns.length === 0) {
      console.log('\n✅ All columns exist!');
      return;
    }

    console.log(`\n⚠️ Found ${missingColumns.length} missing columns. Adding them now...\n`);

    // Add missing columns
    for (const col of missingColumns) {
      try {
        const alterSql = `ALTER TABLE inventory ${col.sql}`;
        console.log(`Adding: ${col.name}...`);
        await sequelize.query(alterSql);
        console.log(`✅ Added: ${col.name}`);
      } catch (error) {
        console.error(`❌ Error adding ${col.name}:`, error.message);
      }
    }

    // Add indexes for important columns
    console.log('\n🔍 Adding indexes...\n');
    
    const indexes = [
      { name: 'idx_product_code', sql: 'CREATE INDEX idx_product_code ON inventory(product_code)' },
      { name: 'idx_product_name', sql: 'CREATE INDEX idx_product_name ON inventory(product_name)' },
      { name: 'idx_category', sql: 'CREATE INDEX idx_category ON inventory(category)' },
      { name: 'idx_stock_type', sql: 'CREATE INDEX idx_stock_type ON inventory(stock_type)' },
      { name: 'idx_project_id', sql: 'CREATE INDEX idx_project_id ON inventory(project_id)' },
      { name: 'idx_sales_order_id', sql: 'CREATE INDEX idx_sales_order_id ON inventory(sales_order_id)' }
    ];

    for (const idx of indexes) {
      try {
        await sequelize.query(idx.sql);
        console.log(`✅ Added index: ${idx.name}`);
      } catch (error) {
        if (error.message.includes('Duplicate key name')) {
          console.log(`⏭️ Index already exists: ${idx.name}`);
        } else {
          console.error(`❌ Error adding index ${idx.name}:`, error.message);
        }
      }
    }

    // Add foreign keys
    console.log('\n🔍 Adding foreign keys...\n');
    
    const foreignKeys = [
      { 
        name: 'fk_inventory_sales_order',
        sql: 'ALTER TABLE inventory ADD CONSTRAINT fk_inventory_sales_order FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL'
      },
      {
        name: 'fk_inventory_created_by',
        sql: 'ALTER TABLE inventory ADD CONSTRAINT fk_inventory_created_by FOREIGN KEY (created_by) REFERENCES users(id)'
      },
      {
        name: 'fk_inventory_updated_by',
        sql: 'ALTER TABLE inventory ADD CONSTRAINT fk_inventory_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)'
      }
    ];

    for (const fk of foreignKeys) {
      try {
        await sequelize.query(fk.sql);
        console.log(`✅ Added foreign key: ${fk.name}`);
      } catch (error) {
        if (error.message.includes('Duplicate foreign key')) {
          console.log(`⏭️ Foreign key already exists: ${fk.name}`);
        } else {
          console.error(`❌ Error adding foreign key ${fk.name}:`, error.message);
        }
      }
    }

    console.log('\n✅ Schema fix complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

fixInventorySchema();