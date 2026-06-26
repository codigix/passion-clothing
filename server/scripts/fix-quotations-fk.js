const { sequelize } = require("../config/database");

async function fix() {
  try {
    console.log("Starting column modification for quotations...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await sequelize.query("ALTER TABLE `quotations` MODIFY `client_requirement_id` INT NULL;");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("Success! client_requirement_id modified to NULL.");
    process.exit(0);
  } catch (error) {
    console.error("Failed:", error);
    process.exit(1);
  }
}

fix();
