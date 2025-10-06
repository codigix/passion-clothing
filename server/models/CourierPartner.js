const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CourierPartner = sequelize.define('CourierPartner', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Short code for the courier partner'
    },
    contact_person: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    service_areas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of service areas/cities'
    },
    services_offered: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of services like Express, COD, etc.'
    },
    pricing_structure: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Pricing details for different services'
    },
    api_endpoint: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'API endpoint for tracking integration'
    },
    api_key: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'API key for tracking integration'
    },
    tracking_url_template: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL template for tracking with {tracking_number} placeholder'
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true,
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 5.0
      }
    },
    on_time_delivery_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Percentage of on-time deliveries'
    },
    average_delivery_time: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Average delivery time in days'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    contract_start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    contract_end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    payment_terms: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'courier_partners',
    indexes: [
      { fields: ['name'] },
      { fields: ['code'] },
      { fields: ['is_active'] },
      { fields: ['rating'] },
      { fields: ['on_time_delivery_rate'] }
    ]
  });

  return CourierPartner;
};