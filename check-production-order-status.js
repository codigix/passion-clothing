const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('passion_erp', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

async function checkStatusColumn() {
  try {
    // Check the ENUM values in the database
    const [results] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'passion_erp' 
      AND TABLE_NAME = 'production_orders' 
      AND COLUMN_NAME = 'status'
    `);

    console.log('📊 Current database ENUM values for status column:');
    console.log(results);

    // Check if there are any production orders with invalid status
    const [orders] = await sequelize.query(`
      SELECT id, production_number, status 
      FROM production_orders 
      LIMIT 5
    `);

    console.log('\n📦 Sample production orders:');
    console.log(orders);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error);
    await sequelize.close();
  }
}

checkStatusColumn();