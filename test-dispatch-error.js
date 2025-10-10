const axios = require('axios');

// Test dispatch creation to see actual error
async function testDispatchError() {
  try {
    console.log('🧪 Testing Material Dispatch Creation...\n');

    // First, login to get a token
    console.log('1️⃣ Logging in as inventory user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'inventory@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received\n');

    // Get an MRN request
    console.log('2️⃣ Fetching MRN requests...');
    const mrnResponse = await axios.get('http://localhost:5000/api/project-material-requests', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const mrns = Array.isArray(mrnResponse.data) ? mrnResponse.data : mrnResponse.data.data || [];
    console.log(`   Found ${mrns.length} MRN requests`);

    if (mrns.length === 0) {
      console.log('❌ No MRN requests found. Please create one first.');
      return;
    }

    // Find a pending MRN
    const pendingMRN = mrns.find(m => m.status === 'pending_inventory_review' || m.status === 'pending');
    const testMRN = pendingMRN || mrns[0];

    console.log(`   Using MRN: ${testMRN.request_number} (ID: ${testMRN.id})`);
    console.log(`   Status: ${testMRN.status}`);
    console.log(`   Materials requested: ${testMRN.materials_requested ? 'YES' : 'NO'}`);

    if (testMRN.materials_requested) {
      console.log(`   Materials type: ${typeof testMRN.materials_requested}`);
      if (typeof testMRN.materials_requested === 'string') {
        console.log(`   Materials content: ${testMRN.materials_requested.substring(0, 100)}...`);
      }
    }

    // Parse materials
    let materials = [];
    try {
      materials = typeof testMRN.materials_requested === 'string'
        ? JSON.parse(testMRN.materials_requested)
        : testMRN.materials_requested || [];
    } catch (e) {
      console.error('❌ Error parsing materials:', e.message);
      return;
    }

    console.log(`   Parsed materials: ${materials.length} items\n`);

    // Prepare dispatch data
    const dispatchData = {
      mrn_request_id: testMRN.id,
      dispatched_materials: materials.map(m => ({
        material_name: m.material_name,
        material_code: m.material_code || 'N/A',
        quantity_requested: m.quantity_required || m.quantity_requested || 0,
        quantity_dispatched: m.quantity_required || m.quantity_requested || 0,
        uom: m.uom || 'PCS',
        barcode: `BAR-TEST-${Date.now()}`,
        batch_number: `BATCH-${Date.now()}`,
        location: 'Test Location',
        inventory_id: m.inventory_id || 1
      })),
      dispatch_notes: 'Test dispatch from diagnostic script',
      dispatch_photos: []
    };

    console.log('3️⃣ Dispatch data prepared:');
    console.log('   MRN Request ID:', dispatchData.mrn_request_id);
    console.log('   Materials count:', dispatchData.dispatched_materials.length);
    console.log('   Materials:', JSON.stringify(dispatchData.dispatched_materials, null, 2));
    console.log('');

    // Try to create dispatch
    console.log('4️⃣ Attempting to create dispatch...');
    const dispatchResponse = await axios.post(
      'http://localhost:5000/api/material-dispatch/create',
      dispatchData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS! Dispatch created:');
    console.log('   Dispatch Number:', dispatchResponse.data.dispatch.dispatch_number);
    console.log('   Status:', dispatchResponse.data.dispatch.received_status);
    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ ERROR OCCURRED:');
    console.error('   Message:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('   No response received from server');
      console.error('   Is the server running on http://localhost:5000?');
    } else {
      console.error('   Error details:', error);
    }
  }
}

testDispatchError();