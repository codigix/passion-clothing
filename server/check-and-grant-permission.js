/**
 * Check System Status and Grant Permission
 * 
 * This script will:
 * 1. Check if roles exist
 * 2. Check if users exist  
 * 3. Grant permission appropriately
 * 
 * Usage:
 *   cd server
 *   node check-and-grant-permission.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAndGrant() {
  let connection;
  
  try {
    console.log('🔍 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'passion_erp'
    });
    
    console.log('✅ Connected to database\n');

    // Check tables
    console.log('📋 Checking system tables...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('users', 'roles', 'permissions', 'role_permissions', 'user_permissions')
    `);
    
    console.log('✅ Found tables:', tables.map(t => t.TABLE_NAME).join(', '));
    console.log('');

    // Check users
    console.log('📋 Checking users...');
    const [users] = await connection.query(`SELECT id, name, email, role_id FROM users LIMIT 10`);
    console.log(`✅ Found ${users.length} user(s)`);
    if (users.length > 0) {
      users.forEach(u => console.log(`   - ${u.name} (${u.email}) - Role ID: ${u.role_id || 'NULL'}`));
    }
    console.log('');

    // Check roles
    console.log('📋 Checking roles...');
    const [roles] = await connection.query(`SELECT id, name, level FROM roles LIMIT 10`);
    console.log(`✅ Found ${roles.length} role(s)`);
    if (roles.length > 0) {
      roles.forEach(r => console.log(`   - ${r.name} (ID: ${r.id}, Level: ${r.level})`));
    }
    console.log('');

    // Check permission
    console.log('📋 Checking permission...');
    const [permissions] = await connection.query(`
      SELECT id, name, display_name 
      FROM permissions 
      WHERE name = 'manufacturing.create.production_order'
    `);
    
    if (permissions.length === 0) {
      console.log('❌ Permission not found! This should have been created.');
      process.exit(1);
    }
    
    const permissionId = permissions[0].id;
    console.log(`✅ Permission found: ${permissions[0].display_name} (ID: ${permissionId})`);
    console.log('');

    // Check if user_permissions table exists
    const hasUserPermissions = tables.some(t => t.TABLE_NAME === 'user_permissions');
    
    if (hasUserPermissions) {
      console.log('📋 Granting permission directly to all users...');
      
      for (const user of users) {
        const [existing] = await connection.query(`
          SELECT id FROM user_permissions 
          WHERE user_id = ? AND permission_id = ?
        `, [user.id, permissionId]);

        if (existing.length > 0) {
          console.log(`   ⏭️  ${user.name} already has permission`);
        } else {
          await connection.query(`
            INSERT INTO user_permissions (user_id, permission_id, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())
          `, [user.id, permissionId]);
          console.log(`   ✅ Granted to ${user.name}`);
        }
      }
    } else if (roles.length > 0) {
      console.log('📋 Granting permission to roles...');
      
      for (const role of roles) {
        const [existing] = await connection.query(`
          SELECT id FROM role_permissions 
          WHERE role_id = ? AND permission_id = ?
        `, [role.id, permissionId]);

        if (existing.length > 0) {
          console.log(`   ⏭️  ${role.name} already has permission`);
        } else {
          await connection.query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())
          `, [role.id, permissionId]);
          console.log(`   ✅ Granted to ${role.name}`);
        }
      }
    } else {
      console.log('⚠️  WARNING: No users or roles found to grant permission to!');
      console.log('Please create users/roles or run database migrations first.');
    }

    console.log('');
    console.log('🎉 DONE!\n');
    console.log('⚠️  IMPORTANT: Log out and log back in for changes to take effect!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAndGrant();