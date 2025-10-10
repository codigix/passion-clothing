'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('material_dispatches', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      dispatch_number: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
        comment: 'Format: DSP-YYYYMMDD-XXXXX'
      },
      mrn_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'project_material_requests',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Reference to the MRN request'
      },
      project_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Project name for this dispatch'
      },
      dispatched_materials: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of materials dispatched'
      },
      total_items: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total number of material items dispatched'
      },
      dispatch_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notes about the dispatch'
      },
      dispatch_photos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of photo URLs for dispatch evidence'
      },
      dispatch_slip_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL of generated dispatch slip PDF'
      },
      dispatched_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Inventory user who dispatched the materials'
      },
      dispatched_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Date and time of dispatch'
      },
      received_status: {
        type: Sequelize.ENUM('pending', 'received', 'partial', 'discrepancy'),
        defaultValue: 'pending',
        comment: 'Whether materials have been received by manufacturing'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('material_dispatches', ['dispatch_number'], {
      unique: true,
      name: 'idx_material_dispatches_dispatch_number'
    });
    await queryInterface.addIndex('material_dispatches', ['mrn_request_id'], {
      name: 'idx_material_dispatches_mrn_request_id'
    });
    await queryInterface.addIndex('material_dispatches', ['dispatched_by'], {
      name: 'idx_material_dispatches_dispatched_by'
    });
    await queryInterface.addIndex('material_dispatches', ['received_status'], {
      name: 'idx_material_dispatches_received_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('material_dispatches');
  }
};