const { sequelize } = require('../config/database');

// Import models as functions and initialize them
const ProductLifecycleModel = require('../models/ProductLifecycle');
const ProductLifecycleHistoryModel = require('../models/ProductLifecycleHistory');

const ProductLifecycle = ProductLifecycleModel(sequelize);
const ProductLifecycleHistory = ProductLifecycleHistoryModel(sequelize);

async function testTables() {
  try {
    console.log('Testing ProductLifecycle and ProductLifecycleHistory tables...');
    
    // Test if tables exist by trying to sync them
    await ProductLifecycle.sync({ alter: true });
    await ProductLifecycleHistory.sync({ alter: true });
    
    console.log('✅ ProductLifecycle table synced successfully');
    console.log('✅ ProductLifecycleHistory table synced successfully');
    
    // Test basic operations
    const testLifecycle = await ProductLifecycle.create({
      product_id: 1,
      barcode: 'TEST_' + Date.now(),
      current_stage: 'created',
      status: 'active',
      location: 'warehouse',
      created_by: 1
    });
    
    console.log('✅ Test ProductLifecycle record created:', testLifecycle.id);
    
    const testHistory = await ProductLifecycleHistory.create({
      product_lifecycle_id: testLifecycle.id,
      barcode: testLifecycle.barcode,
      stage_to: 'created',
      status_to: 'active',
      transition_time: new Date(),
      operator_id: 1,
      created_by: 1
    });
    
    console.log('✅ Test ProductLifecycleHistory record created:', testHistory.id);
    
    // Clean up test records
    await testHistory.destroy();
    await testLifecycle.destroy();
    
    console.log('✅ Test records cleaned up');
    console.log('🎉 All tests passed! Database tables are ready.');
    
  } catch (error) {
    console.error('❌ Error testing tables:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

testTables();