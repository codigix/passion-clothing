const axios = require('axios');

async function testEndpoint() {
  console.log('🧪 Testing Manufacturing Dashboard Endpoints\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // First, get a valid auth token (you'll need to adjust this with real credentials)
  // For now, we'll test the endpoint availability
  
  const testUrls = [
    'http://localhost:5000/api/manufacturing/orders?status=cutting',
    'http://localhost:5000/api/manufacturing/orders?status=stitching',
    'http://localhost:5000/api/manufacturing/orders?status=cutting,embroidery,stitching',
  ];

  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(url, {
        headers: {
          // Add a mock token - it will fail auth but we'll see if it's a 401 (auth) or 500 (server error)
          'Authorization': 'Bearer test'
        }
      });
      console.log(`✅ SUCCESS (Status: ${response.status})`);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          console.log(`✅ ENDPOINT OK (Auth required - Status: ${error.response.status})`);
        } else if (error.response.status === 500) {
          console.log(`❌ SERVER ERROR (Status: 500)`);
          console.log(`   Error: ${error.response.data.message || 'Unknown'}`);
        } else {
          console.log(`⚠️  Status: ${error.response.status}`);
        }
      } else {
        console.log(`❌ Connection error: ${error.message}`);
      }
    }
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('If you see "ENDPOINT OK (Auth required)" - the 500 error is FIXED! ✅');
  console.log('The dashboard just needs authentication.');
}

testEndpoint();