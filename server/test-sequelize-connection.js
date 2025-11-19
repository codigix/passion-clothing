const { Sequelize } = require("sequelize");
require("dotenv").config({ path: "./server/.env" });

console.log("Testing Sequelize connection with environment variables:");
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: console.log,
    pool: {
      max: 5,
      min: 1,
      acquire: 30000,
      idle: 10000,
    },
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("\n✅ Connection successful!");
    
    // Get table count
    const result = await sequelize.query(
      "SELECT COUNT(*) as table_count FROM information_schema.TABLES WHERE TABLE_SCHEMA=?",
      { replacements: [process.env.DB_NAME] }
    );
    console.log(`📊 Total tables: ${result[0][0].table_count}`);
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error(error);
    process.exit(1);
  }
}

testConnection();