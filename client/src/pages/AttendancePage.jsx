import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  LogOut,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  AlertCircle,
  RefreshCw,
  Download,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const AttendancePage = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [expandedMonth, setExpandedMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));

  const [stats, setStats] = useState({
    totalWorkingDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateArrivals: 0,
    earlyDepartures: 0,
    totalHours: 0,
    averageHours: 0,
    attendancePercentage: 0
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch attendance data
  useEffect(() => {
    fetchAttendanceData();
    const interval = setInterval(fetchAttendanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAttendanceData = async () => {
    try {
      if (!refreshing) setLoading(true);
      setRefreshing(true);

      // Fetch today's attendance
      try {
        const todayResponse = await api.get('/auth/attendance/today');
        const today = todayResponse.data.attendance;
        setTodayAttendance(today);
      } catch (err) {
        console.log('Today attendance not available');
      }

      // Fetch attendance history
      try {
        const historyResponse = await api.get('/users/attendance-history', {
          params: { limit: 30 }
        });
        setAttendanceHistory(historyResponse.data.records || []);

        // Calculate stats
        if (historyResponse.data.records) {
          const records = historyResponse.data.records;
          const presentCount = records.filter(r => r.status === 'present').length;
          const absentCount = records.filter(r => r.status === 'absent').length;
          const lateCount = records.filter(r => r.is_late).length;
          const totalHoursWorked = records.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0);

          setStats({
            totalWorkingDays: records.length,
            presentDays: presentCount,
            absentDays: absentCount,
            lateArrivals: lateCount,
            earlyDepartures: 0,
            totalHours: totalHoursWorked.toFixed(2),
            averageHours: (totalHoursWorked / presentCount || 0).toFixed(2),
            attendancePercentage: ((presentCount / records.length) * 100 || 0).toFixed(1)
          });
        }
      } catch (err) {
        console.log('Attendance history not available');
      }

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/checkin', {
        location: 'Office',
        notes: 'Checked in via app'
      });
      toast.success('✓ Checked in successfully');
      fetchAttendanceData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/checkout', {
        notes: 'Checked out via app'
      });
      toast.success('✓ Checked out successfully');
      fetchAttendanceData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadge = (status, isLate) => {
    if (status === 'present') {
      return isLate
        ? { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'LATE ARRIVAL' }
        : { bg: 'bg-green-100', text: 'text-green-800', label: 'PRESENT' };
    }
    return { bg: 'bg-red-100', text: 'text-red-800', label: 'ABSENT' };
  };

  const StatCard = ({ icon: Icon, label, value, subtitle, color = 'blue' }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl p-6 border border-${color}-200 shadow-sm hover:shadow-md transition`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium text-${color}-600`}>{label}</p>
          <p className={`text-3xl font-bold text-${color}-900 mt-2`}>{value}</p>
          {subtitle && <p className={`text-xs text-${color}-600 mt-1`}>{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-200 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-700`} />
        </div>
      </div>
    </div>
  );

  const isCheckedInToday = todayAttendance?.check_in_time && !todayAttendance?.check_out_time;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600 mt-2">Track your daily attendance and work hours</p>
          </div>
          <button
            onClick={fetchAttendanceData}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Current Time & Check-in/out Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Current Time */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-100 font-semibold text-sm">CURRENT TIME</p>
              <h2 className="text-5xl font-bold mt-2">{formatTime(currentTime)}</h2>
            </div>
            <Clock className="w-12 h-12 opacity-50" />
          </div>
          <p className="text-blue-100 text-lg">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Check-in/out Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Today's Attendance
          </h3>

          {todayAttendance ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-green-600 font-semibold">CHECK IN</p>
                  <p className="text-2xl font-bold text-green-700 mt-2">{todayAttendance.check_in_time}</p>
                </div>
                <div className={`rounded-lg p-4 border ${todayAttendance.check_out_time ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs font-semibold ${todayAttendance.check_out_time ? 'text-red-600' : 'text-gray-600'}`}>CHECK OUT</p>
                  <p className={`text-2xl font-bold mt-2 ${todayAttendance.check_out_time ? 'text-red-700' : 'text-gray-400'}`}>
                    {todayAttendance.check_out_time || '--:--:--'}
                  </p>
                </div>
              </div>

              {todayAttendance.total_hours && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold">TOTAL HOURS WORKED</p>
                  <p className="text-2xl font-bold text-blue-700 mt-2">{todayAttendance.total_hours}h</p>
                </div>
              )}

              {!todayAttendance.check_out_time && todayAttendance.check_in_time ? (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold flex items-center justify-center gap-2 hover:from-red-700 hover:to-orange-700 transition disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  {loading ? 'Processing...' : 'Check Out'}
                </button>
              ) : !todayAttendance.check_in_time ? (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  {loading ? 'Processing...' : 'Check In'}
                </button>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
                  <p className="text-blue-700 font-semibold">✓ You have checked out for today</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-6">You haven't checked in today</p>
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 transition"
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? 'Processing...' : 'Check In Now'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CheckCircle}
            label="Present Days"
            value={stats.presentDays}
            subtitle={`out of ${stats.totalWorkingDays} days`}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            label="Attendance Rate"
            value={`${stats.attendancePercentage}%`}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="Total Hours"
            value={`${stats.totalHours}h`}
            subtitle={`Avg: ${stats.averageHours}h/day`}
            color="purple"
          />
          <StatCard
            icon={AlertTriangle}
            label="Late Arrivals"
            value={stats.lateArrivals}
            color="amber"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Attendance Progress</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${stats.attendancePercentage}%` }}
              ></div>
            </div>
            <span className="text-2xl font-bold text-gray-900 min-w-fit">{stats.attendancePercentage}%</span>
          </div>
          <p className="text-sm text-gray-600">
            {stats.presentDays} out of {stats.totalWorkingDays} working days completed
          </p>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Attendance History</h3>
          <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left font-bold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left font-bold text-gray-900">Check In</th>
                <th className="px-6 py-4 text-left font-bold text-gray-900">Check Out</th>
                <th className="px-6 py-4 text-left font-bold text-gray-900">Total Hours</th>
                <th className="px-6 py-4 text-left font-bold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left font-bold text-gray-900">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-600">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendanceHistory.map((record, idx) => {
                  const badge = getStatusBadge(record.status, record.is_late);
                  return (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-blue-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className={`px-6 py-4 font-medium ${record.check_in_time ? 'text-green-600' : 'text-gray-400'}`}>
                        {record.check_in_time || '-'}
                      </td>
                      <td className={`px-6 py-4 font-medium ${record.check_out_time ? 'text-red-600' : 'text-gray-400'}`}>
                        {record.check_out_time || '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {record.total_hours ? `${record.total_hours}h` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {record.is_late && record.status === 'present' && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                            Late by {record.late_minutes || '—'} min
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;