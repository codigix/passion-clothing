import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShoppingCart, Plus, Search, Eye, Edit, Building, Receipt, Truck, DollarSign, Calendar, CheckCircle, AlertTriangle, Download, Star, Phone, Mail, QrCode, MessageSquare, Package, Factory, RefreshCw, TrendingUp, BarChart3, Clock, Box } from 'lucide-react';
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
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (isFetching) return;

    try {
      setIsFetching(true);
      setLoading(true);

      // Fetch stats
      const statsRes = await api.get('/procurement/dashboard/stats');
      setStats(prevStats => ({
        ...prevStats,
        ...statsRes.data
      }));

      // Fetch recent purchase orders
      const poRes = await api.get('/procurement/pos?limit=10');
      setPurchaseOrders(poRes.data.purchaseOrders || []);

      // Fetch incoming orders from sales
      const incomingRes = await api.get('/sales/orders?limit=50');
      const ordersForProcurement = (incomingRes.data.orders || []).filter(order => 
        order.ready_for_procurement === true && (order.status === 'draft' || order.status === 'confirmed')
      );
      setIncomingOrders(ordersForProcurement);

      // Fetch incoming purchase orders
      const incomingPORes = await api.get('/procurement/pos?status=draft,pending_approval,sent&limit=20');
      setIncomingPurchaseOrders(incomingPORes.data.purchaseOrders || []);

      // Update pending orders count
      const totalIncoming = (incomingRes.data.orders?.length || 0) + (incomingPORes.data.purchaseOrders?.length || 0);
      setStats(prevStats => ({
        ...prevStats,
        pendingOrders: totalIncoming
      }));

      // Fetch vendors
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
    navigate(`/procurement/purchase-orders/create?from_sales_order=${salesOrder.id}`);
  };

  // Handle accepting incoming order request
  const handleAcceptOrder = async (order) => {
    if (!order) {
      toast.error('Order details are unavailable. Please refresh and try again.');
      return;
    }

    const isDraft = order.status === 'draft';
    const isReady = order.ready_for_procurement === true;

    if (!isDraft || !isReady) {
      toast.error(
        `Order ${order.order_number || order.id} cannot be accepted yet. Status: ${order.status || 'unknown'}, Ready for procurement: ${isReady ? 'Yes' : 'No'}.`
      );
      return;
    }

    if (!window.confirm(`Confirm order ${order.order_number}?\n\nThis will change the order status to 'Confirmed' and notify the Sales department.`)) {
      return;
    }

    try {
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

  // Send order to inventory
  const handleSendToInventory = async (orderId) => {
    if (!window.confirm('Mark materials as received and send to inventory?')) {
      return;
    }

    try {
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

  const filteredPOs = filterStatus === 'all' 
    ? purchaseOrders 
    : purchaseOrders.filter(po => po.status === filterStatus);

  const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
    <div className="bg-white rounded-lg border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-2">{label}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: color + '15' }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#0f172a15' }}>
                <ShoppingBag size={28} style={{ color: '#0f172a' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Procurement Dashboard</h1>
                <p className="text-sm text-slate-500 mt-0.5">Manage orders, vendors & supply chain</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => navigate('/procurement/vendor-management')}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium text-sm"
              >
                <Building size={18} /> Vendors
              </button>
              <button 
                onClick={() => navigate('/procurement/purchase-orders')}
                className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition font-medium text-sm shadow-sm"
                style={{ backgroundColor: '#0f172a' }}
              >
                <Plus size={18} /> Create PO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={ShoppingCart}
            label="Total Purchase Orders"
            value={stats.totalPOs}
            color="#3b82f6"
            subtitle="All time"
          />
          <StatCard
            icon={Clock}
            label="Pending Orders"
            value={stats.pendingOrders}
            color="#f59e0b"
            subtitle="Awaiting action"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed POs"
            value={stats.completedPOs || 0}
            color="#10b981"
            subtitle="This month"
          />
          <StatCard
            icon={DollarSign}
            label="Total Spend"
            value={`₹${(stats.totalSpend / 100000).toFixed(1)}L`}
            color="#8b5cf6"
            subtitle="YTD"
          />
        </div>

        {/* Filter & Controls Bar */}
        <div className="flex gap-3 mb-6 flex-wrap items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white"
          >
            <option value="all">All Orders</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="sent_to_vendor">Sent to Vendor</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => navigate('/procurement/reports')}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium text-sm"
          >
            <BarChart3 size={18} /> Reports
          </button>
          <button
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white transition font-medium text-sm disabled:opacity-50"
            style={{ backgroundColor: '#0f172a' }}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw size={18} />}
            Refresh
          </button>
          <button
            onClick={() => navigate('/procurement/reports')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white transition font-medium text-sm ml-auto"
            style={{ backgroundColor: '#06b6d4' }}
          >
            <Download size={18} /> Export
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b border-slate-200">
          {[
            { label: 'Incoming', count: incomingOrders.length + incomingPurchaseOrders.length, icon: TrendingUp },
            { label: 'Purchase Orders', count: purchaseOrders.length, icon: Receipt },
            { label: 'Vendors', count: vendors.length, icon: Building }
          ].map((tab, idx) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={idx}
                onClick={() => setTabValue(idx)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition border-b-2 whitespace-nowrap ${
                  tabValue === idx
                    ? 'border-blue-500 text-slate-800'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                <TabIcon size={18} />
                {tab.label} <span className="ml-2 px-2.5 py-0.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {/* Incoming Orders Tab */}
          {tabValue === 0 && (
            <div className="space-y-6">
              {incomingOrders.length === 0 && incomingPurchaseOrders.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-lg">
                  <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-800 mb-2">No Incoming Orders</p>
                  <p className="text-slate-500">Check back later or create a new purchase order</p>
                </div>
              ) : (
                <>
                  {/* Sales Orders Section */}
                  {incomingOrders.length > 0 && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: '#3b82f615' }}>
                            <ShoppingCart size={20} style={{ color: '#3b82f6' }} />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800">
                            Sales Orders <span className="text-sm text-slate-500">({incomingOrders.length})</span>
                          </h3>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">#</th>
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Customer</th>
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Product</th>
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Qty</th>
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Material</th>
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Status</th>
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {incomingOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 text-sm font-bold text-slate-800">{order.order_number}</td>
                                <td className="px-6 py-4 text-sm">
                                  <p className="font-semibold text-slate-800">{typeof order.customer === 'object' ? order.customer?.name : order.customer}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <p className="text-slate-800">{order.garment_specifications?.product_name || order.product_name || 'N/A'}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{order.garment_specifications?.product_type || 'N/A'}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-800">{order.total_quantity || 0}</td>
                                <td className="px-6 py-4 text-sm">
                                  <div className="space-y-1">
                                    {order.garment_specifications?.fabric_type && (
                                      <p className="text-slate-800"><span className="text-slate-500">Fabric:</span> {order.garment_specifications.fabric_type}</p>
                                    )}
                                    {order.garment_specifications?.color && (
                                      <p className="text-slate-800"><span className="text-slate-500">Color:</span> {order.garment_specifications.color}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-xs ${
                                    order.status === 'confirmed'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {order.status === 'confirmed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                    {order.status === 'draft' ? 'Pending' : 'Approved'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => navigate(`/sales/orders/${order.id}`)}
                                      className="p-2 rounded-lg hover:bg-slate-100 transition text-blue-600"
                                      title="View"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    {order.status === 'draft' && (
                                      <button
                                        onClick={() => handleAcceptOrder(order)}
                                        className="p-2 rounded-lg hover:bg-slate-100 transition text-green-600"
                                        title="Accept"
                                      >
                                        <CheckCircle size={16} />
                                      </button>
                                    )}
                                    {order.status === 'confirmed' && (
                                      <button
                                        onClick={() => handleCreatePO(order)}
                                        className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600"
                                        title="Create PO"
                                      >
                                        <Plus size={16} />
                                      </button>
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
                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: '#8b5cf615' }}>
                            <Receipt size={20} style={{ color: '#8b5cf6' }} />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800">
                            Incoming Purchase Orders <span className="text-sm text-slate-500">({incomingPurchaseOrders.length})</span>
                          </h3>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">PO #</th>
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Vendor</th>
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Amount</th>
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Status</th>
                              <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {incomingPurchaseOrders.map((po) => (
                              <tr key={po.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 text-sm font-bold text-slate-800">{po.po_number}</td>
                                <td className="px-6 py-4 text-sm text-slate-800">{po.vendor?.vendor_name || po.vendor_id}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-800">₹{(po.total_amount / 100).toFixed(0)}</td>
                                <td className="px-6 py-4 text-sm">
                                  <span className={`inline-flex px-3 py-1 rounded-full font-semibold text-xs ${
                                    po.status === 'draft'
                                      ? 'bg-slate-100 text-slate-700'
                                      : po.status === 'pending_approval'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {po.status.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <button
                                    onClick={() => navigate(`/procurement/purchase-orders/${po.id}`)}
                                    className="p-2 rounded-lg hover:bg-slate-100 transition text-blue-600"
                                    title="View"
                                  >
                                    <Eye size={16} />
                                  </button>
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
            <div>
              {filteredPOs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-lg">
                  <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-800 mb-2">No Purchase Orders</p>
                  <p className="text-slate-500">Create your first purchase order to get started</p>
                  <button 
                    onClick={() => navigate('/procurement/purchase-orders/create')}
                    className="mt-4 px-6 py-2.5 text-white rounded-lg transition font-semibold text-sm"
                    style={{ backgroundColor: '#0f172a' }}
                  >
                    Create PO
                  </button>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">PO #</th>
                          <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Vendor</th>
                          <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Amount</th>
                          <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Created</th>
                          <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredPOs.map((po) => (
                          <tr key={po.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 text-sm font-bold text-slate-800">{po.po_number}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">{po.vendor?.vendor_name || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800">₹{(po.total_amount / 100).toFixed(0)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{new Date(po.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex px-3 py-1 rounded-full font-semibold text-xs ${
                                po.status === 'draft'
                                  ? 'bg-slate-100 text-slate-700'
                                  : po.status === 'pending_approval'
                                  ? 'bg-amber-100 text-amber-700'
                                  : po.status === 'approved'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {po.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => navigate(`/procurement/purchase-orders/${po.id}`)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition text-blue-600"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vendors Tab */}
          {tabValue === 2 && (
            <div>
              {vendors.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-lg">
                  <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-800 mb-2">No Vendors Found</p>
                  <p className="text-slate-500">Add vendors to manage procurement</p>
                  <button 
                    onClick={() => navigate('/procurement/vendor-management')}
                    className="mt-4 px-6 py-2.5 text-white rounded-lg transition font-semibold text-sm"
                    style={{ backgroundColor: '#0f172a' }}
                  >
                    Manage Vendors
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-slate-800">{vendor.vendor_name}</h4>
                          <p className="text-sm text-slate-500">{vendor.vendor_code}</p>
                        </div>
                        <Star size={20} className="text-amber-500" />
                      </div>
                      
                      <div className="space-y-2 mb-4 text-sm">
                        {vendor.contact_person && (
                          <p className="text-slate-700"><span className="text-slate-500">Contact:</span> {vendor.contact_person}</p>
                        )}
                        {vendor.email && (
                          <p className="text-slate-700 flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {vendor.email}</p>
                        )}
                        {vendor.phone && (
                          <p className="text-slate-700 flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {vendor.phone}</p>
                        )}
                      </div>

                      <button
                        onClick={() => navigate('/procurement/vendor-management')}
                        className="w-full py-2 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition font-medium text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;