'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('goods_receipt_notes', 'status', {
      type: Sequelize.ENUM('draft', 'received', 'inspected', 'approved', 'rejected', 'vendor_revert_requested', 'excess_received'),
      defaultValue: 'draft',
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('goods_receipt_notes', 'status', {
      type: Sequelize.ENUM('draft', 'received', 'inspected', 'approved', 'rejected', 'vendor_revert_requested'),
      defaultValue: 'draft',
      allowNull: true
    });
  }
};
