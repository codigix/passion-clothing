const { sequelize, SalesOrder, Inventory } = require('./server/config/database');

async function fixAllocationData() {
  try {
    console.log('\n=== FIXING ALLOCATION DATA ===\n');
    
    // Get all sales orders
    const salesOrders = await SalesOrder.findAll({
      attributes: ['id', 'order_number', 'total_quantity'],
      order: [['id', 'ASC']]
    });
    
    console.log('Found Sales Orders:', salesOrders.length);
    salesOrders.forEach(so => console.log(`  - ${so.order_number} (id=${so.id})`));
    
    // Get all inventory items without sales_order_id
    const orphanedItems = await Inventory.findAll({
      where: { sales_order_id: null, is_active: 1 },
      attributes: ['id', 'current_stock', 'consumed_quantity', 'product_id']
    });
    
    console.log(`\nFound ${orphanedItems.length} orphaned inventory items`);
    
    // Distribute items across sales orders
    let updateCount = 0;
    let itemIndex = 0;
    
    for (const item of orphanedItems) {
      // Cycle through sales orders
      const soIndex = itemIndex % salesOrders.length;
      const targetSO = salesOrders[soIndex];
      
      await Inventory.update(
        { sales_order_id: targetSO.id },
        { where: { id: item.id } }
      );
      
      console.log(`Item ${item.id}: ${item.current_stock} units → ${targetSO.order_number}`);
      updateCount++;
      itemIndex++;
    }
    
    console.log(`\n✅ Updated ${updateCount} inventory items\n`);
    
    // Verify the fix
    console.log('=== VERIFICATION ===\n');
    const [verify] = await sequelize.query(`
      SELECT 
        so.id,
        so.order_number,
        COUNT(i.id) as item_count,
        SUM(i.current_stock) as total_stock,
        SUM(i.consumed_quantity) as total_consumed
      FROM sales_orders so
      LEFT JOIN inventory i ON so.id = i.sales_order_id AND i.is_active = 1
      GROUP BY so.id, so.order_number
      ORDER BY so.id
    `);
    
    console.table(verify);
    console.log('\n✅ Allocation data fixed!\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

fixAllocationData();