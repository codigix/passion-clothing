const { sequelize } = require('./server/config/database');

async function checkVendors() {
  try {
    const [columns] = await sequelize.query('DESCRIBE vendors');
    console.log('Vendors table columns:');
    columns.forEach(c => console.log(`  - ${c.Field} (${c.Type})`));
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkVendors();