const { sequelize } = require('./server/config/database');
const migration = require('./server/migrations/20250201_add_in_progress_status_to_production_orders');

async function runMigration() {
  try {
    console.log('🔄 Starting migration: Add in_progress status to production_orders...\n');
    
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();