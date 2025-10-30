import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaQrcode,
  FaPrint,
  FaDownload,
  FaEye,
  FaTruck,
  FaCog,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaUser,
  FaCalendar,
  FaMapMarker,
  FaPhone,
  FaEnvelope,
  FaFileAlt,
  FaBox,
  FaIndustry,
  FaShippingFast,
  FaClipboardCheck,
  FaEdit,
  FaStar,
  FaChartLine,
  FaShoppingCart,
  FaMoneyBill,
  FaShoppingBag,
  FaPlus
} from 'react-icons/fa';
import api from '../../utils/api';
import QRCodeDisplay from '../../components/QRCodeDisplay';

const SalesOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poLoading, setPoLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    fetchPurchaseOrders();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sales/orders/${id}`);
      setOrder(response.data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      setPoLoading(true);
      const response = await api.get(`/sales/orders/${id}/po-status`);
      setPurchaseOrders(response.data.purchase_orders || []);
    } catch (err) {
      console.error('Failed to fetch purchase orders:', err);
      setPurchaseOrders([]);
    } finally {
      setPoLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      if (newStatus === 'confirmed') {
        await api.put(`/sales/orders/${id}/confirm`);
      }
      fetchOrderDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleProceedToProcurement = async () => {
    try {
      await api.post(`/bom/generate/${id}`);
      navigate('/procurement/bom');
    } catch (error) {
      console.error('Failed to generate BOM:', error);
      alert(error.response?.data?.message || 'Failed to generate BOM');
    }
  };

  const handleViewProduction = () => {
    navigate('/manufacturing/orders');
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        color: 'bg-gradient-to-r from-gray-400 to-gray-500',
        textColor: 'text-gray-700',
        icon: <FaClock className="w-4 h-4" />,
        label: 'Draft'
      },
      confirmed: {
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        textColor: 'text-blue-700',
        icon: <FaCheckCircle className="w-4 h-4" />,
        label: 'Confirmed'
      },
      in_production: {
        color: 'bg-gradient-to-r from-orange-500 to-orange-600',
        textColor: 'text-orange-700',
        icon: <FaCog className="w-4 h-4 animate-spin" />,
        label: 'In Production'
      },
      materials_received: {
        color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        textColor: 'text-yellow-700',
        icon: <FaTruck className="w-4 h-4" />,
        label: 'Materials Received'
      },
      completed: {
        color: 'bg-gradient-to-r from-green-500 to-green-600',
        textColor: 'text-green-700',
        icon: <FaCheckCircle className="w-4 h-4" />,
        label: 'Completed'
      },
      shipped: {
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        textColor: 'text-purple-700',
        icon: <FaShippingFast className="w-4 h-4" />,
        label: 'Shipped'
      },
      cancelled: {
        color: 'bg-gradient-to-r from-red-500 to-red-600',
        textColor: 'text-red-700',
        icon: <FaExclamationTriangle className="w-4 h-4" />,
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.draft;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { color: 'bg-blue-100 text-blue-700', icon: '🔵' },
      medium: { color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
      high: { color: 'bg-orange-100 text-orange-700', icon: '🟠' },
      urgent: { color: 'bg-red-100 text-red-700', icon: '🔴' }
    };
    return configs[priority] || configs.medium;
  };

  const getPoStatusConfig = (status) => {
    const configs = {
      draft: { color: 'bg-slate-100 text-slate-700', label: 'Draft' },
      pending_approval: { color: 'bg-amber-100 text-amber-700', label: 'Pending Approval' },
      approved: { color: 'bg-blue-100 text-blue-700', label: 'Approved' },
      sent_to_vendor: { color: 'bg-cyan-100 text-cyan-700', label: 'Sent to Vendor' },
      completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' }
    };
    return configs[status] || configs.draft;
  };

  const getOrderStages = () => {
    const stages = [
      { key: 'draft', label: 'Draft', icon: <FaFileAlt /> },
      { key: 'confirmed', label: 'Confirmed', icon: <FaCheckCircle /> },
      { key: 'materials_received', label: 'Materials', icon: <FaBox /> },
      { key: 'in_production', label: 'Production', icon: <FaIndustry /> },
      { key: 'completed', label: 'Completed', icon: <FaClipboardCheck /> },
      { key: 'shipped', label: 'Shipped', icon: <FaShippingFast /> }
    ];

    const currentIndex = stages.findIndex(s => s.key === order?.status);
    
    return stages.map((stage, index) => ({
      ...stage,
      completed: index < currentIndex,
      active: index === currentIndex,
      upcoming: index > currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-3"></div>
          <p className="text-lg font-semibold text-gray-700">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded shadow-xl p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-3xl" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Error Loading Order</h2>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded shadow-xl p-6 border-l-4 border-yellow-500">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-yellow-500 text-3xl" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Order Not Found</h2>
                <p className="text-gray-600 text-sm">The requested order could not be found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const priorityConfig = getPriorityConfig(order.priority);
  const orderStages = getOrderStages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-6 py-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <button
            onClick={() => navigate('/sales/orders')}
            className="flex items-center gap-1 text-blue-100 hover:text-white mb-2 transition-all text-xs font-medium hover:gap-2"
          >
            <FaArrowLeft className="w-3 h-3" />
            <span>Back</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white/15 backdrop-blur-sm rounded-lg">
                  <FaShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-xs font-medium">Order #</p>
                  <h1 className="text-2xl font-bold">{order.order_number}</h1>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-1 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${statusConfig.color} shadow-lg backdrop-blur-sm flex items-center gap-1`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityConfig.color} flex items-center gap-1 backdrop-blur-sm`}>
                  <span>{priorityConfig.icon}</span>
                  <span className="capitalize">{order.priority}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <button className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg hover:bg-white/30 transition-all shadow-lg font-semibold text-xs border border-white/30">
                <FaQrcode className="w-3 h-3" />
                <span>QR</span>
              </button>
              <button className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg hover:bg-white/30 transition-all shadow-lg font-semibold text-xs border border-white/30">
                <FaPrint className="w-3 h-3" />
                <span>Print</span>
              </button>
              <button className="flex items-center gap-1 bg-white text-blue-600 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-all shadow-lg font-semibold text-xs">
                <FaDownload className="w-3 h-3" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 max-w-7xl mx-auto">

        {/* Enhanced Progress Timeline */}
        <div className="bg-white rounded-xl shadow-md p-3 mb-3 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <FaChartLine className="text-blue-600 w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Order Progress</h2>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              {orderStages.map((stage, index) => (
                <div key={stage.key} className="flex flex-col items-center flex-1 relative">
                  {index < orderStages.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-1 rounded-full ${
                      stage.completed ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gray-200'
                    }`} style={{ zIndex: 0 }}></div>
                  )}
                  
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    stage.completed 
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-105 ring-2 ring-green-100' 
                      : stage.active 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl scale-110 animate-pulse ring-2 ring-blue-100' 
                      : 'bg-gray-100 text-gray-400 ring-1 ring-gray-200'
                  }`}>
                    {stage.completed ? <FaCheckCircle className="w-4 h-4" /> : React.cloneElement(stage.icon, { className: 'w-4 h-4' })}
                  </div>
                  
                  <span className={`text-xs font-bold text-center max-w-16 ${
                    stage.active ? 'text-blue-700' : stage.completed ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
          {/* Order Date Card */}
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-all hover:border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <div className="p-1.5 bg-blue-100 rounded">
                <FaCalendar className="text-blue-600 w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xxs">Date</span>
            </div>
            <p className="text-gray-600 text-xs font-medium mb-0.5">Order Date</p>
            <p className="text-sm font-bold text-gray-900">{new Date(order.order_date).toLocaleDateString()}</p>
          </div>

          {/* Quantity Card */}
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-all hover:border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <div className="p-1.5 bg-purple-100 rounded">
                <FaBox className="text-purple-600 w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded text-xxs">QTY</span>
            </div>
            <p className="text-gray-600 text-xs font-medium mb-0.5">Qty</p>
            <p className="text-lg font-bold text-gray-900">{order.total_quantity}</p>
          </div>

          {/* Amount Card */}
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-all hover:border-green-200">
            <div className="flex items-center justify-between mb-1">
              <div className="p-1.5 bg-green-100 rounded">
                <FaMoneyBill className="text-green-600 w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-xxs">Amt</span>
            </div>
            <p className="text-gray-600 text-xs font-medium mb-0.5">Revenue</p>
            <p className="text-base font-bold text-green-600">₹{(order.final_amount / 1000).toFixed(1)}K</p>
          </div>

          {/* Days Left Card */}
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-all hover:border-orange-200">
            <div className="flex items-center justify-between mb-1">
              <div className="p-1.5 bg-orange-100 rounded">
                <FaClock className="text-orange-600 w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-xxs">Days</span>
            </div>
            <p className="text-gray-600 text-xs font-medium mb-0.5">Delivery</p>
            <div className="flex items-baseline gap-1">
              <p className="text-lg font-bold text-orange-600">
                {Math.ceil((new Date(order.delivery_date) - new Date()) / (1000 * 60 * 60 * 24))}
              </p>
              <span className="text-xs text-gray-500">days</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Enhanced Tabs */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <nav className="flex gap-1 px-3 py-2">
                  {[
                    { id: 'details', label: 'Details', icon: <FaFileAlt className="w-4 h-4" /> },
                    { id: 'items', label: 'Items', icon: <FaBox className="w-4 h-4" /> },
                    { id: 'procurement', label: 'Procurement', icon: <FaShoppingBag className="w-4 h-4" />, badge: purchaseOrders.length },
                    { id: 'specs', label: 'Specifications', icon: <FaClipboardCheck className="w-4 h-4" /> },
                    { id: 'timeline', label: 'Timeline', icon: <FaClock className="w-4 h-4" /> },
                    { id: 'actions', label: 'Actions', icon: <FaCog className="w-4 h-4" /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm rounded-lg transition-all whitespace-nowrap relative ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-blue-200">
                        <div className="p-2.5 bg-blue-100 rounded-lg">
                          <FaFileAlt className="text-blue-600 w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Order Information</h3>
                      </div>
                      <div className="space-y-3.5 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Order Number</span>
                          <span className="font-semibold text-gray-900 bg-white px-3 py-1.5 rounded-lg">{order.order_number}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Order Date</span>
                          <span className="font-semibold text-gray-900">{new Date(order.order_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Delivery Date</span>
                          <span className="font-semibold text-gray-900">{new Date(order.delivery_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Payment Terms</span>
                          <span className="font-semibold text-gray-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">{order.payment_terms || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-purple-200">
                        <div className="p-2.5 bg-purple-100 rounded-lg">
                          <FaUser className="text-purple-600 w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Customer Information</h3>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {order.customer?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{order.customer?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-600 font-mono">{order.customer?.customer_code || 'No code'}</p>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100">
                          <FaEnvelope className="text-purple-500 w-4 h-4 flex-shrink-0" />
                          <span className="text-gray-700 truncate">{order.customer?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100">
                          <FaPhone className="text-purple-500 w-4 h-4 flex-shrink-0" />
                          <span className="text-gray-700">{order.customer?.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'items' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaBox className="text-blue-600 w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Order Items ({order.items?.length || 0})</h3>
                    </div>
                    {order.items && order.items.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                            <tr>
                              <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase text-xs">Product</th>
                              <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase text-xs">Fabric</th>
                              <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase text-xs">Color</th>
                              <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase text-xs">Qty</th>
                              <th className="px-4 py-3 text-right font-bold text-gray-700 uppercase text-xs">Rate</th>
                              <th className="px-4 py-3 text-right font-bold text-gray-700 uppercase text-xs">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {order.items.map((item, index) => (
                              <tr key={index} className="hover:bg-blue-50 transition-colors">
                                <td className="px-4 py-3 font-semibold text-gray-900">{item.product_id || 'Product'}</td>
                                <td className="px-4 py-3 text-gray-700">{item.fabric_type || '—'}</td>
                                <td className="px-4 py-3">
                                  {item.color ? (
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-sm" style={{backgroundColor: item.color.toLowerCase()}}></span>
                                      <span className="text-gray-700 capitalize font-medium">{item.color}</span>
                                    </div>
                                  ) : '—'}
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-900 text-center">{item.quantity} pcs</td>
                                <td className="px-4 py-3 text-gray-700 text-right">₹{item.rate?.toLocaleString()}</td>
                                <td className="px-4 py-3 font-bold text-green-600 text-right">₹{item.total?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <FaBox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No items in this order</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'procurement' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FaShoppingBag className="text-blue-600 w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Purchase Orders ({purchaseOrders.length})</h3>
                      </div>
                      <button
                        onClick={() => navigate(`/procurement/create?from_sales_order=${id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm shadow-md"
                      >
                        <FaPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Create PO</span>
                      </button>
                    </div>

                    {poLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-600"></div>
                      </div>
                    ) : purchaseOrders.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {purchaseOrders.map((po) => {
                          const poStatusConfig = getPoStatusConfig(po.status);
                          return (
                            <div
                              key={po.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                                {/* PO Number */}
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">PO Number</p>
                                  <p className="text-sm font-bold text-gray-900">{po.po_number}</p>
                                </div>

                                {/* Vendor */}
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">Vendor</p>
                                  <p className="text-sm font-semibold text-gray-900">{po.vendor?.vendor_name || 'N/A'}</p>
                                  <p className="text-xs text-gray-500">{po.vendor?.vendor_code || ''}</p>
                                </div>

                                {/* Status */}
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">Status</p>
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${poStatusConfig.color}`}>
                                    {poStatusConfig.label}
                                  </span>
                                </div>

                                {/* Amount */}
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">Total Amount</p>
                                  <p className="text-sm font-bold text-green-600">₹{(po.total_amount || 0).toLocaleString()}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                                {/* Expected Delivery */}
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">Expected Delivery</p>
                                  <p className="text-sm text-gray-900">
                                    {po.expected_delivery_date
                                      ? new Date(po.expected_delivery_date).toLocaleDateString()
                                      : 'N/A'}
                                  </p>
                                </div>

                                {/* Item Count */}
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">Items</p>
                                  <p className="text-sm text-gray-900">
                                    {Array.isArray(po.items) ? po.items.length : 0} item(s)
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => navigate(`/procurement/orders/${po.id}`)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-semibold text-xs border border-blue-200"
                                  >
                                    <FaEye className="w-3 h-3" />
                                    <span className="hidden sm:inline">View</span>
                                  </button>
                                  {po.status === 'draft' && (
                                    <button
                                      onClick={() => navigate(`/procurement/orders/${po.id}/edit`)}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all font-semibold text-xs border border-amber-200"
                                    >
                                      <FaEdit className="w-3 h-3" />
                                      <span className="hidden sm:inline">Edit</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-200">
                        <FaShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium mb-1">No Purchase Orders yet</p>
                        <p className="text-gray-500 text-sm mb-4">Create a Purchase Order to track procurement for this sales order.</p>
                        <button
                          onClick={() => navigate(`/procurement/create?from_sales_order=${id}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm"
                        >
                          <FaPlus className="w-4 h-4" />
                          Create Your First PO
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaClipboardCheck className="text-blue-600 w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Garment Specifications</h3>
                    </div>
                    {order.garment_specifications && Object.keys(order.garment_specifications).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(order.garment_specifications).map(([key, value]) => (
                          <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-2 tracking-wider">
                              {key.replace(/_/g, ' ')}
                            </label>
                            <p className="text-sm font-semibold text-gray-900">
                              {typeof value === 'boolean' ? (value ? '✓ Yes' : '✗ No') : typeof value === 'object' ? JSON.stringify(value) : value || '—'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <FaFileAlt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No specifications available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaClock className="text-blue-600 w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Event Timeline</h3>
                    </div>
                    {order.lifecycle_history && order.lifecycle_history.length > 0 ? (
                      <div className="space-y-3">
                        {order.lifecycle_history.map((event, index) => (
                          <div key={index} className="flex gap-4 pb-4 relative">
                            {index < order.lifecycle_history.length - 1 && (
                              <div className="absolute left-5.5 top-12 w-1 h-12 bg-gradient-to-b from-blue-300 to-transparent"></div>
                            )}
                            <div className="flex-shrink-0">
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg border-4 border-white relative z-10">
                                <FaCheckCircle className="w-5 h-5" />
                              </div>
                            </div>
                            <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-200 transition-colors hover:shadow-md">
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-bold text-gray-900 text-sm">{event.event}</p>
                                <p className="text-xs text-gray-500 font-mono">{new Date(event.timestamp).toLocaleDateString()}</p>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{event.details}</p>
                              <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <FaClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No events recorded yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaCog className="text-blue-600 w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Available Actions</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {order.status === 'draft' && (
                        <button
                          onClick={() => handleStatusUpdate('confirmed')}
                          className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg text-sm font-semibold hover:shadow-xl transform hover:scale-105 duration-200"
                        >
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FaCheckCircle className="w-5 h-5" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-bold">Confirm Order</p>
                            <p className="text-xs text-green-100">Approve and send to procurement</p>
                          </div>
                          <FaArrowLeft className="w-4 h-4 opacity-70 rotate-180" />
                        </button>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <button
                          onClick={handleProceedToProcurement}
                          className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg text-sm font-semibold hover:shadow-xl transform hover:scale-105 duration-200"
                        >
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FaBox className="w-5 h-5" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-bold">Generate BOM</p>
                            <p className="text-xs text-blue-100">Create bill of materials for procurement</p>
                          </div>
                          <FaArrowLeft className="w-4 h-4 opacity-70 rotate-180" />
                        </button>
                      )}
                      
                      {(order.status === 'in_production' || order.status === 'materials_received') && (
                        <button
                          onClick={handleViewProduction}
                          className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg text-sm font-semibold hover:shadow-xl transform hover:scale-105 duration-200"
                        >
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FaIndustry className="w-5 h-5" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-bold">View Production</p>
                            <p className="text-xs text-orange-100">Check current production status</p>
                          </div>
                          <FaArrowLeft className="w-4 h-4 opacity-70 rotate-180" />
                        </button>
                      )}
                      
                      {!['draft', 'confirmed', 'in_production', 'materials_received'].includes(order.status) && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                          <FaCog className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No actions available for this order status</p>
                          <p className="text-xs text-gray-400 mt-1">Current status: {statusConfig.label}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaQrcode className="text-blue-600 w-5 h-5" />
                  </div>
                  QR Code
                </h2>
                <button className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                  <FaDownload className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 flex justify-center">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-dashed border-blue-300">
                  <QRCodeDisplay
                    data={order.qr_code || JSON.stringify({
                      order_number: order.order_number,
                      customer: order.customer?.name,
                      quantity: order.total_quantity,
                      amount: order.final_amount,
                      delivery_date: order.delivery_date,
                      status: order.status
                    })}
                    size={160}
                  />
                </div>
              </div>
              <div className="px-5 pb-4 text-center">
                <p className="text-xs text-gray-600 font-medium">📱 Scan with your phone for live order tracking</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-xl shadow-md p-5 text-white hover:shadow-lg transition-shadow border border-indigo-400/30">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/20">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FaStar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold">Quick Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/15 bg-white/10 px-3 py-2 rounded-lg">
                  <span className="text-indigo-100 font-medium">Current Status</span>
                  <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-lg">{statusConfig.label}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/15 bg-white/10 px-3 py-2 rounded-lg">
                  <span className="text-indigo-100 font-medium">Priority Level</span>
                  <span className="font-bold text-white capitalize bg-white/20 px-3 py-1 rounded-lg">{order.priority}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/15 bg-white/10 px-3 py-2 rounded-lg">
                  <span className="text-indigo-100 font-medium">Total Items</span>
                  <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-lg">{order.items?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg">
                  <span className="text-indigo-100 font-medium">Created Date</span>
                  <span className="font-bold text-white">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FaFileAlt className="text-amber-600 w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Order Notes</h3>
                </div>
                <div className="p-5">
                  <p className="text-gray-700 text-sm leading-relaxed bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border-l-4 border-amber-400 font-medium">
                    {order.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Additional Info Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaCheckCircle className="text-green-600 w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Order Summary</h3>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Sub Total</span>
                  <span className="font-bold text-gray-900">₹{(order.final_amount * 0.9).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">GST (10%)</span>
                  <span className="font-bold text-green-600">₹{(order.final_amount * 0.1).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="text-gray-900 font-bold">Total Amount</span>
                  <span className="font-bold text-lg text-blue-600">₹{order.final_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetailsPage;