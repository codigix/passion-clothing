const { sequelize, PurchaseOrder, Vendor, User, SalesOrder, Customer } = require('../config/database');

const debugProcurementRoute = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.');

    console.log('Testing procurement /pos route query...');

    const limit = 10;
    const offset = 0;
    const where = {};

    console.log('Query parameters:', { where, limit, offset });

    // Try the exact query from the route
    const { count, rows } = await PurchaseOrder.findAndCountAll({
      where,
      include: [
        { model: Vendor, as: 'vendor', attributes: ['id', 'name', 'vendor_code', 'email', 'phone'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'employee_id'] },
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'order_number', 'status', 'delivery_date', 'total_quantity'],
          include: [
            { model: Customer, as: 'customer', attributes: ['id', 'name', 'customer_code'] }
          ],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('Query successful!');
    console.log('Count:', count);
    console.log('Rows:', rows.length);

  } catch (error) {
    console.error('Error in procurement route query:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      sql: error.sql,
      parameters: error.parameters
    });
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  debugProcurementRoute().then(() => {
    if (!process.exitCode) {
      console.log('Debug complete.');
    }
  });
}

module.exports = debugProcurementRoute;