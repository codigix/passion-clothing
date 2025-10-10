'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('inventory', 'project_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Project this stock belongs to (null means general/extra stock)',
      references: {
        model: 'customers', // Assuming projects are linked to customers
        key: 'id'
      }
    });

    await queryInterface.addColumn('inventory', 'stock_type', {
      type: Sequelize.ENUM('project_specific', 'general_extra', 'consignment', 'returned'),
      defaultValue: 'general_extra',
      allowNull: false,
      comment: 'Type of stock for better categorization and tracking'
    });

    // Add indexes for performance
    await queryInterface.addIndex('inventory', ['project_id']);
    await queryInterface.addIndex('inventory', ['stock_type']);
    await queryInterface.addIndex('inventory', ['project_id', 'stock_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('inventory', ['project_id', 'stock_type']);
    await queryInterface.removeIndex('inventory', ['stock_type']);
    await queryInterface.removeIndex('inventory', ['project_id']);

    await queryInterface.removeColumn('inventory', 'stock_type');
    await queryInterface.removeColumn('inventory', 'project_id');
  }
};