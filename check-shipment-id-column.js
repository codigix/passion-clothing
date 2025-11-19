const { sequelize } = require('./server/config/database.js');

async function checkColumn() {
  try {
    // Check if shipment_id column exists
    const result = await sequelize.query('SHOW COLUMNS FROM production_orders LIKE "shipment_id"');
    
    if (result[0].length === 0) {
      console.log('\n❌ ERROR: shipment_id column does NOT exist in production_orders table');
      console.log('This is why the API is failing with: Unknown column "ProductionOrder.shipment_id"');
      console.log('\nFix: Running migration to add the column...\n');
      
      // Run the migration
      const Umzug = require('umzug');
      const path = require('path');
      
      const umzug = new Umzug({
        migrations: {
          glob: path.join(__dirname, 'server/migrations/*.js'),
        },
        context: sequelize.queryInterface,
        storage: new (require('umzug')).sequelizeStorage({
          sequelize,
        }),
        logger: console,
      });
      
      const migrations = await umzug.up();
      console.log('\n✅ Migrations completed:', migrations.length, 'migration(s) run');
    } else {
      console.log('\n✅ shipment_id column EXISTS in production_orders table');
      console.log('Column details:', result[0][0]);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkColumn();