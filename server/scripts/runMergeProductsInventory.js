const { sequelize } = require('../config/database');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Starting Products → Inventory Migration...\n');

    // Import the migration
    const migration = require('../migrations/20250129000000-merge-products-into-inventory');

    console.log('📝 Running UP migration...');
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Product fields added to Inventory table');
    console.log('   - Existing products migrated to inventory');
    console.log('   - New indexes created');
    console.log('   - sales_order_id field added for project tracking');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Install frontend dependencies: npm install react-barcode --prefix client');
    console.log('   2. Install backend dependency: npm install bwip-js --prefix server');
    console.log('   3. Restart the server');
    console.log('   4. Test the new inventory features');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigration();