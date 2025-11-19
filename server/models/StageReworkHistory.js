const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StageReworkHistory = sequelize.define('StageReworkHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    production_stage_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'production_stages',
        key: 'id'
      }
    },
    iteration_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Which rework iteration (1=original, 2=first rework, etc.)'
    },
    failure_reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Why this iteration failed QC'
    },
    failed_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Quantity that failed in this iteration'
    },
    rework_material_used: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Additional material consumed for rework'
    },
    additional_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Cost incurred for rework'
    },
    status: {
      type: DataTypes.ENUM('failed', 'in_progress', 'completed'),
      defaultValue: 'failed'
    },
    failed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'When this iteration failed'
    },
    failed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'stage_rework_history',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['production_stage_id'] },
      { fields: ['iteration_number'] },
      { fields: ['status'] },
      { fields: ['failed_at'] }
    ]
  });

  return StageReworkHistory;
};