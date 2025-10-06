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
  FaBoxOpen
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
    </div>
  );
};

export default PurchaseOrderDetailsPage;