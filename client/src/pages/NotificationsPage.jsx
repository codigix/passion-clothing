import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  MoreHorizontal,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Archive,
  Circle,
  CheckCheck,
  Clock,
  ShoppingCart,
  Truck,
  DollarSign,
  AlertTriangle,
  Zap,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const NotificationsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

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

  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    high: 0
  });

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [notifications, tabValue, searchTerm, priorityFilter]);

  const fetchNotifications = async () => {
    try {
      if (!refreshing) setLoading(true);
      setRefreshing(true);

      const response = await api.get('/notifications', {
        params: {
          limit: 50,
          page: 1
        }
      });

      const notifs = response.data.notifications || [];
      setNotifications(notifs);

      // Fetch stats
      try {
        const statsResponse = await api.get('/notifications/stats');
        setStats({
          total: statsResponse.data.total || notifs.length,
          unread: notifs.filter(n => n.status !== 'read').length,
          read: notifs.filter(n => n.status === 'read').length,
          high: notifs.filter(n => n.priority === 'high').length
        });
      } catch (err) {
        console.log('Stats not available');
      }

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Apply tab filter
    switch (tabValue) {
      case 1: // Unread
        filtered = filtered.filter(n => n.status !== 'read');
        break;
      case 2: // Read
        filtered = filtered.filter(n => n.status === 'read');
        break;
      default: // All
        break;
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(n => n.priority === priorityFilter);
    }

    // Apply search
    if (searchTerm.trim()) {
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, status: 'read' } : n)
      );
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', icon: AlertTriangle },
      medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      low: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', icon: Info }
    };
    return colors[priority] || colors.low;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order: ShoppingCart,
      shipment: Truck,
      payment: DollarSign,
      inventory: AlertTriangle,
      approval: CheckCircle,
      system: Zap,
      default: Bell
    };
    return icons[type] || icons.default;
  };

  const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl p-6 border border-${color}-200 shadow-sm hover:shadow-md transition`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-${color}-200 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-700`} />
        </div>
        <div>
          <p className={`text-sm font-medium text-${color}-600`}>{label}</p>
          <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
        </div>
      </div>
    </div>
  );

  const NotificationItem = ({ notification }) => {
    const IconComponent = getNotificationIcon(notification.type);
    const priorityColors = getPriorityColor(notification.priority);
    const isUnread = notification.status !== 'read';

    return (
      <div
        className={`flex items-start gap-4 p-6 rounded-xl border-2 transition ${
          isUnread
            ? `${priorityColors.bg} ${priorityColors.border} bg-opacity-60`
            : 'bg-gray-50 border-gray-200'
        } hover:shadow-md`}
      >
        <div className={`p-3 rounded-lg flex-shrink-0 ${isUnread ? priorityColors.badge : 'bg-gray-200'}`}>
          <IconComponent className={`w-5 h-5 ${isUnread ? 'text-inherit' : 'text-gray-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`font-bold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{notification.message}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full ${priorityColors.badge}`}>
                  {notification.priority?.toUpperCase() || 'INFO'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isUnread && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">NEW</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isUnread && (
            <button
              onClick={() => handleMarkAsRead(notification.id)}
              className="p-2 hover:bg-white rounded-lg transition"
              title="Mark as read"
            >
              <CheckCircle className="w-5 h-5 text-green-600 hover:text-green-700" />
            </button>
          )}
          <button
            onClick={() => handleDeleteNotification(notification.id)}
            className="p-2 hover:bg-white rounded-lg transition"
            title="Delete notification"
          >
            <Trash2 className="w-5 h-5 text-red-600 hover:text-red-700" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">Stay updated with real-time notifications</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleMarkAllAsRead}
              disabled={stats.unread === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Bell} label="Total Notifications" value={stats.total} color="blue" />
          <StatCard icon={Circle} label="Unread" value={stats.unread} color="red" />
          <StatCard icon={CheckCircle} label="Read" value={stats.read} color="green" />
          <StatCard icon={AlertTriangle} label="High Priority" value={stats.high} color="orange" />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
        <button
          onClick={fetchNotifications}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
            <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={e => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200 flex overflow-x-auto">
          {[
            { label: `All (${notifications.length})`, icon: Bell },
            { label: `Unread (${stats.unread})`, icon: Circle },
            { label: `Read (${stats.read})`, icon: CheckCircle }
          ].map((tab, idx) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={idx}
                onClick={() => setTabValue(idx)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
                  tabValue === idx
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;