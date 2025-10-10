/**
 * Complete Database Reset Script
 * This will DELETE ALL DATA and create a fresh database with basic setup
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { sequelize, Role, Permission, User } = require('./config/database');

async function completeReset() {
  let connection;
  try {
    console.log('🔥 ========================================');
    console.log('🔥 COMPLETE DATABASE RESET');
    console.log('🔥 ========================================\n');

    // Connect to MySQL without selecting a database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'passion_erp';

    // Drop database if exists
    console.log(`\n🗑️  Dropping database '${dbName}' if it exists...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log('✅ Database dropped successfully');

    // Create fresh database
    console.log(`\n🆕 Creating fresh database '${dbName}'...`);
    await connection.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database created successfully');

    await connection.end();

    // Now use Sequelize to create all tables
    console.log('\n📊 Creating all tables with Sequelize...');
    await sequelize.sync({ force: false });
    console.log('✅ All tables created successfully');

    // Seed basic data
    console.log('\n🌱 Seeding basic roles and permissions...');
    await seedBasicData();

    console.log('\n🎉 ========================================');
    console.log('🎉 DATABASE RESET COMPLETE!');
    console.log('🎉 ========================================\n');
    console.log('📝 Next Steps:');
    console.log('   1. Register your first user at http://localhost:3000/register');
    console.log('   2. Or use the admin credentials below:\n');
    console.log('   📧 Email: admin@pashion.com');
    console.log('   🔑 Password: Admin@123\n');
    console.log('✨ Your system is ready for fresh entries!\n');

  } catch (error) {
    console.error('\n❌ ERROR during database reset:', error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
    await sequelize.close();
  }
}

async function seedBasicData() {
  try {
    // Create default roles
    const departments = [
      'sales', 'procurement', 'manufacturing', 'outsourcing',
      'inventory', 'shipment', 'store', 'finance', 'admin', 'samples'
    ];

    console.log('   → Creating department roles...');
    const roles = [];

    // Create super admin role first
    const [superAdminRole] = await Role.findOrCreate({
      where: { name: 'super_admin' },
      defaults: {
        display_name: 'Super Administrator',
        description: 'Full system access',
        department: 'admin',
        level: 5,
        status: 'active'
      }
    });
    roles.push(superAdminRole);

    // Create roles for each department
    for (const dept of departments) {
      const nameBase = dept.charAt(0).toUpperCase() + dept.slice(1);

      const [userRole] = await Role.findOrCreate({
        where: { name: `${dept}_user` },
        defaults: {
          display_name: `${nameBase} User`,
          description: `Basic user role for ${dept} department`,
          department: dept,
          level: 1,
          status: 'active'
        }
      });

      const [managerRole] = await Role.findOrCreate({
        where: { name: `${dept}_manager` },
        defaults: {
          display_name: `${nameBase} Manager`,
          description: `Manager role for ${dept} department`,
          department: dept,
          level: 3,
          status: 'active'
        }
      });

      roles.push(userRole, managerRole);
    }

    console.log(`   ✅ Created ${roles.length} roles`);

    // Create basic permissions
    console.log('   → Creating permissions...');
    const permissionDefinitions = [
      // User management
      { name: 'users.create.user', display_name: 'Create User', module: 'users', action: 'create', resource: 'user' },
      { name: 'users.read.user', display_name: 'Read User', module: 'users', action: 'read', resource: 'user' },
      { name: 'users.update.user', display_name: 'Update User', module: 'users', action: 'update', resource: 'user' },
      { name: 'users.delete.user', display_name: 'Delete User', module: 'users', action: 'delete', resource: 'user' },
      
      // Sales
      { name: 'sales.create.order', display_name: 'Create Sales Order', module: 'sales', action: 'create', resource: 'order' },
      { name: 'sales.read.order', display_name: 'Read Sales Order', module: 'sales', action: 'read', resource: 'order' },
      { name: 'sales.update.order', display_name: 'Update Sales Order', module: 'sales', action: 'update', resource: 'order' },
      { name: 'sales.delete.order', display_name: 'Delete Sales Order', module: 'sales', action: 'delete', resource: 'order' },
      { name: 'sales.approve.order', display_name: 'Approve Sales Order', module: 'sales', action: 'approve', resource: 'order' },
      
      // Procurement
      { name: 'procurement.create.purchase_order', display_name: 'Create Purchase Order', module: 'procurement', action: 'create', resource: 'purchase_order' },
      { name: 'procurement.read.purchase_order', display_name: 'Read Purchase Order', module: 'procurement', action: 'read', resource: 'purchase_order' },
      { name: 'procurement.update.purchase_order', display_name: 'Update Purchase Order', module: 'procurement', action: 'update', resource: 'purchase_order' },
      { name: 'procurement.delete.purchase_order', display_name: 'Delete Purchase Order', module: 'procurement', action: 'delete', resource: 'purchase_order' },
      { name: 'procurement.approve.purchase_order', display_name: 'Approve Purchase Order', module: 'procurement', action: 'approve', resource: 'purchase_order' },
      
      // Manufacturing
      { name: 'manufacturing.create.production_order', display_name: 'Create Production Order', module: 'manufacturing', action: 'create', resource: 'production_order' },
      { name: 'manufacturing.read.production_order', display_name: 'Read Production Order', module: 'manufacturing', action: 'read', resource: 'production_order' },
      { name: 'manufacturing.update.production_order', display_name: 'Update Production Order', module: 'manufacturing', action: 'update', resource: 'production_order' },
      { name: 'manufacturing.delete.production_order', display_name: 'Delete Production Order', module: 'manufacturing', action: 'delete', resource: 'production_order' },
      
      // Inventory
      { name: 'inventory.create.item', display_name: 'Create Inventory Item', module: 'inventory', action: 'create', resource: 'item' },
      { name: 'inventory.read.item', display_name: 'Read Inventory Item', module: 'inventory', action: 'read', resource: 'item' },
      { name: 'inventory.update.item', display_name: 'Update Inventory Item', module: 'inventory', action: 'update', resource: 'item' },
      { name: 'inventory.delete.item', display_name: 'Delete Inventory Item', module: 'inventory', action: 'delete', resource: 'item' },
      
      // Products
      { name: 'inventory.create.product', display_name: 'Create Product', module: 'inventory', action: 'create', resource: 'product' },
      { name: 'inventory.read.product', display_name: 'Read Product', module: 'inventory', action: 'read', resource: 'product' },
      { name: 'inventory.update.product', display_name: 'Update Product', module: 'inventory', action: 'update', resource: 'product' },
      { name: 'inventory.delete.product', display_name: 'Delete Product', module: 'inventory', action: 'delete', resource: 'product' },
      
      // Attendance
      { name: 'attendance.create.record', display_name: 'Create Attendance Record', module: 'attendance', action: 'create', resource: 'record' },
      { name: 'attendance.read.record', display_name: 'Read Attendance Record', module: 'attendance', action: 'read', resource: 'record' },
      { name: 'attendance.update.record', display_name: 'Update Attendance Record', module: 'attendance', action: 'update', resource: 'record' },
      
      // Reports
      { name: 'reports.read.all', display_name: 'Read Reports', module: 'reports', action: 'read', resource: 'all' },
      { name: 'reports.export.all', display_name: 'Export Reports', module: 'reports', action: 'export', resource: 'all' }
    ];

    const permissions = [];
    for (const definition of permissionDefinitions) {
      const [permission] = await Permission.findOrCreate({
        where: { name: definition.name },
        defaults: definition
      });
      permissions.push(permission);
    }

    console.log(`   ✅ Created ${permissions.length} permissions`);

    // Assign all permissions to super admin
    console.log('   → Assigning permissions to super admin...');
    await superAdminRole.setPermissions(permissions);
    console.log('   ✅ Permissions assigned');

    // Create default admin user
    console.log('   → Creating default admin user...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@pashion.com' },
      defaults: {
        employee_id: 'EMP001',
        name: 'System Administrator',
        email: 'admin@pashion.com',
        password: hashedPassword,
        phone: '+91-9876543210',
        department: 'admin',
        status: 'active'
      }
    });

    // Assign super admin role to admin user
    await adminUser.setRoles([superAdminRole]);
    console.log('   ✅ Admin user created');

    console.log('✅ Basic data seeded successfully');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  completeReset();
}

module.exports = completeReset;