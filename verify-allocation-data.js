const { sequelize } = require('./server/config/database');

async function verifyAllocationData() {
  try {
    console.log('🔍 Verifying Material Allocation Data...\n');

    // Check Sales Orders
    const ordersData = await sequelize.query(`
      SELECT id, order_number, status, final_amount, total_quantity, created_at
      FROM sales_orders
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log(`✓ Total Sales Orders Found: ${ordersData.length}`);

    if (ordersData.length > 0) {
      console.log('\n📋 Sample Sales Orders:');
      ordersData.slice(0, 3).forEach(order => {
        console.log(`  - ${order.order_number}: ${order.status} (Amount: ₹${order.final_amount}, Qty: ${order.total_quantity})`);
      });
    }

    // Check Inventory with project_specific stock
    const projectSpecificInventory = await sequelize.query(`
      SELECT id, product_name, category, current_stock, consumed_quantity, sales_order_id
      FROM inventory
      WHERE stock_type = 'project_specific' AND is_active = 1
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log(`\n✓ Project-Specific Inventory Items: ${projectSpecificInventory.length}`);

    if (projectSpecificInventory.length > 0) {
      console.log('\n📦 Sample Allocated Materials:');
      projectSpecificInventory.slice(0, 3).forEach(inv => {
        console.log(`  - ${inv.product_name} (${inv.category}): Allocated=${inv.current_stock}, Consumed=${inv.consumed_quantity}, Project=${inv.sales_order_id}`);
      });
    }

    // Get projects with allocations
    const projectsWithAllocations = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT so.id) as total_projects,
        SUM(CASE WHEN inv.stock_type='project_specific' THEN 1 ELSE 0 END) as total_materials,
        SUM(CASE WHEN inv.stock_type='project_specific' THEN inv.current_stock ELSE 0 END) as total_allocated,
        SUM(CASE WHEN inv.stock_type='project_specific' THEN inv.consumed_quantity ELSE 0 END) as total_consumed
      FROM sales_orders so
      LEFT JOIN inventory inv ON so.id = inv.sales_order_id AND inv.is_active = 1
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n📊 Allocation Summary:');
    const summary = projectsWithAllocations[0];
    const totalAllocated = parseFloat(summary.total_allocated) || 0;
    const totalConsumed = parseFloat(summary.total_consumed) || 0;
    console.log(`  - Projects: ${summary.total_projects}`);
    console.log(`  - Materials: ${summary.total_materials || 0}`);
    console.log(`  - Total Allocated: ${totalAllocated.toFixed(2)} units`);
    console.log(`  - Total Consumed: ${totalConsumed.toFixed(2)} units`);

    if (projectSpecificInventory.length === 0) {
      console.log('\n⚠️  No project-specific inventory found!');
      console.log('\n💡 To create test data, run:');
      console.log('   node create-allocation-test-data.js');
    } else {
      console.log('\n✅ Real allocation data is being fetched!');
    }

    console.log('\n✅ Verification Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAllocationData();