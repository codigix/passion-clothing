const { sequelize, ProductionRequest } = require('./server/config/database');

async function resetProductionRequests() {
  try {
    console.log('\n=== RESETTING PRODUCTION REQUEST STATUSES ===\n');
    
    // Reset all 'reviewed' status to 'pending' to represent unreviewed requests
    const [updated] = await sequelize.query(`
      UPDATE production_requests
      SET status = 'pending'
      WHERE status = 'reviewed'
    `);
    
    console.log(`✅ Updated ${updated} production requests to 'pending' status\n`);
    
    // Verify the changes
    const [verify] = await sequelize.query(`
      SELECT 
        pr.id,
        pr.request_number,
        pr.status,
        so.order_number,
        pr.quantity,
        pr.product_name,
        pr.created_at
      FROM production_requests pr
      LEFT JOIN sales_orders so ON pr.sales_order_id = so.id
      ORDER BY pr.created_at DESC
    `);
    
    console.log('=== PRODUCTION REQUESTS (Updated) ===\n');
    console.table(verify);
    
    // Show status breakdown
    const [statusBreakdown] = await sequelize.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM production_requests
      GROUP BY status
    `);
    
    console.log('\n=== STATUS BREAKDOWN ===\n');
    console.table(statusBreakdown);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

resetProductionRequests();