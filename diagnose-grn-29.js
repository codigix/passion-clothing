const { GoodsReceiptNote, PurchaseOrder, Vendor, Customer, SalesOrder } = require('./server/config/database');

async function diagnoseGRN() {
  try {
    console.log('=== Diagnosing GRN ID 29 ===\n');
    
    // Get GRN without includes
    const grnBasic = await GoodsReceiptNote.findByPk(29);
    console.log('GRN Basic Data:');
    console.log('ID:', grnBasic?.id);
    console.log('GRN Number:', grnBasic?.grn_number);
    console.log('Purchase Order ID:', grnBasic?.purchase_order_id);
    console.log('Status:', grnBasic?.status);
    console.log('Verification Status:', grnBasic?.verification_status);
    console.log('Inventory Added:', grnBasic?.inventory_added);
    console.log('Items Received:', grnBasic?.items_received ? JSON.stringify(grnBasic.items_received, null, 2) : 'null');
    console.log('\n');

    // Check if PO exists
    if (grnBasic?.purchase_order_id) {
      const po = await PurchaseOrder.findByPk(grnBasic.purchase_order_id);
      console.log('Purchase Order Exists:', !!po);
      if (po) {
        console.log('PO Number:', po.po_number);
        console.log('PO Status:', po.status);
        console.log('Vendor ID:', po.vendor_id);
      } else {
        console.log('ERROR: Purchase Order not found with ID:', grnBasic.purchase_order_id);
      }
      console.log('\n');
    }

    // Get GRN with includes (as done in the endpoint)
    console.log('Fetching GRN with includes...');
    const grnFull = await GoodsReceiptNote.findByPk(29, {
      include: [
        { 
          model: PurchaseOrder, 
          as: 'purchaseOrder',
          include: [
            { model: Vendor, as: 'vendor' },
            { model: Customer, as: 'customer' }
          ]
        },
        { model: SalesOrder, as: 'salesOrder' }
      ]
    });

    console.log('GRN Full Data:');
    console.log('purchaseOrder exists:', !!grnFull?.purchaseOrder);
    if (grnFull?.purchaseOrder) {
      console.log('PO Number:', grnFull.purchaseOrder.po_number);
      console.log('PO Vendor:', grnFull.purchaseOrder.vendor?.name || 'NO VENDOR');
    } else {
      console.log('ERROR: purchaseOrder is null after include!');
    }
    console.log('\n');

    console.log('=== Diagnosis Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Error during diagnosis:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

diagnoseGRN();