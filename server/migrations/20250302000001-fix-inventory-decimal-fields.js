'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Change INTEGER fields to DECIMAL(10,2) for better precision with fabric quantities
      await queryInterface.changeColumn('inventory', 'current_stock', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Current stock quantity (can be decimal for fabrics)'
      });

      await queryInterface.changeColumn('inventory', 'reserved_stock', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Stock reserved for orders'
      });

      await queryInterface.changeColumn('inventory', 'available_stock', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'current_stock - reserved_stock'
      });

      await queryInterface.changeColumn('inventory', 'minimum_level', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      });

      await queryInterface.changeColumn('inventory', 'maximum_level', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      });

      await queryInterface.changeColumn('inventory', 'reorder_level', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      });

      await queryInterface.changeColumn('inventory', 'audit_variance', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Difference found during last audit'
      });

      console.log('✅ Successfully updated inventory decimal fields');
    } catch (error) {
      console.error('❌ Error updating inventory decimal fields:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Revert back to INTEGER
      await queryInterface.changeColumn('inventory', 'current_stock', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      });

      await queryInterface.changeColumn('inventory', 'reserved_stock', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      });

      await queryInterface.changeColumn('inventory', 'available_stock', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      });

      await queryInterface.changeColumn('inventory', 'minimum_level', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      });

      await queryInterface.changeColumn('inventory', 'maximum_level', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      });

      await queryInterface.changeColumn('inventory', 'reorder_level', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      });

      await queryInterface.changeColumn('inventory', 'audit_variance', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      });

      console.log('✅ Successfully reverted inventory decimal fields to integer');
    } catch (error) {
      console.error('❌ Error reverting inventory fields:', error);
      throw error;
    }
  }
};