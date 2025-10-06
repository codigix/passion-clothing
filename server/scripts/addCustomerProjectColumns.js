const { sequelize } = require('../config/database');

async function addColumns() {
  try {
    console.log('Adding customer_id and project_name columns to purchase_orders table...');
    
    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'passion_erp'}' 
        AND TABLE_NAME = 'purchase_orders' 
        AND COLUMN_NAME IN ('customer_id', 'project_name');
    `);
    
    const existingColumns = results.map(r => r.COLUMN_NAME);
    
    if (!existingColumns.includes('customer_id')) {
      console.log('Adding customer_id column...');
      await sequelize.query(`
        ALTER TABLE purchase_orders 
        ADD COLUMN customer_id INT NULL 
        COMMENT 'Customer for independent purchase orders';
      `);
      
      await sequelize.query(`
        ALTER TABLE purchase_orders 
        ADD CONSTRAINT fk_po_customer 
        FOREIGN KEY (customer_id) REFERENCES customers(id) 
        ON DELETE SET NULL ON UPDATE CASCADE;
      `);
      
      await sequelize.query(`
        CREATE INDEX idx_purchase_orders_customer_id ON purchase_orders(customer_id);
      `);
      
      console.log('✓ customer_id column added successfully');
    } else {
      console.log('✓ customer_id column already exists');
    }
    
    if (!existingColumns.includes('project_name')) {
      console.log('Adding project_name column...');
      await sequelize.query(`
        ALTER TABLE purchase_orders 
        ADD COLUMN project_name VARCHAR(200) NULL 
        COMMENT 'Project name for the purchase order';
      `);
      console.log('✓ project_name column added successfully');
    } else {
      console.log('✓ project_name column already exists');
    }
    
    console.log('\n✓ All columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
}

addColumns();