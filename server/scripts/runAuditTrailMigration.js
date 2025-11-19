const path = require('path');
const sequelize = require('../config/database').sequelize;

const runMigration = async () => {
  try {
    console.log('Starting Audit Trail table migration...');
    
    await sequelize.authenticate();
    console.log('Database connection established');

    const migration = require('../migrations/20251114000000-create-audit-trail-table');
    
    await migration.up(sequelize.getQueryInterface(), require('sequelize').DataTypes);
    console.log('✓ Audit Trail table created successfully');

    const User = require('../models/User')(sequelize);
    const AuditTrail = require('../models/AuditTrail')(sequelize);
    
    console.log('✓ Audit Trail model registered');
    console.log('Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
