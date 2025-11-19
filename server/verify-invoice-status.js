const { sequelize } = require('./config/database');

async function verify() {
  try {
    await sequelize.authenticate();
    const result = await sequelize.query('SHOW COLUMNS FROM invoices WHERE Field = "status"');
    console.log('Invoice status column definition:');
    console.log(JSON.stringify(result[0], null, 2));
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verify();
