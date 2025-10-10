const { Sequelize } = require('sequelize');
require('dotenv').config();

async function fixInventorySchema() {
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'passion_erp',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: console.log
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if sales_order_id column exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'passion_erp'}' 
        AND TABLE_NAME = 'inventory' 
        AND COLUMN_NAME = 'sales_order_id'
    `);

    if (results.length > 0) {
      console.log('✅ Column sales_order_id already exists in inventory table');
    } else {
      console.log('❌ Column sales_order_id NOT found. Adding it now...');
      
      // Add the column
      await sequelize.query(`
        ALTER TABLE inventory 
        ADD COLUMN sales_order_id INT NULL 
        COMMENT 'Link to Sales Order (project)'
      `);
      
      // Add foreign key (check if it doesn't exist first)
      try {
        await sequelize.query(`
          ALTER TABLE inventory 
          ADD CONSTRAINT fk_inventory_sales_order 
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id)
        `);
        console.log('✅ Added foreign key constraint');
      } catch (fkError) {
        if (fkError.message.includes('already exists')) {
          console.log('ℹ️  Foreign key already exists');
        } else {
          throw fkError;
        }
      }
      
      // Add index
      try {
        await sequelize.query(`
          CREATE INDEX inventory_sales_order_id_idx 
          ON inventory(sales_order_id)
        `);
        console.log('✅ Added index on sales_order_id');
      } catch (idxError) {
        if (idxError.message.includes('already exists') || idxError.message.includes('Duplicate key')) {
          console.log('ℹ️  Index already exists');
        } else {
          throw idxError;
        }
      }
      
      console.log('✅ Successfully added sales_order_id column to inventory table');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixInventorySchema();