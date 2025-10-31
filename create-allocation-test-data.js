const { sequelize } = require('./server/config/database');

async function createAllocationTestData() {
  try {
    console.log('📋 Creating Material Allocation Test Data...\n');

    // Get all sales orders
    const salesOrders = await sequelize.query(`
      SELECT id, order_number, total_quantity
      FROM sales_orders
      LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(`Found ${salesOrders.length} sales orders\n`);

    if (salesOrders.length === 0) {
      console.log('❌ No sales orders found. Cannot create allocation data.');
      process.exit(1);
    }

    // Get available inventory items (that are project-specific)
    const availableInventory = await sequelize.query(`
      SELECT id, product_name, category, current_stock, unit_cost
      FROM inventory
      WHERE stock_type = 'project_specific'
      LIMIT 20
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(`Found ${availableInventory.length} project-specific inventory items\n`);

    let allocationsCreated = 0;

    // Allocate materials to projects
    for (let i = 0; i < salesOrders.length; i++) {
      const project = salesOrders[i];
      const numMaterials = Math.min(3, availableInventory.length);

      for (let j = 0; j < numMaterials; j++) {
        const material = availableInventory[j];
        
        // Calculate allocation based on project quantity
        const allocatedQuantity = Math.ceil(project.total_quantity * (0.5 + Math.random() * 0.5));
        const consumedQuantity = Math.ceil(allocatedQuantity * (0.3 + Math.random() * 0.4));

        await sequelize.query(`
          UPDATE inventory
          SET 
            sales_order_id = :salesOrderId,
            current_stock = :allocated,
            consumed_quantity = :consumed,
            reserved_stock = 0,
            updated_at = NOW()
          WHERE id = :inventoryId
        `, {
          replacements: {
            salesOrderId: project.id,
            allocated: allocatedQuantity,
            consumed: Math.min(consumedQuantity, allocatedQuantity),
            inventoryId: material.id
          },
          type: sequelize.QueryTypes.UPDATE
        });

        allocationsCreated++;
        console.log(`✓ Allocated: ${material.product_name} → ${project.order_number} (${allocatedQuantity} units)`);
      }
    }

    console.log(`\n✅ Successfully created ${allocationsCreated} material allocations!\n`);

    // Verify the allocations
    console.log('📊 Verifying Allocations...\n');
    
    const summary = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT so.id) as total_projects,
        SUM(CASE WHEN inv.stock_type='project_specific' THEN 1 ELSE 0 END) as total_materials,
        SUM(CASE WHEN inv.stock_type='project_specific' THEN inv.current_stock ELSE 0 END) as total_allocated,
        SUM(CASE WHEN inv.stock_type='project_specific' THEN inv.consumed_quantity ELSE 0 END) as total_consumed
      FROM sales_orders so
      LEFT JOIN inventory inv ON so.id = inv.sales_order_id AND inv.is_active = 1
    `, { type: sequelize.QueryTypes.SELECT });

    const summaryData = summary[0];
    const totalAlloc = parseFloat(summaryData.total_allocated) || 0;
    const totalCons = parseFloat(summaryData.total_consumed) || 0;

    console.log('Allocation Summary:');
    console.log(`  - Active Projects with Materials: ${summaryData.total_projects}`);
    console.log(`  - Total Materials Allocated: ${summaryData.total_materials || 0}`);
    console.log(`  - Total Quantity Allocated: ${totalAlloc.toFixed(2)} units`);
    console.log(`  - Total Consumed: ${totalCons.toFixed(2)} units`);
    
    if (totalAlloc > 0) {
      const utilization = ((totalCons / totalAlloc) * 100).toFixed(1);
      console.log(`  - Average Utilization: ${utilization}%`);
    }

    console.log('\n✅ Test data created successfully!');
    console.log('📱 Dashboard is ready with real allocation data!');
    console.log('   Open: http://localhost:3000/inventory/allocation');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAllocationTestData();