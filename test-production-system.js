/**
 * Production System Diagnostic Script
 * Run this to check if your production system has the required data
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function runDiagnostics() {
  console.log('🔍 Production System Diagnostics\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'passion_erp'
  });

  try {
    // Check products
    const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
    console.log(`✅ Products in database: ${products[0].count}`);
    
    if (products[0].count > 0) {
      const [sampleProducts] = await connection.query('SELECT id, name, product_code FROM products LIMIT 3');
      console.log('   Sample products:');
      sampleProducts.forEach(p => console.log(`   - ${p.name} (ID: ${p.id}, Code: ${p.product_code})`));
    } else {
      console.log('   ⚠️  No products found! Create products via Inventory Dashboard first.');
    }

    // Check production requests
    const [requests] = await connection.query(
      "SELECT COUNT(*) as count FROM production_requests WHERE status = 'pending'"
    );
    console.log(`\n✅ Pending production requests: ${requests[0].count}`);
    
    if (requests[0].count > 0) {
      const [sampleRequests] = await connection.query(
        "SELECT id, request_number, product_name, product_id FROM production_requests WHERE status = 'pending' LIMIT 3"
      );
      console.log('   Sample requests:');
      sampleRequests.forEach(r => {
        const warning = !r.product_id ? ' ⚠️  (Missing product_id)' : '';
        console.log(`   - ${r.request_number}: ${r.product_name} (product_id: ${r.product_id})${warning}`);
      });
    }

    // Check production orders
    const [orders] = await connection.query('SELECT COUNT(*) as count FROM production_orders');
    console.log(`\n✅ Production orders: ${orders[0].count}`);
    
    if (orders[0].count > 0) {
      const [sampleOrders] = await connection.query(`
        SELECT po.id, po.production_number, po.status, p.name as product_name
        FROM production_orders po
        LEFT JOIN products p ON po.product_id = p.id
        ORDER BY po.created_at DESC
        LIMIT 3
      `);
      console.log('   Recent orders:');
      sampleOrders.forEach(o => console.log(`   - ${o.production_number}: ${o.product_name || 'No product'} (${o.status})`));
    }

    // Check production stages
    const [stages] = await connection.query(`
      SELECT COUNT(*) as count FROM production_stages
    `);
    console.log(`\n✅ Production stages: ${stages[0].count}`);
    
    if (stages[0].count > 0) {
      const [stageStatus] = await connection.query(`
        SELECT status, COUNT(*) as count 
        FROM production_stages 
        GROUP BY status
      `);
      console.log('   Stage status breakdown:');
      stageStatus.forEach(s => console.log(`   - ${s.status}: ${s.count}`));
    }

    // Check for the specific "customize saree" order
    console.log('\n🔍 Checking for "customize saree" order...');
    const [customizeOrder] = await connection.query(`
      SELECT id, request_number, product_name, product_id, status
      FROM production_requests
      WHERE product_name LIKE '%customize saree%'
      LIMIT 1
    `);
    
    if (customizeOrder.length > 0) {
      const order = customizeOrder[0];
      console.log(`✅ Found: ${order.request_number} (Status: ${order.status})`);
      console.log(`   Product Name: ${order.product_name}`);
      console.log(`   Product ID: ${order.product_id || '⚠️  MISSING - This is why you see the product selection dialog'}`);
      
      if (!order.product_id) {
        console.log('\n💡 Solution: Select a product from the dialog or create one via Inventory Dashboard');
      }
    } else {
      console.log('❌ "customize saree" order not found in production_requests');
    }

    console.log('\n✅ Diagnostic complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

runDiagnostics();