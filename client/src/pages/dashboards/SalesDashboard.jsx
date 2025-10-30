import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaPlus, FaSearch, FaEye, FaEdit, FaChartLine, FaClock, FaCheckCircle, FaTruck, FaMoneyBill, FaUser, FaClipboardList, FaDownload, FaSpinner, FaExclamationTriangle, FaFilter, FaCalendarAlt, FaFileExport, FaQrcode, FaPaperPlane, FaEllipsisV, FaStar, FaTh } from 'react-icons/fa';
import { ShoppingCart, Clock, CheckCircle, DollarSign, TrendingUp, Target, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import MinimalStatCard from '../../components/common/MinimalStatCard';
import Tooltip from '../../components/common/Tooltip';
import '../../styles/compactDashboard.css';

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [salesOrders, setSalesOrders] = useState([]);
  const [salesPipeline, setSalesPipeline] = useState([]);
  const [customerStats, setCustomerStats] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Fetch dashboard data function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await api.get('/sales/dashboard/stats');
      setStats(statsResponse.data);

      // Fetch sales orders
      const ordersResponse = await api.get('/sales/orders?page=1&limit=20');
      setSalesOrders(ordersResponse.data.orders);

      // Fetch sales pipeline
      const pipelineResponse = await api.get('/sales/pipeline');
      setSalesPipeline(pipelineResponse.data.pipeline);

    } catch (err) {
      console.error('Error fetching sales dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle export orders
  const handleExportOrders = async () => {
    try {
      setExporting(true);

      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (dateFilter.from) params.append('date_from', dateFilter.from);
      if (dateFilter.to) params.append('date_to', dateFilter.to);

      const response = await api.get(`/sales/export?${params}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales_orders.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Orders exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export orders');
    } finally {
      setExporting(false);
    }
  };

  // Handle view order details
  const handleViewOrder = (orderId) => {
    navigate(`/sales/orders/${orderId}`);
  };

  // Handle edit order
  const handleEditOrder = (orderId) => {
    navigate(`/sales/orders/edit/${orderId}`);
  };

  // Handle show QR code
  const handleShowQrCode = (order) => {
    setSelectedOrder(order);
    setQrDialogOpen(true);
  };

  // Handle send to procurement
  const handleSendToProcurement = async (order) => {
    if (window.confirm(`Are you sure you want to send order ${order.order_number} to procurement?\n\nThe order will remain in 'draft' status until procurement confirms it.`)) {
      try {
        // Use dedicated send-to-procurement endpoint
        const response = await api.put(`/sales/orders/${order.id}/send-to-procurement`);

        toast.success(response.data.message || 'Order sent to procurement successfully. Awaiting procurement confirmation.');
        // Refresh data
        fetchDashboardData();
      } catch (error) {
        console.error('Error sending to procurement:', error);
        
        // Show specific error message
        const errorMessage = error.response?.data?.message || 'Failed to send order to procurement';
        const currentStatus = error.response?.data?.currentStatus;
        
        if (currentStatus) {
          toast.error(`${errorMessage}. Current status: ${currentStatus}`);
        } else {
          toast.error(errorMessage);
        }
      }
    }
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    // This would filter the orders locally or make a new API call
    // For now, we'll implement basic client-side filtering
    if (searchTerm) {
      // Filter logic would go here
      console.log('Searching for:', searchTerm);
    }
  };

  // Get status color for badges
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-slate-100 text-slate-700 border border-slate-300',
      pending_approval: 'bg-amber-100 text-amber-700 border border-amber-300',
      confirmed: 'bg-blue-100 text-blue-700 border border-blue-300',
      in_production: 'bg-indigo-100 text-indigo-700 border border-indigo-300',
      ready_to_ship: 'bg-cyan-100 text-cyan-700 border border-cyan-300',
      shipped: 'bg-blue-100 text-blue-700 border border-blue-300',
      delivered: 'bg-green-100 text-green-700 border border-green-300',
      completed: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      cancelled: 'bg-red-100 text-red-700 border border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border border-gray-300';
  };

  // Get status gradient bg for cards
  const getStatusGradient = (status) => {
    const gradients = {
      draft: 'from-slate-50 to-slate-100',
      pending_approval: 'from-amber-50 to-amber-100',
      confirmed: 'from-blue-50 to-blue-100',
      in_production: 'from-indigo-50 to-indigo-100',
      ready_to_ship: 'from-cyan-50 to-cyan-100',
      shipped: 'from-blue-50 to-blue-100',
      delivered: 'from-green-50 to-green-100',
      completed: 'from-emerald-50 to-emerald-100',
      cancelled: 'from-red-50 to-red-100'
    };
    return gradients[status] || 'from-gray-50 to-gray-100';
  };

  // Calculate progress based on status
  const getOrderProgress = (status) => {
    const progressMap = {
      draft: 10,
      pending_approval: 25,
      confirmed: 40,
      in_production: 65,
      ready_to_ship: 85,
      shipped: 90,
      delivered: 95,
      completed: 100,
      cancelled: 0
    };
    return progressMap[status] || 0;
  };

  // Get trend indicator
  const getTrendIndicator = (current, previous) => {
    if (!previous) return { text: 'New', color: 'text-green-600', icon: '📈' };
    const percentage = ((current - previous) / previous * 100).toFixed(1);
    if (percentage > 0) return { text: `+${percentage}%`, color: 'text-green-600', icon: '📈' };
    if (percentage < 0) return { text: `${percentage}%`, color: 'text-red-600', icon: '📉' };
    return { text: '0%', color: 'text-gray-600', icon: '➡️' };
  };

  const TabPanel = ({ children, value, index }) => (
    <div className={value !== index ? 'hidden' : ''}>
      {value === index && <div>{children}</div>}
    </div>
  );

  // Filter orders based on status
  const filteredOrders = filterStatus === 'all'
    ? salesOrders
    : salesOrders.filter(order => order.status === filterStatus);

  // Loading component
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-5xl text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading sales dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center max-w-sm">
            <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/20 rounded-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">Sales Dashboard</h1>
            </div>
            <p className="text-blue-100 text-sm font-medium">Monitor sales performance, manage orders & track revenue</p>
          </div>
          <button
            className="px-5 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-lg font-semibold flex items-center gap-2 hover:shadow-xl"
            onClick={() => navigate('/sales/orders/create')}
          >
            <FaPlus size={16} />
            Create Order
          </button>
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Orders Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all hover:border-blue-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.totalOrders || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-semibold">+12%</span>
              <span className="text-gray-600">vs last month</span>
            </div>
          </div>

          {/* Active Orders Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all hover:border-amber-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Orders</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.pendingOrders || 0}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-amber-600 font-semibold">5 pending</span>
              <span className="text-gray-600">approval</span>
            </div>
          </div>

          {/* Completed Orders Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all hover:border-green-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed Orders</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.orderStats?.find(s => s.status === 'completed')?.count || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">78% completion rate</p>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all hover:border-indigo-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">₹{((stats?.totalRevenue || 0) / 100000).toFixed(1)}L</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-semibold">+8.5%</span>
              <span className="text-gray-600">this quarter</span>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Orders</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" size={16} />
                <input
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="Search by order number, customer name..."
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="draft">Draft</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="ready_to_ship">Ready to Ship</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 items-end">
              <button
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                onClick={() => navigate('/sales/reports')}
                title="View detailed reports"
              >
                <FaChartLine size={16} />
                <span className="hidden sm:inline">Reports</span>
              </button>
              <button
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                onClick={handleExportOrders}
                disabled={exporting}
                title="Export orders to CSV"
              >
                {exporting ? <FaSpinner className="animate-spin" size={16} /> : <FaFileExport size={16} />}
                <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50 px-6">
            <div className="flex gap-1">
              {[
                { label: 'Sales Orders', icon: FaClipboardList },
                { label: 'Sales Pipeline', icon: TrendingUp },
                { label: 'Customer Management', icon: FaUser }
              ].map((tab, idx) => (
                <button
                  key={tab.label}
                  className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
                    tabValue === idx
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => setTabValue(idx)}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <div className="p-6">
              {/* Orders Header with View Mode Toggle */}
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">Sales Orders</h3>
                  <p className="text-gray-600 text-sm mt-1">{filteredOrders.length} orders found</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      viewMode === 'table' 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'border-gray-300 text-gray-600 hover:border-blue-300'
                    }`}
                    onClick={() => setViewMode('table')}
                    title="Table view"
                  >
                    <FaClipboardList size={16} />
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      viewMode === 'cards' 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'border-gray-300 text-gray-600 hover:border-blue-300'
                    }`}
                    onClick={() => setViewMode('cards')}
                    title="Card view"
                  >
                    <FaTh size={16} />
                  </button>
                </div>
              </div>

              {/* Orders Display */}
              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                    <FaClipboardList className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium text-lg">No orders found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or create a new order</p>
                  <button
                    onClick={() => navigate('/sales/orders/create')}
                    className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <FaPlus className="inline mr-2" />
                    Create New Order
                  </button>
                </div>
              ) : viewMode === 'cards' ? (
                // Card View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`rounded-lg border border-gray-200 p-5 bg-gradient-to-br ${getStatusGradient(order.status)} hover:shadow-lg transition-all cursor-pointer group`}
                      onClick={() => handleViewOrder(order.id)}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Order #</p>
                          <p className="text-lg font-bold text-gray-800 group-hover:text-blue-600">{order.order_number}</p>
                        </div>
                        <button
                          className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-gray-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === order.id ? null : order.id);
                          }}
                        >
                          <FaEllipsisV size={16} />
                        </button>
                      </div>

                      {/* Customer Info */}
                      <div className="mb-4 pb-4 border-b border-gray-300/40">
                        <p className="text-xs text-gray-600 font-medium">Customer</p>
                        <p className="text-sm font-semibold text-gray-800">{order.customer?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-600 mt-1">{order.customer?.phone || '-'}</p>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Quantity</span>
                          <span className="font-semibold text-gray-800">{order.total_quantity || 0} units</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Amount</span>
                          <span className="font-bold text-lg text-gray-800">₹{order.final_amount?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}</span>
                        </div>
                      </div>

                      {/* Status and Progress */}
                      <div className="mb-4 pb-4 border-b border-gray-300/40">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <div className="w-full bg-gray-300/30 rounded-full h-2 mt-3">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${getOrderProgress(order.status)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">{getOrderProgress(order.status)}% complete</p>
                      </div>

                      {/* Delivery Date */}
                      <p className="text-xs text-gray-600 mb-4">
                        <span className="font-medium">Delivery:</span> {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not set'}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                          onClick={(e) => { e.stopPropagation(); handleViewOrder(order.id); }}
                        >
                          <FaEye size={14} />
                          View
                        </button>
                        <button
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleEditOrder(order.id); }}
                        >
                          <FaEdit size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Table View
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="font-semibold text-gray-700 text-xs px-4 py-3 text-left">Order</th>
                        <th className="font-semibold text-gray-700 text-xs px-4 py-3 text-left">Customer</th>
                        <th className="font-semibold text-gray-700 text-xs px-4 py-3 text-left">Products</th>
                        <th className="font-semibold text-gray-700 text-xs px-4 py-3 text-right">Qty</th>
                        <th className="font-semibold text-gray-700 text-xs px-4 py-3 text-right">Amount</th>
                        <th className="font-semibold text-gray-700 text-xs px-4 py-3 text-center">Status</th>
                        <th className="font-semibold text-gray-700 text-xs px-4 py-3 text-center">Progress</th>
                        <th className="font-semibold text-gray-700 text-xs px-4 py-3 text-left">Delivery</th>
                        <th className="font-semibold text-gray-700 text-xs px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-blue-50 border-b border-gray-100 transition-colors group cursor-pointer"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900 group-hover:text-blue-600">{order.order_number}</td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{order.customer?.phone || '-'}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-gray-700 max-w-xs">
                              {order.items && order.items.length > 0 ? (
                                <div>
                                  {order.items.slice(0, 1).map((item, idx) => (
                                    <div key={idx} className="truncate">{item.product_name}</div>
                                  ))}
                                  {order.items.length > 1 && (
                                    <div className="text-gray-500">+{order.items.length - 1} more</div>
                                  )}
                                </div>
                              ) : (
                                'No products'
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">{order.total_quantity || 0}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">₹{order.final_amount?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {order.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 rounded-full bg-blue-600"
                                  style={{ width: `${getOrderProgress(order.status)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-gray-600">{getOrderProgress(order.status)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Tooltip text="View">
                                <button
                                  className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600"
                                  onClick={(e) => { e.stopPropagation(); handleViewOrder(order.id); }}
                                >
                                  <FaEye size={14} />
                                </button>
                              </Tooltip>
                              <Tooltip text="Edit">
                                <button
                                  className="p-2 hover:bg-amber-100 rounded transition-colors text-amber-600"
                                  onClick={(e) => { e.stopPropagation(); handleEditOrder(order.id); }}
                                >
                                  <FaEdit size={14} />
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Sales Pipeline Tab */}
          <TabPanel value={tabValue} index={1}>
            <div className="p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-4">Sales Pipeline</h3>
              {salesPipeline && salesPipeline.length > 0 ? (
                <div className="space-y-4">
                  {salesPipeline.map((stage, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-800">{stage.stage}</h4>
                        <span className="text-2xl font-bold text-blue-600">{stage.count || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${(stage.count / (salesPipeline.reduce((acc, s) => acc + (s.count || 0), 0)) * 100) || 0}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">₹{(stage.value || 0).toLocaleString('en-IN')} in progress</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No pipeline data available</p>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Customer Management Tab */}
          <TabPanel value={tabValue} index={2}>
            <div className="p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-4">Customer Management</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Customer management features coming soon</p>
                <p className="text-gray-600 text-sm mt-2">View and manage customer accounts, contact information, and purchase history</p>
              </div>
            </div>
          </TabPanel>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;