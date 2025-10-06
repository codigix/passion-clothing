const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vendor = sequelize.define('Vendor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    vendor_code: {
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
    address: {
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
    vendor_type: {
      type: DataTypes.ENUM('material_supplier', 'outsource_partner', 'service_provider', 'both'),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('fabric', 'accessories', 'embroidery', 'printing', 'stitching', 'finishing', 'transport', 'other'),
      allowNull: true
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
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 5
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blacklisted'),
      defaultValue: 'active'
    },
    bank_details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Bank account details for payments'
    },
    documents: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Uploaded documents like GST certificate, PAN, etc.'
    },
    specializations: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'List of specializations or services offered'
    },
    quality_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
    },
    delivery_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
    },
    price_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
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
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'vendors',
    indexes: [
      { fields: ['vendor_code'] },
      { fields: ['name'] },
      { fields: ['vendor_type'] },
      { fields: ['category'] },
      { fields: ['status'] },
      { fields: ['rating'] },
      { fields: ['city'] },
      { fields: ['state'] }
    ]
  });

  return Vendor;
};