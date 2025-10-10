const { sequelize } = require('./config/database');
const path = require('path');

async function runPOBarcodeMigration() {
  try {
    console.log('Connecting to database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Import the specific migration
    const migrationPath = path.join(__dirname, 'migrations', '20250120000000-add-barcode-to-purchase-orders.js');
    const migration = require(migrationPath);

    console.log('Running migration: add-barcode-to-purchase-orders...');

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

runPOBarcodeMigration();