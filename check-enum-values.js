const {sequelize} = require('./server/config/database');

async function checkEnumValues() {
  try {
    console.log('=== Checking inventory.movement_type ENUM ===');
    const [invCols] = await sequelize.query(`SHOW COLUMNS FROM inventory WHERE Field = 'movement_type'`);
    console.log(JSON.stringify(invCols[0], null, 2));
    
    console.log('\n=== Checking inventory_movements.movement_type ENUM ===');
    const [movCols] = await sequelize.query(`SHOW COLUMNS FROM inventory_movements WHERE Field = 'movement_type'`);
    console.log(JSON.stringify(movCols[0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkEnumValues();