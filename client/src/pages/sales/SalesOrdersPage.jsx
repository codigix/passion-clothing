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
  FaColumns
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import QRCodeDisplay from '../../components/QRCodeDisplay';

// Define all available columns with their properties
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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [procurementFilter, setProcurementFilter] = useState('all');
  const [invoiceFilter, setInvoiceFilter] = useState('all');
  const [challanFilter, setChallanFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrOrder, setQrOrder] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  
  // Column visibility state
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
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, procurementFilter, invoiceFilter, challanFilter, dateFrom, dateTo]);

  // Click outside handler for column menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnMenu && !event.target.closest('.column-menu-container')) {
        setShowColumnMenu(false);
      }
      if (showActionMenu && !event.target.closest('.action-menu-container')) {
        setShowActionMenu(null);
        setMenuPosition({});
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

    // Search filter
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

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Procurement filter
    if (procurementFilter && procurementFilter !== 'all') {
      filtered = filtered.filter(order => order.procurement_status === procurementFilter);
    }

    // Invoice filter
    if (invoiceFilter && invoiceFilter !== 'all') {
      filtered = filtered.filter(order => order.invoice_status === invoiceFilter);
    }

    // Challan filter
    if (challanFilter && challanFilter !== 'all') {
      filtered = filtered.filter(order => order.challan_status === challanFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(order => 
        new Date(order.order_date) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter(order => 
        new Date(order.order_date) <= new Date(dateTo + 'T23:59:59')
      );
    }

    setFilteredOrders(filtered);
  };

  // Column visibility functions
  const isColumnVisible = (columnId) => {
    return visibleColumns.includes(columnId);
  };

  const toggleColumn = (columnId) => {
    const column = AVAILABLE_COLUMNS.find(col => col.id === columnId);
    if (column?.alwaysVisible) return; // Don't toggle always-visible columns
    
    setVisibleColumns(prev => {
      const newColumns = prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId];
      localStorage.setItem('salesOrdersVisibleColumns', JSON.stringify(newColumns));
      return newColumns;
    });
  };

  const resetColumns = () => {
    const defaultCols = AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
    setVisibleColumns(defaultCols);
    localStorage.setItem('salesOrdersVisibleColumns', JSON.stringify(defaultCols));
  };

  const showAllColumns = () => {
    const allCols = AVAILABLE_COLUMNS.map(col => col.id);
    setVisibleColumns(allCols);
    localStorage.setItem('salesOrdersVisibleColumns', JSON.stringify(allCols));
  };

  // Smart menu positioning
  const handleActionMenuToggle = (orderId, event) => {
    if (showActionMenu === orderId) {
      setShowActionMenu(null);
      setMenuPosition({});
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const menuHeight = 350; // Approximate height of dropdown menu
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If not enough space below and more space above, open upward
      const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      
      setMenuPosition({ [orderId]: openUpward });
      setShowActionMenu(orderId);
    }
  };

  const closeActionMenu = () => {
    setShowActionMenu(null);
    setMenuPosition({});
  };

  const handleSendToProcurement = async (order) => {
    if (window.confirm(`Send order ${order.order_number} to procurement department?`)) {
      try {
        await api.put(`/sales/orders/${order.id}/send-to-procurement`);
        alert('Order sent to procurement successfully!');
        fetchOrders();
        fetchSummary();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to send to procurement');
      }
    }
  };

  const handleSendToProduction = async (order) => {
    if (window.confirm(`Create a production request for ${order.order_number}?`)) {
      try {
        await api.post(`/sales/orders/${order.id}/request-production`);
        alert('Production request sent to Manufacturing successfully!');
        fetchOrders();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to send production request');
      }
    }
  };

  const handleGenerateInvoice = async (order) => {
    if (window.confirm(`Generate invoice for order ${order.order_number}?`)) {
      try {
        const response = await api.post(`/sales/orders/${order.id}/generate-invoice`);
        alert('Invoice generated successfully!');
        console.log('Invoice data:', response.data.invoice);
        fetchOrders();
        fetchSummary();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to generate invoice');
      }
    }
  };

  const handleCreateChallan = async (order) => {
    // Navigate to challan creation page with pre-filled order data
    navigate(`/challans/create?order_id=${order.id}`);
  };

  const handleViewPOStatus = (order) => {
    navigate(`/sales/orders/${order.id}?tab=procurement`);
  };



  const handleUpdateStatus = async (order, newStatus) => {
    try {
      await api.put(`/sales/orders/${order.id}/status`, { status: newStatus });
      alert('Order status updated successfully!');
      fetchOrders();
      fetchSummary();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleShowQR = (order) => {
    setQrOrder(order);
    setShowQRModal(true);
  };

  const handleDelete = async (order) => {
    if (window.confirm(`Are you sure you want to delete order ${order.order_number}?`)) {
      try {
        await api.delete(`/sales/orders/${order.id}`);
        alert('Order deleted successfully!');
        fetchOrders();
        fetchSummary();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete order');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      confirmed: { color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
      in_production: { color: 'bg-orange-100 text-orange-700', label: 'In Production' },
      materials_received: { color: 'bg-yellow-100 text-yellow-700', label: 'Materials Received' },
      completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
      shipped: { color: 'bg-purple-100 text-purple-700', label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-700', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const getProcurementBadge = (status) => {
    const config = {
      not_requested: { color: 'bg-gray-100 text-gray-600', label: 'Not Requested' },
      requested: { color: 'bg-blue-100 text-blue-600', label: 'Requested' },
      po_created: { color: 'bg-purple-100 text-purple-600', label: 'PO Created' },
      materials_ordered: { color: 'bg-yellow-100 text-yellow-600', label: 'Materials Ordered' },
      materials_received: { color: 'bg-green-100 text-green-600', label: 'Materials Received' },
      completed: { color: 'bg-green-100 text-green-700', label: 'Completed' }
    };
    const badge = config[status] || config.not_requested;
    return <span className={`px-2 py-1 rounded text-xs ${badge.color}`}>{badge.label}</span>;
  };

  const getInvoiceBadge = (status) => {
    const config = {
      pending: { color: 'bg-gray-100 text-gray-600', label: 'Pending' },
      generated: { color: 'bg-green-100 text-green-600', label: 'Generated' },
      sent: { color: 'bg-blue-100 text-blue-600', label: 'Sent' },
      paid: { color: 'bg-green-100 text-green-700', label: 'Paid' }
    };
    const badge = config[status] || config.pending;
    return <span className={`px-2 py-1 rounded text-xs ${badge.color}`}>{badge.label}</span>;
  };

  const getChallanBadge = (status) => {
    const config = {
      pending: { color: 'bg-gray-100 text-gray-600', label: 'Pending' },
      created: { color: 'bg-blue-100 text-blue-600', label: 'Created' },
      dispatched: { color: 'bg-orange-100 text-orange-600', label: 'Dispatched' },
      delivered: { color: 'bg-green-100 text-green-700', label: 'Delivered' }
    };
    const badge = config[status] || config.pending;
    return <span className={`px-2 py-1 rounded text-xs ${badge.color}`}>{badge.label}</span>;
  };

  // Get first item details for display
  const getOrderItemSummary = (items) => {
    if (!items || items.length === 0) return { product: 'N/A', type: 'N/A', code: 'N/A' };
    const firstItem = items[0];
    return {
      product: firstItem.description || firstItem.product_id || 'N/A',
      type: firstItem.product_type || 'N/A',
      code: firstItem.item_code || firstItem.product_id || 'N/A'
    };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sales Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all sales orders</p>
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md transition-colors"
          onClick={() => navigate('/sales/orders/create')}
        >
          <FaPlus size={16} /> Create New Order
        </button>
      </div>

      {/* Summary Widgets */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{summary.total_orders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaShoppingCart size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-800">{summary.pending_orders}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaClock size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Production</p>
                <p className="text-3xl font-bold text-gray-800">{summary.in_production_orders}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <FaCog size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivered Orders</p>
                <p className="text-3xl font-bold text-gray-800">{summary.delivered_orders}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaCheck size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-2 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-3xl font-bold text-gray-800">₹{summary.total_value?.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaMoneyBillWave size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Advance Collected</p>
                <p className="text-2xl font-bold text-green-600">₹{summary.advance_collected?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Balance Due</p>
                <p className="text-2xl font-bold text-red-600">₹{summary.balance_due?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 relative mr-4">
            <input
              type="text"
              placeholder="Search by SO Number, Customer, or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="flex gap-2">
            <div className="relative column-menu-container">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="flex items-center gap-2 px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
              >
                <FaColumns size={16} />
                <span>Columns</span>
                <FaChevronDown size={14} className={`transition-transform ${showColumnMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Column Menu Dropdown */}
              {showColumnMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700">Manage Columns</h3>
                      <span className="text-xs text-gray-500">
                        {visibleColumns.length} of {AVAILABLE_COLUMNS.length}
                      </span>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {AVAILABLE_COLUMNS.map(column => (
                        <label
                          key={column.id}
                          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                            column.alwaysVisible ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isColumnVisible(column.id)}
                            onChange={() => toggleColumn(column.id)}
                            disabled={column.alwaysVisible}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{column.label}</span>
                          {column.alwaysVisible && (
                            <span className="text-xs text-gray-400 ml-auto">(Required)</span>
                          )}
                        </label>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      <button
                        onClick={showAllColumns}
                        className="flex-1 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                      >
                        Show All
                      </button>
                      <button
                        onClick={resetColumns}
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaFilter size={16} />
              <span>Filters</span>
              <FaChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="ready_to_ship">Ready to Ship</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Procurement Status</label>
              <select
                value={procurementFilter}
                onChange={(e) => setProcurementFilter(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="not_requested">Not Requested</option>
                <option value="requested">Requested</option>
                <option value="po_created">PO Created</option>
                <option value="materials_received">Materials Received</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Status</label>
              <select
                value={invoiceFilter}
                onChange={(e) => setInvoiceFilter(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="generated">Generated</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Challan Status</label>
              <select
                value={challanFilter}
                onChange={(e) => setChallanFilter(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="created">Created</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className=" w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isColumnVisible('order_number') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SO Number</th>
                )}
                {isColumnVisible('order_date') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                )}
                {isColumnVisible('customer') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                )}
                {isColumnVisible('product_info') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Info</th>
                )}
                {isColumnVisible('quantity') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                )}
                {isColumnVisible('rate') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                )}
                {isColumnVisible('total_amount') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                )}
                {isColumnVisible('advance_paid') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advance Paid</th>
                )}
                {isColumnVisible('balance') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                )}
                {isColumnVisible('delivery_date') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                )}
                {isColumnVisible('status') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                )}
                {isColumnVisible('procurement') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procurement</th>
                )}
                {isColumnVisible('invoice') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                )}
                {isColumnVisible('challan') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challan</th>
                )}
                {isColumnVisible('created_by') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                )}
                {isColumnVisible('actions') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] min-w-[100px]">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={16} className="px-4 py-8 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-4 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemSummary = getOrderItemSummary(order.items);
                  const firstItem = order.items?.[0];
                  const ratePerPiece = firstItem ? firstItem.unit_price : 0;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                      {isColumnVisible('order_number') && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/sales/orders/${order.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {order.order_number}
                          </button>
                        </td>
                      )}
                      {isColumnVisible('order_date') && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>
                      )}
                      {isColumnVisible('customer') && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.customer?.name}</div>
                          <div className="text-xs text-gray-500">{order.customer?.customer_code}</div>
                        </td>
                      )}
                      {isColumnVisible('product_info') && (
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{itemSummary.product}</div>
                          <div className="text-xs text-gray-500">
                            Type: {itemSummary.type} | Code: {itemSummary.code}
                          </div>
                        </td>
                      )}
                      {isColumnVisible('quantity') && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {order.total_quantity} pcs
                        </td>
                      )}
                      {isColumnVisible('rate') && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          ₹{ratePerPiece?.toLocaleString()}
                        </td>
                      )}
                      {isColumnVisible('total_amount') && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{order.final_amount?.toLocaleString()}
                        </td>
                      )}
                      {isColumnVisible('advance_paid') && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                          ₹{order.advance_paid?.toLocaleString() || '0'}
                        </td>
                      )}
                      {isColumnVisible('balance') && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">
                          ₹{order.balance_amount?.toLocaleString() || order.final_amount?.toLocaleString()}
                        </td>
                      )}
                      {isColumnVisible('delivery_date') && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {new Date(order.delivery_date).toLocaleDateString()}
                        </td>
                      )}
                      {isColumnVisible('status') && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                      )}
                      {isColumnVisible('procurement') && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getProcurementBadge(order.procurement_status)}
                        </td>
                      )}
                      {isColumnVisible('invoice') && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getInvoiceBadge(order.invoice_status)}
                        </td>
                      )}
                      {isColumnVisible('challan') && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getChallanBadge(order.challan_status)}
                        </td>
                      )}
                      {isColumnVisible('created_by') && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {order.creator?.name || 'N/A'}
                        </td>
                      )}
                      {isColumnVisible('actions') && (
                        <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] transition-colors">
                        <div className="relative action-menu-container flex items-center gap-1">
                          <button
                            onClick={(e) => handleActionMenuToggle(order.id, e)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="More Actions"
                          >
                            <FaChevronDown size={14} />
                          </button>
                          {showActionMenu === order.id && (
                            <div className={`absolute right-0 w-56 bg-white rounded-lg shadow-xl z-[100] border ${
                              menuPosition[order.id] ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}>
                              <button
                                onClick={() => {
                                  handleSendToProcurement(order);
                                  closeActionMenu();
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FaClipboardList /> Send to Procurement
                              </button>
                              <button
                                onClick={() => {
                                  handleSendToProduction(order);
                                  closeActionMenu();
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                              >
                                <FaCogs /> Request Production
                              </button>
                              <button
                                onClick={() => {
                                  handleGenerateInvoice(order);
                                  closeActionMenu();
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FaFileInvoice /> Generate Invoice
                              </button>
                              <button
                                onClick={() => {
                                  handleCreateChallan(order);
                                  closeActionMenu();
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FaTruck /> Create Challan
                              </button>
                              <button
                                onClick={() => {
                                  handleViewPOStatus(order);
                                  closeActionMenu();
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FaIndustry /> View PO Status
                              </button>
                              <button
                                onClick={() => {
                                  handleShowQR(order);
                                  closeActionMenu();
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FaQrcode /> Generate QR Code
                              </button>
                              <button
                                onClick={() => {
                                  window.print();
                                  setShowActionMenu(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FaPrint /> Print SO
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete(order);
                                  setShowActionMenu(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t"
                              >
                                <FaTrash /> Delete Order
                              </button>
                            </div>
                          )}
                        </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order QR Code</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="text-center mb-4">
                <QRCodeDisplay
                  data={JSON.stringify({
                    order_number: qrOrder.order_number,
                    customer: qrOrder.customer?.name,
                    status: qrOrder.status,
                    track_url: `${window.location.origin}/sales/track/${qrOrder.order_number}`
                  })}
                  size={200}
                />
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><strong>Order:</strong> {qrOrder.order_number}</div>
                <div><strong>Customer:</strong> {qrOrder.customer?.name}</div>
                <div><strong>Status:</strong> {qrOrder.status}</div>
                <div><strong>Amount:</strong> ₹{qrOrder.final_amount?.toLocaleString()}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => navigate('/sales/orders/create')}
      >
        <FaPlus size={24} />
      </button>
    </div>
  );
};

export default SalesOrdersPage;