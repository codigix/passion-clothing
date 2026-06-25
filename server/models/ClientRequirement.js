const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ClientRequirement = sequelize.define('ClientRequirement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    requirement_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: CR-XXXX'
    },
    customer_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    contact_person: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mobile_number: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    project_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    required_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    product_category: {
      type: DataTypes.ENUM(
        'Bottle', 'Garment', 'Assembly', 'Part', 
        'Plastic Product', 'Fabrication', 'Custom Product'
      ),
      allowNull: false
    },
    product_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    unit: {
      type: DataTypes.STRING(20),
      defaultValue: 'Nos'
    },
    material: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    dimensions: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    weight: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    finish: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tolerance: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Paths for uploaded drawings, PDFs, images, specifications'
    },
    status: {
      type: DataTypes.ENUM('Draft', 'Review', 'Approved', 'Quotation Generated', 'Converted to SO'),
      defaultValue: 'Draft'
    }
  }, {
    tableName: 'client_requirements',
    indexes: [
      { fields: ['requirement_number'] },
      { fields: ['customer_name'] },
      { fields: ['product_category'] },
      { fields: ['status'] }
    ]
  });

  return ClientRequirement;
};
