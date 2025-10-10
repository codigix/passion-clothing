const { sequelize } = require('./config/database');

async function checkInventoryColumns() {

  try {
    const [results] = await sequelize.query('DESCRIBE inventory');
    console.log('Inventory table columns:');
    results.forEach(col => {
      console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'}) - ${col.Default || 'no default'}`);
    });

    // Check if specific columns exist
    const hasProjectId = results.some(col => col.Field === 'project_id');
    const hasStockType = results.some(col => col.Field === 'stock_type');

    console.log(`\nproject_id column exists: ${hasProjectId}`);
    console.log(`stock_type column exists: ${hasStockType}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkInventoryColumns();