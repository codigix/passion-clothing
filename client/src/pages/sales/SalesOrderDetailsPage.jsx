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
  FaFileAlt
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

  useEffect(() => {
    fetchOrderDetails();
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

  const handleStatusUpdate = async (newStatus) => {
    try {
      if (newStatus === 'confirmed') {
        await api.put(`/sales/orders/${id}/confirm`);
      }
      // Refresh order data
      fetchOrderDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleProceedToProcurement = async () => {
    try {
      // First, generate BOM for this sales order
      await api.post(`/bom/generate/${id}`);
      // Then navigate to BOM page
      navigate('/procurement/bom');
    } catch (error) {
      console.error('Failed to generate BOM:', error);
      alert(error.response?.data?.message || 'Failed to generate BOM');
    }
  };

  const handleViewProduction = () => {
    navigate('/manufacturing/orders');
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      confirmed: 'bg-blue-100 text-blue-700',
      in_production: 'bg-orange-100 text-orange-700',
      materials_received: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      shipped: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <FaClock />,
      confirmed: <FaCheckCircle />,
      in_production: <FaCog />,
      materials_received: <FaTruck />,
      completed: <FaCheckCircle />,
      shipped: <FaTruck />,
      cancelled: <FaExclamationTriangle />
    };
    return icons[status] || <FaClock />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading order details...</div>
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
          Order not found
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
            onClick={() => navigate('/sales/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft /> Back to Orders
          </button>
          <div>
            <h1 className="text-2xl font-bold">Sales Order {order.order_number}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)} {order.status.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-500">
                Priority: <span className="capitalize">{order.priority}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <FaPrint /> Print
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FaQrcode /> Order QR Code
          </h2>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <FaDownload /> Download QR
          </button>
        </div>
        <div className="mt-4 flex justify-center">
          <QRCodeDisplay
            data={order.qr_code || JSON.stringify({
              order_number: order.order_number,
              customer: order.customer?.name,
              quantity: order.total_quantity,
              amount: order.final_amount,
              delivery_date: order.delivery_date,
              status: order.status
            })}
            size={200}
          />
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Scan to view live order status and details
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded shadow mb-6">
        <div className="border-b">
          <nav className="flex">
            {['details', 'items', 'specifications', 'timeline', 'actions'].map((tab) => (
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
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span>{new Date(order.order_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Date:</span>
                    <span>{new Date(order.delivery_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Quantity:</span>
                    <span>{order.total_quantity} pcs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold">₹{order.final_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span>{order.payment_terms || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{order.customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Code:</span>
                    <span>{order.customer?.customer_code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <span>{order.customer?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <span>{order.customer?.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaMapMarker className="text-gray-400 mt-1" />
                    <span className="text-sm">{order.customer?.address}</span>
                  </div>
                </div>
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
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Fabric Type</th>
                      <th className="p-3 text-left">Color</th>
                      <th className="p-3 text-left">Quantity</th>
                      <th className="p-3 text-left">Rate</th>
                      <th className="p-3 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{item.product_id}</td>
                        <td className="p-3">{item.description}</td>
                        <td className="p-3">{item.fabric_type || 'N/A'}</td>
                        <td className="p-3">
                          <span className={item.color ? 'inline-flex items-center gap-2' : ''}>
                            {item.color && <span className="w-4 h-4 rounded-full border border-gray-300" style={{backgroundColor: item.color.toLowerCase()}}></span>}
                            {item.color || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">{item.quantity} {item.unit_of_measure}</td>
                        <td className="p-3">₹{item.rate}</td>
                        <td className="p-3">₹{item.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Garment Specifications</h3>
              {order.garment_specifications ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fabric Type</label>
                      <p className="mt-1 text-sm text-gray-900">{order.garment_specifications.fabric_type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GSM</label>
                      <p className="mt-1 text-sm text-gray-900">{order.garment_specifications.gsm || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Color</label>
                      <p className="mt-1 text-sm text-gray-900">{order.garment_specifications.color || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quality Specifications</label>
                      <p className="mt-1 text-sm text-gray-900">{order.garment_specifications.quality_specs || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Printing Required</label>
                      <p className="mt-1 text-sm text-gray-900">{order.garment_specifications.printing ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Embroidery Required</label>
                      <p className="mt-1 text-sm text-gray-900">{order.garment_specifications.embroidery ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thread Colors</label>
                      <p className="mt-1 text-sm text-gray-900">{order.garment_specifications.thread_colors || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Button/Hooks Count</label>
                      <p className="mt-1 text-sm text-gray-900">{order.garment_specifications.button_count || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Packing Instructions</label>
                    <p className="mt-1 text-sm text-gray-900">{order.garment_specifications.packing_instructions || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No garment specifications provided</p>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">by {order.creator?.name}</p>
                  </div>
                </div>
                {order.approved_at && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-gray-500">{new Date(order.approved_at).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">by {order.approver?.name}</p>
                    </div>
                  </div>
                )}
                {order.productionOrders?.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Production Started</p>
                      <p className="text-sm text-gray-500">Production orders created</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Actions</h3>
              <div className="space-y-3">
                {order.status === 'draft' && (
                  <button
                    onClick={() => handleStatusUpdate('confirmed')}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle /> Confirm Order
                  </button>
                )}

                {order.status === 'confirmed' && (
                  <button
                    onClick={handleProceedToProcurement}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <FaFileAlt /> Generate BOM & Proceed to Procurement
                  </button>
                )}

                {order.status === 'in_production' && (
                  <button
                    onClick={handleViewProduction}
                    className="w-full bg-orange-600 text-white px-4 py-3 rounded hover:bg-orange-700 flex items-center justify-center gap-2"
                  >
                    <FaCog /> View Production Progress
                  </button>
                )}

                {order.status === 'completed' && (
                  <button
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <FaTruck /> Proceed to Shipping
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetailsPage;