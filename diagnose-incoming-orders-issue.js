const { 
  ProductionOrder, 
  Shipment, 
  SalesOrder, 
  Customer, 
  Product 
} = require('./server/config/database');
const { Op } = require('sequelize');

async function diagnoseIncomingOrders() {
  try {
    console.log('\n========== DIAGNOSING INCOMING ORDERS ISSUE ==========\n');

    // 1. Check if any production orders exist in final stages
    console.log('1️⃣  CHECKING PRODUCTION ORDERS IN FINAL STAGES...');
    const finalStageOrders = await ProductionOrder.findAll({
      where: {
        status: { [Op.in]: ['completed', 'quality_check', 'finishing'] }
      },
      include: [
        { model: SalesOrder, as: 'salesOrder' },
        { model: Product, as: 'product' }
      ],
      limit: 10,
      raw: false
    });

    console.log(`Found ${finalStageOrders.length} production orders in final stages:`);
    finalStageOrders.forEach((order, idx) => {
      console.log(`\n  ${idx + 1}. Production Order #${order.production_number}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Shipment ID: ${order.shipment_id || 'NONE'} ⚠️`);
      console.log(`     Sales Order: ${order.salesOrder?.order_number || 'N/A'}`);
      console.log(`     Product: ${order.product?.name || order.specifications?.product_name || 'N/A'}`);
    });

    // 2. Check for shipments created from manufacturing
    console.log('\n\n2️⃣  CHECKING SHIPMENTS CREATED FROM MANUFACTURING...');
    const recentShipments = await Shipment.findAll({
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      order: [['created_at', 'DESC']],
      limit: 10,
      raw: true
    });

    console.log(`Found ${recentShipments.length} shipments created in last 24 hours:`);
    recentShipments.forEach((shipment, idx) => {
      console.log(`\n  ${idx + 1}. Shipment #${shipment.shipment_number}`);
      console.log(`     ID: ${shipment.id}`);
      console.log(`     Status: ${shipment.status}`);
      console.log(`     Sales Order ID: ${shipment.sales_order_id}`);
      console.log(`     Created: ${shipment.created_at}`);
    });

    // 3. Check if production orders are linked to shipments
    console.log('\n\n3️⃣  CHECKING PRODUCTION ORDER TO SHIPMENT LINKS...');
    const linkedOrders = await ProductionOrder.findAll({
      where: {
        shipment_id: { [Op.not]: null },
        status: { [Op.in]: ['completed', 'quality_check', 'finishing'] }
      },
      include: [
        { model: Shipment, as: 'shipment' }
      ],
      limit: 10,
      raw: false
    });

    console.log(`Found ${linkedOrders.length} production orders linked to shipments:`);
    linkedOrders.forEach((order, idx) => {
      console.log(`\n  ${idx + 1}. Production Order #${order.production_number}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Linked Shipment: ${order.shipment?.shipment_number || 'NOT FOUND'}`);
      console.log(`     Shipment Status: ${order.shipment?.status || 'N/A'}`);
    });

    // 4. Simulate what the incoming orders endpoint queries
    console.log('\n\n4️⃣  SIMULATING INCOMING ORDERS ENDPOINT QUERY...');
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
          attributes: ['id', 'name', 'product_code', 'description']
        }
      ],
      order: [['updated_at', 'DESC']],
      attributes: [
        'id',
        'production_number',
        'status',
        'quantity',
        'sales_order_id',
        'shipment_id',
        'product_id',
        'specifications',
        'updated_at'
      ],
      limit: 10
    });

    console.log(`Endpoint would return ${productionOrders.length} orders:`);
    
    for (const order of productionOrders) {
      console.log(`\n  Order #${order.production_number}:`);
      console.log(`    Status: ${order.status}`);
      console.log(`    Shipment ID: ${order.shipment_id || 'NONE'}`);
      console.log(`    Sales Order: ${order.salesOrder?.order_number}`);
      
      // Check if shipment can be found
      let shipment = null;
      if (order.shipment_id) {
        shipment = await Shipment.findOne({
          where: { id: order.shipment_id },
          attributes: ['id', 'shipment_number', 'status'],
          raw: true
        });
        console.log(`    Shipment Found: ${shipment ? '✓ ' + shipment.shipment_number : '✗ NO SHIPMENT FOUND'}`);
        if (shipment) {
          console.log(`    Shipment Status: ${shipment.status}`);
        }
      } else {
        // Try fallback lookup
        shipment = await Shipment.findOne({
          where: { sales_order_id: order.sales_order_id },
          attributes: ['id', 'shipment_number', 'status'],
          raw: true
        });
        console.log(`    Shipment Found (via sales_order_id): ${shipment ? '✓ ' + shipment.shipment_number : '✗ NO SHIPMENT'}`);
      }
    }

    // 5. Check for orphaned shipments (shipments without production order link)
    console.log('\n\n5️⃣  CHECKING FOR ORPHANED SHIPMENTS...');
    const orphanedShipments = await Shipment.findAll({
      where: {
        status: 'preparing'
      },
      attributes: [
        'id',
        'shipment_number',
        'sales_order_id',
        'status',
        'created_at'
      ],
      limit: 10,
      raw: true
    });

    console.log(`Found ${orphanedShipments.length} shipments in "preparing" status:`);
    orphanedShipments.forEach((shipment, idx) => {
      console.log(`\n  ${idx + 1}. Shipment #${shipment.shipment_number}`);
      console.log(`     ID: ${shipment.id}`);
      console.log(`     Sales Order ID: ${shipment.sales_order_id}`);
      console.log(`     Status: ${shipment.status}`);
      console.log(`     Created: ${shipment.created_at}`);
    });

    // 6. Check if production orders exist for those shipments
    console.log('\n\n6️⃣  CHECKING IF PRODUCTION ORDERS LINK TO SHIPMENTS...');
    for (const shipment of orphanedShipments.slice(0, 3)) {
      const linkedOrder = await ProductionOrder.findOne({
        where: { shipment_id: shipment.id },
        attributes: ['id', 'production_number', 'status'],
        raw: true
      });
      console.log(`\n  Shipment #${shipment.shipment_number} (ID: ${shipment.id})`);
      console.log(`    Production Order: ${linkedOrder ? '✓ ' + linkedOrder.production_number + ' (' + linkedOrder.status + ')' : '✗ NO LINK'}`);
    }

    console.log('\n\n========== DIAGNOSIS COMPLETE ==========\n');

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    process.exit(0);
  }
}

diagnoseIncomingOrders();