'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('stage_operations');
    
    if (!tableDescription.outsource_cost) {
      await queryInterface.addColumn('stage_operations', 'outsource_cost', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        after: 'vendor_id'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('stage_operations');
    
    if (tableDescription.outsource_cost) {
      await queryInterface.removeColumn('stage_operations', 'outsource_cost');
    }
  }
};
