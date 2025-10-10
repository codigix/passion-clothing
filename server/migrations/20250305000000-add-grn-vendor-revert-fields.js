'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper function to check if table exists
    const tableExists = async (tableName) => {
      try {
        await queryInterface.describeTable(tableName);
        return true;
      } catch (error) {
        return false;
      }
    };

    // Helper function to safely describe table
    const describeTableIfExists = async (tableName) => {
      try {
        return await queryInterface.describeTable(tableName);
      } catch (error) {
        return null;
      }
    };

    // Helper function to check if column exists
    const columnExists = async (tableName, columnName) => {
      try {
        const table = await queryInterface.describeTable(tableName);
        return table[columnName] !== undefined;
      } catch (error) {
        return false;
      }
    };

    // Helper function to add column if missing
    const addColumnIfMissing = async (tableName, columnName, columnDefinition) => {
      const exists = await columnExists(tableName, columnName);
      if (!exists) {
        await queryInterface.addColumn(tableName, columnName, columnDefinition);
        console.log(`✓ Added column: ${tableName}.${columnName}`);
      } else {
        console.log(`⊘ Column already exists: ${tableName}.${columnName}`);
      }
    };

    // Add vendor revert fields to goods_receipt_notes table (only if they don't exist)
    await addColumnIfMissing('goods_receipt_notes', 'vendor_revert_requested', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Flag indicating vendor has requested to revert/replace items'
    });

    await addColumnIfMissing('goods_receipt_notes', 'vendor_revert_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason for vendor revert request'
    });

    await addColumnIfMissing('goods_receipt_notes', 'vendor_revert_items', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Items requested for revert/replacement by vendor'
    });

    await addColumnIfMissing('goods_receipt_notes', 'vendor_revert_requested_by', {
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

    await addColumnIfMissing('goods_receipt_notes', 'vendor_revert_requested_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when vendor revert was requested'
    });

    await addColumnIfMissing('goods_receipt_notes', 'vendor_revert_approved_by', {
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

    await addColumnIfMissing('goods_receipt_notes', 'vendor_revert_approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when vendor revert was approved/rejected'
    });

    await addColumnIfMissing('goods_receipt_notes', 'vendor_revert_status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'completed'),
      defaultValue: 'pending',
      allowNull: false,
      comment: 'Status of vendor revert request'
    });

    await addColumnIfMissing('goods_receipt_notes', 'vendor_revert_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notes from approval/rejection of vendor revert'
    });
  },

  async down(queryInterface, Sequelize) {
    // Helper function to check if column exists
    const columnExists = async (tableName, columnName) => {
      try {
        const table = await queryInterface.describeTable(tableName);
        return table[columnName] !== undefined;
      } catch (error) {
        return false;
      }
    };

    // Helper function to remove column if exists
    const removeColumnIfExists = async (tableName, columnName) => {
      const exists = await columnExists(tableName, columnName);
      if (exists) {
        await queryInterface.removeColumn(tableName, columnName);
        console.log(`✓ Removed column: ${tableName}.${columnName}`);
      } else {
        console.log(`⊘ Column doesn't exist: ${tableName}.${columnName}`);
      }
    };

    // Remove vendor revert fields from goods_receipt_notes table (only if they exist)
    await removeColumnIfExists('goods_receipt_notes', 'vendor_revert_requested');
    await removeColumnIfExists('goods_receipt_notes', 'vendor_revert_reason');
    await removeColumnIfExists('goods_receipt_notes', 'vendor_revert_items');
    await removeColumnIfExists('goods_receipt_notes', 'vendor_revert_requested_by');
    await removeColumnIfExists('goods_receipt_notes', 'vendor_revert_requested_at');
    await removeColumnIfExists('goods_receipt_notes', 'vendor_revert_approved_by');
    await removeColumnIfExists('goods_receipt_notes', 'vendor_revert_approved_at');
    await removeColumnIfExists('goods_receipt_notes', 'vendor_revert_status');
    await removeColumnIfExists('goods_receipt_notes', 'vendor_revert_notes');
  }
};