const axios = require('axios');

async function testProductionRequestsAPI() {
  try {
    console.log('Testing production requests API...\n');
    
    // First, login to get token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Test production requests endpoint
    console.log('Step 2: Fetching production requests with status=pending...');
    const response = await axios.get('http://localhost:5000/api/production-requests?status=pending', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API call successful!\n');
    console.log('Response status:', response.status);
    console.log('Number of requests:', response.data.data?.length || 0);
    console.log('\nProduction Requests:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testProductionRequestsAPI();