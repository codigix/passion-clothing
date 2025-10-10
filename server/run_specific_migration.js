const { sequelize } = require('./config/database');
const path = require('path');

async function runSpecificMigration() {
  try {
    console.log('Connecting to database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Import the specific migration
    const migrationPath = path.join(__dirname, 'migrations', '20250129000000-add-project-stock-type-to-inventory.js');
    const migration = require(migrationPath);

    console.log('Running migration: add-project-stock-type-to-inventory...');

    // Run the up migration
    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);

    console.log('✅ Migration completed successfully');

  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runSpecificMigration();