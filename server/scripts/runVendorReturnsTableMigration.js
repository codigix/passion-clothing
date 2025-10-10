const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log
  }
);

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Import the migration
    const migration = require('../migrations/20250401000000-create-vendor-returns-table.js');
    const queryInterface = sequelize.getQueryInterface();

    console.log('\n📋 Running vendor_returns table creation migration...');
    await migration.up(queryInterface, Sequelize);
    console.log('✓ Migration completed successfully!');

    // Verify table was created
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'vendor_returns'");
    if (tables.length > 0) {
      console.log('\n✓ vendor_returns table confirmed in database');
      
      // Show table structure
      const [columns] = await sequelize.query('DESCRIBE vendor_returns');
      console.log('\nTable structure:');
      console.table(columns);
    } else {
      console.log('\n⚠️  Warning: Table not found after migration');
    }

    await sequelize.close();
    console.log('\n✓ All done!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();