/**
 * Test script to verify the newly created outsourcing and reconciliation endpoints
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// You'll need to replace this with a valid JWT token from your login
const AUTH_TOKEN = 'YOUR_TOKEN_HERE';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testEndpoints() {
  console.log('🧪 Testing Outsourcing & Reconciliation Endpoints\n');
  
  // Test 1: Check if routes are registered (should not return 404)
  try {
    console.log('1️⃣ Testing GET /manufacturing/stages/13/challans');
    const response = await api.get('/manufacturing/stages/13/challans');
    console.log('✅ Challans endpoint exists:', response.status);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Challans endpoint NOT FOUND (404)');
    } else if (error.response?.status === 401) {
      console.log('⚠️  Challans endpoint exists but needs auth (expected)');
    } else {
      console.log('⚠️  Challans endpoint error:', error.response?.status, error.response?.data?.message);
    }
  }

  try {
    console.log('\n2️⃣ Testing POST /manufacturing/stages/13/outsource/outward');
    await api.post('/manufacturing/stages/13/outsource/outward', {
      vendor_id: 1,
      items: [],
      expected_return_date: '2025-02-15'
    });
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Outward challan endpoint NOT FOUND (404)');
    } else if (error.response?.status === 401) {
      console.log('⚠️  Outward challan endpoint exists but needs auth (expected)');
    } else {
      console.log('⚠️  Outward challan endpoint error:', error.response?.status, error.response?.data?.message);
    }
  }

  try {
    console.log('\n3️⃣ Testing POST /manufacturing/stages/15/outsource/inward');
    await api.post('/manufacturing/stages/15/outsource/inward', {
      outward_challan_id: 1,
      items: [],
      received_quantity: 100
    });
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Inward challan endpoint NOT FOUND (404)');
    } else if (error.response?.status === 401) {
      console.log('⚠️  Inward challan endpoint exists but needs auth (expected)');
    } else {
      console.log('⚠️  Inward challan endpoint error:', error.response?.status, error.response?.data?.message);
    }
  }

  try {
    console.log('\n4️⃣ Testing GET /manufacturing/orders/1/materials/reconciliation');
    await api.get('/manufacturing/orders/1/materials/reconciliation');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Reconciliation GET endpoint NOT FOUND (404)');
    } else if (error.response?.status === 401) {
      console.log('⚠️  Reconciliation GET endpoint exists but needs auth (expected)');
    } else {
      console.log('⚠️  Reconciliation GET endpoint error:', error.response?.status, error.response?.data?.message);
    }
  }

  try {
    console.log('\n5️⃣ Testing POST /manufacturing/orders/1/materials/reconcile');
    await api.post('/manufacturing/orders/1/materials/reconcile', {
      materials: [],
      notes: 'test'
    });
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Reconciliation POST endpoint NOT FOUND (404)');
    } else if (error.response?.status === 401) {
      console.log('⚠️  Reconciliation POST endpoint exists but needs auth (expected)');
    } else {
      console.log('⚠️  Reconciliation POST endpoint error:', error.response?.status, error.response?.data?.message);
    }
  }

  console.log('\n✅ Test complete! If all endpoints show 401 (auth required) instead of 404, they are registered correctly.');
}

testEndpoints();