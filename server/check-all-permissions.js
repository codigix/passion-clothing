const { sequelize, Permission, User } = require('./config/database');

async function checkPermissions() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get all permissions
    const allPermissions = await Permission.findAll({
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });

    console.log(`📋 Total permissions in system: ${allPermissions.length}\n`);

    // Group by resource
    const byResource = {};
    allPermissions.forEach(p => {
      if (!byResource[p.resource]) {
        byResource[p.resource] = [];
      }
      byResource[p.resource].push({
        id: p.id,
        action: p.action,
        permission: `${p.resource}.${p.action}.${p.sub_resource || 'general'}`
      });
    });

    console.log('📦 PERMISSIONS BY RESOURCE:\n');
    Object.keys(byResource).sort().forEach(resource => {
      console.log(`\n🔹 ${resource.toUpperCase()}:`);
      byResource[resource].forEach(p => {
        console.log(`   [${p.id}] ${p.action} - ${p.permission}`);
      });
    });

    // Check manufacturing permissions specifically
    console.log('\n\n🏭 MANUFACTURING PERMISSIONS:');
    const mfgPermissions = allPermissions.filter(p => p.resource === 'manufacturing');
    mfgPermissions.forEach(p => {
      console.log(`   [${p.id}] ${p.resource}.${p.action}.${p.sub_resource || 'general'}`);
    });

    // Check current user-permission grants
    console.log('\n\n👥 USER PERMISSION GRANTS:');
    const [userPerms] = await sequelize.query(`
      SELECT 
        up.user_id,
        u.name as user_name,
        up.permission_id,
        p.resource,
        p.action,
        p.sub_resource
      FROM user_permissions up
      JOIN users u ON up.user_id = u.id
      JOIN permissions p ON up.permission_id = p.id
      ORDER BY u.name, p.resource
    `);

    if (userPerms.length === 0) {
      console.log('   ⚠️  No user-specific permissions granted');
    } else {
      userPerms.forEach(up => {
        const perm = `${up.resource}.${up.action}.${up.sub_resource || 'general'}`;
        console.log(`   ${up.user_name} [ID:${up.user_id}] → [${up.permission_id}] ${perm}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPermissions();