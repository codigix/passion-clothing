/**
 * Comprehensive Database Setup & Validation Script
 * 
 * This script performs a complete end-to-end database setup including:
 * - Database connection validation
 * - All model creation and associations
 * - Foreign key constraint verification
 * - Seed data creation (roles, permissions, users, customers, vendors)
 * - Relationship integrity tests
 * - Complete validation report
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const db = require('../config/database');
const { sequelize, User, Role, Permission, Customer, Vendor, SalesOrder, PurchaseOrder, 
        Product, Inventory, GoodsReceiptNote, BillOfMaterials, ProductionOrder, 
        Challan, Shipment, Notification, Approval, InventoryMovement, MaterialAllocation,
        ProductLifecycle, ProductLifecycleHistory, Sample, Attendance, CourierPartner,
        ShipmentTracking, StoreStock, Invoice, Payment, Rejection, ProductionStage,
        SalesOrderHistory } = require('../config/database');

const bcrypt = require('bcryptjs');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Utility function for colored console output
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  step: (msg) => console.log(`${colors.magenta}→${colors.reset} ${msg}`)
};

// Statistics object
const stats = {
  models: 0,
  associations: 0,
  roles: 0,
  permissions: 0,
  users: 0,
  customers: 0,
  vendors: 0,
  errors: []
};

/**
 * Step 1: Drop and recreate the database
 */
async function resetDatabase() {
  log.section('STEP 1: DATABASE RESET');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root'
  });

  try {
    log.step('Dropping existing database...');
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'passion_erp'}`);
    log.success('Database dropped successfully');

    log.step('Creating fresh database...');
    await connection.query(
      `CREATE DATABASE ${process.env.DB_NAME || 'passion_erp'} 
       CHARACTER SET utf8mb4 
       COLLATE utf8mb4_unicode_ci`
    );
    log.success('Database created successfully');

  } catch (error) {
    log.error(`Database reset failed: ${error.message}`);
    stats.errors.push({ step: 'Database Reset', error: error.message });
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Step 2: Validate database connection
 */
async function validateConnection() {
  log.section('STEP 2: DATABASE CONNECTION VALIDATION');
  
  try {
    await sequelize.authenticate();
    log.success('Connection to MySQL database established successfully');
    
    const [results] = await sequelize.query('SELECT VERSION() as version');
    log.info(`MySQL Version: ${results[0].version}`);
    
    const [dbResults] = await sequelize.query(`SELECT DATABASE() as db_name`);
    log.info(`Connected to database: ${dbResults[0].db_name}`);
    
  } catch (error) {
    log.error(`Connection validation failed: ${error.message}`);
    stats.errors.push({ step: 'Connection Validation', error: error.message });
    throw error;
  }
}

/**
 * Step 3: Create all tables with Sequelize sync
 */
async function createTables() {
  log.section('STEP 3: CREATE DATABASE TABLES');
  
  try {
    log.step('Synchronizing all models...');
    await sequelize.sync({ force: true });
    
    // Count tables created
    const [tables] = await sequelize.query('SHOW TABLES');
    stats.models = tables.length;
    
    log.success(`${stats.models} tables created successfully`);
    
    // List all tables
    log.info('Tables created:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
  } catch (error) {
    log.error(`Table creation failed: ${error.message}`);
    stats.errors.push({ step: 'Table Creation', error: error.message });
    throw error;
  }
}

/**
 * Step 4: Verify foreign key constraints
 */
async function verifyForeignKeys() {
  log.section('STEP 4: FOREIGN KEY CONSTRAINT VERIFICATION');
  
  const criticalForeignKeys = [
    { table: 'users', column: 'created_by', references: 'users(id)' },
    { table: 'sales_orders', column: 'customer_id', references: 'customers(id)' },
    { table: 'sales_orders', column: 'created_by', references: 'users(id)' },
    { table: 'purchase_orders', column: 'vendor_id', references: 'vendors(id)' },
    { table: 'purchase_orders', column: 'linked_sales_order_id', references: 'sales_orders(id)' },
    { table: 'purchase_orders', column: 'created_by', references: 'users(id)' },
    { table: 'goods_receipt_notes', column: 'purchase_order_id', references: 'purchase_orders(id)' },
    { table: 'goods_receipt_notes', column: 'sales_order_id', references: 'sales_orders(id)' },
    { table: 'goods_receipt_notes', column: 'bill_of_materials_id', references: 'bill_of_materials(id)' },
    { table: 'inventory', column: 'product_id', references: 'products(id)' },
    { table: 'inventory', column: 'purchase_order_id', references: 'purchase_orders(id)' },
    { table: 'material_allocations', column: 'inventory_id', references: 'inventory(id)' },
    { table: 'material_allocations', column: 'production_order_id', references: 'production_orders(id)' },
    { table: 'bill_of_materials', column: 'sales_order_id', references: 'sales_orders(id)' }
  ];
  
  try {
    for (const fk of criticalForeignKeys) {
      const [constraints] = await sequelize.query(`
        SELECT 
          TABLE_NAME, 
          COLUMN_NAME, 
          CONSTRAINT_NAME, 
          REFERENCED_TABLE_NAME, 
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'passion_erp'}'
          AND TABLE_NAME = '${fk.table}'
          AND COLUMN_NAME = '${fk.column}'
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      if (constraints.length > 0) {
        log.success(`✓ ${fk.table}.${fk.column} → ${fk.references}`);
        stats.associations++;
      } else {
        log.warning(`⚠ Foreign key not found: ${fk.table}.${fk.column}`);
      }
    }
    
    log.success(`${stats.associations} critical foreign key constraints verified`);
    
  } catch (error) {
    log.error(`Foreign key verification failed: ${error.message}`);
    stats.errors.push({ step: 'Foreign Key Verification', error: error.message });
  }
}

/**
 * Step 5: Seed Roles
 */
async function seedRoles() {
  log.section('STEP 5: SEED ROLES');
  
  const roles = [
    // Sales Department
    { name: 'sales_user', display_name: 'Sales User', department: 'sales', level: 1, description: 'Can create and view sales orders' },
    { name: 'sales_manager', display_name: 'Sales Manager', department: 'sales', level: 3, description: 'Can approve sales orders and manage sales team' },
    
    // Procurement Department
    { name: 'procurement_user', display_name: 'Procurement User', department: 'procurement', level: 1, description: 'Can create purchase orders' },
    { name: 'procurement_manager', display_name: 'Procurement Manager', department: 'procurement', level: 3, description: 'Can approve purchase orders' },
    
    // Manufacturing Department
    { name: 'manufacturing_user', display_name: 'Manufacturing User', department: 'manufacturing', level: 1, description: 'Production floor worker' },
    { name: 'manufacturing_manager', display_name: 'Manufacturing Manager', department: 'manufacturing', level: 3, description: 'Manages production orders' },
    
    // Outsourcing Department
    { name: 'outsourcing_user', display_name: 'Outsourcing User', department: 'outsourcing', level: 1, description: 'Manages outsourcing operations' },
    { name: 'outsourcing_manager', display_name: 'Outsourcing Manager', department: 'outsourcing', level: 3, description: 'Oversees outsourcing vendors' },
    
    // Inventory Department
    { name: 'inventory_user', display_name: 'Inventory User', department: 'inventory', level: 1, description: 'Manages stock levels' },
    { name: 'inventory_manager', display_name: 'Inventory Manager', department: 'inventory', level: 3, description: 'Oversees inventory operations' },
    
    // Shipment Department
    { name: 'shipment_user', display_name: 'Shipment User', department: 'shipment', level: 1, description: 'Creates and tracks shipments' },
    { name: 'shipment_manager', display_name: 'Shipment Manager', department: 'shipment', level: 3, description: 'Manages shipping operations' },
    
    // Store Department
    { name: 'store_user', display_name: 'Store User', department: 'store', level: 1, description: 'Manages store stock' },
    { name: 'store_manager', display_name: 'Store Manager', department: 'store', level: 3, description: 'Oversees store operations' },
    
    // Finance Department
    { name: 'finance_user', display_name: 'Finance User', department: 'finance', level: 1, description: 'Handles invoices and payments' },
    { name: 'finance_manager', display_name: 'Finance Manager', department: 'finance', level: 3, description: 'Manages financial operations' },
    
    // Admin Department
    { name: 'admin_user', display_name: 'Admin User', department: 'admin', level: 2, description: 'System administrator' },
    { name: 'admin_manager', display_name: 'Admin Manager', department: 'admin', level: 4, description: 'Senior administrator' },
    
    // Samples Department
    { name: 'samples_user', display_name: 'Samples User', department: 'samples', level: 1, description: 'Manages sample orders' },
    { name: 'samples_manager', display_name: 'Samples Manager', department: 'samples', level: 3, description: 'Oversees sample operations' },
    
    // Super Admin (highest level)
    { name: 'super_admin', display_name: 'Super Administrator', department: 'admin', level: 5, description: 'Full system access' }
  ];
  
  try {
    for (const roleData of roles) {
      await Role.create(roleData);
      stats.roles++;
    }
    log.success(`${stats.roles} roles created successfully`);
  } catch (error) {
    log.error(`Role seeding failed: ${error.message}`);
    stats.errors.push({ step: 'Seed Roles', error: error.message });
    throw error;
  }
}

/**
 * Step 6: Seed Permissions
 */
async function seedPermissions() {
  log.section('STEP 6: SEED PERMISSIONS');
  
  const permissions = [
    // Sales Permissions
    { name: 'view_sales_orders', display_name: 'View Sales Orders', module: 'sales', action: 'read', resource: 'sales_orders' },
    { name: 'create_sales_orders', display_name: 'Create Sales Orders', module: 'sales', action: 'create', resource: 'sales_orders' },
    { name: 'edit_sales_orders', display_name: 'Edit Sales Orders', module: 'sales', action: 'update', resource: 'sales_orders' },
    { name: 'delete_sales_orders', display_name: 'Delete Sales Orders', module: 'sales', action: 'delete', resource: 'sales_orders' },
    { name: 'approve_sales_orders', display_name: 'Approve Sales Orders', module: 'sales', action: 'approve', resource: 'sales_orders' },
    
    // Procurement Permissions
    { name: 'view_purchase_orders', display_name: 'View Purchase Orders', module: 'procurement', action: 'read', resource: 'purchase_orders' },
    { name: 'create_purchase_orders', display_name: 'Create Purchase Orders', module: 'procurement', action: 'create', resource: 'purchase_orders' },
    { name: 'edit_purchase_orders', display_name: 'Edit Purchase Orders', module: 'procurement', action: 'update', resource: 'purchase_orders' },
    { name: 'delete_purchase_orders', display_name: 'Delete Purchase Orders', module: 'procurement', action: 'delete', resource: 'purchase_orders' },
    { name: 'approve_purchase_orders', display_name: 'Approve Purchase Orders', module: 'procurement', action: 'approve', resource: 'purchase_orders' },
    
    // Inventory Permissions
    { name: 'view_inventory', display_name: 'View Inventory', module: 'inventory', action: 'read', resource: 'inventory' },
    { name: 'manage_inventory', display_name: 'Manage Inventory', module: 'inventory', action: 'update', resource: 'inventory' },
    { name: 'create_grn', display_name: 'Create GRN', module: 'inventory', action: 'create', resource: 'grn' },
    { name: 'verify_grn', display_name: 'Verify GRN', module: 'inventory', action: 'approve', resource: 'grn' },
    
    // Manufacturing Permissions
    { name: 'view_production_orders', display_name: 'View Production Orders', module: 'manufacturing', action: 'read', resource: 'production_orders' },
    { name: 'create_production_orders', display_name: 'Create Production Orders', module: 'manufacturing', action: 'create', resource: 'production_orders' },
    { name: 'manage_production_stages', display_name: 'Manage Production Stages', module: 'manufacturing', action: 'update', resource: 'production_stages' },
    
    // Shipment Permissions
    { name: 'view_shipments', display_name: 'View Shipments', module: 'shipment', action: 'read', resource: 'shipments' },
    { name: 'create_shipments', display_name: 'Create Shipments', module: 'shipment', action: 'create', resource: 'shipments' },
    { name: 'track_shipments', display_name: 'Track Shipments', module: 'shipment', action: 'update', resource: 'shipments' },
    
    // Finance Permissions
    { name: 'view_invoices', display_name: 'View Invoices', module: 'finance', action: 'read', resource: 'invoices' },
    { name: 'create_invoices', display_name: 'Create Invoices', module: 'finance', action: 'create', resource: 'invoices' },
    { name: 'manage_payments', display_name: 'Manage Payments', module: 'finance', action: 'update', resource: 'payments' },
    
    // User Management
    { name: 'view_users', display_name: 'View Users', module: 'admin', action: 'read', resource: 'users' },
    { name: 'create_users', display_name: 'Create Users', module: 'admin', action: 'create', resource: 'users' },
    { name: 'edit_users', display_name: 'Edit Users', module: 'admin', action: 'update', resource: 'users' },
    { name: 'delete_users', display_name: 'Delete Users', module: 'admin', action: 'delete', resource: 'users' },
    
    // Vendor & Customer Management
    { name: 'manage_vendors', display_name: 'Manage Vendors', module: 'procurement', action: 'update', resource: 'vendors' },
    { name: 'manage_customers', display_name: 'Manage Customers', module: 'sales', action: 'update', resource: 'customers' },
    
    // Reports
    { name: 'view_reports', display_name: 'View Reports', module: 'admin', action: 'read', resource: 'reports' },
    { name: 'export_reports', display_name: 'Export Reports', module: 'admin', action: 'export', resource: 'reports' }
  ];
  
  try {
    for (const permData of permissions) {
      await Permission.create(permData);
      stats.permissions++;
    }
    log.success(`${stats.permissions} permissions created successfully`);
  } catch (error) {
    log.error(`Permission seeding failed: ${error.message}`);
    stats.errors.push({ step: 'Seed Permissions', error: error.message });
    throw error;
  }
}

/**
 * Step 7: Create Admin User and assign role
 */
async function createAdminUser() {
  log.section('STEP 7: CREATE ADMIN USER');
  
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await User.create({
      employee_id: 'EMP-ADMIN-001',
      name: 'System Administrator',
      email: 'admin@pashion.com',
      password: hashedPassword,
      phone: '+91-9999999999',
      department: 'admin',
      status: 'active',
      date_of_joining: new Date(),
      created_by: null
    });
    
    stats.users++;
    log.success(`Admin user created: ${adminUser.email}`);
    
    // Assign Super Admin role
    const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
    if (superAdminRole) {
      await adminUser.addRole(superAdminRole);
      log.success('Super Administrator role assigned to admin user');
    }
    
    // Also assign all permissions to Super Admin role
    const allPermissions = await Permission.findAll();
    await superAdminRole.addPermissions(allPermissions);
    log.success(`${allPermissions.length} permissions assigned to Super Admin role`);
    
  } catch (error) {
    log.error(`Admin user creation failed: ${error.message}`);
    stats.errors.push({ step: 'Create Admin User', error: error.message });
    throw error;
  }
}

/**
 * Step 8: Seed Sample Customers
 */
async function seedCustomers() {
  log.section('STEP 8: SEED SAMPLE CUSTOMERS');
  
  const customers = [
    {
      customer_code: 'CUST-001',
      name: 'ABC School',
      company_name: 'ABC International School',
      contact_person: 'Mr. Rajesh Kumar',
      email: 'rajesh@abcschool.com',
      phone: '+91-9876543210',
      mobile: '+91-9876543210',
      billing_address: '123 School Street, Mumbai, Maharashtra',
      shipping_address: '123 School Street, Mumbai, Maharashtra',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      gst_number: '27AABCU9603R1ZM',
      customer_type: 'school',
      category: 'premium',
      payment_terms: '30 days',
      credit_limit: 500000.00,
      credit_days: 30,
      status: 'active',
      created_by: 1
    },
    {
      customer_code: 'CUST-002',
      name: 'XYZ Corporation',
      company_name: 'XYZ Corporate Solutions Pvt Ltd',
      contact_person: 'Ms. Priya Sharma',
      email: 'priya@xyzcorp.com',
      phone: '+91-9876543211',
      mobile: '+91-9876543211',
      billing_address: '456 Business Park, Pune, Maharashtra',
      shipping_address: '456 Business Park, Pune, Maharashtra',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      pincode: '411001',
      gst_number: '27AABCU9603R1ZN',
      customer_type: 'business',
      category: 'vip',
      payment_terms: '45 days',
      credit_limit: 1000000.00,
      credit_days: 45,
      status: 'active',
      created_by: 1
    },
    {
      customer_code: 'CUST-003',
      name: 'Fashion Retail Store',
      company_name: 'Fashion Retail Pvt Ltd',
      contact_person: 'Mr. Amit Patel',
      email: 'amit@fashionretail.com',
      phone: '+91-9876543212',
      mobile: '+91-9876543212',
      billing_address: '789 Mall Road, Delhi',
      shipping_address: '789 Mall Road, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001',
      gst_number: '07AABCU9603R1ZO',
      customer_type: 'retailer',
      category: 'regular',
      payment_terms: '15 days',
      credit_limit: 250000.00,
      credit_days: 15,
      status: 'active',
      created_by: 1
    }
  ];
  
  try {
    for (const customerData of customers) {
      await Customer.create(customerData);
      stats.customers++;
    }
    log.success(`${stats.customers} sample customers created`);
  } catch (error) {
    log.error(`Customer seeding failed: ${error.message}`);
    stats.errors.push({ step: 'Seed Customers', error: error.message });
    throw error;
  }
}

/**
 * Step 9: Seed Sample Vendors
 */
async function seedVendors() {
  log.section('STEP 9: SEED SAMPLE VENDORS');
  
  const vendors = [
    {
      vendor_code: 'VEN-001',
      name: 'Supreme Fabrics',
      company_name: 'Supreme Fabrics Pvt Ltd',
      contact_person: 'Mr. Suresh Jain',
      email: 'suresh@supremefabrics.com',
      phone: '+91-9876540001',
      mobile: '+91-9876540001',
      address: 'Textile Market, Surat, Gujarat',
      city: 'Surat',
      state: 'Gujarat',
      country: 'India',
      pincode: '395001',
      gst_number: '24AABCU9603R1ZP',
      vendor_type: 'material_supplier',
      category: 'fabric',
      payment_terms: '30 days',
      credit_limit: 500000.00,
      credit_days: 30,
      rating: 4.5,
      status: 'active',
      created_by: 1
    },
    {
      vendor_code: 'VEN-002',
      name: 'Elite Embroidery Works',
      company_name: 'Elite Embroidery Works',
      contact_person: 'Ms. Kavita Mehta',
      email: 'kavita@eliteembroidery.com',
      phone: '+91-9876540002',
      mobile: '+91-9876540002',
      address: 'Industrial Area, Ludhiana, Punjab',
      city: 'Ludhiana',
      state: 'Punjab',
      country: 'India',
      pincode: '141001',
      gst_number: '03AABCU9603R1ZQ',
      vendor_type: 'outsource_partner',
      category: 'embroidery',
      payment_terms: '15 days',
      credit_limit: 200000.00,
      credit_days: 15,
      rating: 4.2,
      status: 'active',
      created_by: 1
    },
    {
      vendor_code: 'VEN-003',
      name: 'Quality Accessories Hub',
      company_name: 'Quality Accessories Hub Pvt Ltd',
      contact_person: 'Mr. Ramesh Gupta',
      email: 'ramesh@qualityaccessories.com',
      phone: '+91-9876540003',
      mobile: '+91-9876540003',
      address: 'Market Yard, Mumbai, Maharashtra',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400002',
      gst_number: '27AABCU9603R1ZR',
      vendor_type: 'material_supplier',
      category: 'accessories',
      payment_terms: '20 days',
      credit_limit: 300000.00,
      credit_days: 20,
      rating: 4.7,
      status: 'active',
      created_by: 1
    }
  ];
  
  try {
    for (const vendorData of vendors) {
      await Vendor.create(vendorData);
      stats.vendors++;
    }
    log.success(`${stats.vendors} sample vendors created`);
  } catch (error) {
    log.error(`Vendor seeding failed: ${error.message}`);
    stats.errors.push({ step: 'Seed Vendors', error: error.message });
    throw error;
  }
}

/**
 * Step 10: Test Model Associations
 */
async function testAssociations() {
  log.section('STEP 10: TEST MODEL ASSOCIATIONS');
  
  const associationTests = [
    {
      name: 'User → Roles',
      test: async () => {
        const admin = await User.findOne({ where: { email: 'admin@pashion.com' }, include: ['roles'] });
        return admin && admin.roles && admin.roles.length > 0;
      }
    },
    {
      name: 'Role → Permissions',
      test: async () => {
        const superAdmin = await Role.findOne({ where: { name: 'super_admin' }, include: ['permissions'] });
        return superAdmin && superAdmin.permissions && superAdmin.permissions.length > 0;
      }
    },
    {
      name: 'Customer Model',
      test: async () => {
        const customers = await Customer.findAll();
        return customers && customers.length === 3;
      }
    },
    {
      name: 'Vendor Model',
      test: async () => {
        const vendors = await Vendor.findAll();
        return vendors && vendors.length === 3;
      }
    }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const test of associationTests) {
    try {
      const result = await test.test();
      if (result) {
        log.success(`${test.name} - PASSED`);
        passedTests++;
      } else {
        log.error(`${test.name} - FAILED`);
        failedTests++;
      }
    } catch (error) {
      log.error(`${test.name} - ERROR: ${error.message}`);
      failedTests++;
    }
  }
  
  log.info(`Association Tests: ${passedTests} passed, ${failedTests} failed`);
}

/**
 * Step 11: Generate Final Report
 */
function generateReport() {
  log.section('DATABASE SETUP COMPLETE - FINAL REPORT');
  
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║           PASSION ERP - DATABASE SETUP SUMMARY                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Database Configuration:                                         ║
║  • Host: ${process.env.DB_HOST || 'localhost'}                                              ║
║  • Database: ${process.env.DB_NAME || 'passion_erp'}                                   ║
║  • Port: ${process.env.DB_PORT || 3306}                                                ║
║                                                                  ║
║  Database Objects Created:                                       ║
║  • Tables/Models: ${stats.models.toString().padEnd(43)} ║
║  • Foreign Key Constraints: ${stats.associations.toString().padEnd(36)} ║
║  • Roles: ${stats.roles.toString().padEnd(50)} ║
║  • Permissions: ${stats.permissions.toString().padEnd(44)} ║
║  • Users: ${stats.users.toString().padEnd(50)} ║
║  • Customers: ${stats.customers.toString().padEnd(46)} ║
║  • Vendors: ${stats.vendors.toString().padEnd(48)} ║
║                                                                  ║
║  Login Credentials:                                              ║
║  • Email: admin@pashion.com                                      ║
║  • Password: admin123                                            ║
║  • Role: Super Administrator                                     ║
║                                                                  ║
${stats.errors.length > 0 ? 
`║  Errors Encountered: ${stats.errors.length.toString().padEnd(42)} ║` : 
`║  Status: ${colors.green}✓ All operations completed successfully${colors.reset}             ║`}
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
  
  if (stats.errors.length > 0) {
    log.section('ERRORS DETAILS');
    stats.errors.forEach((err, idx) => {
      log.error(`${idx + 1}. ${err.step}: ${err.error}`);
    });
  }
  
  log.section('NEXT STEPS');
  console.log(`
  ${colors.cyan}1.${colors.reset} Start the server: ${colors.bright}npm run dev${colors.reset}
  ${colors.cyan}2.${colors.reset} Login with: ${colors.bright}admin@pashion.com / admin123${colors.reset}
  ${colors.cyan}3.${colors.reset} ${colors.yellow}IMPORTANT:${colors.reset} Change admin password after first login!
  ${colors.cyan}4.${colors.reset} Create additional users via Admin panel
  ${colors.cyan}5.${colors.reset} Configure system settings and preferences
  `);
}

/**
 * Main execution function
 */
async function main() {
  console.log(`
${colors.bright}${colors.cyan}
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║       PASSION ERP - COMPREHENSIVE DATABASE SETUP                 ║
║                                                                  ║
║       This script will perform a complete database reset         ║
║       and setup with all necessary seed data.                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}
  `);
  
  try {
    await resetDatabase();
    await validateConnection();
    await createTables();
    await verifyForeignKeys();
    await seedRoles();
    await seedPermissions();
    await createAdminUser();
    await seedCustomers();
    await seedVendors();
    await testAssociations();
    
    generateReport();
    
    process.exit(0);
  } catch (error) {
    log.section('CRITICAL ERROR');
    log.error(`Setup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Execute the setup
main();