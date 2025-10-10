const { sequelize } = require('../config/database');
const migration = require('../migrations/20250304000000-create-goods-receipt-notes-table');

const runMigration = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.');

    console.log('Running migration: create-goods-receipt-notes-table...');
    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
    console.log('Migration completed successfully.');
    
    console.log('\nGRN table created! You can now use the GRN workflow.');
  } catch (error) {
    console.error('Error running migration:', error);
    if (error.original?.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('\nNote: Table already exists. Migration skipped.');
    }
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  runMigration().then(() => {
    if (!process.exitCode) {
      console.log('\n✅ Migration run complete.');
    }
  });
}

module.exports = runMigration;