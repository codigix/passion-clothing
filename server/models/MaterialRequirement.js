const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialRequirement = sequelize.define('MaterialRequirement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    production_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'production_orders',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    material_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Material ID or inventory item code'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    required_quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false
    },
    allocated_quantity: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 0.000
    },
    consumed_quantity: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 0.000
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Meter, Kg, Pcs, etc.'
    },
    status: {
      type: DataTypes.ENUM('available', 'shortage', 'ordered', 'allocated', 'consumed'),
      defaultValue: 'available'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'material_requirements',
    indexes: [
      { fields: ['production_order_id'] },
      { fields: ['material_id'] },
      { fields: ['status'] }
    ]
  });

  return MaterialRequirement;
};