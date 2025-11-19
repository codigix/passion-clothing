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
  const [sendVendorModalOpen, setSendVendorModalOpen] = useState(false);
  const [sendVendorOptions, setSendVendorOptions] = useState({ email: true, whatsapp: false });
  const [sendingToVendor, setSendingToVendor] = useState(false);

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
      if (actionType === 'send_to_vendor') {
        setSendVendorModalOpen(true);
        return;
      }

      let statusToUpdate;
      switch (actionType) {
        case 'send_for_approval':
          statusToUpdate = 'pending_approval';
          break;
        case 'approve':
          statusToUpdate = 'approved';
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
      
      if (actionType === 'approve') {
        setTimeout(() => setSendVendorModalOpen(true), 500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSendToVendor = async () => {
    if (!sendVendorOptions.email && !sendVendorOptions.whatsapp) {
      toast.error('Please select at least one communication method');
      return;
    }

    setSendingToVendor(true);
    try {
      const response = await api.post(`/procurement/pos/${id}/send-to-vendor`, {
        sendEmail: sendVendorOptions.email,
        sendWhatsapp: sendVendorOptions.whatsapp
      });
      
      toast.success(response.data.message || 'PO sent to vendor successfully!');
      setSendVendorModalOpen(false);
      setSendVendorOptions({ email: true, whatsapp: false });
      fetchOrderDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send PO to vendor');
    } finally {
      setSendingToVendor(false);
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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mb-2"></div>
          <p className="text-sm font-medium text-gray-700">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 min-h-screen bg-white">
        <div className="max-w-2xl mx-auto mt-5">
          <div className="bg-white rounded shadow-sm p-3 border-l-4 border-red-500">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500 text-2xl flex-shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Error Loading Order</h2>
                <p className="text-red-600 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-2 min-h-screen bg-white">
        <div className="max-w-2xl mx-auto mt-5">
          <div className="bg-white rounded shadow-sm p-3 border-l-4 border-yellow-500">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-500 text-2xl flex-shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Order Not Found</h2>
                <p className="text-gray-600 text-xs mt-0.5">The requested purchase order could not be found.</p>
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
    <div className="min-h-screen bg-white p-2">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-2">
          <button
            onClick={() => navigate('/procurement/purchase-orders')}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2 transition-all text-xs"
          >
            <FaArrowLeft className="w-3 h-3" />
            <span className="font-normal">Back</span>
          </button>

          <div className="bg-white rounded shadow-sm p-2 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-lg font-semibold text-gray-900">{order.po_number}</h1>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${statusConfig.color} shadow-sm flex items-center gap-1`}>
                    {statusConfig.icon}
                    <span className="text-xs">{statusConfig.label}</span>
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaCalendar className="text-gray-400 w-3 h-3" />
                    <span>{new Date(order.order_date).toLocaleDateString()}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <FaTruck className="text-gray-400 w-3 h-3" />
                    <span>{new Date(order.expected_delivery_date).toLocaleDateString()}</span>
                  </div>
                  <span>•</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${priorityConfig.color} flex items-center gap-0.5`}>
                    <span>{priorityConfig.icon}</span>
                    <span className="capitalize">{order.priority}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-all shadow-sm text-xs">
                  <FaPrint className="w-3 h-3" />
                  <span>Print</span>
                </button>
                <button className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-all shadow-sm text-xs">
                  <FaDownload className="w-3 h-3" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Progress Timeline */}
        <div className="bg-white rounded shadow-sm p-2 mb-2 border border-gray-100">
          <h2 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
            <FaChartLine className="text-purple-600 w-3 h-3" />
            Progress
          </h2>
          <div className="relative">
            <div className="flex justify-between items-center">
              {orderStages.map((stage, index) => (
                <div key={stage.key} className="flex flex-col items-center flex-1 relative">
                  {index < orderStages.length - 1 && (
                    <div className={`absolute top-3 left-1/2 w-full h-0.5 ${
                      stage.completed ? 'bg-purple-500' : 'bg-gray-200'
                    }`} style={{ zIndex: 0 }}></div>
                  )}
                  
                  <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                    stage.completed 
                      ? 'bg-purple-500 text-white shadow-sm' 
                      : stage.active 
                      ? 'bg-pink-500 text-white shadow-md' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {stage.completed ? <FaCheckCircle className="w-3 h-3" /> : React.cloneElement(stage.icon, { className: 'w-3 h-3' })}
                  </div>
                  
                  <span className={`text-xs font-normal text-center ${
                    stage.active ? 'text-pink-700' : stage.completed ? 'text-purple-700' : 'text-gray-500'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-2">
            {/* Compact Summary Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-purple-500 rounded shadow-sm p-2 text-white">
                <div className="flex items-center justify-between mb-0.5">
                  <FaBox className="w-4 h-4 opacity-80" />
                  <span className="text-base font-semibold">{order.items?.length || 0}</span>
                </div>
                <p className="text-purple-100 text-xs font-normal">Items</p>
              </div>

              <div className="bg-pink-500 rounded shadow-sm p-2 text-white">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs">₹</span>
                  <span className="text-base font-semibold">{(order.total_amount / 1000).toFixed(1)}K</span>
                </div>
                <p className="text-pink-100 text-xs font-normal">Amount</p>
              </div>

              <div className="bg-orange-500 rounded shadow-sm p-2 text-white">
                <div className="flex items-center justify-between mb-0.5">
                  <FaCalendar className="w-4 h-4 opacity-80" />
                  <span className="text-base font-semibold">
                    {Math.ceil((new Date(order.expected_delivery_date) - new Date()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
                <p className="text-orange-100 text-xs font-normal">Days</p>
              </div>
            </div>

            {/* Compact Tabs */}
            <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50">
                <nav className="flex">
                  {['details', 'items', 'vendor', 'timeline', 'actions'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-2 py-1.5 font-medium text-xs capitalize transition-all ${
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

              <div className="p-2">
                {activeTab === 'details' && (
                  <div className="bg-purple-50 rounded p-2 border border-purple-100">
                    <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1">
                      <FaFileAlt className="text-purple-600 w-3 h-3" />
                      Information
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-white rounded p-1.5 shadow-sm">
                        <span className="text-xs text-gray-500">PO Number</span>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">{order.po_number}</p>
                      </div>
                      <div className="bg-white rounded p-1.5 shadow-sm">
                        <span className="text-xs text-gray-500">Order Date</span>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">{new Date(order.order_date).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white rounded p-1.5 shadow-sm">
                        <span className="text-xs text-gray-500">Expected Delivery</span>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">{new Date(order.expected_delivery_date).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white rounded p-1.5 shadow-sm">
                        <span className="text-xs text-gray-500">Payment Terms</span>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">{order.payment_terms || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'items' && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1">
                      <FaBox className="text-purple-600 w-3 h-3" />
                      Items
                    </h3>
                    <div className="overflow-x-auto rounded border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1 text-left font-semibold text-gray-700">Material</th>
                            <th className="px-2 py-1 text-left font-semibold text-gray-700">Description</th>
                            <th className="px-2 py-1 text-left font-semibold text-gray-700">Qty</th>
                            <th className="px-2 py-1 text-left font-semibold text-gray-700">Unit Price</th>
                            <th className="px-2 py-1 text-left font-semibold text-gray-700">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {order.items?.map((item, index) => (
                            <tr key={index} className="hover:bg-purple-50 transition-colors">
                              <td className="px-2 py-1 font-medium text-gray-900">{item.material}</td>
                              <td className={`px-2 py-1 ${item.description ? 'text-gray-700' : 'text-gray-400 italic'}`}>{item.description || 'No description added'}</td>
                              <td className="px-2 py-1 font-medium text-gray-900">{item.quantity} {item.unit}</td>
                              <td className="px-2 py-1 text-gray-700">₹{item.rate}</td>
                              <td className="px-2 py-1 font-semibold text-green-600">₹{item.total?.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'vendor' && (
                  <div className="bg-orange-50 rounded p-2 border border-orange-100">
                    <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1">
                      <FaStore className="text-orange-600 w-3 h-3" />
                      Vendor
                    </h3>
                    <div className="bg-white rounded p-2 shadow-sm space-y-1.5">
                      <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium text-xs">
                          {order.vendor?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900">{order.vendor?.name}</p>
                          <p className="text-xs text-gray-500">{order.vendor?.vendor_code}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <FaEnvelope className="text-orange-500 w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{order.vendor?.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <FaPhone className="text-orange-500 w-3 h-3 flex-shrink-0" />
                          <span>{order.vendor?.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1">
                      <FaClock className="text-purple-600 w-3 h-3" />
                      Timeline
                    </h3>
                    <div className="space-y-1.5">
                      {order.timeline?.map((event, index) => (
                        <div key={index} className="flex gap-1.5 items-start">
                          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                            <FaCheckCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="flex-1 bg-white rounded p-1.5 shadow-sm border border-gray-100">
                            <p className="font-medium text-gray-900 text-xs">{event.event}</p>
                            <p className="text-xs text-gray-600">{event.details}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-4 bg-gray-50 rounded">
                          <FaClock className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                          <p className="text-gray-500 text-xs">No events</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1">
                      <FaCog className="text-purple-600 w-3 h-3" />
                      Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-1.5">
                      {order.status === 'draft' && (
                        <button
                          onClick={() => handleStatusUpdate('send_for_approval')}
                          className="flex items-center gap-2 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-all shadow-sm text-xs"
                        >
                          <FaPaperPlane className="w-3 h-3" />
                          <span className="font-medium">Send for Approval</span>
                        </button>
                      )}
                      
                      {order.status === 'pending_approval' && (
                        <button
                          onClick={() => handleStatusUpdate('approve')}
                          className="flex items-center gap-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-all shadow-sm text-xs font-medium"
                          title="Approving will open the send to vendor dialog"
                        >
                          <FaCheckCircle className="w-3 h-3" />
                          <span>Approve & Send to Vendor</span>
                        </button>
                      )}
                      
                      {order.status === 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate('send_to_vendor')}
                          className="flex items-center gap-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-all shadow-sm text-xs"
                        >
                          <FaPaperPlane className="w-3 h-3" />
                          <span className="font-medium">Send to Vendor</span>
                        </button>
                      )}
                      
                      {order.status === 'sent' && (
                        <button
                          onClick={() => handleStatusUpdate('mark_as_ordered')}
                          className="flex items-center gap-2 bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600 transition-all shadow-sm text-xs"
                        >
                          <FaClipboardCheck className="w-3 h-3" />
                          <span className="font-medium">Mark as Acknowledged</span>
                        </button>
                      )}
                      
                      {order.status === 'acknowledged' && (
                        <button
                          onClick={() => handleStatusUpdate('mark_as_received')}
                          className="flex items-center gap-2 bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition-all shadow-sm text-xs"
                        >
                          <FaTruck className="w-3 h-3" />
                          <span className="font-medium">Mark as Received</span>
                        </button>
                      )}
                      
                      {order.status === 'received' && (
                        <button
                          onClick={() => handleStatusUpdate('complete')}
                          className="flex items-center gap-2 bg-teal-500 text-white p-2 rounded hover:bg-teal-600 transition-all shadow-sm text-xs"
                        >
                          <FaCheckCircle className="w-3 h-3" />
                          <span className="font-medium">Complete Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Sidebar */}
          <div className="space-y-2">
            {/* QR Code */}
            <div className="bg-white rounded shadow-sm p-2 border border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                  <FaQrcode className="text-purple-600 w-3 h-3" />
                  QR Code
                </h2>
                <button className="text-purple-600 hover:text-purple-800">
                  <FaDownload className="w-3 h-3" />
                </button>
              </div>
              <div className="bg-purple-50 rounded p-1.5 flex justify-center border border-dashed border-purple-200">
                <QRCodeDisplay
                  data={order.qr_code || JSON.stringify({
                    po_number: order.po_number,
                    vendor: order.vendor?.name,
                    total_amount: order.total_amount,
                    expected_delivery: order.expected_delivery_date,
                    status: order.status
                  })}
                  size={120}
                />
              </div>
              <p className="text-center text-xs text-gray-500 mt-1">Scan status</p>
            </div>

            {/* Quick Stats */}
            <div className="bg-purple-500 rounded shadow-sm p-2 text-white">
              <h3 className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                <FaStar className="w-3 h-3" />
                Stats
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center pb-1 border-b border-white/20">
                  <span className="text-purple-100">Status</span>
                  <span className="font-semibold">{statusConfig.label}</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-white/20">
                  <span className="text-purple-100">Priority</span>
                  <span className="font-semibold capitalize">{order.priority}</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-white/20">
                  <span className="text-purple-100">Items</span>
                  <span className="font-semibold">{order.items?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Created</span>
                  <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded shadow-sm p-2 border border-gray-100">
                <h3 className="text-xs font-semibold text-gray-900 mb-1 flex items-center gap-1">
                  <FaFileAlt className="text-purple-600 w-3 h-3" />
                  Notes
                </h3>
                <p className="text-gray-700 text-xs leading-tight bg-yellow-50 p-1.5 rounded border-l-2 border-yellow-400">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {sendVendorModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <div className="text-blue-600 font-semibold text-xs">PROCUREMENT DEPARTMENT</div>
              </div>
              
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaPaperPlane className="text-blue-600" />
                Send PO to Vendor
              </h2>

              <p className="text-sm text-gray-600 mb-6">
                Choose how you want to send the PO to <strong>{order?.vendor?.name || 'Vendor'}</strong>:
              </p>

              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{borderColor: sendVendorOptions.email ? '#3b82f6' : '#e5e7eb'}}>
                  <input
                    type="checkbox"
                    checked={sendVendorOptions.email}
                    onChange={(e) => setSendVendorOptions({...sendVendorOptions, email: e.target.checked})}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Send via Email</div>
                    <div className="text-xs text-gray-600">{order?.vendor?.email || 'email@vendor.com'}</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 transition-colors" style={{borderColor: sendVendorOptions.whatsapp ? '#22c55e' : '#e5e7eb'}}>
                  <input
                    type="checkbox"
                    checked={sendVendorOptions.whatsapp}
                    onChange={(e) => setSendVendorOptions({...sendVendorOptions, whatsapp: e.target.checked})}
                    className="w-4 h-4 text-green-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Send via WhatsApp</div>
                    <div className="text-xs text-gray-600">{order?.vendor?.phone || '+91 XXXXXXXXXX'}</div>
                  </div>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 space-y-2">
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-2">📋 PO Details to be sent:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded border border-blue-100">
                      <span className="text-gray-600">PO Number</span>
                      <p className="font-semibold text-gray-900">{order?.po_number}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-blue-100">
                      <span className="text-gray-600">Amount</span>
                      <p className="font-semibold text-gray-900">₹{parseFloat(order?.final_amount || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-blue-100">
                      <span className="text-gray-600">Items</span>
                      <p className="font-semibold text-gray-900">{order?.items?.length || 0}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-blue-100">
                      <span className="text-gray-600">Delivery</span>
                      <p className="font-semibold text-gray-900">{new Date(order?.expected_delivery_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-xs text-green-800 font-medium">✓ Status will be updated to 'Sent' after sending</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSendVendorModalOpen(false)}
                  disabled={sendingToVendor}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendToVendor}
                  disabled={sendingToVendor || (!sendVendorOptions.email && !sendVendorOptions.whatsapp)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingToVendor ? (
                    <>
                      <span className="inline-block animate-spin">⟳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="w-4 h-4" />
                      Send Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderDetailsPage;