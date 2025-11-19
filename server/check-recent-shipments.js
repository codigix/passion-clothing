const { Shipment, ProductionOrder } = require('./config/database');

(async () => {
  try {
    console.log('\n📦 CHECKING SHIPMENT-PRODUCTION LINKS:\n');
    
    const shipments = await Shipment.findAll({
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['id', 'shipment_number', 'status', 'sales_order_id', 'created_at']
    });
    
    console.log('SHIPMENTS:');
    for (const s of shipments) {
      const linkedOrder = await ProductionOrder.findOne({
        where: { shipment_id: s.id },
        attributes: ['id', 'production_number']
      });
      console.log(`  ${s.shipment_number}: status=${s.status}, linked_order=${linkedOrder?.production_number || 'NONE'}`);
    }
    
    console.log('\nPRODUCTION ORDERS WITH SHIPMENT_ID:');
    const linked = await ProductionOrder.findAll({
      where: { shipment_id: { $ne: null } },
      attributes: ['id', 'production_number', 'shipment_id'],
      raw: true
    });
    console.log(`Found: ${linked.length} orders`);
    linked.forEach(o => console.log(`  ${o.production_number}: shipment_id=${o.shipment_id}`));
    
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
})();