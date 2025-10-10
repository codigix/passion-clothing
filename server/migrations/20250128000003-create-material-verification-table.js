'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('material_verifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      verification_number: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
        comment: 'Format: MRN-VRF-YYYYMMDD-XXXXX'
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
      receipt_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'material_receipts',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Reference to the receipt record'
      },
      project_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Project name for this verification'
      },
      verification_checklist: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of materials with QC checklist'
      },
      overall_result: {
        type: Sequelize.ENUM('passed', 'failed', 'partial'),
        allowNull: false,
        comment: 'Overall verification result'
      },
      issues_found: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of issues'
      },
      verification_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notes from QC inspector'
      },
      verification_photos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of photo URLs for verification evidence'
      },
      verified_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'QC user who verified the materials'
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Date and time of verification'
      },
      approval_status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        comment: 'Manager approval status'
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

    await queryInterface.addIndex('material_verifications', ['verification_number'], {
      unique: true,
      name: 'idx_material_verifications_verification_number'
    });
    await queryInterface.addIndex('material_verifications', ['mrn_request_id'], {
      name: 'idx_material_verifications_mrn_request_id'
    });
    await queryInterface.addIndex('material_verifications', ['receipt_id'], {
      name: 'idx_material_verifications_receipt_id'
    });
    await queryInterface.addIndex('material_verifications', ['overall_result'], {
      name: 'idx_material_verifications_overall_result'
    });
    await queryInterface.addIndex('material_verifications', ['approval_status'], {
      name: 'idx_material_verifications_approval_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('material_verifications');
  }
};