'use strict';

// Helper functions to safely add/remove columns
const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  const normalizedTables = tables.map((t) => (typeof t === 'string' ? t.toLowerCase() : t.tableName?.toLowerCase()));
  return normalizedTables.includes(tableName.toLowerCase());
};

const describeTableIfExists = async (queryInterface, tableName) => {
  const exists = await tableExists(queryInterface, tableName);
  if (!exists) {
    return null;
  }
  return queryInterface.describeTable(tableName);
};

const columnExists = (tableDefinition, columnName) => {
  if (!tableDefinition) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(tableDefinition, columnName);
};

const addColumnIfMissing = async (queryInterface, tableName, columnName, columnDefinition) => {
  const tableDefinition = await describeTableIfExists(queryInterface, tableName);
  if (!tableDefinition) {
    return;
  }
  if (!columnExists(tableDefinition, columnName)) {
    await queryInterface.addColumn(tableName, columnName, columnDefinition);
  }
};

const removeColumnIfExists = async (queryInterface, tableName, columnName) => {
  const tableDefinition = await describeTableIfExists(queryInterface, tableName);
  if (!tableDefinition) {
    return;
  }
  if (columnExists(tableDefinition, columnName)) {
    await queryInterface.removeColumn(tableName, columnName);
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make BOM and Sales Order optional in GRN
    // This allows GRN creation directly from PO without BOM
    const tableDefinition = await describeTableIfExists(queryInterface, 'GoodsReceiptNotes');
    
    if (tableDefinition && columnExists(tableDefinition, 'bill_of_materials_id')) {
      await queryInterface.changeColumn('GoodsReceiptNotes', 'bill_of_materials_id', {
        type: Sequelize.INTEGER,
        allowNull: true, // Changed from false to true
        references: {
          model: 'BillOfMaterials',
          key: 'id'
        }
      });
    }

    if (tableDefinition && columnExists(tableDefinition, 'sales_order_id')) {
      await queryInterface.changeColumn('GoodsReceiptNotes', 'sales_order_id', {
        type: Sequelize.INTEGER,
        allowNull: true, // Changed from false to true
        references: {
          model: 'SalesOrders',
          key: 'id'
        }
      });
    }

    // Add new fields for verification workflow
    await addColumnIfMissing(queryInterface, 'GoodsReceiptNotes', 'verification_status', {
      type: Sequelize.ENUM('pending', 'verified', 'discrepancy', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    });

    await addColumnIfMissing(queryInterface, 'GoodsReceiptNotes', 'verified_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await addColumnIfMissing(queryInterface, 'GoodsReceiptNotes', 'verification_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await addColumnIfMissing(queryInterface, 'GoodsReceiptNotes', 'verification_notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await addColumnIfMissing(queryInterface, 'GoodsReceiptNotes', 'discrepancy_details', {
      type: Sequelize.JSON,
      allowNull: true,
      // Structure: { qty_mismatch: true, weight_mismatch: false, quality_issue: false, details: '...' }
    });

    await addColumnIfMissing(queryInterface, 'GoodsReceiptNotes', 'discrepancy_approved_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await addColumnIfMissing(queryInterface, 'GoodsReceiptNotes', 'discrepancy_approval_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await addColumnIfMissing(queryInterface, 'GoodsReceiptNotes', 'discrepancy_approval_notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await addColumnIfMissing(queryInterface, 'GoodsReceiptNotes', 'inventory_added', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await addColumnIfMissing(queryInterface, 'GoodsReceiptNotes', 'inventory_added_date', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove new columns
    await removeColumnIfExists(queryInterface, 'GoodsReceiptNotes', 'verification_status');
    await removeColumnIfExists(queryInterface, 'GoodsReceiptNotes', 'verified_by');
    await removeColumnIfExists(queryInterface, 'GoodsReceiptNotes', 'verification_date');
    await removeColumnIfExists(queryInterface, 'GoodsReceiptNotes', 'verification_notes');
    await removeColumnIfExists(queryInterface, 'GoodsReceiptNotes', 'discrepancy_details');
    await removeColumnIfExists(queryInterface, 'GoodsReceiptNotes', 'discrepancy_approved_by');
    await removeColumnIfExists(queryInterface, 'GoodsReceiptNotes', 'discrepancy_approval_date');
    await removeColumnIfExists(queryInterface, 'GoodsReceiptNotes', 'discrepancy_approval_notes');
    await removeColumnIfExists(queryInterface, 'GoodsReceiptNotes', 'inventory_added');
    await removeColumnIfExists(queryInterface, 'GoodsReceiptNotes', 'inventory_added_date');

    // Revert BOM and SO to required
    const tableDefinition = await describeTableIfExists(queryInterface, 'GoodsReceiptNotes');
    
    if (tableDefinition && columnExists(tableDefinition, 'bill_of_materials_id')) {
      await queryInterface.changeColumn('GoodsReceiptNotes', 'bill_of_materials_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'BillOfMaterials',
          key: 'id'
        }
      });
    }

    if (tableDefinition && columnExists(tableDefinition, 'sales_order_id')) {
      await queryInterface.changeColumn('GoodsReceiptNotes', 'sales_order_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SalesOrders',
          key: 'id'
        }
      });
    }
  }
};