const http = require('http');
const jwt = require('jsonwebtoken');

// Create a valid manufacturing user token
const payload = {
  id: 2, // manufacturing user
  name: 'Manufacturing Manager',
  email: 'manufacturing@passion.com',
  department: 'manufacturing'
};

const secret = 'your_jwt_secret_key_here';
const token = jwt.sign(payload, secret, { expiresIn: '24h' });

console.log('Generated Manufacturing Token:');
console.log(token);
console.log('\n');

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
    console.log('Status:', res.statusCode);
    
    try {
      const response = JSON.parse(data);
      
      console.log('\n=== API RESPONSE ===\n');
      console.log('Success:', response.success);
      console.log('Total Requests:', response.data?.length || 0);
      
      if (response.data && response.data.length > 0) {
        console.log('\n=== INCOMING PRODUCTION REQUESTS ===\n');
        response.data.forEach((req, index) => {
          console.log(`${index + 1}. ${req.request_number} (Status: ${req.status})`);
          console.log(`   Sales Order: ${req.sales_order_number}`);
          console.log(`   Product: ${req.product_name}`);
          console.log(`   Quantity: ${req.quantity} ${req.unit}`);
          console.log(`   Priority: ${req.priority}`);
          console.log(`   Required: ${req.required_date}`);
          console.log('');
        });
      } else {
        console.log('\n⚠️ No production requests found!');
      }
    } catch (e) {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();