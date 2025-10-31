const { sequelize } = require('./server/config/database');

async function checkAllocationData() {
  try {
    console.log('\n=== CHECKING INVENTORY DATA ===\n');
    
    // Check total inventory
    const [totalInv] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(current_stock) as total_stock,
        SUM(reserved_stock) as total_reserved,
        SUM(consumed_quantity) as total_consumed,
        GROUP_CONCAT(DISTINCT stock_type) as all_types
      FROM inventory
      WHERE is_active = 1
    `);
    console.log('Total Inventory:', totalInv[0]);
    
    // Check inventory by project
    console.log('\n=== INVENTORY BY SALES ORDER ===\n');
    const [byProject] = await sequelize.query(`
      SELECT 
        so.id as so_id,
        so.order_number,
        so.status,
        so.total_quantity,
        COUNT(i.id) as item_count,
        SUM(i.current_stock) as total_stock,
        SUM(i.reserved_stock) as total_reserved,
        SUM(i.consumed_quantity) as total_consumed,
        GROUP_CONCAT(DISTINCT i.stock_type) as stock_types
      FROM sales_orders so
      LEFT JOIN inventory i ON so.id = i.sales_order_id AND i.is_active = 1
      GROUP BY so.id, so.order_number, so.status, so.total_quantity
      ORDER BY so.created_at DESC
      LIMIT 5
    `);
    console.table(byProject);
    
    // Check inventory items directly
    console.log('\n=== INVENTORY ITEMS SAMPLE ===\n');
    const [items] = await sequelize.query(`
      SELECT 
        i.id,
        i.product_id,
        i.stock_type,
        i.current_stock,
        i.reserved_stock,
        i.consumed_quantity,
        i.sales_order_id,
        i.purchase_order_id
      FROM inventory i
      WHERE i.is_active = 1
      LIMIT 10
    `);
    console.table(items);
    
    // Check if there are any allocations at all
    console.log('\n=== CHECKING ALLOCATIONS TABLE ===\n');
    const [allocCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM material_allocations
    `);
    console.log('Material Allocations Count:', allocCount[0]);
    
    // Sample allocation records
    const [allocSample] = await sequelize.query(`
      SELECT * FROM material_allocations LIMIT 5
    `);
    console.table(allocSample);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAllocationData();