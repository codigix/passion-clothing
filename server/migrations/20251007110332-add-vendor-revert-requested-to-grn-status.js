'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Update the status enum to include 'vendor_revert_requested'
    await queryInterface.changeColumn('goods_receipt_notes', 'status', {
      type: Sequelize.ENUM('draft', 'received', 'inspected', 'approved', 'rejected', 'vendor_revert_requested'),
      allowNull: true,
      defaultValue: 'draft'
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert the status enum to remove 'vendor_revert_requested'
    await queryInterface.changeColumn('goods_receipt_notes', 'status', {
      type: Sequelize.ENUM('draft', 'received', 'inspected', 'approved', 'rejected'),
      allowNull: true,
      defaultValue: 'draft'
    });
  }
};
