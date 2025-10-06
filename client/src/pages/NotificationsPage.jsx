import React, { useState } from 'react';
import {
  FaBell,
  FaBellSlash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTrash,
  FaEnvelopeOpenText,
  FaCog,
  FaShoppingCart,
  FaTruck,
  FaMoneyBillWave,
  FaUser,
  FaClipboardList,
  FaCircle
} from 'react-icons/fa';

const NotificationsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'New Sales Order Created',
      message: 'Sales Order SO-2024-001 has been created for ABC School',
      timestamp: '2024-12-01 10:30:15',
      isRead: false,
      priority: 'high',
      icon: <FaShoppingCart />,
      color: 'primary'
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Low Stock Alert',
      message: 'Cotton Fabric - White is running low (15 units remaining)',
      timestamp: '2024-12-01 09:45:22',
      isRead: false,
      priority: 'high',
      icon: <FaExclamationTriangle />,
      color: 'warning'
    },
    {
      id: 3,
      type: 'shipment',
      title: 'Shipment Delivered',
      message: 'Shipment SHP-2024-001 has been delivered to ABC School',
      timestamp: '2024-12-01 08:20:10',
      isRead: true,
      priority: 'medium',
      icon: <FaTruck />,
      color: 'success'
    },
    {
      id: 4,
      type: 'finance',
      title: 'Payment Received',
      message: 'Payment of ₹4,25,000 received from ABC School',
      timestamp: '2024-11-30 16:15:30',
      isRead: true,
      priority: 'medium',
      icon: <FaMoneyBillWave />,
      color: 'success'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
      timestamp: '2024-11-30 14:00:00',
      isRead: false,
      priority: 'low',
      icon: <FaInfoCircle />,
      color: 'info'
    },
    {
      id: 6,
      type: 'approval',
      title: 'Purchase Order Pending Approval',
      message: 'Purchase Order PO-2024-002 is waiting for your approval',
      timestamp: '2024-11-30 11:30:45',
      isRead: false,
      priority: 'high',
      icon: <FaClipboardList />,
      color: 'warning'
    },
    {
      id: 7,
      type: 'user',
      title: 'New User Added',
      message: 'New user Amit Sharma has been added to Manufacturing department',
      timestamp: '2024-11-29 15:20:18',
      isRead: true,
      priority: 'low',
      icon: <FaUser />,
      color: 'info'
    },
    {
      id: 8,
      type: 'error',
      title: 'System Error',
      message: 'Failed to sync data with external system. Please check logs.',
      timestamp: '2024-11-29 12:45:33',
      isRead: false,
      priority: 'high',
      icon: <FaExclamationTriangle />,
      color: 'error'
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    inventoryAlerts: true,
    shipmentUpdates: true,
    paymentNotifications: true,
    systemAlerts: true
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  const handleSettingChange = (setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'info'
    };
    return colors[priority] || 'default';
  };

  const getFilteredNotifications = () => {
    switch (tabValue) {
      case 1:
        return notifications.filter(n => !n.isRead);
      case 2:
        return notifications.filter(n => n.isRead);
      default:
        return notifications;
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <div className="pt-2">{children}</div>}
    </div>
  );

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Notifications</h1>
        <div className="flex gap-3">
          <button
            className={`border border-primary text-primary px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50`}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <FaEnvelopeOpenText className="text-lg" />
            Mark All as Read
          </button>
          <button
            className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaCog className="text-lg" />
            Settings
          </button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="relative flex justify-center mb-2">
            <FaBell className="text-4xl text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="text-xl font-bold">{unreadCount}</div>
          <div className="text-gray-500 text-sm">Unread Notifications</div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <FaBellSlash className="text-4xl text-blue-400 mb-2" />
          <div className="text-xl font-bold">{notifications.length}</div>
          <div className="text-gray-500 text-sm">Total Notifications</div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <FaExclamationTriangle className="text-4xl text-yellow-500 mb-2" />
          <div className="text-xl font-bold">{notifications.filter(n => n.priority === 'high').length}</div>
          <div className="text-gray-500 text-sm">High Priority</div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <FaCheckCircle className="text-4xl text-green-500 mb-2" />
          <div className="text-xl font-bold">{notifications.filter(n => n.isRead).length}</div>
          <div className="text-gray-500 text-sm">Read Notifications</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded">
        <div className="border-b flex">
          {[
            { label: `All (${notifications.length})`, icon: <FaBell /> },
            { label: `Unread (${unreadCount})`, icon: <FaCircle className="text-red-500" /> },
            { label: `Read (${notifications.filter(n => n.isRead).length})`, icon: <FaCheckCircle className="text-green-500" /> },
            { label: 'Settings', icon: <FaCog /> }
          ].map((tab, idx) => (
            <button
              key={tab.label}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${tabValue === idx ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
              onClick={() => setTabValue(idx)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div >
          {/* All Notifications */}
          {tabValue === 0 && (
            <ul>
              {getFilteredNotifications().map((notification, index) => (
                <li
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded ${notification.isRead ? '' : 'bg-gray-50 border-l-4'} border-${notification.color}-500`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-${notification.color}-100`}>
                    {getNotificationIcon(notification)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${notification.isRead ? 'text-gray-700' : 'text-primary'}`}>{notification.title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs border border-${getPriorityColor(notification.priority)}-500 text-${getPriorityColor(notification.priority)}-500`}>{notification.priority}</span>
                      {!notification.isRead && <FaCircle className="text-primary text-xs" />}
                    </div>
                    <div className="text-gray-500 text-sm mt-1">{notification.message}</div>
                    <div className="text-gray-400 text-xs mt-1">{notification.timestamp}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!notification.isRead && (
                      <button
                        className="text-green-500 hover:text-green-700"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <FaCheckCircle />
                      </button>
                    )}
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteNotification(notification.id)}
                      title="Delete notification"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Unread Notifications */}
          {tabValue === 1 && (
            <ul>
              {getFilteredNotifications().map((notification, index) => (
                <li
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded bg-gray-50 border-l-4 border-${notification.color}-500`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-${notification.color}-100`}>
                    {getNotificationIcon(notification)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">{notification.title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs border border-${getPriorityColor(notification.priority)}-500 text-${getPriorityColor(notification.priority)}-500`}>{notification.priority}</span>
                      <FaCircle className="text-primary text-xs" />
                    </div>
                    <div className="text-gray-500 text-sm mt-1">{notification.message}</div>
                    <div className="text-gray-400 text-xs mt-1">{notification.timestamp}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      className="text-green-500 hover:text-green-700"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <FaCheckCircle />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteNotification(notification.id)}
                      title="Delete notification"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Read Notifications */}
          {tabValue === 2 && (
            <ul>
              {getFilteredNotifications().map((notification, index) => (
                <li
                  key={notification.id}
                  className="flex items-start gap-4 p-4 rounded border-l-4 border-gray-200"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-${notification.color}-100`}>
                    {getNotificationIcon(notification)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{notification.title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs border border-${getPriorityColor(notification.priority)}-500 text-${getPriorityColor(notification.priority)}-500`}>{notification.priority}</span>
                    </div>
                    <div className="text-gray-500 text-sm mt-1">{notification.message}</div>
                    <div className="text-gray-400 text-xs mt-1">{notification.timestamp}</div>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Settings Tab */}
          {tabValue === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Notification Settings</h2>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded p-3 mb-4">
                Configure how you want to receive notifications across different channels.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-semibold mb-2">Delivery Methods</h3>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={e => handleSettingChange('emailNotifications', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary"
                      />
                      Email Notifications
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={e => handleSettingChange('pushNotifications', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary"
                      />
                      Push Notifications
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications}
                        onChange={e => handleSettingChange('smsNotifications', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary"
                      />
                      SMS Notifications
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-semibold mb-2">Notification Types</h3>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.orderNotifications}
                        onChange={e => handleSettingChange('orderNotifications', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary"
                      />
                      Order Updates
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.inventoryAlerts}
                        onChange={e => handleSettingChange('inventoryAlerts', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary"
                      />
                      Inventory Alerts
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.shipmentUpdates}
                        onChange={e => handleSettingChange('shipmentUpdates', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary"
                      />
                      Shipment Updates
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.paymentNotifications}
                        onChange={e => handleSettingChange('paymentNotifications', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary"
                      />
                      Payment Notifications
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.systemAlerts}
                        onChange={e => handleSettingChange('systemAlerts', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary"
                      />
                      System Alerts
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button className="bg-primary text-white px-6 py-2 rounded">Save Settings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
// Helper to get notification icon
function getNotificationIcon(notification) {
  switch (notification.type) {
    case 'order':
      return <FaShoppingCart className="text-primary text-2xl" />;
    case 'inventory':
      return <FaClipboardList className="text-yellow-500 text-2xl" />;
    case 'shipment':
      return <FaTruck className="text-green-500 text-2xl" />;
    case 'finance':
      return <FaMoneyBillWave className="text-green-500 text-2xl" />;
    case 'system':
      return <FaInfoCircle className="text-blue-500 text-2xl" />;
    case 'approval':
      return <FaClipboardList className="text-yellow-500 text-2xl" />;
    case 'user':
      return <FaUser className="text-blue-400 text-2xl" />;
    case 'error':
      return <FaExclamationTriangle className="text-red-500 text-2xl" />;
    default:
      return <FaBell className="text-primary text-2xl" />;
  }
}
};

export default NotificationsPage;