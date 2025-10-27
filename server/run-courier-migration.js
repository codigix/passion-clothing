const { sequelize } = require('./config/database');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  try {
    console.log('🔄 Running courier agents migration...');

    // Read the SQL migration file
    const migrationSQL = fs.readFileSync(path.join(__dirname, '../migrations/20250117_create_courier_agents_table.sql'), 'utf8');

    // Execute the migration
    await sequelize.query(migrationSQL);
    
    console.log('✅ Courier agents table created successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await sequelize.close();
    process.exit(1);
  }
};

runMigration();