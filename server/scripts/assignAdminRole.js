const { sequelize, User, Role } = require('../config/database');

async function assignAdminRole() {
  try {
    console.log('🔧 Assigning Super Admin role to default admin user...\n');

    // Find the admin user
    const adminUser = await User.findOne({
      where: { email: 'admin@pashion.com' }
    });

    if (!adminUser) {
      console.error('❌ Admin user not found!');
      process.exit(1);
    }

    // Find the super_admin role
    const superAdminRole = await Role.findOne({
      where: { name: 'super_admin' }
    });

    if (!superAdminRole) {
      console.error('❌ Super Admin role not found!');
      process.exit(1);
    }

    // Assign the role to the user
    await adminUser.addRole(superAdminRole);
    
    console.log('✅ Super Admin role assigned successfully!');
    console.log('\n📋 Admin User Details:');
    console.log(`   Email: admin@pashion.com`);
    console.log(`   Password: admin123`);
    console.log(`   Role: Super Administrator`);
    console.log(`   Department: admin`);
    console.log('\n🎉 You can now login with these credentials!\n');

  } catch (error) {
    console.error('❌ Error assigning admin role:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  assignAdminRole();
}

module.exports = assignAdminRole;