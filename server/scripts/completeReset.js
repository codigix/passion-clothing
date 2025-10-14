/**
 * Complete Database Reset and Seed Script
 * This script will:
 * 1. Truncate all tables
 * 2. Seed roles and permissions
 * 3. Seed sample data (users, customers, vendors)
 */

const { sequelize, User, Role, Permission, Customer, Vendor, Product } = require('../config/database');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const completeReset = async () => {
  let connection;

  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     COMPLETE DATABASE RESET AND SEED SCRIPT            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Step 1: Truncate all tables
    console.log('📍 STEP 1: Truncating all tables...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'passion_erp'
    });

    console.log('✅ Connected to MySQL database\n');

    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Foreign key checks disabled\n');

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log(`✅ Found ${tableNames.length} tables\n`);

    // Truncate all tables
    console.log('🗑️  Truncating all tables...');
    for (const tableName of tableNames) {
      try {
        await connection.query(`TRUNCATE TABLE \`${tableName}\``);
        console.log(`   ✓ Truncated: ${tableName}`);
      } catch (error) {
        console.log(`   ⚠️  Could not truncate ${tableName}: ${error.message}`);
      }
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.end();
    console.log('\n✅ All tables truncated\n');

    // Step 2: Seed roles and permissions
    console.log('📍 STEP 2: Seeding roles and permissions...\n');
    await seedRolesAndPermissions();

    // Step 3: Create users FIRST (needed for foreign keys)
    console.log('\n📍 STEP 3: Creating default users...\n');
    await createDefaultUsers();

    // Step 4: Seed customers and vendors (now users exist)
    console.log('\n📍 STEP 4: Seeding customers and vendors...\n');
    await seedCustomersAndVendors();

    // Step 5: Create sample products
    console.log('\n📍 STEP 5: Creating sample products...\n');
    await createSampleProducts();

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║          ✅ DATABASE RESET COMPLETED!                  ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📋 DEFAULT USERS CREATED:\n');
    console.log('┌─────────────────┬──────────────────────────┬──────────────────────┬──────────┐');
    console.log('│ Department      │ Email                    │ Password             │ Role     │');
    console.log('├─────────────────┼──────────────────────────┼──────────────────────┼──────────┤');
    console.log('│ Admin           │ admin@pashion.com        │ admin123             │ Super    │');
    console.log('│ Sales           │ sales@pashion.com        │ sales123             │ Manager  │');
    console.log('│ Procurement     │ procurement@pashion.com  │ procurement123       │ Manager  │');
    console.log('│ Manufacturing   │ manufacturing@pashion.com│ manufacturing123     │ Manager  │');
    console.log('│ Inventory       │ inventory@pashion.com    │ inventory123         │ Manager  │');
    console.log('│ Outsourcing     │ outsourcing@pashion.com  │ outsourcing123       │ Manager  │');
    console.log('│ Shipment        │ shipment@pashion.com     │ shipment123          │ Manager  │');
    console.log('│ Store           │ store@pashion.com        │ store123             │ Manager  │');
    console.log('│ Finance         │ finance@pashion.com      │ finance123           │ Manager  │');
    console.log('│ Samples         │ samples@pashion.com      │ samples123           │ Manager  │');
    console.log('└─────────────────┴──────────────────────────┴──────────────────────┴──────────┘\n');

    console.log('📊 SAMPLE DATA CREATED:');
    console.log('   ✓ 3 Customers');
    console.log('   ✓ 3 Vendors');
    console.log('   ✓ 5 Products');
    console.log('   ✓ 21 Roles (10 departments × 2 + super_admin)');
    console.log('   ✓ All permissions assigned\n');

    console.log('🚀 YOU CAN NOW:');
    console.log('   1. Start your server: npm run dev');
    console.log('   2. Login with any user above');
    console.log('   3. Start using the system!\n');

  } catch (error) {
    console.error('\n❌ Complete reset failed:', error);
    throw error;
  } finally {
    if (connection && connection.end) {
      try { await connection.end(); } catch (e) {}
    }
    if (sequelize) {
      try { await sequelize.close(); } catch (e) {}
    }
  }
};

async function seedRolesAndPermissions() {
  // Create default roles for each department
  const departments = [
    'sales', 'procurement', 'manufacturing', 'outsourcing',
    'inventory', 'shipment', 'store', 'finance', 'admin', 'samples'
  ];

  const roles = [];
  
  for (const dept of departments) {
    const nameBase = dept.charAt(0).toUpperCase() + dept.slice(1);

    const userRole = await Role.findOrCreate({
      where: { name: `${dept}_user` },
      defaults: {
        display_name: `${nameBase} User`,
        description: `Basic user role for ${dept} department`,
        department: dept,
        level: 1,
        status: 'active'
      }
    });

    const managerRole = await Role.findOrCreate({
      where: { name: `${dept}_manager` },
      defaults: {
        display_name: `${nameBase} Manager`,
        description: `Manager role for ${dept} department`,
        department: dept,
        level: 3,
        status: 'active'
      }
    });

    roles.push(userRole[0], managerRole[0]);
  }

  // Super admin role
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

  console.log(`✅ Created ${roles.length} roles`);

  // Create permissions
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

  console.log(`✅ Created ${permissions.length} permissions`);

  // Assign all permissions to super admin
  const superAdmin = roles.find(r => r.name === 'super_admin');
  if (superAdmin) {
    await superAdmin.setPermissions(permissions);
    console.log('✅ Assigned all permissions to super admin');
  }

  // Assign permissions to manager roles
  const permissionByName = permissions.reduce((acc, perm) => {
    acc[perm.name] = perm;
    return acc;
  }, {});

  const managerRoles = roles.filter(r => r.name.includes('_manager'));
  const basicPermissions = permissions.filter(p => 
    p.action === 'read' || p.action === 'create' || p.action === 'update'
  );

  const additionalManagerPermissions = {
    sales: ['sales.approve.order'],
    procurement: ['sales.create.order', 'sales.read.order', 'procurement.approve.purchase_order']
  };

  for (const role of managerRoles) {
    const relevantPermissions = basicPermissions.filter(p => 
      p.module === role.department || p.module === 'attendance' || p.module === 'reports'
    );

    const extraPermissionNames = additionalManagerPermissions[role.department] || [];
    const extraPermissions = extraPermissionNames
      .map(name => permissionByName[name])
      .filter(Boolean);

    const uniquePermissions = new Map([...relevantPermissions, ...extraPermissions].map(p => [p.id, p]));
    await role.addPermissions([...uniquePermissions.values()]);
  }

  console.log('✅ Assigned permissions to manager roles');

  // Assign read permissions to user roles
  const userRoles = roles.filter(r => r.name.includes('_user'));
  const readPermissions = permissions.filter(p => p.action === 'read');

  for (const role of userRoles) {
    const relevantPermissions = readPermissions.filter(p => 
      p.module === role.department || p.module === 'attendance'
    );
    await role.addPermissions(relevantPermissions);
  }

  console.log('✅ Assigned read permissions to user roles');
}

async function seedCustomersAndVendors() {
  // Create sample customers
  const customers = [
    {
      customer_code: 'CUST001',
      name: 'ABC Textiles Pvt Ltd',
      email: 'contact@abctextiles.com',
      phone: '+91-9876543210',
      customer_type: 'business',
      billing_address: '123 Industrial Area, Mumbai, Maharashtra 400001',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      gst_number: '22AAAAA0000A1Z5',
      created_by: 1
    },
    {
      customer_code: 'CUST002',
      name: 'XYZ Garments Ltd',
      email: 'orders@xyzgarments.com',
      phone: '+91-9876543211',
      customer_type: 'business',
      billing_address: '456 Business District, Delhi, Delhi 110001',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      gst_number: '07BBBBB0000B1Z6',
      created_by: 1
    },
    {
      customer_code: 'CUST003',
      name: 'Fashion Hub Retail',
      email: 'info@fashionhub.com',
      phone: '+91-9876543212',
      customer_type: 'retailer',
      billing_address: '789 Shopping Plaza, Bangalore, Karnataka 560001',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      gst_number: '29CCCCC0000C1Z7',
      created_by: 1
    }
  ];

  for (const customerData of customers) {
    await Customer.findOrCreate({
      where: { customer_code: customerData.customer_code },
      defaults: customerData
    });
  }
  console.log('✅ Created 3 sample customers');

  // Create sample vendors
  const vendors = [
    {
      vendor_code: 'VEND001',
      name: 'Premium Fabrics India',
      company_name: 'Premium Fabrics Manufacturing Pvt Ltd',
      contact_person: 'Rajesh Kumar',
      email: 'rajesh@premiumfabrics.com',
      phone: '+91-9876543213',
      mobile: '+91-9876543213',
      address: 'Plot 10, Textile Park, Surat, Gujarat 395001',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395001',
      gst_number: '24DDDDD0000D1Z8',
      vendor_type: 'material_supplier',
      category: 'fabric',
      status: 'active',
      created_by: 1
    },
    {
      vendor_code: 'VEND002',
      name: 'Quality Threads Ltd',
      company_name: 'Quality Threads Manufacturing Ltd',
      contact_person: 'Priya Sharma',
      email: 'priya@qualitythreads.com',
      phone: '+91-9876543214',
      mobile: '+91-9876543214',
      address: 'Industrial Estate, Ludhiana, Punjab 141001',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      gst_number: '03EEEEE0000E1Z9',
      vendor_type: 'material_supplier',
      category: 'accessories',
      status: 'active',
      created_by: 1
    },
    {
      vendor_code: 'VEND003',
      name: 'Metro Accessories Pvt Ltd',
      company_name: 'Metro Accessories Pvt Ltd',
      contact_person: 'Amit Singh',
      email: 'amit@metroaccessories.com',
      phone: '+91-9876543215',
      mobile: '+91-9876543215',
      address: 'Sector 18, Noida, Uttar Pradesh 201301',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
      gst_number: '09FFFFF0000F1Z0',
      vendor_type: 'material_supplier',
      category: 'accessories',
      status: 'active',
      created_by: 1
    }
  ];

  for (const vendorData of vendors) {
    await Vendor.findOrCreate({
      where: { vendor_code: vendorData.vendor_code },
      defaults: vendorData
    });
  }
  console.log('✅ Created 3 sample vendors');
}

async function createDefaultUsers() {
  const departments = [
    { dept: 'admin', name: 'System Admin', empId: 'ADMIN001', role: 'super_admin' },
    { dept: 'sales', name: 'Sales Manager', empId: 'SALES001', role: 'sales_manager' },
    { dept: 'procurement', name: 'Procurement Manager', empId: 'PROC001', role: 'procurement_manager' },
    { dept: 'manufacturing', name: 'Manufacturing Manager', empId: 'MFG001', role: 'manufacturing_manager' },
    { dept: 'inventory', name: 'Inventory Manager', empId: 'INV001', role: 'inventory_manager' },
    { dept: 'outsourcing', name: 'Outsourcing Manager', empId: 'OUT001', role: 'outsourcing_manager' },
    { dept: 'shipment', name: 'Shipment Manager', empId: 'SHIP001', role: 'shipment_manager' },
    { dept: 'store', name: 'Store Manager', empId: 'STORE001', role: 'store_manager' },
    { dept: 'finance', name: 'Finance Manager', empId: 'FIN001', role: 'finance_manager' },
    { dept: 'samples', name: 'Samples Manager', empId: 'SAMP001', role: 'samples_manager' }
  ];

  for (const { dept, name, empId, role } of departments) {
    const hashedPassword = await bcrypt.hash(`${dept}123`, 10);
    
    const roleRecord = await Role.findOne({ where: { name: role } });

    if (roleRecord) {
      const [user, created] = await User.findOrCreate({
        where: { email: `${dept}@pashion.com` },
        defaults: {
          employee_id: empId,
          name: name,
          email: `${dept}@pashion.com`,
          password: hashedPassword,
          phone: `+91-98765432${10 + departments.indexOf(departments.find(d => d.dept === dept))}`,
          department: dept,
          designation: name,
          status: 'active',
          created_by: 1
        }
      });

      await user.addRole(roleRecord);
      
      if (created) {
        console.log(`   ✓ Created ${dept} user: ${user.email}`);
      }
    }
  }
}

async function createSampleProducts() {
  const products = [
    {
      name: 'Cotton T-Shirt',
      sku: 'PROD-TS-001',
      description: 'Premium quality cotton t-shirt',
      category: 'garment',
      unit: 'piece',
      price: 299.00,
      status: 'active',
      created_by: 1
    },
    {
      name: 'Denim Jeans',
      sku: 'PROD-DJ-001',
      description: 'Classic fit denim jeans',
      category: 'garment',
      unit: 'piece',
      price: 1299.00,
      status: 'active',
      created_by: 1
    },
    {
      name: 'Cotton Fabric',
      sku: 'PROD-CF-001',
      description: 'Pure cotton fabric - 60" width',
      category: 'material',
      unit: 'meter',
      price: 150.00,
      status: 'active',
      created_by: 1
    },
    {
      name: 'Polyester Thread',
      sku: 'PROD-PT-001',
      description: 'Industrial grade polyester thread',
      category: 'material',
      unit: 'cone',
      price: 45.00,
      status: 'active',
      created_by: 1
    },
    {
      name: 'Metal Buttons',
      sku: 'PROD-MB-001',
      description: 'Stainless steel buttons - 15mm',
      category: 'accessory',
      unit: 'gross',
      price: 120.00,
      status: 'active',
      created_by: 1
    }
  ];

  for (const productData of products) {
    const [product, created] = await Product.findOrCreate({
      where: { sku: productData.sku },
      defaults: productData
    });

    if (created) {
      console.log(`   ✓ Created product: ${product.name}`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  completeReset()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = completeReset;