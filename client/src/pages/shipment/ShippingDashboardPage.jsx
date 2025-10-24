import React, { useState, useEffect } from 'react';
import { FaTruck, FaBox, FaCheckCircle, FaClock, FaMapMarker, FaShippingFast, FaQrcode } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ShippingDashboardPage = () => {
  const [ordersReadyToShip, setOrdersReadyToShip] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateShipment, setShowCreateShipment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [creatingShipment, setCreatingShipment] = useState(false);

  // Form state for creating shipment
  const [shipmentForm, setShipmentForm] = useState({
    courier_company: '',
    tracking_number: '',
    expected_delivery_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch orders ready to ship
      const ordersResponse = await api.get('/sales?page=1&limit=50&status=ready_to_ship,qc_passed');
      setOrdersReadyToShip(ordersResponse.data.salesOrders);

      // Fetch recent shipments
      const shipmentsResponse = await api.get('/shipments?page=1&limit=20');
      setShipments(shipmentsResponse.data.shipments);

    } catch (error) {
      toast.error('Unable to load shipping data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async () => {
    if (!selectedOrder) return;

    setCreatingShipment(true);
    try {
      await api.post(`/shipments/create-from-order/${selectedOrder.id}`, shipmentForm);
      setShowCreateShipment(false);
      setSelectedOrder(null);
      setShipmentForm({ courier_company: '', tracking_number: '', expected_delivery_date: '', notes: '' });
      toast.success('Shipment created successfully');
      fetchData(); // Refresh data
    } catch (error) {
      toast.error('Failed to create shipment');
    } finally {
      setCreatingShipment(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      packed: 'bg-blue-100 text-blue-700',
      shipped: 'bg-green-100 text-green-700',
      in_transit: 'bg-yellow-100 text-yellow-700',
      out_for_delivery: 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
      failed_delivery: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const OrderCard = ({ order }) => (
    <div className="bg-white rounded shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
          <p className="text-sm text-gray-600">Customer: {order.customer?.name}</p>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          Ready to Ship
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Total Quantity</p>
          <p className="font-semibold">{order.total_quantity}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Delivery Date</p>
          <p className="font-semibold">{new Date(order.delivery_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedOrder(order);
            setShowCreateShipment(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <FaTruck /> Create Shipment
        </button>
      </div>
    </div>
  );

  const ShipmentCard = ({ shipment }) => (
    <div className="bg-white rounded shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{shipment.shipment_number}</h3>
          <p className="text-sm text-gray-600">Order: {shipment.salesOrder?.order_number}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}>
          {shipment.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Courier</p>
          <p className="font-semibold">{shipment.courier_company || 'Not assigned'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tracking</p>
          <p className="font-semibold">{shipment.tracking_number || 'Not available'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Shipment Date</p>
          <p className="font-semibold">{new Date(shipment.shipment_date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Expected Delivery</p>
          <p className="font-semibold">{new Date(shipment.expected_delivery_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Quantity: {shipment.total_quantity}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
            Track
          </button>
          <button className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
            Update
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Dashboard</h1>
          <p className="text-gray-600">Manage shipments and dispatch orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Ship</p>
                <p className="text-2xl font-bold text-gray-900">{ordersReadyToShip.length}</p>
              </div>
              <FaBox className="text-green-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {shipments.filter(s => !['delivered', 'failed_delivery'].includes(s.status)).length}
                </p>
              </div>
              <FaTruck className="text-blue-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {shipments.filter(s =>
                    s.status === 'delivered' &&
                    new Date(s.actual_delivery_date).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <FaCheckCircle className="text-purple-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
              </div>
              <FaClock className="text-orange-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Orders Ready to Ship */}
        {ordersReadyToShip.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaBox className="text-green-600" />
              Orders Ready to Ship
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ordersReadyToShip.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Shipments */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaShippingFast className="text-blue-600" />
            Recent Shipments
          </h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : shipments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shipments.slice(0, 9).map(shipment => (
                <ShipmentCard key={shipment.id} shipment={shipment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No shipments yet
            </div>
          )}
        </div>

        {/* Create Shipment Modal */}
        {showCreateShipment && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded w-full max-w-md">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Create Shipment</h2>
                <p className="text-gray-600">Order: {selectedOrder.order_number}</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Courier Company</label>
                    <input
                      type="text"
                      value={shipmentForm.courier_company}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, courier_company: e.target.value }))}
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g., FedEx, UPS, Blue Dart"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Tracking Number</label>
                    <input
                      type="text"
                      value={shipmentForm.tracking_number}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, tracking_number: e.target.value }))}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Enter tracking number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Delivery Date</label>
                    <input
                      type="date"
                      value={shipmentForm.expected_delivery_date}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      value={shipmentForm.notes}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full border rounded px-3 py-2"
                      rows="3"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateShipment(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateShipment}
                  disabled={creatingShipment}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {creatingShipment ? 'Creating...' : 'Create Shipment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingDashboardPage;