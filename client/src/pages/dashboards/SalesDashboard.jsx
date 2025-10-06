import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaPlus, FaSearch, FaEye, FaEdit, FaChartLine, FaClock, FaCheckCircle, FaTruck, FaMoneyBill, FaUser, FaClipboardList, FaDownload, FaSpinner, FaExclamationTriangle, FaFilter, FaCalendarAlt, FaFileExport, FaQrcode, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import QRCodeDisplay from '../../components/QRCodeDisplay';

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
      draft: 'bg-gray-100 text-gray-700',
      pending_approval: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      in_production: 'bg-orange-100 text-orange-700',
      ready_to_ship: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Calculate progress based on status
  const getOrderProgress = (status) => {
    const progressMap = {
      draft: 0,
      pending_approval: 10,
      confirmed: 25,
      in_production: 65,
      ready_to_ship: 85,
      shipped: 90,
      delivered: 95,
      completed: 100,
      cancelled: 0
    };
    return progressMap[status] || 0;
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle, progress }) => (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase text-gray-500 mb-1 tracking-wide">{title}</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
          {progress !== undefined && (
            <div className="mt-3">
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className={`h-2 rounded-full ${color === 'info' ? 'bg-blue-500' : color === 'success' ? 'bg-green-500' : color === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">{progress}% of target</span>
            </div>
          )}
        </div>
        <div className={`rounded-full p-3 flex items-center justify-center w-12 h-12 ${color === 'primary' ? 'bg-blue-100 text-blue-600' : color === 'success' ? 'bg-green-100 text-green-600' : color === 'info' ? 'bg-blue-100 text-blue-600' : color === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const TabPanel = ({ children, value, index }) => (
    <div className={value !== index ? 'hidden' : ''}>
      {value === index && <div className="p-6">{children}</div>}
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
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading sales dashboard...</p>
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
          <div className="text-center">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your sales performance and manage orders</p>
        </div>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          onClick={() => navigate('/sales/orders/create')}
        >
          <FaPlus className="text-sm" />
          Create Sales Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={<FaShoppingCart className="text-xl" />}
          color="primary"
        />
        <StatCard
          title="Active Orders"
          value={stats?.pendingOrders || 0}
          icon={<FaClock className="text-xl" />}
          color="warning"
        />
        <StatCard
          title="Completed Orders"
          value={stats?.orderStats?.find(s => s.status === 'completed')?.count || 0}
          icon={<FaCheckCircle className="text-xl" />}
          color="success"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${((stats?.totalRevenue || 0) / 100000).toFixed(1)}L`}
          icon={<FaMoneyBill className="text-xl" />}
          color="info"
          subtitle="This month"
        />
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Quick Search & Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
                <div className="relative">
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search by order no, customer name..."
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  onClick={() => navigate('/sales/reports')}
                >
                  <FaChartLine className="text-sm" />
                  View Reports
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  onClick={handleExportOrders}
                  disabled={exporting}
                >
                  {exporting ? <FaSpinner className="animate-spin text-sm" /> : <FaFileExport className="text-sm" />}
                  {exporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50 px-6">
          <div className="flex gap-8">
            {['Sales Orders', 'Sales Pipeline', 'Customer Management'].map((tab, idx) => (
              <button
                key={tab}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-all ${
                  tabValue === idx
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
                }`}
                onClick={() => setTabValue(idx)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <TabPanel value={tabValue} index={0}>
          <div>
            {/* Orders Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-xl text-gray-900">Sales Orders</h3>
                <p className="text-gray-600 text-sm mt-1">{filteredOrders.length} orders found</p>
              </div>
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => navigate('/sales/orders')}
              >
                <FaClipboardList className="text-sm" />
                View All Orders
              </button>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="font-semibold text-gray-700 px-4 py-3 text-left">Order No.</th>
                    <th className="font-semibold text-gray-700 px-4 py-3 text-left">Customer</th>
                    <th className="font-semibold text-gray-700 px-4 py-3 text-left">Products</th>
                    <th className="font-semibold text-gray-700 px-4 py-3 text-right">Quantity</th>
                    <th className="font-semibold text-gray-700 px-4 py-3 text-right">Amount</th>
                    <th className="font-semibold text-gray-700 px-4 py-3 text-center">Status</th>
                    <th className="font-semibold text-gray-700 px-4 py-3 text-center">Progress</th>
                    <th className="font-semibold text-gray-700 px-4 py-3 text-left">Delivery Date</th>
                    <th className="font-semibold text-gray-700 px-4 py-3 text-left">Salesperson</th>
                    <th className="font-semibold text-gray-700 px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <FaClipboardList className="text-4xl text-gray-300 mb-2" />
                          <p>No orders found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-blue-50 border-b border-gray-100 transition-colors cursor-pointer group"
                        onClick={(e) => {
                          // Prevent row click if an action button is clicked
                          if (e.target.closest('button')) return;
                          handleViewOrder(order.id);
                        }}
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') handleViewOrder(order.id);
                        }}
                        aria-label={`View order ${order.order_number}`}
                      >
                        <td className="px-4 py-3 font-semibold text-gray-900 group-hover:underline">{order.order_number}</td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</span>
                            <div className="text-xs text-gray-500">{order.customer?.phone || ''}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">
                            {order.items && order.items.length > 0 ? (
                              <div>
                                {order.items.slice(0, 2).map((item, idx) => (
                                  <div key={idx} className="truncate max-w-48" title={item.product_name}>
                                    {item.product_name}
                                  </div>
                                ))}
                                {order.items.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{order.items.length - 2} more items
                                  </div>
                                )}
                              </div>
                            ) : (
                              'No products'
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{order.total_quantity || 0}</td>
                        <td className="px-4 py-3 text-right font-medium">₹{order.final_amount?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${getOrderProgress(order.status)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              {getOrderProgress(order.status)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {order.creator?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              onClick={e => { e.stopPropagation(); handleViewOrder(order.id); }}
                              title="View Order"
                            >
                              <FaEye className="text-sm" />
                            </button>
                            <button
                              className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                              onClick={e => { e.stopPropagation(); handleEditOrder(order.id); }}
                              title="Edit Order"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              onClick={e => { e.stopPropagation(); handleShowQrCode(order); }}
                              title="View QR Code"
                            >
                              <FaQrcode className="text-sm" />
                            </button>
                            {/* Show "Send to Procurement" button only for DRAFT orders that haven't been sent yet */}
                            {order.status === 'draft' && !order.ready_for_procurement && (
                              <button
                                className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                onClick={e => { e.stopPropagation(); handleSendToProcurement(order); }}
                                title="Send to Procurement for Approval"
                              >
                                <FaPaperPlane className="text-sm" />
                              </button>
                            )}
                            {/* Show indicator if order is waiting for procurement approval */}
                            {order.status === 'draft' && order.ready_for_procurement && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full whitespace-nowrap">
                                ⏳ Awaiting Approval
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div>
            {/* Pipeline Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-xl text-gray-900">Sales Pipeline</h3>
                <p className="text-gray-600 text-sm mt-1">Track your sales opportunities through different stages</p>
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                onClick={() => navigate('/sales/pipeline')}
              >
                <FaChartLine className="text-sm" />
                View Full Pipeline
              </button>
            </div>

            {/* Pipeline Stages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {salesPipeline.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <FaChartLine className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No pipeline data available</p>
                </div>
              ) : (
                salesPipeline.map((stage, index) => (
                  <div key={stage.status} className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                    <div className="text-lg font-semibold text-blue-600 mb-2 capitalize">
                      {stage.status.replace('_', ' ')}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stage.count}</div>
                    <div className="text-sm text-gray-500 mb-3">Opportunities</div>
                    <div className="text-xl font-semibold text-green-600">
                      ₹{((stage.value || 0) / 100000).toFixed(1)}L
                    </div>
                    <div className="text-xs text-gray-500">Pipeline Value</div>

                    {/* Progress indicator */}
                    <div className="mt-4">
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((index + 1) * 20, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pipeline Summary */}
            {salesPipeline.length > 0 && (
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Pipeline Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {salesPipeline.reduce((sum, stage) => sum + stage.count, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Opportunities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{(salesPipeline.reduce((sum, stage) => sum + (stage.value || 0), 0) / 100000).toFixed(1)}L
                    </div>
                    <div className="text-sm text-gray-600">Total Pipeline Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {salesPipeline.length > 0 ? Math.round(salesPipeline.reduce((sum, stage) => sum + stage.count, 0) / salesPipeline.length) : 0}
                    </div>
                    <div className="text-sm text-gray-600">Avg. per Stage</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <div>
            {/* Customer Management Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-xl text-gray-900">Customer Management</h3>
                <p className="text-gray-600 text-sm mt-1">Manage your customer relationships and insights</p>
              </div>
              <button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                onClick={() => navigate('/sales/customers')}
              >
                <FaPlus className="text-sm" />
                Add Customer
              </button>
            </div>

            {/* Customer Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="text-blue-600 text-2xl" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{customerStats?.total || 0}</div>
                <div className="text-sm text-gray-600">Total Customers</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaChartLine className="text-green-600 text-2xl" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{customerStats?.newThisMonth || 0}</div>
                <div className="text-sm text-gray-600">New This Month</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaMoneyBill className="text-blue-600 text-2xl" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">₹{(customerStats?.avgOrderValue || 0) / 1000}K</div>
                <div className="text-sm text-gray-600">Avg. Order Value</div>
              </div>
            </div>

            {/* Customer Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  onClick={() => navigate('/sales/customers')}
                >
                  <div className="flex items-center gap-3">
                    <FaUser className="text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">View Customers</div>
                      <div className="text-sm text-gray-600">Manage customer database</div>
                    </div>
                  </div>
                </button>

                <button
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  onClick={() => navigate('/sales/customer-segments')}
                >
                  <div className="flex items-center gap-3">
                    <FaChartLine className="text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Customer Segments</div>
                      <div className="text-sm text-gray-600">Analyze customer groups</div>
                    </div>
                  </div>
                </button>

                <button
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  onClick={() => navigate('/sales/customer-feedback')}
                >
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Customer Feedback</div>
                      <div className="text-sm text-gray-600">View customer reviews</div>
                    </div>
                  </div>
                </button>

                <button
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  onClick={() => navigate('/sales/customer-reports')}
                >
                  <div className="flex items-center gap-3">
                    <FaDownload className="text-orange-600" />
                    <div>
                      <div className="font-medium text-gray-900">Customer Reports</div>
                      <div className="text-sm text-gray-600">Generate customer insights</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </TabPanel>
      </div>

      {/* QR Code Dialog */}
      {qrDialogOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order QR Code</h3>
              <button
                onClick={() => setQrDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="text-center">
              <QRCodeDisplay
                data={JSON.stringify({
                  orderId: selectedOrder.id,
                  orderNumber: selectedOrder.order_number,
                  customer: selectedOrder.customer,
                  status: selectedOrder.status,
                  department: 'sales',
                  timestamp: new Date().toISOString(),
                  materials: selectedOrder.garment_specs,
                  quantity: selectedOrder.quantity
                })}
                size={200}
              />
              <p className="mt-4 text-sm text-gray-600">
                Order: {selectedOrder.order_number}
              </p>
              <p className="text-xs text-gray-500">
                Scan this QR code to access order details
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;