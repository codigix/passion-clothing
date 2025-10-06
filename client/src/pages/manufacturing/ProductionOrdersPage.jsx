import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaEye, FaPlus, FaPlay, FaPause, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import PermissionGate from '../../components/auth/PermissionGate';

const ProductionOrdersPage = () => {
  const permissionKeys = {
    createOrder: ['manufacturing', 'create', 'production_order'],
    updateOrder: ['manufacturing', 'update', 'production_order'],
    deleteOrder: ['manufacturing', 'delete', 'production_order'],
  };
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { hasPermission } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({
    orderNumber: '',
    productId: '',
    quantity: '',
    startDate: '',
    endDate: '',
    priority: 'medium'
  });
  const [alert, setAlert] = useState({ open: false, severity: 'success', message: '' });

  const { data: products = [], isLoading: productsLoading } = useProducts({ status: 'active', limit: 200 });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/manufacturing/orders');
      // Map backend response to frontend expected format
      const mappedOrders = response.data.productionOrders.map(order => ({
        id: order.id,
        orderNumber: order.production_number,
        productName: order.product ? order.product.name : 'Unknown Product',
        quantity: order.quantity,
        produced: order.produced_quantity,
        startDate: order.planned_start_date,
        endDate: order.planned_end_date,
        status: order.status,
        priority: order.priority,
        productId: order.product ? order.product.id : ''
      }));
      setOrders(mappedOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
      // Fallback to mock data if API fails
      setOrders([
        {
          id: 1,
          orderNumber: 'PO-2024-001',
          productName: 'Cotton T-Shirt - Blue',
          quantity: 500,
          produced: 350,
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          status: 'in_progress',
          priority: 'high'
        },
        {
          id: 2,
          orderNumber: 'PO-2024-002',
          productName: 'Denim Jeans - Black',
          quantity: 300,
          produced: 0,
          startDate: '2024-01-20',
          endDate: '2024-02-20',
          status: 'pending',
          priority: 'medium'
        }
      ]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'on_hold': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getProgress = (produced, quantity) => {
    return (produced / quantity) * 100;
  };

  const handleCreate = () => {
    if (!hasPermission(...permissionKeys.createOrder)) {
      toast.error('You do not have permission to create production orders.');
      return;
    }
    setOrderForm({
      orderNumber: '',
      productId: '',
      quantity: '',
      startDate: '',
      endDate: '',
      priority: 'medium'
    });
    setCreateDialogOpen(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setOrderForm({
      orderNumber: order.orderNumber,
      productId: order.productId || '',
      quantity: order.quantity,
      startDate: order.startDate?.slice(0, 10) || '',
      endDate: order.endDate?.slice(0, 10) || '',
      priority: order.priority,
      specialInstructions: order.special_instructions || '',
      salesOrderId: order.sales_order_id || ''
    });
    setEditDialogOpen(true);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleDelete = async (order) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/manufacturing/orders/${order.id}`);
        fetchOrders();
        setAlert({ open: true, severity: 'success', message: 'Order deleted successfully' });
      } catch (error) {
        console.error('Error deleting order:', error);
        setAlert({ open: true, severity: 'error', message: 'Failed to delete order' });
      }
    }
  };

  const handleStart = async (order) => {
    try {
      await api.post(`/manufacturing/orders/${order.id}/start`);
      fetchOrders();
      setAlert({ open: true, severity: 'success', message: 'Production started successfully' });
    } catch (error) {
      console.error('Error starting production:', error);
      setAlert({ open: true, severity: 'error', message: error.response?.data?.message || 'Failed to start production' });
    }
  };

  const handleStop = async (order) => {
    try {
      await api.post(`/manufacturing/orders/${order.id}/stop`);
      fetchOrders();
      setAlert({ open: true, severity: 'success', message: 'Production stopped successfully' });
    } catch (error) {
      console.error('Error stopping production:', error);
      setAlert({ open: true, severity: 'error', message: error.response?.data?.message || 'Failed to stop production' });
    }
  };

  const handleSaveOrder = async () => {
    const { productId, quantity, startDate, endDate } = orderForm;
    if (!productId || !quantity || !startDate || !endDate) {
      setAlert({ open: true, severity: 'error', message: 'Product, quantity, start date, and end date are required' });
      return;
    }

    const payload = {
      product_id: Number(productId),
      quantity: Number(quantity),
      planned_start_date: startDate,
      planned_end_date: endDate,
      priority: orderForm.priority,
      special_instructions: orderForm.specialInstructions || '',
      sales_order_id: orderForm.salesOrderId ? Number(orderForm.salesOrderId) : undefined,
    };

    try {
      if (editDialogOpen) {
        await api.put(`/manufacturing/orders/${selectedOrder.id}`, payload);
        setAlert({ open: true, severity: 'success', message: 'Order updated successfully' });
      } else {
        await api.post('/manufacturing/orders', payload);
        setAlert({ open: true, severity: 'success', message: 'Order created successfully' });
      }
      setCreateDialogOpen(false);
      setEditDialogOpen(false);
      setOrderForm({
        orderNumber: '',
        productId: '',
        quantity: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        specialInstructions: '',
        salesOrderId: ''
      });
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      setAlert({ open: true, severity: 'error', message: error.response?.data?.message || 'Failed to save order' });
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Production Orders</h1>
        <PermissionGate
          required={permissionKeys.createOrder}
          fallback={(
            <button
              className="bg-gray-300 text-gray-600 px-4 py-2 rounded flex items-center gap-2 cursor-not-allowed"
              type="button"
              onClick={() => toast.error('You do not have permission to create production orders.')}
            >
              <FaPlus />
              Create Order
            </button>
          )}
        >
          <button
            className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 shadow hover:bg-primary-dark"
            onClick={handleCreate}
          >
            <FaPlus />
            Create Order
          </button>
        </PermissionGate>
      </div>

      {/* Search */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search production orders..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Order Number</th>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Quantity</th>
              <th className="px-4 py-2 text-left">Progress</th>
              <th className="px-4 py-2 text-left">Start Date</th>
              <th className="px-4 py-2 text-left">End Date</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-2">{order.orderNumber}</td>
                <td className="px-4 py-2">{order.productName}</td>
                <td className="px-4 py-2">{order.quantity}</td>
                <td className="px-4 py-2">
                  <div className="w-full mb-1">
                    <div className="h-2 rounded bg-gray-200">
                      <div
                        className={`h-2 rounded ${getProgress(order.produced, order.quantity) > 80 ? 'bg-green-500' : getProgress(order.produced, order.quantity) > 50 ? 'bg-yellow-400' : 'bg-primary'}`}
                        style={{ width: `${getProgress(order.produced, order.quantity)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {order.produced}/{order.quantity} ({Math.round(getProgress(order.produced, order.quantity))}%)
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2">{order.startDate}</td>
                <td className="px-4 py-2">{order.endDate}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs border border-${getPriorityColor(order.priority)}-500 text-${getPriorityColor(order.priority)}-500`}>{order.priority}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs border border-${getStatusColor(order.status)}-500 text-${getStatusColor(order.status)}-500`}>{order.status.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700" onClick={() => handleView(order)} title="View">
                      <FaEye />
                    </button>
                    <PermissionGate
                      required={permissionKeys.updateOrder}
                      fallback={(
                        <button
                          className="text-yellow-300 cursor-not-allowed"
                          type="button"
                          title="Insufficient permission"
                          onClick={() => toast.error('You do not have permission to edit orders.')}
                        >
                          <FaEdit />
                        </button>
                      )}
                    >
                      <button className="text-yellow-500 hover:text-yellow-700" onClick={() => handleEdit(order)} title="Edit">
                        <FaEdit />
                      </button>
                    </PermissionGate>
                    {order.status === 'in_progress' ? (
                      <PermissionGate
                        required={permissionKeys.updateOrder}
                        fallback={(
                          <button
                            className="text-yellow-300 cursor-not-allowed"
                            type="button"
                            title="Insufficient permission"
                            onClick={() => toast.error('You do not have permission to stop orders.')}
                          >
                            <FaPause />
                          </button>
                        )}
                      >
                        <button className="text-yellow-500 hover:text-yellow-700" onClick={() => handleStop(order)} title="Stop">
                          <FaPause />
                        </button>
                      </PermissionGate>
                    ) : (
                      <PermissionGate
                        required={permissionKeys.updateOrder}
                        fallback={(
                          <button
                            className="text-green-300 cursor-not-allowed"
                            type="button"
                            title="Insufficient permission"
                            onClick={() => toast.error('You do not have permission to start orders.')}
                          >
                            <FaPlay />
                          </button>
                        )}
                      >
                        <button className="text-green-500 hover:text-green-700" onClick={() => handleStart(order)} title="Start">
                          <FaPlay />
                        </button>
                      </PermissionGate>
                    )}
                    <PermissionGate
                      required={permissionKeys.deleteOrder}
                      fallback={(
                        <button
                          className="text-red-300 cursor-not-allowed"
                          type="button"
                          title="Insufficient permission"
                          onClick={() => toast.error('You do not have permission to delete orders.')}
                        >
                          <FaTrash />
                        </button>
                      )}
                    >
                      <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(order)} title="Delete">
                        <FaTrash />
                      </button>
                    </PermissionGate>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Create Button */}
      <PermissionGate
        required={permissionKeys.createOrder}
        fallback={(
          <button
            className="fixed bottom-6 right-6 bg-gray-300 text-gray-600 rounded-full p-4 shadow-lg flex items-center justify-center cursor-not-allowed"
            type="button"
            title="Insufficient permission"
            onClick={() => toast.error('You do not have permission to create production orders.')}
          >
            <FaPlus />
          </button>
        )}
      >
        <button
          className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg flex items-center justify-center hover:bg-primary-dark"
          onClick={handleCreate}
          title="Create Order"
        >
          <FaPlus />
        </button>
      </PermissionGate>

      {/* Create/Edit Dialog */}
      {(createDialogOpen || editDialogOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">{createDialogOpen ? 'Create Production Order' : 'Edit Production Order'}</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Order Number</label>
                <input
                  type="text"
                  value={orderForm.orderNumber}
                  onChange={e => setOrderForm({ ...orderForm, orderNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product <span className="text-red-500">*</span></label>
                <select
                  value={orderForm.productId}
                  onChange={e => setOrderForm({ ...orderForm, productId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={productsLoading}
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {productsLoading && <p className="text-xs text-gray-500 mt-1">Loading products...</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={orderForm.quantity}
                  onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={orderForm.priority}
                  onChange={e => setOrderForm({ ...orderForm, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={orderForm.startDate}
                  onChange={e => setOrderForm({ ...orderForm, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={orderForm.endDate}
                  onChange={e => setOrderForm({ ...orderForm, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </form>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedOrder(null); setOrderForm({ orderNumber: '', productName: '', quantity: '', startDate: '', endDate: '', priority: 'medium' }); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
                onClick={handleSaveOrder}
              >
                {createDialogOpen ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Dialog */}
      {viewDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Production Order Details</h2>
            {selectedOrder && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-semibold">Order Number:</span> {selectedOrder.orderNumber}</div>
                <div><span className="font-semibold">Product:</span> {selectedOrder.productName}</div>
                <div><span className="font-semibold">Quantity:</span> {selectedOrder.quantity}</div>
                <div><span className="font-semibold">Produced:</span> {selectedOrder.produced}</div>
                <div><span className="font-semibold">Start Date:</span> {selectedOrder.startDate}</div>
                <div><span className="font-semibold">End Date:</span> {selectedOrder.endDate}</div>
                <div><span className="font-semibold">Priority:</span> {selectedOrder.priority}</div>
                <div><span className="font-semibold">Status:</span> {selectedOrder.status}</div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => { setViewDialogOpen(false); setSelectedOrder(null); }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {alert.open && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-4 py-2 rounded shadow text-white ${alert.severity === 'success' ? 'bg-green-500' : alert.severity === 'error' ? 'bg-red-500' : 'bg-primary'}`}>
            {alert.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionOrdersPage;