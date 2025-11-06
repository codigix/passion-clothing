const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  try {
    console.log('🔄 Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database\n');

    // Check if columns already exist
    console.log('🔍 Checking current schema...\n');
    
    const checkProdCols = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'production_orders' AND COLUMN_NAME = 'project_name'
    `);
    
    const checkShipCols = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'shipments' AND COLUMN_NAME = 'project_name'
    `);
    
    console.log(`  Production Orders has project_name: ${checkProdCols[0].length > 0 ? '✅ Yes' : '❌ No'}`);
    console.log(`  Shipments has project_name: ${checkShipCols[0].length > 0 ? '✅ Yes' : '❌ No'}\n`);
    
    // Add columns if they don't exist
    if (checkProdCols[0].length === 0) {
      console.log('  ▶ Adding project_name to production_orders...');
      await connection.execute(`
        ALTER TABLE production_orders 
        ADD COLUMN project_name VARCHAR(200) 
        COMMENT 'Human-friendly project name for dashboards and reports'
        AFTER team_notes
      `);
      console.log('    ✅ Added\n');
    } else {
      console.log('  ℹ production_orders.project_name already exists\n');
    }
    
    if (checkShipCols[0].length === 0) {
      console.log('  ▶ Adding project_name to shipments...');
      await connection.execute(`
        ALTER TABLE shipments 
        ADD COLUMN project_name VARCHAR(200) 
        COMMENT 'Human-friendly project name for dashboards and reports'
        AFTER created_by
      `);
      console.log('    ✅ Added\n');
    } else {
      console.log('  ℹ shipments.project_name already exists\n');
    }
    
    // Create indexes
    console.log('📋 Creating performance indexes...\n');
    const indexStatements = [
      { sql: 'CREATE INDEX idx_production_orders_project_name ON production_orders(project_name)', name: 'idx_production_orders_project_name' },
      { sql: 'CREATE INDEX idx_shipments_project_name ON shipments(project_name)', name: 'idx_shipments_project_name' }
    ];
    
    for (const idx of indexStatements) {
      console.log(`  ▶ ${idx.name}`);
      try {
        await connection.execute(idx.sql);
        console.log('    ✅ Created\n');
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log('    ℹ Index already exists (OK)\n');
        } else {
          throw err;
        }
      }
    }
    
    let executed = 2;
    
    // Populate project names from sales orders
    console.log('📝 Populating project names from sales orders...\n');
    
    const updateProdResult = await connection.execute(`
      UPDATE production_orders po
      SET po.project_name = (
        SELECT so.project_name 
        FROM sales_orders so 
        WHERE so.id = po.sales_order_id 
        LIMIT 1
      )
      WHERE po.project_name IS NULL 
      AND po.sales_order_id IS NOT NULL
    `);
    
    console.log(`  ▶ production_orders: ${updateProdResult[0].changedRows} records updated`);
    
    const updateShipResult = await connection.execute(`
      UPDATE shipments s
      SET s.project_name = (
        SELECT so.project_name 
        FROM sales_orders so 
        WHERE so.id = s.sales_order_id 
        LIMIT 1
      )
      WHERE s.project_name IS NULL 
      AND s.sales_order_id IS NOT NULL
    `);
    
    console.log(`  ▶ shipments: ${updateShipResult[0].changedRows} records updated\n`);
    
    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📊 Columns added and indexes created\n`);
    
    // Run verification
    console.log('🔍 Verifying schema...\n');
    const result = await connection.execute(`
      SELECT 
        'Production Orders' as table_name,
        COUNT(*) as total_records,
        SUM(CASE WHEN project_name IS NOT NULL THEN 1 ELSE 0 END) as with_project_name
      FROM production_orders
      UNION ALL
      SELECT 
        'Shipments' as table_name,
        COUNT(*) as total_records,
        SUM(CASE WHEN project_name IS NOT NULL THEN 1 ELSE 0 END) as with_project_name
      FROM shipments
    `);
    
    console.log('📊 Verification Results:');
    console.table(result[0]);
    
    console.log('\n✨ All done! Your database is ready.\n');
    console.log('📌 Next Steps:');
    console.log('  1. Restart your backend server (pm2 restart all)');
    console.log('  2. Hard refresh your browser (Ctrl+Shift+R)');
    console.log('  3. Test Recent Activities on Dashboard');
    
    await connection.end();
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(`Error: ${error.message}\n`);
    if (error.code) console.error(`Code: ${error.code}`);
    process.exit(1);
  }
}

runMigration();