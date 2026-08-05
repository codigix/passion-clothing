const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Quotation = sequelize.define('Quotation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quotation_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: QT-YYYYMMDD-XXXX'
    },
    client_requirement_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow nullable if generated outside client requirements or for vendor side
      references: {
        model: 'client_requirements',
        key: 'id'
      }
    },
    rfq_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    rfq_version: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    quotation_type: {
      type: DataTypes.ENUM('Sent', 'Received'),
      allowNull: false,
      defaultValue: 'Sent'
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id'
      }
    },
    vendor_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    customer_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    product_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    tax_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 18.00 // Default GST
    },
    tax_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    final_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'Draft'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'V1'
    },
    revision_history: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    tableName: 'quotations',
    indexes: [
      { fields: ['quotation_number'] },
      { fields: ['client_requirement_id'] },
      { fields: ['customer_name'] },
      { fields: ['status'] },
      { fields: ['quotation_type'] }
    ]
  });

  return Quotation;
};
