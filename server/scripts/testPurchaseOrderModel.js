const { sequelize, PurchaseOrder } = require('../config/database');

const testModel = async () => {
  try {
    console.log('Testing PurchaseOrder model...\n');
    
    // Get all model attributes
    const attributes = PurchaseOrder.rawAttributes;
    
    console.log('Checking for dispatch tracking fields:');
    const fieldsToCheck = [
      'dispatched_at',
      'dispatch_tracking_number',
      'dispatch_courier_name',
      'dispatch_notes',
      'expected_arrival_date',
      'dispatched_by_user_id'
    ];
    
    fieldsToCheck.forEach(field => {
      if (attributes[field]) {
        console.log(`  ✅ ${field} - Type: ${attributes[field].type.constructor.name}`);
      } else {
        console.log(`  ❌ ${field} - NOT FOUND IN MODEL`);
      }
    });
    
    console.log('\n📊 Attempting to fetch a PO from database...');
    const testPO = await PurchaseOrder.findOne({
      attributes: ['id', 'po_number', 'dispatched_at', 'dispatch_tracking_number'],
      limit: 1
    });
    
    if (testPO) {
      console.log('✅ Successfully queried PO with dispatch fields!');
      console.log(`   PO: ${testPO.po_number}`);
    } else {
      console.log('⚠️  No POs found in database (this is OK if empty)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
  } finally {
    await sequelize.close();
  }
};

testModel();