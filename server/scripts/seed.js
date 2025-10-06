const { sequelize, Role, Permission } = require('../config/database');

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Sync database (create tables if they don't exist)
    await sequelize.sync();
    console.log('Database synced successfully');

    // Create default roles for each department (idempotent)
    const departments = [
      'sales', 'procurement', 'manufacturing', 'outsourcing',
      'inventory', 'shipment', 'store', 'finance', 'admin', 'samples'
    ];

    const roles = [];
    
    // Create basic roles for each department if they do not exist
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

    // Ensure super admin role exists
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

    console.log(`Ensured ${roles.length} roles exist`);

    // Create basic permissions (idempotent)
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

    console.log(`Ensured ${permissions.length} permissions exist`);

    const permissionByName = permissions.reduce((accumulator, permission) => {
      accumulator[permission.name] = permission;
      return accumulator;
    }, {});

    // Assign permissions to super admin role
    const superAdminRoleRecord = roles.find(r => r.name === 'super_admin');
    if (superAdminRoleRecord) {
      await superAdminRoleRecord.setPermissions(permissions);
      console.log('Assigned all permissions to super admin role');
    }

    // Assign basic permissions to manager roles (merge with existing)
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

      const uniquePermissions = new Map([...relevantPermissions, ...extraPermissions].map(permission => [permission.id, permission]));
      await role.addPermissions([...uniquePermissions.values()]);
    }

    console.log('Assigned permissions to manager roles');

    // Assign read permissions to user roles (merge with existing)
    const userRoles = roles.filter(r => r.name.includes('_user'));
    const readPermissions = permissions.filter(p => p.action === 'read');

    for (const role of userRoles) {
      const relevantPermissions = readPermissions.filter(p => 
        p.module === role.department || p.module === 'attendance'
      );
      await role.addPermissions(relevantPermissions);
    }

    console.log('Assigned read permissions to user roles');

    console.log('Database seeding completed successfully!');

    // Display roles for reference
    console.log('\nRoles in system:');
    roles.forEach(role => {
      console.log(`- ${role.display_name} (ID: ${role.id}, Level: ${role.level})`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;