import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaEdit, FaTrash, FaEye, FaPlus, FaPlay, FaPause, FaExclamationCircle, FaCheckCircle, FaEllipsisV, FaColumns } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import PermissionGate from '../../components/auth/PermissionGate';
import { useColumnVisibility } from '../../hooks/useColumnVisibility';
import { useSmartDropdown } from '../../hooks/useSmartDropdown';

// Define all available columns with their properties
const AVAILABLE_COLUMNS = [
  { id: 'order_number', label: 'Order Number', defaultVisible: true, alwaysVisible: true },
  { id: 'product', label: 'Product', defaultVisible: true },
  { id: 'quantity', label: 'Quantity', defaultVisible: true },
  { id: 'progress', label: 'Progress', defaultVisible: true },
  { id: 'start_date', label: 'Start Date', defaultVisible: true },
  { id: 'end_date', label: 'End Date', defaultVisible: true },
  { id: 'priority', label: 'Priority', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'actions', label: 'Actions', defaultVisible: true, alwaysVisible: true }
];

// Action Dropdown Component
function ActionDropdown({ order, onView, onEdit, onStart, onStop, onDelete, permissionKeys, hasPermission }) {
  const { dropdownRef, isOpen, toggleDropdown } = useSmartDropdown();

  return (
    <div className="action-menu-container relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="inline-flex items-center justify-center rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        aria-label="Actions"
      >
        <FaEllipsisV className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button
              type="button"
              onClick={() => { onView(order); toggleDropdown(); }}
              className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FaEye className="h-4 w-4 text-blue-500" />
              View Details
            </button>
            
            {hasPermission(...permissionKeys.updateOrder) && (
              <button
                type="button"
                onClick={() => { onEdit(order); toggleDropdown(); }}
                className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaEdit className="h-4 w-4 text-amber-500" />
                Edit Order
              </button>
            )}

            {hasPermission(...permissionKeys.updateOrder) && (
              <>
                {order.status === 'in_progress' ? (
                  <button
                    type="button"
                    onClick={() => { onStop(order); toggleDropdown(); }}
                    className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaPause className="h-4 w-4 text-amber-500" />
                    Stop Production
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { onStart(order); toggleDropdown(); }}
                    className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaPlay className="h-4 w-4 text-green-500" />
                    Start Production
                  </button>
                )}
              </>
            )}

            {hasPermission(...permissionKeys.deleteOrder) && (
              <>
                <div className="border-t border-gray-100" />
                <button
                  type="button"
                  onClick={() => { onDelete(order); toggleDropdown(); }}
                  className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <FaTrash className="h-4 w-4" />
                  Delete Order
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const ProductionOrdersPage = () => {
  const navigate = useNavigate();
  const permissionKeys = {
    createOrder: ['manufacturing', 'create', 'production_order'],
    updateOrder: ['manufacturing', 'update', 'production_order'],
    deleteOrder: ['manufacturing', 'delete', 'production_order'],
  };
  const [orders, setOrders] = useState([]);
  const [approvedProductions, setApprovedProductions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [approvalsLoading, setApprovalsLoading] = useState(true);
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

  // Column visibility hooks
  const { visibleColumns, isColumnVisible, toggleColumn, showAllColumns, resetColumns } = useColumnVisibility('productionOrdersVisibleColumns', AVAILABLE_COLUMNS);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef(null);

  // Click outside handler for column menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnMenu && columnMenuRef.current && !columnMenuRef.current.contains(event.target)) {
        setShowColumnMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnMenu]);

  useEffect(() => {
    fetchOrders();
    fetchApprovedProductions();
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

  const fetchApprovedProductions = async () => {
    try {
      setApprovalsLoading(true);
      const response = await api.get('/production-approval/list/approved');
      setApprovedProductions(response.data.approvals || []);
      setApprovalsLoading(false);
    } catch (error) {
      console.error('Error fetching approved productions:', error);
      setApprovalsLoading(false);
    }
  };

  const handleStartProduction = (approvalId) => {
    navigate(`/manufacturing/wizard?approvalId=${approvalId}`);
  };

  const handleViewApprovalDetails = (approvalId) => {
    navigate(`/manufacturing/approval/${approvalId}`);
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
    // Redirect to Production Wizard page for creating new production orders
    navigate('/manufacturing/wizard');
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
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Production Orders</h1>
          <p className="text-sm text-gray-600 mt-1">Manage approved materials and production orders</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Column Manager */}
          <div className="column-menu-container relative" ref={columnMenuRef}>
            <button
              type="button"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <FaColumns className="h-4 w-4" />
              Columns
            </button>

            {showColumnMenu && (
              <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-3">
                  <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="text-sm font-semibold text-gray-700">Show/Hide Columns</span>
                  </div>
                  <div className="max-h-96 space-y-2 overflow-y-auto">
                    {AVAILABLE_COLUMNS.map((column) => (
                      <label
                        key={column.id}
                        className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm transition ${
                          column.alwaysVisible
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isColumnVisible(column.id)}
                          onChange={() => toggleColumn(column.id)}
                          disabled={column.alwaysVisible}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="text-gray-700">{column.label}</span>
                        {column.alwaysVisible && (
                          <span className="ml-auto text-xs text-gray-400">(Required)</span>
                        )}
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-gray-200 pt-3">
                    <button
                      type="button"
                      onClick={showAllColumns}
                      className="flex-1 rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Show All
                    </button>
                    <button
                      type="button"
                      onClick={resetColumns}
                      className="flex-1 rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 shadow hover:bg-primary-dark"
            onClick={handleCreate}
          >
            <FaPlus />
            Create Order
          </button>
        </div>
      </div>

      {/* Approved Productions Section */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                Approved Productions Ready to Start
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Materials verified and approved - ready to create production orders
              </p>
            </div>
            {approvedProductions.length > 0 && (
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {approvedProductions.length} Ready
              </span>
            )}
          </div>

          {approvalsLoading ? (
            <div className="text-center py-8">
              <span className="text-gray-600">Loading approved productions...</span>
            </div>
          ) : approvedProductions.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <FaCheckCircle className="mx-auto text-5xl text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No Approved Productions</p>
              <p className="text-sm text-gray-500 mt-1">
                Approved materials will appear here, ready to start production
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Approval #</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Project Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">MRN Request</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Materials</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Approved By</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Approved At</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {approvedProductions.map((approval) => {
                      const materials = approval.verification?.receipt?.received_materials || [];
                      const displayMaterials = materials.slice(0, 2);
                      const remainingCount = materials.length - 2;

                      return (
                        <tr key={approval.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {approval.approval_number}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                                <FaCheckCircle className="text-xs" />
                                Approved
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">{approval.project_name || 'N/A'}</span>
                            {approval.mrnRequest?.salesOrder && (
                              <div className="text-xs text-gray-500 mt-1">
                                SO: {approval.mrnRequest.salesOrder.order_number}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm text-gray-700">
                              {approval.mrnRequest?.request_number || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {displayMaterials.map((mat, idx) => (
                                <div key={idx} className="text-xs text-gray-600">
                                  • {mat.material_name} ({mat.quantity_received} {mat.unit})
                                </div>
                              ))}
                              {remainingCount > 0 && (
                                <div className="text-xs text-primary font-medium">
                                  +{remainingCount} more
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-700">
                              {approval.approver?.name || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-700">
                              {new Date(approval.approved_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(approval.approved_at).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartProduction(approval.id)}
                                className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                              >
                                <FaPlay className="text-xs" />
                                
                              </button>
                              <button
                                onClick={() => handleViewApprovalDetails(approval.id)}
                                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                              >
                                <FaEye className="text-xs" />
                                
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing Production Orders Section */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Existing Production Orders</h2>
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
              {isColumnVisible('order_number') && <th className="px-4 py-2 text-left">Order Number</th>}
              {isColumnVisible('product') && <th className="px-4 py-2 text-left">Product</th>}
              {isColumnVisible('quantity') && <th className="px-4 py-2 text-left">Quantity</th>}
              {isColumnVisible('progress') && <th className="px-4 py-2 text-left">Progress</th>}
              {isColumnVisible('start_date') && <th className="px-4 py-2 text-left">Start Date</th>}
              {isColumnVisible('end_date') && <th className="px-4 py-2 text-left">End Date</th>}
              {isColumnVisible('priority') && <th className="px-4 py-2 text-left">Priority</th>}
              {isColumnVisible('status') && <th className="px-4 py-2 text-left">Status</th>}
              {isColumnVisible('actions') && <th className="px-4 py-2 text-left sticky right-0 bg-gray-100 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                {isColumnVisible('order_number') && <td className="px-4 py-2">{order.orderNumber}</td>}
                {isColumnVisible('product') && <td className="px-4 py-2">{order.productName}</td>}
                {isColumnVisible('quantity') && <td className="px-4 py-2">{order.quantity}</td>}
                {isColumnVisible('progress') && (
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
                )}
                {isColumnVisible('start_date') && <td className="px-4 py-2">{order.startDate}</td>}
                {isColumnVisible('end_date') && <td className="px-4 py-2">{order.endDate}</td>}
                {isColumnVisible('priority') && (
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs border border-${getPriorityColor(order.priority)}-500 text-${getPriorityColor(order.priority)}-500`}>{order.priority}</span>
                  </td>
                )}
                {isColumnVisible('status') && (
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs border border-${getStatusColor(order.status)}-500 text-${getStatusColor(order.status)}-500`}>{order.status.replace('_', ' ')}</span>
                  </td>
                )}
                {isColumnVisible('actions') && (
                  <td className="px-4 py-2 sticky right-0 bg-white group-hover:bg-gray-50">
                    <ActionDropdown 
                      order={order} 
                      onView={handleView}
                      onEdit={handleEdit}
                      onStart={handleStart}
                      onStop={handleStop}
                      onDelete={handleDelete}
                      permissionKeys={permissionKeys}
                      hasPermission={hasPermission}
                    />
                  </td>
                )}
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