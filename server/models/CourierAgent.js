const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CourierAgent = sequelize.define('CourierAgent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    agent_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Unique agent ID (e.g., COR-20250117-001)'
    },
    courier_company: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Courier company name'
    },
    agent_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Agent full name'
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Region/Territory covered by agent'
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Bcrypted password'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Active/Inactive status'
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Email verified status'
    },
    verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Email verification token'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    performance_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      comment: 'Average performance rating (0-5)'
    },
    total_shipments: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    on_time_deliveries: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    failed_deliveries: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  }, {
    tableName: 'courier_agents',
    timestamps: false
  });

  return CourierAgent;
};