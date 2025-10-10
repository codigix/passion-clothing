const { User } = require('./server/config/database');

async function checkUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'department', 'status'],
      order: [['department', 'ASC'], ['name', 'ASC']]
    });

    console.log('\n📊 All Users in Database:\n');
    
    const byDept = {};
    users.forEach(user => {
      const dept = user.department || 'No Department';
      if (!byDept[dept]) byDept[dept] = [];
      byDept[dept].push(user);
    });

    Object.entries(byDept).forEach(([dept, users]) => {
      console.log(`\n📁 ${dept.toUpperCase()}:`);
      users.forEach(u => {
        console.log(`   ${u.status === 'active' ? '✅' : '❌'} ${u.name} (${u.email}) - ID: ${u.id}`);
      });
    });

    console.log('\n\n💡 To assign a user to inventory department, run:');
    console.log('   UPDATE users SET department = "inventory" WHERE id = <user_id>;');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();