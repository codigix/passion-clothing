import React, { useState, useEffect } from 'react';
import { User, Users, Settings, ShieldCheck, Plus, Search, Eye, Edit, Ban, CheckCircle, AlertTriangle, LineChart, Building, ClipboardList, Bell, Download, Box, ShoppingCart, Factory, Store, Truck, IndianRupee, Cog, XCircle, Calendar, DollarSign, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [departmentOverview, setDepartmentOverview] = useState(null);
  const [stockOverview, setStockOverview] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationStats, setNotificationStats] = useState({});
  const [pendingPOs, setPendingPOs] = useState([]);
  const [pendingPOStats, setPendingPOStats] = useState({ total: 0, totalValue: 0, urgent: 0 });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const statsResponse = await api.get('/admin/dashboard-stats');
        setDashboardStats(statsResponse.data);

        // Fetch department overview
        try {
          const deptResponse = await api.get('/admin/department-overview');
          setDepartmentOverview(deptResponse.data);
        } catch (deptError) {
          toast.error('Unable to load department overview');
          setDepartmentOverview({});
        }

        // Fetch stock overview
        const stockResponse = await api.get('/admin/stock-overview');
        setStockOverview(stockResponse.data);

        // Fetch recent activities
        const activitiesResponse = await api.get('/admin/recent-activities?limit=10');
        setRecentActivities(activitiesResponse.data.activities);

        // Fetch audit logs
        const auditResponse = await api.get('/admin/audit-logs?page=1&limit=50');
        setAuditLogs(auditResponse.data.logs);

        // Fetch users
        const usersResponse = await api.get('/users?page=1&limit=20');
        setUsers(usersResponse.data.users);

        // Fetch roles
        const rolesResponse = await api.get('/admin/roles');
        setRoles(rolesResponse.data.roles);

        // Fetch notifications
        const notificationsResponse = await api.get('/notifications?limit=10&unread_only=true');
        setNotifications(notificationsResponse.data.notifications);

  // Fetch notification stats
  const notifStatsResponse = await api.get('/notifications/stats');
  setNotificationStats(notifStatsResponse.data);

        // Fetch pending approvals (including purchase orders)
        try {
          const pendingApprovalsResponse = await api.get('/admin/pending-approvals');
          const pos = pendingApprovalsResponse.data.purchaseOrders || [];
          setPendingPOs(pos);

          // Calculate stats
          const totalValue = pos.reduce((sum, po) => sum + (parseFloat(po.final_amount) || 0), 0);
          const urgentCount = pos.filter(po => po.priority === 'high' || po.priority === 'urgent').length;

          setPendingPOStats({
            total: pos.length,
            totalValue,
            urgent: urgentCount
          });
        } catch (poError) {
          console.error('Error fetching pending approvals:', poError);
          setPendingPOs([]);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // System stats derived from dashboard stats
  const systemStats = dashboardStats ? {
    totalUsers: dashboardStats.users.total,
    activeUsers: dashboardStats.users.active,
    totalRoles: roles.length,
    totalPermissions: 25, // This would need to be fetched separately if needed
    systemUptime: '99.8%',
    dailyTransactions: dashboardStats.sales.totalOrders + dashboardStats.purchases.totalOrders
  } : {
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    systemUptime: '99.8%',
    dailyTransactions: 0
  };



  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getDeptColor = (dept) => {
    const colors = {
      sales: 'bg-blue-600',
      inventory: 'bg-green-600',
      manufacturing: 'bg-orange-600',
      procurement: 'bg-purple-600',
      outsourcing: 'bg-pink-600',
      shipment: 'bg-indigo-600',
      store: 'bg-teal-600',
      finance: 'bg-red-600',
      admin: 'bg-gray-600',
      samples: 'bg-yellow-600'
    };
    return colors[dept] || 'bg-gray-600';
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle, trend }) => (
    <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase text-gray-500 mb-1 tracking-wide">{title}</div>
          <div className="text-lg font-bold text-gray-900 mb-1">{value}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
          {trend && (
            <div className="flex items-center mt-2">
              <LineChart className="text-green-600 w-4 h-4 mr-1" />
              <span className="text-xs text-green-600 font-semibold">+{trend}% from last month</span>
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 flex items-center justify-center w-14 h-14 ${color === 'primary' ? 'bg-blue-100' : color === 'success' ? 'bg-green-100' : color === 'info' ? 'bg-cyan-100' : color === 'warning' ? 'bg-yellow-100' : color === 'secondary' ? 'bg-purple-100' : 'bg-blue-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const TabPanel = ({ children, value, index }) => (
    <div className={value !== index ? 'hidden' : ''}>
      {value === index && <div className="p-4">{children}</div>}
    </div>
  );

  // --- Create User Dialog State ---
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    status: 'active',
    sendWelcome: true
  });
  const [userDialogLoading, setUserDialogLoading] = useState(false);
  const [userDialogError, setUserDialogError] = useState('');

  const handleUserInput = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateUser = async () => {
    setUserDialogError('');
    setUserDialogLoading(true);
    try {
      // Generate employee_id and temporary password
      const employeeId = `EMP${Date.now().toString().slice(-6)}`;
      const tempPassword = `TempPass${Math.random().toString(36).substring(2, 8)}`;

      const payload = {
        employee_id: employeeId,
        name: newUser.name,
        email: newUser.email,
        password: tempPassword,
        phone: newUser.phone,
        role_id: parseInt(newUser.role),
        department: newUser.department,
        status: newUser.status,
        sendWelcome: newUser.sendWelcome
      };
      await api.post('/users', payload);
      setUserDialogOpen(false);
      setNewUser({ name: '', email: '', phone: '', department: '', role: '', status: 'active', sendWelcome: true });
      // Refresh users
      const usersResponse = await api.get('/users?page=1&limit=20');
      setUsers(usersResponse.data.users);
    } catch (err) {
      setUserDialogError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setUserDialogLoading(false);
    }
  };

  const UserDialog = () => (
    userDialogOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
          <div className="px-6 py-4 border-b font-bold text-lg">Add New User</div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="w-full border rounded px-3 py-2" name="name" placeholder="Full Name" value={newUser.name} onChange={handleUserInput} />
              <input className="w-full border rounded px-3 py-2" name="email" placeholder="Email Address" type="email" value={newUser.email} onChange={handleUserInput} />
              <input className="w-full border rounded px-3 py-2" name="phone" placeholder="Phone Number" value={newUser.phone} onChange={handleUserInput} />
              <select className="w-full border rounded px-3 py-2" name="department" value={newUser.department} onChange={handleUserInput}>
                <option value="">Department</option>
                <option value="sales">Sales</option>
                <option value="procurement">Procurement</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="finance">Finance</option>
                <option value="admin">Admin</option>
              </select>
              <select className="w-full border rounded px-3 py-2" name="role" value={newUser.role} onChange={handleUserInput}>
                <option value="">Role</option>
                <option value="sales_manager">Sales Manager</option>
                <option value="procurement_officer">Procurement Officer</option>
                <option value="production_supervisor">Production Supervisor</option>
                <option value="finance_manager">Finance Manager</option>
                <option value="admin_manager">Admin Manager</option>
                <option value="superadmin">Superadmin</option>
              </select>
              <select className="w-full border rounded px-3 py-2" name="status" value={newUser.status} onChange={handleUserInput}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="mt-4 flex items-center">
              <input type="checkbox" name="sendWelcome" checked={newUser.sendWelcome} onChange={handleUserInput} className="mr-2" />
              <span>Send welcome email with login credentials</span>
            </div>
            {userDialogError && <div className="text-red-600 mt-2 text-sm">{userDialogError}</div>}
          </div>
          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setUserDialogOpen(false)} disabled={userDialogLoading}>Cancel</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleCreateUser} disabled={userDialogLoading}>{userDialogLoading ? 'Creating...' : 'Create User'}</button>
          </div>
        </div>
      </div>
    )
  );


  // --- Create Role Dialog State ---
  const [newRole, setNewRole] = useState({
    name: '',
    display_name: '',
    description: '',
    department: '',
    level: ''
  });
  const [roleDialogLoading, setRoleDialogLoading] = useState(false);
  const [roleDialogError, setRoleDialogError] = useState('');

  // --- Action Handlers ---
  const handleViewAllDepartments = () => {
    navigate('/admin/departments');
  };

  const handleViewInventory = () => {
    navigate('/admin/inventory');
  };

  const handleViewAllActivities = () => {
    navigate('/admin/activities');
  };

  const handleViewFullInventory = () => {
    navigate('/admin/inventory');
  };

  const handleUserView = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleUserEdit = (userId) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  const handleUserBan = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        // Refresh users list
        const usersResponse = await api.get('/users?page=1&limit=20');
        setUsers(usersResponse.data.users);
        alert('User deactivated successfully');
      } catch (error) {
        alert('Failed to deactivate user');
      }
    }
  };

  const handleRoleViewDetails = (roleId) => {
    navigate(`/admin/roles/${roleId}`);
  };

  const handleRoleEdit = (roleId) => {
    navigate(`/admin/roles/edit/${roleId}`);
  };

  const handleGenerateReport = (reportType) => {
    // Navigate to report generation page or trigger download
    navigate(`/admin/reports/${reportType.toLowerCase().replace(' ', '-')}`);
  };

  // ===== PURCHASE ORDER APPROVAL HANDLERS =====
  const handleApprovePO = async (po) => {
    if (!window.confirm(`Approve Purchase Order ${po.po_number || `PO-${po.id}`}?\n\nThis will send the PO to the vendor and notify the Procurement team.`)) {
      return;
    }

    try {
      const response = await api.post(`/procurement/pos/${po.id}/approve`, {
        notes: `Approved by Admin on ${new Date().toLocaleDateString()}`
      });

      toast.success('✅ Purchase Order approved! Vendor has been notified and Procurement team has been alerted.');
      
      // Refresh pending POs
      const pendingPOResponse = await api.get('/procurement/pos', {
        params: { status: 'pending_approval' }
      });
      const pos = pendingPOResponse.data.purchaseOrders || pendingPOResponse.data.pos || [];
      setPendingPOs(pos);

      // Update stats
      const totalValue = pos.reduce((sum, po) => sum + (parseFloat(po.final_amount) || 0), 0);
      const urgentCount = pos.filter(po => po.priority === 'high' || po.priority === 'urgent').length;
      setPendingPOStats({
        total: pos.length,
        totalValue,
        urgent: urgentCount
      });

    } catch (error) {
      console.error('Error approving PO:', error);
      toast.error(error.response?.data?.message || 'Failed to approve PO');
    }
  };

  const handleRejectPO = async (po) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.patch(`/procurement/pos/${po.id}`, {
        status: 'rejected',
        approval_decision_note: reason
      });

      toast.success('Purchase Order rejected');
      
      // Refresh pending POs
      const pendingPOResponse = await api.get('/procurement/pos', {
        params: { status: 'pending_approval' }
      });
      const pos = pendingPOResponse.data.purchaseOrders || pendingPOResponse.data.pos || [];
      setPendingPOs(pos);

      // Update stats
      const totalValue = pos.reduce((sum, po) => sum + (parseFloat(po.final_amount) || 0), 0);
      const urgentCount = pos.filter(po => po.priority === 'high' || po.priority === 'urgent').length;
      setPendingPOStats({
        total: pos.length,
        totalValue,
        urgent: urgentCount
      });

    } catch (error) {
      console.error('Error rejecting PO:', error);
      toast.error('Failed to reject PO');
    }
  };

  const handleViewPODetails = (poId) => {
    navigate(`/procurement/purchase-orders/${poId}`);
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return badges[priority] || badges.medium;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleRoleInput = (e) => {
    const { name, value } = e.target;
    setNewRole((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateRole = async () => {
    setRoleDialogError('');
    setRoleDialogLoading(true);
    try {
      const payload = {
        name: newRole.name,
        display_name: newRole.display_name,
        description: newRole.description,
        department: newRole.department,
        level: parseInt(newRole.level)
      };
      await api.post('/admin/roles', payload);
      setRoleDialogOpen(false);
      setNewRole({ name: '', display_name: '', description: '', department: '', level: '' });
      // Refresh roles
      const rolesResponse = await api.get('/admin/roles');
      setRoles(rolesResponse.data.roles);
    } catch (err) {
      setRoleDialogError(err.response?.data?.message || 'Failed to create role');
    } finally {
      setRoleDialogLoading(false);
    }
  };

  const RoleDialog = () => (
    roleDialogOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
          <div className="px-6 py-4 border-b font-bold text-lg">Create New Role</div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="w-full border rounded px-3 py-2" name="name" placeholder="Role Name" value={newRole.name} onChange={handleRoleInput} />
              <input className="w-full border rounded px-3 py-2" name="display_name" placeholder="Display Name" value={newRole.display_name} onChange={handleRoleInput} />
              <select className="w-full border rounded px-3 py-2" name="department" value={newRole.department} onChange={handleRoleInput}>
                <option value="">Department</option>
                <option value="sales">Sales</option>
                <option value="procurement">Procurement</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="finance">Finance</option>
                <option value="admin">Admin</option>
              </select>
              <select className="w-full border rounded px-3 py-2" name="level" value={newRole.level} onChange={handleRoleInput}>
                <option value="">Access Level</option>
                <option value="1">Level 1 (Basic)</option>
                <option value="2">Level 2 (Standard)</option>
                <option value="3">Level 3 (Manager)</option>
                <option value="4">Level 4 (Admin)</option>
                <option value="5">Level 5 (Super Admin)</option>
              </select>
              <div className="md:col-span-2">
                <textarea className="w-full border rounded px-3 py-2" name="description" placeholder="Description" rows={3} value={newRole.description} onChange={handleRoleInput} />
              </div>
            </div>
            {roleDialogError && <div className="text-red-600 mt-2 text-sm">{roleDialogError}</div>}
          </div>
          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setRoleDialogOpen(false)} disabled={roleDialogLoading}>Cancel</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleCreateRole} disabled={roleDialogLoading}>{roleDialogLoading ? 'Creating...' : 'Create Role'}</button>
          </div>
        </div>
      </div>
    )
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-4 text-gray-600">Loading dashboard data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <div className="text-xs text-gray-500 mb-4">Comprehensive overview of all departments, users, stock, and system activities</div>
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 flex items-center gap-2" onClick={() => navigate('/admin/settings')}>
              <Cog className="text-lg" /> System Settings
            </button>
            <button
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 flex items-center gap-2"
              onClick={async () => {
                try {
                  const res = await api.get('/admin/export', { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'export-data.zip');
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } catch (err) {
                  alert('Failed to export data.');
                }
              }}
            >
              <Download className="text-lg" /> Export Data
            </button>
          </div>
          <button className="px-4 py-1 text-sm font-medium text-white bg-primary border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-primary hover:text-primary  hover:bg-transparent flex gap-2 items-center" onClick={() => setUserDialogOpen(true)}>
            <Users className="text-lg" /> Add New User
          </button>
        </div>
      </div>

      {/* System Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={systemStats.totalUsers}
          icon={<Users className="text-blue-600 text-2xl" />}
          color="primary"
          subtitle={`${systemStats.activeUsers} active`}
        />
        <StatCard
          title="Pending Approvals"
          value={pendingPOStats.total}
          icon={<ClipboardList className="text-red-600 text-2xl" />}
          color="bg-red-100"
          subtitle={`${formatCurrency(pendingPOStats.totalValue)}`}
        />
        <StatCard
          title="Sales Orders"
          value={dashboardStats?.sales.totalOrders || 0}
          icon={<ShoppingCart className="text-green-600 text-2xl" />}
          color="success"
          subtitle={`${dashboardStats?.sales.pendingOrders || 0} pending`}
        />
        <StatCard
          title="Inventory Value"
          value={`₹${(dashboardStats?.inventory.totalValue || 0).toLocaleString()}`}
          icon={<Box className="text-orange-600 text-2xl" />}
          color="warning"
          subtitle={`${dashboardStats?.inventory.lowStockItems || 0} low stock items`}
        />
        <StatCard
          title="Production Orders"
          value={dashboardStats?.production.totalOrders || 0}
          icon={<Factory className="text-purple-600 text-2xl" />}
          color="secondary"
          subtitle={`${dashboardStats?.production.completedOrders || 0} completed`}
        />
        <StatCard
          title="Store Stock"
          value={dashboardStats?.store.totalStock || 0}
          icon={<Store className="text-cyan-600 text-2xl" />}
          color="info"
          subtitle={`₹${(dashboardStats?.store.totalValue || 0).toLocaleString()}`}
        />
        <StatCard
          title="Notifications"
          value={notificationStats?.unread || 0}
          icon={<Bell className="text-yellow-600 text-2xl" />}
          color="warning"
          subtitle={`${notificationStats?.total || 0} total`}
        />
      </div>

      {/* Department Overview */}
      <div className="bg-white rounded-xl shadow border border-gray-200 mb-6">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Department Overview - User Distribution</h3>
            <button
              className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 text-sm"
              onClick={handleViewAllDepartments}
            >View All Departments</button>
          </div>
        </div>
        <div className="p-4">
          {departmentOverview !== null ? (
            Object.keys(departmentOverview).length > 0 ? (
              <div className="space-y-6">
                {/* Department Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(departmentOverview).map(([dept, stats]) => (
                  <div key={dept} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${getDeptColor(dept)}`}></div>
                      <div className="font-semibold text-gray-900 capitalize">{dept}</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Users:</span>
                        <span className="font-bold text-green-600">{stats.activeUserCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Users:</span>
                        <span className="font-medium">{stats.userCount}</span>
                      </div>
                      {stats.totalOrders && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Orders:</span>
                          <span className="font-medium">{stats.totalOrders}</span>
                        </div>
                      )}
                      {stats.totalValue && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Value:</span>
                          <span className="font-medium text-blue-600">₹{stats.totalValue.toLocaleString()}</span>
                        </div>
                      )}
                      {stats.totalStock && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Stock:</span>
                          <span className="font-medium">{stats.totalStock}</span>
                        </div>
                      )}
                    </div>
                    </div>
                  ))}
                </div>

                {/* Department-wise User Details */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Department-wise User Breakdown</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(departmentOverview).map(([dept, stats]) => {
                      // Filter users by department
                      const deptUsers = users.filter(user => user.department === dept);
                      return (
                        <div key={`${dept}-users`} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-3 h-3 rounded-full ${getDeptColor(dept)}`}></div>
                            <h5 className="font-semibold text-gray-900 capitalize">{dept} Department</h5>
                            <span className="text-sm text-gray-500">({deptUsers.length} users)</span>
                          </div>
                          {deptUsers.length > 0 ? (
                            <div className="space-y-2">
                              {deptUsers.slice(0, 5).map((user) => (
                                <div key={user.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                      {user.name.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                                      <div className="text-xs text-gray-500">{user.role?.display_name || user.role}</div>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(user.status)}`}>
                                    {user.status}
                                  </span>
                                </div>
                              ))}
                              {deptUsers.length > 5 && (
                                <div className="text-center text-sm text-gray-500 pt-2">
                                  +{deptUsers.length - 5} more users
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 text-sm py-4">
                              No users in this department
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* System-wide User Summary */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">System-wide User Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-blue-600 text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
                      <div className="text-blue-800 font-medium">Active Users</div>
                      <div className="text-blue-600 text-sm">Across all departments</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="text-yellow-600 text-2xl font-bold">{users.filter(u => u.status === 'inactive').length}</div>
                      <div className="text-yellow-800 font-medium">Inactive Users</div>
                      <div className="text-yellow-600 text-sm">Deactivated accounts</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-green-600 text-2xl font-bold">{users.filter(u => u.status === 'pending').length}</div>
                      <div className="text-green-800 font-medium">Pending Users</div>
                      <div className="text-green-600 text-sm">Awaiting activation</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-purple-600 text-2xl font-bold">{roles.length}</div>
                      <div className="text-purple-800 font-medium">Total Roles</div>
                      <div className="text-purple-600 text-sm">System roles defined</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">⚠️ Failed to load department overview</div>
                <div className="text-gray-500 text-sm">Please check your permissions or try refreshing the page</div>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-500">Loading department overview...</div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-xl shadow border border-gray-200 mb-6">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
            <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 text-sm">
              View All
            </button>
          </div>
        </div>
        <div className="p-4">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className={`rounded-full p-2 ${
                    notification.priority === 'high' ? 'bg-red-100' :
                    notification.priority === 'medium' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <Bell className={`text-sm ${
                      notification.priority === 'high' ? 'text-red-600' :
                      notification.priority === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{notification.title}</div>
                    <div className="text-sm text-gray-600 mb-1">{notification.message}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString()} • {notification.type}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    notification.status === 'read' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {notification.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="text-gray-400 text-3xl mx-auto mb-2" />
              <div className="text-gray-500">No notifications</div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Overview & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Stock Overview */}
        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
              <button
                className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 text-sm"
                onClick={handleViewInventory}
              >View Inventory</button>
            </div>
          </div>
          <div >
            {stockOverview && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-red-600" />
                    <div>
                      <div className="font-medium text-red-900">Low Stock Items</div>
                      <div className="text-sm text-red-700">{stockOverview.inventory.lowStockItems} items below minimum level</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-gray-900">Top Value Items</div>
                  {stockOverview.topValueItems.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        <div className="text-xs text-gray-500">{item.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">₹{item.totalValue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{item.currentStock} units</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <button
                className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 text-sm"
                onClick={handleViewAllActivities}
              >View All</button>
            </div>
          </div>
          <div >
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-b-0">
                  <div className={`rounded-full p-2 ${
                    activity.type === 'sales_order' ? 'bg-green-100' :
                    activity.type === 'purchase_order' ? 'bg-blue-100' :
                    activity.type === 'production_order' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.type === 'sales_order' && <ShoppingCart className="text-green-600 text-sm" />}
                    {activity.type === 'purchase_order' && <Truck className="text-blue-600 text-sm" />}
                    {activity.type === 'production_order' && <Factory className="text-purple-600 text-sm" />}
                    {activity.type === 'user_registration' && <User className="text-gray-600 text-sm" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{activity.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {activity.department} • {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                    {activity.amount && (
                      <div className="text-xs font-medium text-green-600 mt-1">₹{activity.amount.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
        <div >
          <div className="font-semibold text-lg text-gray-900 mb-3">Quick Actions</div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div className="col-span-2">
              <div className="relative">
                <input className="w-full border rounded px-3 py-2 pl-9 bg-gray-50" placeholder="Search users, roles, logs..." />
                <Search className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <button
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100"
              onClick={async () => {
                try {
                  const res = await api.get('/admin/backup', { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'system-backup.zip');
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } catch (err) {
                  alert('Failed to download backup.');
                }
              }}
            >System Backup</button>
            <button className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100" onClick={() => navigate('/admin/audit-logs')}>Audit Logs</button>
            <button
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100"
              onClick={async () => {
                try {
                  const res = await api.get('/admin/system-reports', { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'system-reports.zip');
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } catch (err) {
                  alert('Failed to download system reports.');
                }
              }}
            >System Reports</button>
            <button className="px-4 py-1 text-sm font-medium text-white bg-green-600 border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-green-600 hover:text-success hover:bg-transparent flex gap-2 items-center w-fit"><Download /> Export Data</button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        <div className="border-b bg-gray-50">
          <div className="flex gap-2 overflow-x-auto">
            {['Pending Approvals', 'User Management', 'Role & Permissions', 'Department Analytics', 'Stock Management', 'System Configuration', 'Audit Logs', 'Reports'].map((tab, idx) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${tabValue === idx ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'} ${tab === 'Pending Approvals' && pendingPOStats.total > 0 ? 'relative' : ''}`}
                onClick={() => setTabValue(idx)}
              >
                {tab}
                {tab === 'Pending Approvals' && pendingPOStats.total > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                    {pendingPOStats.total}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <TabPanel value={tabValue} index={0}>
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Purchase Orders - Pending Approval</h2>
                <p className="text-sm text-gray-600">Review and approve purchase orders submitted by the Procurement team</p>
              </div>
              <button
                onClick={() => navigate('/procurement/purchase-orders')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                View All POs
              </button>
            </div>

            {/* Stats Cards for Pending Approvals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 mb-1 font-medium">Pending Orders</p>
                    <p className="text-3xl font-bold text-blue-900">{pendingPOStats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 mb-1 font-medium">Total Value</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(pendingPOStats.totalValue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 mb-1 font-medium">Urgent Priority</p>
                    <p className="text-3xl font-bold text-red-900">{pendingPOStats.urgent}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-200 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pending POs List */}
            {pendingPOs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up! 🎉</h3>
                <p className="text-gray-600">No purchase orders pending approval at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPOs.map((po) => (
                  <div key={po.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            {po.po_number || `PO-${po.id}`}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityBadge(po.priority)}`}>
                            {(po.priority || 'medium').toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                            PENDING APPROVAL
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{po.vendor?.name || 'Unknown Vendor'}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{po.customer?.name || po.client_name || 'N/A'}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>Expected: {formatDate(po.expected_delivery_date)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Package className="w-4 h-4 flex-shrink-0" />
                            <span>{po.items?.length || 0} items</span>
                          </div>
                        </div>

                        {po.project_name && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Project:</span> {po.project_name}
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(po.final_amount)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleViewPODetails(po.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>

                      <button
                        onClick={() => handleApprovePO(po)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve Order
                      </button>

                      <button
                        onClick={() => handleRejectPO(po)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div >
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold text-lg text-gray-900">User Management ({users.length})</div>
              <button className="px-4 py-1 text-sm font-medium text-white bg-primary border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-primary hover:text-primary  hover:bg-transparent flex gap-2 items-center" onClick={() => setUserDialogOpen(true)}><Plus /> Add User</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="font-semibold text-gray-700 p-2 border-b">User</th>
                    <th className="font-semibold text-gray-700 p-2 border-b">Email</th>
                    <th className="font-semibold text-gray-700 p-2 border-b">Role</th>
                    <th className="font-semibold text-gray-700 p-2 border-b">Department</th>
                    <th className="font-semibold text-gray-700 p-2 border-b">Status</th>
                    <th className="font-semibold text-gray-700 p-2 border-b">Last Login</th>
                    <th className="font-semibold text-gray-700 p-2 border-b">Created Date</th>
                    <th className="font-semibold text-gray-700 p-2 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 border-b">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-base">{user.name.charAt(0)}</div>
                          <span className="font-semibold text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-2 text-gray-700">{user.email}</td>
                      <td className="p-2 text-gray-700">{user.role?.display_name || user.role}</td>
                      <td className="p-2 text-gray-700">{user.department}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(user.status)}`}>{user.status.toUpperCase()}</span>
                      </td>
                      <td className="p-2 text-gray-700">{user.lastLogin}</td>
                      <td className="p-2 text-gray-700">{user.createdDate}</td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                            onClick={() => handleUserView(user.id)}
                          ><Eye /></button>
                          <button
                            className="p-2 rounded bg-purple-100 text-purple-600 hover:bg-purple-200"
                            onClick={() => handleUserEdit(user.id)}
                          ><Edit /></button>
                          <button
                            className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
                            onClick={() => handleUserBan(user.id)}
                          ><Ban /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <div >
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold text-lg text-gray-900">Roles & Permissions ({roles.length})</div>
              <button className="px-4 py-1 text-sm font-medium text-white bg-primary border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-primary hover:text-primary  hover:bg-transparent flex gap-2 items-center" onClick={() => setRoleDialogOpen(true)}><Plus /> Create Role</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-xl bg-white shadow p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-lg text-gray-900">{role.name}</div>
                      <div className="text-xs text-gray-500">{role.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(role.status)}`}>{role.status.toUpperCase()}</span>
                  </div>
                  <div className="mb-2 text-blue-600 font-medium">{role.userCount} users assigned</div>
                  <div className="mb-2">
                    <div className="font-semibold text-sm mb-1">Permissions:</div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <span key={permission.id || permission} className="px-2 py-1 border rounded text-xs bg-gray-50">
                          {typeof permission === 'object' ? (permission.name || `${permission.module}:${permission.action}`).replace(/_/g, ' ') : permission.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="px-2 py-1 border rounded text-xs bg-blue-50 text-blue-600">+{role.permissions.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      className="px-2 py-1 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 w-full"
                      onClick={() => handleRoleViewDetails(role.id)}
                    >View Details</button>
                    <button
                      className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 w-full"
                      onClick={() => handleRoleEdit(role.id)}
                    >Edit Role</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <div >
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold text-lg text-gray-900">Department Analytics</div>
              <button
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100"
                onClick={async () => {
                  try {
                    const res = await api.get('/admin/export-report', { responseType: 'blob' });
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'department-analytics-report.zip');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  } catch (err) {
                    alert('Failed to export department analytics report.');
                  }
                }}
              >Export Report</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department Performance */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Department Performance</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                 {departmentOverview && Object.entries(departmentOverview).map(([dept, stats]) => (
                   <div key={dept} className="bg-white rounded-lg p-4 border">
                     <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-3">
                         <div className={`w-4 h-4 rounded ${getDeptColor(dept)}`}></div>
                         <span className="capitalize font-medium text-lg">{dept}</span>
                       </div>
                       <div className="text-right">
                         <div className="font-semibold text-blue-600">{stats.activeUserCount} active</div>
                         <div className="text-xs text-gray-500">{stats.userCount} total users</div>
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                       {dept === 'sales' && (
                         <>
                           <div>Total Orders: <span className="font-semibold">{stats.totalOrders || 0}</span></div>
                           <div>Pending Orders: <span className="font-semibold">{stats.pendingOrders || 0}</span></div>
                           <div>Total Value: <span className="font-semibold">₹{(stats.totalValue || 0).toLocaleString()}</span></div>
                         </>
                       )}
                       {dept === 'inventory' && (
                         <>
                           <div>Total Items: <span className="font-semibold">{stats.totalItems || 0}</span></div>
                           <div>Low Stock Items: <span className="font-semibold text-red-600">{stats.lowStockItems || 0}</span></div>
                           <div>Total Value: <span className="font-semibold">₹{(stats.totalValue || 0).toLocaleString()}</span></div>
                         </>
                       )}
                       {dept === 'manufacturing' && (
                         <>
                           <div>Total Orders: <span className="font-semibold">{stats.totalOrders || 0}</span></div>
                           <div>Completed Orders: <span className="font-semibold">{stats.completedOrders || 0}</span></div>
                         </>
                       )}
                       {dept === 'procurement' && (
                         <>
                           <div>Total Orders: <span className="font-semibold">{stats.totalOrders || 0}</span></div>
                           <div>Pending Orders: <span className="font-semibold">{stats.pendingOrders || 0}</span></div>
                           <div>Total Value: <span className="font-semibold">₹{(stats.totalValue || 0).toLocaleString()}</span></div>
                         </>
                       )}
                       {dept === 'store' && (
                         <>
                           <div>Total Stock: <span className="font-semibold">{stats.totalStock || 0}</span></div>
                           <div>Total Value: <span className="font-semibold">₹{(stats.totalValue || 0).toLocaleString()}</span></div>
                         </>
                       )}
                       {dept === 'outsourcing' && (
                         <>
                           <div>Total Orders: <span className="font-semibold">{stats.totalOrders || 0}</span></div>
                           <div>Completed Orders: <span className="font-semibold">{stats.completedOrders || 0}</span></div>
                         </>
                       )}
                       {dept === 'shipment' && (
                         <>
                           <div>Total Shipments: <span className="font-semibold">{stats.totalShipments || 0}</span></div>
                           <div>Pending Shipments: <span className="font-semibold">{stats.pendingShipments || 0}</span></div>
                           <div>Delivered: <span className="font-semibold">{stats.deliveredShipments || 0}</span></div>
                           <div>Shipping Cost: <span className="font-semibold">₹{(stats.totalShippingCost || 0).toLocaleString()}</span></div>
                         </>
                       )}
                       {dept === 'finance' && (
                         <>
                           <div>Total Payments: <span className="font-semibold">{stats.totalPayments || 0}</span></div>
                           <div>Pending Payments: <span className="font-semibold">{stats.pendingPayments || 0}</span></div>
                           <div>Completed: <span className="font-semibold">{stats.completedPayments || 0}</span></div>
                           <div>Total Amount: <span className="font-semibold">₹{(stats.totalPaymentAmount || 0).toLocaleString()}</span></div>
                         </>
                       )}
                       {dept === 'samples' && (
                         <>
                           <div>Total Samples: <span className="font-semibold">{stats.totalSamples || 0}</span></div>
                           <div>Pending Samples: <span className="font-semibold">{stats.pendingSamples || 0}</span></div>
                           <div>Delivered: <span className="font-semibold">{stats.completedSamples || 0}</span></div>
                           <div>Total Cost: <span className="font-semibold">₹{(stats.totalSampleCost || 0).toLocaleString()}</span></div>
                         </>
                       )}
                       {dept === 'admin' && (
                         <>
                           <div>Admin Users: <span className="font-semibold">{stats.userCount || 0}</span></div>
                         </>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </div>

              {/* Department Metrics */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Key Metrics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Departments</span>
                    <span className="font-semibold">{departmentOverview ? Object.keys(departmentOverview).length : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-semibold">{dashboardStats?.users.active || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Sales Value</span>
                    <span className="font-semibold">₹{(dashboardStats?.sales.totalValue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Inventory Value</span>
                    <span className="font-semibold">₹{(dashboardStats?.inventory.totalValue || 0).toLocaleString()}</span>
                  </div>
                </div>
             </div>
           </div>
         </div>
       </TabPanel>

       <TabPanel value={tabValue} index={4}>
         <div >
           <div className="flex justify-between items-center mb-4">
             <div className="font-semibold text-lg text-gray-900">Stock Management</div>
             <button
               className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100"
               onClick={handleViewFullInventory}
             >View Full Inventory</button>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Inventory Summary */}
             <div className="space-y-4">
               <div className="bg-white border rounded-lg p-4">
                 <h4 className="font-semibold text-gray-900 mb-3">Inventory Summary</h4>
                 <div className="space-y-2">
                   <div className="flex justify-between">
                     <span className="text-gray-600">Total Items</span>
                     <span className="font-semibold">{stockOverview?.inventory.totalItems || 0}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-600">Total Value</span>
                     <span className="font-semibold">₹{(stockOverview?.inventory.totalValue || 0).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-600">Available Stock</span>
                     <span className="font-semibold">{stockOverview?.inventory.availableStock || 0}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-600">Reserved Stock</span>
                     <span className="font-semibold">{stockOverview?.inventory.reservedStock || 0}</span>
                   </div>
                 </div>
               </div>

               {/* Store Stock Summary */}
               <div className="bg-white border rounded-lg p-4">
                 <h4 className="font-semibold text-gray-900 mb-3">Store Locations</h4>
                 <div className="space-y-2">
                   {stockOverview?.storeSummary.map((store) => (
                     <div key={store.location} className="flex justify-between items-center">
                       <span className="text-gray-600">{store.location}</span>
                       <div className="text-right">
                         <div className="font-semibold">{store.totalStock} units</div>
                         <div className="text-xs text-gray-500">₹{store.totalValue.toLocaleString()}</div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             {/* Stock Alerts and Top Items */}
             <div className="space-y-4">
               {/* Low Stock Alerts */}
               <div className="bg-white border rounded-lg p-4">
                 <h4 className="font-semibold text-gray-900 mb-3">Low Stock Alerts</h4>
                 <div className="space-y-2">
                   {stockOverview?.lowStockItems.slice(0, 5).map((item) => (
                     <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                       <div>
                         <div className="font-medium text-red-900">{item.productName}</div>
                         <div className="text-sm text-red-700">{item.location}</div>
                       </div>
                       <div className="text-right">
                         <div className="font-semibold text-red-900">{item.availableStock}/{item.minimumLevel}</div>
                         <div className="text-xs text-red-600">min level</div>
                       </div>
                     </div>
                   ))}
                   {(!stockOverview?.lowStockItems || stockOverview.lowStockItems.length === 0) && (
                     <div className="text-center text-green-600 py-4">All items above minimum stock levels</div>
                   )}
                 </div>
               </div>

               {/* Top Value Items */}
               <div className="bg-white border rounded-lg p-4">
                 <h4 className="font-semibold text-gray-900 mb-3">Top Value Items</h4>
                 <div className="space-y-2">
                   {stockOverview?.topValueItems.slice(0, 5).map((item) => (
                     <div key={item.id} className="flex justify-between items-center">
                       <div>
                         <div className="font-medium text-gray-900">{item.productName}</div>
                         <div className="text-xs text-gray-500">{item.location}</div>
                       </div>
                       <div className="text-right">
                         <div className="font-semibold text-gray-900">₹{item.totalValue.toLocaleString()}</div>
                         <div className="text-xs text-gray-500">{item.currentStock} units</div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>
         </div>
       </TabPanel>

       <TabPanel value={tabValue} index={5}>
         <div >
           <div className="flex justify-between items-center mb-4">
             <div className="font-semibold text-lg text-gray-900">System Configuration</div>
             <button
               className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100"
               onClick={async () => {
                 try {
                   // Collect settings values from the form (example only, should use controlled state for production)
                   const systemName = document.querySelector('input[defaultValue="Passion Inventory System"]').value;
                   const defaultCurrency = document.querySelectorAll('select')[0].value;
                   const sessionTimeout = document.querySelector('input[defaultValue="60"]').value;
                   const emailNotifications = document.querySelectorAll('select')[1].value;
                   const autoBackup = document.querySelectorAll('select')[2].value;
                   const backupRetention = document.querySelector('input[defaultValue="30"]').value;
                   await api.put('/admin/settings', {
                     systemName,
                     defaultCurrency,
                     sessionTimeout,
                     emailNotifications,
                     autoBackup,
                     backupRetention
                   });
                   alert('Settings saved successfully.');
                 } catch (err) {
                   alert('Failed to save settings.');
                 }
               }}
             >Save Changes</button>
           </div>
           <div className="space-y-6">
             <div className="bg-gray-50 rounded-lg p-4">
               <h4 className="font-semibold text-gray-900 mb-3">System Settings</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
                   <input type="text" className="w-full border rounded px-3 py-2" defaultValue="Passion Inventory System" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                   <select className="w-full border rounded px-3 py-2">
                     <option>INR (₹)</option>
                     <option>USD ($)</option>
                     <option>EUR (€)</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                   <input type="number" className="w-full border rounded px-3 py-2" defaultValue="60" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label>
                   <select className="w-full border rounded px-3 py-2">
                     <option>Enabled</option>
                     <option>Disabled</option>
                   </select>
                 </div>
               </div>
             </div>

             <div className="bg-gray-50 rounded-lg p-4">
               <h4 className="font-semibold text-gray-900 mb-3">Backup Settings</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Auto Backup Frequency</label>
                   <select className="w-full border rounded px-3 py-2">
                     <option>Daily</option>
                     <option>Weekly</option>
                     <option>Monthly</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Backup Retention (days)</label>
                   <input type="number" className="w-full border rounded px-3 py-2" defaultValue="30" />
                 </div>
               </div>
             </div>
           </div>
         </div>
       </TabPanel>

       <TabPanel value={tabValue} index={6}>
         <div >
           <div className="flex justify-between items-center mb-4">
             <div className="font-semibold text-lg text-gray-900">Audit Logs</div>
             <button
               className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100"
               onClick={async () => {
                 try {
                   const res = await api.post('/admin/export-logs', {}, { responseType: 'blob' });
                   const url = window.URL.createObjectURL(new Blob([res.data]));
                   const link = document.createElement('a');
                   link.href = url;
                   link.setAttribute('download', 'audit-logs.csv');
                   document.body.appendChild(link);
                   link.click();
                   link.remove();
                 } catch (err) {
                   alert('Failed to export logs.');
                 }
               }}
             >Export Logs</button>
           </div>
           <div className="overflow-x-auto">
             <table className="min-w-full text-sm">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="font-semibold text-gray-700 p-2 border-b">Timestamp</th>
                   <th className="font-semibold text-gray-700 p-2 border-b">User</th>
                   <th className="font-semibold text-gray-700 p-2 border-b">Action</th>
                   <th className="font-semibold text-gray-700 p-2 border-b">Resource</th>
                   <th className="font-semibold text-gray-700 p-2 border-b">Details</th>
                   <th className="font-semibold text-gray-700 p-2 border-b">Severity</th>
                 </tr>
               </thead>
               <tbody>
                 {auditLogs.map((log) => (
                   <tr key={log.id} className="hover:bg-gray-50 border-b">
                     <td className="p-2 text-gray-700">{new Date(log.timestamp).toLocaleString()}</td>
                     <td className="p-2 text-gray-700">{log.user}</td>
                     <td className="p-2 text-gray-700">{log.action}</td>
                     <td className="p-2 text-gray-700">{log.resource}</td>
                     <td className="p-2 text-gray-700">{log.details}</td>
                     <td className="p-2">
                       <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(log.severity)}`}>{log.severity.toUpperCase()}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       </TabPanel>

       <TabPanel value={tabValue} index={7}>
         <div >
           <div className="flex justify-between items-center mb-4">
             <div className="font-semibold text-lg text-gray-900">Reports & Analytics</div>
             <button
               className="px-4 py-1 text-sm font-medium text-white bg-primary border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-primary hover:text-primary  hover:bg-transparent flex gap-2 items-center"
               onClick={async () => {
                 try {
                   const res = await api.get('/admin/generate-report', { responseType: 'blob' });
                   const url = window.URL.createObjectURL(new Blob([res.data]));
                   const link = document.createElement('a');
                   link.href = url;
                   link.setAttribute('download', 'system-report.zip');
                   document.body.appendChild(link);
                   link.click();
                   link.remove();
                 } catch (err) {
                   alert('Failed to generate report.');
                 }
               }}
             >Generate Report</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[
               { title: 'Sales Report', icon: <LineChart className="text-green-600 text-2xl mx-auto mb-2" />, desc: 'Monthly sales performance and trends', action: 'Generate Sales Report' },
               { title: 'Inventory Report', icon: <Box className="text-blue-600 text-2xl mx-auto mb-2" />, desc: 'Stock levels, valuation, and turnover', action: 'Generate Inventory Report' },
               { title: 'Financial Report', icon: <IndianRupee className="text-purple-600 text-2xl mx-auto mb-2" />, desc: 'Revenue, expenses, and profitability', action: 'Generate Financial Report' },
               { title: 'Production Report', icon: <Factory className="text-orange-600 text-2xl mx-auto mb-2" />, desc: 'Manufacturing efficiency and output', action: 'Generate Production Report' },
               { title: 'User Activity Report', icon: <Users className="text-indigo-600 text-2xl mx-auto mb-2" />, desc: 'User engagement and department activity', action: 'Generate Activity Report' },
               { title: 'Custom Report', icon: <ClipboardList className="text-gray-600 text-2xl mx-auto mb-2" />, desc: 'Build custom reports with filters', action: 'Create Custom Report' }
             ].map((report) => (
               <div key={report.title} className="border rounded-xl bg-white shadow p-4 text-center cursor-pointer hover:shadow-lg transition-all">
                 {report.icon}
                 <div className="font-semibold text-lg text-gray-900 mb-1">{report.title}</div>
                 <div className="text-xs text-gray-500 mb-3">{report.desc}</div>
                 <button
                   className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 w-full text-sm"
                   onClick={() => handleGenerateReport(report.title)}
                 >{report.action}</button>
               </div>
             ))}
           </div>
           <div className="mt-6 bg-gray-50 rounded-lg p-4">
             <h4 className="font-semibold text-gray-900 mb-3">Recent Reports</h4>
             <div className="space-y-2">
               {[
                 { name: 'Monthly Sales Report - November 2024', date: '2024-11-30', size: '2.3 MB' },
                 { name: 'Inventory Valuation Report - Q4 2024', date: '2024-11-25', size: '1.8 MB' },
                 { name: 'User Activity Summary - November 2024', date: '2024-11-20', size: '956 KB' }
               ].map((report) => (
                 <div key={report.name} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                   <div>
                     <div className="font-medium text-gray-900">{report.name}</div>
                     <div className="text-xs text-gray-500">Generated on {report.date} • {report.size}</div>
                   </div>
                   <div className="flex gap-2">
                     <button
                       className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 text-sm"
                       onClick={async () => {
                         try {
                           // Use report.name as identifier for download
                           const res = await api.get(`/admin/download-report?name=${encodeURIComponent(report.name)}`, { responseType: 'blob' });
                           const url = window.URL.createObjectURL(new Blob([res.data]));
                           const link = document.createElement('a');
                           link.href = url;
                           link.setAttribute('download', `${report.name.replace(/\s+/g, '_')}.pdf`);
                           document.body.appendChild(link);
                           link.click();
                           link.remove();
                         } catch (err) {
                           alert('Failed to download report.');
                         }
                       }}
                     >Download</button>
                     <button
                       className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 text-sm"
                       onClick={async () => {
                         try {
                           // Use report.name as identifier for view
                           const res = await api.get(`/admin/view-report?name=${encodeURIComponent(report.name)}`, { responseType: 'blob' });
                           const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                           window.open(url, '_blank');
                         } catch (err) {
                           alert('Failed to view report.');
                         }
                       }}
                     >View</button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </TabPanel>

      </div>

      <UserDialog />
      <RoleDialog />
    </div>
  );
};

export default AdminDashboard;