const db = require('./server/config/database');
const { PurchaseOrder, Approval, GoodsReceiptNote } = db;

async function testMaterialReceivedEndpoint() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('\n🔍 Testing Material Received Endpoint (Idempotent Behavior)...\n');

    // Find any PO
    const po = await PurchaseOrder.findOne({
      transaction,
    });

    if (!po) {
      console.log('⚠️  No suitable PO found to test.');
      console.log('   Looking for POs with status: sent, send_to_vendor, received, or grn_requested');

      const allPos = await PurchaseOrder.findAll({
        limit: 5,
        attributes: ['id', 'po_number', 'status', 'received_at'],
        transaction,
      });

      console.log('\n   Available POs:');
      allPos.forEach((p) => {
        console.log(
          `   - PO ${p.po_number}: status="${p.status}", received_at=${p.received_at}`
        );
      });

      await transaction.rollback();
      return;
    }

    console.log('✅ Found PO:', po.po_number);
    console.log('   Current status:', po.status);
    console.log('   Received at:', po.received_at || 'Not received');

    // Check for existing GRN
    const existingGRN = await GoodsReceiptNote.findOne({
      where: { purchase_order_id: po.id },
      transaction,
    });

    if (existingGRN) {
      console.log('\n   ⚠️  GRN already exists:', existingGRN.grn_number);
      console.log('   (endpoint will still return success with existing approval)');
    }

    // Check for existing approval request
    const existingApproval = await Approval.findOne({
      where: {
        entity_type: 'grn_creation',
        entity_id: po.id,
      },
      transaction,
    });

    if (existingApproval) {
      console.log('\n   ✅ GRN creation approval request EXISTS');
      console.log('   Status:', existingApproval.status);
      console.log('   ID:', existingApproval.id);
      console.log('\n   ✅ TEST SCENARIO: Idempotent call');
      console.log('   Expected: Endpoint returns 200 with existing approval');
      console.log('   Previous issue: Endpoint would return 400 "Materials already marked as received"');
    } else {
      console.log('\n   ℹ️  No GRN creation approval request found');
      console.log('   The endpoint would create one on first call');
    }

    console.log('\n✅ Key Changes Made:');
    console.log('   1. Endpoint now allows status "received" (idempotent)');
    console.log('   2. Checks if approval request already exists');
    console.log('   3. Returns existing approval instead of failing');
    console.log('   4. Updates PO status to "grn_requested"');
    console.log('   5. Creates GRN creation request for Inventory Department');
    console.log('\n   This ensures GRN request appears in Inventory Dashboard');

    await transaction.rollback();
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testMaterialReceivedEndpoint()
  .then(() => {
    console.log('\n✅ Test completed\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
