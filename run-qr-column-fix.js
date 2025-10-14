const { sequelize } = require('./server/config/database');

async function fixQRCodeColumn() {
  try {
    console.log('🔧 Fixing QR code column size...');
    
    // Change column from VARCHAR(255) to TEXT
    await sequelize.query(`
      ALTER TABLE sales_orders 
      MODIFY COLUMN qr_code TEXT 
      COMMENT 'QR code data containing comprehensive order information (large JSON)'
    `);
    
    console.log('✅ QR code column successfully expanded to TEXT');
    console.log('✅ Can now store up to 65,535 characters (was 255)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing QR code column:', error.message);
    process.exit(1);
  }
}

fixQRCodeColumn();