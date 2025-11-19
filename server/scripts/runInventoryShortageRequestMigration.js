const path = require('path');
const Sequelize = require('sequelize');

const runMigration = async () => {
  try {
    console.log('Connecting to database...');
    
    const database = process.env.DB_NAME || 'passion_erp';
    const username = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || 'root';
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 3306;

    const sequelize = new Sequelize(database, username, password, {
      host,
      port,
      dialect: 'mysql',
      logging: console.log
    });

    await sequelize.authenticate();
    console.log('Connection established.');

    const migrationPath = path.join(__dirname, '../migrations/20251110000004-create-inventory-shortage-requests-table.js');
    const migration = require(migrationPath);
    
    console.log('Running migration: 20251110000004-create-inventory-shortage-requests-table.js...');
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('✅ Migration completed successfully!');
    console.log('The inventory_shortage_requests table has been created.');
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exitCode = 1;
  }
};

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
