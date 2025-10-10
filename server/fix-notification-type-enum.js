const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixNotificationTypeEnum() {
  let connection;
  
  try {
    console.log('🔧 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'passion_erp'
    });

    console.log('✅ Connected successfully');

    // First, check current ENUM values
    console.log('\n📋 Checking current ENUM values...');
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM notifications LIKE 'type'
    `);
    
    if (columns.length > 0) {
      console.log('Current type ENUM:', columns[0].Type);
    }

    // Update the ENUM to include all notification types
    console.log('\n🔄 Updating type column ENUM...');
    await connection.execute(`
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
        'grn_verified',
        'grn_discrepancy',
        'grn_discrepancy_resolved'
      ) NOT NULL
    `);

    console.log('✅ Type column ENUM updated successfully');

    // Verify the change
    console.log('\n🔍 Verifying updated ENUM...');
    const [updatedColumns] = await connection.execute(`
      SHOW COLUMNS FROM notifications LIKE 'type'
    `);
    
    if (updatedColumns.length > 0) {
      console.log('✅ Updated type ENUM:', updatedColumns[0].Type);
    }

    console.log('\n✨ Notification type ENUM fix completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your server');
    console.log('2. Try creating GRN again');

  } catch (error) {
    console.error('❌ Error fixing notification type ENUM:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the fix
fixNotificationTypeEnum();