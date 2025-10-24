import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaQrcode,
  FaTruck,
  FaFileInvoice,
  FaPrint,
  FaChevronDown,
  FaShoppingCart,
  FaClock,
  FaCheck,
  FaMoneyBillWave,
  FaColumns,
  FaCheckCircle,
  FaExclamationCircle,
  FaBoxOpen,
  FaClipboardList
} from 'react-icons/fa';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import EnhancedPurchaseOrderForm from '../../components/procurement/EnhancedPurchaseOrderForm';
import { useVendors } from '../../hooks/useVendors';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import toast from 'react-hot-toast';

// Define all available columns with their properties
const AVAILABLE_COLUMNS = [
  { id: 'po_number', label: 'PO Number', defaultVisible: true, alwaysVisible: true },
  { id: 'po_date', label: 'PO Date', defaultVisible: true },
  { id: 'vendor', label: 'Vendor', defaultVisible: true },
  { id: 'linked_so', label: 'Linked SO', defaultVisible: false },
  { id: 'customer', label: 'Customer', defaultVisible: false },
  { id: 'project_name', label: 'Project Name', defaultVisible: false },
  { id: 'total_quantity', label: 'Total Quantity', defaultVisible: false },
  { id: 'final_amount', label: 'Total Amount', defaultVisible: true },
  { id: 'expected_delivery_date', label: 'Expected Delivery', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'priority', label: 'Priority', defaultVisible: true },
  { id: 'created_by', label: 'Created By', defaultVisible: false },
  { id: 'actions', label: 'Actions', defaultVisible: true, alwaysVisible: true }
];

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
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
    const saved = localStorage.getItem('purchaseOrdersVisibleColumns');
    if (saved) {
      return JSON.parse(saved);
    }
    return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
  });

  // Form modal states
  const [modalMode, setModalMode] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);

  const { data: vendors = [] } = useVendors();
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();

  useEffect(() => {
    fetchOrders();
    fetchSummary();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, priorityFilter, dateFrom, dateTo]);

  // Click outside handler for menus
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

  // Handle URL params for auto-opening modal or navigating to create page
  useEffect(() => {
    const viewId = searchParams.get('view');
    const editId = searchParams.get('edit');
    const createFromSoId = searchParams.get('create_from_so');

    if (createFromSoId) {
      // Navigate to create page with sales order parameter
      navigate(`/procurement/purchase-orders/create?from_sales_order=${createFromSoId}`);
    } else if (viewId && orders.length > 0) {
      const order = orders.find(o => o.id === parseInt(viewId));
      if (order) {
        setSelectedOrder(order);
        setModalMode('view');
        setSearchParams({});
      }
    } else if (editId && orders.length > 0) {
      const order = orders.find(o => o.id === parseInt(editId));
      if (order) {
        setSelectedOrder(order);
        setModalMode('edit');
        setSearchParams({});
      }
    }
  }, [searchParams, orders, setSearchParams, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/procurement/pos');
      setOrders(data.purchaseOrders || []);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      toast.error('Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/procurement/pos/stats/summary');
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.po_number?.toLowerCase().includes(search) ||
        order.vendor?.name?.toLowerCase().includes(search) ||
        order.vendor?.vendor_code?.toLowerCase().includes(search) ||
        order.project_name?.toLowerCase().includes(search) ||
        order.customer?.name?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === priorityFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(order => new Date(order.po_date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(order => new Date(order.po_date) <= new Date(dateTo));
    }

    setFilteredOrders(filtered);
  };

  const isColumnVisible = (columnId) => visibleColumns.includes(columnId);

  const toggleColumn = (columnId) => {
    const column = AVAILABLE_COLUMNS.find(col => col.id === columnId);
    if (column?.alwaysVisible) return;

    const newVisible = visibleColumns.includes(columnId)
      ? visibleColumns.filter(id => id !== columnId)
      : [...visibleColumns, columnId];

    setVisibleColumns(newVisible);
    localStorage.setItem('purchaseOrdersVisibleColumns', JSON.stringify(newVisible));
  };

  const showAllColumns = () => {
    const allIds = AVAILABLE_COLUMNS.map(col => col.id);
    setVisibleColumns(allIds);
    localStorage.setItem('purchaseOrdersVisibleColumns', JSON.stringify(allIds));
  };

  const resetColumns = () => {
    const defaultIds = AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
    setVisibleColumns(defaultIds);
    localStorage.setItem('purchaseOrdersVisibleColumns', JSON.stringify(defaultIds));
  };



  const handleView = (order) => {
    navigate(`/procurement/purchase-orders/${order.id}`);
  };

  const handleEdit = (order) => {
    navigate(`/procurement/purchase-orders/${order.id}`);
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Are you sure you want to delete PO ${order.po_number}?`)) {
      return;
    }

    try {
      await api.delete(`/procurement/pos/${order.id}`);
      toast.success('Purchase order deleted successfully');
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete purchase order');
    }
  };

  const handleGenerateQR = (order) => {
    setQrOrder(order);
    setShowQRModal(true);
  };

  const handlePrint = (order) => {
    window.print();
  };

  const handleSendToVendor = async (order) => {
    if (!window.confirm(`Send PO ${order.po_number} to vendor ${order.vendor?.name}?`)) {
      return;
    }

    try {
      await api.patch(`/procurement/pos/${order.id}`, { status: 'sent' });
      toast.success('Purchase order sent to vendor successfully!');
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send to vendor');
    }
  };

  const handleMaterialReceived = async (order) => {
    if (!window.confirm(`Confirm that materials for PO ${order.po_number} have been received? This will automatically create a GRN request for the Inventory Department.`)) {
      return;
    }

    try {
      await api.post(`/procurement/purchase-orders/${order.id}/material-received`);
      toast.success(`✅ Materials received for PO ${order.po_number}! GRN request sent to Inventory Department.`);
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark materials as received');
    }
  };

  const handleRequestGRN = async (order) => {
    if (!window.confirm(`Request GRN creation for PO ${order.po_number}? This will notify the Inventory Department for approval.`)) {
      return;
    }

    try {
      await api.post(`/procurement/purchase-orders/${order.id}/request-grn`, {
        notes: 'Requesting GRN creation from procurement'
      });
      toast.success('GRN creation request submitted successfully! Inventory Department will review.');
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request GRN creation');
    }
  };

  const handleViewGRNStatus = (order) => {
    // Navigate to PO details page with GRN tab
    navigate(`/procurement/purchase-orders/${order.id}?tab=grn`);
  };

  const handleSubmitForApproval = async (order) => {
    if (!window.confirm(`Submit Purchase Order ${order.po_number} for admin approval?`)) {
      return;
    }

    try {
      await api.post(`/procurement/pos/${order.id}/submit-for-approval`, {
        notes: 'Submitted for approval from procurement dashboard'
      });
      toast.success('Purchase order submitted for approval successfully!');
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit for approval');
    }
  };

  const handleApprovePO = async (order) => {
    if (!window.confirm(`Approve Purchase Order ${order.po_number}?`)) {
      return;
    }

    try {
      await api.post(`/procurement/pos/${order.id}/approve`);
      toast.success('Purchase order approved and sent to vendor!');
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve PO');
    }
  };

  const handleMarkAsReceived = async (order) => {
    if (!window.confirm(`Mark PO ${order.po_number} as received?`)) {
      return;
    }

    try {
      await api.patch(`/procurement/pos/${order.id}`, { status: 'received' });
      toast.success('Purchase order marked as received!');
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as received');
    }
  };

  const handleGenerateInvoice = async (order) => {
    if (!window.confirm(`Generate vendor invoice for PO ${order.po_number}?`)) {
      return;
    }

    try {
      await api.post(`/procurement/pos/${order.id}/generate-invoice`);
      toast.success('Vendor invoice generated successfully!');
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (modalMode === 'create') {
        await api.post('/procurement/pos', formData);
        toast.success('Purchase order created successfully');
      } else if (modalMode === 'edit') {
        await api.patch(`/procurement/pos/${selectedOrder.id}`, formData);
        toast.success('Purchase order updated successfully');
      }
      
      setModalMode(null);
      setSelectedOrder(null);
      setSelectedSalesOrder(null);
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save purchase order');
      throw error;
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedOrder(null);
    setSelectedSalesOrder(null);
  };

  const toggleActionMenu = (orderId, event) => {
    if (showActionMenu === orderId) {
      setShowActionMenu(null);
      setMenuPosition({});
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const menuWidth = 180;
      const menuHeight = 250; // Approximate height
      
      // Calculate position to keep menu in viewport
      let top = rect.bottom + window.scrollY;
      let left = rect.left + window.scrollX - menuWidth;
      
      // Adjust if menu would go off bottom of viewport
      if (rect.bottom + menuHeight > window.innerHeight) {
        top = rect.top + window.scrollY - menuHeight;
      }
      
      // Adjust if menu would go off left of viewport
      if (left < 0) {
        left = rect.right + window.scrollX - menuWidth;
      }
      
      // Adjust if menu would go off right of viewport
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 10;
      }
      
      setMenuPosition({ top, left });
      setShowActionMenu(orderId);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      pending_approval: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Approval' },
      approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Approved' },
      sent: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Sent to Vendor' },
      acknowledged: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Acknowledged' },
      dispatched: { bg: 'bg-lime-100', text: 'text-lime-700', label: '🚚 Dispatched' },
      in_transit: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: '🚛 In Transit' },
      grn_requested: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'GRN Requested' },
      grn_created: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'GRN Created' },
      partial_received: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Partially Received' },
      received: { bg: 'bg-green-100', text: 'text-green-700', label: 'Received' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
    };

    const badge = statusMap[status] || statusMap.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      low: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Low' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Medium' },
      high: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'High' },
      urgent: { bg: 'bg-red-100', text: 'text-red-600', label: 'Urgent' }
    };

    const badge = priorityMap[priority] || priorityMap.medium;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const vendorOptions = vendors.map(vendor => ({
    value: vendor.id,
    label: `${vendor.name} (${vendor.vendor_code})`
  }));

  const customerOptions = customers.map(customer => ({
    value: customer.id,
    label: `${customer.name} (${customer.customer_code})`
  }));

  const productOptions = products.map(product => ({
    value: product.id,
    label: `${product.name} (${product.product_code})`
  }));

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Purchase Orders</h1>
        <p className="text-gray-600">Manage and track all purchase orders</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2 mb-4">
          <div className="bg-white p-6 rounded shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{summary.total_orders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaShoppingCart size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-md border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Draft Orders</p>
                <p className="text-2xl font-bold text-gray-800">{summary.draft_orders}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <FaFileInvoice size={24} className="text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-800">{summary.pending_approval_orders}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaClock size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-md border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sent to Vendor</p>
                <p className="text-2xl font-bold text-gray-800">{summary.sent_orders}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <FaTruck size={24} className="text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Received</p>
                <p className="text-2xl font-bold text-gray-800">{summary.received_orders}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaBoxOpen size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-md border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-800">{summary.completed_orders}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <FaCheck size={24} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-md col-span-1 md:col-span-2 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-800">₹{summary.total_value?.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaMoneyBillWave size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Value</p>
                <p className="text-2xl font-bold text-orange-600">₹{summary.pending_value?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Value</p>
                <p className="text-2xl font-bold text-green-600">₹{summary.completed_value?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-4 rounded shadow-md mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 relative mr-4">
            <input
              type="text"
              placeholder="Search by PO Number, Vendor, Project, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded pl-10 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="flex gap-2">
            <div className="relative column-menu-container">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="flex items-center gap-1.5 px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
              >
                <FaColumns size={16} />
                <span>Columns</span>
                <FaChevronDown size={14} className={`transition-transform ${showColumnMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Column Menu Dropdown */}
              {showColumnMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded shadow-xl z-50 border">
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
                          className={`flex items-center gap-1.5 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                            column.alwaysVisible ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isColumnVisible(column.id)}
                            onChange={() => toggleColumn(column.id)}
                            disabled={column.alwaysVisible}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
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
              className="flex items-center gap-1.5 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <FaFilter size={16} />
              <span>Filters</span>
              <FaChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>


          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="sent">Sent to Vendor</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="dispatched">🚚 Dispatched</option>
                <option value="in_transit">🚛 In Transit</option>
                <option value="grn_requested">GRN Requested</option>
                <option value="grn_created">GRN Created</option>
                <option value="partial_received">Partially Received</option>
                <option value="received">Received</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isColumnVisible('po_number') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                )}
                {isColumnVisible('po_date') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Date</th>
                )}
                {isColumnVisible('vendor') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                )}
                {isColumnVisible('linked_so') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked SO</th>
                )}
                {isColumnVisible('customer') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                )}
                {isColumnVisible('project_name') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                )}
                {isColumnVisible('total_quantity') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                )}
                {isColumnVisible('final_amount') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                )}
                {isColumnVisible('expected_delivery_date') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Delivery</th>
                )}
                {isColumnVisible('status') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                )}
                {isColumnVisible('priority') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                )}
                {isColumnVisible('created_by') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                )}
                {isColumnVisible('actions') && (
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] min-w-[100px]">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={AVAILABLE_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">
                    Loading purchase orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={AVAILABLE_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                    {isColumnVisible('po_number') && (
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button
                          onClick={() => handleView(order)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {order.po_number}
                        </button>
                      </td>
                    )}
                    {isColumnVisible('po_date') && (
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                        {new Date(order.po_date).toLocaleDateString()}
                      </td>
                    )}
                    {isColumnVisible('vendor') && (
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.vendor?.name}</div>
                        <div className="text-xs text-gray-500">{order.vendor?.vendor_code}</div>
                      </td>
                    )}
                    {isColumnVisible('linked_so') && (
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                        {order.salesOrder?.order_number || '—'}
                      </td>
                    )}
                    {isColumnVisible('customer') && (
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customer?.name || '—'}</div>
                        {order.customer?.customer_code && (
                          <div className="text-xs text-gray-500">{order.customer.customer_code}</div>
                        )}
                      </td>
                    )}
                    {isColumnVisible('project_name') && (
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                        {order.project_name || '—'}
                      </td>
                    )}
                    {isColumnVisible('total_quantity') && (
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                        {order.total_quantity || 0}
                      </td>
                    )}
                    {isColumnVisible('final_amount') && (
                      <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{order.final_amount?.toLocaleString()}
                      </td>
                    )}
                    {isColumnVisible('expected_delivery_date') && (
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                        {new Date(order.expected_delivery_date).toLocaleDateString()}
                      </td>
                    )}
                    {isColumnVisible('status') && (
                      <td className="px-2 py-2 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                    )}
                    {isColumnVisible('priority') && (
                      <td className="px-2 py-2 whitespace-nowrap">
                        {getPriorityBadge(order.priority)}
                      </td>
                    )}
                    {isColumnVisible('created_by') && (
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                        {order.creator?.name || 'N/A'}
                      </td>
                    )}
                    {isColumnVisible('actions') && (
                      <td className="px-2 py-2 whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] transition-colors">
                        <div className="relative action-menu-container">
                          <button
                            onClick={(e) => toggleActionMenu(order.id, e)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="Actions"
                          >
                            <FaChevronDown size={14} />
                          </button>
                          
                          {/* Enhanced Action Menu Dropdown */}
                          {showActionMenu === order.id && (
                            <div
                              className="fixed bg-white rounded shadow-xl z-[100] border py-1 min-w-[220px]"
                              style={{ top: menuPosition.top, left: menuPosition.left }}
                            >
                              {/* View / Edit */}
                              <button
                                onClick={() => {
                                  handleView(order);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                              >
                                <FaEye size={16} className="text-gray-500" /> 
                                <span>View / Edit</span>
                              </button>

                              {/* Submit for Approval - Only for draft status */}
                              {order.status === 'draft' && (
                                <button
                                  onClick={() => {
                                    handleSubmitForApproval(order);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-orange-700 hover:bg-orange-50 flex items-center gap-3 transition-colors"
                                >
                                  <FaClipboardList size={16} className="text-orange-600" /> 
                                  <span>Submit for Approval</span>
                                </button>
                              )}

                              {/* Approve PO - Only for pending_approval status */}
                              {order.status === 'pending_approval' && (
                                <button
                                  onClick={() => {
                                    handleApprovePO(order);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-3 transition-colors"
                                >
                                  <FaCheckCircle size={16} className="text-green-600" /> 
                                  <span>Approve PO</span>
                                </button>
                              )}

                              {/* Send to Vendor - For approved or draft status */}
                              {(order.status === 'approved' || order.status === 'draft') && (
                                <button
                                  onClick={() => {
                                    handleSendToVendor(order);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                >
                                  <FaTruck size={16} className="text-blue-600" /> 
                                  <span>Send to Vendor</span>
                                </button>
                              )}

                              {/* Material Received - For sent or acknowledged status */}
                              {(order.status === 'sent' || order.status === 'acknowledged') && (
                                <button
                                  onClick={() => {
                                    handleMaterialReceived(order);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-3 transition-colors font-semibold"
                                >
                                  <FaCheckCircle size={16} className="text-green-600" />
                                  <span>✅ Material Received</span>
                                </button>
                              )}

                              {/* Request GRN Creation - For sent status (LEGACY - Manual Option) */}
                              {order.status === 'sent' && (
                                <button
                                  onClick={() => {
                                    handleRequestGRN(order);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-indigo-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                                >
                                  <FaBoxOpen size={16} className="text-indigo-600" />
                                  <span>📋 Request GRN (Manual)</span>
                                </button>
                              )}

                              {/* View GRN Request Status - For grn_requested or dispatched status */}
                              {(order.status === 'grn_requested' || order.status === 'dispatched' || order.status === 'in_transit') && (
                                <button
                                  onClick={() => {
                                    handleViewGRNStatus(order);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-orange-700 hover:bg-orange-50 flex items-center gap-3 transition-colors"
                                >
                                  <FaClock size={16} className="text-orange-600" />
                                  <span>⏳ {order.status === 'dispatched' || order.status === 'in_transit' ? 'Materials In Transit - GRN Pending' : 'GRN Request Pending'}</span>
                                </button>
                              )}

                              {/* Generate Invoice */}
                              <button
                                onClick={() => {
                                  handleGenerateInvoice(order);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                              >
                                <FaFileInvoice size={16} className="text-gray-500" /> 
                                <span>Generate Invoice</span>
                              </button>

                              {/* View GRN Status */}
                              {['sent', 'acknowledged', 'received', 'partial_received', 'completed'].includes(order.status) && (
                                <button
                                  onClick={() => {
                                    handleViewGRNStatus(order);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                >
                                  <FaClipboardList size={16} className="text-gray-500" /> 
                                  <span>View GRN Status</span>
                                </button>
                              )}

                              {/* Generate QR Code */}
                              <button
                                onClick={() => {
                                  handleGenerateQR(order);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                              >
                                <FaQrcode size={16} className="text-gray-500" /> 
                                <span>Generate QR Code</span>
                              </button>

                              {/* Print PO */}
                              <button
                                onClick={() => {
                                  handlePrint(order);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                              >
                                <FaPrint size={16} className="text-gray-500" /> 
                                <span>Print PO</span>
                              </button>

                              {/* Mark as Received - Quick action */}
                              {['sent', 'acknowledged', 'partial_received'].includes(order.status) && (
                                <button
                                  onClick={() => {
                                    handleMarkAsReceived(order);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-3 transition-colors"
                                >
                                  <FaCheck size={16} className="text-green-600" /> 
                                  <span>Mark as Received</span>
                                </button>
                              )}

                              {/* Delete - Dangerous action at bottom */}
                              <div className="border-t my-1"></div>
                              <button
                                onClick={() => {
                                  handleDelete(order);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                              >
                                <FaTrash size={16} className="text-red-600" /> 
                                <span>Delete Order</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Purchase Order QR Code</h2>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <QRCodeDisplay
                  data={JSON.stringify({
                    po_number: qrOrder.po_number,
                    vendor: qrOrder.vendor?.name,
                    status: qrOrder.status,
                    amount: qrOrder.final_amount,
                    track_url: `${window.location.origin}/procurement/track/${qrOrder.po_number}`
                  })}
                  size={200}
                />
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><strong>PO Number:</strong> {qrOrder.po_number}</div>
                <div><strong>Vendor:</strong> {qrOrder.vendor?.name}</div>
                <div><strong>Status:</strong> {qrOrder.status}</div>
                <div><strong>Amount:</strong> ₹{qrOrder.final_amount?.toLocaleString()}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-3 py-1.5 bg-blue-500 text-sm hover:bg-blue-600 text-white rounded transition-colors"
                >
                  Print QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Purchase Order Form Modal */}
      {modalMode && (
        <EnhancedPurchaseOrderForm
          open={true}
          mode={modalMode}
          initialValues={selectedOrder}
          linkedSalesOrder={selectedSalesOrder}
          vendorOptions={vendorOptions}
          customerOptions={customerOptions}
          productOptions={productOptions}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default PurchaseOrdersPage;