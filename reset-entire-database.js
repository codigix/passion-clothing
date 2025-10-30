#!/usr/bin/env node

/**
 * ⚠️  COMPLETE DATABASE RESET SCRIPT
 * 
 * THIS SCRIPT WILL DELETE ALL DATA FROM ALL TABLES
 * - Users: DELETED ✗
 * - All business data: DELETED ✗
 * - All configurations: DELETED ✗
 * - Nothing is preserved
 * 
 * ONLY USE IF YOU WANT A COMPLETELY FRESH DATABASE
 * 
 * Usage:
 *   node reset-entire-database.js
 * 
 * Or via npm:
 *   npm run reset-entire-db
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });
const readline = require('readline');

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

// All 63 tables in dependency order (child tables first, parent tables last)
const TABLES_TO_TRUNCATE = [
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

// Display warning banner
function displayWarningBanner() {
  console.clear();
  log.title('⚠️  COMPLETE DATABASE RESET - READ CAREFULLY!');
  
  console.log(`${colors.red}${colors.bold}THIS OPERATION WILL:${colors.reset}`);
  console.log(`  ✗ DELETE all users (login credentials lost)`);
  console.log(`  ✗ DELETE all sales orders and history`);
  console.log(`  ✗ DELETE all purchase orders and procurement`);
  console.log(`  ✗ DELETE all production orders and manufacturing`);
  console.log(`  ✗ DELETE all shipments and delivery tracking`);
  console.log(`  ✗ DELETE all inventory and stock`);
  console.log(`  ✗ DELETE all financial data (invoices, payments)`);
  console.log(`  ✗ DELETE all quality checkpoints and rejections`);
  console.log(`  ✗ DELETE ALL OTHER DATA (${TABLES_TO_TRUNCATE.length} tables total)\n`);
  
  console.log(`${colors.yellow}${colors.bold}DATABASE CREDENTIALS:${colors.reset}`);
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'passion_erp'}`);
  console.log(`  User: ${process.env.DB_USER || 'root'}\n`);
  
  console.log(`${colors.green}${colors.bold}THIS OPERATION CANNOT BE UNDONE!${colors.reset}`);
  console.log(`  → Only proceed if you have a recent backup\n`);
}

// Ask user for confirmation
function askForConfirmation() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    displayWarningBanner();
    
    rl.question(
      `${colors.bold}${colors.red}Type "DELETE ALL DATA" to confirm: ${colors.reset}`,
      (answer) => {
        rl.close();
        if (answer === 'DELETE ALL DATA') {
          resolve(true);
        } else {
          log.warning('Confirmation phrase did not match. Aborting operation.');
          resolve(false);
        }
      }
    );
  });
}

// Ask for second confirmation
function askForFinalConfirmation() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log(`\n${colors.bold}${colors.red}⚠️  FINAL WARNING ⚠️${colors.reset}`);
    console.log(`This will PERMANENTLY DELETE ALL DATABASE CONTENT.\n`);
    
    rl.question(
      `${colors.bold}${colors.red}Type "YES I AM SURE" to continue: ${colors.reset}`,
      (answer) => {
        rl.close();
        if (answer === 'YES I AM SURE') {
          resolve(true);
        } else {
          log.warning('Final confirmation phrase did not match. Aborting operation.');
          resolve(false);
        }
      }
    );
  });
}

// Main reset function
async function resetDatabase() {
  const proceed = await askForConfirmation();
  if (!proceed) {
    log.info('Reset cancelled by user.');
    process.exit(0);
  }

  const finalConfirm = await askForFinalConfirmation();
  if (!finalConfirm) {
    log.info('Reset cancelled by user.');
    process.exit(0);
  }

  log.title('🔄 Starting Complete Database Reset...');

  let connection;
  try {
    // Connect to database
    log.debug('Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'passion_erp',
      port: process.env.DB_PORT || 3306
    });
    log.success('Connected to database');

    // Disable foreign key checks
    log.debug('Disabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS=0');
    log.success('Foreign key checks disabled');

    // Truncate all tables
    let successCount = 0;
    let failureCount = 0;
    const failedTables = [];

    log.title('🗑️  Truncating Tables...');
    for (const table of TABLES_TO_TRUNCATE) {
      try {
        await connection.execute(`TRUNCATE TABLE \`${table}\``);
        log.success(`Truncated: ${table}`);
        successCount++;
      } catch (error) {
        // Table might not exist - that's okay
        if (error.code === 'ER_NO_SUCH_TABLE') {
          log.debug(`Skipped (not found): ${table}`);
        } else {
          log.error(`Failed: ${table} - ${error.message}`);
          failureCount++;
          failedTables.push(table);
        }
      }
    }

    // Re-enable foreign key checks
    log.debug('Re-enabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS=1');
    log.success('Foreign key checks re-enabled');

    // Close connection
    await connection.end();

    // Summary
    log.title('📊 Reset Summary');
    console.log(`  ✓ Successfully truncated: ${colors.green}${successCount}${colors.reset} tables`);
    if (failureCount > 0) {
      console.log(`  ✗ Failed: ${colors.red}${failureCount}${colors.reset} tables`);
      console.log(`    Failed tables: ${failedTables.join(', ')}`);
    }

    log.success('Complete database reset finished!');
    console.log(`\n${colors.yellow}${colors.bold}NEXT STEPS:${colors.reset}`);
    console.log(`  1. Recreate admin user: npm run seed`);
    console.log(`  2. Or seed all demo data: npm run seed-sample`);
    console.log(`  3. Verify reset: node verify-all-tables-empty.js\n`);

    process.exit(0);

  } catch (error) {
    log.error(`Database reset failed: ${error.message}`);
    if (connection) {
      try {
        await connection.execute('SET FOREIGN_KEY_CHECKS=1');
      } catch (e) {
        // Ignore error during cleanup
      }
      await connection.end();
    }
    process.exit(1);
  }
}

// Start the process
resetDatabase();