const { sequelize, ClientRequirement, Quotation } = require("../config/database");

async function sync() {
  try {
    console.log("🔄 Starting database sync for new tables...");
    
    // Sync ClientRequirement
    console.log("⏳ Syncing ClientRequirement table...");
    await ClientRequirement.sync({ alter: true });
    console.log("✅ ClientRequirement table synchronized successfully.");
    
    // Sync Quotation
    console.log("⏳ Syncing Quotation table...");
    await Quotation.sync({ alter: true });
    console.log("✅ Quotation table synchronized successfully.");
    
    console.log("🎉 Database sync complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error syncing database tables:", error);
    process.exit(1);
  }
}

sync();
