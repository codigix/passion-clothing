/**
 * Test Script: Manufacturing → Shipment Workflow
 * 
 * Tests the complete workflow from manufacturing completion to shipment incoming orders
 * 
 * Usage: node test-manufacturing-shipment-workflow.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test user credentials (manufacturing user)
const MANUFACTURING_USER = {
  email: 'manufacturing@erp.local',
  password: 'password123'
};

// Helper to make API calls with auth
let authToken = null;

async function login() {
  try {
    console.log('\n📝 Logging in as manufacturing user...');
    const response = await axios.post(`${API_BASE}/auth/login`, MANUFACTURING_USER);
    authToken = response.data.token;
    console.log('✅ Login successful');
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function fetchWithAuth(method, endpoint, data = null) {
  try {
    const config = {
      headers: { Authorization: `Bearer ${authToken}` }
    };
    
    if (method === 'GET') {
      return await axios.get(`${API_BASE}${endpoint}`, config);
    } else if (method === 'POST') {
      return await axios.post(`${API_BASE}${endpoint}`, data, config);
    } else if (method === 'PUT') {
      return await axios.put(`${API_BASE}${endpoint}`, data, config);
    }
  } catch (error) {
    throw error;
  }
}

async function testWorkflow() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 TESTING MANUFACTURING → SHIPMENT WORKFLOW');
  console.log('='.repeat(70));

  try {
    // 1. Login
    await login();

    // 2. Get production orders
    console.log('\n📋 Fetching production orders...');
    const ordersResponse = await fetchWithAuth('GET', '/manufacturing/orders?limit=10&status=in_progress,finishing,quality_check');
    const productionOrders = ordersResponse.data.orders || [];
    
    if (productionOrders.length === 0) {
      console.log('ℹ️  No production orders in final stages found.');
      console.log('   Expected: Orders with status "finishing" or "quality_check"');
      console.log('   Hint: Create and complete a production order first');
      return;
    }

    console.log(`✅ Found ${productionOrders.length} production orders`);

    // 3. Find an order ready for shipment
    const readyOrder = productionOrders.find(o => 
      o.status === 'finishing' || o.status === 'quality_check' || o.status === 'completed'
    );

    if (!readyOrder) {
      console.log('⚠️  No orders in final stages found');
      return;
    }

    console.log(`\n📦 Selected order for testing:`);
    console.log(`   - Production #: ${readyOrder.production_number}`);
    console.log(`   - Status: ${readyOrder.status} ← Should be finishing/quality_check`);
    console.log(`   - Order #: ${readyOrder.order_number}`);
    console.log(`   - Customer: ${readyOrder.customer_name}`);

    // 4. TEST: Mark as ready for shipment
    console.log(`\n🚚 Testing: Mark order as ready for shipment...`);
    console.log(`   Endpoint: POST /manufacturing/orders/${readyOrder.id}/ready-for-shipment`);
    console.log(`   Current status: "${readyOrder.status}"`);
    console.log(`   Expected: Should ACCEPT (status in ['completed', 'finishing', 'quality_check'])`);

    try {
      const shipmentResponse = await fetchWithAuth(
        'POST',
        `/manufacturing/orders/${readyOrder.id}/ready-for-shipment`,
        {
          notes: 'Test shipment from automated test',
          special_instructions: 'Handle with care - test item'
        }
      );

      console.log('✅ SUCCESS: Order marked as ready for shipment');
      console.log(`   - Shipment #: ${shipmentResponse.data.shipment_number}`);
      console.log(`   - Shipment ID: ${shipmentResponse.data.shipment_id}`);
      
      const shipmentId = shipmentResponse.data.shipment_id;

      // 5. Verify shipment was created
      console.log(`\n📍 Verifying shipment created...`);
      const shipmentDetailsResponse = await fetchWithAuth(
        'GET',
        `/shipments/${shipmentId}`
      );
      
      const shipment = shipmentDetailsResponse.data;
      console.log('✅ Shipment verified:');
      console.log(`   - Shipment #: ${shipment.shipment_number}`);
      console.log(`   - Status: ${shipment.status}`);
      console.log(`   - Order #: ${shipment.sales_order_number}`);
      console.log(`   - Customer: ${shipment.customer_name}`);

      // 6. Check if order appears in incoming orders
      console.log(`\n📨 Checking Shipment Dashboard incoming orders...`);
      const incomingResponse = await fetchWithAuth(
        'GET',
        '/shipments/orders/incoming?status=ready_for_shipment&limit=20'
      );

      const incomingOrders = incomingResponse.data.orders || [];
      const foundIncoming = incomingOrders.find(o => o.id === readyOrder.id);

      if (foundIncoming) {
        console.log('✅ SUCCESS: Order appears in Incoming Orders');
        console.log(`   - Production #: ${foundIncoming.production_number}`);
        console.log(`   - Status: ${foundIncoming.production_status}`);
        console.log(`   - Shipment #: ${foundIncoming.shipment_number}`);
        console.log(`   - Quantity: ${foundIncoming.quantity}`);
      } else {
        console.log('⚠️  Order NOT found in incoming orders');
        console.log(`   Total orders in incoming: ${incomingOrders.length}`);
        if (incomingOrders.length > 0) {
          console.log(`   Sample order: ${incomingOrders[0].production_number}`);
        }
      }

      // 7. Summary
      console.log('\n' + '='.repeat(70));
      console.log('✅ WORKFLOW TEST RESULTS');
      console.log('='.repeat(70));
      console.log(`✅ Order marked as ready for shipment: ${shipmentResponse.status === 201 ? 'YES' : 'NO'}`);
      console.log(`✅ Shipment created: ${shipment.shipment_number}`);
      console.log(`✅ Appears in incoming orders: ${foundIncoming ? 'YES' : 'NO'}`);
      console.log(`\n💡 Next step: Go to Shipment Dashboard → Incoming Orders to verify`);

    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️  Shipment already exists for this order');
        console.log(`   Message: ${error.response.data.message}`);
        console.log(`   Use a different production order for testing`);
        return;
      }
      
      console.error('❌ FAILED: Could not mark as ready for shipment');
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Error: ${error.response?.data?.message || error.message}`);
      
      // This tells us the backend fix didn't work
      if (error.response?.status === 400) {
        const msg = error.response.data.message;
        if (msg.includes('must be')) {
          console.error('\n🔴 ISSUE: Backend is still too strict about status validation');
          console.error(`   Status received: "${readyOrder.status}"`);
          console.error('   Fix may not have been applied correctly');
        }
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

// Run tests
testWorkflow().catch(console.error);
