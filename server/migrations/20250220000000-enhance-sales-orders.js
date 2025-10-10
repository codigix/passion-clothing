'use strict';

// Helper functions to safely add/remove columns and indexes
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

const addIndexIfMissing = async (queryInterface, tableName, fields, options = {}) => {
  const exists = await tableExists(queryInterface, tableName);
  if (!exists) {
    return;
  }

  const indexes = await queryInterface.showIndex(tableName);
  const indexName = options?.name || `${tableName}_${fields.join('_')}`;

  if (indexes.some((index) => index.name === indexName)) {
    return;
  }

  await queryInterface.addIndex(tableName, fields, options);
};

const removeIndexIfExists = async (queryInterface, tableName, indexNameOrFields) => {
  const exists = await tableExists(queryInterface, tableName);
  if (!exists) {
    return;
  }

  const indexes = await queryInterface.showIndex(tableName);
  const indexName = Array.isArray(indexNameOrFields) 
    ? `${tableName}_${indexNameOrFields.join('_')}`
    : indexNameOrFields;

  if (indexes.some((index) => index.name === indexName)) {
    await queryInterface.removeIndex(tableName, indexName);
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns for enhanced sales order functionality
    await addColumnIfMissing(queryInterface, 'sales_orders', 'advance_paid', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Advance payment received from customer'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'balance_amount', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Remaining balance to be paid'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'invoice_status', {
      type: Sequelize.ENUM('pending', 'generated', 'sent', 'paid', 'overdue'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Invoice generation and payment status'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'challan_status', {
      type: Sequelize.ENUM('pending', 'created', 'dispatched', 'delivered'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Delivery challan status'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'procurement_status', {
      type: Sequelize.ENUM('not_requested', 'requested', 'po_created', 'materials_ordered', 'materials_received', 'completed'),
      allowNull: false,
      defaultValue: 'not_requested',
      comment: 'Procurement workflow status'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'design_files', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of uploaded design/logo/artwork files'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'invoice_number', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Generated invoice number'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'invoice_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Invoice generation date'
    });

    // Add indexes for new columns
    await addIndexIfMissing(queryInterface, 'sales_orders', ['invoice_status']);
    await addIndexIfMissing(queryInterface, 'sales_orders', ['challan_status']);
    await addIndexIfMissing(queryInterface, 'sales_orders', ['procurement_status']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await removeIndexIfExists(queryInterface, 'sales_orders', ['procurement_status']);
    await removeIndexIfExists(queryInterface, 'sales_orders', ['challan_status']);
    await removeIndexIfExists(queryInterface, 'sales_orders', ['invoice_status']);

    // Remove columns
    await removeColumnIfExists(queryInterface, 'sales_orders', 'invoice_date');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'invoice_number');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'design_files');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'procurement_status');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'challan_status');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'invoice_status');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'balance_amount');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'advance_paid');
  }
};