const bcrypt = require('./server/node_modules/bcrypt');
const { User, Role } = require('./server/config/database');

async function createInventoryUser() {
  try {
    // Find or create inventory role
    const [role] = await Role.findOrCreate({
      where: { name: 'inventory_manager' },
      defaults: {
        name: 'inventory_manager',
        description: 'Inventory Management - Can manage stock, GRN, and inventory operations'
      }
    });

    // Create inventory user
    const hashedPassword = await bcrypt.hash('inventory123', 10);
    
    const user = await User.create({
      name: 'Inventory Manager',
      email: 'inventory@pashion.com',
      password: hashedPassword,
      department: 'inventory',
      status: 'active'
    });

    // Assign role to user
    await user.setRoles([role.id]);

    console.log('✅ Inventory user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email: inventory@pashion.com');
    console.log('   Password: inventory123');
    console.log('   Department: inventory');
    console.log('\n✅ User can now receive GRN requests!');
    
    process.exit(0);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('ℹ️  User already exists: inventory@pashion.com');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

createInventoryUser();