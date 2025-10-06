import React, { useState, useEffect } from 'react';
import { FaPlay, FaEye, FaEdit, FaCheck, FaExclamationTriangle, FaClock, FaCheckCircle, FaCog, FaUsers, FaChartLine, FaQrcode } from 'react-icons/fa';
import api from '../../utils/api';

const ProductionDashboardPage = () => {
  const [productionOrders, setProductionOrders] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStartProduction, setShowStartProduction] = useState(false);
  const [startingProduction, setStartingProduction] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch production orders
      const prodResponse = await api.get('/manufacturing/orders?page=1&limit=20');
      setProductionOrders(prodResponse.data.productionOrders);

      // Fetch sales orders ready for production
      const salesResponse = await api.get('/sales?page=1&limit=50&status=materials_received');
      setSalesOrders(salesResponse.data.salesOrders);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProduction = async (salesOrderId) => {
    setStartingProduction(true);
    try {
      await api.post(`/manufacturing/start-production/${salesOrderId}`);
      fetchData(); // Refresh data
      setShowStartProduction(false);
    } catch (error) {
      console.error('Error starting production:', error);
      alert('Failed to start production');
    } finally {
      setStartingProduction(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      material_allocated: 'bg-blue-100 text-blue-700',
      cutting: 'bg-yellow-100 text-yellow-700',
      printing: 'bg-purple-100 text-purple-700',
      stitching: 'bg-indigo-100 text-indigo-700',
      finishing: 'bg-pink-100 text-pink-700',
      quality_check: 'bg-orange-100 text-orange-700',
      completed: 'bg-green-100 text-green-700',
      on_hold: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const ProductionCard = ({ order }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{order.production_number}</h3>
          <p className="text-sm text-gray-600">Sales Order: {order.salesOrder?.order_number}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
            {order.status.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
            {order.priority}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Quantity</p>
          <p className="font-semibold">{order.quantity}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Produced</p>
          <p className="font-semibold text-green-600">{order.produced_quantity}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Approved</p>
          <p className="font-semibold text-blue-600">{order.approved_quantity}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="font-semibold text-red-600">{order.rejected_quantity}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Due: {new Date(order.planned_end_date).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedOrder(order)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            <FaEye className="inline mr-1" /> View
          </button>
          {order.status !== 'completed' && (
            <button
              onClick={() => {/* Navigate to production tracking */}}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              <FaCog className="inline mr-1" /> Update
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const SalesOrderCard = ({ order }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
          <p className="text-sm text-gray-600">Customer: {order.customer?.name}</p>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          Ready for Production
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
          onClick={() => handleStartProduction(order.id)}
          disabled={startingProduction}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
        >
          <FaPlay /> {startingProduction ? 'Starting...' : 'Start Production'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Dashboard</h1>
          <p className="text-gray-600">Manage production orders and start new production runs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Production</p>
                <p className="text-2xl font-bold text-gray-900">
                  {productionOrders.filter(o => o.status !== 'completed').length}
                </p>
              </div>
              <FaCog className="text-blue-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready for Production</p>
                <p className="text-2xl font-bold text-gray-900">{salesOrders.length}</p>
              </div>
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {productionOrders.filter(o => o.status === 'completed' &&
                    new Date(o.actual_end_date).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <FaChartLine className="text-purple-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">92%</p>
              </div>
              <FaUsers className="text-orange-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Ready for Production Section */}
        {salesOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaPlay className="text-green-600" />
              Ready for Production
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salesOrders.map(order => (
                <SalesOrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Active Production Orders */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaCog className="text-blue-600" />
            Active Production Orders
          </h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : productionOrders.filter(o => o.status !== 'completed').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productionOrders.filter(o => o.status !== 'completed').map(order => (
                <ProductionCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No active production orders
            </div>
          )}
        </div>

        {/* Completed Orders */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            Recently Completed
          </h2>
          {productionOrders.filter(o => o.status === 'completed').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productionOrders.filter(o => o.status === 'completed').slice(0, 6).map(order => (
                <ProductionCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No completed orders yet
            </div>
          )}
        </div>

        {/* Production Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Production Order Details</h2>
                <p className="text-gray-600">{selectedOrder.production_number}</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Order Information</h3>
                    <p><strong>Sales Order:</strong> {selectedOrder.salesOrder?.order_number}</p>
                    <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                    <p><strong>Priority:</strong> <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedOrder.priority)}`}>{selectedOrder.priority}</span></p>
                    <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Progress</h3>
                    <p><strong>Produced:</strong> {selectedOrder.produced_quantity}</p>
                    <p><strong>Approved:</strong> {selectedOrder.approved_quantity}</p>
                    <p><strong>Rejected:</strong> {selectedOrder.rejected_quantity}</p>
                    <p><strong>Planned End:</strong> {new Date(selectedOrder.planned_end_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <h3 className="font-semibold mb-4">Production Stages</h3>
                <div className="space-y-4">
                  {selectedOrder.stages?.map((stage, index) => (
                    <div key={stage.id} className="border rounded p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium capitalize">{stage.stage_name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(stage.status)}`}>
                          {stage.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Processed</p>
                          <p className="font-semibold">{stage.quantity_processed || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Approved</p>
                          <p className="font-semibold text-green-600">{stage.quantity_approved || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Rejected</p>
                          <p className="font-semibold text-red-600">{stage.quantity_rejected || 0}</p>
                        </div>
                      </div>
                      {stage.notes && (
                        <p className="text-sm text-gray-600 mt-2"><strong>Notes:</strong> {stage.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionDashboardPage;