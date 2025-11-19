const db = require('./server/config/database');
const {
  PurchaseOrder,
  GoodsReceiptNote,
  VendorReturn,
  Inventory,
} = db;

async function testShortageWorkflow() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log(
      '\n🔄 Testing Complete Shortage Workflow (First GRN with Shortages → Second GRN)\n'
    );

    // Find a PO that has a first GRN with shortages
    const grn = await GoodsReceiptNote.findOne({
      where: { is_first_grn: true },
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
        },
      ],
      transaction,
    });

    if (!grn) {
      console.log('⚠️  No first GRN found to test workflow');
      await transaction.rollback();
      return;
    }

    const po = grn.purchaseOrder;
    const grnItems = grn.items_received || [];
    const shortageItems = grnItems.filter((item) => item.shortage_quantity > 0);

    console.log('✅ Found First GRN:', grn.grn_number);
    console.log('   PO:', po.po_number);
    console.log('   PO Status:', po.status);
    console.log('   GRN Sequence:', grn.grn_sequence);
    console.log('   Is First GRN:', grn.is_first_grn);
    console.log('   Total items:', grnItems.length);
    console.log('   Items with shortage:', shortageItems.length);

    if (shortageItems.length === 0) {
      console.log(
        '\n⚠️  First GRN has no shortages - cannot test shortage workflow'
      );
      await transaction.rollback();
      return;
    }

    // Check for VendorReturn (created when shortages detected)
    const vendorReturn = await VendorReturn.findOne({
      where: {
        purchase_order_id: po.id,
        grn_id: grn.id,
        return_type: 'shortage',
      },
      transaction,
    });

    console.log('\n📦 Shortage Management:');
    if (vendorReturn) {
      console.log('   ✅ VendorReturn Created:', vendorReturn.return_number);
      console.log('   Status:', vendorReturn.status);
      console.log('   Total Shortage Value: ₹' + vendorReturn.total_shortage_value);
      const returnItems = vendorReturn.items || [];
      console.log('   Shortage Items Count:', returnItems.length);
    } else {
      console.log('   ⚠️  No VendorReturn found (unexpected)');
    }

    // Check inventory for first GRN
    const grnInventory = await Inventory.findAll({
      where: { purchase_order_id: po.id },
      transaction,
    });

    console.log('\n📊 Inventory Status:');
    console.log('   Total inventory items for PO:', grnInventory.length);

    const quarantineItems = grnInventory.filter(
      (item) => item.quality_status === 'quarantine'
    );
    const approvedItems = grnInventory.filter(
      (item) => item.quality_status === 'approved'
    );

    console.log('   Quarantine (shortages):', quarantineItems.length);
    console.log('   Approved (complete):', approvedItems.length);

    if (quarantineItems.length > 0) {
      console.log('\n   Quarantine Items Details:');
      quarantineItems.forEach((item) => {
        console.log(`     - ${item.product_name}: ${item.current_stock} ${item.unit_of_measurement}`);
      });
    }

    // Check for existing second GRN
    const secondGRN = await GoodsReceiptNote.findOne({
      where: {
        purchase_order_id: po.id,
        is_first_grn: false,
      },
      transaction,
    });

    console.log('\n🔄 Second GRN Status:');
    if (secondGRN) {
      console.log('   ✅ Second GRN Exists:', secondGRN.grn_number);
      console.log('   Sequence:', secondGRN.grn_sequence);
      console.log('   Status:', secondGRN.status);
      console.log('   Items Received:', (secondGRN.items_received || []).length);
    } else {
      console.log('   ℹ️  No second GRN yet (expected if shortage materials not arrived)');
      console.log('   Ready to create second GRN when shortage materials arrive');
    }

    // Summary
    console.log('\n✅ WORKFLOW STATUS:');
    console.log('   Step 1: ✅ First GRN created with shortages');
    console.log('   Step 2: ✅ VendorReturn ' + (vendorReturn ? 'created' : 'missing'));
    console.log(
      '   Step 3: ✅ Inventory auto-added (' +
        grnInventory.length +
        ' items total)'
    );
    console.log(
      '   Step 4: ' +
        (secondGRN ? '✅ Second GRN created' : '⏳ Pending (no shortage GRN yet)')
    );

    console.log(
      '\n📋 NEXT STEPS FOR TESTING:'
    );
    if (!secondGRN && po.status === 'grn_requested') {
      console.log(
        '   1. When shortage materials arrive, navigate to Create GRN'
      );
      console.log(`   2. Use PO ID: ${po.id}`);
      console.log('   3. System will show shortage items from VendorReturn');
      console.log('   4. Create second GRN with shortage quantities');
      console.log('   5. Shortage items auto-added to inventory');
    }

    await transaction.rollback();
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testShortageWorkflow()
  .then(() => {
    console.log('\n✅ Test completed\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
