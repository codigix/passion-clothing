import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Plus,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Eye,
  Send,
  ChevronRight,
  Calendar,
  User,
  Zap,
  Search,
  BarChart3,
  Activity,
  X,
  Filter,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ShippingDashboardPage = () => {
  const navigate = useNavigate();
  const [ordersReadyToShip, setOrdersReadyToShip] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateShipment, setShowCreateShipment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [showDeliveryTracking, setShowDeliveryTracking] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [orderShipmentMap, setOrderShipmentMap] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalShipments: 0,
    delivered: 0,
    inTransit: 0,
    pending: 0,
    failed: 0
  });

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

      // Fetch incoming orders from production (ready to ship)
      const incomingResponse = await api.get('/shipments/orders/incoming?limit=50&exclude_delivered=true');
      setOrdersReadyToShip(incomingResponse.data.orders || []);

      // Fetch recent shipments
      const shipmentsResponse = await api.get('/shipments?page=1&limit=100');
      setShipments(shipmentsResponse.data.shipments);

      // Calculate stats
      const shipmentList = shipmentsResponse.data.shipments || [];
      const incomingOrders = incomingResponse.data.orders || [];
      setStats({
        totalOrders: incomingOrders.length,
        totalShipments: shipmentList.length,
        delivered: shipmentList.filter(s => s.status === 'delivered').length,
        inTransit: shipmentList.filter(s => ['in_transit', 'dispatched'].includes(s.status)).length,
        pending: shipmentList.filter(s => s.status === 'pending').length,
        failed: shipmentList.filter(s => s.status === 'failed_delivery').length
      });

      // Create a map of production_order_id -> shipment
      const shipmentMap = {};
      if (shipmentList && incomingOrders) {
        // Map shipments by sales_order_id for backward compatibility
        shipmentList.forEach(shipment => {
          if (shipment.sales_order_id) {
            shipmentMap[shipment.sales_order_id] = shipment;
          }
        });
        
        // Also map by production order id directly
        incomingOrders.forEach(order => {
          if (order.shipment_id) {
            const shipment = shipmentList.find(s => s.id === order.shipment_id);
            if (shipment) {
              shipmentMap[order.id] = shipment;
            }
          }
        });
      }
      setOrderShipmentMap(shipmentMap);

    } catch (error) {
      console.error('Error loading shipping data:', error);
      toast.error('Unable to load shipping data');
    } finally {
      setLoading(false);
    }
  };

  const getShipmentForOrder = (orderId) => {
    return orderShipmentMap[orderId];
  };

  const filterShipments = (shipmentList) => {
    let filtered = shipmentList;

    // Filter by tab status
    if (activeTab === 'ready') {
      filtered = ordersReadyToShip;
    } else if (activeTab === 'pending') {
      filtered = shipmentList.filter(s => s.status === 'pending');
    } else if (activeTab === 'in_transit') {
      filtered = shipmentList.filter(s => ['in_transit', 'dispatched', 'out_for_delivery'].includes(s.status));
    } else if (activeTab === 'delivered') {
      filtered = shipmentList.filter(s => s.status === 'delivered');
    } else if (activeTab === 'failed') {
      filtered = shipmentList.filter(s => s.status === 'failed_delivery');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const shipmentNum = item.shipment_number?.toLowerCase() || '';
        const trackingNum = item.tracking_number?.toLowerCase() || '';
        const customerName = (item.customer?.name || item.salesOrder?.customer?.name || '').toLowerCase();
        const orderNum = (item.sales_order_number || item.salesOrder?.sales_order_number || '').toLowerCase();
        
        return shipmentNum.includes(query) || trackingNum.includes(query) || 
               customerName.includes(query) || orderNum.includes(query);
      });
    }

    return filtered;
  };

  const handleCreateShipment = async () => {
    if (!selectedOrder) return;

    setCreatingShipment(true);
    try {
      // Use sales_order_id from production order (not production order id)
      const salesOrderId = selectedOrder.sales_order_id;
      await api.post(`/shipments/create-from-order/${salesOrderId}`, shipmentForm);
      setShowCreateShipment(false);
      setSelectedOrder(null);
      setShipmentForm({ courier_company: '', tracking_number: '', expected_delivery_date: '', notes: '' });
      toast.success('Shipment created successfully ✓');
      fetchData();
    } catch (error) {
      toast.error('Failed to create shipment');
    } finally {
      setCreatingShipment(false);
    }
  };

  const handleUpdateDeliveryStatus = async (newStatus) => {
    if (!selectedShipment) return;

    try {
      setUpdatingStatus(true);
      await api.patch(`/shipments/${selectedShipment.id}/status`, {
        status: newStatus
      });

      toast.success(`Shipment updated to ${newStatus.replace('_', ' ')} ✓`);
      setShowDeliveryTracking(false);
      setSelectedShipment(null);
      fetchData();
    } catch (error) {
      console.error('Error updating shipment status:', error);
      toast.error(error.response?.data?.message || 'Failed to update shipment status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      dispatched: 'bg-blue-100 text-blue-700 border-blue-200',
      in_transit: 'bg-purple-100 text-purple-700 border-purple-200',
      out_for_delivery: 'bg-orange-100 text-orange-700 border-orange-200',
      delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      failed_delivery: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'dispatched': return <Send className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'out_for_delivery': return <MapPin className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    // Map current status to available next statuses
    const statusMap = {
      'preparing': ['packed', 'ready_to_ship'],
      'packed': ['ready_to_ship'],
      'ready_to_ship': ['shipped'],
      'shipped': ['in_transit'],
      'in_transit': ['out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'failed_delivery': ['in_transit', 'returned'],
      'returned': [],
      'cancelled': []
    };
    return statusMap[currentStatus] || [];
  };

  const handleQuickStatusUpdate = async (shipmentId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.patch(`/shipments/${shipmentId}/status`, {
        status: newStatus
      });
      toast.success(`Status updated to ${newStatus.replace('_', ' ')} ✓`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Stats Card Component
  const StatCard = ({ icon: Icon, label, value, trend, color = 'blue', onClick }) => {
    const colorVariants = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
      red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
    };

    const iconColors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      red: 'text-red-600'
    };

    return (
      <div 
        onClick={onClick}
        className={`border-2 rounded-lg p-5 transition-all cursor-pointer ${colorVariants[color]}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-lg ${colorVariants[color]}`}>
            <Icon className={`w-6 h-6 ${iconColors[color]}`} />
          </div>
          {trend && <TrendingUp className={`w-4 h-4 ${iconColors[color]}`} />}
        </div>
        <p className="text-xs font-semibold uppercase opacity-75 mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    );
  };

  // Order Card Component
  const OrderCard = ({ order }) => {
    const existingShipment = getShipmentForOrder(order.id);
    const hasShipment = !!existingShipment;

    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200 p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">#{order.sales_order_number || order.order_number || 'N/A'}</h3>
              <p className="text-sm text-gray-600 mt-1">{order.customer_name || order.customer?.name || 'N/A'}</p>
            </div>
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              Ready
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Order Details Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Quantity</p>
              <p className="text-2xl font-bold text-gray-900">{order.quantity || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Production</p>
              <p className="text-lg font-bold text-gray-900">{order.production_number || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Status</p>
              <p className="text-sm font-bold text-blue-600">Ready</p>
            </div>
          </div>

          {/* Customer Address */}
          <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 line-clamp-2">{order.shipping_address || order.delivery_address || 'N/A'}</p>
            </div>
          </div>

          {/* Shipment Status with Update Options */}
          {hasShipment && (
            <div className="space-y-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${getStatusColor(existingShipment.status)}`}>
                {getStatusIcon(existingShipment.status)}
                <span className="capitalize">
                  {existingShipment.status?.replace('_', ' ')}
                </span>
              </div>
              
              {/* Quick Status Update */}
              {getNextStatusOptions(existingShipment.status).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleQuickStatusUpdate(existingShipment.id, e.target.value);
                      }
                    }}
                    disabled={updatingStatus}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-medium focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer bg-white"
                  >
                    <option value="">Update Status...</option>
                    {getNextStatusOptions(existingShipment.status).map(status => (
                      <option key={status} value={status}>
                        → {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {!hasShipment ? (
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setShowCreateShipment(true);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Create Shipment
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedShipment(existingShipment);
                    setShowDeliveryTracking(true);
                  }}
                  className="flex-1 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-sm py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Track
                </button>
                <button
                  onClick={() => navigate('/shipment/dispatch')}
                  className="flex-1 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold text-sm py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Dispatch
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Shipment Card Component
  const ShipmentCard = ({ shipment }) => {
    const status = shipment.status || 'pending';
    
    const getStatusStyles = (stat) => {
      switch (stat) {
        case 'delivered':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'in_transit':
        case 'dispatched':
          return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'out_for_delivery':
          return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'failed_delivery':
          return 'bg-red-100 text-red-800 border-red-300';
        default:
          return 'bg-amber-100 text-amber-800 border-amber-300';
      }
    };
    
    const handleTrackingClick = () => {
      if (shipment.tracking_number) {
        navigate(`/shipment/tracking/${shipment.tracking_number}`);
      } else {
        toast.error('No tracking number available');
      }
    };
    
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-base text-gray-900">{shipment.shipment_number}</h4>
              <button
                onClick={handleTrackingClick}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 font-mono font-semibold transition-colors cursor-pointer"
                title="Click to track shipment"
              >
                {shipment.tracking_number}
              </button>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap ${getStatusStyles(status)}`}>
              {status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{shipment.salesOrder?.customer?.name || 'N/A'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{new Date(shipment.created_at).toLocaleDateString()}</span>
          </div>

          {/* Quick Status Update Dropdown */}
          {getNextStatusOptions(status).length > 0 && (
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleQuickStatusUpdate(shipment.id, e.target.value);
                  }
                }}
                disabled={updatingStatus}
                className="w-full px-2 py-1.5 border border-blue-300 rounded text-xs font-medium focus:outline-none focus:border-blue-600 disabled:opacity-50 cursor-pointer bg-white text-gray-700 hover:bg-gray-50"
              >
                <option value="">Update Status...</option>
                {getNextStatusOptions(status).map(nextStatus => (
                  <option key={nextStatus} value={nextStatus}>
                    → {nextStatus.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                setSelectedShipment(shipment);
                setShowDeliveryTracking(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Create Shipment Modal
  const CreateShipmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white">
          <h3 className="font-bold text-lg">Create Shipment</h3>
          <p className="text-blue-100 text-xs mt-0.5">#{selectedOrder?.sales_order_number || selectedOrder?.order_number || selectedOrder?.production_number}</p>
        </div>

        {/* Form */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Courier Company</label>
            <input
              type="text"
              value={shipmentForm.courier_company}
              onChange={(e) => setShipmentForm({...shipmentForm, courier_company: e.target.value})}
              placeholder="e.g., DHL, FedEx"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Tracking Number</label>
            <input
              type="text"
              value={shipmentForm.tracking_number}
              onChange={(e) => setShipmentForm({...shipmentForm, tracking_number: e.target.value})}
              placeholder="Enter tracking number"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Delivery Date</label>
            <input
              type="date"
              value={shipmentForm.expected_delivery_date}
              onChange={(e) => setShipmentForm({...shipmentForm, expected_delivery_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Notes</label>
            <textarea
              value={shipmentForm.notes}
              onChange={(e) => setShipmentForm({...shipmentForm, notes: e.target.value})}
              placeholder="Add special instructions..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none transition resize-none text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex gap-2 border-t border-gray-200">
          <button
            onClick={() => {
              setShowCreateShipment(false);
              setSelectedOrder(null);
            }}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-100 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateShipment}
            disabled={creatingShipment}
            className="flex-1 px-3 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-1 text-sm"
          >
            {creatingShipment ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Truck className="w-3 h-3" />
                Create
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Delivery Tracking Modal
  const DeliveryTrackingModal = () => {
    const deliveryStages = [
      { key: 'pending', label: 'Pending', icon: Clock },
      { key: 'dispatched', label: 'Dispatched', icon: Send },
      { key: 'in_transit', label: 'In Transit', icon: Truck },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const currentStatusIndex = deliveryStages.findIndex(s => s.key === selectedShipment?.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white">
            <h3 className="font-bold text-lg">Delivery Tracking</h3>
            <p className="text-blue-100 text-xs mt-0.5">{selectedShipment?.shipment_number}</p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Current Status */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-gray-600 mb-1 uppercase font-semibold">Current Status</p>
              <p className="text-lg font-bold text-blue-900 capitalize">
                {selectedShipment?.status?.replace('_', ' ')}
              </p>
            </div>

            {/* Delivery Progress */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase">Progress</p>
              <div className="flex justify-between items-start gap-1.5">
                {deliveryStages.map((stage, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const StageIcon = stage.icon;

                  return (
                    <div key={stage.key} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                          isCompleted
                            ? 'bg-green-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isCompleted && !isCurrent ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <StageIcon className="w-5 h-5" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-700 mt-1 text-center">{stage.label}</p>

                      {index < deliveryStages.length - 1 && (
                        <div
                          className={`w-0.5 h-6 mt-1 transition-all duration-300 ${
                            isCompleted ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipment Details */}
            <div className="bg-gray-50 rounded p-3 space-y-1.5 border border-gray-200 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tracking:</span>
                <span className="font-mono font-bold text-gray-900">{selectedShipment?.tracking_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Courier:</span>
                <span className="font-medium text-gray-900">{selectedShipment?.courier_company || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected:</span>
                <span className="font-medium text-gray-900">
                  {selectedShipment?.expected_delivery_date ? new Date(selectedShipment.expected_delivery_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 flex gap-2 border-t border-gray-200">
            {currentStatusIndex < deliveryStages.length - 1 && (
              <>
                <button
                  onClick={() => {
                    const nextStatus = deliveryStages[currentStatusIndex + 1].key;
                    handleUpdateDeliveryStatus(nextStatus);
                  }}
                  disabled={updatingStatus}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-1 text-sm"
                >
                  {updatingStatus ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3 h-3" />
                      Update
                    </>
                  )}
                </button>
              </>
            )}
            <button
              onClick={() => {
                setShowDeliveryTracking(false);
                setSelectedShipment(null);
              }}
              className={`${currentStatusIndex < deliveryStages.length - 1 ? 'flex-1' : 'w-full'} px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-100 transition text-sm`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Tab configuration
  const tabs = [
    { id: 'all', label: 'All Shipments', icon: Activity, count: shipments.length },
    { id: 'ready', label: 'Ready to Ship', icon: Package, count: ordersReadyToShip.length },
    { id: 'pending', label: 'Pending', icon: Clock, count: stats.pending },
    { id: 'in_transit', label: 'In Transit', icon: Truck, count: stats.inTransit },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle, count: stats.delivered },
    { id: 'failed', label: 'Failed', icon: AlertCircle, count: stats.failed }
  ];

  const filteredData = filterShipments(activeTab === 'ready' ? ordersReadyToShip : shipments);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-base">Loading shipping data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shipping Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage shipments, orders, and track deliveries in real-time</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <StatCard 
              icon={Package} 
              label="Orders Ready" 
              value={stats.totalOrders} 
              color="blue"
              onClick={() => setActiveTab('ready')}
            />
            <StatCard 
              icon={Activity} 
              label="Total Shipments" 
              value={stats.totalShipments} 
              color="purple"
              onClick={() => setActiveTab('all')}
            />
            <StatCard 
              icon={Clock} 
              label="Pending" 
              value={stats.pending} 
              color="orange"
              onClick={() => setActiveTab('pending')}
            />
            <StatCard 
              icon={Truck} 
              label="In Transit" 
              value={stats.inTransit} 
              color="purple"
              onClick={() => setActiveTab('in_transit')}
            />
            <StatCard 
              icon={CheckCircle} 
              label="Delivered" 
              value={stats.delivered} 
              color="green"
              onClick={() => setActiveTab('delivered')}
            />
            <StatCard 
              icon={AlertCircle} 
              label="Failed" 
              value={stats.failed} 
              color="red"
              onClick={() => setActiveTab('failed')}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-4 [-webkit-scrollbar:none] [scrollbar-width:none]">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-blue-700' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by order #, tracking #, customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition text-sm"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div>
          {filteredData.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
              <div className="flex justify-center mb-4">
                {activeTab === 'delivered' && <CheckCircle className="w-16 h-16 text-green-300" />}
                {activeTab === 'in_transit' && <Truck className="w-16 h-16 text-blue-300" />}
                {activeTab === 'ready' && <Package className="w-16 h-16 text-orange-300" />}
                {(activeTab === 'pending' || activeTab === 'all') && <Activity className="w-16 h-16 text-gray-300" />}
                {activeTab === 'failed' && <AlertCircle className="w-16 h-16 text-red-300" />}
              </div>
              <p className="text-gray-600 font-semibold text-lg mb-1">No items found</p>
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'Try adjusting your search criteria' : `No ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} at the moment`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map(item => (
                <div key={item.id}>
                  {activeTab === 'ready' ? (
                    <OrderCard order={item} />
                  ) : (
                    <ShipmentCard shipment={item} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateShipment && <CreateShipmentModal />}
      {showDeliveryTracking && selectedShipment && <DeliveryTrackingModal />}
    </div>
  );
};

export default ShippingDashboardPage;