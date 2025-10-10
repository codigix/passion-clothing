const { sequelize } = require('../config/database');
const migration = require('../migrations/20250310000000-enhance-project-material-requests-for-MRN');

async function runMigration() {
  try {
    console.log('🔄 Starting MRN migration...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    await migration.up(sequelize.getQueryInterface(), require('sequelize'));
    console.log('✅ Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();