const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('\n🔍 Checking project_material_requests schema...\n');
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'project_material_requests'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME]);

    console.log('📋 Required Fields (NOT NULL without default):');
    console.log('================================================\n');
    
    columns.forEach(col => {
      if (col.IS_NULLABLE === 'NO' && col.COLUMN_DEFAULT === null && !col.COLUMN_NAME.includes('_at')) {
        console.log(`❌ REQUIRED: ${col.COLUMN_NAME} (${col.COLUMN_TYPE})`);
      }
    });

    console.log('\n📋 Optional Fields (NULL allowed):');
    console.log('================================================\n');
    
    columns.forEach(col => {
      if (col.IS_NULLABLE === 'YES' && !col.COLUMN_NAME.includes('_at')) {
        console.log(`✅ OPTIONAL: ${col.COLUMN_NAME} (${col.COLUMN_TYPE})`);
      }
    });

    console.log('\n✅ Diagnosis Complete');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
})();