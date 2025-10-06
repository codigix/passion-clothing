const { sequelize, PurchaseOrder } = require('../config/database');

const testPurchaseOrders = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.');

    console.log('Testing PurchaseOrder model...');

    // Try to find all purchase orders
    const pos = await PurchaseOrder.findAll({
      limit: 1,
      attributes: ['id', 'po_number', 'status']
    });

    console.log('Purchase orders found:', pos.length);
    console.log('Sample PO:', pos[0]?.toJSON() || 'No records');

    console.log('Test completed successfully.');
  } catch (error) {
    console.error('Error testing purchase orders:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  testPurchaseOrders().then(() => {
    if (!process.exitCode) {
      console.log('Test run complete.');
    }
  });
}

module.exports = testPurchaseOrders;