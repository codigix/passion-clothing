const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    check_in_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    check_out_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    total_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: 'Total working hours for the day'
    },
    break_hours: {
      type: DataTypes.DECIMAL(4, 2),
      defaultValue: 0.00,
      comment: 'Total break time in hours'
    },
    productive_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: 'total_hours - break_hours'
    },
    overtime_hours: {
      type: DataTypes.DECIMAL(4, 2),
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'half_day', 'late', 'early_leave', 'holiday', 'leave'),
      allowNull: false
    },
    attendance_type: {
      type: DataTypes.ENUM('regular', 'overtime', 'holiday_work', 'night_shift'),
      defaultValue: 'regular'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Work location or department'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    device_info: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Device information for check-in/out'
    },
    geo_location: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'GPS coordinates if available'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    late_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    early_leave_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_manual_entry: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    manual_entry_reason: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'attendance',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['date'] },
      { fields: ['status'] },
      { fields: ['attendance_type'] },
      { fields: ['user_id', 'date'], unique: true },
      { fields: ['check_in_time'] },
      { fields: ['check_out_time'] }
    ]
  });

  return Attendance;
};