import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaQrcode,
  FaPrint,
  FaDownload,
  FaEdit,
  FaPaperPlane,
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
  FaTruck,
  FaStore,
  FaWarehouse,
  FaBoxOpen,
  FaIndustry,
  FaShippingFast,
  FaClipboardCheck,
  FaStar,
  FaChartLine,
  FaCog,
  FaHourglassHalf
} from 'react-icons/fa';
import api from '../../utils/api';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import toast from 'react-hot-toast';

const PurchaseOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/procurement/pos/${id}`);
      setOrder(response.data.purchaseOrder || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
      toast.error('Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (actionType) => {
    try {
      let statusToUpdate;
      switch (actionType) {
        case 'send_for_approval':
          statusToUpdate = 'pending_approval';
          break;
        case 'approve':
          statusToUpdate = 'approved';
          break;
        case 'send_to_vendor':
          statusToUpdate = 'sent';
          break;
        case 'mark_as_ordered':
          statusToUpdate = 'acknowledged';
          break;
        case 'mark_as_received':
          statusToUpdate = 'received';
          break;
        case 'complete':
          statusToUpdate = 'completed';
          break;
        default:
          return;
      }

      await api.put(`/procurement/pos/${id}/status`, { status: statusToUpdate });
      toast.success('Status updated successfully');
      fetchOrderDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        color: 'bg-gradient-to-r from-gray-400 to-gray-500',
        icon: <FaClock className="w-4 h-4" />,
        label: 'Draft'
      },
      pending_approval: {
        color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        icon: <FaHourglassHalf className="w-4 h-4" />,
        label: 'Pending Approval'
      },
      approved: {
        color: 'bg-gradient-to-r from-green-500 to-green-600',
        icon: <FaCheckCircle className="w-4 h-4" />,
        label: 'Approved'
      },
      sent: {
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        icon: <FaPaperPlane className="w-4 h-4" />,
        label: 'Sent to Vendor'
      },
      acknowledged: {
        color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
        icon: <FaClipboardCheck className="w-4 h-4" />,
        label: 'Acknowledged'
      },
      received: {
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        icon: <FaTruck className="w-4 h-4" />,
        label: 'Received'
      },
      completed: {
        color: 'bg-gradient-to-r from-teal-500 to-teal-600',
        icon: <FaCheckCircle className="w-4 h-4" />,
        label: 'Completed'
      },
      cancelled: {
        color: 'bg-gradient-to-r from-red-500 to-red-600',
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

  const getOrderStages = () => {
    const stages = [
      { key: 'draft', label: 'Draft', icon: <FaFileAlt /> },
      { key: 'pending_approval', label: 'Approval', icon: <FaHourglassHalf /> },
      { key: 'approved', label: 'Approved', icon: <FaCheckCircle /> },
      { key: 'sent', label: 'Sent', icon: <FaPaperPlane /> },
      { key: 'acknowledged', label: 'Acknowledged', icon: <FaClipboardCheck /> },
      { key: 'received', label: 'Received', icon: <FaTruck /> },
      { key: 'completed', label: 'Completed', icon: <FaCheckCircle /> }
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600 mb-3"></div>
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
                <p className="text-gray-600 text-sm">The requested purchase order could not be found.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/procurement/purchase-orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-all text-sm"
          >
            <FaArrowLeft className="w-3 h-3" />
            <span className="font-medium">Back to Purchase Orders</span>
          </button>

          <div className="bg-white rounded shadow-lg p-4 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{order.po_number}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusConfig.color} shadow-md flex items-center gap-1.5`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <FaCalendar className="text-gray-400 w-3 h-3" />
                    <span className="text-gray-600">Order: <span className="font-semibold text-gray-900">{new Date(order.order_date).toLocaleDateString()}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaTruck className="text-gray-400 w-3 h-3" />
                    <span className="text-gray-600">Expected: <span className="font-semibold text-gray-900">{new Date(order.expected_delivery_date).toLocaleDateString()}</span></span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityConfig.color} flex items-center gap-1`}>
                    <span>{priorityConfig.icon}</span>
                    <span className="capitalize">{order.priority}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded hover:from-blue-700 hover:to-blue-800 transition-all shadow-md text-sm">
                  <FaPrint className="w-3 h-3" />
                  <span>Print</span>
                </button>
                <button className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded hover:from-green-700 hover:to-green-800 transition-all shadow-md text-sm">
                  <FaDownload className="w-3 h-3" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Progress Timeline */}
        <div className="bg-white rounded shadow-lg p-4 mb-4 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FaChartLine className="text-purple-600 w-4 h-4" />
            Purchase Order Progress
          </h2>
          <div className="relative">
            <div className="flex justify-between items-center">
              {orderStages.map((stage, index) => (
                <div key={stage.key} className="flex flex-col items-center flex-1 relative">
                  {index < orderStages.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                      stage.completed ? 'bg-gradient-to-r from-purple-500 to-purple-400' : 'bg-gray-200'
                    }`} style={{ zIndex: 0 }}></div>
                  )}
                  
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-all duration-300 ${
                    stage.completed 
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md scale-105' 
                      : stage.active 
                      ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg scale-110 animate-pulse' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {stage.completed ? <FaCheckCircle className="w-4 h-4" /> : React.cloneElement(stage.icon, { className: 'w-3.5 h-3.5' })}
                  </div>
                  
                  <span className={`text-xs font-semibold text-center ${
                    stage.active ? 'text-pink-700' : stage.completed ? 'text-purple-700' : 'text-gray-500'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Compact Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-1">
                  <FaBox className="w-5 h-5 opacity-80" />
                  <span className="text-2xl font-bold">{order.items?.length || 0}</span>
                </div>
                <p className="text-purple-100 text-xs font-medium">Total Items</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">₹</span>
                  <span className="text-2xl font-bold">{(order.total_amount / 1000).toFixed(1)}K</span>
                </div>
                <p className="text-pink-100 text-xs font-medium">Total Amount</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-1">
                  <FaCalendar className="w-5 h-5 opacity-80" />
                  <span className="text-2xl font-bold">
                    {Math.ceil((new Date(order.expected_delivery_date) - new Date()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
                <p className="text-orange-100 text-xs font-medium">Days Left</p>
              </div>
            </div>

            {/* Compact Tabs */}
            <div className="bg-white rounded shadow-lg border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50">
                <nav className="flex">
                  {['details', 'items', 'vendor', 'timeline', 'actions'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-4 py-2.5 font-semibold text-xs capitalize transition-all ${
                        activeTab === tab
                          ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-4">
                {activeTab === 'details' && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded p-3 border border-purple-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                      <FaFileAlt className="text-purple-600 w-3.5 h-3.5" />
                      Order Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded p-2.5 shadow-sm">
                        <span className="text-xs text-gray-500 uppercase">PO Number</span>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{order.po_number}</p>
                      </div>
                      <div className="bg-white rounded p-2.5 shadow-sm">
                        <span className="text-xs text-gray-500 uppercase">Order Date</span>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{new Date(order.order_date).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white rounded p-2.5 shadow-sm">
                        <span className="text-xs text-gray-500 uppercase">Expected Delivery</span>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{new Date(order.expected_delivery_date).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white rounded p-2.5 shadow-sm">
                        <span className="text-xs text-gray-500 uppercase">Payment Terms</span>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{order.payment_terms || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'items' && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                      <FaBox className="text-purple-600 w-3.5 h-3.5" />
                      Order Items
                    </h3>
                    <div className="overflow-x-auto rounded border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left font-bold text-gray-700 uppercase">Material</th>
                            <th className="px-3 py-2 text-left font-bold text-gray-700 uppercase">Description</th>
                            <th className="px-3 py-2 text-left font-bold text-gray-700 uppercase">Quantity</th>
                            <th className="px-3 py-2 text-left font-bold text-gray-700 uppercase">Unit Price</th>
                            <th className="px-3 py-2 text-left font-bold text-gray-700 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {order.items?.map((item, index) => (
                            <tr key={index} className="hover:bg-purple-50 transition-colors">
                              <td className="px-3 py-2 font-semibold text-gray-900">{item.material_name}</td>
                              <td className="px-3 py-2 text-gray-700">{item.description}</td>
                              <td className="px-3 py-2 font-semibold text-gray-900">{item.quantity} {item.unit}</td>
                              <td className="px-3 py-2 text-gray-700">₹{item.unit_price}</td>
                              <td className="px-3 py-2 font-bold text-green-600">₹{item.total_price?.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'vendor' && (
                  <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded p-3 border border-orange-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                      <FaStore className="text-orange-600 w-3.5 h-3.5" />
                      Vendor Information
                    </h3>
                    <div className="bg-white rounded p-3 shadow-sm space-y-2">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          {order.vendor?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{order.vendor?.name}</p>
                          <p className="text-xs text-gray-500">{order.vendor?.vendor_code}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaEnvelope className="text-orange-500 w-3 h-3" />
                          <span className="truncate">{order.vendor?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaPhone className="text-orange-500 w-3 h-3" />
                          <span>{order.vendor?.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                      <FaClock className="text-purple-600 w-3.5 h-3.5" />
                      Timeline
                    </h3>
                    <div className="space-y-2">
                      {order.timeline?.map((event, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white flex-shrink-0">
                            <FaCheckCircle className="w-3 h-3" />
                          </div>
                          <div className="flex-1 bg-white rounded p-2.5 shadow-sm border border-gray-100">
                            <p className="font-bold text-gray-900 text-xs mb-0.5">{event.event}</p>
                            <p className="text-xs text-gray-600 mb-1">{event.details}</p>
                            <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 bg-gray-50 rounded">
                          <FaClock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No events</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                      <FaCog className="text-purple-600 w-3.5 h-3.5" />
                      Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {order.status === 'draft' && (
                        <button
                          onClick={() => handleStatusUpdate('send_for_approval')}
                          className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 rounded hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md text-sm"
                        >
                          <FaPaperPlane className="w-4 h-4" />
                          <div className="text-left">
                            <p className="font-bold">Send for Approval</p>
                            <p className="text-xs text-yellow-100">Submit for review</p>
                          </div>
                        </button>
                      )}
                      
                      {order.status === 'pending_approval' && (
                        <button
                          onClick={() => handleStatusUpdate('approve')}
                          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded hover:from-green-600 hover:to-green-700 transition-all shadow-md text-sm"
                        >
                          <FaCheckCircle className="w-4 h-4" />
                          <div className="text-left">
                            <p className="font-bold">Approve Order</p>
                            <p className="text-xs text-green-100">Approve and proceed</p>
                          </div>
                        </button>
                      )}
                      
                      {order.status === 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate('send_to_vendor')}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded hover:from-blue-600 hover:to-blue-700 transition-all shadow-md text-sm"
                        >
                          <FaPaperPlane className="w-4 h-4" />
                          <div className="text-left">
                            <p className="font-bold">Send to Vendor</p>
                            <p className="text-xs text-blue-100">Notify vendor</p>
                          </div>
                        </button>
                      )}
                      
                      {order.status === 'sent' && (
                        <button
                          onClick={() => handleStatusUpdate('mark_as_ordered')}
                          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-3 rounded hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md text-sm"
                        >
                          <FaClipboardCheck className="w-4 h-4" />
                          <div className="text-left">
                            <p className="font-bold">Mark as Acknowledged</p>
                            <p className="text-xs text-indigo-100">Vendor confirmed</p>
                          </div>
                        </button>
                      )}
                      
                      {order.status === 'acknowledged' && (
                        <button
                          onClick={() => handleStatusUpdate('mark_as_received')}
                          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded hover:from-purple-600 hover:to-purple-700 transition-all shadow-md text-sm"
                        >
                          <FaTruck className="w-4 h-4" />
                          <div className="text-left">
                            <p className="font-bold">Mark as Received</p>
                            <p className="text-xs text-purple-100">Materials received</p>
                          </div>
                        </button>
                      )}
                      
                      {order.status === 'received' && (
                        <button
                          onClick={() => handleStatusUpdate('complete')}
                          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white p-3 rounded hover:from-teal-600 hover:to-teal-700 transition-all shadow-md text-sm"
                        >
                          <FaCheckCircle className="w-4 h-4" />
                          <div className="text-left">
                            <p className="font-bold">Complete Order</p>
                            <p className="text-xs text-teal-100">Finalize order</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Sidebar */}
          <div className="space-y-4">
            {/* QR Code */}
            <div className="bg-white rounded shadow-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <FaQrcode className="text-purple-600 w-3.5 h-3.5" />
                  QR Code
                </h2>
                <button className="text-purple-600 hover:text-purple-800">
                  <FaDownload className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded p-3 flex justify-center border border-dashed border-purple-200">
                <QRCodeDisplay
                  data={order.qr_code || JSON.stringify({
                    po_number: order.po_number,
                    vendor: order.vendor?.name,
                    total_amount: order.total_amount,
                    expected_delivery: order.expected_delivery_date,
                    status: order.status
                  })}
                  size={150}
                />
              </div>
              <p className="text-center text-xs text-gray-500 mt-2">Scan for live status</p>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded shadow-lg p-4 text-white">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                <FaStar className="w-3.5 h-3.5" />
                Quick Stats
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <span className="text-purple-100">Status</span>
                  <span className="font-bold">{statusConfig.label}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <span className="text-purple-100">Priority</span>
                  <span className="font-bold capitalize">{order.priority}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <span className="text-purple-100">Items</span>
                  <span className="font-bold">{order.items?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Created</span>
                  <span className="font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded shadow-lg p-4 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <FaFileAlt className="text-purple-600 w-3.5 h-3.5" />
                  Notes
                </h3>
                <p className="text-gray-700 text-xs leading-relaxed bg-yellow-50 p-2.5 rounded border-l-2 border-yellow-400">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailsPage;