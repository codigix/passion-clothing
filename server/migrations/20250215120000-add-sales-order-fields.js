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
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, 'sales_orders', 'buyer_reference', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Buyer Reference / Style Reference'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'order_type', {
      type: Sequelize.ENUM('Knitted', 'Woven', 'Embroidery', 'Printing'),
      allowNull: true,
      comment: 'Type of order: Knitted/Woven/Embroidery/Printing'
    });
  },

  async down(queryInterface, Sequelize) {
    await removeColumnIfExists(queryInterface, 'sales_orders', 'order_type');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'buyer_reference');
  }
};