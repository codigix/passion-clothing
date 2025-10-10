const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialVerification = sequelize.define('MaterialVerification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    verification_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: MRN-VRF-YYYYMMDD-XXXXX'
    },
    mrn_request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'project_material_requests',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Reference to the MRN request'
    },
    receipt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'material_receipts',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Reference to the receipt record'
    },
    project_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Project name for this verification'
    },
    verification_checklist: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of materials with QC checklist: material_name, material_code, quantity_received, correct_quantity (Y/N), good_quality (Y/N), specs_match (Y/N), no_damage (Y/N), barcode_valid (Y/N), inspection_result (pass/fail), remarks'
    },
    overall_result: {
      type: DataTypes.ENUM('passed', 'failed', 'partial'),
      allowNull: false,
      comment: 'Overall verification result'
    },
    issues_found: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of issues: material_name, issue_type, severity (minor/major/critical), description, action_required'
    },
    verification_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes from QC inspector'
    },
    verification_photos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of photo URLs for verification evidence'
    },
    verified_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'QC user who verified the materials'
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date and time of verification'
    },
    approval_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      comment: 'Manager approval status'
    }
  }, {
    tableName: 'material_verifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['verification_number'], unique: true },
      { fields: ['mrn_request_id'] },
      { fields: ['receipt_id'] },
      { fields: ['project_name'] },
      { fields: ['overall_result'] },
      { fields: ['verified_by'] },
      { fields: ['verified_at'] },
      { fields: ['approval_status'] }
    ]
  });

  return MaterialVerification;
};