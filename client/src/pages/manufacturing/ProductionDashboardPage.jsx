import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaEye, FaEdit, FaCheck, FaExclamationTriangle, FaClock, FaCheckCircle, FaCog, FaUsers, FaChartLine, FaQrcode, FaSearch, FaFilter, FaTimes, FaBox, FaArrowRight } from 'react-icons/fa';
import api from '../../utils/api';

const ProductionDashboardPage = () => {
  console.log('🟢 ProductionDashboardPage component mounted');
  const navigate = useNavigate();
  const [productionOrders, setProductionOrders] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [materialReceipts, setMaterialReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [pendingDispatches, setPendingDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' or 'table'
  const [dashboardTab, setDashboardTab] = useState('production'); // 'production' or 'material-receipt'
  const [stageActionLoading, setStageActionLoading] = useState({});
  
  // Material Receipt filters
  const [receiptSearchTerm, setReceiptSearchTerm] = useState('');
  const [receiptStatusFilter, setReceiptStatusFilter] = useState('');
  const [receiptDateFrom, setReceiptDateFrom] = useState('');
  const [receiptDateTo, setReceiptDateTo] = useState('');
  const [receiptProjectFilter, setReceiptProjectFilter] = useState('');
  const [receiptMaterialTypeFilter, setReceiptMaterialTypeFilter] = useState('');
  const [showReceiptFilters, setShowReceiptFilters] = useState(false);

  useEffect(() => {
    console.log('🟡 useEffect: Fetching data...');
    fetchData();
  }, []);

  useEffect(() => {
    applyReceiptFilters();
  }, [materialReceipts, receiptSearchTerm, receiptStatusFilter, receiptDateFrom, receiptDateTo, receiptProjectFilter, receiptMaterialTypeFilter]);

  useEffect(() => {
    console.log('🔵 Dashboard Tab Changed:', dashboardTab);
    console.log('🔵 pendingDispatches:', pendingDispatches);
  }, [dashboardTab, pendingDispatches]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch production orders
      const prodResponse = await api.get('/manufacturing/orders?page=1&limit=20');
      setProductionOrders(prodResponse.data.productionOrders);

      // Fetch sales orders ready for production
      const salesResponse = await api.get('/sales?page=1&limit=50&status=materials_received');
      setSalesOrders(salesResponse.data.salesOrders);

      // Fetch pending dispatches awaiting receipt
      try {
        const dispatchesResponse = await api.get('/material-dispatch/pending');
        console.log('📦 Dispatches Response:', dispatchesResponse.data);
        const dispatches = dispatchesResponse.data.dispatches || [];
        console.log('📦 Setting pendingDispatches:', dispatches);
        dispatches.forEach((d, idx) => {
          console.log(`  [${idx}] Full dispatch object:`, d);
          console.log(`  [${idx}] ID field: ${d.id}, dispatch_id: ${d.dispatch_id}, Number: ${d.dispatch_number}, Project: ${d.project_name}`);
        });
        setPendingDispatches(dispatches);
      } catch (err) {
        console.error('Error fetching pending dispatches:', err);
        setPendingDispatches([]);
      }

      // Fetch material receipts
      try {
        const receiptsResponse = await api.get('/material-receipt/list/pending-verification');
        setMaterialReceipts(receiptsResponse.data || []);
      } catch (err) {
        console.error('Error fetching receipts:', err);
        setMaterialReceipts([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      console.log('✅ Data fetching complete. pendingDispatches:', pendingDispatches.length);
    }
  };

  const applyReceiptFilters = () => {
    let filtered = [...materialReceipts];

    // Search filter
    if (receiptSearchTerm) {
      filtered = filtered.filter(receipt =>
        receipt.receipt_number?.toLowerCase().includes(receiptSearchTerm.toLowerCase()) ||
        receipt.dispatch_number?.toLowerCase().includes(receiptSearchTerm.toLowerCase()) ||
        receipt.project_name?.toLowerCase().includes(receiptSearchTerm.toLowerCase()) ||
        receipt.dispatched_materials?.some(mat => 
          mat.material_name?.toLowerCase().includes(receiptSearchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (receiptStatusFilter) {
      filtered = filtered.filter(receipt => receipt.received_status === receiptStatusFilter);
    }

    // Project filter
    if (receiptProjectFilter) {
      filtered = filtered.filter(receipt => receipt.project_name === receiptProjectFilter);
    }

    // Material type filter
    if (receiptMaterialTypeFilter) {
      filtered = filtered.filter(receipt =>
        receipt.dispatched_materials?.some(mat => 
          mat.material_type === receiptMaterialTypeFilter || 
          mat.material_name?.includes(receiptMaterialTypeFilter)
        )
      );
    }

    // Date range filter
    if (receiptDateFrom) {
      filtered = filtered.filter(receipt => 
        new Date(receipt.created_at) >= new Date(receiptDateFrom)
      );
    }
    if (receiptDateTo) {
      filtered = filtered.filter(receipt => 
        new Date(receipt.created_at) <= new Date(receiptDateTo + 'T23:59:59')
      );
    }

    setFilteredReceipts(filtered);
  };

  const resetReceiptFilters = () => {
    setReceiptSearchTerm('');
    setReceiptStatusFilter('');
    setReceiptDateFrom('');
    setReceiptDateTo('');
    setReceiptProjectFilter('');
    setReceiptMaterialTypeFilter('');
  };

  const handleReceiveMaterials = (dispatchId) => {
    console.log('🔷 handleReceiveMaterials called with dispatchId:', dispatchId);
    console.log('🔷 Type of dispatchId:', typeof dispatchId);
    
    if (!dispatchId) {
      console.error('❌ ERROR: dispatchId is missing!', dispatchId);
      alert('Error: Dispatch ID is missing. Check console for details.');
      return;
    }
    
    const path = `/manufacturing/material-receipt/${dispatchId}`;
    console.log('🔷 Navigating to:', path);
    try {
      navigate(path);
      console.log('✅ Navigation triggered successfully');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      alert('Navigation error: ' + error.message);
    }
  };

  const handleStartProduction = (salesOrder) => {
    // Navigate to production wizard with salesOrderId parameter
    // The wizard will auto-fill with sales order details
    console.log('🟢 Starting production for sales order:', salesOrder.id, salesOrder.order_number);
    navigate(`/manufacturing/wizard?salesOrderId=${salesOrder.id}`);
  };

  const handleStageAction = async (stageId, action) => {
    const key = `${stageId}-${action}`;
    setStageActionLoading({ ...stageActionLoading, [key]: true });
    try {
      const statusMap = {
        'start': 'in_progress',
        'pause': 'on_hold',
        'stop': 'on_hold',
        'complete': 'completed'
      };
      
      // Use the stage start endpoint for better validation
      if (action === 'start') {
        await api.post(`/manufacturing/stages/${stageId}/start`, {
          notes: `Stage started at ${new Date().toLocaleString()}`
        });
      } else {
        // For other actions, use patch with orderId if available
        const order = selectedOrder;
        if (order && order.id) {
          await api.patch(`/manufacturing/orders/${order.id}/stages/${stageId}/status`, {
            status: statusMap[action] || action,
            reason: action === 'pause' ? 'Paused by operator' : undefined
          });
        } else {
          // Fallback to direct stage update
          await api.patch(`/manufacturing/stages/${stageId}`, {
            status: statusMap[action] || action
          });
        }
      }
      
      // Refresh the specific order to show updated stages
      if (selectedOrder && selectedOrder.id) {
        const response = await api.get(`/manufacturing/orders/${selectedOrder.id}`);
        setSelectedOrder(response.data);
      } else {
        fetchData(); // Full refresh if no specific order
      }
    } catch (error) {
      console.error(`Error performing ${action} on stage:`, error);
      const errorMsg = error.response?.data?.message || `Failed to ${action} stage`;
      alert(errorMsg);
    } finally {
      setStageActionLoading({ ...stageActionLoading, [key]: false });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-slate-50 text-slate-700 border border-slate-200',
      material_allocated: 'bg-blue-50 text-blue-700 border border-blue-200',
      cutting: 'bg-amber-50 text-amber-700 border border-amber-200',
      printing: 'bg-purple-50 text-purple-700 border border-purple-200',
      stitching: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      finishing: 'bg-pink-50 text-pink-700 border border-pink-200',
      quality_check: 'bg-orange-50 text-orange-700 border border-orange-200',
      completed: 'bg-green-50 text-green-700 border border-green-200',
      on_hold: 'bg-red-50 text-red-700 border border-red-200',
      cancelled: 'bg-slate-50 text-slate-700 border border-slate-200'
    };
    return colors[status] || 'bg-slate-50 text-slate-700 border border-slate-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-50 text-green-700 border border-green-200',
      medium: 'bg-amber-50 text-amber-700 border border-amber-200',
      high: 'bg-orange-50 text-orange-700 border border-orange-200',
      urgent: 'bg-red-50 text-red-700 border border-red-200'
    };
    return colors[priority] || 'bg-slate-50 text-slate-700 border border-slate-200';
  };

  const ProductionCard = ({ order }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{order.production_number}</h3>
          <p className="text-sm text-slate-600">Sales Order: {order.salesOrder?.order_number}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
            {order.status.replace('_', ' ')}
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
            {order.priority}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-slate-600 font-medium">Quantity</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">{order.quantity}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 font-medium">Produced</p>
          <p className="text-lg font-semibold text-green-700 mt-1">{order.produced_quantity}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 font-medium">Approved</p>
          <p className="text-lg font-semibold text-blue-700 mt-1">{order.approved_quantity}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 font-medium">Rejected</p>
          <p className="text-lg font-semibold text-red-700 mt-1">{order.rejected_quantity}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
        <div className="text-sm text-slate-600">
          Due: {new Date(order.planned_end_date).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedOrder(order)}
            className="px-3 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors duration-200"
          >
            <FaEye className="inline mr-1" /> View
          </button>
          {order.status !== 'completed' && (
            <button
              onClick={() => {/* Navigate to production tracking */}}
              className="px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors duration-200"
            >
              <FaCog className="inline mr-1" /> Update
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const StageTrackingTable = ({ orders }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Production Order</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Start Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">End Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Duration</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-900">Progress</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-900">Processed / Approved / Rejected</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.flatMap(order => {
              return order.stages?.map((stage, stageIndex) => {
                const calculateDuration = () => {
                  if (stage.actual_start_time && stage.actual_end_time) {
                    const start = new Date(stage.actual_start_time);
                    const end = new Date(stage.actual_end_time);
                    const hours = Math.round((end - start) / (1000 * 60 * 60));
                    return `${hours}h`;
                  }
                  return '-';
                };

                const progressPercent = order.quantity > 0 
                  ? Math.round((stage.quantity_processed / order.quantity) * 100) 
                  : 0;

                return (
                  <tr key={`${order.id}-${stage.id}`} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-xs">
                      <p className="font-semibold text-slate-900">{order.production_number}</p>
                      <p className="text-slate-600 text-xs mt-1">{order.salesOrder?.order_number}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-900 capitalize">
                      {stage.stage_name} <br />
                      <span className="text-slate-500 text-xs mt-1">({stageIndex + 1}/{order.stages?.length || 0})</span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(stage.status)}`}>
                        {stage.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {stage.actual_start_time 
                        ? new Date(stage.actual_start_time).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {stage.actual_end_time 
                        ? new Date(stage.actual_end_time).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {calculateDuration()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 bg-slate-200 rounded-full h-2 mx-auto">
                        <div 
                          className="bg-teal-500 h-2 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                          title={`${progressPercent}% complete`}
                        />
                      </div>
                      <p className="text-xs text-slate-600 text-center mt-1">{progressPercent}%</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-center">
                      <div className="flex gap-1 justify-center text-xs">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">{stage.quantity_processed || 0}</span>
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">{stage.quantity_approved || 0}</span>
                        <span className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200">{stage.quantity_rejected || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs space-x-1">
                      {stage.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setTimeout(() => handleStageAction(stage.id, 'start'), 0);
                          }}
                          disabled={stageActionLoading[`${stage.id}-start`]}
                          className="px-2 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          title="Start this stage"
                        >
                          <FaPlay className="inline" size={10} />
                        </button>
                      )}
                      {stage.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setTimeout(() => handleStageAction(stage.id, 'pause'), 0);
                            }}
                            disabled={stageActionLoading[`${stage.id}-pause`]}
                            className="px-2 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            title="Pause this stage"
                          >
                            <FaClock className="inline" size={10} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setTimeout(() => handleStageAction(stage.id, 'complete'), 0);
                            }}
                            disabled={stageActionLoading[`${stage.id}-complete`]}
                            className="px-2 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            title="Mark as complete"
                          >
                            <FaCheck className="inline" size={10} />
                          </button>
                        </>
                      )}
                      {stage.status === 'on_hold' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setTimeout(() => handleStageAction(stage.id, 'start'), 0);
                          }}
                          disabled={stageActionLoading[`${stage.id}-start`]}
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Resume this stage"
                        >
                          <FaPlay className="inline" size={10} />
                        </button>
                      )}
                      {stage.status === 'completed' && (
                        <span className="text-green-600 font-semibold" title="Stage completed">
                          <FaCheckCircle className="inline" size={12} /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                );
              }) || [];
            })}
          </tbody>
        </table>
      </div>
      {orders.filter(o => o.stages && o.stages.length > 0).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No stages to display
        </div>
      )}
    </div>
  );

  const SalesOrderCard = ({ order }) => (
    <div className="bg-white rounded shadow-sm border p-6 hover:shadow-md transition-shadow">
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
          onClick={() => handleStartProduction(order)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 transition-colors"
        >
          <FaPlay /> Start Production
        </button>
      </div>
    </div>
  );

  console.log('🟣 Rendering ProductionDashboardPage. dashboardTab:', dashboardTab, 'pendingDispatches.length:', pendingDispatches.length);

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
          <div className="bg-white p-6 rounded shadow-sm border">
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

          <div className="bg-white p-6 rounded shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready for Production</p>
                <p className="text-2xl font-bold text-gray-900">{salesOrders.length}</p>
              </div>
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-sm border">
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

          <div className="bg-white p-6 rounded shadow-sm border">
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

        {/* Dashboard Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 bg-gray-100 p-1 rounded w-fit mb-6">
            <button
              onClick={() => setDashboardTab('production')}
              className={`px-4 py-2 rounded font-medium transition-colors ${dashboardTab === 'production' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Production Orders
            </button>
            <button
              onClick={() => setDashboardTab('material-receipt')}
              className={`px-4 py-2 rounded font-medium transition-colors ${dashboardTab === 'material-receipt' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Material Receipts
            </button>
          </div>
        </div>

        {/* Active Production Orders */}
        {dashboardTab === 'production' && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaCog className="text-blue-600" />
                  Active Production Orders
                </h2>
                <div className="flex gap-2 bg-gray-100 p-1 rounded">
                  <button
                    onClick={() => setActiveTab('cards')}
                    className={`px-4 py-2 rounded font-medium transition-colors ${activeTab === 'cards' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Cards View
                  </button>
                  <button
                    onClick={() => setActiveTab('table')}
                    className={`px-4 py-2 rounded font-medium transition-colors ${activeTab === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Table View
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : productionOrders.filter(o => o.status !== 'completed').length > 0 ? (
                activeTab === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productionOrders.filter(o => o.status !== 'completed').map(order => (
                      <ProductionCard key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <StageTrackingTable orders={productionOrders.filter(o => o.status !== 'completed')} />
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No active production orders
                </div>
              )}
            </div>

            {/* Completed Orders */}
            <div className="mb-8">
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
          </>
        )}

        {/* Material Receipt Tab */}
        {dashboardTab === 'material-receipt' && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaBox className="text-blue-600" />
            Material Receipts
          </h2>

          {/* Dispatches Awaiting Receipt Section */}
          {pendingDispatches.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <FaExclamationTriangle className="text-orange-600 text-lg" />
                <h3 className="text-lg font-semibold text-gray-900">Dispatches Awaiting Receipt</h3>
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-600 rounded-full">
                  {pendingDispatches.length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingDispatches.map((dispatch) => (
                  <div key={dispatch.id || dispatch.dispatch_id} className="bg-white rounded-lg shadow border border-orange-200 hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-bold text-gray-700">
                            {dispatch.dispatch_number}
                          </p>
                          <p className="text-xs text-gray-600">
                            {dispatch.project_name || 'N/A'}
                          </p>
                        </div>
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">
                          AWAITING
                        </span>
                      </div>

                      {/* Materials */}
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Materials ({dispatch.dispatched_materials?.length || 0}):</p>
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {dispatch.dispatched_materials?.slice(0, 3).map((material, idx) => (
                            <p key={idx} className="text-xs text-gray-600">
                              • {material.material_name} ({material.quantity_dispatched} {material.uom || 'pcs'})
                            </p>
                          ))}
                          {dispatch.dispatched_materials?.length > 3 && (
                            <p className="text-xs text-gray-500 italic">
                              +{dispatch.dispatched_materials.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                        <span>
                          Dispatched: {new Date(dispatch.dispatched_at).toLocaleDateString()}
                        </span>
                        <span>
                          By: {dispatch.dispatcher?.name || 'Unknown'}
                        </span>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const id = dispatch.id || dispatch.dispatch_id;
                          console.log('🔷 Button clicked');
                          console.log('  - dispatch.id:', dispatch.id);
                          console.log('  - dispatch.dispatch_id:', dispatch.dispatch_id);
                          console.log('  - Using ID:', id);
                          handleReceiveMaterials(id);
                        }}
                        className="w-full px-4 py-2 bg-orange-600 text-white rounded font-medium text-sm hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaArrowRight className="text-sm" />
                        Receive Materials
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Receipt Filters */}
          <div className="bg-white p-4 rounded shadow-md mb-4">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by Receipt #, Dispatch #, Project or Material..."
                  value={receiptSearchTerm}
                  onChange={(e) => setReceiptSearchTerm(e.target.value)}
                  className="w-full p-3 border rounded pl-10 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <button
                onClick={() => setShowReceiptFilters(!showReceiptFilters)}
                className="flex items-center gap-1.5 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <FaFilter size={16} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {showReceiptFilters && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={receiptStatusFilter}
                    onChange={(e) => setReceiptStatusFilter(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  >
                    <option value="">All Status</option>
                    <option value="received">Received</option>
                    <option value="discrepancy">Discrepancy</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={receiptDateFrom}
                    onChange={(e) => setReceiptDateFrom(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={receiptDateTo}
                    onChange={(e) => setReceiptDateTo(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <input
                    type="text"
                    placeholder="Filter by project..."
                    value={receiptProjectFilter}
                    onChange={(e) => setReceiptProjectFilter(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
                  <input
                    type="text"
                    placeholder="Filter by material..."
                    value={receiptMaterialTypeFilter}
                    onChange={(e) => setReceiptMaterialTypeFilter(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  />
                </div>

                {(receiptSearchTerm || receiptStatusFilter || receiptDateFrom || receiptDateTo || receiptProjectFilter || receiptMaterialTypeFilter) && (
                  <div className="col-span-1 md:col-span-5 flex justify-end">
                    <button
                      onClick={resetReceiptFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                    >
                      <FaTimes size={14} />
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Receipt History Table */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Receipt History</h3>
          </div>
          
          <div className="bg-white rounded shadow-md">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispatch #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materials</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReceipts.length > 0 ? (
                    filteredReceipts.map((receipt) => (
                      <tr key={receipt.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{receipt.receipt_number || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{receipt.dispatch_number || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{receipt.project_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-xs">
                            {receipt.dispatched_materials?.length || 0} items
                            {receipt.dispatched_materials?.map((mat, idx) => (
                              <div key={idx} className="text-gray-600">
                                {mat.material_name} ({mat.quantity_dispatched} {mat.uom || 'pcs'})
                              </div>
                            )).slice(0, 1)}
                            {receipt.dispatched_materials?.length > 1 && (
                              <div className="text-gray-500">+{receipt.dispatched_materials.length - 1} more</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            receipt.received_status === 'received' ? 'bg-green-100 text-green-700' :
                            receipt.received_status === 'discrepancy' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {receipt.received_status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{receipt.receiver?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        {materialReceipts.length === 0 ? 'No material receipts available' : 'No receipts match your filters'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}

        {/* Production Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl">
              {/* Compact Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-bold">{selectedOrder.production_number}</h2>
                    <p className="text-xs text-blue-100">Sales Order: {selectedOrder.salesOrder?.order_number}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-white ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-white ${getPriorityColor(selectedOrder.priority)}`}>
                      {selectedOrder.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Summary - Horizontal Compact */}
              <div className="p-3 bg-gray-50 border-b sticky top-12">
                <div className="grid grid-cols-6 gap-2 text-center text-xs">
                  <div>
                    <p className="text-gray-600">Qty</p>
                    <p className="font-bold text-lg">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Produced</p>
                    <p className="font-bold text-lg text-green-600">{selectedOrder.produced_quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Approved</p>
                    <p className="font-bold text-lg text-blue-600">{selectedOrder.approved_quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rejected</p>
                    <p className="font-bold text-lg text-red-600">{selectedOrder.rejected_quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Yield</p>
                    <p className="font-bold text-lg text-purple-600">
                      {selectedOrder.quantity > 0 ? Math.round(((selectedOrder.approved_quantity || 0) / selectedOrder.quantity) * 100) : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-bold text-sm">{new Date(selectedOrder.planned_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Stages - Compact View */}
              <div className="p-3">
                <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Production Stages</h3>
                <div className="space-y-2">
                  {selectedOrder.stages?.map((stage, index) => {
                    const calculateDuration = () => {
                      if (stage.actual_start_time && stage.actual_end_time) {
                        const start = new Date(stage.actual_start_time);
                        const end = new Date(stage.actual_end_time);
                        const hours = Math.round((end - start) / (1000 * 60 * 60));
                        return `${hours}h`;
                      }
                      return '-';
                    };

                    const isLoading = stageActionLoading[`${stage.id}-start`] || 
                                     stageActionLoading[`${stage.id}-pause`] ||
                                     stageActionLoading[`${stage.id}-complete`];

                    const getStageGradient = (status) => {
                      const gradients = {
                        pending: 'from-gray-400 to-gray-500',
                        in_progress: 'from-blue-400 to-blue-500',
                        on_hold: 'from-yellow-400 to-yellow-500',
                        completed: 'from-green-400 to-green-500'
                      };
                      return gradients[status] || 'from-gray-400 to-gray-500';
                    };

                    return (
                      <div key={stage.id} className={`bg-gradient-to-r ${getStageGradient(stage.status)} rounded-lg p-2.5 text-white shadow-md hover:shadow-lg transition-shadow`}>
                        {/* Stage Header - Compact */}
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-white bg-opacity-30 px-2 py-1 rounded">Stage {index + 1}</span>
                            <h4 className="text-xs font-bold capitalize">{stage.stage_name}</h4>
                          </div>
                          <span className="text-xs font-bold bg-white bg-opacity-30 px-2 py-1 rounded">
                            {stage.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        {/* Timing & Quantities - Horizontal Compact */}
                        <div className="grid grid-cols-8 gap-1.5 text-xs mb-2">
                          <div className="bg-white bg-opacity-20 p-1 rounded text-center">
                            <p className="text-white text-opacity-90">Start</p>
                            <p className="text-xs font-semibold truncate">
                              {stage.actual_start_time 
                                ? new Date(stage.actual_start_time).toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : '-'}
                            </p>
                          </div>
                          <div className="bg-white bg-opacity-20 p-1 rounded text-center">
                            <p className="text-white text-opacity-90">End</p>
                            <p className="text-xs font-semibold truncate">
                              {stage.actual_end_time 
                                ? new Date(stage.actual_end_time).toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : '-'}
                            </p>
                          </div>
                          <div className="bg-white bg-opacity-20 p-1 rounded text-center">
                            <p className="text-white text-opacity-90">Dur</p>
                            <p className="text-xs font-semibold">{calculateDuration()}</p>
                          </div>
                          <div className="bg-white bg-opacity-20 p-1 rounded text-center">
                            <p className="text-white text-opacity-90">Proc</p>
                            <p className="text-xs font-semibold">{stage.quantity_processed || 0}</p>
                          </div>
                          <div className="bg-white bg-opacity-20 p-1 rounded text-center">
                            <p className="text-white text-opacity-90">App</p>
                            <p className="text-xs font-semibold">{stage.quantity_approved || 0}</p>
                          </div>
                          <div className="bg-white bg-opacity-20 p-1 rounded text-center">
                            <p className="text-white text-opacity-90">Rej</p>
                            <p className="text-xs font-semibold">{stage.quantity_rejected || 0}</p>
                          </div>
                          <div className="bg-white bg-opacity-20 p-1 rounded text-center">
                            <p className="text-white text-opacity-90">%</p>
                            <p className="text-xs font-semibold">
                              {stage.quantity_processed > 0 ? Math.round((stage.quantity_approved / stage.quantity_processed) * 100) : 0}%
                            </p>
                          </div>
                          <div className="bg-white bg-opacity-20 p-1 rounded text-center">
                            <p className="text-white text-opacity-90">Total</p>
                            <p className="text-xs font-semibold">{selectedOrder.quantity}</p>
                          </div>
                        </div>

                        {/* Notes - Compact */}
                        {stage.notes && (
                          <div className="text-xs bg-white bg-opacity-15 p-1 rounded mb-2 italic border-l-2 border-white border-opacity-50">
                            <span className="font-semibold">Note:</span> {stage.notes.substring(0, 80)}{stage.notes.length > 80 ? '...' : ''}
                          </div>
                        )}

                        {/* Action Buttons - Compact */}
                        <div className="flex gap-1.5">
                          {stage.status === 'pending' && (
                            <button
                              onClick={() => handleStageAction(stage.id, 'start')}
                              disabled={isLoading}
                              className="flex-1 px-2 py-1 bg-white text-blue-600 rounded text-xs font-bold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <FaPlay className="inline mr-1" style={{fontSize: '10px'}} />
                              {stageActionLoading[`${stage.id}-start`] ? 'Starting...' : 'Start'}
                            </button>
                          )}
                          
                          {stage.status === 'in_progress' && (
                            <>
                              <button
                                onClick={() => handleStageAction(stage.id, 'pause')}
                                disabled={isLoading}
                                className="flex-1 px-2 py-1 bg-white text-yellow-600 rounded text-xs font-bold hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <FaClock className="inline mr-1" style={{fontSize: '10px'}} />
                                {stageActionLoading[`${stage.id}-pause`] ? 'Pausing...' : 'Pause'}
                              </button>
                              <button
                                onClick={() => handleStageAction(stage.id, 'complete')}
                                disabled={isLoading}
                                className="flex-1 px-2 py-1 bg-white text-green-600 rounded text-xs font-bold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <FaCheck className="inline mr-1" style={{fontSize: '10px'}} />
                                {stageActionLoading[`${stage.id}-complete`] ? 'Completing...' : 'Done'}
                              </button>
                            </>
                          )}

                          {stage.status === 'on_hold' && (
                            <button
                              onClick={() => handleStageAction(stage.id, 'start')}
                              disabled={isLoading}
                              className="flex-1 px-2 py-1 bg-white text-green-600 rounded text-xs font-bold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <FaPlay className="inline mr-1" style={{fontSize: '10px'}} />
                              {stageActionLoading[`${stage.id}-start`] ? 'Resuming...' : 'Resume'}
                            </button>
                          )}

                          {stage.status === 'completed' && (
                            <div className="flex-1 px-2 py-1 bg-white text-green-600 rounded text-xs font-bold text-center flex items-center justify-center gap-1">
                              <FaCheckCircle style={{fontSize: '10px'}} />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t bg-gray-50 flex justify-end sticky bottom-0">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-gray-400 transition-colors"
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