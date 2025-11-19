const path = require('path');
const db = require('../config/database');
const { sequelize } = db;

const runMigration = async () => {
  try {
    console.log('🔄 Running Credit Notes migration...');

    // Read and execute the migration file
    const migration = require('../migrations/20251112000001-create-credit-notes-table.js');

    await migration.up(sequelize.getQueryInterface(), require('sequelize'));

    console.log('✅ Credit Notes table created successfully!');

    // Verify table exists
    const tables = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'credit_notes'
    `, {
      replacements: [process.env.DB_NAME || 'passion_erp'],
      type: sequelize.QueryTypes.SELECT
    });

    if (tables.length > 0) {
      console.log('✅ credit_notes table verified in database');
      
      // List columns
      const columns = await sequelize.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'credit_notes'
      `, {
        replacements: [process.env.DB_NAME || 'passion_erp'],
        type: sequelize.QueryTypes.SELECT
      });

      console.log('\n📋 Table Columns:');
      columns.forEach(col => {
        console.log(`  • ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    } else {
      console.log('❌ credit_notes table not found after migration');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    console.error(error);
    process.exit(1);
  }
};

runMigration();
