/**
 * Test script to verify the /shipments/orders/incoming endpoint is working correctly
 * This can be run after the server is started
 */

const http = require('http');

// Replace these with actual values from your setup
const AUTH_TOKEN = 'your_jwt_token_here'; // You'll need to get this from login

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/shipments/orders/incoming?limit=10&exclude_delivered=true',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`\n📊 Status: ${res.statusCode}`);
  console.log('📋 Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\n✅ Response:');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.orders && response.orders.length > 0) {
        console.log('\n🎉 Endpoint is working!');
        console.log(`Found ${response.orders.length} incoming orders`);
        
        // Show first order details
        const firstOrder = response.orders[0];
        console.log('\n📦 First Order Sample:');
        console.log(`  - Production #: ${firstOrder.production_number}`);
        console.log(`  - Sales Order #: ${firstOrder.sales_order_number}`);
        console.log(`  - Customer: ${firstOrder.customer_name}`);
        console.log(`  - Quantity: ${firstOrder.quantity}`);
        console.log(`  - Has Shipment: ${firstOrder.has_shipment}`);
      } else {
        console.log('\n⚠️  No incoming orders found (endpoint is working, but no data)');
      }
    } catch (err) {
      console.error('❌ Failed to parse response:', err.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\nMake sure:');
  console.log('1. Server is running on localhost:5000');
  console.log('2. Replace AUTH_TOKEN with a valid JWT token');
  console.log('3. Your user has "shipment" or "admin" department access');
});

console.log('🚀 Testing /shipments/orders/incoming endpoint...');
console.log(`📍 URL: http://localhost:5000/api/shipments/orders/incoming?limit=10&exclude_delivered=true`);

req.end();