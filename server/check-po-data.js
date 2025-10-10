const { PurchaseOrder, Vendor, Customer, SalesOrder } = require('./config/database');

(async () => {
  try {
    const po = await PurchaseOrder.findByPk(1, {
      include: [
        { model: Vendor, as: 'vendor' },
        { model: Customer, as: 'customer' },
        { model: SalesOrder, as: 'salesOrder' }
      ]
    });

    if (!po) {
      console.error('❌ Purchase Order #1 not found');
      process.exit(1);
    }

    console.log('\n📦 Purchase Order #1 Data:');
    console.log('================================');
    console.log('PO Number:', po.po_number);
    console.log('Project Name:', po.project_name);
    console.log('Status:', po.status);
    console.log('\n📋 Items Field:');
    console.log('Type:', typeof po.items);
    console.log('Is Array:', Array.isArray(po.items));
    console.log('Length:', po.items ? (Array.isArray(po.items) ? po.items.length : 'N/A') : 'null/undefined');
    console.log('Data:', JSON.stringify(po.items, null, 2));
    
    console.log('\n🏭 Vendor:', po.vendor?.name || 'None');
    console.log('👤 Customer:', po.customer?.name || 'None');
    console.log('📄 Sales Order:', po.salesOrder?.so_number || 'None');
    
    console.log('\n✅ Diagnosis Complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();