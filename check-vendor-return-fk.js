require('dotenv').config({ path: './server/.env' });
const mysql = require('mysql2/promise');

async function checkVendorReturnFK() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'passion_erp'
  });

  try {
    console.log('🔍 Checking vendorreturn table structure...\n');

    // Check if table exists
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'vendorreturn'
    `);
    
    if (tables.length === 0) {
      console.log('❌ vendorreturn table does NOT exist');
      console.log('\n🔍 Checking for vendor_returns table...\n');
      const [altTables] = await connection.query(`SHOW TABLES LIKE 'vendor_returns'`);
      if (altTables.length > 0) {
        console.log('✅ Found vendor_returns table (with underscore)');
      }
      return;
    }
    
    console.log('✅ vendorreturn table exists\n');

    // Check foreign keys
    const [fks] = await connection.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'vendorreturn'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [process.env.DB_NAME]);

    console.log('📋 Foreign Key Constraints:\n');
    fks.forEach(fk => {
      console.log(`  ${fk.CONSTRAINT_NAME}:`);
      console.log(`    ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`);
    });

    // Check GRN table name
    console.log('\n🔍 Checking GRN table names...\n');
    const [grnTables] = await connection.query(`
      SHOW TABLES LIKE '%receipt%'
    `);
    
    if (grnTables.length > 0) {
      console.log('📋 Found GRN-related tables:');
      grnTables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  ✅ ${tableName}`);
      });
    }

    // Check if GRN table has any records
    const tableName = grnTables.length > 0 ? Object.values(grnTables[0])[0] : 'goodsreceiptnote';
    try {
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`\n📊 ${tableName} has ${count[0].count} records`);
    } catch (err) {
      console.log(`\n❌ Error querying ${tableName}:`, err.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkVendorReturnFK();