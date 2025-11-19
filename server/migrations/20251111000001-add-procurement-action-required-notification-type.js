'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM(
        'order', 
        'inventory', 
        'manufacturing', 
        'shipment', 
        'procurement', 
        'finance', 
        'system', 
        'vendor_shortage', 
        'vendor_overage', 
        'vendor_mismatch', 
        'excess_approved', 
        'excess_rejected', 
        'grn_verification', 
        'grn_verified', 
        'grn_discrepancy', 
        'grn_discrepancy_resolved', 
        'grn_mismatch_request', 
        'grn_mismatch_approved', 
        'grn_mismatch_rejected',
        'procurement_action_required'
      ) NOT NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM(
        'order', 
        'inventory', 
        'manufacturing', 
        'shipment', 
        'procurement', 
        'finance', 
        'system', 
        'vendor_shortage', 
        'vendor_overage', 
        'vendor_mismatch', 
        'excess_approved', 
        'excess_rejected', 
        'grn_verification', 
        'grn_verified', 
        'grn_discrepancy', 
        'grn_discrepancy_resolved', 
        'grn_mismatch_request', 
        'grn_mismatch_approved', 
        'grn_mismatch_rejected'
      ) NOT NULL
    `);
  }
};
