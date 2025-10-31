const { User } = require('./server/config/database');

async function checkUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'department', 'is_active']
    });
    
    console.log('Available Users:\n');
    console.table(users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      department: u.department,
      active: u.is_active
    })));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUsers();