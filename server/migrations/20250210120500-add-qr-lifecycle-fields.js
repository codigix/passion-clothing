'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.addColumn('product_lifecycle', 'qr_token', {
    //   type: Sequelize.STRING(120),
    //   allowNull: true,
    //   unique: true,
    //   comment: 'Unique token for lifecycle QR identification'
    // });

    await queryInterface.addColumn('product_lifecycle', 'qr_payload', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Latest serialized payload embedded in lifecycle QR'
    });

    await queryInterface.addColumn('product_lifecycle', 'qr_status', {
      type: Sequelize.ENUM('pending', 'active', 'revoked', 'expired'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Lifecycle QR availability state'
    });

    await queryInterface.addColumn('product_lifecycle', 'qr_generated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of last QR generation'
    });

    await queryInterface.addColumn('product_lifecycle', 'qr_last_scanned_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of most recent QR scan event'
    });

    await queryInterface.addColumn('product_lifecycle', 'qr_scan_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total number of scans recorded for this lifecycle QR'
    });

    await queryInterface.addColumn('sales_orders', 'has_lifecycle_qr', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates whether lifecycle QR tracking is enabled for the order'
    });

    await queryInterface.addColumn('sales_orders', 'lifecycle_qr_token', {
      type: Sequelize.STRING(120),
      allowNull: true,
      unique: true,
      comment: 'Latest lifecycle QR token linked to the order'
    });

    await queryInterface.addColumn('sales_orders', 'lifecycle_qr_status', {
      type: Sequelize.ENUM('pending', 'active', 'revoked', 'expired'),
      allowNull: true,
      comment: 'Lifecycle QR status scope at the order level'
    });

    await queryInterface.addColumn('sales_orders', 'lifecycle_qr_generated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of the most recent lifecycle QR generation for the order'
    });

    await queryInterface.addColumn('sales_orders', 'lifecycle_qr_last_scanned_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Last scan timestamp tracked at the order level'
    });

    await queryInterface.addColumn('sales_orders', 'lifecycle_qr_scan_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total lifecycle QR scans aggregated for the order'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('product_lifecycle', 'qr_scan_count');
    await queryInterface.removeColumn('product_lifecycle', 'qr_last_scanned_at');
    await queryInterface.removeColumn('product_lifecycle', 'qr_generated_at');
    await queryInterface.removeColumn('product_lifecycle', 'qr_status');
    await queryInterface.removeColumn('product_lifecycle', 'qr_payload');
    await queryInterface.removeColumn('product_lifecycle', 'qr_token');

    await queryInterface.removeColumn('sales_orders', 'lifecycle_qr_scan_count');
    await queryInterface.removeColumn('sales_orders', 'lifecycle_qr_last_scanned_at');
    await queryInterface.removeColumn('sales_orders', 'lifecycle_qr_generated_at');
    await queryInterface.removeColumn('sales_orders', 'lifecycle_qr_status');
    await queryInterface.removeColumn('sales_orders', 'lifecycle_qr_token');
    await queryInterface.removeColumn('sales_orders', 'has_lifecycle_qr');
  }
};