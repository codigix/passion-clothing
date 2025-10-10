const db = require('./server/config/database');

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Material Dispatch Flow\n');
  
  try {
    // Step 1: Find or create MRN request
    console.log('📋 Step 1: Finding/Creating MRN Request...');
    let mrnRequest = await db.ProjectMaterialRequest.findOne({
      where: { status: 'pending_inventory_review' }
    });

    if (!mrnRequest) {
      console.log('   Creating test MRN request...');
      mrnRequest = await db.ProjectMaterialRequest.create({
        request_number: `MRN-TEST-${Date.now()}`,
        project_name: 'Test Project - Barcode Verification',
        requesting_department: 'manufacturing',
        materials_requested: JSON.stringify([
          {
            material_name: 'Cotton Fabric',
            material_code: 'COT-001',
            quantity_required: 100,
            uom: 'meters',
            barcode: 'BAR-COT-001-TEST',
            specification: 'White cotton, 100% pure'
          },
          {
            material_name: 'Polyester Thread',
            material_code: 'POL-002',
            quantity_required: 50,
            uom: 'spools',
            barcode: 'BAR-POL-002-TEST',
            specification: 'Strong polyester thread'
          }
        ]),
        required_by: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'high',
        status: 'pending_inventory_review',
        special_instructions: 'Urgent project - Quality check required',
        created_by: 1
      });
      console.log('   ✅ Created:', mrnRequest.request_number);
    } else {
      console.log('   ✅ Found:', mrnRequest.request_number);
    }

    // Parse materials
    const materials = typeof mrnRequest.materials_requested === 'string'
      ? JSON.parse(mrnRequest.materials_requested)
      : mrnRequest.materials_requested;

    console.log(`   Materials in request: ${materials.length}`);
    materials.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.material_name} - ${m.quantity_required} ${m.uom} - Barcode: ${m.barcode || 'None'}`);
    });

    // Step 2: Create Dispatch
    console.log('\n📦 Step 2: Creating Material Dispatch...');
    
    const dispatchNumber = `DSP-TEST-${Date.now()}`;
    const dispatchedMaterials = materials.map(m => ({
      material_name: m.material_name,
      material_code: m.material_code || 'N/A',
      quantity_dispatched: m.quantity_required || 0,
      uom: m.uom || 'PCS',
      barcode: m.barcode || `BAR-${Date.now()}`,
      batch_number: `BATCH-2025-TEST-${Date.now()}`,
      location: 'Test Warehouse - Shelf A-12',
      inventory_id: null
    }));

    const dispatch = await db.MaterialDispatch.create({
      dispatch_number: dispatchNumber,
      mrn_request_id: mrnRequest.id,
      project_name: mrnRequest.project_name,
      dispatched_materials: dispatchedMaterials,
      total_items: dispatchedMaterials.length,
      dispatch_notes: 'Test dispatch - Barcode verification workflow',
      dispatch_photos: [],
      dispatched_by: 1,
      dispatched_at: new Date(),
      received_status: 'pending'
    });

    console.log('   ✅ Dispatch Created:', dispatch.dispatch_number);
    console.log(`   Materials dispatched: ${dispatch.total_items}`);
    dispatchedMaterials.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.material_name} - Barcode: ${m.barcode}`);
    });

    // Update MRN status
    await mrnRequest.update({
      status: 'materials_issued',
      processed_by: 1,
      processed_at: new Date()
    });
    console.log('   ✅ MRN Status updated to: materials_issued');

    // Step 3: Simulate Manufacturing Receipt
    console.log('\n📬 Step 3: Simulating Manufacturing Receipt...');
    
    // Scenario 1: Perfect match (all barcodes match)
    const receivedMaterials = dispatchedMaterials.map(m => ({
      material_name: m.material_name,
      material_code: m.material_code,
      quantity_dispatched: m.quantity_dispatched,
      quantity_received: m.quantity_dispatched, // Perfect match
      barcode_expected: m.barcode,
      barcode_scanned: m.barcode, // Same as expected - MATCH!
      condition: 'good',
      remarks: 'All items received in excellent condition'
    }));

    // Check for discrepancies
    const hasDiscrepancy = receivedMaterials.some(m => 
      m.barcode_scanned !== m.barcode_expected || 
      m.quantity_received !== m.quantity_dispatched
    );

    console.log('   📋 Received Materials:');
    receivedMaterials.forEach((m, i) => {
      const barcodeMatch = m.barcode_scanned === m.barcode_expected ? '✅ MATCH' : '❌ MISMATCH';
      const qtyMatch = m.quantity_received === m.quantity_dispatched ? '✅ MATCH' : '⚠️  DIFF';
      console.log(`   ${i + 1}. ${m.material_name}`);
      console.log(`      Expected Barcode: ${m.barcode_expected}`);
      console.log(`      Scanned Barcode:  ${m.barcode_scanned} ${barcodeMatch}`);
      console.log(`      Qty Expected: ${m.quantity_dispatched} | Received: ${m.quantity_received} ${qtyMatch}`);
    });

    // Generate receipt number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const lastReceipt = await db.MaterialReceipt.findOne({
      where: {
        receipt_number: {
          [db.Sequelize.Op.like]: `MRN-RCV-${dateStr}-%`
        }
      },
      order: [['receipt_number', 'DESC']]
    });
    let sequence = 1;
    if (lastReceipt) {
      const lastSequence = parseInt(lastReceipt.receipt_number.split('-')[3]);
      sequence = lastSequence + 1;
    }
    const receiptNumber = `MRN-RCV-${dateStr}-${sequence.toString().padStart(5, '0')}`;

    const receipt = await db.MaterialReceipt.create({
      receipt_number: receiptNumber,
      dispatch_id: dispatch.id,
      mrn_request_id: mrnRequest.id,
      project_name: mrnRequest.project_name,
      received_materials: receivedMaterials,
      total_items_received: receivedMaterials.length,
      has_discrepancy: hasDiscrepancy,
      discrepancy_details: [],
      receipt_notes: 'Test receipt - All items verified',
      receipt_photos: [],
      received_by: 1,
      received_at: new Date(),
      verification_status: 'pending'
    });

    console.log(`\n   ✅ Receipt Created: ${hasDiscrepancy ? '⚠️  WITH DISCREPANCIES' : '✅ NO DISCREPANCIES'}`);
    console.log(`   Receipt Number: ${receiptNumber}`);
    console.log(`   Receipt ID: ${receipt.id}`);

    // Update dispatch status
    await dispatch.update({
      received_status: hasDiscrepancy ? 'discrepancy' : 'received'
    });

    // Step 4: Verification Result
    console.log('\n🔍 Step 4: Barcode Verification Result...');
    
    if (!hasDiscrepancy) {
      console.log('   ✅ ALL BARCODES MATCH!');
      console.log('   ✅ ALL QUANTITIES MATCH!');
      console.log('   ✅ STATUS: Ready for Production Approval');
      console.log('\n   Next Steps:');
      console.log('   1. QC Manager reviews in Stock Verification Page');
      console.log('   2. Production Manager approves in Production Approval Page');
      console.log('   3. Materials released to production floor');
      console.log('   4. Production order status → "In Progress"');
    } else {
      console.log('   ⚠️  DISCREPANCIES DETECTED!');
      console.log('   ⚠️  STATUS: Requires Investigation');
      console.log('\n   Next Steps:');
      console.log('   1. Inventory manager notified');
      console.log('   2. Manufacturing manager reviews discrepancies');
      console.log('   3. Decision: Accept with notes / Return / Request replacement');
    }

    // Step 5: Summary
    console.log('\n📊 Test Summary:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   MRN Request:     ${mrnRequest.request_number}`);
    console.log(`   Dispatch:        ${dispatch.dispatch_number}`);
    console.log(`   Receipt:         Receipt #${receipt.id}`);
    console.log(`   Materials Count: ${materials.length}`);
    console.log(`   Verification:    ${hasDiscrepancy ? '❌ Failed' : '✅ Passed'}`);
    console.log(`   Status:          ${hasDiscrepancy ? 'Discrepancy' : 'Verified'}`);
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n✅ Complete Flow Test Successful!\n');
    
    // Show database records
    console.log('📋 Database Records Created:');
    console.log(`   - MRN Request ID: ${mrnRequest.id}`);
    console.log(`   - Dispatch ID: ${dispatch.id}`);
    console.log(`   - Receipt ID: ${receipt.id}`);
    
    console.log('\n🔗 Test in Frontend:');
    console.log(`   1. Login as Inventory user`);
    console.log(`   2. Go to: /inventory/mrn-requests`);
    console.log(`   3. Find MRN: ${mrnRequest.request_number}`);
    console.log(`   4. Click "Dispatch" and test the form`);
    console.log('\n   5. Login as Manufacturing user');
    console.log(`   6. Go to: /manufacturing/material-receipts`);
    console.log(`   7. Find Dispatch: ${dispatch.dispatch_number}`);
    console.log(`   8. Test barcode scanning and verification`);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testCompleteFlow();