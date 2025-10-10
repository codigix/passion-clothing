const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './server/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

async function checkProductionOrders() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // First, check table structure
    const [columns] = await sequelize.query('DESCRIBE production_orders');
    console.log('📋 Production Orders Table Structure:');
    console.log('====================================\n');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('\n');

    // Check all production orders
    const [orders] = await sequelize.query(`
      SELECT * FROM production_orders ORDER BY id
    `);
    
    console.log('📋 Production Orders in database:');
    console.log('================================\n');
    
    if (orders.length === 0) {
      console.log('❌ NO PRODUCTION ORDERS FOUND!\n');
    } else {
      console.log(`Found ${orders.length} production order(s):\n`);
      orders.forEach(order => {
        console.log(`ID: ${order.id}`);
        console.log(`  Product: ${order.product_name || 'N/A'}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Quantity: ${order.quantity || 'N/A'}`);
        console.log(`  Created: ${order.createdAt}`);
        console.log('');
      });
    }

    // Check if order ID 3 specifically exists
    const [orderThree] = await sequelize.query(`
      SELECT * FROM production_orders WHERE id = 3
    `);
    
    console.log('🔍 Looking for Production Order ID 3:');
    console.log('====================================');
    if (orderThree.length > 0) {
      console.log('✅ Found!');
      console.log(JSON.stringify(orderThree[0], null, 2));
    } else {
      console.log('❌ Production Order ID 3 NOT FOUND!');
      console.log('\n💡 Tip: Create a production order first or use an existing ID');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkProductionOrders();