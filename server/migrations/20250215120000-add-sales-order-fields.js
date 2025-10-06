'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sales_orders', 'buyer_reference', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Buyer Reference / Style Reference'
    });

    await queryInterface.addColumn('sales_orders', 'order_type', {
      type: Sequelize.ENUM('Knitted', 'Woven', 'Embroidery', 'Printing'),
      allowNull: true,
      comment: 'Type of order: Knitted/Woven/Embroidery/Printing'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sales_orders', 'order_type');
    await queryInterface.removeColumn('sales_orders', 'buyer_reference');
  }
};