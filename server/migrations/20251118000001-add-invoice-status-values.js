'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('invoices', 'status', {
      type: Sequelize.ENUM('draft', 'generated', 'sent', 'viewed', 'partial_paid', 'paid', 'overdue', 'cancelled', 'recorded'),
      defaultValue: 'draft',
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('invoices', 'status', {
      type: Sequelize.ENUM('draft', 'sent', 'viewed', 'partial_paid', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'draft',
      allowNull: true
    });
  }
};
