const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log
  }
);

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Connected successfully\n');

    console.log('Running migration to add new notification types...');
    
    await sequelize.query(`
      ALTER TABLE notifications
      MODIFY COLUMN type ENUM(
        'order', 
        'inventory', 
        'manufacturing', 
        'shipment', 
        'procurement', 
        'finance', 
        'system', 
        'vendor_shortage', 
        'grn_verification', 
        'grn_discrepancy_resolved'
      ) NOT NULL;
    `);
    
    console.log('✓ Migration completed successfully\n');

    // Verify the change
    console.log('Verifying notification type column...');
    const [results] = await sequelize.query(`
      SHOW COLUMNS FROM notifications LIKE 'type'
    `);
    
    console.log('\nNotification type column structure:');
    console.log(JSON.stringify(results[0], null, 2));

    await sequelize.close();
    console.log('\n✓ All done!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();