'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add customization fields to production_stages table
    await queryInterface.addColumn('production_stages', 'is_printing', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this stage involves printing'
    });

    await queryInterface.addColumn('production_stages', 'is_embroidery', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this stage involves embroidery'
    });

    await queryInterface.addColumn('production_stages', 'customization_type', {
      type: Sequelize.ENUM('none', 'printing', 'embroidery', 'both'),
      defaultValue: 'none',
      comment: 'Type of customization for this stage'
    });

    // Add indexes
    await queryInterface.addIndex('production_stages', ['is_printing']);
    await queryInterface.addIndex('production_stages', ['is_embroidery']);
    await queryInterface.addIndex('production_stages', ['customization_type']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('production_stages', ['customization_type']);
    await queryInterface.removeIndex('production_stages', ['is_embroidery']);
    await queryInterface.removeIndex('production_stages', ['is_printing']);

    // Remove columns
    await queryInterface.removeColumn('production_stages', 'customization_type');
    await queryInterface.removeColumn('production_stages', 'is_embroidery');
    await queryInterface.removeColumn('production_stages', 'is_printing');
  }
};