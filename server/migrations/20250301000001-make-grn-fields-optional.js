'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make BOM and Sales Order optional in GRN
    // This allows GRN creation directly from PO without BOM
    await queryInterface.changeColumn('GoodsReceiptNotes', 'bill_of_materials_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Changed from false to true
      references: {
        model: 'BillOfMaterials',
        key: 'id'
      }
    });

    await queryInterface.changeColumn('GoodsReceiptNotes', 'sales_order_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Changed from false to true
      references: {
        model: 'SalesOrders',
        key: 'id'
      }
    });

    // Add new fields for verification workflow
    await queryInterface.addColumn('GoodsReceiptNotes', 'verification_status', {
      type: Sequelize.ENUM('pending', 'verified', 'discrepancy', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    });

    await queryInterface.addColumn('GoodsReceiptNotes', 'verified_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('GoodsReceiptNotes', 'verification_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('GoodsReceiptNotes', 'verification_notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('GoodsReceiptNotes', 'discrepancy_details', {
      type: Sequelize.JSON,
      allowNull: true,
      // Structure: { qty_mismatch: true, weight_mismatch: false, quality_issue: false, details: '...' }
    });

    await queryInterface.addColumn('GoodsReceiptNotes', 'discrepancy_approved_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('GoodsReceiptNotes', 'discrepancy_approval_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('GoodsReceiptNotes', 'discrepancy_approval_notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('GoodsReceiptNotes', 'inventory_added', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('GoodsReceiptNotes', 'inventory_added_date', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove new columns
    await queryInterface.removeColumn('GoodsReceiptNotes', 'verification_status');
    await queryInterface.removeColumn('GoodsReceiptNotes', 'verified_by');
    await queryInterface.removeColumn('GoodsReceiptNotes', 'verification_date');
    await queryInterface.removeColumn('GoodsReceiptNotes', 'verification_notes');
    await queryInterface.removeColumn('GoodsReceiptNotes', 'discrepancy_details');
    await queryInterface.removeColumn('GoodsReceiptNotes', 'discrepancy_approved_by');
    await queryInterface.removeColumn('GoodsReceiptNotes', 'discrepancy_approval_date');
    await queryInterface.removeColumn('GoodsReceiptNotes', 'discrepancy_approval_notes');
    await queryInterface.removeColumn('GoodsReceiptNotes', 'inventory_added');
    await queryInterface.removeColumn('GoodsReceiptNotes', 'inventory_added_date');

    // Revert BOM and SO to required
    await queryInterface.changeColumn('GoodsReceiptNotes', 'bill_of_materials_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'BillOfMaterials',
        key: 'id'
      }
    });

    await queryInterface.changeColumn('GoodsReceiptNotes', 'sales_order_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'SalesOrders',
        key: 'id'
      }
    });
  }
};