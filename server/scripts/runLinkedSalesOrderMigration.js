const { sequelize } = require('../config/database');
const migration = require('../migrations/20251003111000-add-linked-sales-order-id-to-purchase-orders');

const runMigration = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.');

    console.log('Running migration: add-linked-sales-order-id-to-purchase-orders...');
    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  runMigration().then(() => {
    if (!process.exitCode) {
      console.log('Migration run complete.');
    }
  });
}

module.exports = runMigration;