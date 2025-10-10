'use strict';

const columnExists = async (queryInterface, tableName, columnName) => {
  const tableDefinition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(tableDefinition, columnName);
};

const addColumnIfMissing = async (queryInterface, tableName, columnName, columnDefinition) => {
  const exists = await columnExists(queryInterface, tableName, columnName);
  if (!exists) {
    await queryInterface.addColumn(tableName, columnName, columnDefinition);
  }
};

const removeColumnIfPresent = async (queryInterface, tableName, columnName) => {
  const exists = await columnExists(queryInterface, tableName, columnName);
  if (exists) {
    await queryInterface.removeColumn(tableName, columnName);
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await addColumnIfMissing(queryInterface, 'product_lifecycle', 'qr_payload', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Latest serialized payload embedded in lifecycle QR'
    });

    await addColumnIfMissing(queryInterface, 'product_lifecycle', 'qr_status', {
      type: Sequelize.ENUM('pending', 'active', 'revoked', 'expired'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Lifecycle QR availability state'
    });

    await addColumnIfMissing(queryInterface, 'product_lifecycle', 'qr_generated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of last QR generation'
    });

    await addColumnIfMissing(queryInterface, 'product_lifecycle', 'qr_last_scanned_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of most recent QR scan event'
    });

    await addColumnIfMissing(queryInterface, 'product_lifecycle', 'qr_scan_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total number of scans recorded for this lifecycle QR'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'has_lifecycle_qr', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates whether lifecycle QR tracking is enabled for the order'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'lifecycle_qr_token', {
      type: Sequelize.STRING(120),
      allowNull: true,
      unique: true,
      comment: 'Latest lifecycle QR token linked to the order'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'lifecycle_qr_status', {
      type: Sequelize.ENUM('pending', 'active', 'revoked', 'expired'),
      allowNull: true,
      comment: 'Lifecycle QR status scope at the order level'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'lifecycle_qr_generated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of the most recent lifecycle QR generation for the order'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'lifecycle_qr_last_scanned_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Last scan timestamp tracked at the order level'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'lifecycle_qr_scan_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total lifecycle QR scans aggregated for the order'
    });
  },

  down: async (queryInterface) => {
    await removeColumnIfPresent(queryInterface, 'sales_orders', 'lifecycle_qr_scan_count');
    await removeColumnIfPresent(queryInterface, 'sales_orders', 'lifecycle_qr_last_scanned_at');
    await removeColumnIfPresent(queryInterface, 'sales_orders', 'lifecycle_qr_generated_at');
    await removeColumnIfPresent(queryInterface, 'sales_orders', 'lifecycle_qr_status');
    await removeColumnIfPresent(queryInterface, 'sales_orders', 'lifecycle_qr_token');
    await removeColumnIfPresent(queryInterface, 'sales_orders', 'has_lifecycle_qr');

    await removeColumnIfPresent(queryInterface, 'product_lifecycle', 'qr_scan_count');
    await removeColumnIfPresent(queryInterface, 'product_lifecycle', 'qr_last_scanned_at');
    await removeColumnIfPresent(queryInterface, 'product_lifecycle', 'qr_generated_at');
    await removeColumnIfPresent(queryInterface, 'product_lifecycle', 'qr_status');
    await removeColumnIfPresent(queryInterface, 'product_lifecycle', 'qr_payload');
  }
};