const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'passion_erp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql'
  }
);

async function fixSchema() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Check if column exists
    console.log('\nChecking if project_name column exists...');
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('shipments');
    
    if (columns.project_name) {
      console.log('✓ project_name column already exists');
    } else {
      console.log('✗ project_name column missing, adding it...');
      
      await queryInterface.addColumn('shipments', 'project_name', {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Human-friendly project name for dashboards and reports'
      });
      
      console.log('✓ project_name column added successfully');
    }

    // List all columns for verification
    const updatedColumns = await queryInterface.describeTable('shipments');
    console.log('\n📋 Shipments table columns:');
    Object.keys(updatedColumns).sort().forEach(col => {
      console.log(`  - ${col}: ${updatedColumns[col].type}`);
    });

    console.log('\n✅ Schema fix completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

fixSchema();