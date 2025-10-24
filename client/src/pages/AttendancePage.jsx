import React, { useState, useEffect, useMemo } from 'react';
import { FaCheckCircle, FaSignOutAlt, FaClock, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import MinimalStatCard from '../components/common/MinimalStatCard';

const AttendancePage = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);

  // Mock attendance data
  const attendanceStats = {
    totalWorkingDays: 22,
    presentDays: 20,
    absentDays: 2,
    lateArrivals: 3,
    earlyDepartures: 1,
    totalHours: 176,
    averageHours: 8.8,
    attendancePercentage: 90.9
  };

  const recentAttendance = useMemo(() => ([
    {
      date: '2024-12-01',
      checkIn: '09:15:30',
      checkOut: '18:30:45',
      totalHours: '09:15:15',
      status: 'present',
      isLate: true
    },
    {
      date: '2024-11-30',
      checkIn: '09:00:15',
      checkOut: '18:00:30',
      totalHours: '09:00:15',
      status: 'present',
      isLate: false
    },
    {
      date: '2024-11-29',
      checkIn: '08:45:20',
      checkOut: '17:45:10',
      totalHours: '09:00:50',
      status: 'present',
      isLate: false
    },
    {
      date: '2024-11-28',
      checkIn: null,
      checkOut: null,
      totalHours: '00:00:00',
      status: 'absent',
      isLate: false
    },
    {
      date: '2024-11-27',
      checkIn: '09:30:45',
      checkOut: '18:15:20',
      totalHours: '08:44:35',
      status: 'present',
      isLate: true
    }
  ]), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check if user is already checked in today
    const today = new Date().toDateString();
    const storedCheckIn = localStorage.getItem(`checkIn_${user?.id}_${today}`);
    if (storedCheckIn) {
      setIsCheckedIn(true);
      setTodayAttendance({
        checkIn: storedCheckIn,
        checkOut: localStorage.getItem(`checkOut_${user?.id}_${today}`)
      });
    }

    return () => clearInterval(timer);
  }, [user?.id]);

  const handleCheckIn = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const today = now.toDateString();
    
    localStorage.setItem(`checkIn_${user?.id}_${today}`, timeString);
    setIsCheckedIn(true);
    setTodayAttendance({
      checkIn: timeString,
      checkOut: null
    });
  };

  const handleCheckOut = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const today = now.toDateString();
    
    localStorage.setItem(`checkOut_${user?.id}_${today}`, timeString);
    setTodayAttendance(prev => ({
      ...prev,
      checkOut: timeString
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-700 border-green-400',
      absent: 'bg-red-100 text-red-700 border-red-400',
      late: 'bg-yellow-100 text-yellow-700 border-yellow-400',
      early_departure: 'bg-blue-100 text-blue-700 border-blue-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-400';
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-2xl font-bold text-gray-800 mb-4">Attendance Management</h1>

      {/* Current Time and Check-in/out */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="p-4 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25  ">
          <div className="text-lg font-semibold mb-2">Current Time</div>
          <div className="text-2xl font-bold text-primary mb-2">{formatTime(currentTime)}</div>
          <div className="text-gray-500">{currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</div>
        </div>
        <div className="p-4 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25  ">
          <div className="text-lg font-semibold mb-2">Today's Attendance</div>
          {todayAttendance ? (
            <div className="w-full">
              <div className="flex justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-500">Check In</div>
                  <div className="text-lg font-bold text-green-600">{todayAttendance.checkIn}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Check Out</div>
                  <div className={`text-lg font-bold ${todayAttendance.checkOut ? 'text-red-600' : 'text-gray-400'}`}>{todayAttendance.checkOut || 'Not checked out'}</div>
                </div>
              </div>
              {!todayAttendance.checkOut && (
                <button
                  className="w-full py-2 rounded bg-red-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-red-500"
                  onClick={handleCheckOut}
                >
                  <FaSignOutAlt /> Check Out
                </button>
              )}
            </div>
          ) : (
            <div className="w-full">
              <div className="text-gray-500 mb-2">You haven't checked in today</div>
              <button
                className="w-full py-2 rounded bg-green-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-500"
                onClick={handleCheckIn}
              >
                <FaCheckCircle /> Check In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <MinimalStatCard
          title="Present Days"
          value={attendanceStats.presentDays}
          icon={FaCheckCircle}
          subtitle={`Out of ${attendanceStats.totalWorkingDays} days`}
        />
        <MinimalStatCard
          title="Attendance Rate"
          value={`${attendanceStats.attendancePercentage}%`}
          icon={FaChartLine}
        />
        <MinimalStatCard
          title="Total Hours"
          value={attendanceStats.totalHours}
          icon={FaClock}
          subtitle="This month"
        />
        <MinimalStatCard
          title="Late Arrivals"
          value={attendanceStats.lateArrivals}
          icon={FaExclamationTriangle}
          subtitle="This month"
        />
      </div>

      {/* Attendance Progress */}
      <div className="bg-white rounded shadow p-6 mb-4">
        <div className="text-lg font-semibold mb-2">Monthly Attendance Progress</div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-3 bg-gray-200 rounded">
            <div
              className="h-3 rounded bg-green-500"
              style={{ width: `${attendanceStats.attendancePercentage}%` }}
            ></div>
          </div>
          <div className="text-sm font-medium">{attendanceStats.attendancePercentage}%</div>
        </div>
        <div className="text-xs text-gray-500">{attendanceStats.presentDays} out of {attendanceStats.totalWorkingDays} working days completed</div>
      </div>

      {/* Recent Attendance History */}
      <div className="bg-white rounded shadow p-6">
        <div className="text-lg font-semibold mb-4">Recent Attendance History</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Check In</th>
                <th className="px-4 py-2 text-left">Check Out</th>
                <th className="px-4 py-2 text-left">Total Hours</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((record, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className={`px-4 py-2 ${record.isLate ? 'text-yellow-600' : 'text-green-600'}`}>{record.checkIn || '-'}</td>
                  <td className={`px-4 py-2 ${record.checkOut ? 'text-red-600' : 'text-gray-400'}`}>{record.checkOut || '-'}</td>
                  <td className="px-4 py-2 font-medium">{record.totalHours}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(record.status)}`}>{record.status.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-2">
                    {record.isLate && record.status === 'present' && (
                      <span className="px-2 py-0.5 rounded text-xs border border-yellow-400 text-yellow-700 bg-yellow-100">Late Arrival</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;