const { sequelize } = require('../config/database');
const path = require('path');

const runMigration = async (migrationFile) => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.');

    // If migration file is provided as argument, use it; otherwise use default
    const migrationPath = migrationFile 
      ? path.join(__dirname, '../migrations', migrationFile)
      : path.join(__dirname, '../migrations/20250305000000-add-grn-vendor-revert-fields');
    
    const migration = require(migrationPath);
    const migrationName = migrationFile || '20250305000000-add-grn-vendor-revert-fields';
    
    console.log(`Running migration: ${migrationName}...`);
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
  // Get migration file from command line arguments
  const migrationFile = process.argv[2];
  
  runMigration(migrationFile).then(() => {
    if (!process.exitCode) {
      console.log('Migration run complete.');
    }
  });
}

module.exports = runMigration;