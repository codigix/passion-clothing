'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'grn_requested' to the enum values for status column in purchase_orders table
    await queryInterface.sequelize.query(`
      ALTER TABLE purchase_orders
      MODIFY COLUMN status ENUM('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'grn_requested', 'partial_received', 'received', 'completed', 'cancelled')
      NOT NULL DEFAULT 'draft'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove 'grn_requested' from the enum values
    await queryInterface.sequelize.query(`
      ALTER TABLE purchase_orders
      MODIFY COLUMN status ENUM('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'partial_received', 'received', 'completed', 'cancelled')
      NOT NULL DEFAULT 'draft'
    `);
  }
};