const { 
  GoodsReceiptNote, 
  Inventory, 
  PurchaseOrder, 
  Approval, 
  VendorRequest,
  Product,
  InventoryMovement,
  Vendor 
} = require("./server/config/database");

async function runTest() {
  try {
    console.log("\n========================================");
    console.log("  TESTING AUTO-INVENTORY FEATURE");
    console.log("========================================\n");

    // Get the test PO that we created earlier
    const po = await PurchaseOrder.findByPk(1, {
      include: [{ model: Vendor, as: 'vendor' }]
    });

    if (!po) {
      console.log("❌ Test PO not found!");
      process.exit(1);
    }

    console.log("📋 Using Test PO:");
    console.log(`   PO Number: ${po.po_number}`);
    console.log(`   Status: ${po.status}`);
    console.log(`   Items: ${po.items?.length || 0}`);

    // Check inventory status BEFORE (from previous test data)
    const inventoryBefore = await Inventory.findAll({
      where: { purchase_order_id: 1 }
    });

    console.log(`\n📊 Inventory Before: ${inventoryBefore.length} items`);

    // Check GRN status
    const grns = await GoodsReceiptNote.findAll({
      where: { purchase_order_id: 1 },
      order: [['created_at', 'ASC']]
    });

    console.log(`\n📦 GRNs Found: ${grns.length}`);
    grns.forEach((grn, idx) => {
      console.log(`   [${idx + 1}] ${grn.grn_number}`);
      console.log(`       - Inventory Added: ${grn.inventory_added}`);
      console.log(`       - Verification Status: ${grn.verification_status}`);
      console.log(`       - Status: ${grn.status}`);
      if (grn.items_received && grn.items_received.length > 0) {
        grn.items_received.forEach((item, itemIdx) => {
          console.log(`       [Item ${itemIdx + 1}] ${item.material_name}: ${item.received_quantity} (shortage: ${item.shortage_quantity})`);
        });
      }
    });

    // Check inventory details
    console.log(`\n📦 Inventory Items in System: ${inventoryBefore.length}`);
    inventoryBefore.forEach((inv, idx) => {
      console.log(`   [${idx + 1}] ${inv.product_name}`);
      console.log(`       - Qty: ${inv.current_stock} ${inv.unit_of_measurement}`);
      console.log(`       - Quality: ${inv.quality_status}`);
      console.log(`       - Notes: ${inv.notes?.substring(0, 80)}...`);
    });

    // Check complaints
    const complaints = await Approval.findAll({
      where: { entity_id: 1, entity_type: 'purchase_order' }
    });

    console.log(`\n⚠️  Shortage Complaints: ${complaints.length}`);
    complaints.forEach(c => {
      console.log(`   - ${c.stage_key}: ${c.status}`);
    });

    console.log("\n========================================");
    console.log("  ANALYSIS");
    console.log("========================================\n");

    let issue = false;

    // Check if first GRN has inventory added
    const firstGRN = grns.find(g => g.is_first_grn);
    if (firstGRN) {
      if (firstGRN.inventory_added) {
        console.log("✅ GOOD: First GRN marked as inventory_added = true");
      } else {
        console.log("❌ ISSUE: First GRN has inventory_added = false (should be true if auto-add works)");
        issue = true;
      }

      // Check if there's inventory corresponding to first GRN
      const firstGRNInventory = inventoryBefore.filter(inv => 
        inv.notes?.includes(firstGRN.grn_number)
      );
      if (firstGRNInventory.length > 0) {
        console.log(`✅ GOOD: First GRN has ${firstGRNInventory.length} inventory item(s)`);
      } else {
        console.log(`❌ ISSUE: First GRN has NO inventory items`);
        issue = true;
      }
    }

    // Check if shortage items are marked properly
    const shortageQty = inventoryBefore.find(inv => inv.quality_status === 'quarantine');
    if (shortageQty) {
      console.log(`✅ GOOD: Found ${shortageQty.product_name} marked as quarantine (shortage detection)`);
    } else if (inventoryBefore.length > 0) {
      console.log("⚠️  NOTE: No inventory items marked as quarantine (or all are perfect matches)");
    }

    console.log("\n========================================");
    if (!issue && inventoryBefore.length > 0) {
      console.log("✅ AUTO-INVENTORY FEATURE WORKING");
    } else if (inventoryBefore.length === 0) {
      console.log("⚠️  No inventory yet - may need to reset test data");
    } else {
      console.log("❌ AUTO-INVENTORY FEATURE NEEDS FIXING");
    }
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

runTest();
