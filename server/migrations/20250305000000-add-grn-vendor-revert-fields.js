'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add vendor revert fields to goods_receipt_notes table
    await queryInterface.addColumn('goods_receipt_notes', 'vendor_revert_requested', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Flag indicating vendor has requested to revert/replace items'
    });

    await queryInterface.addColumn('goods_receipt_notes', 'vendor_revert_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason for vendor revert request'
    });

    await queryInterface.addColumn('goods_receipt_notes', 'vendor_revert_items', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Items requested for revert/replacement by vendor'
    });

    await queryInterface.addColumn('goods_receipt_notes', 'vendor_revert_requested_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who requested the vendor revert'
    });

    await queryInterface.addColumn('goods_receipt_notes', 'vendor_revert_requested_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when vendor revert was requested'
    });

    await queryInterface.addColumn('goods_receipt_notes', 'vendor_revert_approved_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who approved/rejected the vendor revert'
    });

    await queryInterface.addColumn('goods_receipt_notes', 'vendor_revert_approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when vendor revert was approved/rejected'
    });

    await queryInterface.addColumn('goods_receipt_notes', 'vendor_revert_status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'completed'),
      defaultValue: 'pending',
      allowNull: false,
      comment: 'Status of vendor revert request'
    });

    await queryInterface.addColumn('goods_receipt_notes', 'vendor_revert_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notes from approval/rejection of vendor revert'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove vendor revert fields from goods_receipt_notes table
    await queryInterface.removeColumn('goods_receipt_notes', 'vendor_revert_requested');
    await queryInterface.removeColumn('goods_receipt_notes', 'vendor_revert_reason');
    await queryInterface.removeColumn('goods_receipt_notes', 'vendor_revert_items');
    await queryInterface.removeColumn('goods_receipt_notes', 'vendor_revert_requested_by');
    await queryInterface.removeColumn('goods_receipt_notes', 'vendor_revert_requested_at');
    await queryInterface.removeColumn('goods_receipt_notes', 'vendor_revert_approved_by');
    await queryInterface.removeColumn('goods_receipt_notes', 'vendor_revert_approved_at');
    await queryInterface.removeColumn('goods_receipt_notes', 'vendor_revert_status');
    await queryInterface.removeColumn('goods_receipt_notes', 'vendor_revert_notes');
  }
};