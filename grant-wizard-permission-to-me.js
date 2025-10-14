/**
 * Grant Production Wizard Permission Script
 * 
 * This script grants the "Create Production Order" permission to your user account.
 * Run this if you're seeing "You do not have permission to submit production orders"
 * 
 * Usage:
 *   cd server
 *   node ../grant-wizard-permission-to-me.js
 * 
 * IMPORTANT: You must log out and log back in after running this script!
 */

require('dotenv').config({ path: './.env' });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'passion_erp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

async function grantPermission() {
  try {
    console.log('🔍 Checking database connection...');
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Step 1: Check if permission exists
    console.log('📋 Step 1: Checking if permission exists...');
    const [permissions] = await sequelize.query(`
      SELECT id, name, display_name 
      FROM permissions 
      WHERE name = 'manufacturing.create.production_order'
    `);

    if (permissions.length === 0) {
      console.log('❌ Permission does not exist! Creating it...');
      await sequelize.query(`
        INSERT INTO permissions (name, display_name, module, action, resource, created_at, updated_at)
        VALUES (
          'manufacturing.create.production_order',
          'Create Production Order',
          'manufacturing',
          'create',
          'production_order',
          NOW(),
          NOW()
        )
      `);
      console.log('✅ Permission created!\n');
    } else {
      console.log(`✅ Permission found: ${permissions[0].display_name} (ID: ${permissions[0].id})\n`);
    }

    // Step 2: Get all manufacturing roles
    console.log('📋 Step 2: Finding manufacturing roles...');
    const [roles] = await sequelize.query(`
      SELECT id, name, level, department
      FROM roles
      WHERE department = 'manufacturing' OR name LIKE '%Manufacturing%'
      ORDER BY level DESC
    `);

    if (roles.length === 0) {
      console.log('❌ No manufacturing roles found!\n');
      console.log('Please create manufacturing roles first or contact your administrator.\n');
      process.exit(1);
    }

    console.log('✅ Found manufacturing roles:');
    roles.forEach(role => {
      console.log(`   - ${role.name} (Level ${role.level})`);
    });
    console.log('');

    // Step 3: Grant permission to all manufacturing roles
    console.log('📋 Step 3: Granting permission to all manufacturing roles...');
    
    for (const role of roles) {
      const [existing] = await sequelize.query(`
        SELECT rp.id 
        FROM role_permissions rp
        INNER JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ${role.id}
          AND p.name = 'manufacturing.create.production_order'
      `);

      if (existing.length > 0) {
        console.log(`   ⏭️  ${role.name} already has permission`);
      } else {
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          SELECT 
            ${role.id},
            p.id,
            NOW(),
            NOW()
          FROM permissions p
          WHERE p.name = 'manufacturing.create.production_order'
        `);
        console.log(`   ✅ Granted to ${role.name}`);
      }
    }
    console.log('');

    // Step 4: Show users who now have access
    console.log('📋 Step 4: Users with access to Production Wizard:');
    const [users] = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        r.name as role_name,
        r.level
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      INNER JOIN role_permissions rp ON r.id = rp.role_id
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE p.name = 'manufacturing.create.production_order'
         OR r.level >= 5
      ORDER BY r.level DESC, u.name
    `);

    if (users.length === 0) {
      console.log('   ⚠️  No users found with this permission');
    } else {
      users.forEach(user => {
        const accessType = user.level >= 5 ? '(Admin - All Permissions)' : '(via Role)';
        console.log(`   ✅ ${user.name} (${user.email}) - ${user.role_name} ${accessType}`);
      });
    }
    console.log('');

    // Final instructions
    console.log('🎉 PERMISSION GRANTED SUCCESSFULLY!\n');
    console.log('⚠️  IMPORTANT: You must log out and log back in for changes to take effect!\n');
    console.log('Steps:');
    console.log('1. Click on your profile icon in the top-right corner');
    console.log('2. Select "Logout"');
    console.log('3. Log back in with your credentials');
    console.log('4. Navigate to Manufacturing > Production Wizard');
    console.log('5. You should now be able to submit production orders!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

grantPermission();