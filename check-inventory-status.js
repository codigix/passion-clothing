const { GoodsReceiptNote, Inventory, PurchaseOrder, Approval, VendorRequest } = require("./server/config/database");

async function checkStatus() {
  try {
    console.log("\n=== CHECKING INVENTORY STATUS FOR PO 1 ===\n");

    const po = await PurchaseOrder.findByPk(1);
    console.log("PO Status:", po.status);
    console.log("PO Items:", po.items?.length);

    const grns = await GoodsReceiptNote.findAll({
      where: { purchase_order_id: 1 },
      order: [["created_at", "ASC"]],
    });

    console.log("\n📦 GRNs:");
    for (const grn of grns) {
      console.log(`  - ${grn.grn_number}: status=${grn.status}, verification=${grn.verification_status}, inventory_added=${grn.inventory_added}`);
      console.log(`    Items received: ${grn.items_received?.length}`);
      grn.items_received?.forEach((item, idx) => {
        console.log(`      [${idx}] ${item.material_name}: ordered=${item.ordered_quantity}, received=${item.received_quantity}, shortage=${item.shortage_quantity}`);
      });
    }

    const inventory = await Inventory.findAll({
      where: { purchase_order_id: 1 },
    });

    console.log(`\n📊 Inventory Items Found: ${inventory.length}`);
    inventory.forEach(inv => {
      console.log(`  - ${inv.product_name}: qty=${inv.current_stock}, stock_type=${inv.stock_type}, quality_status=${inv.quality_status}`);
    });

    const approvals = await Approval.findAll({
      where: { entity_id: 1, entity_type: "purchase_order" },
    });

    console.log(`\n⚠️  Approvals/Complaints: ${approvals.length}`);
    approvals.forEach(app => {
      console.log(`  - ${app.stage_key}: ${app.status}`);
    });

    const vendors = await VendorRequest.findAll({
      where: { purchase_order_id: 1 },
    });

    console.log(`\n🤝 Vendor Requests: ${vendors.length}`);
    vendors.forEach(vr => {
      console.log(`  - ${vr.request_number}: type=${vr.request_type}, status=${vr.status}`);
    });

    console.log("\n=== ANALYSIS ===");
    console.log("Issue: When first GRN is received with shortages, inventory items are NOT stored.");
    console.log("Current Inventory items:", inventory.length, "(should have received items)");
    console.log("GRN inventory_added flag:", grns[0]?.inventory_added, "(false = not added)");
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkStatus();
