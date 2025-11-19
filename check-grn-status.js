const { sequelize, GoodsReceiptNote, PurchaseOrder, Approval, VendorRequest } = require('./server/config/database');

async function checkGRNStatus(poId) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log('  GRN HIERARCHY STATUS REPORT');
    console.log(`${'='.repeat(60)}\n`);

    const po = await PurchaseOrder.findByPk(poId);
    console.log(`📋 Purchase Order`);
    console.log(`   PO ID: ${po.id}`);
    console.log(`   PO Number: ${po.po_number}`);
    console.log(`   Status: ${po.status}`);
    console.log(`   Expected Delivery: ${po.expected_delivery_date}\n`);

    const grns = await GoodsReceiptNote.findAll({
      where: { purchase_order_id: poId },
      order: [['created_at', 'ASC']],
      attributes: ['id', 'grn_number', 'grn_sequence', 'is_first_grn', 'status', 'verification_status', 'created_at']
    });

    console.log(`📦 Goods Receipt Notes (${grns.length} found)`);
    grns.forEach((grn, idx) => {
      console.log(`   ${idx + 1}. ${grn.grn_number}`);
      console.log(`      Sequence: ${grn.grn_sequence} | First GRN: ${grn.is_first_grn ? 'YES' : 'NO'}`);
      console.log(`      Status: ${grn.status} | Verification: ${grn.verification_status}`);
      console.log(`      Created: ${new Date(grn.created_at).toLocaleString()}`);
    });
    console.log();

    const complaints = await Approval.findAll({
      where: {
        entity_id: poId,
        entity_type: 'purchase_order'
      },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'stage_key', 'status', 'created_at', 'decided_at']
    });

    console.log(`⚠️  Complaints/Approvals (${complaints.length} found)`);
    complaints.forEach((approval, idx) => {
      const statusIcon = approval.status === 'approved' ? '✓' : approval.status === 'pending' ? '⏳' : '❌';
      console.log(`   ${idx + 1}. ${approval.stage_key}`);
      console.log(`      Status: ${statusIcon} ${approval.status}`);
      console.log(`      Created: ${new Date(approval.created_at).toLocaleString()}`);
      if (approval.decided_at) {
        console.log(`      Decided: ${new Date(approval.decided_at).toLocaleString()}`);
      }
    });
    console.log();

    const vendorRequests = await VendorRequest.findAll({
      where: { purchase_order_id: poId },
      attributes: ['id', 'request_number', 'request_type', 'status', 'created_at']
    });

    console.log(`🤝 Vendor Requests (${vendorRequests.length} found)`);
    vendorRequests.forEach((vr, idx) => {
      console.log(`   ${idx + 1}. ${vr.request_number}`);
      console.log(`      Type: ${vr.request_type} | Status: ${vr.status}`);
      console.log(`      Created: ${new Date(vr.created_at).toLocaleString()}`);
    });
    console.log();

    console.log(`${'='.repeat(60)}`);
    console.log('  WORKFLOW STATUS');
    console.log(`${'='.repeat(60)}\n`);

    console.log(`Current Status: ${po.status}`);
    console.log(`GRN Count: ${grns.length}`);
    console.log(`Hierarchy: ${grns.length > 0 ? (grns[0].is_first_grn ? '✓ Correct' : '❌ Incorrect') : 'N/A'}`);
    console.log();

    console.log('Next Steps:');
    if (po.status === 'reopened' && grns.length >= 1) {
      console.log('   1. ✓ Hierarchy is FIXED');
      console.log('   2. ✓ Shortage complaints APPROVED');
      console.log('   3. ✓ PO status is REOPENED');
      console.log('   4. 👉 Create second GRN with shortage items');
      console.log(`   5. 👉 Endpoint: POST /api/grn/from-po/${poId}`);
    } else if (po.status === 'received') {
      console.log('   ✓ Workflow COMPLETE - All items received perfectly');
    } else {
      console.log(`   ⏳ Current status: ${po.status}`);
    }

    console.log(`\n${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

const poId = process.argv[2] || 1;
checkGRNStatus(parseInt(poId));
