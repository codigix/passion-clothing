const { sequelize, User, Role } = require('../config/database');

const assignRolesToUsers = async () => {
  try {
    console.log('Starting role assignment...');

    // Get all users without roles
    const users = await User.findAll({
      include: [{
        model: Role,
        as: 'roles'
      }]
    });

    console.log(`Found ${users.length} users`);

    for (const user of users) {
      // Skip if user already has roles
      if (user.roles && user.roles.length > 0) {
        console.log(`User ${user.email} already has roles, skipping...`);
        continue;
      }

      // Find appropriate role based on department
      // Assign manager role (level 3) to all users for now (can be changed later)
      const roleName = `${user.department}_manager`;
      
      const role = await Role.findOne({
        where: { name: roleName }
      });

      if (role) {
        await user.addRole(role);
        console.log(`Assigned ${role.display_name} to user ${user.email}`);
      } else {
        console.log(`No role found for department: ${user.department}`);
      }
    }

    console.log('Role assignment completed successfully!');

  } catch (error) {
    console.error('Error assigning roles:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  assignRolesToUsers();
}

module.exports = assignRolesToUsers;