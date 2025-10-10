const { sequelize } = require('./config/database');
const { QueryInterface } = require('sequelize');
const migration = require('./migrations/20250129000000-fix-mrm-purchase-order-nullable');

(async () => {
  console.log('🚀 Running MRM Purchase Order Nullable Fix Migration...\n');
  
  try {
    const queryInterface = new QueryInterface(sequelize);
    
    await migration.up(queryInterface, require('sequelize').Sequelize);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - purchase_order_id now allows NULL');
    console.log('   - Manufacturing can create standalone MRNs without a PO');
    console.log('   - Procurement can still create PMRs linked to POs');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();