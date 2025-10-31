const http = require('http');

// Use a pre-generated valid token (from a manufacturing user)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IlN1cGVyIEFkbWluIiwiZW1haWwiOiJhZG1pbkBwYXNzaW9uLmNvbSIsImRlcGFydG1lbnQiOiJhZG1pbiIsImlhdCI6MTczMDc5MDExMjAwMH0.F5pYwCxT9lL5fZ0kzX4dQj9lVq0vJ8M0R2E6nQ3vZ8s';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/production-requests?status=pending,reviewed',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

console.log('Fetching Incoming Production Requests...\n');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    
    try {
      const response = JSON.parse(data);
      
      console.log('\n=== API RESPONSE ===');
      console.log('Success:', response.success);
      console.log('Total Requests:', response.data?.length || 0);
      
      if (response.data && response.data.length > 0) {
        console.log('\n=== INCOMING PRODUCTION REQUESTS FOR MANUFACTURING ===\n');
        response.data.forEach((req, index) => {
          console.log(`${index + 1}. Request: ${req.request_number}`);
          console.log(`   Status: ${req.status}`);
          console.log(`   Sales Order: ${req.sales_order_number}`);
          console.log(`   Product: ${req.product_name}`);
          console.log(`   Quantity: ${req.quantity} ${req.unit}`);
          console.log(`   Required Date: ${req.required_date?.substring(0, 10) || 'N/A'}`);
          console.log(`   Priority: ${req.priority}`);
          console.log('');
        });
        
        console.log('✅ Manufacturing Dashboard should show these requests in the "Incoming Requests" tab!');
      } else {
        console.log('\n⚠️ No production requests found!');
        console.log('Response data:', JSON.stringify(response, null, 2));
      }
    } catch (e) {
      console.log('Error parsing response:', e.message);
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Connection Error:', error.message);
  console.error('Make sure backend is running on port 5000');
});

req.end();