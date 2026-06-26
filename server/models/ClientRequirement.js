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
    customer_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    customer_gstin: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    customer_location: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    project_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    enquiry_source: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    priority: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Normal'
    },
    required_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    product_category: {
      type: DataTypes.STRING(50),
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
    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expected_delivery_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'INR ₹'
    },
    payment_terms: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    target_price: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    payment_mode: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sampling_required: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    sample_qty: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    customer_special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requested_by: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    approved_by: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    priority_flag: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Normal'
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Paths for uploaded drawings, PDFs, images, specifications'
    },
    products: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'List of products in this requirement, each with its own attachments'
    },
    rfq_history: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'History of RFQ versions generated'
    },
    dynamic_fields: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Dynamic category-specific field values'
    },
    mfg_requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Manufacturing requirements checkboxes'
    },
    variant_rows: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Variant rows for size/colour breakdown'
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
