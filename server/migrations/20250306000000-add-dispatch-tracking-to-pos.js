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
    await addColumnIfMissing(queryInterface, 'purchase_orders', 'dispatched_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date when vendor dispatched the materials'
    });

    await addColumnIfMissing(queryInterface, 'purchase_orders', 'dispatch_tracking_number', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Tracking number provided by vendor/courier'
    });

    await addColumnIfMissing(queryInterface, 'purchase_orders', 'dispatch_courier_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Courier/Transporter name used for dispatch'
    });

    await addColumnIfMissing(queryInterface, 'purchase_orders', 'dispatch_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Additional notes about dispatch'
    });

    await addColumnIfMissing(queryInterface, 'purchase_orders', 'expected_arrival_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Expected date of arrival at warehouse (can differ from expected_delivery_date)'
    });

    await addColumnIfMissing(queryInterface, 'purchase_orders', 'dispatched_by_user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who marked the PO as dispatched'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await removeColumnIfExists(queryInterface, 'purchase_orders', 'dispatched_at');
    await removeColumnIfExists(queryInterface, 'purchase_orders', 'dispatch_tracking_number');
    await removeColumnIfExists(queryInterface, 'purchase_orders', 'dispatch_courier_name');
    await removeColumnIfExists(queryInterface, 'purchase_orders', 'dispatch_notes');
    await removeColumnIfExists(queryInterface, 'purchase_orders', 'expected_arrival_date');
    await removeColumnIfExists(queryInterface, 'purchase_orders', 'dispatched_by_user_id');
  }
};