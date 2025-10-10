const { Sequelize } = require('./server/node_modules/sequelize');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

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

async function checkSchema() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Get table description for vendor_returns
    const [results] = await sequelize.query(`
      DESCRIBE vendor_returns;
    `);
    
    console.log('\n=== vendor_returns table schema ===');
    console.table(results);
    
    // Check if there's a 'type' column
    const typeColumn = results.find(col => col.Field === 'type' || col.Field === 'return_type');
    if (typeColumn) {
      console.log('\n⚠️ FOUND type/return_type column:');
      console.log(JSON.stringify(typeColumn, null, 2));
    } else {
      console.log('\n✓ No type or return_type column found');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();