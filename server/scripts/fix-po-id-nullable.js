const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'passion_erp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log
  }
);

async function fixPoIdColumn() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully\n');

    console.log('Making po_id nullable in production_requests table...');
    
    // First, check current column definition
    const [results] = await sequelize.query(`
      SHOW COLUMNS FROM production_requests WHERE Field = 'po_id'
    `);
    
    console.log('\nCurrent po_id column definition:');
    console.log(results[0]);
    
    // Alter the column to make it nullable
    await sequelize.query(`
      ALTER TABLE production_requests 
      MODIFY COLUMN po_id INT NULL
    `);
    
    console.log('\n✅ Successfully made po_id nullable');
    
    // Verify the change
    const [newResults] = await sequelize.query(`
      SHOW COLUMNS FROM production_requests WHERE Field = 'po_id'
    `);
    
    console.log('\nNew po_id column definition:');
    console.log(newResults[0]);
    
    // Also check po_number
    console.log('\n\nChecking po_number column...');
    const [poNumberResults] = await sequelize.query(`
      SHOW COLUMNS FROM production_requests WHERE Field = 'po_number'
    `);
    
    console.log('Current po_number column definition:');
    console.log(poNumberResults[0]);
    
    if (poNumberResults[0].Null === 'NO') {
      console.log('\nMaking po_number nullable as well...');
      await sequelize.query(`
        ALTER TABLE production_requests 
        MODIFY COLUMN po_number VARCHAR(50) NULL
      `);
      console.log('✅ Successfully made po_number nullable');
    }
    
    console.log('\n✅ All done! Production requests can now be created from Sales Orders.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

fixPoIdColumn();