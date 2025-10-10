const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QualityCheckpoint = sequelize.define('QualityCheckpoint', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    production_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'production_orders',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    production_stage_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'production_stages',
        key: 'id'
      },
      onDelete: 'SET NULL',
      comment: 'Optional: Link checkpoint to specific stage'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Checkpoint name/title'
    },
    frequency: {
      type: DataTypes.ENUM('per_batch', 'per_unit', 'per_stage', 'hourly', 'daily', 'final'),
      allowNull: false,
      defaultValue: 'per_batch'
    },
    acceptance_criteria: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'What makes this checkpoint pass'
    },
    checkpoint_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Order in which checkpoints should be performed'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'passed', 'failed', 'skipped'),
      defaultValue: 'pending'
    },
    checked_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    checked_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Actual results/observations'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'quality_checkpoints',
    indexes: [
      { fields: ['production_order_id'] },
      { fields: ['production_stage_id'] },
      { fields: ['status'] },
      { fields: ['frequency'] },
      { fields: ['checked_by'] }
    ]
  });

  return QualityCheckpoint;
};