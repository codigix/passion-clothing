const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkNotificationColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Checking notifications table schema...\n');
    
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME]);

    console.log('Columns in notifications table:');
    console.log('================================');
    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME} (${col.DATA_TYPE}) - ${col.COLUMN_COMMENT || 'No comment'}`);
    });

    // Check for specific columns
    const hasEntityId = columns.some(col => col.COLUMN_NAME === 'related_entity_id');
    const hasEntityType = columns.some(col => col.COLUMN_NAME === 'related_entity_type');

    console.log('\n================================');
    console.log('related_entity_id column exists:', hasEntityId);
    console.log('related_entity_type column exists:', hasEntityType);

    if (!hasEntityId || !hasEntityType) {
      console.log('\n⚠️  Missing columns! These need to be added to the database.');
    } else {
      console.log('\n✅ All required columns exist!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkNotificationColumns();