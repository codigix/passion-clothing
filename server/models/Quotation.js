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
      allowNull: false,
      references: {
        model: 'client_requirements',
        key: 'id'
      }
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
      type: DataTypes.ENUM('Draft', 'Sent', 'Approved', 'Converted to SO'),
      defaultValue: 'Draft'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'quotations',
    indexes: [
      { fields: ['quotation_number'] },
      { fields: ['client_requirement_id'] },
      { fields: ['customer_name'] },
      { fields: ['status'] }
    ]
  });

  return Quotation;
};
