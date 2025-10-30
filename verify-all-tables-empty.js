#!/usr/bin/env node

/**
 * ✅ VERIFICATION SCRIPT - Check Database is Empty
 * 
 * Verifies that ALL tables have been successfully truncated
 * Shows record counts for all tables
 * 
 * Usage:
 *   node verify-all-tables-empty.js
 * 
 * Or via npm:
 *   npm run reset-verify
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  error: (msg) => console.log(`${colors.red}✗ ERROR: ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  debug: (msg) => console.log(`${colors.cyan}→ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.magenta}${msg}${colors.reset}\n`),
};

// All tables to verify
const TABLES_TO_VERIFY = [
  // Join tables
  'user_roles', 'role_permissions', 'user_permissions',
  
  // Child tables (most dependent)
  'shipment_tracking', 'stage_operations', 'material_consumption',
  'production_completion', 'quality_checkpoint',
  'material_verification', 'material_receipt', 'material_dispatch',
  'product_lifecycle_history', 'goods_receipt_note',
  'inventory_movement', 'material_allocation', 'vendor_return',
  'sales_order_history', 'production_request',
  'material_requirement', 'project_material_request',
  
  // Main transactional tables
  'rejection', 'production_stage', 'production_order',
  'production_approval', 'approval', 'invoice',
  'payment', 'purchase_order', 'sales_order',
  'challan', 'shipment', 'store_stock',
  'inventory', 'bill_of_materials', 'notification',
  
  // Master data
  'sample', 'course_partner', 'courier_agent',
  'product_lifecycle', 'product', 'attendance',
  'customer', 'vendor',
  
  // Core system tables
  'permission', 'role', 'user'
];

async function verifyDatabase() {
  let connection;
  try {
    log.title('🔍 DATABASE VERIFICATION');
    log.debug('Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'passion_erp',
      port: process.env.DB_PORT || 3306
    });
    
    log.success('Connected to database\n');

    let emptyTableCount = 0;
    let nonEmptyTableCount = 0;
    let totalRecords = 0;
    const nonEmptyTables = [];

    log.info('Checking table record counts:\n');

    for (const table of TABLES_TO_VERIFY) {
      try {
        const [rows] = await connection.execute(
          `SELECT COUNT(*) as count FROM \`${table}\``
        );
        
        const count = rows[0].count;
        
        if (count === 0) {
          console.log(`${colors.green}✓${colors.reset} ${table.padEnd(30)} : 0 records`);
          emptyTableCount++;
        } else {
          console.log(`${colors.red}✗${colors.reset} ${table.padEnd(30)} : ${colors.bold}${count}${colors.reset} records`);
          nonEmptyTableCount++;
          totalRecords += count;
          nonEmptyTables.push({ table, count });
        }
      } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          log.debug(`Skipped (not found): ${table}`);
        } else {
          log.error(`Error checking ${table}: ${error.message}`);
        }
      }
    }

    await connection.end();

    // Summary
    log.title('📊 VERIFICATION SUMMARY');
    console.log(`${colors.green}✓ Empty tables${colors.reset}    : ${emptyTableCount}/${TABLES_TO_VERIFY.length}`);
    console.log(`${colors.red}✗ Non-empty tables${colors.reset} : ${nonEmptyTableCount}/${TABLES_TO_VERIFY.length}`);
    
    if (nonEmptyTableCount > 0) {
      console.log(`\n${colors.bold}Non-empty tables:${colors.reset}`);
      nonEmptyTables.forEach(({ table, count }) => {
        console.log(`  • ${table}: ${colors.bold}${count}${colors.reset} records`);
      });
      console.log(`\n${colors.bold}Total records remaining: ${colors.red}${totalRecords}${colors.reset}\n`);
      log.warning('Database still contains data!');
      process.exit(1);
    } else {
      console.log(`\n${colors.bold}${colors.green}✓ All tables are empty!${colors.reset}`);
      console.log(`\n${colors.bold}NEXT STEPS:${colors.reset}`);
      console.log(`  1. Create admin user: ${colors.cyan}npm run seed${colors.reset}`);
      console.log(`  2. Or load demo data: ${colors.cyan}npm run seed-sample${colors.reset}`);
      console.log(`  3. Start server: ${colors.cyan}npm start${colors.reset}\n`);
      log.success('Database successfully verified as empty!');
      process.exit(0);
    }

  } catch (error) {
    log.error(`Verification failed: ${error.message}`);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

verifyDatabase();