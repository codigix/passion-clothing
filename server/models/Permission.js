const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permission = sequelize.define('Permission', {
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
    display_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Module this permission belongs to'
    },
    action: {
      type: DataTypes.ENUM('create', 'read', 'update', 'delete', 'approve', 'export'),
      allowNull: false
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Resource this permission applies to'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'permissions',
    indexes: [
      { fields: ['name'] },
      { fields: ['module'] },
      { fields: ['action'] },
      { fields: ['resource'] },
      { fields: ['status'] }
    ]
  });

  return Permission;
};