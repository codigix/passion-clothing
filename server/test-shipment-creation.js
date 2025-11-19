const { ProductionOrder, Shipment, SalesOrder } = require('./config/database');
const { Op } = require('sequelize');

async function test() {
  try {
    console.log('\n✅ TEST: Simulate marking order as ready for shipment\n');

    // Get a completed production order
    const order = await ProductionOrder.findOne({
      where: { status: 'completed' },
      include: [{ model: SalesOrder, as: 'salesOrder' }]
    });

    if (!order) {
      console.log('❌ No completed production orders found!');
      process.exit(0);
    }

    console.log(`1️⃣  Order found: ${order.production_number}`);
    console.log(`    Current status: ${order.status}`);
    console.log(`    Current shipment_id: ${order.shipment_id}`);
    console.log(`    Sales Order ID: ${order.sales_order_id}`);

    // Check existing shipments for this sales order
    console.log(`\n2️⃣  Checking existing shipments for sales_order_id=${order.sales_order_id}:`);
    const existingShipment = await Shipment.findOne({
      where: {
        sales_order_id: order.sales_order_id,
        status: { [Op.notIn]: ['returned', 'cancelled', 'failed_delivery', 'delivered'] }
      }
    });

    if (existingShipment) {
      console.log(`    ⚠️  Active shipment exists: ${existingShipment.shipment_number} (${existingShipment.status})`);
    } else {
      console.log(`    ✅ No active shipments found (can create new)`);
    }

    // Simulate what the endpoint would do
    console.log(`\n3️⃣  Simulating shipment creation...`);
    const mockShipment = {
      id: 999,  // Mock ID
      shipment_number: 'TEST-SHP-001'
    };

    console.log(`    Would create shipment: ${mockShipment.shipment_number} with ID=${mockShipment.id}`);

    // Test the incoming orders query
    console.log(`\n4️⃣  Testing incoming orders query logic:\n`);

    const incomingOrders = await ProductionOrder.findAll({
      where: { status: { [Op.in]: ['completed', 'finishing', 'quality_check'] } },
      attributes: ['id', 'production_number', 'status', 'sales_order_id', 'shipment_id']
    });

    console.log(`    Found ${incomingOrders.length} orders in ready statuses:`);
    for (const ord of incomingOrders) {
      console.log(`      - ${ord.production_number}: status=${ord.status}, shipment_id=${ord.shipment_id}`);

      // For each order, check what the endpoint would do
      let shipment = null;
      if (ord.shipment_id) {
        shipment = await Shipment.findByPk(ord.shipment_id);
        console.log(`        └─ Has shipment_id, found: ${shipment?.shipment_number || 'NOT FOUND'}`);
      } else if (ord.sales_order_id) {
        shipment = await Shipment.findOne({
          where: { sales_order_id: ord.sales_order_id }
        });
        console.log(`        └─ No shipment_id, searched by sales_order_id, found: ${shipment?.shipment_number || 'NONE'}`);
      }
    }

    console.log('\n✅ TEST COMPLETE\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();