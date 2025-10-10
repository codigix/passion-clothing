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

async function checkProductionRequests() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check production requests
    const [requests] = await sequelize.query(`
      SELECT id, request_number, product_name, status, quantity, created_at
      FROM production_requests
      ORDER BY id
    `);
    
    console.log('📋 Production Requests in database:');
    console.log('================================\n');
    
    if (requests.length === 0) {
      console.log('❌ NO PRODUCTION REQUESTS FOUND!\n');
    } else {
      console.log(`Found ${requests.length} production request(s):\n`);
      requests.forEach(req => {
        console.log(`ID: ${req.id}`);
        console.log(`  Request Number: ${req.request_number}`);
        console.log(`  Product: ${req.product_name}`);
        console.log(`  Status: ${req.status}`);
        console.log(`  Quantity: ${req.quantity}`);
        console.log(`  Created: ${req.created_at}`);
        console.log('');
      });
    }

    // Check if request ID 3 exists
    const [requestThree] = await sequelize.query(`
      SELECT * FROM production_requests WHERE id = 3
    `);
    
    console.log('🔍 Looking for Production Request ID 3:');
    console.log('====================================');
    if (requestThree.length > 0) {
      console.log('✅ Found!');
      console.log(JSON.stringify(requestThree[0], null, 2));
    } else {
      console.log('❌ Production Request ID 3 NOT FOUND!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkProductionRequests();