const { sequelize } = require('./config/database');
const path = require('path');

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const migrationPath = path.join(__dirname, 'migrations', '20251119000002-fix-challan-order-id-constraint.js');
    const migration = require(migrationPath);

    console.log('Running migration: fix-challan-order-id-constraint...');
    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigration();
