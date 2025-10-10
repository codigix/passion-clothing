const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test with admin credentials (update these as needed)
let authToken = '';

async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testEndpoint(method, endpoint, data = null) {
  try {
    const config = {
      headers: { Authorization: `Bearer ${authToken}` }
    };

    let response;
    if (method === 'GET') {
      response = await axios.get(`${API_BASE}${endpoint}`, config);
    } else if (method === 'POST') {
      response = await axios.post(`${API_BASE}${endpoint}`, data, config);
    }

    console.log(`✅ ${method} ${endpoint}:`, response.status);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing Inventory API Endpoints\n');
  
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }
  
  console.log('\n📊 Testing Dashboard Endpoints:\n');
  
  // Test stats
  const stats = await testEndpoint('GET', '/inventory/stats');
  if (stats) {
    console.log('   Stats:', JSON.stringify(stats.stats, null, 2));
  }
  
  // Test inventory list
  const inventory = await testEndpoint('GET', '/inventory?limit=5');
  if (inventory) {
    console.log(`   Found ${inventory.inventory?.length || 0} inventory items`);
  }
  
  // Test factory stock
  const factoryStock = await testEndpoint('GET', '/inventory?stock_type=general_extra&limit=5');
  if (factoryStock) {
    console.log(`   Found ${factoryStock.inventory?.length || 0} factory stock items`);
  }
  
  // Test project stock
  const projectStock = await testEndpoint('GET', '/inventory?stock_type=project_specific&limit=5');
  if (projectStock) {
    console.log(`   Found ${projectStock.inventory?.length || 0} project stock items`);
  }
  
  // Test projects summary
  const projects = await testEndpoint('GET', '/inventory/projects-summary');
  if (projects) {
    console.log(`   Found ${projects.projects?.length || 0} projects`);
  }
  
  // Test search
  const search = await testEndpoint('GET', '/inventory?search=fabric&limit=5');
  if (search) {
    console.log(`   Search found ${search.inventory?.length || 0} items`);
  }
  
  console.log('\n✅ All tests completed!');
}

runTests();