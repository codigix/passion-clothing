#!/usr/bin/env node

/**
 * SAFE DATABASE TRUNCATION SCRIPT
 * Truncates all tables except users, roles, permissions, and related mappings
 * 
 * Usage:
 *   npm run truncate-db
 *   OR
 *   node truncate-database.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const readline = require('readline');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'passion_erp',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
};

// List of tables to PRESERVE (not truncate)
const PRESERVE_TABLES = [
  'users',
  'roles',
  'permissions',
  'user_roles',
  'role_permissions',
  'user_permissions'
];

// Tables to truncate (in safe dependency order)
const TRUNCATE_TABLES = [
  // Stage & Operations (deepest children)
  'stage_operations',
  'material_consumptions',
  'quality_checkpoints',
  'material_requirements',
  
  // Production & Manufacturing
  'production_completions',
  'production_approvals',
  'production_stages',
  'rejections',
  'production_orders',
  'production_requests',
  
  // Material & Inventory
  'material_verification',
  'material_receipt',
  'material_dispatch',
  'material_allocations',
  'inventory_movements',
  'project_material_requests',
  'vendor_returns',
  'inventory',
  'bill_of_materials',
  
  // Goods Receipt & Quality
  'goods_receipt_notes',
  
  // Shipment
  'shipment_tracking',
  
  // Sales & Procurement
  'sales_order_history',
  'challans',
  'invoices',
  'payments',
  'purchase_orders',
  'sales_orders',
  
  // Master Data
  'samples',
  'store_stocks',
  'shipments',
  'attendances',
  'notifications',
  'approvals',
  'courier_agents',
  'courier_partners',
  'customers',
  'vendors',
  'product_lifecycle_histories',
  'product_lifecycles',
  'products'
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function confirmTruncation() {
  console.log('\n' + '='.repeat(70));
  console.log('⚠️  DATABASE TRUNCATION CONFIRMATION');
  console.log('='.repeat(70));
  
  console.log('\n📊 Database Configuration:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   User: ${dbConfig.user}`);
  
  console.log('\n📋 Tables to be TRUNCATED (' + TRUNCATE_TABLES.length + '):');
  TRUNCATE_TABLES.forEach((table, i) => {
    if (i % 3 === 0) console.log('   ' + table.padEnd(30));
    else if (i % 3 === 1) process.stdout.write(' | ' + table.padEnd(30));
    else {
      console.log(' | ' + table);
    }
  });
  console.log('\n');
  
  console.log('✅ Tables to be PRESERVED (' + PRESERVE_TABLES.length + '):');
  PRESERVE_TABLES.forEach(table => {
    console.log('   ✓ ' + table);
  });
  
  console.log('\n' + '='.repeat(70));
  
  const answer1 = await askQuestion(
    '\n❓ Type "TRUNCATE ALL" to confirm: '
  );
  
  if (answer1.toUpperCase() !== 'TRUNCATE ALL') {
    console.log('\n❌ Truncation cancelled.');
    process.exit(0);
  }
  
  const answer2 = await askQuestion(
    '⚠️  This action CANNOT be undone. Type "YES I AM SURE" to proceed: '
  );
  
  if (answer2.toUpperCase() !== 'YES I AM SURE') {
    console.log('\n❌ Truncation cancelled.');
    process.exit(0);
  }
  
  return true;
}

async function truncateDatabase() {
  let connection;
  
  try {
    console.log('\n🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!\n');
    
    // Confirm truncation
    await confirmTruncation();
    
    console.log('\n🚀 Starting truncation...\n');
    
    // Disable foreign key checks
    console.log('🔒 Disabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('   Done!\n');
    
    // Truncate each table
    let successCount = 0;
    let errorCount = 0;
    
    for (const table of TRUNCATE_TABLES) {
      try {
        await connection.execute(`TRUNCATE TABLE \`${table}\``);
        console.log(`   ✅ ${table.padEnd(35)} - TRUNCATED`);
        successCount++;
      } catch (error) {
        console.log(`   ❌ ${table.padEnd(35)} - ERROR: ${error.message}`);
        errorCount++;
      }
    }
    
    // Re-enable foreign key checks
    console.log('\n🔓 Re-enabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('   Done!\n');
    
    // Summary
    console.log('='.repeat(70));
    console.log('📊 TRUNCATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully truncated: ${successCount} tables`);
    console.log(`❌ Errors: ${errorCount} tables`);
    console.log(`✓  Preserved: ${PRESERVE_TABLES.length} tables (users, roles, permissions, etc.)`);
    console.log('='.repeat(70));
    console.log('\n🎉 Database truncation complete!\n');
    
  } catch (error) {
    console.error('\n❌ Connection Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    rl.close();
  }
}

// Run the script
truncateDatabase().catch(error => {
  console.error('Fatal Error:', error);
  process.exit(1);
});