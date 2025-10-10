const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'passion_erp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function deleteAllUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check current users
    const [usersBefore] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Users before deletion: ${usersBefore[0].count}`);

    // Delete all users
    await sequelize.query('DELETE FROM users');
    console.log('🗑️  Deleting all users...\n');

    // Also delete from user_roles junction table to clean up
    await sequelize.query('DELETE FROM user_roles');
    console.log('🗑️  Cleaning up user_roles...\n');

    // Verify deletion
    const [usersAfter] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users after deletion: ${usersAfter[0].count}`);
    
    if (usersAfter[0].count === 0) {
      console.log('\n🎉 SUCCESS! All users deleted!');
      console.log('\n📝 You can now register users with any Employee ID starting from EMP001');
    } else {
      console.log('\n⚠️  Warning: Some users might still exist');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteAllUsers();