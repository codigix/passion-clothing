'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column already exists to avoid errors
    const tableDescription = await queryInterface.describeTable('purchase_orders');

    if (!tableDescription.materials_source) {
      await queryInterface.addColumn('purchase_orders', 'materials_source', {
        type: Sequelize.ENUM('sales_order', 'bill_of_materials', 'manual'),
        allowNull: true,
        defaultValue: null
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('purchase_orders', 'materials_source');
  }
};