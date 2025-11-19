require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'passion_erp',
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'create-stage-rework-history.sql'), 'utf8');
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 100) + '...');
        await connection.execute(statement);
      }
    }
    
    console.log('✅ stage_rework_history table created successfully!');
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  } finally {
    await connection.end();
  }
}

createTable();