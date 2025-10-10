'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('material_receipts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      receipt_number: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
        comment: 'Format: MRN-RCV-YYYYMMDD-XXXXX'
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
      dispatch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'material_dispatches',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Reference to the dispatch record'
      },
      project_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Project name for this receipt'
      },
      received_materials: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of materials received'
      },
      total_items_received: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total number of material items received'
      },
      has_discrepancy: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether there are any discrepancies'
      },
      discrepancy_details: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of discrepancies'
      },
      receipt_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notes about the receipt'
      },
      receipt_photos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of photo URLs for receipt evidence'
      },
      received_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Manufacturing user who received the materials'
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Date and time of receipt'
      },
      verification_status: {
        type: Sequelize.ENUM('pending', 'verified', 'failed'),
        defaultValue: 'pending',
        comment: 'QC verification status'
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

    await queryInterface.addIndex('material_receipts', ['receipt_number'], {
      unique: true,
      name: 'idx_material_receipts_receipt_number'
    });
    await queryInterface.addIndex('material_receipts', ['mrn_request_id'], {
      name: 'idx_material_receipts_mrn_request_id'
    });
    await queryInterface.addIndex('material_receipts', ['dispatch_id'], {
      name: 'idx_material_receipts_dispatch_id'
    });
    await queryInterface.addIndex('material_receipts', ['received_by'], {
      name: 'idx_material_receipts_received_by'
    });
    await queryInterface.addIndex('material_receipts', ['verification_status'], {
      name: 'idx_material_receipts_verification_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('material_receipts');
  }
};