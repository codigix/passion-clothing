'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('purchase_orders', 'customer_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Customer for independent purchase orders'
    });

    await queryInterface.addColumn('purchase_orders', 'project_name', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Project name for the purchase order'
    });

    // Add index for customer_id
    await queryInterface.addIndex('purchase_orders', ['customer_id'], {
      name: 'idx_purchase_orders_customer_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('purchase_orders', 'idx_purchase_orders_customer_id');
    await queryInterface.removeColumn('purchase_orders', 'project_name');
    await queryInterface.removeColumn('purchase_orders', 'customer_id');
  }
};