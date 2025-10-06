import React, { useState, useEffect } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@pashion.com',
    phone: user?.phone || '+91 9876543210',
    department: user?.department || 'Sales',
    role: user?.role?.display_name || 'Sales Manager',
    location: 'Mumbai, Maharashtra',
    joinDate: user?.date_of_joining || '2024-01-15',
    employeeId: user?.employee_id || 'EMP001',
    reportingManager: 'Jane Smith',
    bio: 'Experienced sales professional with 5+ years in textile industry.'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    emailNotifications: true,
    smsNotifications: false,
    sessionTimeout: 30
  });

  useEffect(() => {
    if (tabValue === 1) {
      toast.dismiss('security-info-banner');
      toast.custom(
        () => (
          <div className="max-w-md p-4 bg-white rounded-lg shadow-lg border border-gray-200 flex items-start gap-3">
            <FaShieldAlt className="text-blue-500 mt-0.5" size={16} />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Secure your account
              </h4>
              <p className="text-sm text-gray-600">
                Enable two-factor authentication and ensure you are using a strong password to keep your account safe.
              </p>
            </div>
          </div>
        ),
        {
          id: 'security-info-banner',
          duration: 6000,
        },
      );
    }
  }, [tabValue]);

  const [activityLog] = useState([
    {
      id: 1,
      action: 'Logged in',
      timestamp: '2024-12-01 09:30:15',
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows'
    },
    {
      id: 2,
      action: 'Created Sales Order SO-2024-001',
      timestamp: '2024-12-01 10:15:30',
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows'
    },
    {
      id: 3,
      action: 'Updated customer information',
      timestamp: '2024-12-01 11:45:22',
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows'
    },
    {
      id: 4,
      action: 'Generated sales report',
      timestamp: '2024-12-01 14:20:10',
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows'
    }
  ]);

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

  const handleSave = () => {
    // Here you would typically make an API call to update the profile
    console.log('Saving profile data:', profileData);
    setEditMode(false);
    // Show success message
  };

  const handleCancel = () => {
    // Reset to original data
    setEditMode(false);
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <div className="pt-6">{children}</div>}
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Profile Management</h1>
      <div className="mx-auto grid grid-cols-1 gap-8">
        {/* Profile Header Card */}
        <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {profileData.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-1">{profileData.name}</h2>
            <div className="text-gray-500 mb-2">{profileData.role} • {profileData.department}</div>
            <div className="flex gap-2 flex-wrap mb-2">
              <span className="px-3 py-1 bg-gray-100 rounded text-xs font-medium border">ID: {profileData.employeeId}</span>
              <span className="px-3 py-1 bg-gray-100 rounded text-xs font-medium border">Joined: {profileData.joinDate}</span>
              <span className="px-3 py-1 bg-gray-100 rounded text-xs font-medium border">Reports to: {profileData.reportingManager}</span>
            </div>
          </div>
          <div>
            {!editMode ? (
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  className="btn btn-primary bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg p-8">
          <div className="border-b border-gray-200 mb-6 flex gap-4">
            {['Personal Information', 'Security Settings', 'Notifications', 'Activity Log'].map((tab, idx) => (
              <button
                key={tab}
                className={`py-2 px-4 font-medium rounded-t ${tabValue === idx ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-500'}`}
                onClick={() => setTabValue(idx)}
              >
                {tab}
              </button>
            ))}
          </div>

          <TabPanel value={tabValue} index={0}>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={profileData.department}
                  onChange={e => handleInputChange('department', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Sales">Sales</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Finance">Finance</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={profileData.employeeId}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={e => handleInputChange('bio', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Two-Factor Authentication</label>
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={e => handleSecurityChange('twoFactorAuth', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-500">Add an extra layer of security to your account</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                <select
                  value={securitySettings.sessionTimeout}
                  onChange={e => handleSecurityChange('sessionTimeout', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
              <div className="md:col-span-2 mt-4">
                <button className="btn btn-secondary border border-yellow-400 text-yellow-700">Change Password</button>
              </div>
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label>
                <input
                  type="checkbox"
                  checked={securitySettings.emailNotifications}
                  onChange={e => handleSecurityChange('emailNotifications', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-500">Receive notifications about orders, updates, and system alerts via email</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMS Notifications</label>
                <input
                  type="checkbox"
                  checked={securitySettings.smsNotifications}
                  onChange={e => handleSecurityChange('smsNotifications', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-500">Receive critical alerts and updates via SMS</span>
              </div>
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <ul className="divide-y divide-gray-200">
              {activityLog.map((activity) => (
                <li key={activity.id} className="py-3 flex flex-col md:flex-row md:items-center gap-2">
                  <span className="text-blue-600 font-bold text-xs mr-2">{activity.action}</span>
                  <span className="text-gray-500 text-xs">{activity.timestamp}</span>
                  <span className="text-gray-400 text-xs">{activity.device} • {activity.ipAddress}</span>
                </li>
              ))}
            </ul>
          </TabPanel>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;