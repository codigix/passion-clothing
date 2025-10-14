/**
 * Quick Permission Grant Script
 * Grants "Create Production Order" permission to all manufacturing roles
 */

require('dotenv').config();
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
    console.log('🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected!\n');

    // Check if permission exists
    const [permissions] = await sequelize.query(`
      SELECT id, name FROM permissions 
      WHERE name = 'manufacturing.create.production_order'
    `);

    if (permissions.length === 0) {
      console.log('❌ Permission not found! Creating it...');
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
      console.log(`✅ Permission found (ID: ${permissions[0].id})\n`);
    }

    // Get all manufacturing roles
    const [roles] = await sequelize.query(`
      SELECT id, name, level FROM roles
      WHERE department = 'manufacturing' OR name LIKE '%Manufacturing%'
      ORDER BY level DESC
    `);

    console.log(`📋 Found ${roles.length} manufacturing roles\n`);

    // Grant permission to each role
    for (const role of roles) {
      await sequelize.query(`
        INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT 
          ${role.id},
          p.id,
          NOW(),
          NOW()
        FROM permissions p
        WHERE p.name = 'manufacturing.create.production_order'
      `);
      console.log(`✅ Granted to: ${role.name}`);
    }

    console.log('\n🎉 SUCCESS! Permission granted to all manufacturing roles!\n');
    console.log('⚠️  IMPORTANT: LOG OUT and LOG BACK IN to activate the permission!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

grantPermission();