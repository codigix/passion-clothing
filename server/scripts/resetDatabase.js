const { sequelize } = require('../config/database');

const resetDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.');

    console.log('Dropping all tables...');
    await sequelize.drop();
    console.log('All tables dropped.');

    console.log('Recreating tables...');
    await sequelize.sync();
    console.log('Tables recreated successfully.');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  resetDatabase().then(() => {
    if (!process.exitCode) {
      console.log('Database reset complete.');
    }
  });
}

module.exports = resetDatabase;