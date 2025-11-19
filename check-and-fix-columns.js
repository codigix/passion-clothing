/**
 * Check and fix missing columns in production_orders table
 */

const { sequelize } = require('./server/config/database');

async function checkAndFixColumns() {
  try {
    console.log('🔍 Checking columns in production_orders table...\n');

    // Get all columns
    const [columns] = await sequelize.query('DESCRIBE production_orders');
    const existingColumns = columns.map(col => col.Field);
    
    console.log('Current columns:');
    existingColumns.forEach(col => console.log('  ✓', col));
    
    // List of required columns from the model
    const requiredColumns = [
      'project_name'
    ];

    console.log('\n🔍 Checking for missing columns...\n');

    const missingColumns = requiredColumns.filter(
      col => !existingColumns.includes(col)
    );

    if (missingColumns.length === 0) {
      console.log('✅ All required columns exist!');
      process.exit(0);
    }

    console.log('❌ Missing columns found:', missingColumns);
    console.log('\n🔧 Adding missing columns...\n');

    // Add missing columns
    if (missingColumns.includes('project_name')) {
      try {
        await sequelize.query(`
          ALTER TABLE production_orders
          ADD COLUMN project_name VARCHAR(200) DEFAULT NULL COMMENT 'Human-friendly project name for dashboards and reports'
        `);
        console.log('✓ Added project_name column');
      } catch (err) {
        console.log('✗ Error adding project_name:', err.message);
      }
    }

    console.log('\n✅ Database schema fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndFixColumns();