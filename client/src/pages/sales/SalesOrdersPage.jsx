import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaQrcode,
  FaTruck,
  FaIndustry,
  FaClipboardList,
  FaFileInvoice,
  FaUpload,
  FaPrint,
  FaChevronDown,
  FaShoppingCart,
  FaClock,
  FaCog,
  FaCogs,
  FaCheck,
  FaMoneyBillWave,
  FaColumns,
  FaEllipsisV,
  FaThLarge,
  FaTh,
  FaChartBar,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEye
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import QRCodeDisplay from '../../components/QRCodeDisplay';

const AVAILABLE_COLUMNS = [
  { id: 'order_number', label: 'SO Number', defaultVisible: true, alwaysVisible: true },
  { id: 'order_date', label: 'Order Date', defaultVisible: true },
  { id: 'customer', label: 'Customer', defaultVisible: true },
  { id: 'product_info', label: 'Product Info', defaultVisible: false },
  { id: 'quantity', label: 'Quantity', defaultVisible: false },
  { id: 'rate', label: 'Rate per Piece', defaultVisible: false },
  { id: 'total_amount', label: 'Total Amount', defaultVisible: true },
  { id: 'advance_paid', label: 'Advance Paid', defaultVisible: false },
  { id: 'balance', label: 'Balance Amount', defaultVisible: false },
  { id: 'delivery_date', label: 'Delivery Date', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'shipment_status', label: 'Shipment Status', defaultVisible: true },
  { id: 'procurement', label: 'Procurement Status', defaultVisible: false },
  { id: 'invoice', label: 'Invoice Status', defaultVisible: false },
  { id: 'challan', label: 'Challan Status', defaultVisible: false },
  { id: 'created_by', label: 'Created By', defaultVisible: false },
  { id: 'actions', label: 'Actions', defaultVisible: true, alwaysVisible: true }
];

const SalesOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [shipmentMap, setShipmentMap] = useState({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [procurementFilter, setProcurementFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // View modes
  const [viewMode, setViewMode] = useState('table'); // 'table', 'cards', 'kanban'
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrOrder, setQrOrder] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('salesOrdersVisibleColumns');
    if (saved) {
      return JSON.parse(saved);
    }
    return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
  });

  useEffect(() => {
    fetchOrders();
    fetchSummary();
    fetchShipments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, procurementFilter, dateFrom, dateTo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnMenu && !event.target.closest('.column-menu-container')) {
        setShowColumnMenu(false);
      }
      if (showActionMenu && !event.target.closest('.action-menu-container')) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnMenu, showActionMenu]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales/orders?limit=1000');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShipments = async () => {
    try {
      const response = await api.get('/shipments?limit=500');
      const shipments = response.data.shipments || [];
      const map = {};
      shipments.forEach(shipment => {
        if (shipment.sales_order_id) {
          map[shipment.sales_order_id] = shipment.status;
        }
      });
      setShipmentMap(map);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get('/sales/dashboard/summary');
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item =>
          item.product_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (procurementFilter && procurementFilter !== 'all') {
      filtered = filtered.filter(order => order.procurement_status === procurementFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(order => new Date(order.order_date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(order => new Date(order.order_date) <= new Date(dateTo + 'T23:59:59'));
    }

    setFilteredOrders(filtered);
  };

  const handleSendToProcurement = async (order) => {
    if (window.confirm(`Send order ${order.order_number} to procurement?`)) {
      try {
        await api.put(`/sales/orders/${order.id}/send-to-procurement`);
        alert('Order sent successfully!');
        fetchOrders();
        fetchSummary();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to send to procurement');
      }
    }
  };

  const handleDelete = async (order) => {
    if (window.confirm(`Delete order ${order.order_number}?`)) {
      try {
        await api.delete(`/sales/orders/${order.id}`);
        alert('Order deleted!');
        fetchOrders();
        fetchSummary();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete order');
      }
    }
  };

  const handleShowQR = (order) => {
    setQrOrder(order);
    setShowQRModal(true);
  };

  const getStatusBadge = (status) => {
    const config = {
      draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: FaClock },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: FaCheckCircle },
      in_production: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: FaCog },
      ready_to_ship: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', icon: FaTruck },
      shipped: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', icon: FaTruck },
      delivered: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: FaCheckCircle },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', icon: FaCheck },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: FaTimesCircle }
    };
    const cfg = config[status] || config.draft;
    const Icon = cfg.icon;
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border} text-xs font-semibold`}>
        <Icon size={14} />
        {status?.replace(/_/g, ' ').toUpperCase()}
      </div>
    );
  };

  const groupOrdersByStatus = () => {
    const groups = {
      draft: [],
      confirmed: [],
      in_production: [],
      ready_to_ship: [],
      shipped: [],
      delivered: [],
      completed: [],
      cancelled: []
    };

    filteredOrders.forEach(order => {
      if (groups[order.status] !== undefined) {
        groups[order.status].push(order);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Get status icon color
  const getStatusColor = (status) => {
    const colors = {
      draft: 'from-slate-500 to-slate-600',
      confirmed: 'from-blue-500 to-blue-600',
      in_production: 'from-orange-500 to-orange-600',
      ready_to_ship: 'from-purple-500 to-purple-600',
      shipped: 'from-indigo-500 to-indigo-600',
      delivered: 'from-green-500 to-green-600',
      completed: 'from-emerald-500 to-emerald-600',
      cancelled: 'from-red-500 to-red-600'
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-6 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/20 rounded-lg">
                <FaShoppingCart className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">Sales Orders</h1>
            </div>
            <p className="text-blue-100 text-sm font-medium">Manage and track all sales orders efficiently</p>
          </div>
          <button
            onClick={() => navigate('/sales/orders/create')}
            className="px-5 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-lg font-semibold flex items-center gap-2 hover:shadow-xl"
          >
            <FaPlus size={16} />
            Create Order
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Orders', value: summary.total_orders, icon: FaShoppingCart, color: 'blue' },
              { label: 'Pending', value: summary.pending_orders, icon: FaClock, color: 'amber' },
              { label: 'In Production', value: summary.in_production_orders, icon: FaCog, color: 'orange' },
              { label: 'Delivered', value: summary.delivered_orders, icon: FaCheck, color: 'green' }
            ].map((card, idx) => {
              const Icon = card.icon;
              const bgColor = { blue: 'bg-blue-50', amber: 'bg-amber-50', orange: 'bg-orange-50', green: 'bg-green-50' }[card.color];
              const iconBg = { blue: 'bg-blue-100', amber: 'bg-amber-100', orange: 'bg-orange-100', green: 'bg-green-100' }[card.color];
              const iconColor = { blue: 'text-blue-600', amber: 'text-amber-600', orange: 'text-orange-600', green: 'text-green-600' }[card.color];

              return (
                <div key={idx} className={`${bgColor} rounded-xl p-6 border border-${card.color}-200 shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-1">{card.label}</p>
                      <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                    </div>
                    <div className={`${iconBg} p-3 rounded-lg`}>
                      <Icon className={`${iconColor} text-lg`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter & View Mode Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 relative w-full lg:w-auto">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by order, customer, product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2.5 rounded-lg border transition-all ${viewMode === 'table' ? 'bg-blue-100 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                title="Table View"
              >
                <FaTh size={18} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2.5 rounded-lg border transition-all ${viewMode === 'cards' ? 'bg-blue-100 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                title="Card View"
              >
                <FaThLarge size={18} />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2.5 rounded-lg border transition-all ${viewMode === 'kanban' ? 'bg-blue-100 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                title="Kanban View"
              >
                <FaChartBar size={18} />
              </button>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-lg border transition-all ${showFilters ? 'bg-blue-100 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                title="Toggle Filters"
              >
                <FaFilter size={18} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_production">In Production</option>
                  <option value="ready_to_ship">Ready to Ship</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Procurement Status</label>
                <select
                  value={procurementFilter}
                  onChange={(e) => setProcurementFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All</option>
                  <option value="not_requested">Not Requested</option>
                  <option value="requested">Requested</option>
                  <option value="po_created">PO Created</option>
                  <option value="materials_ordered">Materials Ordered</option>
                  <option value="materials_received">Materials Received</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">SO Number</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Order Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Total Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Delivery Date</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FaExclamationCircle className="text-4xl text-gray-400" />
                          <p className="text-gray-500 font-medium">No orders found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/sales/orders/${order.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                          >
                            {order.order_number}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{order.customer?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.order_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">₹{order.total_amount?.toLocaleString()}</td>
                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.delivery_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="action-menu-container relative flex justify-center gap-2">
                            <button
                              onClick={() => navigate(`/sales/orders/${order.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={() => handleShowQR(order)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Show QR Code"
                            >
                              <FaQrcode size={16} />
                            </button>
                            <button
                              onClick={() => setShowActionMenu(showActionMenu === order.id ? null : order.id)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <FaEllipsisV size={16} />
                            </button>

                            {/* Action Menu */}
                            {showActionMenu === order.id && (
                              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                                <button
                                  onClick={() => {
                                    navigate(`/sales/orders/edit/${order.id}`);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm flex items-center gap-2 border-b border-gray-100"
                                >
                                  <FaEdit size={14} /> Edit
                                </button>
                                {order.status === 'draft' && (
                                  <button
                                    onClick={() => {
                                      handleSendToProcurement(order);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-green-50 text-gray-700 text-sm flex items-center gap-2 border-b border-gray-100"
                                  >
                                    <FaTruck size={14} /> Send to Procurement
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    handleShowQR(order);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-purple-50 text-gray-700 text-sm flex items-center gap-2 border-b border-gray-100"
                                >
                                  <FaQrcode size={14} /> QR Code
                                </button>
                                <button
                                  onClick={() => {
                                    handleDelete(order);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-2"
                                >
                                  <FaTrash size={14} /> Delete
                                </button>
                              </div>
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
        )}

        {/* Card View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <FaExclamationCircle className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-500 font-medium">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all overflow-hidden cursor-pointer`}
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className={`h-1 bg-gradient-to-r ${getStatusColor(order.status)}`}></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">SO Number</p>
                        <p className="text-lg font-bold text-gray-800">{order.order_number}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowQR(order);
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                      >
                        <FaQrcode />
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Customer</p>
                        <p className="text-sm font-semibold text-gray-800">{order.customer?.name || 'N/A'}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Amount</p>
                          <p className="text-sm font-bold text-blue-600">₹{order.total_amount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Order Date</p>
                          <p className="text-sm text-gray-700">{new Date(order.order_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">{getStatusBadge(order.status)}</div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sales/orders/${order.id}`);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <FaEye size={14} /> View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sales/orders/edit/${order.id}`);
                        }}
                        className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <FaEdit size={14} /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {Object.entries(groupOrdersByStatus()).map(([status, statusOrders]) => {
              const statusConfig = {
                draft: { gradient: 'from-slate-400 to-slate-600', icon: FaClock, lightBg: 'bg-slate-50' },
                confirmed: { gradient: 'from-blue-400 to-blue-600', icon: FaCheckCircle, lightBg: 'bg-blue-50' },
                in_production: { gradient: 'from-orange-400 to-orange-600', icon: FaCogs, lightBg: 'bg-orange-50' },
                ready_to_ship: { gradient: 'from-purple-400 to-purple-600', icon: FaTruck, lightBg: 'bg-purple-50' },
                shipped: { gradient: 'from-indigo-400 to-indigo-600', icon: FaTruck, lightBg: 'bg-indigo-50' },
                delivered: { gradient: 'from-green-400 to-green-600', icon: FaCheckCircle, lightBg: 'bg-green-50' },
                completed: { gradient: 'from-emerald-400 to-emerald-600', icon: FaCheck, lightBg: 'bg-emerald-50' },
                cancelled: { gradient: 'from-red-400 to-red-600', icon: FaTimesCircle, lightBg: 'bg-red-50' }
              };
              const config = statusConfig[status] || statusConfig.draft;
              const HeaderIcon = config.icon;

              return (
                <div key={status} className="flex flex-col">
                  {/* Column Header */}
                  <div className={`bg-gradient-to-r ${config.gradient} text-white px-4 py-4 rounded-t-xl shadow-md`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HeaderIcon className="text-lg" />
                        <h3 className="font-bold text-sm">{status.replace(/_/g, ' ').toUpperCase()}</h3>
                      </div>
                      <span className="bg-white/25 backdrop-blur px-3 py-1 rounded-full text-sm font-bold">{statusOrders.length}</span>
                    </div>
                    <div className="text-white/80 text-xs font-medium">
                      {statusOrders.length} {statusOrders.length === 1 ? 'order' : 'orders'}
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="bg-gray-50 rounded-b-xl flex-1 min-h-[600px] max-h-[600px] overflow-y-auto p-3 space-y-3 border border-t-0 border-gray-200">
                    {statusOrders.length === 0 ? (
                      <div className="py-12 text-center text-gray-400">
                        <FaShoppingCart className="text-3xl mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium">No orders</p>
                        <p className="text-xs mt-1">Drag orders here to update status</p>
                      </div>
                    ) : (
                      statusOrders.map((order) => {
                        const daysLeft = order.expected_delivery_date 
                          ? Math.ceil((new Date(order.expected_delivery_date) - new Date()) / (1000 * 60 * 60 * 24))
                          : null;
                        const isOverdue = daysLeft !== null && daysLeft < 0;
                        const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

                        return (
                          <div
                            key={order.id}
                            onClick={() => navigate(`/sales/orders/${order.id}`)}
                            className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:border-blue-400 overflow-hidden"
                          >
                            {/* Card Header */}
                            <div className="px-3 pt-3 pb-2 border-b border-gray-100">
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                                    {order.order_number}
                                  </p>
                                </div>
                                {isOverdue && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Overdue</span>
                                )}
                                {isUrgent && !isOverdue && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Urgent</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 truncate">{order.customer?.name || 'N/A'}</p>
                            </div>

                            {/* Card Body */}
                            <div className="px-3 py-3 space-y-2">
                              {/* Product Info */}
                              {order.items?.[0]?.product_type && (
                                <div className="flex items-start gap-2">
                                  <span className="text-xs text-gray-500 font-medium">Product:</span>
                                  <span className="text-xs text-gray-700 font-medium truncate">{order.items[0].product_type}</span>
                                </div>
                              )}

                              {/* Quantity */}
                              {order.items?.[0]?.quantity && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-500">Qty:</span>
                                  <span className="font-semibold text-gray-700">{order.items[0].quantity} pcs</span>
                                </div>
                              )}

                              {/* Price */}
                              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-500">Total:</span>
                                <span className="text-sm font-bold text-blue-600">₹{order.total_amount?.toLocaleString()}</span>
                              </div>

                              {/* Delivery Info */}
                              {order.expected_delivery_date && (
                                <div className="flex items-center gap-2 text-xs mt-2">
                                  <FaCalendarAlt className="text-gray-400" size={12} />
                                  <span className={isOverdue ? 'text-red-600 font-semibold' : isUrgent ? 'text-amber-600 font-semibold' : 'text-gray-600'}>
                                    {new Date(order.expected_delivery_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                    {daysLeft !== null && ` (${Math.abs(daysLeft)} days ${isOverdue ? 'ago' : 'left'})`}
                                  </span>
                                </div>
                              )}

                              {/* Procurement Status Badge */}
                              {order.procurement_status && (
                                <div className="pt-2">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    order.procurement_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    order.procurement_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    Proc: {order.procurement_status?.replace(/_/g, ' ').toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Card Footer - Actions (visible on hover) */}
                            <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-transparent border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/sales/orders/${order.id}`);
                                }}
                                className="w-full text-center px-2 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 rounded hover:bg-blue-100 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">QR Code</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-4 flex justify-center">
              <QRCodeDisplay value={qrOrder.order_number} />
            </div>
            <p className="text-center text-gray-600 mb-4 font-semibold">{qrOrder.order_number}</p>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrdersPage;