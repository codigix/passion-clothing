const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    department: {
      type: DataTypes.ENUM(
        'sales', 'procurement', 'manufacturing', 'outsourcing', 
        'inventory', 'shipment', 'store', 'finance', 'admin', 'samples'
      ),
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '1=User, 2=Supervisor, 3=Manager, 4=Admin, 5=Super Admin'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'roles',
    indexes: [
      { fields: ['name'] },
      { fields: ['department'] },
      { fields: ['level'] },
      { fields: ['status'] }
    ]
  });

  return Role;
};