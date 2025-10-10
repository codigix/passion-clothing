const {sequelize} = require('./server/config/database');

async function checkTypeColumn() {
  try {
    console.log('=== Checking inventory table ===');
    const [invCols] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'inventory' 
      AND COLUMN_NAME LIKE '%type%'
    `);
    
    console.log('Columns with "type" in inventory:');
    console.log(JSON.stringify(invCols, null, 2));
    
    console.log('\n=== Checking inventory_movements table ===');
    const [movCols] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'inventory_movements' 
      AND COLUMN_NAME LIKE '%type%'
    `);
    
    console.log('Columns with "type" in inventory_movements:');
    console.log(JSON.stringify(movCols, null, 2));
    
    console.log('\n=== Checking products table ===');
    const [prodCols] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME LIKE '%type%'
    `);
    
    console.log('Columns with "type" in products:');
    console.log(JSON.stringify(prodCols, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTypeColumn();