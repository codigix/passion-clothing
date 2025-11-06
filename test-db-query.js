const { sequelize, Inventory } = require("./server/config/database");
const { QueryTypes } = require("sequelize");

async function testQueries() {
  try {
    console.log("🔍 Testing database queries...\n");

    // Test 1: Simple count
    console.log("1️⃣ Testing simple count...");
    const count = await Inventory.count();
    console.log(`   ✅ Inventory count: ${count}\n`);

    // Test 2: Column comparison with raw query
    console.log("2️⃣ Testing column comparison with raw SQL...");
    const lowStockResult = await sequelize.query(
      `SELECT COUNT(*) as count FROM inventory WHERE available_stock <= minimum_level`,
      { type: QueryTypes.SELECT }
    );
    console.log(`   ✅ Low stock items: ${lowStockResult[0]?.count || 0}\n`);

    // Test 3: Get sample low stock items
    console.log("3️⃣ Testing detailed low stock query...");
    const lowStockItems = await sequelize.query(
      `SELECT id, product_id, available_stock, minimum_level FROM inventory WHERE available_stock <= minimum_level LIMIT 5`,
      { type: QueryTypes.SELECT }
    );
    console.log(`   ✅ Found ${lowStockItems.length} low stock items`);
    if (lowStockItems.length > 0) {
      console.log("   Sample:", lowStockItems[0]);
    }
    console.log("\n");

    // Test 4: Other stats
    console.log("4️⃣ Testing other inventory stats...");
    const totalValue = await Inventory.sum("total_value");
    console.log(`   ✅ Total inventory value: ${totalValue}\n`);

    console.log(
      "✅ All tests passed! Database connection is working correctly."
    );
  } catch (error) {
    console.error("❌ Error during testing:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testQueries();
