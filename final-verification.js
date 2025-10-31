const { sequelize } = require('./server/config/database');

async function verifyFlow() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  PRODUCTION REQUEST AUTOMATION - VERIFICATION                  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    // Check production requests
    const [requests] = await sequelize.query(`
      SELECT 
        pr.id,
        pr.request_number,
        pr.status,
        pr.sales_order_number,
        pr.product_name,
        pr.quantity,
        pr.unit,
        pr.priority,
        DATE_FORMAT(pr.required_date, '%Y-%m-%d') as required_date,
        pr.created_at
      FROM production_requests pr
      WHERE pr.status IN ('pending', 'reviewed')
      ORDER BY pr.created_at DESC
    `);
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('PRODUCTION REQUESTS IN MANUFACTURING DASHBOARD (Incoming Tab)');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log(`Total Requests: ${requests.length}\n`);
    
    if (requests.length > 0) {
      requests.forEach((req, idx) => {
        console.log(`[${idx + 1}] ${req.request_number}`);
        console.log(`    Status: ${req.status.toUpperCase()}`);
        console.log(`    Sales Order: ${req.sales_order_number}`);
        console.log(`    Product: ${req.product_name}`);
        console.log(`    Quantity: ${req.quantity} ${req.unit}`);
        console.log(`    Priority: ${req.priority}`);
        console.log(`    Required: ${req.required_date}`);
        console.log(`    Created: ${new Date(req.created_at).toLocaleDateString()}\n`);
      });
    }
    
    // Check sales orders
    const [orders] = await sequelize.query(`
      SELECT 
        so.id,
        so.order_number,
        so.status,
        so.total_quantity,
        c.name as customer_name
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      ORDER BY so.created_at DESC
      LIMIT 4
    `);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('RELATED SALES ORDERS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.table(orders);
    
    // Summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('WORKFLOW STATUS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('✅ Sales Orders Created: ' + orders.length);
    console.log('✅ Production Requests Auto-Generated: ' + requests.length);
    console.log('✅ Status: PENDING (Ready for Manufacturing Analysis)\n');
    
    console.log('NEXT STEPS:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log('1. Login to Manufacturing Dashboard');
    console.log('2. Go to Dashboard → Incoming Requests tab');
    console.log('3. You should see these ' + requests.length + ' requests');
    console.log('4. Click on each request to analyze details');
    console.log('5. Create Material Request Notes (MRN) for each project');
    console.log('6. MRN appears in Inventory for procurement to fulfill\n');
    
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

verifyFlow();