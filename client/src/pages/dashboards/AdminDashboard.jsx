import React, { useState, useEffect } from 'react';
import {
  Users, Settings, Building, ShoppingCart, Factory, Truck,
  Store, IndianRupee, Bell, Plus, ArrowRight, TrendingUp,
  BarChart3, AlertCircle, CheckCircle2, Clock, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/compactDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [departmentsAnalytics, setDepartmentsAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/departments-analytics')
      ]);
      
      setDashboardStats(statsRes.data);
      setDepartmentsAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getDeptIcon = (dept) => {
    const icons = {
      sales: ShoppingCart,
      procurement: Factory,
      manufacturing: Factory,
      inventory: BarChart3,
      finance: IndianRupee,
      shipment: Truck,
      store: Store,
      outsourcing: Building,
      samples: Factory,
      admin: Settings
    };
    return icons[dept] || Building;
  };

  const getDeptColor = (dept) => {
    const colors = {
      sales: 'from-blue-50 to-blue-100 border-blue-300 text-blue-600',
      procurement: 'from-purple-50 to-purple-100 border-purple-300 text-purple-600',
      manufacturing: 'from-orange-50 to-orange-100 border-orange-300 text-orange-600',
      inventory: 'from-green-50 to-green-100 border-green-300 text-green-600',
      finance: 'from-red-50 to-red-100 border-red-300 text-red-600',
      shipment: 'from-indigo-50 to-indigo-100 border-indigo-300 text-indigo-600',
      store: 'from-teal-50 to-teal-100 border-teal-300 text-teal-600',
      outsourcing: 'from-pink-50 to-pink-100 border-pink-300 text-pink-600',
      samples: 'from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-600',
      admin: 'from-gray-50 to-gray-100 border-gray-300 text-gray-600'
    };
    return colors[dept] || 'from-gray-50 to-gray-100 border-gray-300 text-gray-600';
  };

  const getDeptBgColor = (dept) => {
    const colors = {
      sales: 'bg-blue-500',
      procurement: 'bg-purple-500',
      manufacturing: 'bg-orange-500',
      inventory: 'bg-green-500',
      finance: 'bg-red-500',
      shipment: 'bg-indigo-500',
      store: 'bg-teal-500',
      outsourcing: 'bg-pink-500',
      samples: 'bg-yellow-500',
      admin: 'bg-gray-500'
    };
    return colors[dept] || 'bg-gray-500';
  };

  const handleViewDepartment = (deptName) => {
    navigate(`/admin/department/${deptName}`);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const departmentList = departmentsAnalytics ? Object.values(departmentsAnalytics) : [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive business operations overview</p>
          </div>
          <button
            onClick={() => navigate('/admin/settings')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Settings size={18} />
            Settings
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Users</span>
            <Users size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats?.users.total || 0}</div>
          <div className="text-xs text-green-600 mt-1">{dashboardStats?.users.active || 0} active</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Sales Orders</span>
            <ShoppingCart size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats?.sales.totalOrders || 0}</div>
          <div className="text-xs text-yellow-600 mt-1">{dashboardStats?.sales.pendingOrders || 0} pending</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Purchase Orders</span>
            <Factory size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats?.purchases.totalOrders || 0}</div>
          <div className="text-xs text-yellow-600 mt-1">{dashboardStats?.purchases.pendingOrders || 0} pending</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Production</span>
            <Factory size={18} className="text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats?.production.totalOrders || 0}</div>
          <div className="text-xs text-green-600 mt-1">{dashboardStats?.production.completedOrders || 0} done</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Inventory Value</span>
            <BarChart3 size={18} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{((dashboardStats?.inventory.totalValue || 0) / 100000).toFixed(1)}L</div>
          <div className="text-xs text-red-600 mt-1">{dashboardStats?.inventory.lowStockItems || 0} low stock</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Shipments</span>
            <Truck size={18} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats?.business.totalCustomers || 0}</div>
          <div className="text-xs text-gray-600 mt-1">customers</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Value</span>
            <IndianRupee size={18} className="text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{((dashboardStats?.sales.totalValue || 0) / 100000).toFixed(1)}L</div>
          <div className="text-xs text-gray-600 mt-1">sales revenue</div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Department Overview</h2>
          <button
            onClick={() => setActiveTab(activeTab === 'overview' ? 'details' : 'overview')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
          >
            {activeTab === 'overview' ? 'Show Details' : 'Show Overview'} <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {departmentList.map((dept) => {
            const Icon = getDeptIcon(dept.department);
            const colorClasses = getDeptColor(dept.department);
            const bgColorClass = getDeptBgColor(dept.department);

            return (
              <div
                key={dept.department}
                onClick={() => handleViewDepartment(dept.department)}
                className={`bg-gradient-to-br ${colorClasses} border-2 rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-transform shadow-md hover:shadow-lg`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${bgColorClass} text-white p-3 rounded-lg`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-xs font-semibold bg-white/80 px-2 py-1 rounded capitalize">
                    {dept.activeEmployees}/{dept.totalEmployees}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold capitalize text-gray-900 mb-1">{dept.department}</h3>
                  <p className="text-sm text-gray-700">
                    {dept.totalEmployees} team member{dept.totalEmployees !== 1 ? 's' : ''}
                  </p>
                </div>

                {activeTab === 'overview' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Projects:</span>
                      <span className="font-semibold text-gray-900">{dept.projects}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Active:</span>
                      <span className="font-semibold text-gray-900">{dept.activeProjects}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Value:</span>
                      <span className="font-semibold text-gray-900">₹{(dept.totalValue / 100000).toFixed(1)}L</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Pending:</span>
                      <span className="font-semibold text-gray-900">{dept.pendingItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Completed:</span>
                      <span className="font-semibold text-gray-900">{dept.completedItems}</span>
                    </div>
                    {Object.entries(dept.kpis).slice(0, 1).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-semibold text-gray-900">
                          {typeof value === 'number' ? (value > 100 ? `₹${(value / 100000).toFixed(1)}L` : value) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-300/50 flex items-center text-sm font-semibold gap-1 hover:gap-2 transition-all">
                  <Eye size={16} />
                  View Details
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Employees Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Active Departments</h3>
          <div className="space-y-3">
            {departmentList.filter(d => d.totalEmployees > 0).map((dept) => (
              <div
                key={dept.department}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => handleViewDepartment(dept.department)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold capitalize text-gray-900">{dept.department}</h4>
                    <p className="text-sm text-gray-600">
                      {dept.activeEmployees} active of {dept.totalEmployees} employees
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{dept.projects} projects</div>
                    <div className="text-xs text-green-600">{dept.completedItems} completed</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Department Performance</h3>
          <div className="space-y-3">
            {departmentList.map((dept) => {
              const completionRate = dept.projects > 0 ? ((dept.completedItems / dept.projects) * 100).toFixed(0) : 0;
              return (
                <div key={dept.department} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize text-gray-900">{dept.department}</h4>
                    <span className="text-sm font-bold text-blue-600">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/users/new')}
            className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add User
          </button>
          <button
            onClick={() => navigate('/admin/roles')}
            className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Settings size={20} />
            Manage Roles
          </button>
          <button
            onClick={() => navigate('/admin/audit')}
            className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <BarChart3 size={20} />
            Audit Logs
          </button>
          <button
            onClick={fetchDashboardData}
            className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <TrendingUp size={20} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
