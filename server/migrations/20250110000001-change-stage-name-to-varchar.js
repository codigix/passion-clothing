'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔧 Converting stage_name from ENUM to VARCHAR to support custom stages...');
    
    // Step 1: Add a temporary column
    await queryInterface.addColumn('production_stages', 'stage_name_temp', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    
    console.log('✓ Added temporary column');
    
    // Step 2: Copy data from old column to temp column
    await queryInterface.sequelize.query(`
      UPDATE production_stages 
      SET stage_name_temp = stage_name
    `);
    
    console.log('✓ Copied existing data');
    
    // Step 3: Drop the old ENUM column
    await queryInterface.removeColumn('production_stages', 'stage_name');
    
    console.log('✓ Removed old ENUM column');
    
    // Step 4: Rename temp column to stage_name
    await queryInterface.renameColumn('production_stages', 'stage_name_temp', 'stage_name');
    
    console.log('✓ Renamed temp column to stage_name');
    
    // Step 5: Make it NOT NULL now
    await queryInterface.changeColumn('production_stages', 'stage_name', {
      type: Sequelize.STRING(100),
      allowNull: false
    });
    
    console.log('✓ Set stage_name as NOT NULL');
    
    // Step 6: Add index on stage_name for performance
    await queryInterface.addIndex('production_stages', ['stage_name'], {
      name: 'idx_production_stages_stage_name'
    });
    
    console.log('✅ Migration complete! stage_name is now VARCHAR(100) and supports custom values');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Reverting stage_name back to ENUM...');
    
    // Remove index
    await queryInterface.removeIndex('production_stages', 'idx_production_stages_stage_name');
    
    // Add temp column with ENUM
    await queryInterface.addColumn('production_stages', 'stage_name_temp', {
      type: Sequelize.ENUM(
        'material_allocation', 'cutting', 'embroidery', 'printing',
        'stitching', 'finishing', 'ironing', 'packing', 'quality_check'
      ),
      allowNull: true
    });
    
    // Try to copy data back (only values that match ENUM)
    await queryInterface.sequelize.query(`
      UPDATE production_stages 
      SET stage_name_temp = CASE
        WHEN stage_name IN ('material_allocation', 'cutting', 'embroidery', 'printing',
                           'stitching', 'finishing', 'ironing', 'packing', 'quality_check')
        THEN stage_name
        ELSE 'cutting'  -- Default fallback for custom values
      END
    `);
    
    // Drop VARCHAR column
    await queryInterface.removeColumn('production_stages', 'stage_name');
    
    // Rename temp back to stage_name
    await queryInterface.renameColumn('production_stages', 'stage_name_temp', 'stage_name');
    
    // Make NOT NULL
    await queryInterface.changeColumn('production_stages', 'stage_name', {
      type: Sequelize.ENUM(
        'material_allocation', 'cutting', 'embroidery', 'printing',
        'stitching', 'finishing', 'ironing', 'packing', 'quality_check'
      ),
      allowNull: false
    });
    
    console.log('✅ Reverted to ENUM');
  }
};