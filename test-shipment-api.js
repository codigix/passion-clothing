// Quick test script to check shipment API errors
const axios = require('axios');

// Create a test token (this will fail but we'll see the error from the query)
async function testAPI() {
  try {
    const response = await axios.get('http://localhost:5000/api/shipments?limit=5');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testAPI();