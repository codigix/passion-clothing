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
  FaIndustry
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
  const [showQRModal, setShowQRModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryLocation, setInventoryLocation] = useState('Main Warehouse');
  const [inventoryNotes, setInventoryNotes] = useState('');
  const [showMaterialRequestModal, setShowMaterialRequestModal] = useState(false);
  const [materialRequestData, setMaterialRequestData] = useState({
    priority: 'medium',
    required_date: '',
    procurement_notes: '',
    selected_materials: []
  });
  const [showProductionRequestModal, setShowProductionRequestModal] = useState(false);
  const [productionRequestData, setProductionRequestData] = useState({
    product_name: '',
    product_description: '',
    product_specifications: {},
    quantity: '',
    unit: '',
    priority: 'medium',
    required_date: '',
    procurement_notes: ''
  });

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

      await api.patch(`/procurement/pos/${id}`, { status: statusToUpdate });
      toast.success(`Purchase order ${actionType.replace('_', ' ')} successfully`);
      fetchOrderDetails(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/procurement/pos/${id}/export`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PO_${order.po_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Purchase order exported successfully');
    } catch (err) {
      toast.error('Failed to export purchase order');
    }
  };

  const handleApproveAndAddToInventory = async () => {
    try {
      const response = await api.post(`/procurement/pos/${id}/approve-and-add-to-inventory`, {
        location: inventoryLocation,
        notes: inventoryNotes
      });

      toast.success(response.data.message || 'Purchase order approved and added to inventory successfully');
      setShowInventoryModal(false);
      fetchOrderDetails(); // Refresh data
      
      // Navigate to inventory tracking page
      setTimeout(() => {
        navigate(`/inventory/from-po/${id}`);
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add items to inventory');
    }
  };

  const handleCreateMaterialRequest = async () => {
    try {
      if (!materialRequestData.required_date) {
        toast.error('Please select a required date');
        return;
      }

      if (materialRequestData.selected_materials.length === 0) {
        toast.error('Please select at least one material');
        return;
      }

      const response = await api.post(`/project-material-requests/from-po/${id}`, {
        priority: materialRequestData.priority,
        required_date: materialRequestData.required_date,
        procurement_notes: materialRequestData.procurement_notes,
        materials_requested: materialRequestData.selected_materials.map(index => ({
          product_id: order.items[index].product_id,
          product_name: order.items[index].product_name || order.items[index].item_name || order.items[index].fabric_name,
          quantity: order.items[index].quantity,
          unit: order.items[index].unit || order.items[index].uom
        }))
      });

      toast.success('Material request sent to Manufacturing successfully!');
      setShowMaterialRequestModal(false);
      
      // Reset form
      setMaterialRequestData({
        priority: 'medium',
        required_date: '',
        procurement_notes: '',
        selected_materials: []
      });

      // Navigate to material requests page
      setTimeout(() => {
        navigate('/procurement/material-requests');
      }, 1500);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create material request');
    }
  };

  const toggleMaterialSelection = (index) => {
    setMaterialRequestData(prev => {
      const selected = [...prev.selected_materials];
      const idx = selected.indexOf(index);
      if (idx > -1) {
        selected.splice(idx, 1);
      } else {
        selected.push(index);
      }
      return { ...prev, selected_materials: selected };
    });
  };

  const handleCreateProductionRequest = async () => {
    try {
      if (!productionRequestData.product_name) {
        toast.error('Please enter product name');
        return;
      }

      if (!productionRequestData.quantity || productionRequestData.quantity <= 0) {
        toast.error('Please enter valid quantity');
        return;
      }

      if (!productionRequestData.unit) {
        toast.error('Please enter unit');
        return;
      }

      if (!productionRequestData.required_date) {
        toast.error('Please select a required date');
        return;
      }

      const response = await api.post(`/production-requests/from-po/${id}`, productionRequestData);

      toast.success('Production request sent to Manufacturing successfully!');
      setShowProductionRequestModal(false);
      
      // Reset form
      setProductionRequestData({
        product_name: '',
        product_description: '',
        product_specifications: {},
        quantity: '',
        unit: '',
        priority: 'medium',
        required_date: '',
        procurement_notes: ''
      });

      // Navigate to production requests page
      setTimeout(() => {
        navigate('/procurement/production-requests');
      }, 1500);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create production request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      pending_approval: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      sent: 'bg-indigo-100 text-indigo-700',
      acknowledged: 'bg-purple-100 text-purple-700',
      partial_received: 'bg-teal-100 text-teal-700',
      received: 'bg-green-100 text-green-700',
      completed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <FaClock />,
      pending_approval: <FaClock />,
      approved: <FaCheckCircle />,
      sent: <FaPaperPlane />,
      acknowledged: <FaBox />,
      received: <FaTruck />,
      completed: <FaCheckCircle />,
      cancelled: <FaExclamationTriangle />
    };
    return icons[status] || <FaClock />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading purchase order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Purchase order not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/procurement/purchase-orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft /> Back to Purchase Orders
          </button>
          <div>
            <h1 className="text-2xl font-bold">Purchase Order {order.po_number}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)} {order.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(order.priority)}`}>
                Priority: <span className="capitalize">{order.priority}</span>
              </span>
              {order.salesOrder && (
                <span className="text-sm text-blue-600">
                  🔗 Linked to SO: {order.salesOrder.order_number}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate(`/procurement/purchase-orders/edit/${id}`)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            <FaEdit /> Edit
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <FaPrint /> Print
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <FaDownload /> Export
          </button>
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            <FaQrcode /> QR Code
          </button>
        </div>
      </div>

      {/* Action Buttons Based on Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {order.status === 'draft' && (
            <>
              <button
                onClick={() => handleStatusUpdate('send_for_approval')}
                className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
              >
                <FaPaperPlane /> Send for Approval
              </button>
              <button
                onClick={() => handleStatusUpdate('send_to_vendor')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                <FaPaperPlane /> Send to Vendor
              </button>
            </>
          )}
          {order.status === 'pending_approval' && (
            <button
              onClick={() => handleStatusUpdate('approve')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              <FaCheckCircle /> Approve PO
            </button>
          )}
          {order.status === 'approved' && (
            <button
              onClick={() => handleStatusUpdate('send_to_vendor')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              <FaPaperPlane /> Send to Vendor
            </button>
          )}
          {order.status === 'sent' && (
            <button
              onClick={() => handleStatusUpdate('mark_as_ordered')}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
            >
              <FaBox /> Mark as Ordered
            </button>
          )}
          {/* NEW GRN WORKFLOW: Create GRN for approved POs */}
          {['approved', 'sent', 'acknowledged'].includes(order.status) && (
            <button
              onClick={() => navigate(`/inventory/grn/create?po_id=${id}`)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm shadow-lg"
            >
              <FaBoxOpen /> ✨ Create GRN (3-Way Matching)
            </button>
          )}
          
          {/* Material Request Button - Only show for project-linked POs */}
          {order.project_name && ['approved', 'sent', 'acknowledged', 'received'].includes(order.status) && (
            <button
              onClick={() => setShowMaterialRequestModal(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm shadow-lg"
            >
              <FaBoxOpen /> Send Material Request to Manufacturing
            </button>
          )}

          {/* Production Request Button - Only show for project-linked POs */}
          {order.project_name && ['approved', 'sent', 'acknowledged', 'received'].includes(order.status) && (
            <button
              onClick={() => setShowProductionRequestModal(true)}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm shadow-lg"
            >
              <FaIndustry /> Send Production Request
            </button>
          )}
          
          {/* Mark as received button for acknowledged/partial status */}
          {(order.status === 'acknowledged' || order.status === 'partial_received') && (
            <button
              onClick={() => handleStatusUpdate('mark_as_received')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              <FaTruck /> Mark as Received
            </button>
          )}
          
          {/* Complete order button for received status */}
          {order.status === 'received' && (
            <button
              onClick={() => handleStatusUpdate('complete')}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm"
            >
              <FaCheckCircle /> Complete Order
            </button>
          )}
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FaQrcode /> Purchase Order QR Code
          </h2>
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <FaDownload /> Download QR
          </button>
        </div>
        <div className="mt-4 flex justify-center">
          <QRCodeDisplay
            data={JSON.stringify({
              po_number: order.po_number,
              vendor: order.vendor?.name,
              status: order.status,
              amount: order.final_amount,
              expected_delivery: order.expected_delivery_date
            })}
            size={200}
          />
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Scan to view live purchase order status and details
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded shadow mb-6">
        <div className="border-b">
          <nav className="flex">
            {['details', 'items', 'financial', 'timeline', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">PO Number:</span>
                    <span className="font-medium">{order.po_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PO Date:</span>
                    <span>{new Date(order.po_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Delivery:</span>
                    <span>{new Date(order.expected_delivery_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project Name:</span>
                    <span>{order.project_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg">₹{order.final_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span>{order.payment_terms || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created By:</span>
                    <span>{order.creator?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Vendor Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor:</span>
                    <span className="font-medium">{order.vendor?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor Code:</span>
                    <span>{order.vendor?.vendor_code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <span>{order.vendor?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <span>{order.vendor?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaMapMarker className="text-gray-400 mt-1" />
                    <span className="text-sm">{order.vendor?.address || 'N/A'}</span>
                  </div>
                </div>

                {order.customer && (
                  <>
                    <h3 className="text-lg font-semibold mb-4 mt-6">Customer Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium">{order.customer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer Code:</span>
                        <span>{order.customer.customer_code}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Color</th>
                      <th className="p-3 text-left">GSM</th>
                      <th className="p-3 text-left">Quantity</th>
                      <th className="p-3 text-left">UOM</th>
                      <th className="p-3 text-left">Rate</th>
                      <th className="p-3 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 capitalize">{item.type}</td>
                        <td className="p-3">{item.fabric_name || item.item_name || item.description}</td>
                        <td className="p-3">{item.color || '—'}</td>
                        <td className="p-3">{item.gsm || '—'}</td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="p-3">{item.uom}</td>
                        <td className="p-3">₹{item.rate}</td>
                        <td className="p-3">₹{item.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Financial Breakdown</h3>
              <div className="bg-gray-50 p-6 rounded-lg max-w-md">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{(order.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0).toLocaleString()}</span>
                  </div>
                  {order.discount_percentage > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount ({order.discount_percentage}%):</span>
                      <span>-₹{((order.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0) * (order.discount_percentage / 100)).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax ({order.tax_percentage || 0}%):</span>
                    <span>₹{(order.final_amount * (order.tax_percentage || 0) / (100 + (order.tax_percentage || 0))).toLocaleString()}</span>
                  </div>
                  {order.freight > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Freight:</span>
                      <span>₹{order.freight?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-300 pt-3 mt-3 flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span>₹{order.final_amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Delivery Address</h4>
                <p className="text-gray-700 text-sm">{order.delivery_address || 'N/A'}</p>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaFileAlt className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Order Created</div>
                    <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                {order.status !== 'draft' && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Status: {order.status.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-sm text-gray-500">{new Date(order.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{order.special_instructions || 'None'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{order.terms_conditions || 'None'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{order.internal_notes || 'None'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Purchase Order QR Code</h2>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <QRCodeDisplay
                  data={JSON.stringify({
                    po_number: order.po_number,
                    vendor: order.vendor?.name,
                    status: order.status,
                    amount: order.final_amount,
                    track_url: `${window.location.origin}/procurement/purchase-orders/${order.id}`
                  })}
                  size={300}
                />
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><strong>PO Number:</strong> {order.po_number}</div>
                <div><strong>Vendor:</strong> {order.vendor?.name}</div>
                <div><strong>Status:</strong> {order.status.replace('_', ' ').toUpperCase()}</div>
                <div><strong>Amount:</strong> ₹{order.final_amount?.toLocaleString()}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Print QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaWarehouse className="text-indigo-600" />
                Approve & Add to Inventory
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                All PO items will be added to inventory with unique barcodes
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse Location
                </label>
                <select
                  value={inventoryLocation}
                  onChange={(e) => setInventoryLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Secondary Warehouse">Secondary Warehouse</option>
                  <option value="Fabric Store">Fabric Store</option>
                  <option value="Accessories Store">Accessories Store</option>
                  <option value="Raw Materials">Raw Materials</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={inventoryNotes}
                  onChange={(e) => setInventoryNotes(e.target.value)}
                  placeholder="Add any notes about this inventory receipt..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <FaBoxOpen /> What will happen:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ All {order.items?.length || 0} PO items will be added to inventory</li>
                  <li>✓ Each item will receive a unique barcode</li>
                  <li>✓ QR codes will be generated for tracking</li>
                  <li>✓ PO status will be updated to "Received"</li>
                  <li>✓ You can track usage and remaining stock</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowInventoryModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveAndAddToInventory}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FaCheckCircle /> Approve & Add to Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Material Request Modal */}
      {showMaterialRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create Material Request</h3>
              <button
                onClick={() => setShowMaterialRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Priority *</label>
                <select
                  value={materialRequestData.priority}
                  onChange={(e) => setMaterialRequestData({...materialRequestData, priority: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Required Date */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Required Date *</label>
                <input
                  type="date"
                  value={materialRequestData.required_date}
                  onChange={(e) => setMaterialRequestData({...materialRequestData, required_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Procurement Notes</label>
                <textarea
                  value={materialRequestData.procurement_notes}
                  onChange={(e) => setMaterialRequestData({...materialRequestData, procurement_notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add any special instructions or notes for Manufacturing..."
                />
              </div>

              {/* Materials Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Select Materials * ({materialRequestData.selected_materials.length} selected)
                </label>
                <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={materialRequestData.selected_materials.includes(index)}
                          onChange={() => toggleMaterialSelection(index)}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.product_name || item.item_name || item.fabric_name || 'Unknown Material'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} {item.unit || item.uom || 'units'}
                            {item.color && ` • Color: ${item.color}`}
                            {item.gsm && ` • GSM: ${item.gsm}`}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-gray-500 text-center">No materials available</p>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <FaBoxOpen /> What will happen:
                </h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✓ Material request will be sent to Manufacturing department</li>
                  <li>✓ Manufacturing will review and forward to Inventory</li>
                  <li>✓ Inventory will check stock availability</li>
                  <li>✓ You'll receive notifications at each step</li>
                  <li>✓ Materials will be reserved for project: <strong>{order.project_name}</strong></li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowMaterialRequestModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMaterialRequest}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FaPaperPlane /> Send to Manufacturing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production Request Modal */}
      {showProductionRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaIndustry className="text-3xl" />
                  <div>
                    <h2 className="text-2xl font-bold">Send Production Request</h2>
                    <p className="text-orange-100 text-sm mt-1">
                      Request Manufacturing to produce items for project: <strong>{order.project_name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProductionRequestModal(false)}
                  className="text-white hover:bg-orange-800 rounded-lg p-2 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* PO Information */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">Purchase Order Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">PO Number:</span>
                    <span className="ml-2 font-medium text-gray-900">{order.po_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Project:</span>
                    <span className="ml-2 font-medium text-gray-900">{order.project_name}</span>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productionRequestData.product_name}
                  onChange={(e) => setProductionRequestData({...productionRequestData, product_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter the product name to be manufactured"
                  required
                />
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Product Description
                </label>
                <textarea
                  value={productionRequestData.product_description}
                  onChange={(e) => setProductionRequestData({...productionRequestData, product_description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="3"
                  placeholder="Describe the product details, features, or specifications..."
                />
              </div>

              {/* Product Specifications */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Product Specifications
                </label>
                <textarea
                  value={productionRequestData.product_specifications}
                  onChange={(e) => setProductionRequestData({...productionRequestData, product_specifications: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="4"
                  placeholder="Enter technical specifications (e.g., dimensions, materials, colors, quality standards)..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter specifications in any format. You can use bullet points or key-value pairs.
                </p>
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Quantity *</label>
                  <input
                    type="number"
                    value={productionRequestData.quantity}
                    onChange={(e) => setProductionRequestData({...productionRequestData, quantity: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Unit *</label>
                  <input
                    type="text"
                    value={productionRequestData.unit}
                    onChange={(e) => setProductionRequestData({...productionRequestData, unit: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., pcs, kg, meters"
                    required
                  />
                </div>
              </div>

              {/* Priority and Required Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Priority *</label>
                  <select
                    value={productionRequestData.priority}
                    onChange={(e) => setProductionRequestData({...productionRequestData, priority: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Required Date *</label>
                  <input
                    type="date"
                    value={productionRequestData.required_date}
                    onChange={(e) => setProductionRequestData({...productionRequestData, required_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Procurement Notes */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Procurement Notes</label>
                <textarea
                  value={productionRequestData.procurement_notes}
                  onChange={(e) => setProductionRequestData({...productionRequestData, procurement_notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add any special instructions, quality requirements, or notes for Manufacturing..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                  <FaIndustry /> What will happen:
                </h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>✓ Production request will be sent to Manufacturing department</li>
                  <li>✓ Manufacturing will review product specifications</li>
                  <li>✓ They will check material requirements and availability</li>
                  <li>✓ Production planning will be initiated</li>
                  <li>✓ You'll receive notifications at each production stage</li>
                  <li>✓ Request linked to project: <strong>{order.project_name}</strong></li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowProductionRequestModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProductionRequest}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FaPaperPlane /> Send to Manufacturing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderDetailsPage;