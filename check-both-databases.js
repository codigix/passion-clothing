const mysql = require('mysql2/promise');

async function checkBothDatabases() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root'
    });
    
    console.log('✅ Connected to MySQL\n');
    
    // Check passion_erp
    console.log('🔍 Checking database: passion_erp');
    try {
      await connection.query('USE passion_erp');
      const [tables1] = await connection.query("SHOW TABLES LIKE 'production_requests'");
      if (tables1.length > 0) {
        const [columns1] = await connection.query("SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'passion_erp' AND TABLE_NAME = 'production_requests'");
        console.log(`   ✅ production_requests exists (${columns1[0].count} columns)\n`);
      } else {
        console.log('   ❌ production_requests NOT found\n');
      }
    } catch (e) {
      console.log(`   ❌ Database passion_erp does not exist\n`);
    }
    
    // Check passion_erp
    console.log('🔍 Checking database: passion_erp (with h)');
    try {
      await connection.query('USE passion_erp');
      const [tables2] = await connection.query("SHOW TABLES LIKE 'production_requests'");
      if (tables2.length > 0) {
        const [columns2] = await connection.query("SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'passion_erp' AND TABLE_NAME = 'production_requests'");
        console.log(`   ✅ production_requests exists (${columns2[0].count} columns)\n`);
      } else {
        console.log('   ❌ production_requests NOT found\n');
      }
    } catch (e) {
      console.log(`   ❌ Database passion_erp does not exist\n`);
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBothDatabases();