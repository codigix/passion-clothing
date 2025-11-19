const { 
  ProductionOrder, 
  Shipment, 
  SalesOrder, 
  Customer, 
  Product 
} = require('./config/database');
const { Op } = require('sequelize');

async function diagnoseWorkflow() {
  try {
    console.log('\n========== DIAGNOSING SHIPMENT WORKFLOW ISSUE ==========\n');

    // 1. Check production orders in final stages
    console.log('1️⃣  PRODUCTION ORDERS IN FINAL STAGES:');
    const finalStageOrders = await ProductionOrder.findAll({
      where: {
        status: { [Op.in]: ['completed', 'quality_check', 'finishing'] }
      },
      include: [
        { model: SalesOrder, as: 'salesOrder' },
        { model: Product, as: 'product' }
      ],
      limit: 5,
      raw: false
    });

    if (finalStageOrders.length === 0) {
      console.log('  ❌ NO production orders found in final stages');
    } else {
      finalStageOrders.forEach((order, idx) => {
        console.log(`\n  ${idx + 1}. #${order.production_number} - ${order.status.toUpperCase()}`);
        console.log(`     Sales Order: ${order.salesOrder?.order_number}`);
        console.log(`     Shipment ID: ${order.shipment_id ? '✅ ' + order.shipment_id : '❌ NONE'}`);
      });
    }

    // 2. Check recent shipments
    console.log('\n\n2️⃣  RECENT SHIPMENTS (Last 24 hours):');
    const recentShipments = await Shipment.findAll({
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      order: [['created_at', 'DESC']],
      limit: 5,
      raw: true
    });

    if (recentShipments.length === 0) {
      console.log('  ❌ NO recent shipments found');
    } else {
      recentShipments.forEach((shipment, idx) => {
        console.log(`\n  ${idx + 1}. #${shipment.shipment_number}`);
        console.log(`     Status: ${shipment.status}`);
        console.log(`     Sales Order ID: ${shipment.sales_order_id}`);
      });
    }

    // 3. Check if production orders are linked to shipments
    console.log('\n\n3️⃣  PRODUCTION ORDERS LINKED TO SHIPMENTS:');
    const linkedOrders = await ProductionOrder.findAll({
      where: {
        shipment_id: { [Op.not]: null }
      },
      include: [
        { model: Shipment, as: 'shipment' }
      ],
      limit: 5,
      raw: false
    });

    if (linkedOrders.length === 0) {
      console.log('  ❌ NO production orders linked to shipments');
    } else {
      linkedOrders.forEach((order, idx) => {
        console.log(`\n  ${idx + 1}. #${order.production_number}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Shipment: ${order.shipment?.shipment_number || 'NOT FOUND'}`);
      });
    }

    // 4. Test the incoming orders query
    console.log('\n\n4️⃣  INCOMING ORDERS ENDPOINT SIMULATION:');
    const statusFilter = ['completed', 'quality_check', 'finishing'];
    const productionOrders = await ProductionOrder.findAll({
      where: { 
        status: { [Op.in]: statusFilter }
      },
      include: [
        {
          model: SalesOrder,
          as: 'salesOrder',
          include: [{ model: Customer, as: 'customer' }]
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: 5
    });

    console.log(`  Found ${productionOrders.length} orders to process:`);
    
    for (let i = 0; i < productionOrders.length; i++) {
      const order = productionOrders[i];
      console.log(`\n  ${i + 1}. #${order.production_number} (${order.status})`);
      
      // Try to find shipment
      let shipment = null;
      if (order.shipment_id) {
        shipment = await Shipment.findOne({
          where: { id: order.shipment_id },
          attributes: ['id', 'shipment_number', 'status'],
          raw: true
        });
        console.log(`     Shipment (by ID): ${shipment ? '✅ ' + shipment.shipment_number : '❌ NOT FOUND'}`);
      } else {
        if (order.sales_order_id) {
          shipment = await Shipment.findOne({
            where: { sales_order_id: order.sales_order_id },
            attributes: ['id', 'shipment_number', 'status'],
            raw: true
          });
          console.log(`     Shipment (by sales_order_id): ${shipment ? '✅ ' + shipment.shipment_number : '❌ NONE'}`);
        } else {
          console.log(`     Shipment: ❌ NO sales_order_id`);
        }
      }
      
      if (shipment) {
        console.log(`     Shipment Status: ${shipment.status}`);
      }
    }

    // 5. Check for any errors in the last hour
    console.log('\n\n5️⃣  SUMMARY:');
    console.log(`  Production Orders in Final Stages: ${finalStageOrders.length}`);
    console.log(`  Recent Shipments Created: ${recentShipments.length}`);
    console.log(`  Linked Production Orders: ${linkedOrders.length}`);
    console.log(`  Orders Ready for Shipment Query: ${productionOrders.length}`);

    // Recommendations
    if (productionOrders.length === 0) {
      console.log('\n  🔴 ISSUE: No orders found in final stages!');
      console.log('     → Check if production orders are being completed properly');
    } else if (productionOrders.length > 0 && linkedOrders.length === 0) {
      console.log('\n  🔴 ISSUE: Orders in final stages but NO shipments created!');
      console.log('     → The "Mark as Ready for Shipment" action might not be working');
      console.log('     → Check manufacturing route for errors');
    } else if (linkedOrders.length > 0 && linkedOrders.some(o => !o.shipment)) {
      console.log('\n  🟡 WARNING: Some orders linked to shipments but shipment not found!');
      console.log('     → Check database integrity');
    } else {
      console.log('\n  ✅ WORKFLOW WORKING: Orders properly linked to shipments!');
    }

    console.log('\n========== END DIAGNOSIS ==========\n');

  } catch (error) {
    console.error('\n❌ DIAGNOSIS ERROR:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

diagnoseWorkflow();