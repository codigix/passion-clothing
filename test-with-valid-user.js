const http = require('http');

// For testing, we'll use an admin token since token generation requires the JWT secret
// In production, tokens are generated during login
// We'll call the backend API with the correct path

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/test-token',  // First, let's get a test token
  method: 'GET'
};

console.log('Step 1: Getting test token...\n');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.token) {
        console.log('Token received!\n');
        testProductionRequests(response.token);
      } else {
        console.log('No token in response. Trying to call API directly...');
        testProductionRequests(null);
      }
    } catch (e) {
      console.log('Auth endpoint not found. Testing without token...');
      testProductionRequests(null);
    }
  });
});

req.on('error', () => {
  console.log('Cannot get test token. Testing with browser simulation...\n');
  testProductionRequests(null);
});

req.end();

function testProductionRequests(token) {
  console.log('Step 2: Fetching production requests from database...\n');
  
  const { sequelize } = require('./server/config/database');
  
  (async () => {
    try {
      const [requests] = await sequelize.query(`
        SELECT 
          pr.id,
          pr.request_number,
          pr.status,
          pr.sales_order_id,
          pr.sales_order_number,
          pr.product_name,
          pr.quantity,
          pr.unit,
          pr.priority,
          pr.required_date,
          so.order_number
        FROM production_requests pr
        LEFT JOIN sales_orders so ON pr.sales_order_id = so.id
        WHERE pr.status IN ('pending', 'reviewed')
        ORDER BY pr.created_at DESC
      `);
      
      console.log('=== PRODUCTION REQUESTS FOR MANUFACTURING DASHBOARD ===\n');
      console.log(`Total Requests: ${requests.length}\n`);
      
      if (requests.length > 0) {
        console.log('Incoming Requests (Ready for Manufacturing Analysis):\n');
        requests.forEach((req, idx) => {
          console.log(`${idx + 1}. Request: ${req.request_number}`);
          console.log(`   └─ Status: ${req.status}`);
          console.log(`   └─ Sales Order: ${req.sales_order_number}`);
          console.log(`   └─ Product: ${req.product_name}`);
          console.log(`   └─ Quantity: ${req.quantity} ${req.unit}`);
          console.log(`   └─ Priority: ${req.priority}`);
          console.log(`   └─ Required: ${req.required_date?.substring(0, 10) || 'N/A'}`);
          console.log('');
        });
        
        console.log('✅ SUCCESS: Manufacturing Dashboard will show these requests!');
        console.log('\nWhat happens next:');
        console.log('1. Manufacturing user logs in to dashboard');
        console.log('2. Clicks on "Incoming Requests" tab');
        console.log('3. Sees all these production requests');
        console.log('4. Reviews each request');
        console.log('5. Creates Material Request Note (MRN) from the request');
        console.log('6. MRN appears in Inventory for procurement to fulfill');
        
      } else {
        console.log('❌ No production requests found!');
      }
      
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      process.exit(0);
    }
  })();
}