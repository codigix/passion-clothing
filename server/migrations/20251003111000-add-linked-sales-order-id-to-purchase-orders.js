"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("purchase_orders", "linked_sales_order_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "sales_orders",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("purchase_orders", "linked_sales_order_id");
  }
};
