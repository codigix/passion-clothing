const db = require('./server/config/database');
const migration = require('./server/migrations/20250128_add_outsourcing_to_stage_operations');

async function runMigration() {
  try {
    console.log('🔄 Running outsourcing migration for stage_operations...');
    
    await migration.up(db.sequelize.getQueryInterface(), db.Sequelize);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 New features added:');
    console.log('  • Outsourcing support for production stage operations');
    console.log('  • Vendor assignment for printing/embroidery stages');
    console.log('  • Work order number tracking');
    console.log('  • Design file attachments support');
    console.log('  • Expected/actual completion dates');
    console.log('  • Outsourcing cost tracking');
    console.log('  • New statuses: outsourced, received');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();