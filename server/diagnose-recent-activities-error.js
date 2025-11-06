#!/usr/bin/env node

/**
 * Diagnostic script to identify the 500 error in recent-activities endpoint
 * Run: node diagnose-recent-activities-error.js
 */

const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "passion_erp",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "root",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: console.log,
  }
);

async function diagnose() {
  try {
    console.log("🔍 Diagnosing recent-activities endpoint error...\n");

    // 1. Check database connection
    console.log("1️⃣ Testing database connection...");
    await sequelize.authenticate();
    console.log("✅ Database connection successful\n");

    // 2. Check if project_name columns exist
    console.log("2️⃣ Checking if project_name columns exist...");
    
    const productionOrdersCheck = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'production_orders' AND COLUMN_NAME = 'project_name'
    `);
    console.log(
      productionOrdersCheck[0].length > 0
        ? "✅ production_orders.project_name exists"
        : "❌ production_orders.project_name MISSING"
    );

    const shipmentsCheck = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'shipments' AND COLUMN_NAME = 'project_name'
    `);
    console.log(
      shipmentsCheck[0].length > 0
        ? "✅ shipments.project_name exists"
        : "❌ shipments.project_name MISSING"
    );

    // 3. Test SalesOrderHistory query (from the endpoint)
    console.log("\n3️⃣ Testing SalesOrderHistory query...");
    try {
      const historyCount = await sequelize.query(
        `SELECT COUNT(*) as count FROM sales_order_history LIMIT 1`
      );
      console.log(`✅ SalesOrderHistory table exists (${historyCount[0][0].count} records)`);
    } catch (err) {
      console.log("❌ SalesOrderHistory table error:", err.message);
    }

    // 4. Test Shipment query (from the endpoint)
    console.log("\n4️⃣ Testing Shipment query...");
    try {
      const shipmentCount = await sequelize.query(
        `SELECT COUNT(*) as count FROM shipments LIMIT 1`
      );
      console.log(`✅ Shipments table exists (${shipmentCount[0][0].count} records)`);
    } catch (err) {
      console.log("❌ Shipments table error:", err.message);
    }

    // 5. Check for NULL values that might cause issues
    console.log("\n5️⃣ Checking for NULL/problematic values...");
    
    const nullSalesOrderIds = await sequelize.query(`
      SELECT COUNT(*) as count FROM sales_order_history 
      WHERE sales_order_id IS NULL
    `);
    if (nullSalesOrderIds[0][0].count > 0) {
      console.log(
        `⚠️  Found ${nullSalesOrderIds[0][0].count} SalesOrderHistory records with NULL sales_order_id`
      );
    } else {
      console.log("✅ No NULL sales_order_id in SalesOrderHistory");
    }

    const nullShipmentSalesOrderIds = await sequelize.query(`
      SELECT COUNT(*) as count FROM shipments 
      WHERE sales_order_id IS NULL
    `);
    if (nullShipmentSalesOrderIds[0][0].count > 0) {
      console.log(
        `⚠️  Found ${nullShipmentSalesOrderIds[0][0].count} Shipments with NULL sales_order_id`
      );
    } else {
      console.log("✅ No NULL sales_order_id in Shipments");
    }

    // 6. Test actual recent activities query (simplified)
    console.log("\n6️⃣ Testing recent activities queries...");
    
    try {
      const activities = await sequelize.query(`
        SELECT 
          sh.id,
          sh.sales_order_id,
          so.project_name,
          so.order_number,
          so.product_name
        FROM sales_order_history sh
        LEFT JOIN sales_orders so ON sh.sales_order_id = so.id
        LIMIT 5
      `);
      console.log(`✅ SalesOrderHistory JOIN works (${activities[0].length} records)`);
      
      if (activities[0].length > 0) {
        console.log("   Sample record:", activities[0][0]);
      }
    } catch (err) {
      console.log("❌ SalesOrderHistory JOIN error:", err.message);
      console.log("   SQL Error Code:", err.original?.code);
    }

    try {
      const shipments = await sequelize.query(`
        SELECT 
          s.id,
          s.sales_order_id,
          s.project_name,
          so.project_name as so_project_name,
          so.order_number
        FROM shipments s
        LEFT JOIN sales_orders so ON s.sales_order_id = so.id
        LIMIT 5
      `);
      console.log(`✅ Shipments JOIN works (${shipments[0].length} records)`);
      
      if (shipments[0].length > 0) {
        console.log("   Sample record:", shipments[0][0]);
      }
    } catch (err) {
      console.log("❌ Shipments JOIN error:", err.message);
      console.log("   SQL Error Code:", err.original?.code);
    }

    // 7. Check database structure
    console.log("\n7️⃣ Checking database structure...");
    
    const salesOrderColumns = await sequelize.query(`
      DESCRIBE sales_orders
    `);
    const hasProjectName = salesOrderColumns[0].some(col => col.Field === "project_name");
    console.log(
      hasProjectName
        ? "✅ SalesOrder table has project_name column"
        : "❌ SalesOrder table missing project_name column"
    );

    console.log("\n📊 Diagnosis complete!");
    console.log("\n🔧 RECOMMENDATIONS:");
    if (!shipmentsCheck[0].length) {
      console.log("1. Run the migration: mysql -u root -p passion_erp < add-project-name-columns.sql");
    }
    if (!productionOrdersCheck[0].length) {
      console.log("2. Run the migration: mysql -u root -p passion_erp < add-project-name-columns.sql");
    }
    console.log("3. Run the population script: node populate-project-names.js");
    console.log("4. Restart the backend server");

  } catch (error) {
    console.error("❌ Diagnosis failed:", error.message);
    console.error("Full error:", error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

diagnose();