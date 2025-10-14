const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('User:', process.env.DB_USER || 'root');
    console.log('Database:', process.env.DB_NAME || 'passion_erp');

    // First connect without database to check if it exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root'
    });

    console.log('✓ Connected to MySQL server');

    // Check if database exists
    const [databases] = await connection.query('SHOW DATABASES');
    const dbName = process.env.DB_NAME || 'passion_erp';
    const dbExists = databases.some(db => db.Database === dbName);

    if (!dbExists) {
      console.log(`✗ Database '${dbName}' does not exist`);
      console.log(`Creating database '${dbName}'...`);
      await connection.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Database '${dbName}' created successfully`);
    } else {
      console.log(`✓ Database '${dbName}' exists`);
    }

    // Connect to the database
    await connection.changeUser({ database: dbName });
    
    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✓ Found ${tables.length} tables in database`);
    
    if (tables.length === 0) {
      console.log('⚠ Warning: Database is empty. You may need to run migrations.');
    } else {
      console.log('Sample tables:', tables.slice(0, 5).map(t => Object.values(t)[0]).join(', '));
    }

    await connection.end();
    console.log('\n✓ Database connection test successful!');
    return true;
  } catch (error) {
    console.error('\n✗ Database connection test failed:');
    console.error('Error:', error.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});