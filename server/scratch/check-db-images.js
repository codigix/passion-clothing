const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDbImages() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'backend',
      database: process.env.DB_NAME || 'passion_erp'
    });
    
    console.log('Connected to DB.');
    
    // Check if table products exists and has images
    const [tables] = await connection.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`Found ${tableNames.length} tables.`);
    
    const possibleTables = ['products', 'items', 'materials', 'designs', 'templates', 'client_requirements'];
    for (const tbl of possibleTables) {
      if (tableNames.includes(tbl)) {
        const [columns] = await connection.query(`DESCRIBE ${tbl}`);
        const colNames = columns.map(c => c.Field);
        console.log(`Table: ${tbl}, Columns: ${colNames.join(', ')}`);
        
        // Check if any column contains 'image', 'photo', 'url', 'pic', or 'thumbnail'
        const imageCols = colNames.filter(c => c.toLowerCase().includes('image') || 
                                               c.toLowerCase().includes('photo') || 
                                               c.toLowerCase().includes('url') || 
                                               c.toLowerCase().includes('pic') || 
                                               c.toLowerCase().includes('path') ||
                                               c.toLowerCase().includes('file'));
        
        if (imageCols.length > 0) {
          console.log(`  -> Found potential image columns in ${tbl}: ${imageCols.join(', ')}`);
          const [rows] = await connection.query(`SELECT ${imageCols.join(', ')} FROM ${tbl} LIMIT 5`);
          console.log(`  -> Sample rows:`, rows);
        }
      }
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkDbImages();
