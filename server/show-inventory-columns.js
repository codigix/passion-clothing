const { Sequelize } = require('sequelize');
require('dotenv').config();

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

async function showColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const [columns] = await sequelize.query('DESCRIBE inventory');
    
    console.log('📋 Columns in inventory table:');
    console.log('================================');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

showColumns();