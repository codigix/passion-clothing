const db = require('./server/config/database');

(async () => {
  try {
    // Check the database schema
    const result = await db.sequelize.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'goods_receipt_notes' AND COLUMN_NAME = 'status'
    `);
    
    console.log('=== GRN Status Column Type ===');
    console.log('Result:', JSON.stringify(result[0], null, 2));
    
    // Also check verification_status
    const result2 = await db.sequelize.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'goods_receipt_notes' AND COLUMN_NAME = 'verification_status'
    `);
    
    console.log('\n=== GRN Verification Status Column Type ===');
    console.log('Result:', JSON.stringify(result2[0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();