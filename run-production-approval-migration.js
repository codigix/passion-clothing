const { sequelize } = require('./server/config/database');
const migration = require('./server/migrations/add-production-approval-id-to-production-orders');

async function runMigration() {
  try {
    console.log('🔄 Running migration: add-production-approval-id-to-production-orders');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration completed successfully!');
    
    // Verify the column was added
    console.log('\n🔍 Verifying column exists...');
    const [columns] = await sequelize.query("DESCRIBE production_orders");
    const hasColumn = columns.some(c => c.Field === 'production_approval_id');
    
    if (hasColumn) {
      console.log('✅ production_approval_id column verified in database');
      const column = columns.find(c => c.Field === 'production_approval_id');
      console.log('   Type:', column.Type);
      console.log('   Null:', column.Null);
      console.log('   Key:', column.Key);
    } else {
      console.log('❌ Column not found! Migration may have failed.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

runMigration();