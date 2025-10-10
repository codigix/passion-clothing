const { sequelize } = require('./server/config/database');

async function checkColumns() {
  try {
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'goods_receipt_notes' 
      AND COLUMN_NAME LIKE '%vendor_revert%'
      ORDER BY COLUMN_NAME
    `);
    
    console.log('Vendor Revert Columns in Database:');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkColumns();