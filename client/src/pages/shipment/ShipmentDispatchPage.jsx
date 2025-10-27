import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Send,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Download,
  RefreshCw,
  Printer,
  ChevronRight,
  Navigation,
  CheckCheck,
  Zap,
  Trash2,
  Copy,
  MoreHorizontal,
  Grid3x3,
  List,
  X,
  ArrowRight,
  Zap as ZapIcon,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const ShipmentDispatchPage = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courierFilter, setCourierFilter] = useState('');
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showDeliveryTrackingModal, setShowDeliveryTrackingModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [courierAgents, setCourierAgents] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [stats, setStats] = useState({
    pending: 0,
    dispatched: 0,
    inTransit: 0,
    delivered: 0
  });

  const deliveryStages = [
    { key: 'pending', label: 'Pending', color: 'amber', icon: Clock },
    { key: 'dispatched', label: 'Dispatched', color: 'blue', icon: Send },
    { key: 'in_transit', label: 'In Transit', color: 'purple', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', color: 'orange', icon: Navigation },
    { key: 'delivered', label: 'Delivered', color: 'emerald', icon: CheckCircle }
  ];

  useEffect(() => {
    fetchShipments();
    fetchCourierAgents();
    fetchStats();
  }, [searchTerm, statusFilter, courierFilter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (courierFilter) params.append('courier_partner_id', courierFilter);

      const response = await fetch(`/api/shipments?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setShipments(data.shipments || []);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourierAgents = async () => {
    try {
      const response = await fetch('/api/courier-agents', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCourierAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Error fetching courier agents:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/shipments/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDispatchShipment = async (shipmentId, dispatchData, shipmentData) => {
    try {
      // Use provided shipment data, or fall back to looking it up
      const shipment = shipmentData || selectedShipment || shipments.find(s => s.id === shipmentId);
      
      if (!shipment) {
        toast.error('Shipment not found');
        return;
      }

      // Determine the correct status based on current shipment status
      let targetStatus = 'shipped'; // Default for ready_to_ship
      
      const currentStatus = shipment.status?.trim().toLowerCase();
      
      // Status transition logic
      if (currentStatus === 'ready_to_ship') {
        targetStatus = 'shipped';
      } else if (currentStatus === 'shipped') {
        targetStatus = 'in_transit';
      } else if (currentStatus === 'in_transit') {
        targetStatus = 'out_for_delivery';
      } else if (currentStatus === 'out_for_delivery') {
        targetStatus = 'delivered';
      } else {
        // For any other status, try to move to next logical state
        toast.warn(`Current status: ${shipment.status}. Please check allowed transitions.`);
      }

      await api.post(`/shipments/${shipmentId}/status`, {
        status: targetStatus,
        location: dispatchData.location,
        notes: dispatchData.notes,
        courier_agent_id: dispatchData.courier_agent_id,
        tracking_number: dispatchData.tracking_number
      });

      toast.success('✓ Shipment dispatched successfully');
      fetchShipments();
      fetchStats();
      setShowDispatchModal(false);
      setSelectedShipment(null);
    } catch (error) {
      console.error('Error dispatching shipment:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to dispatch shipment';
      toast.error(errorMsg);
    }
  };

  const handleBulkDispatch = async () => {
    // Filter out delivered shipments
    const dispatchableShipments = selectedShipments.filter(shipmentId => {
      const shipment = shipments.find(s => s.id === shipmentId);
      return shipment && shipment.status !== 'delivered';
    });

    if (dispatchableShipments.length === 0) {
      toast.error('No pending shipments selected to dispatch. Delivered shipments cannot be dispatched.');
      return;
    }

    const skippedCount = selectedShipments.length - dispatchableShipments.length;
    if (skippedCount > 0) {
      toast.info(`⏭️ Skipping ${skippedCount} delivered shipment(s)`);
    }

    try {
      const promises = dispatchableShipments.map(shipmentId => {
        // Determine target status based on current status
        const shipment = shipments.find(s => s.id === shipmentId);
        let targetStatus = 'shipped';
        
        const currentStatus = shipment?.status?.trim().toLowerCase();
        if (currentStatus === 'ready_to_ship') {
          targetStatus = 'shipped';
        } else if (currentStatus === 'shipped') {
          targetStatus = 'in_transit';
        } else if (currentStatus === 'in_transit') {
          targetStatus = 'out_for_delivery';
        } else if (currentStatus === 'out_for_delivery') {
          targetStatus = 'delivered';
        }

        return fetch(`/api/shipments/${shipmentId}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            status: targetStatus,
            location: 'Warehouse',
            notes: 'Bulk dispatch'
          })
        });
      });

      await Promise.all(promises);
      toast.success(`✓ ${dispatchableShipments.length} shipment(s) dispatched successfully`);
      setSelectedShipments([]);
      fetchShipments();
      fetchStats();
    } catch (error) {
      console.error('Error in bulk dispatch:', error);
      toast.error('Failed to dispatch some shipments');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' },
      dispatched: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
      in_transit: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800' },
      delivered: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
      exception: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800' }
    };
    return colors[status] || { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800' };
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      dispatched: Send,
      in_transit: Truck,
      out_for_delivery: Navigation,
      delivered: CheckCircle
    };
    return icons[status] || Package;
  };

  // ============ STAT CARD ============
  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 opacity-80" />
        <span className="text-xs font-bold px-3 py-1 bg-white bg-opacity-20 rounded-full">{value}</span>
      </div>
      <p className="text-sm font-medium opacity-90">{label}</p>
    </div>
  );

  // ============ SHIPMENT CARD (Grid View) ============
  const ShipmentCard = ({ shipment }) => {
    const isSelected = selectedShipments.includes(shipment.id);
    const statusColors = getStatusColor(shipment.status);
    const StatusIcon = getStatusIcon(shipment.status);

    return (
      <div
        className={`relative rounded-xl border-2 transition-all duration-300 cursor-pointer group ${isSelected
            ? 'border-blue-500 bg-blue-50 shadow-lg'
            : `border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg ${statusColors.bg}`
          }`}
        onClick={() => {
          if (selectedShipments.includes(shipment.id)) {
            setSelectedShipments(selectedShipments.filter(id => id !== shipment.id));
          } else {
            setSelectedShipments([...selectedShipments, shipment.id]);
          }
        }}
      >
        {/* Checkbox */}
        <div className="absolute top-4 right-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => { }}
            className="w-5 h-5 rounded border-2 border-gray-300 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Header */}
        <div className={`p-4 border-b-2 ${statusColors.border}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{shipment.shipment_number}</h3>
              <p className="text-xs text-gray-600 font-mono mt-1 break-all">{shipment.tracking_number}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <StatusIcon className="w-4 h-4" />
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors.badge}`}>
              {shipment.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-medium">CUSTOMER</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {shipment.salesOrder?.customer?.name || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{shipment.salesOrder?.customer?.email || 'N/A'}</p>
          </div>

          {/* Delivery Address */}
          <div className="flex gap-2">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-gray-600 font-medium">DELIVERY</p>
              <p className="text-xs text-gray-700 line-clamp-2">
                {shipment.delivery_address || 'N/A'}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex gap-2 items-center text-xs text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(shipment.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t-2 border-gray-100 flex gap-2">
          {shipment.status !== 'delivered' ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShipment(shipment);
                  setShowDispatchModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105"
              >
                <Send className="w-4 h-4" />
                Dispatch
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShipment(shipment);
                  setShowDeliveryTrackingModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition"
                title="View tracking"
              >
                <Eye className="w-4 h-4" />
                Track
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 border-2 border-emerald-300 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Delivered</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShipment(shipment);
                  setShowDeliveryTrackingModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition"
                title="View tracking & delivery info"
              >
                <Eye className="w-4 h-4" />
                View Info
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // ============ TABLE ROW ============
  const ShipmentRow = ({ shipment }) => {
    const isSelected = selectedShipments.includes(shipment.id);
    const statusColors = getStatusColor(shipment.status);

    return (
      <tr className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-100' : ''}`}>
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedShipments([...selectedShipments, shipment.id]);
              } else {
                setSelectedShipments(selectedShipments.filter(id => id !== shipment.id));
              }
            }}
            className="w-5 h-5 rounded border-2 border-gray-300 cursor-pointer"
          />
        </td>
        <td className="px-6 py-4">
          <div className="font-bold text-gray-900">{shipment.shipment_number}</div>
          <div className="text-xs text-gray-500 mt-1 font-mono">{shipment.tracking_number}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-gray-900">{shipment.salesOrder?.customer?.name || 'N/A'}</div>
          <div className="text-xs text-gray-500">{shipment.salesOrder?.customer?.email || 'N/A'}</div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-700">
          <div className="flex gap-2 items-center">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="line-clamp-1">{shipment.delivery_address?.substring(0, 40) || 'N/A'}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusColors.badge}`}>
            {shipment.status?.replace('_', ' ').toUpperCase()}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {new Date(shipment.created_at).toLocaleDateString()}
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            {shipment.status !== 'delivered' && (
              <button
                onClick={() => {
                  setSelectedShipment(shipment);
                  setShowDispatchModal(true);
                }}
                className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition hover:scale-110 transform"
                title="Dispatch"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                setSelectedShipment(shipment);
                setShowDeliveryTrackingModal(true);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition hover:scale-110 transform"
              title={shipment.status === 'delivered' ? "View delivery info & tracking" : "Track"}
            >
              <Eye className="w-4 h-4" />
            </button>
            {shipment.status === 'delivered' && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Delivered
              </span>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // ============ DISPATCH MODAL ============
  const DispatchModal = ({ shipment, onClose, onDispatch }) => {
    const [formData, setFormData] = useState({
      courier_agent_id: '',
      tracking_number: '',
      location: 'Warehouse',
      notes: ''
    });

    // Prefill form data when shipment is loaded
    useEffect(() => {
      if (shipment) {
        const prefillData = {
          courier_agent_id: shipment.courier_agent_id || '',
          tracking_number: shipment.tracking_number || '',
          location: shipment.courier_company || 'Warehouse',
          notes: shipment.special_instructions || ''
        };

        // If no tracking number but have order ID, generate one
        if (!prefillData.tracking_number && shipment.sales_order_id) {
          const timestamp = Date.now().toString().slice(-6);
          const orderNum = shipment.sales_order_id;
          prefillData.tracking_number = `TRK-${orderNum}-${timestamp}`;
        }

        setFormData(prefillData);
      }
    }, [shipment]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.courier_agent_id || !formData.tracking_number) {
        toast.error('Please fill in all required fields');
        return;
      }
      // Pass shipment object as third parameter to ensure correct status data
      onDispatch(shipment.id, formData, shipment);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold">Dispatch Shipment</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-blue-100 text-sm">{shipment.shipment_number}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Shipment Summary */}
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
              <p className="text-xs font-bold text-blue-900 uppercase">Shipment Summary</p>
              <div className="space-y-1 mt-2 text-sm text-blue-800">
                <p>📦 <span className="font-semibold">{shipment.salesOrder?.customer?.name}</span></p>
                <p>📍 {(shipment.shipping_address || shipment.delivery_address)?.substring(0, 50)}...</p>
                {shipment.courier_company && (
                  <p>🚚 <span className="font-semibold text-blue-900">{shipment.courier_company}</span></p>
                )}
              </div>
            </div>

            {/* Courier Agent */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Courier Agent *
                {shipment.courier_agent_id && (
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    Prefilled from Order
                  </span>
                )}
              </label>
              <select
                value={formData.courier_agent_id}
                onChange={(e) => setFormData({ ...formData, courier_agent_id: e.target.value })}
                required
                className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none bg-white hover:border-gray-300 transition ${shipment.courier_agent_id ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
              >
                <option value="">Select a Courier Agent...</option>
                {courierAgents.length > 0 ? (
                  courierAgents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.agent_name} ({agent.courier_company})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No agents available</option>
                )}
              </select>
            </div>

            {/* Tracking Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Copy className="w-4 h-4 text-blue-600" />
                Tracking Number *
                {shipment.tracking_number && (
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    From Shipment
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.tracking_number}
                onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value.toUpperCase() })}
                required
                placeholder="e.g., TRK123456789"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none hover:border-gray-300 transition font-mono ${shipment.tracking_number ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
              />
            </div>

            {/* Dispatch Location */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Dispatch Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Main Warehouse"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none hover:border-gray-300 transition"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any special instructions..."
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none hover:border-gray-300 transition"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <Send className="w-4 h-4" />
                Dispatch Now
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ============ DELIVERY TRACKING MODAL ============
  const DeliveryTrackingModal = ({ shipment, onClose }) => {
    const currentStatusIndex = deliveryStages.findIndex(s => s.key === shipment?.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold">Delivery Status</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-purple-100 text-sm">{shipment?.shipment_number}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Status Timeline */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-6 uppercase">Delivery Progress</p>
              <div className="flex items-center gap-3 flex-wrap">
                {deliveryStages.map((stage, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const StageIcon = stage.icon;

                  return (
                    <div key={stage.key} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 transform ${isCompleted
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-110'
                              : isCurrent
                                ? 'bg-blue-500 text-white shadow-lg scale-110 animate-pulse'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                          <StageIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-gray-700 mt-2 text-center whitespace-nowrap">{stage.label}</p>
                      </div>
                      {index < deliveryStages.length - 1 && (
                        <div className={`w-8 h-1 mx-2 rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipment Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                <p className="text-xs font-bold text-blue-900 uppercase">Tracking</p>
                <p className="text-sm font-mono font-bold text-blue-800 mt-2 break-all">{shipment?.tracking_number || 'N/A'}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
                <p className="text-xs font-bold text-purple-900 uppercase">Courier</p>
                <p className="text-sm font-bold text-purple-800 mt-2">{shipment?.courier_company || 'N/A'}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
                <p className="text-xs font-bold text-green-900 uppercase">Expected Delivery</p>
                <p className="text-sm font-bold text-green-800 mt-2">
                  {shipment?.expected_delivery_date ? new Date(shipment.expected_delivery_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-200">
                <p className="text-xs font-bold text-orange-900 uppercase">Customer</p>
                <p className="text-sm font-bold text-orange-800 mt-2">{shipment?.salesOrder?.customer?.name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading shipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">🚚 Shipment Dispatch</h1>
            <p className="text-gray-600">Manage, dispatch and track all your shipments</p>
          </div>
          <button
            onClick={fetchShipments}
            className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold transition transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="from-amber-500 to-amber-600" />
          <StatCard label="Dispatched" value={stats.dispatched} icon={Send} color="from-blue-500 to-blue-600" />
          <StatCard label="In Transit" value={stats.inTransit} icon={Truck} color="from-purple-500 to-purple-600" />
          <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle} color="from-emerald-500 to-emerald-600" />
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-lg text-gray-900">Filters & Actions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Shipment, tracking..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none hover:border-gray-300 transition"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none hover:border-gray-300 transition"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="dispatched">Dispatched</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Courier Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Courier</label>
              <select
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none hover:border-gray-300 transition"
              >
                <option value="">All Couriers</option>
                {courierAgents.map(courier => (
                  <option key={courier.id} value={courier.id}>
                    {courier.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">View</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-2.5 rounded-lg font-bold text-sm transition transform hover:scale-105 flex items-center justify-center gap-1 ${viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  title="Grid View"
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden md:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-3 py-2.5 rounded-lg font-bold text-sm transition transform hover:scale-105 flex items-center justify-center gap-1 ${viewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden md:inline">Table</span>
                </button>
              </div>
            </div>

            {/* Bulk Dispatch */}
            <div className="flex items-end">
              {(() => {
                const dispatchableCount = selectedShipments.filter(shipmentId => {
                  const shipment = shipments.find(s => s.id === shipmentId);
                  return shipment && shipment.status !== 'delivered';
                }).length;

                const deliveredCount = selectedShipments.length - dispatchableCount;

                return (
                  <>
                    <button
                      onClick={handleBulkDispatch}
                      disabled={selectedShipments.length === 0 || dispatchableCount === 0}
                      className={`w-full px-4 py-2.5 font-bold rounded-lg transition flex items-center justify-center gap-2 transform hover:scale-105 text-sm md:text-base ${dispatchableCount > 0
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:from-emerald-600 hover:to-emerald-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      title={deliveredCount > 0 ? `${deliveredCount} delivered shipments cannot be dispatched` : ''}
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>
                        Dispatch {dispatchableCount > 0 ? `(${dispatchableCount}${deliveredCount > 0 ? ` of ${selectedShipments.length}` : ''})` : ''}
                      </span>
                    </button>
                    {deliveredCount > 0 && (
                      <div className="ml-2 px-3 py-2.5 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs md:text-sm flex items-center gap-1 whitespace-nowrap">
                        <CheckCircle className="w-4 h-4" />
                        <span>{deliveredCount} delivered</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {shipments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg">No shipments found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or create a new shipment</p>
          </div>
        ) : viewMode === 'grid' ? (
          // ============ GRID VIEW ============
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shipments.map(shipment => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        ) : (
          // ============ TABLE VIEW ============
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedShipments.length === shipments.length && shipments.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedShipments(shipments.map(s => s.id));
                          } else {
                            setSelectedShipments([]);
                          }
                        }}
                        className="w-5 h-5 rounded border-2 border-gray-300 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Shipment</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Delivery Address</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map(shipment => (
                    <ShipmentRow key={shipment.id} shipment={shipment} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDispatchModal && selectedShipment && (
        <DispatchModal
          shipment={selectedShipment}
          onClose={() => {
            setShowDispatchModal(false);
            setSelectedShipment(null);
          }}
          onDispatch={handleDispatchShipment}
        />
      )}
      {showDeliveryTrackingModal && selectedShipment && (
        <DeliveryTrackingModal
          shipment={selectedShipment}
          onClose={() => {
            setShowDeliveryTrackingModal(false);
            setSelectedShipment(null);
          }}
        />
      )}
    </div>
  );
};

export default ShipmentDispatchPage;