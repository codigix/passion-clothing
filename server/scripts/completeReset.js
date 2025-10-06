const mysql = require('mysql2/promise');
const { sequelize } = require('../config/database');

async function completeReset() {
  let connection;
  try {
    console.log('🔄 Starting complete database reset...\n');

    // Connect to MySQL without selecting a database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'passion_erp';

    // Drop database if exists
    console.log(`🗑️  Dropping database '${dbName}' if it exists...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log('✅ Database dropped');

    // Create fresh database
    console.log(`🆕 Creating fresh database '${dbName}'...`);
    await connection.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database created');

    await connection.end();

    // Now use Sequelize to create all tables
    console.log('\n📊 Creating tables with Sequelize...');
    await sequelize.sync({ force: false });
    console.log('✅ All tables created successfully');

    console.log('\n✅ ✅ ✅ Database reset complete! ✅ ✅ ✅\n');

  } catch (error) {
    console.error('❌ Error during database reset:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
    await sequelize.close();
  }
}

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  completeReset();
}

module.exports = completeReset;