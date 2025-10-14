const axios = require('axios');

// Test the failing endpoint
async function testEndpoint() {
  try {
    console.log('Testing: GET /api/manufacturing/orders?status=cutting');
    const response = await axios.get('http://localhost:5000/api/manufacturing/orders?status=cutting', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Will fail but we'll see the error
      }
    });
    console.log('✅ SUCCESS:', response.data);
  } catch (error) {
    console.log('❌ ERROR Status:', error.response?.status);
    console.log('❌ ERROR Message:', error.response?.data);
    console.log('❌ Full Error:', error.message);
  }
}

testEndpoint();