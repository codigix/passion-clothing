/**
 * Check existing database tables
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize } = require('../config/database');

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
      ORDER BY TABLE_NAME
    `);

    console.log(`📊 Found ${tables.length} tables in database '${process.env.DB_NAME}':\n`);
    
    const tableNames = tables.map(t => t.TABLE_NAME);
    tableNames.forEach(name => {
      console.log(`   - ${name}`);
    });

    // Check for specific tables needed for vendor returns
    console.log('\n🔍 Checking required tables for VendorReturn model:');
    const required = ['purchase_orders', 'goods_receipt_notes', 'vendors', 'users'];
    
    required.forEach(table => {
      if (tableNames.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - MISSING!`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();