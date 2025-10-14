'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('stage_operations', 'outsource_cost', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      after: 'vendor_id' // adjust position if needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('stage_operations', 'outsource_cost');
  }
};
