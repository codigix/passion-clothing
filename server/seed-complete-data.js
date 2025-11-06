const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'passion_erp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function seedCompleteData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // 1. Seed Roles
    console.log('📋 Creating roles...');
    const departments = [
      'sales', 'procurement', 'manufacturing', 'outsourcing',
      'inventory', 'shipment', 'store', 'finance', 'admin', 'samples'
    ];

    for (const dept of departments) {
      const nameBase = dept.charAt(0).toUpperCase() + dept.slice(1);
      
      await sequelize.query(`
        INSERT IGNORE INTO roles (name, display_name, description, department, level, status, created_at, updated_at)
        VALUES 
        ('${dept}_user', '${nameBase} User', 'Basic user role for ${dept} department', '${dept}', 1, 'active', NOW(), NOW()),
        ('${dept}_manager', '${nameBase} Manager', 'Manager role for ${dept} department', '${dept}', 3, 'active', NOW(), NOW())
      `);
    }

    // Super Admin Role
    await sequelize.query(`
      INSERT IGNORE INTO roles (name, display_name, description, department, level, status, created_at, updated_at)
      VALUES ('super_admin', 'Super Administrator', 'Full system access', 'admin', 5, 'active', NOW(), NOW())
    `);
    console.log('✅ Roles created\n');

    // 2. Seed Permissions
    console.log('📋 Creating permissions...');
    const permissions = [
      { name: 'users.create.user', display_name: 'Create User', module: 'users' },
      { name: 'sales.create.order', display_name: 'Create Sales Order', module: 'sales' },
      { name: 'sales.approve.order', display_name: 'Approve Sales Order', module: 'sales' },
      { name: 'procurement.create.purchase_order', display_name: 'Create Purchase Order', module: 'procurement' },
      { name: 'manufacturing.create.production_order', display_name: 'Create Production Order', module: 'manufacturing' },
      { name: 'inventory.create.item', display_name: 'Create Inventory Item', module: 'inventory' },
      { name: 'shipment.create', display_name: 'Create Shipment', module: 'shipment' },
    ];

    for (const perm of permissions) {
      await sequelize.query(`
        INSERT IGNORE INTO permissions (name, display_name, module, action, resource, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [perm.name, perm.display_name, perm.module, 'create', perm.module]
      });
    }
    console.log('✅ Permissions created\n');

    // 3. Seed Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    
    const users = [
      { employee_id: 'EMP001', name: 'System Administrator', email: 'admin@pashion.com', department: 'admin' },
      { employee_id: 'EMP002', name: 'Rajesh Kumar', email: 'rajesh@pashion.com', department: 'sales' },
      { employee_id: 'EMP003', name: 'Priya Singh', email: 'priya@pashion.com', department: 'procurement' },
      { employee_id: 'EMP004', name: 'Amit Patel', email: 'amit@pashion.com', department: 'manufacturing' },
      { employee_id: 'EMP005', name: 'Neha Verma', email: 'neha@pashion.com', department: 'inventory' },
      { employee_id: 'EMP006', name: 'Vikram Reddy', email: 'vikram@pashion.com', department: 'shipment' },
      { employee_id: 'EMP007', name: 'Ananya Sharma', email: 'ananya@pashion.com', department: 'finance' },
      { employee_id: 'EMP008', name: 'Rohit Nair', email: 'rohit@pashion.com', department: 'samples' },
    ];

    for (const user of users) {
      await sequelize.query(`
        INSERT IGNORE INTO users (employee_id, name, email, password, department, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `, {
        replacements: [user.employee_id, user.name, user.email, hashedPassword, user.department]
      });
    }
    console.log('✅ Users created\n');

    // 4. Seed Customers
    console.log('🏢 Creating customers...');
    const customers = [
      { code: 'CUST001', name: 'ABC Textiles Pvt Ltd', email: 'contact@abctextiles.com', city: 'Mumbai', state: 'Maharashtra', gst: '22AAAAA0000A1Z5' },
      { code: 'CUST002', name: 'XYZ Garments Ltd', email: 'orders@xyzgarments.com', city: 'Delhi', state: 'Delhi', gst: '07BBBBB0000B1Z6' },
      { code: 'CUST003', name: 'Fashion Hub Retail', email: 'info@fashionhub.com', city: 'Bangalore', state: 'Karnataka', gst: '29CCCCC0000C1Z7' },
      { code: 'CUST004', name: 'Metro Fashion Inc', email: 'sales@metrofashion.com', city: 'Pune', state: 'Maharashtra', gst: '27DDDDD0000D1Z8' },
      { code: 'CUST005', name: 'Elite Clothing Co', email: 'info@eliteclothing.com', city: 'Chennai', state: 'Tamil Nadu', gst: '33EEEEE0000E1Z9' },
    ];

    for (const cust of customers) {
      await sequelize.query(`
        INSERT IGNORE INTO customers (customer_code, name, email, city, state, gst_number, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `, {
        replacements: [cust.code, cust.name, cust.email, cust.city, cust.state, cust.gst]
      });
    }
    console.log('✅ Customers created\n');

    // 5. Seed Vendors
    console.log('🏭 Creating vendors...');
    const vendors = [
      { code: 'VEND001', name: 'Premium Fabrics India', contact: 'Rajesh Kumar', email: 'rajesh@premiumfabrics.com', city: 'Surat', state: 'Gujarat', gst: '24DDDDD0000D1Z8' },
      { code: 'VEND002', name: 'Quality Threads Ltd', contact: 'Priya Sharma', email: 'priya@qualitythreads.com', city: 'Ludhiana', state: 'Punjab', gst: '03EEEEE0000E1Z9' },
      { code: 'VEND003', name: 'Metro Accessories Pvt Ltd', contact: 'Amit Singh', email: 'amit@metroaccessories.com', city: 'Noida', state: 'Uttar Pradesh', gst: '09FFFFF0000F1Z0' },
      { code: 'VEND004', name: 'Global Textiles Pvt', contact: 'Suresh Kumar', email: 'suresh@globaltex.com', city: 'Tiruppur', state: 'Tamil Nadu', gst: '33GGGGGG0000G1Z1' },
      { code: 'VEND005', name: 'Precision Embroidery', contact: 'Mohit Verma', email: 'mohit@precision.com', city: 'Jaipur', state: 'Rajasthan', gst: '08HHHHHH0000H1Z2' },
    ];

    for (const vend of vendors) {
      await sequelize.query(`
        INSERT IGNORE INTO vendors (vendor_code, name, contact_person, email, city, state, gst_number, vendor_type, category, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `, {
        replacements: [vend.code, vend.name, vend.contact, vend.email, vend.city, vend.state, vend.gst, 'material_supplier', 'fabric']
      });
    }
    console.log('✅ Vendors created\n');

    // 6. Seed Products
    console.log('📦 Creating products...');
    const products = [
      { name: 'Cotton T-Shirt', code: 'PROD-001', category: 'shirt', product_type: 'finished_goods', unit: 'piece', material: 'cotton' },
      { name: 'Polyester Shirt', code: 'PROD-002', category: 'shirt', product_type: 'finished_goods', unit: 'piece', material: 'polyester' },
      { name: 'Denim Jeans', code: 'PROD-003', category: 'trouser', product_type: 'finished_goods', unit: 'piece', material: 'cotton' },
      { name: 'Silk Dress', code: 'PROD-004', category: 'skirt', product_type: 'finished_goods', unit: 'piece', material: 'silk' },
      { name: 'Button Set', code: 'PROD-ACC-001', category: 'button', product_type: 'accessory', unit: 'piece', material: 'plastic' },
      { name: 'Zipper Roll', code: 'PROD-ACC-002', category: 'zipper', product_type: 'accessory', unit: 'piece', material: 'metal' },
      { name: 'Thread Spool', code: 'PROD-ACC-003', category: 'thread', product_type: 'accessory', unit: 'piece', material: 'polyester' },
    ];

    for (const prod of products) {
      await sequelize.query(`
        INSERT IGNORE INTO products (product_code, name, category, product_type, unit_of_measurement, material, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `, {
        replacements: [prod.code, prod.name, prod.category, prod.product_type, prod.unit, prod.material]
      });
    }
    console.log('✅ Products created\n');

    // 7. Seed Inventory
    console.log('📊 Creating inventory items...');
    const inventory = [
      { name: 'Cotton Fabric Bolt', code: 'INV-001', category: 'fabric', prod_type: 'raw_material', material: 'cotton', qty: 1000, unit: 'meter' },
      { name: 'Polyester Fabric Bolt', code: 'INV-002', category: 'fabric', prod_type: 'raw_material', material: 'polyester', qty: 800, unit: 'meter' },
      { name: 'Silk Fabric Roll', code: 'INV-003', category: 'fabric', prod_type: 'raw_material', material: 'silk', qty: 500, unit: 'meter' },
      { name: 'Buttons - Plastic', code: 'INV-ACC-001', category: 'button', prod_type: 'accessory', material: 'plastic', qty: 5000, unit: 'piece' },
      { name: 'Metal Zippers', code: 'INV-ACC-002', category: 'zipper', prod_type: 'accessory', material: 'metal', qty: 3000, unit: 'piece' },
      { name: 'Sewing Thread', code: 'INV-ACC-003', category: 'thread', prod_type: 'accessory', material: 'polyester', qty: 2000, unit: 'piece' },
    ];

    for (const inv of inventory) {
      await sequelize.query(`
        INSERT IGNORE INTO inventory (product_code, product_name, category, product_type, material, available_stock, unit_of_measurement, location, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Warehouse', true, NOW(), NOW())
      `, {
        replacements: [inv.code, inv.name, inv.category, inv.prod_type, inv.material, inv.qty, inv.unit]
      });
    }
    console.log('✅ Inventory items created\n');

    // 8. Get admin user ID for created_by
    const [adminUser] = await sequelize.query(`
      SELECT id FROM users WHERE email = 'admin@pashion.com' LIMIT 1
    `);
    const adminUserId = adminUser[0]?.id || 1;

    // 8. Seed Courier Partners (for Shipments)
    console.log('🚚 Creating courier partners...');
    const couriers = [
      { name: 'FedEx Logistics', code: 'FEDEX', contact: 'Fedex Support', email: 'support@fedex.in', phone: '+91-9876543216' },
      { name: 'DHL Express', code: 'DHL', contact: 'DHL Support', email: 'support@dhl.in', phone: '+91-9876543217' },
      { name: 'Blue Dart Express', code: 'BLUEDART', contact: 'Blue Dart Support', email: 'support@bluedart.in', phone: '+91-9876543218' },
    ];

    for (const courier of couriers) {
      await sequelize.query(`
        INSERT IGNORE INTO courier_partners (name, code, contact_person, email, phone, is_active, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, true, ?, NOW(), NOW())
      `, {
        replacements: [courier.name, courier.code, courier.contact, courier.email, courier.phone, adminUserId]
      });
    }
    console.log('✅ Courier partners created\n');

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
    console.log('📋 DATA CREATED:');
    console.log('   • 11 Roles (1 admin, 2 per department)');
    console.log('   • 7 Permissions');
    console.log('   • 8 Users (1 per department + admin)');
    console.log('   • 5 Customers');
    console.log('   • 5 Vendors');
    console.log('   • 7 Products');
    console.log('   • 6 Inventory Items');
    console.log('   • 3 Courier Partners\n');
    console.log('👤 LOGIN CREDENTIALS:');
    console.log('   Email: admin@pashion.com');
    console.log('   Password: Admin@123\n');
    console.log('   (All other users have password: Test@123)\n');
    console.log('🚀 Ready to start using the system!');
    console.log('═══════════════════════════════════════════════════\n');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  }
}

seedCompleteData();