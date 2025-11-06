/**
 * Populate Project Names Script
 * 
 * Purpose: Auto-populate project_name field for existing records in:
 * - Production Orders
 * - Shipments
 * 
 * The script fetches project names from related Sales Orders and updates records
 * that don't already have project_name set.
 * 
 * Usage: node populate-project-names.js
 */

const db = require('./server/config/database');
const { QueryTypes } = require('sequelize');

const populateProjectNames = async () => {
  try {
    console.log('🔄 Starting Project Name Population Script...\n');

    const sequelize = db.sequelize;

    // ===== PRODUCTION ORDERS =====
    console.log('📦 Processing Production Orders...');

    // Find all production orders without project_name that have a sales_order_id
    const productionOrdersToUpdate = await sequelize.query(
      `SELECT po.id, po.production_number, po.sales_order_id, so.project_name
       FROM production_orders po
       LEFT JOIN sales_orders so ON po.sales_order_id = so.id
       WHERE (po.project_name IS NULL OR po.project_name = '')
       AND po.sales_order_id IS NOT NULL
       AND so.project_name IS NOT NULL`,
      { type: QueryTypes.SELECT }
    );

    console.log(`   Found ${productionOrdersToUpdate.length} production orders to update`);

    for (const order of productionOrdersToUpdate) {
      await sequelize.query(
        `UPDATE production_orders 
         SET project_name = ? 
         WHERE id = ?`,
        {
          replacements: [order.project_name, order.id],
          type: QueryTypes.UPDATE
        }
      );
      console.log(`   ✓ Updated: ${order.production_number} → "${order.project_name}"`);
    }

    // ===== SHIPMENTS =====
    console.log('\n🚚 Processing Shipments...');

    // Find all shipments without project_name that have a sales_order_id
    const shipmentsToUpdate = await sequelize.query(
      `SELECT s.id, s.shipment_number, s.sales_order_id, so.project_name
       FROM shipments s
       LEFT JOIN sales_orders so ON s.sales_order_id = so.id
       WHERE (s.project_name IS NULL OR s.project_name = '')
       AND s.sales_order_id IS NOT NULL
       AND so.project_name IS NOT NULL`,
      { type: QueryTypes.SELECT }
    );

    console.log(`   Found ${shipmentsToUpdate.length} shipments to update`);

    for (const shipment of shipmentsToUpdate) {
      await sequelize.query(
        `UPDATE shipments 
         SET project_name = ? 
         WHERE id = ?`,
        {
          replacements: [shipment.project_name, shipment.id],
          type: QueryTypes.UPDATE
        }
      );
      console.log(`   ✓ Updated: ${shipment.shipment_number} → "${shipment.project_name}"`);
    }

    // ===== STATISTICS =====
    console.log('\n📊 Verification Report:\n');

    const prodStats = await sequelize.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN project_name IS NOT NULL THEN 1 ELSE 0 END) as with_project_name
       FROM production_orders`,
      { type: QueryTypes.SELECT }
    );

    const shipStats = await sequelize.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN project_name IS NOT NULL THEN 1 ELSE 0 END) as with_project_name
       FROM shipments`,
      { type: QueryTypes.SELECT }
    );

    console.log('Production Orders:');
    console.log(`  Total: ${prodStats[0].total}`);
    console.log(`  With Project Name: ${prodStats[0].with_project_name}`);
    console.log(`  Coverage: ${Math.round((prodStats[0].with_project_name / prodStats[0].total) * 100)}%`);

    console.log('\nShipments:');
    console.log(`  Total: ${shipStats[0].total}`);
    console.log(`  With Project Name: ${shipStats[0].with_project_name}`);
    console.log(`  Coverage: ${Math.round((shipStats[0].with_project_name / shipStats[0].total) * 100)}%`);

    console.log('\n✅ Project Name Population Complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during population:', error);
    process.exit(1);
  }
};

// Run the script
populateProjectNames();