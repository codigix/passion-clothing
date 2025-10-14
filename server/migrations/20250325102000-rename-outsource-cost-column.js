'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('stage_operations', 'outsource_cost', 'outsourcing_cost');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('stage_operations', 'outsourcing_cost', 'outsource_cost');
  }
};