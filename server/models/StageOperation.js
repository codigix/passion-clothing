const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StageOperation = sequelize.define('StageOperation', {
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
    operation_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Name of the operation'
    },
    operation_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Order of operation within the stage'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detailed description of the operation'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'skipped', 'failed'),
      defaultValue: 'pending'
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    quantity_processed: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    quantity_approved: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    quantity_rejected: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    machine_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Machine or equipment used'
    },
    is_outsourced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this operation is outsourced to a vendor'
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id'
      },
      comment: 'Vendor ID if outsourced'
    },
    challan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'challans',
        key: 'id'
      },
      comment: 'Outward challan associated with outsourcing'
    },
    return_challan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'challans',
        key: 'id'
      },
      comment: 'Return challan when goods are received back'
    },
    outsourcing_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Cost for outsourced operation'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of photo URLs and metadata captured during operation'
    }
  }, {
    tableName: 'stage_operations',
    underscored: true,
    indexes: [
      { fields: ['production_stage_id'] },
      { fields: ['status'] },
      { fields: ['assigned_to'] },
      { fields: ['operation_order'] },
      { fields: ['is_outsourced'] },
      { fields: ['vendor_id'] }
    ]
  });

  return StageOperation;
};