const axios = require('axios');

// Test the incoming orders endpoint
async function testIncomingOrders() {
  try {
    // First, get auth token
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@pashion.com',
      password: 'admin123'
    });

    const token = loginRes.data.token;
    console.log('✓ Login successful, token:', token.substring(0, 20) + '...');

    // Now test the incoming orders endpoint
    const response = await axios.get(
      'http://localhost:3000/api/shipments/orders/incoming?status=ready_for_shipment&exclude_delivered=true',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✓ Incoming orders fetched successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('✗ Error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testIncomingOrders();