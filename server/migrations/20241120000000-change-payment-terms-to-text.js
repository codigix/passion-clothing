'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Change payment_terms from VARCHAR(100) to TEXT
      await queryInterface.changeColumn('purchase_orders', 'payment_terms', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Revert payment_terms back to VARCHAR(100)
      await queryInterface.changeColumn('purchase_orders', 'payment_terms', {
        type: Sequelize.STRING(100),
        allowNull: true
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};