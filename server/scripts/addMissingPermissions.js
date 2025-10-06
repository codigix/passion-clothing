const { sequelize, Permission, Role } = require('../config/database');

const addMissingPermissions = async () => {
  try {
    console.log('Adding missing permissions...');

    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Define missing permissions
    const missingPermissions = [
      // Product permissions
      { name: 'inventory.create.product', display_name: 'Create Product', module: 'inventory', action: 'create', resource: 'product' },
      { name: 'inventory.read.product', display_name: 'Read Product', module: 'inventory', action: 'read', resource: 'product' },
      { name: 'inventory.update.product', display_name: 'Update Product', module: 'inventory', action: 'update', resource: 'product' },
      { name: 'inventory.delete.product', display_name: 'Delete Product', module: 'inventory', action: 'delete', resource: 'product' },
      
      // Stock permissions
      { name: 'inventory.create.stock', display_name: 'Create Stock', module: 'inventory', action: 'create', resource: 'stock' },
      { name: 'inventory.read.stock', display_name: 'Read Stock', module: 'inventory', action: 'read', resource: 'stock' },
      { name: 'inventory.update.stock', display_name: 'Update Stock', module: 'inventory', action: 'update', resource: 'stock' },
      { name: 'inventory.delete.stock', display_name: 'Delete Stock', module: 'inventory', action: 'delete', resource: 'stock' },
    ];

    // Add permissions to database
    const createdPermissions = [];
    for (const permissionData of missingPermissions) {
      const [permission, created] = await Permission.findOrCreate({
        where: { name: permissionData.name },
        defaults: {
          ...permissionData,
          status: 'active'
        }
      });
      
      if (created) {
        console.log(`✓ Created permission: ${permissionData.name}`);
      } else {
        console.log(`- Permission already exists: ${permissionData.name}`);
      }
      
      createdPermissions.push(permission);
    }

    // Assign permissions to relevant roles
    console.log('\nAssigning permissions to roles...');

    // Get all roles
    const roles = await Role.findAll();
    
    for (const role of roles) {
      if (role.name === 'super_admin') {
        // Super admin gets all permissions
        await role.addPermissions(createdPermissions);
        console.log(`✓ Assigned all permissions to ${role.display_name}`);
      } else if (role.name.includes('inventory_') || role.name.includes('admin_')) {
        // Inventory and admin roles get inventory permissions
        const inventoryPermissions = createdPermissions.filter(p => p.module === 'inventory');
        await role.addPermissions(inventoryPermissions);
        console.log(`✓ Assigned inventory permissions to ${role.display_name}`);
      } else if (role.name.includes('procurement_')) {
        // Procurement roles get read and create permissions for products
        const procurementPermissions = createdPermissions.filter(p => 
          p.module === 'inventory' && (p.action === 'read' || p.action === 'create')
        );
        await role.addPermissions(procurementPermissions);
        console.log(`✓ Assigned read/create permissions to ${role.display_name}`);
      }
    }

    console.log('\n✅ Missing permissions added successfully!');

  } catch (error) {
    console.error('❌ Error adding missing permissions:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  addMissingPermissions();
}

module.exports = addMissingPermissions;