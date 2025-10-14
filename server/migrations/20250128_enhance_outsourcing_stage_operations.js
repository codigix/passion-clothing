// Migration to enhance stage_operations table with additional outsourcing fields
// Note: is_outsourced, vendor_id, outsource_cost already exist

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔧 Adding enhanced outsourcing columns to stage_operations...');
    
    // Add new columns (only the ones that don't exist)
    await queryInterface.addColumn('stage_operations', 'work_order_number', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Unique work order number for vendor tracking'
    });
    
    await queryInterface.addColumn('stage_operations', 'expected_completion_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Expected date for vendor to complete work'
    });
    
    await queryInterface.addColumn('stage_operations', 'actual_completion_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Actual date when work was received from vendor'
    });
    
    await queryInterface.addColumn('stage_operations', 'design_files', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of design file URLs and metadata'
    });
    
    await queryInterface.addColumn('stage_operations', 'vendor_remarks', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Communication notes with vendor'
    });
    
    await queryInterface.addColumn('stage_operations', 'outsourced_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when sent to vendor'
    });
    
    await queryInterface.addColumn('stage_operations', 'received_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when received from vendor'
    });
    
    // Update status enum to include 'outsourced' and 'received'
    console.log('🔧 Updating status enum...');
    await queryInterface.sequelize.query(`
      ALTER TABLE stage_operations 
      MODIFY COLUMN status 
      ENUM('pending', 'in_progress', 'completed', 'skipped', 'failed', 'outsourced', 'received') 
      DEFAULT 'pending'
    `);
    
    // Add indexes for performance
    console.log('🔧 Adding indexes...');
    await queryInterface.addIndex('stage_operations', ['work_order_number'], {
      name: 'idx_work_order_number'
    });
    
    await queryInterface.addIndex('stage_operations', ['expected_completion_date'], {
      name: 'idx_expected_completion'
    });
    
    console.log('✅ Enhanced outsourcing columns added successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Rolling back enhanced outsourcing columns...');
    
    // Remove indexes
    await queryInterface.removeIndex('stage_operations', 'idx_work_order_number');
    await queryInterface.removeIndex('stage_operations', 'idx_expected_completion');
    
    // Remove columns
    await queryInterface.removeColumn('stage_operations', 'work_order_number');
    await queryInterface.removeColumn('stage_operations', 'expected_completion_date');
    await queryInterface.removeColumn('stage_operations', 'actual_completion_date');
    await queryInterface.removeColumn('stage_operations', 'design_files');
    await queryInterface.removeColumn('stage_operations', 'vendor_remarks');
    await queryInterface.removeColumn('stage_operations', 'outsourced_at');
    await queryInterface.removeColumn('stage_operations', 'received_at');
    
    // Revert status enum
    await queryInterface.sequelize.query(`
      ALTER TABLE stage_operations 
      MODIFY COLUMN status 
      ENUM('pending', 'in_progress', 'completed', 'skipped', 'failed') 
      DEFAULT 'pending'
    `);
    
    console.log('✅ Rollback complete!');
  }
};