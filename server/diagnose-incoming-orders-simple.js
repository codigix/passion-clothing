const { ProductionOrder, Shipment, SalesOrder, Customer, Product } = require('./config/database');
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

    // 4. Check what statuses exist
    console.log('\n4️⃣  ALL PRODUCTION ORDER STATUSES:');
    const statusCounts = await ProductionOrder.findAll({
      attributes: [
        'status',
        [ProductionOrder.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });
    statusCounts.forEach(stat => {
      console.log(`  ${stat.status}: ${stat.count} orders`);
    });

    // 5. Most recent production order
    console.log('\n5️⃣  MOST RECENT PRODUCTION ORDERS:');
    const recentOrders = await ProductionOrder.findAll({
      order: [['updated_at', 'DESC']],
      limit: 5,
      attributes: ['production_number', 'status', 'sales_order_id', 'shipment_id', 'updated_at']
    });
    recentOrders.forEach(order => {
      console.log(`  - ${order.production_number}: status="${order.status}", shipment_id=${order.shipment_id}`);
    });

    console.log('\n========== END DIAGNOSTICS ==========\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

diagnose();