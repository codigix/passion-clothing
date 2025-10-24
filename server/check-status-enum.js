require('dotenv').config();
const { sequelize } = require('./config/database');

async function checkStatusColumn() {
  try {
    // Check the ENUM values in the database
    const [results] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'production_orders' 
      AND COLUMN_NAME = 'status'
    `);

    console.log('📊 Current database ENUM values for status column:');
    console.log(JSON.stringify(results, null, 2));

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
  }
}

checkStatusColumn();