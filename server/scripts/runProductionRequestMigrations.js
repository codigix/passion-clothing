const { sequelize } = require('../config/database');

const runProductionRequestMigrations = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    console.log('\n📦 Running production request migrations...\n');

    // Migration 1: Create production_requests table
    console.log('1️⃣ Creating production_requests table...');
    const migration1 = require('../migrations/20251008000000-create-production-requests-table');
    await migration1.up(sequelize.getQueryInterface(), sequelize.constructor);
    console.log('✅ Table created successfully.\n');

    // Migration 2: Add sales order support
    console.log('2️⃣ Adding sales order columns...');
    const migration2 = require('../migrations/20250115000000-add-sales-order-to-production-requests');
    await migration2.up(sequelize.getQueryInterface(), sequelize.constructor);
    console.log('✅ Sales order columns added successfully.\n');

    console.log('🎉 All production request migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    
    // Provide helpful error messages
    if (error.original?.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('\nℹ️  Table already exists. If you need to modify it, use individual migrations.');
    } else if (error.original?.code === 'ER_DUP_FIELDNAME') {
      console.log('\nℹ️  Column already exists. Migration may have been partially run.');
    }
    
    process.exitCode = 1;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
};

if (require.main === module) {
  runProductionRequestMigrations();
}

module.exports = runProductionRequestMigrations;