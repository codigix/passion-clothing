/**
 * Migration: Add 'on_hold' status to sales_orders
 * 
 * This migration adds the missing 'on_hold' status to the sales_orders status ENUM.
 * This status is needed to properly track when a production order is paused.
 * 
 * Issue: When a production order is paused, it gets 'on_hold' status, and this
 * needs to be reflected in the linked sales_order, but the ENUM was missing this value.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 Adding "on_hold" status to sales_orders status ENUM...');
      
      // In MySQL, to modify an ENUM, we need to change the column definition
      await queryInterface.sequelize.query(`
        ALTER TABLE sales_orders 
        MODIFY COLUMN status ENUM(
          'draft',
          'confirmed',
          'bom_generated',
          'procurement_created',
          'materials_received',
          'in_production',
          'on_hold',
          'cutting_completed',
          'printing_completed',
          'stitching_completed',
          'finishing_completed',
          'qc_passed',
          'ready_to_ship',
          'shipped',
          'delivered',
          'completed',
          'cancelled'
        ) DEFAULT 'draft'
      `, { transaction });

      console.log('✅ Migration completed successfully');
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
      console.log('🔧 Removing "on_hold" status from sales_orders status ENUM...');
      
      // Revert to the original ENUM without 'on_hold'
      await queryInterface.sequelize.query(`
        ALTER TABLE sales_orders 
        MODIFY COLUMN status ENUM(
          'draft',
          'confirmed',
          'bom_generated',
          'procurement_created',
          'materials_received',
          'in_production',
          'cutting_completed',
          'printing_completed',
          'stitching_completed',
          'finishing_completed',
          'qc_passed',
          'ready_to_ship',
          'shipped',
          'delivered',
          'completed',
          'cancelled'
        ) DEFAULT 'draft'
      `, { transaction });

      console.log('✅ Rollback completed successfully');
      await transaction.commit();
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};