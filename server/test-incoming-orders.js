const { sequelize } = require('./config/database');

async function testIncomingOrdersEndpoint() {
  try {
    console.log('Testing Incoming Orders Endpoint...\n');
    
    // Simulate what the shipments endpoint does
    const orders = await sequelize.query(
      `SELECT DISTINCT
        po.id,
        po.production_number,
        po.status,
        po.quantity,
        po.shipment_id,
        so.id as sales_order_id,
        so.order_number,
        s.id as current_shipment_id,
        s.shipment_number,
        s.status as shipment_status
      FROM production_orders po
      LEFT JOIN sales_orders so ON po.sales_order_id = so.id
      LEFT JOIN shipments s ON po.sales_order_id = s.sales_order_id
      WHERE po.status IN ('completed', 'quality_check', 'finishing')
      LIMIT 10`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`Found ${orders.length} orders in incoming orders pipeline:\n`);
    
    orders.forEach((order, i) => {
      console.log(`  ${i + 1}. Production #${order.production_number}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Sales Order: #${order.order_number || 'N/A'}`);
      console.log(`     Shipment Linked: ${order.shipment_id ? 'YES (ID: ' + order.shipment_id + ')' : 'NO'}`);
      console.log(`     Shipment #: ${order.shipment_number || 'N/A'} (${order.shipment_status || 'N/A'})`);
      console.log();
    });
    
    console.log('✓ Endpoint test complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testIncomingOrdersEndpoint();