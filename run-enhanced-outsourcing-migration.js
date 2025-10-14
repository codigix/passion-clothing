// Run the enhanced outsourcing migration
const db = require('./server/config/database');
const migration = require('./server/migrations/20250128_enhance_outsourcing_stage_operations');

async function runMigration() {
  try {
    console.log('🚀 Starting enhanced outsourcing migration...\n');
    
    await migration.up(db.sequelize.getQueryInterface(), db.Sequelize);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Verifying changes...');
    
    const [results] = await db.sequelize.query('DESCRIBE stage_operations');
    
    const newColumns = [
      'work_order_number',
      'expected_completion_date',
      'actual_completion_date',
      'design_files',
      'vendor_remarks',
      'outsourced_at',
      'received_at'
    ];
    
    console.log('\n🔍 New columns status:');
    newColumns.forEach(col => {
      const exists = results.find(r => r.Field === col);
      console.log(`  ${exists ? '✅' : '❌'} ${col}`);
    });
    
    // Check status enum
    const statusField = results.find(r => r.Field === 'status');
    console.log('\n📋 Status enum values:');
    console.log(`  ${statusField.Type}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigration();