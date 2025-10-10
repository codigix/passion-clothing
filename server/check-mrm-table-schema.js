const { sequelize } = require('./config/database');

(async () => {
  try {
    console.log('🔍 Checking project_material_requests table schema...\n');
    
    // Get table structure
    const [columns] = await sequelize.query(`
      DESCRIBE project_material_requests
    `);
    
    console.log('📋 Table Columns:');
    console.log('═══════════════════════════════════════════════════════════');
    columns.forEach(col => {
      console.log(`${col.Field.padEnd(30)} ${col.Type.padEnd(20)} NULL: ${col.Null.padEnd(5)} Key: ${col.Key.padEnd(5)} Default: ${col.Default || 'NULL'}`);
    });
    
    // Check for problematic constraints
    console.log('\n⚠️  CHECKING FOR ISSUES:');
    console.log('═══════════════════════════════════════════════════════════');
    
    const purchaseOrderCol = columns.find(c => c.Field === 'purchase_order_id');
    if (purchaseOrderCol) {
      if (purchaseOrderCol.Null === 'NO') {
        console.log('❌ FOUND ISSUE: purchase_order_id is NOT NULL');
        console.log('   This prevents creating MRNs without a Purchase Order!');
        console.log('   Fix: Change column to allow NULL for standalone MRN creation.');
      } else {
        console.log('✅ purchase_order_id allows NULL - OK for standalone MRNs');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();