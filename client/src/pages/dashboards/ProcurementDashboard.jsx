import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShoppingCart, Plus, Search, Eye, Edit, Building, Receipt, Truck, DollarSign, Calendar, CheckCircle, AlertTriangle, Download, Star, Phone, Mail, QrCode, MessageSquare, Package, Factory, RefreshCw } from 'lucide-react';
// ...existing code...
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import QRCodeScanner from '../../components/manufacturing/QRCodeScanner';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import PurchaseOrderForm from '../../components/procurement/PurchaseOrderForm';

const ProcurementDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');

  // Real data
  const [stats, setStats] = useState({
    totalPOs: 0,
    openPOs: 0,
    vendorCount: 0,
    pendingOrders: 0
  });
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [incomingPurchaseOrders, setIncomingPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // Show success message if navigated from PO creation
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      // Clear the state after showing the message
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (isFetching) return; // Prevent multiple simultaneous calls

    try {
      setIsFetching(true);
      setLoading(true);

      // Fetch stats
      const statsRes = await api.get('/procurement/dashboard/stats');
      setStats(prevStats => ({
        ...prevStats,
        ...statsRes.data
      }));

      // Fetch recent purchase orders (limit to 10 for dashboard)
      const poRes = await api.get('/procurement/pos?limit=10');
      setPurchaseOrders(poRes.data.purchaseOrders || []);

      // Fetch incoming orders from sales (sent to procurement)
      // Query for orders where ready_for_procurement=true (both draft and confirmed)
      const incomingRes = await api.get('/sales/orders?limit=50');
      // Filter for orders that are ready for procurement (draft = pending approval, confirmed = ready for PO creation)
      const ordersForProcurement = (incomingRes.data.orders || []).filter(order => 
        order.ready_for_procurement === true && (order.status === 'draft' || order.status === 'confirmed')
      );
      setIncomingOrders(ordersForProcurement);

      // Fetch incoming purchase orders (draft, pending_approval, sent status)
      const incomingPORes = await api.get('/procurement/pos?status=draft,pending_approval,sent&limit=20');
      setIncomingPurchaseOrders(incomingPORes.data.purchaseOrders || []);

      // Update pending orders count (both sales orders and incoming POs)
      const totalIncoming = (incomingRes.data.orders?.length || 0) + (incomingPORes.data.purchaseOrders?.length || 0);
      setStats(prevStats => ({
        ...prevStats,
        pendingOrders: totalIncoming
      }));

      // Fetch vendors (limit to 10 for dashboard)
      const vendorsRes = await api.get('/procurement/vendors?limit=10');
      setVendors(vendorsRes.data.vendors || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setStats({ totalPOs: 0, openPOs: 0, vendorCount: 0, pendingOrders: 0 });
      setPurchaseOrders([]);
      setIncomingOrders([]);
      setVendors([]);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Handle QR code scanning
  const handleQrScanSuccess = (qrData) => {
    setSelectedOrder(qrData);
    setQrDialogOpen(true);
    toast.success('Order details loaded from QR code');
  };

  // Handle creating purchase order from sales order
  const handleCreatePO = (salesOrder) => {
    // Navigate to Create Purchase Order page with sales order ID pre-filled
    navigate(`/procurement/purchase-orders/create?from_sales_order=${salesOrder.id}`);
  };

  // Handle accepting incoming order request (Procurement Only)
  const handleAcceptOrder = async (order) => {
    if (!window.confirm(`Confirm order ${order.order_number}?\n\nThis will change the order status to 'Confirmed' and notify the Sales department.`)) {
      return;
    }

    try {
      // Use dedicated procurement endpoint
      const response = await api.put(`/procurement/sales-orders/${order.id}/accept`);
      
      toast.success('Order confirmed successfully. Sales department has been notified.');
      fetchDashboardData();
    } catch (error) {
      console.error('Error confirming order:', error);
      const errorMsg = error.response?.data?.message || 'Failed to confirm order';
      const currentStatus = error.response?.data?.currentStatus;
      
      if (currentStatus) {
        toast.error(`${errorMsg}. Current status: ${currentStatus}`);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  // Send order to inventory (when stock is received)
  const handleSendToInventory = async (orderId) => {
    if (!window.confirm('Mark materials as received and send to inventory?')) {
      return;
    }

    try {
      // Use proper status update endpoint (procurement has access)
      await api.put(`/sales/orders/${orderId}/status`, {
        status: 'materials_received',
        notes: 'Materials received by procurement and sent to inventory'
      });

      toast.success('Order sent to inventory');
      fetchDashboardData();
    } catch (error) {
      console.error('Error sending to inventory:', error);
      toast.error('Failed to send to inventory');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending_approval: 'warning',
      approved: 'info',
      sent_to_vendor: 'primary',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getDeliveryStatusColor = (status) => {
    const colors = {
      not_started: 'default',
      pending: 'warning',
      in_transit: 'info',
      delivered: 'success',
      delayed: 'error'
    };
    return colors[status] || 'default';
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">{title}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
        </div>
        <div className={`rounded-full p-2 bg-${color}-100 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const TabPanel = ({ children, value, index }) => (
    <div className={value !== index ? 'hidden' : 'pt-3'}>
      {value === index && children}
    </div>
  );

  const filteredPOs = filterStatus === 'all' 
    ? purchaseOrders 
    : purchaseOrders.filter(po => po.status === filterStatus);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Procurement Dashboard</h1>
        <div className="flex gap-2">
          <button className="btn btn-outline flex items-center gap-2" onClick={() => navigate('/procurement/vendor-management')}>
            <Building className="w-5 h-5" /> Vendor Management
          </button>
          <button className="btn btn-primary flex items-center gap-2" onClick={() => navigate('/procurement/purchase-orders')}>
            <Plus className="w-5 h-5" /> Create Purchase Order
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Purchase Orders" value={stats.totalPOs} icon={<ShoppingBag className="w-8 h-8 text-blue-500" />} color="blue" />
        <StatCard title="Pending Approval" value={stats.pendingPOs} icon={<Calendar className="w-8 h-8 text-yellow-500" />} color="yellow" />
        <StatCard title="Completed Orders" value={stats.completedPOs} icon={<CheckCircle className="w-8 h-8 text-green-500" />} color="green" />
        <StatCard title="Total Spend" value={`₹${(stats.totalSpend / 100000).toFixed(1)}L`} icon={<DollarSign className="w-8 h-8 text-cyan-500" />} color="cyan" subtitle="This month" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Orders</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="sent_to_vendor">Sent to Vendor</option>
          <option value="completed">Completed</option>
        </select>
        <button
          onClick={() => navigate('/procurement/reports')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          View Reports
        </button>
        <button
          onClick={() => navigate('/procurement/reports')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                tabValue === 0
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setTabValue(0)}
            >
              Incoming Orders ({incomingOrders.length + incomingPurchaseOrders.length})
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                tabValue === 1
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setTabValue(1)}
            >
              Purchase Orders
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                tabValue === 2
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setTabValue(2)}
            >
              Vendor Management
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                tabValue === 3
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setTabValue(3)}
            >
              Goods Receipt
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                tabValue === 4
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setTabValue(4)}
            >
              Vendor Performance
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {tabValue === 0 && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Incoming Orders (Sales Orders & Purchase Orders)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setQrScannerOpen(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" /> Scan QR Code
                </button>
                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {incomingOrders.length === 0 && incomingPurchaseOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No incoming orders
                </h3>
                <p className="text-gray-500">
                  Sales orders and purchase orders will appear here
                </p>
              </div>
            ) : (
              <>
                {/* Sales Orders Section */}
                {incomingOrders.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Sales Orders Requiring Material Procurement ({incomingOrders.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Material Requirements
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {incomingOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {order.order_number}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {typeof order.customer === 'object' ? order.customer?.name : order.customer}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {typeof order.customer === 'object' ? order.customer?.phone : order.customer_phone}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{order.product_name}</div>
                                <div className="text-sm text-gray-500">{order.garment_specs?.fabric_type}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {order.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {order.garment_specs?.fabric_type && (
                                    <div>Fabric: {order.garment_specs.fabric_type}</div>
                                  )}
                                  {order.garment_specs?.printing_required && (
                                    <div>Printing: Yes</div>
                                  )}
                                  {order.garment_specs?.embroidery_required && (
                                    <div>Embroidery: Yes</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    order.status === 'confirmed'
                                      ? 'bg-green-100 text-green-800'
                                      : order.status === 'draft'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : order.status === 'accepted_by_procurement'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {order.status === 'draft' ? '⏳ PENDING APPROVAL' : order.status === 'confirmed' ? '✅ APPROVED' : order.status.replace(/_/g, ' ').toUpperCase()}
                                  </span>
                                  {order.linkedPurchaseOrder && (
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-200">
                                      📦 PO: {order.linkedPurchaseOrder.po_number}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setQrDialogOpen(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="View QR Code"
                                  >
                                    <QrCode className="w-4 h-4" />
                                  </button>
                                  
                                  {/* Show Accept button only for DRAFT orders (pending approval) */}
                                  {order.status === 'draft' && (
                                    <button
                                      onClick={() => handleAcceptOrder(order)}
                                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center gap-1"
                                      title="Accept Order Request"
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                      Accept
                                    </button>
                                  )}
                                  
                                  {/* Show Create PO button OR PO Created status for CONFIRMED orders */}
                                  {order.status === 'confirmed' && (
                                    <>
                                      {order.linkedPurchaseOrder ? (
                                        // PO already created - show success status and allow navigation
                                        <button
                                          onClick={() => navigate(`/procurement/purchase-orders/${order.linkedPurchaseOrder.id}`)}
                                          className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded border border-green-300 hover:bg-green-200 flex items-center gap-1"
                                          title={`View Purchase Order: ${order.linkedPurchaseOrder.po_number}`}
                                        >
                                          <CheckCircle className="w-3 h-3" />
                                          PO Created ✓
                                        </button>
                                      ) : (
                                        // No PO created yet - show create button
                                        <button
                                          onClick={() => handleCreatePO(order)}
                                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                                          title="Create Purchase Order from this Sales Order"
                                        >
                                          <Plus className="w-3 h-3" />
                                          Create PO
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Purchase Orders Section */}
                {incomingPurchaseOrders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Receipt className="w-5 h-5" />
                      Incoming Purchase Orders ({incomingPurchaseOrders.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              PO Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Vendor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              PO Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Expected Delivery
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {incomingPurchaseOrders.map((po) => (
                            <tr key={po.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {po.po_number}
                                </div>
                                {po.linked_sales_order_id && (
                                  <div className="text-xs text-blue-600">
                                    Linked to SO-{po.linked_sales_order_id}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{po.vendor?.name || 'N/A'}</div>
                                <div className="text-xs text-gray-500">{po.vendor?.vendor_code || ''}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {po.po_date ? new Date(po.po_date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₹{po.total_amount ? parseFloat(po.total_amount).toLocaleString() : '0'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  po.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                  po.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                  po.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {(po.status || '').replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => navigate(`/procurement/purchase-orders/${po.id}`)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="View PO"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => navigate(`/procurement/purchase-orders/${po.id}`)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Edit PO"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Purchase Orders Tab */}
        {tabValue === 1 && (
          <div className="p-6">
            <PurchaseOrderForm
              vendors={vendors}
              projects={incomingOrders.map(order => ({ id: order.id, name: order.project_title || order.order_number }))}
              clients={incomingOrders.map(order => ({ id: order.customer_id || order.id, name: order.customer }))}
            />
          </div>
        )}

        {/* Vendor Management Tab - Navigate to dedicated page */}
        {tabValue === 2 && (
          <div className="p-6">
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vendor Management
              </h3>
              <p className="text-gray-500 mb-4">
                Manage your vendors, view performance metrics, and maintain supplier relationships.
              </p>
              <button
                onClick={() => navigate('/procurement/vendors')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Vendor Management
              </button>
            </div>
          </div>
        )}

        {/* Goods Receipt Tab - Navigate to dedicated page */}
        {tabValue === 3 && (
          <div className="p-6">
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Goods Receipt
              </h3>
              <p className="text-gray-500 mb-4">
                Receive and inspect incoming materials from vendors.
              </p>
              <button
                onClick={() => navigate('/procurement/goods-receipt')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Goods Receipt
              </button>
            </div>
          </div>
        )}

        {/* Vendor Performance Tab - Navigate to dedicated page */}
        {tabValue === 4 && (
          <div className="p-6">
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vendor Performance
              </h3>
              <p className="text-gray-500 mb-4">
                Analyze vendor performance metrics and delivery statistics.
              </p>
              <button
                onClick={() => navigate('/procurement/vendor-performance')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Vendor Performance
              </button>
            </div>
          </div>
        )}
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
                  department: 'procurement',
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
                Scan this QR code to access procurement details
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Scanner */}
      {qrScannerOpen && (
        <QRCodeScanner
          onScanSuccess={handleQrScanSuccess}
          onClose={() => setQrScannerOpen(false)}
        />
      )}
    </div>
  );
};

export default ProcurementDashboard;
