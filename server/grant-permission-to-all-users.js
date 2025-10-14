/**
 * Grant Production Wizard Permission to ALL Users
 * 
 * This is a quick fix to grant permission to all roles temporarily
 * 
 * Usage:
 *   cd server
 *   node grant-permission-to-all-users.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function grantToAll() {
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

    // Get permission ID
    const [permissions] = await connection.query(`
      SELECT id FROM permissions 
      WHERE name = 'manufacturing.create.production_order'
    `);

    if (permissions.length === 0) {
      console.log('❌ Permission not found!');
      process.exit(1);
    }

    const permissionId = permissions[0].id;
    console.log(`✅ Permission ID: ${permissionId}\n`);

    // Get all roles
    console.log('📋 All roles in system:');
    const [roles] = await connection.query(`SELECT id, name, level, department FROM roles ORDER BY level DESC`);
    
    if (roles.length === 0) {
      console.log('❌ No roles found!');
      process.exit(1);
    }

    roles.forEach(role => {
      console.log(`   - ${role.name} (Level ${role.level}, Department: ${role.department || 'N/A'})`);
    });
    console.log('');

    // Grant to ALL roles
    console.log('📋 Granting permission to ALL roles...');
    
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
    console.log('');

    // Show all users who now have access
    console.log('📋 All users with Production Wizard access:');
    const [users] = await connection.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        r.name as role_name
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      ORDER BY u.name
    `);

    users.forEach(user => {
      console.log(`   ✅ ${user.name} (${user.email}) - ${user.role_name}`);
    });
    console.log('');

    console.log('🎉 PERMISSION GRANTED TO ALL USERS!\n');
    console.log('⚠️  CRITICAL: You must log out and log back in!\n');
    console.log('Steps:');
    console.log('1. Log out of the application');
    console.log('2. Log back in');
    console.log('3. Go to Manufacturing > Production Wizard');
    console.log('4. You should now be able to submit orders!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

grantToAll();