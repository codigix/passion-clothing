'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE purchase_orders 
      MODIFY COLUMN status ENUM(
        'draft', 
        'pending_approval', 
        'approved', 
        'sent', 
        'acknowledged', 
        'dispatched', 
        'in_transit', 
        'grn_requested', 
        'partial_received', 
        'received', 
        'grn_shortage', 
        'grn_overage', 
        'excess_received', 
        'completed', 
        'cancelled'
      ) DEFAULT 'draft'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE purchase_orders 
      MODIFY COLUMN status ENUM(
        'draft', 
        'pending_approval', 
        'approved', 
        'sent', 
        'acknowledged', 
        'dispatched', 
        'in_transit', 
        'grn_requested', 
        'partial_received', 
        'received', 
        'excess_received', 
        'completed', 
        'cancelled'
      ) DEFAULT 'draft'
    `);
  }
};
