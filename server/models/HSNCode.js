const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HSNCode = sequelize.define('HSNCode', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      comment: 'HSN Code (e.g., 5208, 6203)'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Item description (e.g., Woven fabrics of cotton)'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Category (Fabric, Accessories, etc.)'
    },
    gst_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'GST rate applicable for this HSN code'
    },
    unit_of_measure: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Meters',
      comment: 'Unit of measurement (Meters, Pieces, Kg, etc.)'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this HSN code is currently active'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional remarks or notes'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'hsn_codes',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['code'] },
      { fields: ['category'] },
      { fields: ['is_active'] }
    ]
  });

  return HSNCode;
};
