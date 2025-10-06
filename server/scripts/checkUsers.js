const { sequelize, User } = require('../config/database');

const checkUsers = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.');

    console.log('Checking users...');

    // Try to find all users
    const users = await User.findAll({
      attributes: ['id', 'username', 'name', 'department', 'status']
    });

    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- ${user.username}: ${user.name} (${user.department}) - ${user.status}`);
    });

  } catch (error) {
    console.error('Error checking users:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  checkUsers().then(() => {
    if (!process.exitCode) {
      console.log('Check complete.');
    }
  });
}

module.exports = checkUsers;