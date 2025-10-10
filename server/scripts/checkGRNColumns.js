/**
 * Check GRN table columns
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize } = require('../config/database');

async function checkGRNColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const [columns] = await sequelize.query('DESCRIBE goods_receipt_notes');

    console.log('📊 GRN table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default ? `default: ${col.Default}` : ''}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkGRNColumns();