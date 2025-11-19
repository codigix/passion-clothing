'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('notifications', 'type', {
      type: Sequelize.ENUM(
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
      ),
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('notifications', 'type', {
      type: Sequelize.ENUM(
        'order',
        'inventory',
        'manufacturing',
        'shipment',
        'procurement',
        'finance',
        'system',
        'vendor_shortage',
        'grn_verification',
        'grn_verified',
        'grn_discrepancy',
        'grn_discrepancy_resolved'
      ),
      allowNull: false
    });
  }
};
