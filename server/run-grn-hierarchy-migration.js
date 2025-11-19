require('dotenv').config();
const db = require('./config/database');
const { Sequelize } = require('sequelize');
const migration = require('./migrations/20251112000000-add-grn-hierarchy-fields');

async function runMigration() {
  try {
    console.log('Starting GRN Hierarchy Migration...');
    const sequelize = db.sequelize;
    const queryInterface = sequelize.getQueryInterface();
    
    await migration.up(queryInterface, Sequelize);
    console.log('✅ Migration completed successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    const sequelize = db.sequelize;
    await sequelize.close();
    process.exit(1);
  }
}

runMigration();
