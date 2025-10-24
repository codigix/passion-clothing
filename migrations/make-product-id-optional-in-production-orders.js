/**
 * Migration: Make product_id optional in production_orders
 * 
 * This migration makes product_id nullable because materials are now fetched
 * directly from Material Request Numbers (MRN) and Sales Orders instead of 
 * requiring a product selection.
 */

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 Making product_id nullable in production_orders...');
      
      // Change product_id to allow NULL values
      await queryInterface.changeColumn(
        'production_orders',
        'product_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'products',
            key: 'id'
          },
          comment: 'Product ID (optional - materials fetched from MRN/Sales Order instead)'
        },
        { transaction }
      );

      console.log('✅ product_id is now optional');
      await transaction.commit();
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 Reverting product_id to NOT NULL in production_orders...');
      
      // Revert product_id to NOT NULL
      await queryInterface.changeColumn(
        'production_orders',
        'product_id',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          }
        },
        { transaction }
      );

      console.log('✅ Rollback completed successfully');
      await transaction.commit();
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};