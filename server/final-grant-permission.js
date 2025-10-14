/**
 * Final Grant Permission Script
 * 
 * Usage:
 *   cd server
 *   node final-grant-permission.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function finalGrant() {
  let connection;
  
  try {
    console.log('🔍 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'passion_erp'
    });
    
    console.log('✅ Connected\n');

    // Get users table structure
    console.log('📋 Checking users table structure...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
    `);
    console.log('Columns:', columns.map(c => c.COLUMN_NAME).join(', '));
    console.log('');

    // Get all users
    console.log('📋 Getting users...');
    const [users] = await connection.query(`SELECT * FROM users LIMIT 10`);
    console.log(`Found ${users.length} user(s)`);
    if (users.length > 0) {
      users.forEach(u => console.log(`   - ${u.name} (${u.email})`));
    }
    console.log('');

    // Get permission
    const [perms] = await connection.query(`
      SELECT id FROM permissions 
      WHERE name = 'manufacturing.create.production_order'
    `);
    
    if (perms.length === 0) {
      console.log('❌ Permission not found!');
      process.exit(1);
    }
    
    const permissionId = perms[0].id;
    console.log(`✅ Permission ID: ${permissionId}\n`);

    // Check if user_permissions table exists
    const [userPermTables] = await connection.query(`
      SHOW TABLES LIKE 'user_permissions'
    `);

    if (userPermTables.length === 0) {
      console.log('⚠️  user_permissions table does not exist!');
      console.log('Creating user_permissions table...\n');
      
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_permissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          permission_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_permission (user_id, permission_id)
        )
      `);
      
      console.log('✅ user_permissions table created!\n');
    }

    // Grant permission to all users
    console.log('📋 Granting permission to all users...');
    
    for (const user of users) {
      try {
        await connection.query(`
          INSERT IGNORE INTO user_permissions (user_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, [user.id, permissionId]);
        console.log(`   ✅ Granted to ${user.name}`);
      } catch (err) {
        console.log(`   ⏭️  ${user.name} (already has or error: ${err.message})`);
      }
    }

    console.log('');
    console.log('🎉 PERMISSION GRANTED!\n');
    console.log('⚠️  CRITICAL STEP: Log out and log back in!\n');
    console.log('Without logging out and back in, the permission will NOT take effect!');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

finalGrant();