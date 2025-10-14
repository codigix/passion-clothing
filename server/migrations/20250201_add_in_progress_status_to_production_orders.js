module.exports = {
  up: async (queryInterface, Sequelize) => {
    // MySQL: Modify ENUM to add 'in_progress'
    await queryInterface.sequelize.query(`
      ALTER TABLE production_orders 
      MODIFY COLUMN status ENUM(
        'pending', 
        'in_progress', 
        'material_allocated', 
        'cutting', 
        'embroidery', 
        'stitching', 
        'finishing', 
        'quality_check', 
        'completed', 
        'on_hold', 
        'cancelled'
      ) DEFAULT 'pending'
    `);
    
    console.log('✅ Added "in_progress" status to production_orders.status ENUM');
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: Remove 'in_progress' from ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE production_orders 
      MODIFY COLUMN status ENUM(
        'pending', 
        'material_allocated', 
        'cutting', 
        'embroidery', 
        'stitching', 
        'finishing', 
        'quality_check', 
        'completed', 
        'on_hold', 
        'cancelled'
      ) DEFAULT 'pending'
    `);
    
    console.log('✅ Removed "in_progress" status from production_orders.status ENUM');
  }
};