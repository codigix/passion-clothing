import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  LogOut,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    location: '',
    joinDate: '',
    employeeId: '',
    reportingManager: '',
    bio: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    emailNotifications: true,
    smsNotifications: false,
    sessionTimeout: 30
  });

  const [activityLog, setActivityLog] = useState([]);
  const [stats, setStats] = useState({
    lastLogin: 'Loading...',
    loginCount: 0,
    lastPasswordChange: 'Never'
  });

  // Fetch profile data
  useEffect(() => {
    fetchProfileData();
    const interval = setInterval(fetchProfileData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchProfileData = async () => {
    try {
      setRefreshing(true);
      // Fetch user profile
      const userResponse = await api.get('/users/profile');
      const userData = userResponse.data.user;

      setProfileData({
        name: userData.name || user?.name || '',
        email: userData.email || user?.email || '',
        phone: userData.phone || '',
        department: userData.department || user?.department || '',
        role: userData.role?.display_name || user?.role?.display_name || '',
        location: userData.location || 'Not specified',
        joinDate: userData.date_of_joining || 'N/A',
        employeeId: userData.employee_id || 'N/A',
        reportingManager: userData.reporting_manager || 'Not assigned',
        bio: userData.bio || ''
      });

      // Fetch activity log
      try {
        const activityResponse = await api.get('/users/activity-log');
        setActivityLog(activityResponse.data.activities || []);
      } catch (err) {
        console.log('Activity log not available');
      }

      // Update stats
      setStats({
        lastLogin: userData.last_login ? new Date(userData.last_login).toLocaleString() : 'N/A',
        loginCount: userData.login_count || 0,
        lastPasswordChange: userData.last_password_change ? new Date(userData.last_password_change).toLocaleDateString() : 'Never'
      });

      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to auth context data
      setProfileData(prev => ({
        ...prev,
        name: user?.name || prev.name,
        email: user?.email || prev.email,
        department: user?.department || prev.department,
        role: user?.role?.display_name || prev.role
      }));
      setRefreshing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/users/profile', profileData);
      toast.success('Profile updated successfully!');
      setEditMode(false);
      fetchProfileData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    fetchProfileData();
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <div className="pt-6">{children}</div>}
    </div>
  );

  const StatBox = ({ icon: Icon, label, value }) => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-600 font-medium">{label}</p>
          <p className="text-sm font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Header with Profile Card */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-4xl font-bold border-2 border-white">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profileData.name}</h1>
                <p className="text-blue-100 mt-1">{profileData.role} • {profileData.department}</p>
                <div className="flex gap-3 mt-3 flex-wrap">
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">ID: {profileData.employeeId}</span>
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">Since {new Date(profileData.joinDate).getFullYear()}</span>
                </div>
              </div>
            </div>
            <div>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatBox icon={LogOut} label="Last Login" value={stats.lastLogin} />
        <StatBox icon={Calendar} label="Total Logins" value={stats.loginCount} />
        <StatBox icon={Shield} label="Last Password Change" value={stats.lastPasswordChange} />
      </div>

      {/* Refresh Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={fetchProfileData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 flex overflow-x-auto">
          {['Personal Information', 'Security Settings', 'Notifications', 'Activity Log'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setTabValue(idx)}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition border-b-2 ${
                tabValue === idx
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Personal Information Tab */}
          <TabPanel value={tabValue} index={0}>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" /> Location
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Department</label>
                <select
                  value={profileData.department}
                  onChange={e => handleInputChange('department', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select Department</option>
                  <option value="Sales">Sales</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Finance">Finance</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Employee ID</label>
                <input
                  type="text"
                  value={profileData.employeeId}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-2">Bio</label>
                <textarea
                  rows={4}
                  value={profileData.bio}
                  onChange={e => handleInputChange('bio', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </TabPanel>

          {/* Security Settings Tab */}
          <TabPanel value={tabValue} index={1}>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Security Settings</h3>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900">Enhanced Security</h4>
                    <p className="text-sm text-amber-800 mt-1">Enable two-factor authentication and keep your account secure</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div>
                  <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600 mt-1">Add an extra layer of security</p>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={e => handleSecurityChange('twoFactorAuth', e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div>
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600 mt-1">Get alerts about security events</p>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.emailNotifications}
                  onChange={e => handleSecurityChange('emailNotifications', e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Session Timeout</label>
                <select
                  value={securitySettings.sessionTimeout}
                  onChange={e => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition">
                Change Password
              </button>
            </div>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={2}>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', title: 'Email Notifications', desc: 'Receive notifications about orders and updates' },
                { key: 'smsNotifications', title: 'SMS Notifications', desc: 'Receive critical alerts via SMS' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securitySettings[item.key] || false}
                    onChange={e => handleSecurityChange(item.key, e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600"
                  />
                </div>
              ))}
            </div>
          </TabPanel>

          {/* Activity Log Tab */}
          <TabPanel value={tabValue} index={3}>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
            {activityLog.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityLog.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition">
                    <div className="p-2 bg-blue-100 rounded-lg mt-1">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.timestamp}</p>
                    </div>
                    <p className="text-xs text-gray-500">{activity.ipAddress}</p>
                  </div>
                ))}
              </div>
            )}
          </TabPanel>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;