const path = require('path');
const { Sequelize, ProductionOrder, Shipment, SalesOrder, Customer, Product } = require(path.join(__dirname, 'server/config/database'));
const { Op } = require('sequelize');

async function diagnose() {
  try {
    console.log('\n========== DIAGNOSING INCOMING ORDERS ISSUE ==========\n');

    // 1. Check all production orders
    console.log('1️⃣  ALL PRODUCTION ORDERS:');
    const allOrders = await ProductionOrder.findAll({
      attributes: ['id', 'production_number', 'status', 'sales_order_id', 'shipment_id', 'updated_at'],
      include: [{ model: SalesOrder, as: 'salesOrder', attributes: ['id', 'order_number'] }],
      raw: false
    });
    
    console.log(`Total production orders: ${allOrders.length}`);
    allOrders.forEach(order => {
      console.log(`  - ${order.production_number}: status="${order.status}", shipment_id=${order.shipment_id}, sales_order=${order.salesOrder?.order_number}`);
    });

    // 2. Check production orders in final stages
    console.log('\n2️⃣  PRODUCTION ORDERS IN FINAL STAGES (completed, finishing, quality_check):');
    const finalStages = ['completed', 'finishing', 'quality_check'];
    const ordersInFinalStages = await ProductionOrder.findAll({
      where: { status: { [Op.in]: finalStages } },
      attributes: ['id', 'production_number', 'status', 'sales_order_id', 'shipment_id'],
      include: [{ model: SalesOrder, as: 'salesOrder', attributes: ['order_number'] }],
      raw: false
    });
    
    console.log(`Orders in final stages: ${ordersInFinalStages.length}`);
    ordersInFinalStages.forEach(order => {
      console.log(`  - ${order.production_number}: status="${order.status}", shipment_id=${order.shipment_id}`);
    });

    // 3. Check shipments
    console.log('\n3️⃣  ALL SHIPMENTS:');
    const shipments = await Shipment.findAll({
      attributes: ['id', 'shipment_number', 'status', 'sales_order_id', 'created_at'],
      include: [{ model: SalesOrder, as: 'salesOrder', attributes: ['order_number'] }],
      raw: false
    });
    
    console.log(`Total shipments: ${shipments.length}`);
    shipments.forEach(ship => {
      console.log(`  - ${ship.shipment_number}: status="${ship.status}", sales_order=${ship.salesOrder?.order_number}`);
    });

    // 4. Test the incoming orders query
    console.log('\n4️⃣  TESTING INCOMING ORDERS QUERY:');
    const productionWhere = { 
      status: { [Op.in]: finalStages }
    };
    
    const testOrders = await ProductionOrder.findAll({
      where: productionWhere,
      include: [
        {
          model: SalesOrder,
          as: 'salesOrder',
          include: [{ model: Customer, as: 'customer' }]
        },
        {
          model: Product,
          as: 'product'
        }
      ],
      attributes: ['id', 'production_number', 'status', 'sales_order_id', 'shipment_id'],
      limit: 20
    });

    console.log(`Orders found by query: ${testOrders.length}`);
    testOrders.forEach(order => {
      console.log(`  - ${order.production_number}: status="${order.status}", shipment_id=${order.shipment_id}`);
    });

    // 5. Check shipment_id column
    console.log('\n5️⃣  PRODUCTION_ORDERS TABLE STRUCTURE:');
    const sequelize = ProductionOrder.sequelize;
    const attributes = ProductionOrder.rawAttributes;
    if (attributes.shipment_id) {
      console.log('  ✅ shipment_id column exists');
      console.log(`     Type: ${attributes.shipment_id.type.constructor.name}`);
    } else {
      console.log('  ❌ shipment_id column MISSING!');
    }

    // 6. Check associations
    console.log('\n6️⃣  CHECKING ASSOCIATIONS:');
    const associations = ProductionOrder.associations;
    console.log(`ProductionOrder associations:`, Object.keys(associations));
    
    const shipmentAssociations = Shipment.associations;
    console.log(`Shipment associations:`, Object.keys(shipmentAssociations));

    // 7. Most recent production order with shipment
    console.log('\n7️⃣  MOST RECENT ORDER WITH SHIPMENT:');
    const recentWithShipment = await ProductionOrder.findOne({
      where: { shipment_id: { [Op.not]: null } },
      order: [['updated_at', 'DESC']],
      include: [
        { model: SalesOrder, as: 'salesOrder', attributes: ['order_number'] },
        { model: Shipment, as: 'shipment', attributes: ['shipment_number', 'status'] }
      ],
      attributes: ['production_number', 'status', 'shipment_id']
    });

    if (recentWithShipment) {
      console.log(`  ✅ Found: ${recentWithShipment.production_number}`);
      console.log(`     Status: ${recentWithShipment.status}`);
      console.log(`     Shipment ID: ${recentWithShipment.shipment_id}`);
      console.log(`     Shipment: ${recentWithShipment.shipment?.shipment_number} (${recentWithShipment.shipment?.status})`);
    } else {
      console.log('  ⚠️  No production orders with shipment_id found');
    }

    console.log('\n========== END DIAGNOSTICS ==========\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

diagnose();