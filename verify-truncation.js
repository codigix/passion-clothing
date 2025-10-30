#!/usr/bin/env node

/**
 * DATABASE TRUNCATION VERIFICATION SCRIPT
 * Verifies that all tables except users were successfully truncated
 * 
 * Usage:
 *   npm run truncate-verify
 *   OR
 *   node verify-truncation.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'passion_erp',
  port: process.env.DB_PORT || 3306
};

// Tables that should be empty
const SHOULD_BE_EMPTY = [
  'sales_orders',
  'purchase_orders',
  'production_orders',
  'production_stages',
  'production_requests',
  'production_completions',
  'production_approvals',
  'shipments',
  'shipment_tracking',
  'inventory',
  'goods_receipt_notes',
  'challans',
  'invoices',
  'payments',
  'material_allocations',
  'material_consumptions',
  'material_requirements',
  'material_verification',
  'material_receipt',
  'material_dispatch',
  'vendor_returns',
  'rejections',
  'quality_checkpoints',
  'stage_operations',
  'bill_of_materials',
  'project_material_requests',
  'store_stocks',
  'samples',
  'attendances',
  'notifications',
  'approvals',
  'customers',
  'vendors',
  'products',
  'product_lifecycles',
  'product_lifecycle_histories',
  'courier_partners',
  'courier_agents',
  'inventory_movements',
  'sales_order_history'
];

// Tables that should NOT be empty
const SHOULD_NOT_BE_EMPTY = [
  'users',
  'roles',
  'permissions'
];

async function verifyTruncation() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 DATABASE TRUNCATION VERIFICATION');
    console.log('='.repeat(70));
    
    console.log('\n🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!\n');
    
    let allPass = true;
    let emptyTableCount = 0;
    let filledTableCount = 0;
    
    // Check tables that should be empty
    console.log('📋 Checking tables that should be EMPTY:');
    console.log('-'.repeat(70));
    
    for (const table of SHOULD_BE_EMPTY) {
      try {
        const [rows] = await connection.execute(
          `SELECT COUNT(*) as count FROM \`${table}\``
        );
        const count = rows[0].count;
        
        if (count === 0) {
          console.log(`   ✅ ${table.padEnd(35)} - 0 rows (CORRECT)`);
          emptyTableCount++;
        } else {
          console.log(`   ❌ ${table.padEnd(35)} - ${count} rows (SHOULD BE EMPTY!)`);
          allPass = false;
          filledTableCount++;
        }
      } catch (error) {
        console.log(`   ⚠️  ${table.padEnd(35)} - ERROR: ${error.message}`);
        allPass = false;
      }
    }
    
    console.log('\n📋 Checking tables that should have DATA:');
    console.log('-'.repeat(70));
    
    for (const table of SHOULD_NOT_BE_EMPTY) {
      try {
        const [rows] = await connection.execute(
          `SELECT COUNT(*) as count FROM \`${table}\``
        );
        const count = rows[0].count;
        
        if (count > 0) {
          console.log(`   ✅ ${table.padEnd(35)} - ${count} rows (PRESERVED)`);
        } else {
          console.log(`   ⚠️  ${table.padEnd(35)} - 0 rows (EMPTY!)`);
          // This is a warning, not a failure - might be intentional
        }
      } catch (error) {
        console.log(`   ⚠️  ${table.padEnd(35)} - ERROR: ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(70));
    
    console.log(`\n✅ Correctly truncated: ${emptyTableCount}/${SHOULD_BE_EMPTY.length} tables`);
    
    if (filledTableCount > 0) {
      console.log(`❌ Still have data: ${filledTableCount} tables`);
      allPass = false;
    } else {
      console.log(`❌ Still have data: 0 tables`);
    }
    
    console.log('\n' + '='.repeat(70));
    
    if (allPass && filledTableCount === 0) {
      console.log('✅ VERIFICATION PASSED - All tables correctly truncated!');
      console.log('   Database is ready for fresh data.');
      console.log('='.repeat(70));
      process.exit(0);
    } else {
      console.log('❌ VERIFICATION FAILED - Some tables still have data!');
      console.log('   Please review the results above.');
      console.log('='.repeat(70));
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Connection Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check that database is running');
    console.log('2. Verify .env database configuration:');
    console.log(`   - Host: ${dbConfig.host}`);
    console.log(`   - User: ${dbConfig.user}`);
    console.log(`   - Database: ${dbConfig.database}`);
    console.log('3. Test connection manually: mysql -h [host] -u [user] -p [database]');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
verifyTruncation().catch(error => {
  console.error('Fatal Error:', error);
  process.exit(1);
});