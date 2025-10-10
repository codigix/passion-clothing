const { sequelize } = require('../config/database');
const migration = require('../migrations/20250306000000-add-dispatch-tracking-to-pos');

const runMigration = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.');

    console.log('Running migration: add-dispatch-tracking-to-pos...');
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