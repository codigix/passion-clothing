const { sequelize } = require('./config/database');

(async () => {
  console.log('🔧 Making purchase_order_id nullable in project_material_requests...\n');
  
  try {
    // Check current column definition
    const [columns] = await sequelize.query(`DESCRIBE project_material_requests`);
    
    const purchaseOrderCol = columns.find(c => c.Field === 'purchase_order_id');
    
    if (!purchaseOrderCol) {
      console.log('❌ Column purchase_order_id does not exist!');
      process.exit(1);
    }
    
    console.log(`📋 Current status: NULL = ${purchaseOrderCol.Null}`);
    
    if (purchaseOrderCol.Null === 'YES') {
      console.log('✅ Column already allows NULL, no change needed!');
      process.exit(0);
    }

    console.log('🔨 Modifying column to allow NULL...');
    
    // Modify the column to allow NULL
    await sequelize.query(`
      ALTER TABLE project_material_requests 
      MODIFY COLUMN purchase_order_id INT NULL
    `);

    console.log('✅ Successfully changed purchase_order_id to allow NULL!');
    
    // Verify the change
    const [columnsAfter] = await sequelize.query(`DESCRIBE project_material_requests`);
    const updatedCol = columnsAfter.find(c => c.Field === 'purchase_order_id');
    
    console.log(`\n📋 New status: NULL = ${updatedCol.Null}`);
    
    console.log('\n✅ FIX COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✓ Manufacturing can now create standalone MRNs');
    console.log('✓ Procurement can still create PMRs linked to POs');
    console.log('\n🎯 Try creating your MRN again now!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();