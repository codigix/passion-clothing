// Diagnostic script to check user department and role
const { sequelize, User, Role } = require('./server/config/database');

async function checkUser() {
  try {
    // Get first user with manufacturing or inventory role
    const user = await User.findOne({
      include: [{ model: Role, as: 'roles' }]
    });

    if (!user) {
      console.log('❌ No users found in database');
      process.exit(1);
    }

    console.log('\n📋 User Information:');
    console.log('ID:', user.id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Department:', user.department);
    console.log('Roles:', user.roles?.map(r => r.name).join(', ') || 'None');
    
    if (!user.department) {
      console.log('\n⚠️  WARNING: User has NO department assigned!');
      console.log('Required departments for /products endpoint: inventory, procurement, manufacturing, admin');
    } else if (!['inventory', 'procurement', 'manufacturing', 'admin'].includes(user.department)) {
      console.log('\n❌ ERROR: User department "' + user.department + '" not allowed!');
      console.log('Must be one of: inventory, procurement, manufacturing, admin');
    } else {
      console.log('\n✅ User department is correct: ' + user.department);
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkUser();