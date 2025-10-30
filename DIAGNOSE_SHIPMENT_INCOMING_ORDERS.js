/**
 * Diagnostic script to check why completed production orders aren't showing in shipment incoming orders
 * Run: node DIAGNOSE_SHIPMENT_INCOMING_ORDERS.js
 */

require('dotenv').config({ path: './server/.env' });
const { ProductionOrder, Shipment, SalesOrder, Customer, Product, Op } = require('./server/config/database');

async function diagnose() {
  try {
    console.log('\n📋 SHIPMENT INCOMING ORDERS DIAGNOSIS\n');
    console.log('=====================================\n');

    // 1. Check for completed production orders WITHOUT shipments
    console.log('1️⃣  COMPLETED PRODUCTION ORDERS (No Shipment Yet):');
    const completedNoShipment = await ProductionOrder.findAll({
      where: {
        status: 'completed',
        shipment_id: { [Op.is]: null }
      },
      include: [
        { model: SalesOrder, as: 'salesOrder', include: [{ model: Customer, as: 'customer' }] },
        { model: Product, as: 'product' }
      ],
      limit: 5
    });

    if (completedNoShipment.length > 0) {
      console.log(`   ✅ Found ${completedNoShipment.length} completed orders ready for shipment:\n`);
      completedNoShipment.forEach(order => {
        console.log(`   • ${order.production_number} (ID: ${order.id})`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Shipment ID: ${order.shipment_id}`);
        console.log(`     Sales Order: ${order.salesOrder?.order_number}`);
        console.log('');
      });
    } else {
      console.log('   ❌ NO completed production orders found without shipments\n');
    }

    // 2. Check for completed production orders WITH shipments
    console.log('2️⃣  COMPLETED PRODUCTION ORDERS (With Shipment):');
    const completedWithShipment = await ProductionOrder.findAll({
      where: {
        status: 'completed',
        shipment_id: { [Op.not]: null }
      },
      include: [
        { model: SalesOrder, as: 'salesOrder' },
        { model: Product, as: 'product' }
      ],
      limit: 5
    });

    if (completedWithShipment.length > 0) {
      console.log(`   ✅ Found ${completedWithShipment.length} completed orders with shipments:\n`);
      completedWithShipment.forEach(order => {
        console.log(`   • ${order.production_number} (Shipment ID: ${order.shipment_id})`);
        console.log(`     Status: ${order.status}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  NO completed production orders found WITH shipments\n');
    }

    // 3. Check for production orders in OTHER statuses that might be ready
    console.log('3️⃣  PRODUCTION ORDERS IN OTHER STATUSES:');
    const otherStatuses = await ProductionOrder.findAll({
      where: {
        status: { [Op.in]: ['quality_check', 'finishing', 'in_progress'] }
      },
      attributes: ['id', 'production_number', 'status'],
      limit: 5
    });

    if (otherStatuses.length > 0) {
      console.log(`   Found ${otherStatuses.length} orders:\n`);
      otherStatuses.forEach(order => {
        console.log(`   • ${order.production_number} - Status: ${order.status}`);
      });
      console.log('');
    } else {
      console.log('   No orders in quality_check, finishing, or in_progress\n');
    }

    // 4. Check shipments with status 'preparing'
    console.log('4️⃣  SHIPMENTS WITH STATUS "preparing":');
    const preparingShipments = await Shipment.findAll({
      where: { status: 'preparing' },
      include: [{ model: SalesOrder, as: 'salesOrder' }],
      limit: 5
    });

    if (preparingShipments.length > 0) {
      console.log(`   ✅ Found ${preparingShipments.length} shipments in preparing status:\n`);
      preparingShipments.forEach(shipment => {
        console.log(`   • ${shipment.shipment_number} (ID: ${shipment.id})`);
        console.log(`     Status: ${shipment.status}`);
        console.log(`     Created: ${shipment.created_at}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  NO shipments found in preparing status\n');
    }

    // 5. Check all shipment statuses count
    console.log('5️⃣  SHIPMENT STATUS DISTRIBUTION:');
    const statusCounts = await Shipment.findAll({
      attributes: [
        'status',
        [Shipment.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    statusCounts.forEach(stat => {
      console.log(`   • ${stat.status}: ${stat.count}`);
    });
    console.log('');

    // 6. Test the incoming orders endpoint filter
    console.log('6️⃣  TESTING INCOMING ORDERS ENDPOINT FILTER:');
    const testFilter = await ProductionOrder.findAll({
      where: {
        status: { [Op.in]: ['completed', 'quality_check', 'finishing'] }
      },
      attributes: ['id', 'production_number', 'status', 'shipment_id'],
      limit: 5
    });

    console.log(`   Filter: status IN ['completed', 'quality_check', 'finishing']`);
    console.log(`   ✅ Found ${testFilter.length} matching orders:\n`);
    if (testFilter.length > 0) {
      testFilter.forEach(order => {
        console.log(`   • ${order.production_number} - Status: ${order.status} - Has Shipment: ${!!order.shipment_id}`);
      });
    } else {
      console.log('   ❌ No orders match this filter');
    }
    console.log('');

    console.log('=====================================\n');
    console.log('💡 DIAGNOSIS COMPLETE\n');
    console.log('KEY QUESTIONS TO CHECK:');
    console.log('1. Are there any completed production orders WITHOUT shipments?');
    console.log('2. Are there shipments with status "preparing"?');
    console.log('3. What status are recent production orders in?');
    console.log('4. Have you actually marked an order as ready for shipment?\n');

  } catch (error) {
    console.error('❌ Diagnosis error:', error);
  } finally {
    process.exit(0);
  }
}

diagnose();