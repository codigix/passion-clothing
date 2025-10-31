const { sequelize, ProductionRequest, SalesOrder } = require('./server/config/database');

async function checkProductionRequests() {
  try {
    console.log('\n=== CHECKING PRODUCTION REQUESTS ===\n');
    
    // Check if any production requests exist
    const [allRequests] = await sequelize.query(`
      SELECT 
        pr.id,
        pr.request_number,
        pr.status,
        pr.sales_order_id,
        pr.created_at,
        so.order_number
      FROM production_requests pr
      LEFT JOIN sales_orders so ON pr.sales_order_id = so.id
      ORDER BY pr.created_at DESC
      LIMIT 10
    `);
    
    console.log(`Total Production Requests: ${allRequests.length}\n`);
    console.table(allRequests);
    
    // Check by status
    const [byStatus] = await sequelize.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM production_requests
      GROUP BY status
    `);
    
    console.log('\n=== PRODUCTION REQUESTS BY STATUS ===\n');
    console.table(byStatus);
    
    // Check sales orders and their status
    const [salesOrders] = await sequelize.query(`
      SELECT 
        id,
        order_number,
        status,
        created_at
      FROM sales_orders
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('\n=== RECENT SALES ORDERS ===\n');
    console.table(salesOrders);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkProductionRequests();