/**
 * Run Production Order Project Reference Migration
 * 
 * This script adds the project_reference field to production_orders table
 * and migrates existing data.
 * 
 * Usage:
 *   node run-production-order-migration.js
 */

require('dotenv').config();
const { sequelize } = require('./server/config/database');
const migration = require('./migrations/add-project-reference-to-production-orders');

async function runMigration() {
  console.log('='.repeat(60));
  console.log('🚀 Production Order Project Reference Migration');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    console.log('');
    
    // Run migration
    console.log('🔧 Running migration...');
    console.log('');
    
    await migration.up(sequelize.getQueryInterface(), sequelize);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📊 Summary:');
    console.log('  • Added project_reference column to production_orders');
    console.log('  • Added index for better query performance');
    console.log('  • Migrated existing data from sales_orders');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('  1. Verify data with: SELECT * FROM production_orders LIMIT 5;');
    console.log('  2. Restart your application server');
    console.log('  3. Test production order creation from frontend');
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ Migration failed!');
    console.error('='.repeat(60));
    console.error('');
    console.error('Error details:', error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('  1. Check database credentials in .env file');
    console.error('  2. Ensure database server is running');
    console.error('  3. Verify production_orders table exists');
    console.error('  4. Check if column already exists (safe to ignore)');
    console.error('');
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Migration interrupted by user');
  await sequelize.close();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⚠️  Migration terminated');
  await sequelize.close();
  process.exit(1);
});

// Run migration
runMigration();