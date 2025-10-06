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
        'partial_received', 
        'received', 
        'completed', 
        'cancelled'
      ) DEFAULT 'draft';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE purchase_orders 
      MODIFY COLUMN status ENUM(
        'draft', 
        'sent', 
        'acknowledged', 
        'partial_received', 
        'received', 
        'completed', 
        'cancelled'
      ) DEFAULT 'draft';
    `);
  }
};