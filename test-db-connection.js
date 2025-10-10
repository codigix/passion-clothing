const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root'
    });
    
    console.log('✅ Connected to MySQL');
    console.log(`\n🔍 Config from .env:`);
    console.log(`   DB_NAME: ${process.env.DB_NAME}`);
    console.log(`   DB_HOST: ${process.env.DB_HOST}`);
    console.log(`   DB_USER: ${process.env.DB_USER}`);
    
    // List all databases
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('\n📊 Available Databases:');
    databases.forEach(db => {
      console.log(`   - ${db.Database}`);
    });
    
    // Check if passion_erp database exists
    const dbName = process.env.DB_NAME || 'passion_erp';
    const [dbCheck] = await connection.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [dbName]
    );
    
    if (dbCheck.length === 0) {
      console.log(`\n❌ Database '${dbName}' does NOT exist!`);
      await connection.end();
      return;
    }
    
    console.log(`\n✅ Database '${dbName}' exists`);
    
    // Switch to the database
    await connection.query(`USE ${dbName}`);
    
    // Check if production_requests table exists
    const [tables] = await connection.query(
      `SHOW TABLES LIKE 'production_requests'`
    );
    
    if (tables.length === 0) {
      console.log(`\n❌ Table 'production_requests' does NOT exist in database '${dbName}'!`);
      
      // List all tables in the database
      const [allTables] = await connection.query('SHOW TABLES');
      console.log(`\n📋 Available tables in '${dbName}':`);
      allTables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    } else {
      console.log(`\n✅ Table 'production_requests' EXISTS in database '${dbName}'`);
      
      // Get column count
      const [columns] = await connection.query(
        `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'production_requests'`,
        [dbName]
      );
      console.log(`   Columns: ${columns[0].count}`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();