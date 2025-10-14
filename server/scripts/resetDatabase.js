const { sequelize } = require('../config/database');
const mysql = require('mysql2/promise');
require('dotenv').config();

const resetDatabase = async () => {
  let connection;
  
  try {
    console.log('🔄 Starting complete database reset...\n');

    // Create direct MySQL connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'passion_erp'
    });

    console.log('✅ Connected to MySQL database\n');

    // Disable foreign key checks
    console.log('⏸️  Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Foreign key checks disabled\n');

    // Get all tables
    console.log('📋 Fetching all tables...');
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log(`✅ Found ${tableNames.length} tables\n`);

    // Truncate all tables
    console.log('🗑️  Truncating all tables...');
    for (const tableName of tableNames) {
      try {
        await connection.query(`TRUNCATE TABLE \`${tableName}\``);
        console.log(`   ✓ Truncated: ${tableName}`);
      } catch (error) {
        console.log(`   ⚠️  Could not truncate ${tableName}: ${error.message}`);
      }
    }
    console.log('\n✅ All tables truncated\n');

    // Re-enable foreign key checks
    console.log('▶️  Re-enabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Foreign key checks enabled\n');

    await connection.end();
    console.log('✅ MySQL connection closed\n');

    // Now sync Sequelize models to ensure schema is correct
    console.log('🔄 Syncing Sequelize models...');
    await sequelize.sync({ alter: false });
    console.log('✅ Sequelize models synced\n');

    console.log('🎉 Database reset completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run seed scripts to populate data');
    console.log('   2. node server/scripts/seed.js');
    console.log('   3. node server/scripts/seedSampleData.js\n');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('✅ Reset script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Reset script failed:', error);
      process.exit(1);
    });
}

module.exports = resetDatabase;