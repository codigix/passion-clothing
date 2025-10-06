const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ShipmentTracking = sequelize.define('ShipmentTracking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    shipment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'shipments',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(
        'preparing', 'packed', 'ready_to_ship', 'shipped', 
        'in_transit', 'out_for_delivery', 'delivered', 
        'failed_delivery', 'returned', 'cancelled'
      ),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    courier_status: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Status from courier partner API'
    },
    courier_location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Location from courier partner API'
    },
    courier_timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp from courier partner API'
    },
    courier_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Remarks from courier partner'
    },
    is_automated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this update was automated from courier API'
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
    tableName: 'shipment_tracking',
    indexes: [
      { fields: ['shipment_id'] },
      { fields: ['status'] },
      { fields: ['timestamp'] },
      { fields: ['is_automated'] }
    ]
  });

  return ShipmentTracking;
};