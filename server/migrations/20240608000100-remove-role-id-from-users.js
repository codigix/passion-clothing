'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove role_id column from users table (already removed, skipping)
    // await queryInterface.removeColumn('users', 'role_id');
    // Remove index on role_id if it exists (already removed, skipping)
    // try {
    //   await queryInterface.removeIndex('users', ['role_id']);
    // } catch (e) {
    //   // Index might not exist, ignore error
    // }
  },

  async down(queryInterface, Sequelize) {
    // Add role_id column back (nullable, for rollback)
    await queryInterface.addColumn('users', 'role_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    });
    // Add index back
    await queryInterface.addIndex('users', ['role_id']);
  }
};
