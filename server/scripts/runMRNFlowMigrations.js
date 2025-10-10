const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'passion_erp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log
  }
);

async function runMigrations() {
  try {
    console.log('🔄 Starting MRN Flow migrations...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Migration 1: Material Dispatches
    console.log('📦 Creating material_dispatches table...');
    const migration1 = require('../migrations/20250128000001-create-material-dispatch-table');
    await migration1.up(sequelize.getQueryInterface(), Sequelize);
    console.log('✅ material_dispatches table created\n');

    // Migration 2: Material Receipts
    console.log('📦 Creating material_receipts table...');
    const migration2 = require('../migrations/20250128000002-create-material-receipt-table');
    await migration2.up(sequelize.getQueryInterface(), Sequelize);
    console.log('✅ material_receipts table created\n');

    // Migration 3: Material Verifications
    console.log('📦 Creating material_verifications table...');
    const migration3 = require('../migrations/20250128000003-create-material-verification-table');
    await migration3.up(sequelize.getQueryInterface(), Sequelize);
    console.log('✅ material_verifications table created\n');

    // Migration 4: Production Approvals
    console.log('📦 Creating production_approvals table...');
    const migration4 = require('../migrations/20250128000004-create-production-approval-table');
    await migration4.up(sequelize.getQueryInterface(), Sequelize);
    console.log('✅ production_approvals table created\n');

    console.log('🎉 All MRN Flow migrations completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ 4 tables created');
    console.log('   ✅ All foreign keys established');
    console.log('   ✅ All indexes created');
    console.log('\n🚀 MRN Flow system is ready to use!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();