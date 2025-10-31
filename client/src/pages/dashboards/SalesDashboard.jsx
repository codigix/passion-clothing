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
      <div className="p-3">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-3" />
            <p className="text-gray-600 font-normal text-sm">Loading sales dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="p-3">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center max-w-sm">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
            <p className="text-red-600 mb-3 font-normal text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Header with Sophisticated Design */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 text-white px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="p-1.5 bg-white/15 rounded-lg backdrop-blur-sm">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold">Sales Dashboard</h1>
            </div>
            <p className="text-blue-200 text-xs font-normal ml-10">Performance • Orders • Revenue</p>
          </div>
          <button
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-xs flex items-center gap-2 hover:from-blue-600 hover:to-blue-700"
            onClick={() => navigate('/sales/orders/create')}
          >
            <FaPlus size={13} />
            New Order
          </button>
        </div>
      </div>

      <div className="px-6 py-3 max-w-7xl mx-auto">
        {/* Modern Stats Cards with Gradient Backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Total Orders Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3 hover:shadow-md transition-all hover:border-blue-300">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-blue-700 text-xs font-medium">Total Orders</p>
                <p className="text-xl font-bold text-blue-900 mt-1">{stats?.totalOrders || 0}</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-blue-700" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs pt-1 border-t border-blue-200">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600 font-semibold">+12%</span>
              <span className="text-blue-600">vs last month</span>
            </div>
          </div>

          {/* Active Orders Card */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-sm border border-amber-200 p-3 hover:shadow-md transition-all hover:border-amber-300">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-amber-700 text-xs font-medium">Active Orders</p>
                <p className="text-xl font-bold text-amber-900 mt-1">{stats?.pendingOrders || 0}</p>
              </div>
              <div className="p-2 bg-amber-200 rounded-lg">
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs pt-1 border-t border-amber-200">
              <span className="text-amber-700 font-semibold">5 pending</span>
              <span className="text-amber-600">approval</span>
            </div>
          </div>

          {/* Completed Orders Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3 hover:shadow-md transition-all hover:border-green-300">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-green-700 text-xs font-medium">Completed</p>
                <p className="text-xl font-bold text-green-900 mt-1">{stats?.orderStats?.find(s => s.status === 'completed')?.count || 0}</p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-700" />
              </div>
            </div>
            <div className="w-full bg-green-200 rounded-full h-1.5 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="text-xs text-green-700 mt-1 font-medium">78% completion</p>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-sm border border-indigo-200 p-3 hover:shadow-md transition-all hover:border-indigo-300">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-indigo-700 text-xs font-medium">Total Revenue</p>
                <p className="text-xl font-bold text-indigo-900 mt-1">₹{((stats?.totalRevenue || 0) / 100000).toFixed(1)}L</p>
              </div>
              <div className="p-2 bg-indigo-200 rounded-lg">
                <DollarSign className="w-4 h-4 text-indigo-700" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs pt-1 border-t border-indigo-200">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600 font-semibold">+8.5%</span>
              <span className="text-indigo-600">this quarter</span>
            </div>
          </div>
        </div>

        {/* Modern Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-4">
          <div className="flex flex-col lg:flex-row gap-2">
            {/* Search Box */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-2.5 text-slate-400" size={13} />
                <input
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all placeholder-slate-400"
                  placeholder="Search order #, customer..."
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all bg-white"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
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
            <div className="flex gap-2 items-center">
              <button
                className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium flex items-center gap-1.5"
                onClick={() => navigate('/sales/reports')}
                title="View detailed reports"
              >
                <FaChartLine size={12} />
                <span className="hidden sm:inline">Reports</span>
              </button>
              <button
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:shadow-md transition-all font-medium flex items-center gap-1.5 disabled:opacity-50"
                onClick={handleExportOrders}
                disabled={exporting}
                title="Export orders to CSV"
              >
                {exporting ? <FaSpinner className="animate-spin" size={12} /> : <FaFileExport size={12} />}
                <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modern Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 bg-slate-50 px-4">
            <div className="flex gap-0.5">
              {[
                { label: 'Orders', icon: FaClipboardList },
                { label: 'Pipeline', icon: TrendingUp },
                { label: 'Customers', icon: FaUser }
              ].map((tab, idx) => (
                <button
                  key={tab.label}
                  className={`py-2 px-3 font-medium text-xs border-b-2 transition-all flex items-center gap-1.5 ${
                    tabValue === idx
                      ? 'border-blue-600 text-blue-700 bg-blue-50'
                      : 'border-transparent text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                  }`}
                  onClick={() => setTabValue(idx)}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <div className="p-3">
              {/* Orders Header with View Mode Toggle */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-semibold text-sm text-slate-800">Sales Orders</h3>
                  <p className="text-slate-600 text-xs mt-0.5">{filteredOrders.length} orders</p>
                </div>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    className={`px-2.5 py-1.5 rounded text-xs transition-all ${
                      viewMode === 'table' 
                        ? 'bg-white text-blue-700 shadow-sm border border-slate-300' 
                        : 'text-slate-600 hover:text-blue-700'
                    }`}
                    onClick={() => setViewMode('table')}
                    title="Table view"
                  >
                    <FaClipboardList size={12} />
                  </button>
                  <button
                    className={`px-2.5 py-1.5 rounded text-xs transition-all ${
                      viewMode === 'cards' 
                        ? 'bg-white text-blue-700 shadow-sm border border-slate-300' 
                        : 'text-slate-600 hover:text-blue-700'
                    }`}
                    onClick={() => setViewMode('cards')}
                    title="Card view"
                  >
                    <FaTh size={12} />
                  </button>
                </div>
              </div>

              {/* Orders Display */}
              {filteredOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="inline-block p-2.5 bg-slate-100 rounded-full mb-2">
                    <FaClipboardList className="text-xl text-slate-400" />
                  </div>
                  <p className="text-slate-700 font-medium text-sm">No orders found</p>
                  <p className="text-slate-600 text-xs mt-1">Try adjusting your filters or create a new order</p>
                  <button
                    onClick={() => navigate('/sales/orders/create')}
                    className="mt-3 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs rounded-lg hover:shadow-md transition-all font-medium"
                  >
                    <FaPlus className="inline mr-1.5" size={11} />
                    Create New Order
                  </button>
                </div>
              ) : viewMode === 'cards' ? (
                // Modern Card View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`rounded-lg border border-slate-200 p-2.5 bg-gradient-to-br ${getStatusGradient(order.status)} hover:shadow-md transition-all cursor-pointer group`}
                      onClick={() => handleViewOrder(order.id)}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-600">Order #</p>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 truncate">{order.order_number}</p>
                        </div>
                        <button
                          className="ml-2 p-1 hover:bg-white/50 rounded transition-colors text-slate-600 hover:text-slate-800 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === order.id ? null : order.id);
                          }}
                        >
                          <FaEllipsisV size={11} />
                        </button>
                      </div>

                      {/* Customer Info */}
                      <div className="mb-2 pb-2 border-b border-slate-300/30">
                        <p className="text-xs text-slate-600 font-medium">Customer</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">{order.customer?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-600 truncate">{order.customer?.phone || '-'}</p>
                      </div>

                      {/* Product Info */}
                      <div className="mb-2 pb-2 border-b border-slate-300/30">
                        <p className="text-xs text-slate-600 font-medium">Product</p>
                        {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                          <div>
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {order.items[0]?.product_name || order.items[0]?.description || 'Product'}
                            </p>
                            {order.items.length > 1 && (
                              <p className="text-xs text-slate-500">+{order.items.length - 1} more</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">No products</p>
                        )}
                      </div>

                      {/* Order Details */}
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600">Qty:</span>
                          <span className="font-semibold text-slate-900">{order.total_quantity || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600">Amount:</span>
                          <span className="font-bold text-slate-900">₹{(order.final_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>

                      {/* Status and Progress */}
                      <div className="mb-2 pb-2 border-b border-slate-300/30">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <div className="w-full bg-slate-300/30 rounded-full h-1 mt-1.5">
                          <div
                            className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${getOrderProgress(order.status)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{getOrderProgress(order.status)}% complete</p>
                      </div>

                      {/* Delivery Date */}
                      <p className="text-xs text-slate-600 mb-2 font-medium">
                        Del: {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-IN', { year: '2-digit', month: 'short', day: '2-digit' }) : 'Not set'}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          className="flex-1 px-2 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1 hover:shadow-md transition-all"
                          onClick={(e) => { e.stopPropagation(); handleViewOrder(order.id); }}
                        >
                          <FaEye size={11} />
                          View
                        </button>
                        <button
                          className="px-2 py-1.5 border border-slate-300 text-slate-700 rounded text-xs hover:bg-slate-100 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleEditOrder(order.id); }}
                        >
                          <FaEdit size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Modern Table View
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-100 border-b border-slate-300 sticky top-0 z-10">
                      <tr>
                        <th className="font-semibold text-slate-700 text-xs px-3 py-2 text-left min-w-[85px]">Order #</th>
                        <th className="font-semibold text-slate-700 text-xs px-3 py-2 text-left min-w-[120px]">Customer</th>
                        <th className="font-semibold text-slate-700 text-xs px-3 py-2 text-left min-w-[150px]">Products</th>
                        <th className="font-semibold text-slate-700 text-xs px-3 py-2 text-right min-w-[60px]">Qty</th>
                        <th className="font-semibold text-slate-700 text-xs px-3 py-2 text-right min-w-[90px]">Amount</th>
                        <th className="font-semibold text-slate-700 text-xs px-3 py-2 text-center min-w-[100px]">Status</th>
                        <th className="font-semibold text-slate-700 text-xs px-3 py-2 text-center min-w-[85px]">Progress</th>
                        <th className="font-semibold text-slate-700 text-xs px-3 py-2 text-left min-w-[75px]">Delivery</th>
                        <th className="font-semibold text-slate-700 text-xs px-3 py-2 text-center min-w-[65px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredOrders.map((order) => {
                        // Extract product names from items array (without size/material info)
                        const productList = order.items && Array.isArray(order.items) && order.items.length > 0 
                          ? order.items
                              .map((item) => item.product_name || item.description || item.style_no || 'Product')
                              .filter(Boolean)
                          : [];
                        const primaryProduct = productList[0] || 'No products';
                        const additionalCount = Math.max(0, productList.length - 1);

                        return (
                          <tr
                            key={order.id}
                            className="hover:bg-slate-50 transition-colors group cursor-pointer border-b border-slate-100"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <td className="px-3 py-2 font-semibold text-slate-900 group-hover:text-blue-600 min-w-[85px]">{order.order_number}</td>
                            <td className="px-3 py-2 min-w-[120px]">
                              <div>
                                <div className="font-semibold text-slate-900 text-xs">{order.customer?.name || 'N/A'}</div>
                                <div className="text-xs text-slate-500">{order.customer?.phone || '-'}</div>
                              </div>
                            </td>
                            <td className="px-3 py-2 min-w-[150px]">
                              <Tooltip text={productList.join(', ') || 'No products'}>
                                <div className="text-xs text-slate-700">
                                  <div className="font-semibold truncate" title={primaryProduct}>
                                    {primaryProduct}
                                  </div>
                                  {additionalCount > 0 && (
                                    <div className="text-slate-500 text-xs">+{additionalCount} item{additionalCount > 1 ? 's' : ''}</div>
                                  )}
                                </div>
                              </Tooltip>
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-900 text-xs min-w-[60px]">{order.total_quantity || 0}</td>
                            <td className="px-3 py-2 text-right font-bold text-slate-900 text-xs min-w-[90px]">₹{(order.final_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            <td className="px-3 py-2 text-center min-w-[100px]">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(order.status)}`}>
                                {order.status.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center min-w-[85px]">
                              <div className="flex items-center justify-center gap-1">
                                <div className="w-8 h-1 bg-slate-300 rounded-full">
                                  <div
                                    className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                    style={{ width: `${getOrderProgress(order.status)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold text-slate-700 w-5">{getOrderProgress(order.status)}%</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-700 whitespace-nowrap min-w-[75px]">
                              {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-IN', { year: '2-digit', month: '2-digit', day: '2-digit' }) : '-'}
                            </td>
                            <td className="px-3 py-2 text-center min-w-[65px]">
                              <div className="flex items-center justify-center gap-2">
                                <Tooltip text="View">
                                  <button
                                    className="p-1.5 hover:bg-blue-100 rounded transition-colors text-blue-600"
                                    onClick={(e) => { e.stopPropagation(); handleViewOrder(order.id); }}
                                  >
                                    <FaEye size={11} />
                                  </button>
                                </Tooltip>
                                <Tooltip text="Edit">
                                  <button
                                    className="p-1.5 hover:bg-amber-100 rounded transition-colors text-amber-600"
                                    onClick={(e) => { e.stopPropagation(); handleEditOrder(order.id); }}
                                  >
                                    <FaEdit size={11} />
                                  </button>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Sales Pipeline Tab */}
          <TabPanel value={tabValue} index={1}>
            <div className="p-3">
              <h3 className="font-semibold text-sm text-slate-800 mb-3">Sales Pipeline</h3>
              {salesPipeline && salesPipeline.length > 0 ? (
                <div className="space-y-2">
                  {salesPipeline.map((stage, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-300 p-2.5">
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="font-semibold text-xs text-slate-800">{stage.stage}</h4>
                        <span className="text-base font-bold text-blue-700">{stage.count || 0}</span>
                      </div>
                      <div className="w-full bg-slate-300 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-1.5 rounded-full" style={{ width: `${(stage.count / (salesPipeline.reduce((acc, s) => acc + (s.count || 0), 0)) * 100) || 0}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">₹{(stage.value || 0).toLocaleString('en-IN')} value</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-600 text-xs">No pipeline data available</p>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Customer Management Tab */}
          <TabPanel value={tabValue} index={2}>
            <div className="p-3">
              <h3 className="font-semibold text-sm text-slate-800 mb-3">Customer Management</h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-300 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-slate-700 font-semibold text-xs">Feature Coming Soon</p>
                <p className="text-slate-600 text-xs mt-1">Manage customers, accounts & purchase history</p>
              </div>
            </div>
          </TabPanel>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;