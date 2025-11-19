const db = require('./server/config/database');
const { GoodsReceiptNote, PurchaseOrder, Inventory } = db;

async function testVerifyGRNWithShortage() {
  const transaction = await db.sequelize.transaction();
  
  try {
    console.log('\n🔍 Testing GRN Verification with Shortage Support...\n');

    // Find a GRN with discrepancy (shortage)
    const grnWithIssues = await GoodsReceiptNote.findOne({
      where: { verification_status: 'discrepancy' },
      include: [{ model: PurchaseOrder, as: 'purchaseOrder' }],
      transaction
    });

    if (grnWithIssues) {
      console.log('✅ Found GRN with discrepancy status:', grnWithIssues.grn_number);
      console.log('   GRN ID:', grnWithIssues.id);
      console.log('   Current verification_status:', grnWithIssues.verification_status);
      console.log('   Items received:', grnWithIssues.items_received?.length || 0);
      
      // Check if it has items with shortages
      const itemsWithShortage = grnWithIssues.items_received?.filter(
        item => item.shortage_quantity > 0
      ) || [];
      
      console.log('   Items with shortage:', itemsWithShortage.length);
      itemsWithShortage.forEach(item => {
        console.log(`     - ${item.material_name}: ordered ${item.ordered_quantity}, received ${item.received_quantity}, shortage ${item.shortage_quantity}`);
      });

      // Check if inventory was already created for this GRN
      const existingInventory = await Inventory.findAll({
        where: { 
          purchase_order_id: grnWithIssues.purchase_order_id
        },
        transaction,
        raw: true
      });

      console.log('\n📦 Existing inventory for this GRN:', existingInventory.length);
      if (existingInventory.length > 0) {
        existingInventory.forEach(inv => {
          console.log(`   - ${inv.product_name}: quantity ${inv.current_stock}, quality_status: ${inv.quality_status}`);
        });
      }

      console.log('\n✅ TEST: GRN with discrepancy found. The verify endpoint should now accept it.');
      console.log('   Next step: Try verifying this GRN via API with verification_status="discrepancy"');
      console.log('   Expected: Items should be added to inventory with quality_status="quarantine"');

      return {
        grn: grnWithIssues,
        itemsWithShortage,
        existingInventory
      };
    } else {
      console.log('⚠️  No GRN with discrepancy status found.');
      console.log('   Note: First, create a GRN with shortages to test.');
      
      // List all GRNs for reference
      const allGRNs = await GoodsReceiptNote.findAll({
        limit: 5,
        attributes: ['id', 'grn_number', 'verification_status'],
        transaction
      });
      
      console.log('\n   Available GRNs:');
      allGRNs.forEach(grn => {
        console.log(`   - ${grn.grn_number} (${grn.verification_status})`);
      });
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testVerifyGRNWithShortage().then(() => {
  console.log('\n✅ Test completed\n');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
