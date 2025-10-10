'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new notification types to the enum for GRN workflow
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications
      MODIFY COLUMN type ENUM('order', 'inventory', 'manufacturing', 'shipment', 'procurement', 'finance', 'system', 'vendor_shortage', 'grn_verification', 'grn_verified', 'grn_discrepancy', 'grn_discrepancy_resolved')
      NOT NULL;
    `);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
