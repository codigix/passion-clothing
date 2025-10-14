const db = require('./server/config/database');

async function testMaterialFlow() {
  try {
    console.log('🧪 **STEP 4: END-TO-END MATERIAL FLOW TEST**\n');
    console.log('=' .repeat(60));

    // 1. Check Production Requests
    console.log('\n📋 **1. PRODUCTION REQUESTS (Pending)**');
    const requests = await db.ProductionRequest.findAll({
      where: { status: 'pending' },
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'request_number', 'product_name', 'quantity', 'status']
    });
    console.table(requests.map(r => r.toJSON()));

    // 2. Check Material Dispatches
    console.log('\n📦 **2. MATERIAL DISPATCHES**');
    const dispatches = await db.MaterialDispatch.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'dispatch_number', 'project_name', 'received_status', 'dispatched_at']
    });
    console.table(dispatches.map(d => d.toJSON()));

    // 3. Check Material Receipts
    console.log('\n📥 **3. MATERIAL RECEIPTS**');
    const receipts = await db.MaterialReceipt.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'receipt_number', 'verification_status', 'received_at']
    });
    console.table(receipts.map(r => r.toJSON()));

    // 4. Check Material Verifications
    console.log('\n✅ **4. MATERIAL VERIFICATIONS**');
    const verifications = await db.MaterialVerification.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'verification_number', 'approval_status', 'verified_at']
    });
    console.table(verifications.map(v => v.toJSON()));

    // 5. Check Production Approvals
    console.log('\n👔 **5. PRODUCTION APPROVALS**');
    const approvals = await db.ProductionApproval.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'approval_number', 'approval_status', 'production_order_created', 'approved_at']
    });
    console.table(approvals.map(a => a.toJSON()));

    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 **SYSTEM SUMMARY**');
    console.log(`   Pending Production Requests: ${requests.length}`);
    console.log(`   Total Dispatches: ${dispatches.length}`);
    console.log(`   Total Receipts: ${receipts.length}`);
    console.log(`   Total Verifications: ${verifications.length}`);
    console.log(`   Total Approvals: ${approvals.length}`);
    console.log('='.repeat(60));

    // Check for incomplete flows
    const pendingDispatches = dispatches.filter(d => d.received_status === 'pending');
    const pendingReceipts = receipts.filter(r => r.verification_status === 'pending');
    const pendingVerifications = verifications.filter(v => v.approval_status === 'pending');

    console.log('\n⚠️  **PENDING ITEMS (Need Action)**');
    console.log(`   - Dispatches awaiting receipt: ${pendingDispatches.length}`);
    console.log(`   - Receipts awaiting verification: ${pendingReceipts.length}`);
    console.log(`   - Verifications awaiting approval: ${pendingVerifications.length}`);

    if (pendingDispatches.length > 0) {
      console.log('\n📌 **Next Action: Receive Materials**');
      console.log(`   Navigate to: Manufacturing Dashboard → Material Receipts Tab`);
      console.log(`   Click "Receive Materials" on dispatch: ${pendingDispatches[0].dispatch_number}`);
    } else if (pendingReceipts.length > 0) {
      console.log('\n📌 **Next Action: Verify Stock**');
      console.log(`   Navigate to: Manufacturing Dashboard → Material Receipts Tab`);
      console.log(`   Click "Verify Stock" on receipt: ${pendingReceipts[0].receipt_number}`);
    } else if (pendingVerifications.length > 0) {
      console.log('\n📌 **Next Action: Approve Production**');
      console.log(`   Navigate to: Manufacturing Dashboard → Material Receipts Tab`);
      console.log(`   Click "Approve Production" on verification: ${pendingVerifications[0].verification_number}`);
    } else {
      console.log('\n✅ **All flows complete or no pending items**');
      console.log('   Ready to start a new material dispatch flow!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testMaterialFlow();