'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add version history columns to purchase_orders table
      await queryInterface.addColumn('purchase_orders', 'version_number', {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: 'Current version number of the PO'
      });

      await queryInterface.addColumn('purchase_orders', 'change_history', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of all changes made to the PO with timestamps and user details'
      });

      await queryInterface.addColumn('purchase_orders', 'last_edited_by', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User ID of the person who last edited the PO'
      });

      await queryInterface.addColumn('purchase_orders', 'last_edited_at', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp of last edit'
      });

      await queryInterface.addColumn('purchase_orders', 'requires_reapproval', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Flag to indicate if PO requires re-approval after edits'
      });

      // Add index for version tracking
      await queryInterface.addIndex('purchase_orders', ['version_number']);
      await queryInterface.addIndex('purchase_orders', ['last_edited_at']);
      await queryInterface.addIndex('purchase_orders', ['requires_reapproval']);

      console.log('✅ Migration completed: PO version history fields added');
    } catch (error) {
      console.error('❌ Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('purchase_orders', 'version_number');
      await queryInterface.removeColumn('purchase_orders', 'change_history');
      await queryInterface.removeColumn('purchase_orders', 'last_edited_by');
      await queryInterface.removeColumn('purchase_orders', 'last_edited_at');
      await queryInterface.removeColumn('purchase_orders', 'requires_reapproval');
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback error:', error);
      throw error;
    }
  }
};