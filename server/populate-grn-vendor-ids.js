const { sequelize, GoodsReceiptNote, PurchaseOrder } = require('./config/database');

async function populateVendorIds() {
  try {
    const grns = await GoodsReceiptNote.findAll({
      attributes: ['id', 'purchase_order_id', 'vendor_id'],
      where: { vendor_id: null },
      include: [
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'vendor_id'] }
      ]
    });

    console.log(`Found ${grns.length} GRNs without vendor_id`);

    let updated = 0;
    let skipped = 0;

    for (const grn of grns) {
      if (grn.purchaseOrder && grn.purchaseOrder.vendor_id) {
        await grn.update({ vendor_id: grn.purchaseOrder.vendor_id });
        updated++;
      } else {
        skipped++;
      }
    }

    console.log(`✅ Updated ${updated} GRNs with vendor_id`);
    console.log(`⚠️ Skipped ${skipped} GRNs (no vendor assigned to PO)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating vendor IDs:', error.message);
    process.exit(1);
  }
}

populateVendorIds();
