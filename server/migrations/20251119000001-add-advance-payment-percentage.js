module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('purchase_orders', 'advance_payment_percentage', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: null,
      comment: 'Advance payment requirement percentage extracted from payment terms (e.g., 50 for 50% advance)'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('purchase_orders', 'advance_payment_percentage');
  }
};
