'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('purchase_orders', 'status', {
      type: Sequelize.ENUM('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'dispatched', 'in_transit', 'grn_requested', 'partial_received', 'received', 'excess_received', 'completed', 'cancelled'),
      defaultValue: 'draft',
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('purchase_orders', 'status', {
      type: Sequelize.ENUM('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'dispatched', 'in_transit', 'grn_requested', 'partial_received', 'received', 'completed', 'cancelled'),
      defaultValue: 'draft',
      allowNull: true
    });
  }
};
