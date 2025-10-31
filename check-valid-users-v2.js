const { sequelize } = require('./server/config/database');

async function checkUsers() {
  try {
    const [users] = await sequelize.query(`
      SELECT id, name, email, department FROM users LIMIT 10
    `);
    
    console.log('Available Users:\n');
    console.table(users);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUsers();