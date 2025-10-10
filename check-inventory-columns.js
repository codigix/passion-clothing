const { sequelize } = require('./server/config/database');

async function checkInventoryColumns() {
  try {
    const [results] = await sequelize.query(`
      DESCRIBE inventory;
    `);
    
    console.log('\n=== Inventory Table Columns ===');
    results.forEach(col => {
      console.log(`Column: ${col.Field}`);
      console.log(`  Type: ${col.Type}`);
      console.log(`  Null: ${col.Null}`);
      console.log(`  Default: ${col.Default}`);
      console.log('---');
    });
    
    // Check if there's a 'type' column
    const typeColumn = results.find(col => col.Field === 'type');
    if (typeColumn) {
      console.log('\n⚠️  WARNING: Found "type" column in inventory table!');
      console.log('This column should not exist according to the model.');
    } else {
      console.log('\n✓ No "type" column found (as expected)');
    }
    
    // Check movement_type column
    const movementTypeColumn = results.find(col => col.Field === 'movement_type');
    if (movementTypeColumn) {
      console.log('\n✓ Found "movement_type" column:');
      console.log(`  Type: ${movementTypeColumn.Type}`);
    } else {
      console.log('\n⚠️  WARNING: "movement_type" column not found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkInventoryColumns();