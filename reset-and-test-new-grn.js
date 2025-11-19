const { 
  GoodsReceiptNote, 
  Inventory, 
  PurchaseOrder, 
  Approval, 
  VendorRequest,
  sequelize,
  Vendor,
  Customer
} = require("./server/config/database");

async function run() {
  const transaction = await sequelize.transaction();
  try {
    console.log("\n========================================");
    console.log("  RESETTING TEST DATA FOR NEW GRN TEST");
    console.log("========================================\n");

    // Delete old data carefully due to foreign keys
    console.log("🗑️  Cleaning up old GRNs and related data...");
    
    // First delete approvals
    await Approval.destroy({
      where: { entity_id: 1, entity_type: 'purchase_order' },
      transaction
    });

    // Delete vendor requests
    await VendorRequest.destroy({
      where: { purchase_order_id: 1 },
      transaction
    });

    // Delete old inventory for PO 1
    await Inventory.destroy({
      where: { purchase_order_id: 1 },
      transaction
    });

    // Delete old GRNs - try with cascade
    const grnsToDelete = await GoodsReceiptNote.findAll({
      where: { purchase_order_id: 1 },
      raw: true,
      transaction
    });

    for (const grn of grnsToDelete) {
      // Update other GRNs that reference this one
      await GoodsReceiptNote.update(
        { original_grn_id: null },
        { where: { original_grn_id: grn.id }, transaction }
      );
    }

    await GoodsReceiptNote.destroy({
      where: { purchase_order_id: 1 },
      transaction
    });

    // Reset PO status
    const po = await PurchaseOrder.findByPk(1, { transaction });
    if (po) {
      await po.update({ status: 'approved' }, { transaction });
      console.log("✅ PO status reset to 'approved'");
    }

    await transaction.commit();

    console.log("✅ Cleanup complete!\n");

    // Now test with the verify-inventory script
    console.log("========================================");
    console.log("  TESTING AUTO-INVENTORY WITH FRESH GRN");
    console.log("========================================\n");

    const transaction2 = await sequelize.transaction();
    
    // Create test GRN data manually to test the inventory auto-add logic
    console.log("📦 Creating fresh test GRN...\n");

    // Simulate what the POST /api/grn/from-po/:poId endpoint should do
    // We'll directly test the inventory auto-add logic

    const mappedItems = [
      {
        material_name: 'test_fabric_new',
        color: 'Blue',
        hsn: '5208',
        gsm: '200',
        width: '58',
        description: 'Test blue fabric',
        uom: 'Meters',
        ordered_quantity: 100,
        invoiced_quantity: 100,
        received_quantity: 85.5,
        shortage_quantity: 14.5,
        overage_quantity: 0,
        weight: null,
        rate: 50,
        total: 4275,
        quality_status: 'pending_inspection',
        discrepancy_flag: true,
        remarks: 'Test shortage',
        is_shortage_fulfillment: false
      }
    ];

    console.log("Simulated GRN items:");
    mappedItems.forEach((item, idx) => {
      console.log(`   [${idx + 1}] ${item.material_name}: ${item.received_quantity}m (shortage: ${item.shortage_quantity}m)`);
    });

    // Create a fresh GRN
    const grnNumber = `GRN-FRESH-${Date.now()}`;
    const grn = await GoodsReceiptNote.create({
      grn_number: grnNumber,
      purchase_order_id: 1,
      items_received: mappedItems,
      total_received_value: 4275,
      status: 'received',
      verification_status: 'discrepancy',
      remarks: 'Fresh test GRN',
      created_by: 1,
      inventory_added: false,
      grn_sequence: 1,
      is_first_grn: true,
      supplier_name: 'Test Vendor'
    }, { transaction: transaction2 });

    console.log(`\n✅ Test GRN created: ${grnNumber}`);

    await transaction2.commit();

    // Now check the status
    console.log("\n========================================");
    console.log("  CHECKING RESULTS");
    console.log("========================================\n");

    const grnCheck = await GoodsReceiptNote.findByPk(grn.id);
    const inventoryCheck = await Inventory.findAll({
      where: { purchase_order_id: 1 }
    });

    console.log("GRN Status:");
    console.log(`   - GRN Number: ${grnCheck.grn_number}`);
    console.log(`   - Status: ${grnCheck.status}`);
    console.log(`   - Verification: ${grnCheck.verification_status}`);
    console.log(`   - Inventory Added: ${grnCheck.inventory_added}`);

    console.log(`\nInventory Items Found: ${inventoryCheck.length}`);
    inventoryCheck.forEach((inv, idx) => {
      console.log(`   [${idx + 1}] ${inv.product_name}: ${inv.current_stock}m (quality: ${inv.quality_status})`);
    });

    console.log("\n========================================");
    console.log("⚠️  NOTE: This test MANUALLY created the GRN without going through the API.");
    console.log("The auto-inventory feature is implemented in the API endpoint at:");
    console.log("POST /api/grn/from-po/:poId (lines 635-852 in server/routes/grn.js)");
    console.log("\nTo fully test, you need to:");
    console.log("1. Start the server: npm run dev");
    console.log("2. Make a POST request to /api/grn/from-po/1 with new items");
    console.log("3. The response will show inventory_items_created and inventory_items");
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error("Error:", error.message);
    process.exit(1);
  }
}

run();
