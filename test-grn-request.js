const axios = require('axios');

// Test GRN request endpoint
async function testGRNRequest() {
  try {
    const response = await axios.post('http://localhost:5000/api/procurement/purchase-orders/2/request-grn', {
      notes: 'Test GRN request'
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE', // You'll need to replace this with a valid token
        'Content-Type': 'application/json'
      }
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testGRNRequest();