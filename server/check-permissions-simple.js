const { sequelize, Permission, User } = require('./config/database');

async function checkPermissions() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get all permissions
    const allPermissions = await Permission.findAll({
      order: [['module', 'ASC'], ['resource', 'ASC'], ['action', 'ASC']]
    });

    console.log(`📋 Total permissions in system: ${allPermissions.length}\n`);
    console.log('PERMISSIONS:\n');
    
    allPermissions.forEach(p => {
      console.log(`[${p.id}] ${p.name}`);
      console.log(`    Module: ${p.module}, Action: ${p.action}, Resource: ${p.resource}`);
      console.log(`    Display: ${p.display_name}`);
      console.log(`    Status: ${p.status}\n`);
    });

    // Check user-permission grants
    console.log('👥 USER PERMISSION GRANTS:\n');
    const [userPerms] = await sequelize.query(`
      SELECT 
        up.user_id,
        u.name as user_name,
        u.department,
        up.permission_id,
        p.name as permission_name
      FROM user_permissions up
      JOIN users u ON up.user_id = u.id
      JOIN permissions p ON up.permission_id = p.id
      ORDER BY u.name
    `);

    if (userPerms.length === 0) {
      console.log('   ⚠️  No user-specific permissions granted\n');
    } else {
      userPerms.forEach(up => {
        console.log(`   ${up.user_name} (${up.department}) → ${up.permission_name}`);
      });
      console.log();
    }

    // Check all users
    console.log('👤 ALL USERS:\n');
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'department', 'status']
    });
    users.forEach(u => {
      console.log(`   [${u.id}] ${u.name} - ${u.department} (${u.status})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkPermissions();