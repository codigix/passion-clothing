const { sequelize, Customer, Vendor, User, Role } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedSampleData = async () => {
  try {
    console.log('Starting sample data seeding...');

    // Create a default admin user if none exists
    let firstUser = await User.findOne();
    if (!firstUser) {
      console.log('Creating default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      firstUser = await User.create({
        employee_id: 'ADMIN001',
        name: 'System Admin',
        email: 'admin@pashion.com',
        password: hashedPassword,
        phone: '+91-9876543210',
        department: 'admin',
        designation: 'System Administrator',
        status: 'active',
        created_by: 1 // self-reference for system user
      });

      console.log('Default admin user created');
    }

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
        created_by: firstUser.id
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
        created_by: firstUser.id
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
        created_by: firstUser.id
      }
    ];

    for (const customerData of customers) {
      await Customer.findOrCreate({
        where: { customer_code: customerData.customer_code },
        defaults: customerData
      });
    }
    console.log('Sample customers created');

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
        created_by: firstUser.id
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
        created_by: firstUser.id
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
        created_by: firstUser.id
      }
    ];

    for (const vendorData of vendors) {
      await Vendor.findOrCreate({
        where: { vendor_code: vendorData.vendor_code },
        defaults: vendorData
      });
    }
    console.log('Sample vendors created');

    console.log('Sample data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding sample data:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  seedSampleData().then(() => {
    if (!process.exitCode) {
      console.log('Sample data seeding complete.');
    }
  });
}

module.exports = seedSampleData;