const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Approval = sequelize.define('Approval', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Type of entity tied to this approval (sales_order, purchase_order, etc.)'
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Identifier of the entity requiring approval'
    },
    stage_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Stable key identifying the approval stage'
    },
    stage_label: {
      type: DataTypes.STRING(120),
      allowNull: false,
      comment: 'Human readable label for the stage'
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Ordering of the stage within the workflow'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'approved', 'rejected', 'skipped', 'canceled'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Current status of this approval stage'
    },
    assigned_to_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Specific user responsible for this stage (if applicable)'
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who issued the decision for this stage'
    },
    decision_note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reviewer notes captured at decision time'
    },
    decided_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the decision was recorded'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Serialized data for workflow orchestration'
    },
    due_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Optional due date for this approval stage'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who created the approval record'
    }
  }, {
    tableName: 'approvals',
    underscored: true,
    indexes: [
      { fields: ['entity_type', 'entity_id', 'sequence'] },
      { fields: ['status'] },
      { fields: ['assigned_to_user_id'] }
    ]
  });

  return Approval;
};