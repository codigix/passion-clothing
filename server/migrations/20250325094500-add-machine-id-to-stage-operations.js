'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('stage_operations', 'machine_id', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Machine or equipment used'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('stage_operations', 'machine_id');
  }
};