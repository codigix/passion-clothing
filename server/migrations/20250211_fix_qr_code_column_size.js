'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change qr_code column from VARCHAR(255) to TEXT to accommodate large JSON data
    await queryInterface.changeColumn('sales_orders', 'qr_code', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'QR code data containing comprehensive order information'
    });
    
    console.log('✅ QR code column expanded to TEXT');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to VARCHAR(255) - may cause data truncation!
    await queryInterface.changeColumn('sales_orders', 'qr_code', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'QR code data containing order information'
    });
    
    console.log('⚠️  QR code column reverted to VARCHAR(255)');
  }
};