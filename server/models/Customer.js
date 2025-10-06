const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customer_code: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    company_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    contact_person: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(50),
      defaultValue: 'India'
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    gst_number: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    pan_number: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    customer_type: {
      type: DataTypes.ENUM('individual', 'business', 'school', 'distributor', 'retailer'),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('regular', 'premium', 'vip', 'wholesale', 'retail'),
      defaultValue: 'regular'
    },
    payment_terms: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    credit_limit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    credit_days: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 5
      }
    },
    bank_details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Bank account details for refunds'
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Customer preferences, sizes, colors, etc.'
    },
    documents: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Uploaded documents'
    },
    last_order_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    total_orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    outstanding_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    loyalty_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    referral_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    referred_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      }
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
    tableName: 'customers',
    indexes: [
      { fields: ['customer_code'] },
      { fields: ['name'] },
      { fields: ['customer_type'] },
      { fields: ['category'] },
      { fields: ['status'] },
      { fields: ['city'] },
      { fields: ['state'] },
      { fields: ['email'] },
      { fields: ['phone'] }
    ]
  });

  return Customer;
};