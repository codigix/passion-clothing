import React, { useState } from 'react';

import { FaCog, FaShieldAlt, FaBell, FaDatabase, FaEnvelope, FaBuilding, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const SystemConfigPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toastId, setToastId] = useState(null);

  // Company Settings
  const [companySettings, setCompanySettings] = useState({
    name: 'Pashion Clothing Factory',
    address: 'Mumbai, Maharashtra, India',
    phone: '+91-9876543210',
    email: 'info@pashion.com',
    website: 'www.pashion.com',
    gstNumber: '27ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    logo: null
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    language: 'en',
    sessionTimeout: 30,
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorAuth: false,
    sessionSecurity: true,
    ipWhitelist: []
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'your_email@gmail.com',
    smtpPassword: '',
    smtpSecure: true,
    fromName: 'Pashion ERP System',
    fromEmail: 'noreply@pashion.com'
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    lowStockAlerts: true,
    orderStatusUpdates: true,
    systemAlerts: true,
    reportSchedule: 'weekly'
  });

  // Storage Settings
  const [storageSettings, setStorageSettings] = useState({
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
    storageLocation: 'local',
    cloudProvider: 'aws',
    retentionPeriod: 365,
    autoCleanup: true
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCompanySettingChange = (field, value) => {
    setCompanySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSystemSettingChange = (field, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecuritySettingChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailSettingChange = (field, value) => {
    setEmailSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationSettingChange = (field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStorageSettingChange = (field, value) => {
    setStorageSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (settingsType) => {
    setLoading(true);
    try {
      // TODO: Save settings to API
      console.log(`Saving ${settingsType} settings`);

      toast.success(`${settingsType} settings saved successfully!`);
    } catch (error) {
      toast.error(`Error saving ${settingsType} settings`);
    } finally {
      setLoading(false);
    }
  };

  const CompanySettingsTab = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <FaBuilding className="w-6 h-6 mr-3" />
          <div>
            <h3 className="text-lg font-semibold">Company Information</h3>
            <p className="text-sm text-gray-500">Configure your company details</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={companySettings.name}
              onChange={(e) => handleCompanySettingChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={companySettings.email}
              onChange={(e) => handleCompanySettingChange('email', e.target.value)}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={companySettings.address}
              onChange={(e) => handleCompanySettingChange('address', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={companySettings.phone}
              onChange={(e) => handleCompanySettingChange('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={companySettings.website}
              onChange={(e) => handleCompanySettingChange('website', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={companySettings.gstNumber}
              onChange={(e) => handleCompanySettingChange('gstNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={companySettings.panNumber}
              onChange={(e) => handleCompanySettingChange('panNumber', e.target.value)}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              onClick={() => handleSave('Company')}
              disabled={loading}
            >
              <FaSave />
              Save Company Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SystemSettingsTab = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <FaCog className="w-6 h-6 mr-3" />
          <div>
            <h3 className="text-lg font-semibold">System Configuration</h3>
            <p className="text-sm text-gray-500">Configure system-wide settings</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={systemSettings.timezone}
              onChange={(e) => handleSystemSettingChange('timezone', e.target.value)}
            >
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={systemSettings.dateFormat}
              onChange={(e) => handleSystemSettingChange('dateFormat', e.target.value)}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={systemSettings.currency}
              onChange={(e) => handleSystemSettingChange('currency', e.target.value)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={systemSettings.sessionTimeout}
              onChange={(e) => handleSystemSettingChange('sessionTimeout', parseInt(e.target.value))}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={systemSettings.autoBackup}
                onChange={(e) => handleSystemSettingChange('autoBackup', e.target.checked)}
              />
              Enable Auto Backup
            </label>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={systemSettings.maintenanceMode}
                onChange={(e) => handleSystemSettingChange('maintenanceMode', e.target.checked)}
              />
              Maintenance Mode
            </label>
          </div>
          <div className="col-span-1 md:col-span-2">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              onClick={() => handleSave('System')}
              disabled={loading}
            >
              <FaSave />
              Save System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SecuritySettingsTab = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <FaShieldAlt className="w-6 h-6 mr-3" />
          <div>
            <h3 className="text-lg font-semibold">Security Configuration</h3>
            <p className="text-sm text-gray-500">Configure security and authentication settings</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Password Length</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={securitySettings.passwordMinLength}
              onChange={(e) => handleSecuritySettingChange('passwordMinLength', parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={securitySettings.maxLoginAttempts}
              onChange={(e) => handleSecuritySettingChange('maxLoginAttempts', parseInt(e.target.value))}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={securitySettings.passwordRequireSpecialChar}
                onChange={(e) => handleSecuritySettingChange('passwordRequireSpecialChar', e.target.checked)}
              />
              Require Special Characters in Password
            </label>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => handleSecuritySettingChange('twoFactorAuth', e.target.checked)}
              />
              Enable Two-Factor Authentication
            </label>
          </div>
          <div className="col-span-1 md:col-span-2">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              onClick={() => handleSave('Security')}
              disabled={loading}
            >
              <FaSave />
              Save Security Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { label: 'Company', component: <CompanySettingsTab /> },
    { label: 'System', component: <SystemSettingsTab /> },
    { label: 'Security', component: <SecuritySettingsTab /> }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">System Configuration</h1>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              className={`px-6 py-3 text-sm font-semibold focus:outline-none transition border-b-2 ${activeTab === idx ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
              onClick={() => setActiveTab(idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tabs[activeTab].component}
        </div>
      </div>
      {/* Snackbar/Toast handled by react-hot-toast */}
    </div>
  );
};

export default SystemConfigPage;