'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove dispatch tracking columns that are not needed
    await queryInterface.removeColumn('purchase_orders', 'dispatched_at');
    await queryInterface.removeColumn('purchase_orders', 'dispatch_tracking_number');
    await queryInterface.removeColumn('purchase_orders', 'dispatch_courier_name');
    await queryInterface.removeColumn('purchase_orders', 'dispatch_notes');
    await queryInterface.removeColumn('purchase_orders', 'expected_arrival_date');
    await queryInterface.removeColumn('purchase_orders', 'dispatched_by_user_id');
    
    console.log('✅ Removed dispatch tracking columns from purchase_orders table');
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add columns if we need to rollback
    await queryInterface.addColumn('purchase_orders', 'dispatched_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('purchase_orders', 'dispatch_tracking_number', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    
    await queryInterface.addColumn('purchase_orders', 'dispatch_courier_name', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    
    await queryInterface.addColumn('purchase_orders', 'dispatch_notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('purchase_orders', 'expected_arrival_date', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('purchase_orders', 'dispatched_by_user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });
    
    console.log('✅ Re-added dispatch tracking columns to purchase_orders table');
  }
};