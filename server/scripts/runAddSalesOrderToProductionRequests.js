const { sequelize } = require('../config/database');
const migration = require('../migrations/20250115000000-add-sales-order-to-production-requests');

async function runMigration() {
  try {
    console.log('Starting migration: Add Sales Order to Production Requests...');

    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);

    console.log('✅ Migration completed successfully (or no changes were needed).');
    console.log('Production Requests table now supports:');
    console.log('  - sales_order_id (link to Sales Orders)');
    console.log('  - sales_order_number (for reference)');
    console.log('  - sales_notes (notes from Sales department)');
    console.log('  - po_id is now nullable (can be from SO or PO)');

    console.log('\nIf this migration was already applied, remember to mark it as complete in SequelizeMeta.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigration();