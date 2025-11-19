const { sequelize, Invoice } = require('./server/config/database');

const testKPIQuery = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    console.log('\n=== Testing Invoice.sum() ===');
    const result = await Invoice.sum('total_amount', { 
      where: { invoice_type: 'sales', payment_status: 'paid' } 
    });
    console.log('Sum result:', result);

    console.log('\n=== Testing raw query ===');
    const [rows] = await sequelize.query('SELECT SUM(total_amount) as total FROM invoices WHERE invoice_type = ? AND payment_status = ?', {
      replacements: ['sales', 'paid']
    });
    console.log('Raw query result:', rows);

    const invoices = await Invoice.findAll({ limit: 5 });
    console.log('\nFirst 5 invoices:', JSON.stringify(invoices, null, 2));

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
};

testKPIQuery();
