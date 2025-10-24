const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'passion_erp'
    });
    
    // Check production orders for SO-S0-20251016-0001 or similar
    const [orders] = await conn.execute(`
      SELECT 
        id, 
        orderNumber,
        sales_order_id, 
        production_approval_id, 
        status, 
        created_at 
      FROM production_orders 
      WHERE sales_order_id LIKE '%20251016%' 
         OR orderNumber LIKE '%SO-S0%'
      ORDER BY created_at DESC 
      LIMIT 15
    `);
    
    console.log('=== PRODUCTION ORDERS ===');
    console.log(JSON.stringify(orders, null, 2));
    
    // Also check sales orders
    const [sales] = await conn.execute(`
      SELECT id, sales_order_number, status 
      FROM sales_orders 
      WHERE sales_order_number LIKE '%20251016%' 
      LIMIT 5
    `);
    
    console.log('\n=== SALES ORDERS ===');
    console.log(JSON.stringify(sales, null, 2));
    
    // Check approvals
    const [approvals] = await conn.execute(`
      SELECT id, approval_number, status, sales_order_id 
      FROM production_approvals 
      WHERE sales_order_id LIKE '%20251016%'
      LIMIT 10
    `);
    
    console.log('\n=== PRODUCTION APPROVALS ===');
    console.log(JSON.stringify(approvals, null, 2));
    
    await conn.end();
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();