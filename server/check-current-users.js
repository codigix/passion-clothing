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

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Get all users
    const [users] = await sequelize.query('SELECT id, employee_id, name, email, department, status, created_at FROM users ORDER BY created_at DESC');
    
    console.log(`📊 Total Users Found: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ No users found! Database appears empty.');
      console.log('Run the reset script: node server/reset-database-fresh.js');
    } else {
      console.log('👥 Current Users in Database:');
      console.log('=====================================');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Employee ID: ${user.employee_id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Department: ${user.department}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('---');
      });
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();