const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function fixProductIdColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'passion_erp'
  });

  try {
    console.log('🔧 Making product_id nullable in inventory table...\n');

    // Modify product_id to allow NULL
    await connection.query(`
      ALTER TABLE inventory 
      MODIFY COLUMN product_id INT NULL
    `);

    console.log('✅ product_id column is now nullable');

    // Verify the change
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM inventory WHERE Field = 'product_id'
    `);
    
    console.log('\n📋 Current product_id column definition:');
    console.log(columns[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

fixProductIdColumn()
  .then(() => {
    console.log('\n✅ Database fix completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });