const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'passion_erp'
  });

  try {
    console.log('\n=== PROJECT_MATERIAL_REQUESTS TABLE SCHEMA ===\n');
    
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'project_material_requests'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'passion_erp']);
    
    console.log('All Columns:');
    columns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} | Nullable: ${col.IS_NULLABLE} | Default: ${col.COLUMN_DEFAULT} | Extra: ${col.EXTRA}`);
    });

    console.log('\n=== STATUS COLUMN DETAIL ===\n');
    const statusCol = columns.find(c => c.COLUMN_NAME === 'status');
    if (statusCol) {
      console.log('Status Column Type:', statusCol.COLUMN_TYPE);
      console.log('Status Default:', statusCol.COLUMN_DEFAULT);
      console.log('Status Nullable:', statusCol.IS_NULLABLE);
      
      // Extract ENUM values
      const enumMatch = statusCol.COLUMN_TYPE.match(/enum\((.*)\)/i);
      if (enumMatch) {
        const enumValues = enumMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        console.log('\nValid ENUM values:');
        enumValues.forEach((v, i) => console.log(`  ${i + 1}. ${v}`));
      }
    } else {
      console.log('❌ Status column NOT FOUND!');
    }

    console.log('\n=== SAMPLE RECORDS ===\n');
    const [records] = await connection.query(
      'SELECT id, request_number, requesting_department, status FROM project_material_requests LIMIT 5'
    );
    console.log('Sample records:', JSON.stringify(records, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkSchema();