const { sequelize } = require('../config/database');
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('🔧 Running migration to remove dispatch tracking columns...\n');

    // Create QueryInterface
    const queryInterface = sequelize.getQueryInterface();

    // Import the migration
    const migration = require('../migrations/20250320000000-remove-dispatch-tracking-columns');

    // Run the up method
    await migration.up(queryInterface, Sequelize);

    console.log('\n✅ Migration completed successfully!');
    console.log('📝 Removed columns:');
    console.log('   - dispatched_at');
    console.log('   - dispatch_tracking_number');
    console.log('   - dispatch_courier_name');
    console.log('   - dispatch_notes');
    console.log('   - expected_arrival_date');
    console.log('   - dispatched_by_user_id');
    console.log('\n⚠️  Please restart your server for changes to take effect.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();