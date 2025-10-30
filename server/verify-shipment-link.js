const { sequelize } = require('./config/database');

async function linkExistingShipments() {
  try {
    console.log('Checking for shipments to link...\n');
    
    // Get all shipments with status 'preparing' and link to production orders via sales_order_id
    const shipments = await sequelize.query(
      `SELECT s.id, s.sales_order_id, po.id as po_id
       FROM shipments s
       LEFT JOIN production_orders po ON s.sales_order_id = po.sales_order_id
       WHERE s.sales_order_id IS NOT NULL
         AND po.id IS NOT NULL
         AND po.shipment_id IS NULL
       LIMIT 20`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`Found ${shipments.length} shipments to link`);
    
    if (shipments.length > 0) {
      console.log('\nLinking shipments to production orders:');
      for (const s of shipments) {
        await sequelize.query(
          `UPDATE production_orders 
           SET shipment_id = ${s.id}
           WHERE id = ${s.po_id}`
        );
        console.log(`  ✓ Linked Shipment ${s.id} → ProductionOrder ${s.po_id}`);
      }
    }
    
    // Verify the connection
    console.log('\n📊 Verification:');
    const verified = await sequelize.query(
      `SELECT 
         COUNT(*) as total_production_orders,
         SUM(CASE WHEN shipment_id IS NOT NULL THEN 1 ELSE 0 END) as linked_to_shipments
       FROM production_orders
       WHERE status IN ('completed', 'quality_check', 'finishing', 'ready_for_shipment')`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`  • Total eligible orders: ${verified[0].total_production_orders}`);
    console.log(`  • Linked to shipments: ${verified[0].linked_to_shipments}`);
    
    console.log('\n✓ Ready for shipment handoff workflow complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

linkExistingShipments();