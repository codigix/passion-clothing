const { sequelize } = require('./server/config/database');
require('dotenv').config();
const fs = require('fs');

const runMigration = async () => {
  try {
    console.log('🔄 Running courier agents migration...');

    // Read the SQL migration file
    const migrationSQL = fs.readFileSync('./migrations/20250117_create_courier_agents_table.sql', 'utf8');

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