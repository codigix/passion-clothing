const { sequelize, User, Role } = require('../config/database');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    console.log('Creating admin user...');
    await sequelize.authenticate();
    console.log('Database connected.');

    const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
    
    if (!superAdminRole) {
      const role = await Role.create({
        name: 'super_admin',
        display_name: 'Super Administrator',
        description: 'Full system access',
        department: 'admin',
        level: 5,
        status: 'active'
      });
      console.log('Created super_admin role');
    } else {
      console.log('super_admin role already exists');
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@pashion.com' },
      defaults: {
        employee_id: 'ADMIN001',
        name: 'Administrator',
        email: 'admin@pashion.com',
        password: hashedPassword,
        department: 'admin',
        status: 'active'
      }
    });

    if (created) {
      console.log('Admin user created successfully');
      console.log('Email: admin@pashion.com');
      console.log('Password: Admin@123');
    } else {
      console.log('Admin user already exists');
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exitCode = 1;
  }
};

createAdminUser();
