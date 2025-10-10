const bcrypt = require('bcryptjs');
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

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create admin user
    await sequelize.query(`
      INSERT INTO users (employee_id, name, email, password, department, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: ['EMP001', 'System Administrator', 'admin@pashion.com', hashedPassword, 'admin', 'active']
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('📧 Email: admin@pashion.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Employee ID: EMP001');
    console.log('🏢 Department: admin\n');
    console.log('🚀 You can now login!');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();