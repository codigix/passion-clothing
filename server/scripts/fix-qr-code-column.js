const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function fixQRCodeColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'passion_erp'
  });

  try {
    console.log('🔧 Expanding qr_code and barcode columns in inventory table...\n');

    // Expand qr_code to TEXT (can hold large JSON strings)
    await connection.query(`
      ALTER TABLE inventory 
      MODIFY COLUMN qr_code TEXT NULL
    `);
    console.log('✅ qr_code column expanded to TEXT');

    // Also expand barcode just to be safe
    await connection.query(`
      ALTER TABLE inventory 
      MODIFY COLUMN barcode VARCHAR(200) NULL
    `);
    console.log('✅ barcode column expanded to VARCHAR(200)');

    // Verify the changes
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM inventory WHERE Field IN ('qr_code', 'barcode')
    `);
    
    console.log('\n📋 Updated column definitions:');
    columns.forEach(col => console.log(col));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

fixQRCodeColumn()
  .then(() => {
    console.log('\n✅ Database fix completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });