'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `ALTER TABLE challans DROP FOREIGN KEY challans_ibfk_1;`,
        { transaction }
      );
      await transaction.commit();
      console.log('✅ Dropped foreign key constraint on challans.order_id');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `ALTER TABLE challans ADD CONSTRAINT challans_ibfk_1 FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE SET NULL ON UPDATE CASCADE;`,
        { transaction }
      );
      await transaction.commit();
      console.log('✅ Re-added foreign key constraint on challans.order_id');
    } catch (error) {
      await transaction.rollback();
      console.error('Rollback error:', error);
      throw error;
    }
  }
};
