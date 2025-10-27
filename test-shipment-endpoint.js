const http = require('http');

// Make a simple test request
function testEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/shipments/orders/incoming?status=ready_for_shipment&exclude_delivered=true',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test-token'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response:', data);
    });
  });

  req.on('error', (error) => {
    console.error('Request Error:', error);
  });

  req.end();
}

setTimeout(testEndpoint, 1000);