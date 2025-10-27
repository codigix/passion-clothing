/**
 * Migration: Add recipient_email to shipments table
 * 
 * This migration adds the recipient_email column to the shipments table
 * to store the email address of the recipient for shipment notifications.
 */

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 Adding recipient_email column to shipments table...');
      
      // Add recipient_email column
      await queryInterface.addColumn(
        'shipments',
        'recipient_email',
        {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: 'Email address of the shipment recipient'
        },
        { transaction }
      );

      console.log('✅ recipient_email column added successfully');
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
      console.log('🔧 Removing recipient_email column from shipments table...');
      
      // Remove recipient_email column
      await queryInterface.removeColumn(
        'shipments',
        'recipient_email',
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