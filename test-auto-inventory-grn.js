const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test credentials
const credentials = {
  email: 'admin@pashion.com',
  password: 'Admin@123'
};

let token = null;
let poId = null;

async function login() {
  try {
    console.log('\n🔐 Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    token = response.data.token;
    console.log('✅ Login successful');
    return token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function createTestPO() {
  try {
    console.log('\n📋 Creating test Purchase Order...');
    const response = await axios.post(`${API_URL}/purchase-orders`, {
      vendor_id: 1,
      po_date: new Date(),
      expected_delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [
        {
          type: 'fabric',
          fabric_name: 'test_cotton_auto',
          quantity: 100,
          unit: 'Meters',
          rate: 50,
          color: 'White',
          gsm: 200,
          width: 58,
          hsn_code: '5208'
        }
      ],
      total_amount: 5000,
      status: 'approved',
      created_by: 1,
      approved_by: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    poId = response.data.po.id;
    console.log(`✅ Test PO created: PO-${poId}`);
    return poId;
  } catch (error) {
    console.error('❌ Failed to create PO:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function createGRNWithShortage() {
  try {
    console.log('\n📦 Creating GRN with shortage detection...');
    const response = await axios.post(`${API_URL}/grn/from-po/${poId}`, {
      received_date: new Date(),
      inward_challan_number: 'CH-AUTO-001',
      supplier_invoice_number: 'INV-AUTO-001',
      items_received: [
        {
          item_index: 0,
          ordered_qty: 100,
          invoiced_qty: 100,
          received_qty: 89.5,
          weight: null,
          remarks: 'Shortage detected during unloading'
        }
      ],
      remarks: 'Test GRN with shortage'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n✅ GRN created successfully!');
    console.log('📊 Response details:');
    console.log(`   - GRN Number: ${response.data.grn.grn_number}`);
    console.log(`   - Status: ${response.data.grn.status}`);
    console.log(`   - Verification Status: ${response.data.grn.verification_status}`);
    console.log(`   - Inventory Added: ${response.data.grn.inventory_added}`);
    console.log(`   - Inventory Items Created: ${response.data.inventory_items_created}`);
    console.log(`   - Has Shortages: ${response.data.has_shortages}`);
    console.log(`   - Shortage Count: ${response.data.shortage_count}`);
    
    if (response.data.inventory_items && response.data.inventory_items.length > 0) {
      console.log('\n📦 Inventory Items Created:');
      response.data.inventory_items.forEach((item, idx) => {
        console.log(`   [${idx + 1}] ${item.product_name}`);
        console.log(`       - Quantity: ${item.current_stock} ${item.unit_of_measurement}`);
        console.log(`       - Quality Status: ${item.quality_status}`);
        console.log(`       - Stock Type: ${item.stock_type}`);
        console.log(`       - Notes: ${item.notes.substring(0, 100)}...`);
      });
    }

    return response.data.grn.id;
  } catch (error) {
    console.error('❌ Failed to create GRN:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('   Error details:', error.response.data.error);
    }
    process.exit(1);
  }
}

async function verifyInventory() {
  try {
    console.log('\n🔍 Verifying inventory was created...');
    const response = await axios.get(`${API_URL}/inventory/from-po/${poId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`\n✅ Inventory verification successful!`);
    console.log(`   Total items in inventory for this PO: ${response.data.inventory.length}`);
    
    if (response.data.inventory.length > 0) {
      console.log('\n📊 Inventory Details:');
      response.data.inventory.forEach((item, idx) => {
        console.log(`   [${idx + 1}] ${item.product_name}`);
        console.log(`       - Current Stock: ${item.current_stock}`);
        console.log(`       - Quality Status: ${item.quality_status}`);
        console.log(`       - Location: ${item.location}`);
        console.log(`       - PO Item Index: ${item.po_item_index}`);
      });
    } else {
      console.log('   ⚠️ NO INVENTORY ITEMS FOUND - There may be an issue!');
    }

    return response.data.inventory;
  } catch (error) {
    console.error('❌ Failed to verify inventory:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function runTests() {
  console.log('=====================================');
  console.log('  AUTO-INVENTORY GRN TEST');
  console.log('=====================================');

  try {
    await login();
    await createTestPO();
    await createGRNWithShortage();
    const inventoryItems = await verifyInventory();

    console.log('\n=====================================');
    if (inventoryItems.length > 0) {
      console.log('✅ TEST PASSED - Inventory auto-added!');
    } else {
      console.log('❌ TEST FAILED - No inventory found!');
    }
    console.log('=====================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
