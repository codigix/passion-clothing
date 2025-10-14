/**
 * ================================================================
 * COMPLETE DATABASE RESET SCRIPT (Node.js)
 * ================================================================
 * This script will TRUNCATE ALL TABLES in the database
 * ⚠️ WARNING: This deletes ALL DATA - use with caution!
 * ================================================================
 */

const { Sequelize } = require('sequelize');
const readline = require('readline');

// Initialize Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'passion_erp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// List of tables to truncate (in correct order)
const tables = [
  'production_approvals',
  'material_verifications',
  'material_receipts',
  'material_dispatches',
  'production_stage_operations',
  'production_stages',
  'production_orders',
  'production_requests',
  'rejections',
  'material_request_materials',
  'material_requests',
  'grn_verifications',
  'grns',
  'purchase_order_items',
  'purchase_orders',
  'vendors',
  'sales_order_items',
  'sales_orders',
  'customers',
  'stock_movements',
  'project_materials',
  'inventory',
  'products',
  'challan_items',
  'challans',
  'shipments',
  'outsourcing_orders',
  'store_stock_movements',
  'store_stock',
  'payments',
  'invoices',
  'sample_order_items',
  'sample_orders',
  'notifications',
  'attendance',
  'user_roles',
  'role_permissions',
  'permissions',
  'roles',
  'users'
];

async function showCurrentCounts() {
  console.log('\n📊 Current database status:');
  console.log('═'.repeat(50));
  
  const importantTables = ['users', 'sales_orders', 'purchase_orders', 
                          'production_requests', 'production_orders', 
                          'inventory', 'products', 'customers'];
  
  for (const table of importantTables) {
    try {
      const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  ${table.padEnd(25)} ${results[0].count} records`);
    } catch (error) {
      console.log(`  ${table.padEnd(25)} (table not found)`);
    }
  }
  console.log('═'.repeat(50));
}

async function truncateAllTables() {
  console.log('\n🔥 Truncating all tables...\n');
  
  // Disable foreign key checks
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  
  let truncated = 0;
  let skipped = 0;
  
  for (const table of tables) {
    try {
      await sequelize.query(`TRUNCATE TABLE ${table}`);
      console.log(`  ✅ ${table}`);
      truncated++;
    } catch (error) {
      console.log(`  ⚠️  ${table} (skipped - not found)`);
      skipped++;
    }
  }
  
  // Re-enable foreign key checks
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  
  console.log(`\n📊 Summary: ${truncated} truncated, ${skipped} skipped`);
}

async function confirmAction() {
  return new Promise((resolve) => {
    console.log('\n⚠️  WARNING: This will DELETE ALL DATA from ALL tables!');
    console.log('This includes:');
    console.log('  ❌ All user accounts');
    console.log('  ❌ All sales and purchase orders');
    console.log('  ❌ All production data');
    console.log('  ❌ All inventory items');
    console.log('  ❌ Everything in the database');
    console.log('\n⚠️  This action CANNOT be undone!');
    console.log('\nType "DELETE EVERYTHING" to proceed (case-sensitive): ');
    
    rl.question('> ', (answer) => {
      resolve(answer === 'DELETE EVERYTHING');
    });
  });
}

async function main() {
  try {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   COMPLETE DATABASE RESET                      ║');
    console.log('╚════════════════════════════════════════════════╝');
    
    // Test connection
    console.log('\n🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Show current counts
    await showCurrentCounts();
    
    // Get confirmation
    const confirmed = await confirmAction();
    
    if (!confirmed) {
      console.log('\n❌ Reset cancelled. No changes made.');
      process.exit(0);
    }
    
    // Truncate tables
    await truncateAllTables();
    
    // Show final counts
    await showCurrentCounts();
    
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   ✅ DATABASE RESET COMPLETE                   ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('\n📋 Next steps:');
    console.log('  1. Run seeders: cd server && node seeders/seed.js');
    console.log('  2. Restart server: npm start');
    console.log('  3. Login with default admin credentials\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// Run the script
main();