const { sequelize } = require('./config/database');

async function checkPOColumns() {
  try {
    const [results] = await sequelize.query('DESCRIBE purchase_orders');
    console.log('Purchase Orders table columns:');
    results.forEach(col => {
      console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'}) - ${col.Default || 'no default'}`);
    });

    // Check if specific columns exist
    const hasBarcode = results.some(col => col.Field === 'barcode');
    const hasQrCode = results.some(col => col.Field === 'qr_code');

    console.log(`\nbarcode column exists: ${hasBarcode}`);
    console.log(`qr_code column exists: ${hasQrCode}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkPOColumns();