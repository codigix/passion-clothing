const { sequelize } = require('./server/config/database');
const migration = require('./server/migrations/20250310000000-enhance-project-material-requests-for-mrm');

async function runMigration() {
  try {
    console.log('🔄 Running MRM migration...');
    
    await migration.up(sequelize.getQueryInterface(), require('sequelize'));
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runMigration();