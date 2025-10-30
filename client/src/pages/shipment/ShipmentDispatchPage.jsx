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
  ChevronDown,
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

// Define all available columns with their properties
const AVAILABLE_COLUMNS = [
  { id: 'checkbox', label: 'Select', defaultVisible: true, alwaysVisible: true },
  { id: 'shipment_number', label: 'Shipment Number', defaultVisible: true, alwaysVisible: true },
  { id: 'customer', label: 'Customer', defaultVisible: true },
  { id: 'delivery_address', label: 'Delivery Address', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'date', label: 'Date', defaultVisible: true },
  { id: 'tracking_number', label: 'Tracking Number', defaultVisible: false },
  { id: 'courier_partner', label: 'Courier Partner', defaultVisible: false },
  { id: 'location', label: 'Current Location', defaultVisible: false },
  { id: 'actions', label: 'Actions', defaultVisible: true, alwaysVisible: true }
];

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
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [expandedDeliveredCards, setExpandedDeliveredCards] = useState(new Set()); // Track which delivered cards are expanded
  const [stats, setStats] = useState({
    pending: 0,
    dispatched: 0,
    inTransit: 0,
    delivered: 0
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('shipmentDispatchVisibleColumns');
    if (saved) {
      return JSON.parse(saved);
    }
    return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
  });

  const deliveryStages = [
    { key: 'pending', label: 'Pending', color: 'amber', icon: Clock },
    { key: 'dispatched', label: 'Dispatched', color: 'blue', icon: Send },
    { key: 'in_transit', label: 'In Transit', color: 'purple', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', color: 'orange', icon: Navigation },
    { key: 'delivered', label: 'Delivered', color: 'emerald', icon: CheckCircle }
  ];

  // Initial load and auto-refresh every 15 seconds
  useEffect(() => {
    // Initial fetch
    const initialLoad = async () => {
      await fetchShipments();
      await fetchCourierAgents();
      await fetchStats();
    };
    
    initialLoad();

    // Auto-refresh interval (15 seconds for real-time updates)
    const refreshInterval = setInterval(() => {
      fetchShipments();
      fetchStats();
    }, 15000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Refetch when filters change (without auto-refresh during filter operations)
  useEffect(() => {
    if (searchTerm !== '' || statusFilter !== '' || courierFilter !== '') {
      fetchShipments();
    }
  }, [searchTerm, statusFilter, courierFilter]);

  // Column visibility functions
  const isColumnVisible = (columnId) => {
    return visibleColumns.includes(columnId);
  };

  const toggleColumn = (columnId) => {
    const column = AVAILABLE_COLUMNS.find(col => col.id === columnId);
    if (column?.alwaysVisible) return; // Don't toggle always-visible columns
    
    setVisibleColumns(prev => {
      const newColumns = prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId];
      localStorage.setItem('shipmentDispatchVisibleColumns', JSON.stringify(newColumns));
      return newColumns;
    });
  };

  const resetColumns = () => {
    const defaultCols = AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
    setVisibleColumns(defaultCols);
    localStorage.setItem('shipmentDispatchVisibleColumns', JSON.stringify(defaultCols));
  };

  const showAllColumns = () => {
    const allCols = AVAILABLE_COLUMNS.map(col => col.id);
    setVisibleColumns(allCols);
    localStorage.setItem('shipmentDispatchVisibleColumns', JSON.stringify(allCols));
  };

  const fetchShipments = async () => {
    try {
      setRefreshing(true);
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
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      // Fetch the latest shipment data to avoid stale status
      const freshResponse = await api.get(`/shipments/${shipmentId}`);
      const freshShipment = freshResponse.data.shipment || freshResponse.data;
      
      if (!freshShipment) {
        toast.error('Shipment not found');
        return;
      }

      // Determine the correct status based on CURRENT shipment status from backend
      let targetStatus = 'shipped'; // Default for ready_to_ship
      
      const currentStatus = freshShipment.status?.trim().toLowerCase();
      
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
        toast.warn(`Current status: ${freshShipment.status}. Please check allowed transitions.`);
        return;
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

  const getNextStatusOptions = (currentStatus) => {
    // Map current status to available next statuses
    const statusMap = {
      'preparing': ['packed', 'ready_to_ship'],
      'packed': ['ready_to_ship'],
      'ready_to_ship': ['shipped', 'dispatched'],
      'shipped': ['in_transit'],
      'dispatched': ['in_transit'],
      'in_transit': ['out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'failed_delivery': ['pending'],
      'returned': ['pending'],
      'cancelled': []
    };
    return statusMap[currentStatus] || [];
  };

  const handleQuickStatusUpdate = async (shipmentId, newStatus) => {
    try {
      await api.patch(`/shipments/${shipmentId}/status`, {
        status: newStatus
      });
      toast.success(`Status updated to ${newStatus.replace('_', ' ')} ✓`);
      fetchShipments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
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

  // Toggle expanded state for delivered cards
  const toggleExpandedDeliveredCard = (shipmentId) => {
    const newSet = new Set(expandedDeliveredCards);
    if (newSet.has(shipmentId)) {
      newSet.delete(shipmentId);
    } else {
      newSet.add(shipmentId);
    }
    setExpandedDeliveredCards(newSet);
  };

  // ============ STAT CARD ============
  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-4 text-white shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{value}</span>
          </div>
        </div>
        <p className="text-xs font-medium opacity-90">{label}</p>
      </div>
    </div>
  );

  // ============ SHIPMENT CARD (Grid View) ============
  const ShipmentCard = ({ shipment }) => {
    const isSelected = selectedShipments.includes(shipment.id);
    const statusColors = getStatusColor(shipment.status);
    const StatusIcon = getStatusIcon(shipment.status);

    return (
      <div
        className={`relative rounded-lg border-2 transition-all duration-300 cursor-pointer group ${isSelected
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
            : `border-gray-200 bg-white hover:border-blue-400 hover:shadow-md ${statusColors.bg}`
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
        <div className="absolute top-3 right-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => { }}
            className="w-4 h-4 rounded border-2 border-gray-300 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Header */}
        <div className={`p-3 border-b ${statusColors.border}`}>
          <div className="flex items-start justify-between gap-2 pr-6">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">{shipment.shipment_number}</h3>
              <p className="text-xs text-gray-500 font-mono truncate">{shipment.tracking_number}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Status Badge and Quick Update */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusIcon className="w-3.5 h-3.5" />
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors.badge}`}>
                {shipment.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            {/* Quick Status Update Dropdown */}
            {getNextStatusOptions(shipment.status).length > 0 && (
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleQuickStatusUpdate(shipment.id, e.target.value);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer bg-white hover:bg-gray-50"
              >
                <option value="">Update Status...</option>
                {getNextStatusOptions(shipment.status).map(status => (
                  <option key={status} value={status}>
                    → {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-600 font-medium">CUSTOMER</p>
            <p className="text-xs font-semibold text-gray-900 truncate">
              {shipment.salesOrder?.customer?.name || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 truncate">{shipment.salesOrder?.customer?.email || 'N/A'}</p>
          </div>

          {/* Delivery Address */}
          <div className="flex gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-gray-600 font-medium">DELIVERY</p>
              <p className="text-xs text-gray-700 line-clamp-2">
                {shipment.delivery_address || 'N/A'}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex gap-2 items-center text-xs text-gray-600">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(shipment.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-2.5 border-t border-gray-100 flex gap-1.5">
          {shipment.status !== 'delivered' ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShipment(shipment);
                  setShowDispatchModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded hover:from-blue-700 hover:to-indigo-700 transition"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShipment(shipment);
                  setShowDeliveryTrackingModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-50 transition"
                title="View tracking"
              >
                <Eye className="w-3.5 h-3.5" />
                Track
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-emerald-50 border border-emerald-300 rounded">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">Delivered</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShipment(shipment);
                  setShowDeliveryTrackingModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-50 transition"
                title="View tracking & delivery info"
              >
                <Eye className="w-3.5 h-3.5" />
                View Info
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // ============ COLLAPSIBLE SHIPMENT CARD (For Delivered Orders) ============
  const CollapsibleShipmentCard = ({ shipment }) => {
    const isExpanded = expandedDeliveredCards.has(shipment.id);
    const isSelected = selectedShipments.includes(shipment.id);
    const statusColors = getStatusColor(shipment.status);
    const StatusIcon = getStatusIcon(shipment.status);

    return (
      <div
        className={`relative rounded-lg border-2 transition-all duration-300 ${
          isExpanded
            ? 'border-emerald-500 bg-white shadow-md'
            : 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:shadow-sm'
        }`}
      >
        {/* Collapsed Header - Always Visible */}
        <button
          onClick={() => toggleExpandedDeliveredCard(shipment.id)}
          className="w-full p-3 flex items-center justify-between hover:bg-emerald-100 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1 text-left">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                if (e.target.checked) {
                  setSelectedShipments([...selectedShipments, shipment.id]);
                } else {
                  setSelectedShipments(
                    selectedShipments.filter(id => id !== shipment.id)
                  );
                }
              }}
              className="w-4 h-4 rounded border-2 border-gray-300 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Summary Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-xs truncate">
                {shipment.shipment_number}
              </h3>
              <p className="text-xs text-gray-600 truncate">
                {shipment.salesOrder?.customer?.name || 'N/A'}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <StatusIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-800 whitespace-nowrap">
                {shipment.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <ChevronDown
            className={`w-4 h-4 text-emerald-600 transition-transform duration-300 flex-shrink-0 ml-2 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-emerald-200">
            {/* Header */}
            <div className="p-3 border-b border-emerald-200 bg-emerald-50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm">
                    {shipment.shipment_number}
                  </h3>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {shipment.tracking_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
              {/* Quick Status Update Dropdown */}
              {getNextStatusOptions(shipment.status).length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleQuickStatusUpdate(shipment.id, e.target.value);
                    }
                  }}
                  className="w-full px-2 py-1.5 border border-emerald-300 rounded text-xs font-medium focus:outline-none focus:border-emerald-600 cursor-pointer bg-white hover:bg-gray-50"
                >
                  <option value="">Update Status...</option>
                  {getNextStatusOptions(shipment.status).map(status => (
                    <option key={status} value={status}>
                      → {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              )}

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-600 font-medium">CUSTOMER</p>
                <p className="text-xs font-semibold text-gray-900">
                  {shipment.salesOrder?.customer?.name || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  {shipment.salesOrder?.customer?.email || 'N/A'}
                </p>
              </div>

              {/* Delivery Address */}
              <div className="flex gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-medium">DELIVERY</p>
                  <p className="text-xs text-gray-700 line-clamp-2">
                    {shipment.delivery_address || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex gap-2 items-center text-xs text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(shipment.created_at).toLocaleDateString()}</span>
              </div>

              {/* Tracking Number */}
              {shipment.tracking_number && (
                <div className="bg-emerald-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-600 font-medium">TRACKING</p>
                  <p className="text-xs font-mono text-gray-900">
                    {shipment.tracking_number}
                  </p>
                </div>
              )}

              {/* Courier Info */}
              {shipment.courierAgent && (
                <div className="bg-blue-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-600 font-medium">COURIER</p>
                  <p className="text-xs font-semibold text-gray-900">
                    {shipment.courierAgent.company_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {shipment.courierAgent.contact_person_name}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-2.5 border-t border-emerald-200 bg-emerald-50 flex gap-1.5">
              <div className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-emerald-300 rounded">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">Delivered</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShipment(shipment);
                  setShowDeliveryTrackingModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-50 transition"
                title="View tracking & delivery info"
              >
                <Eye className="w-3.5 h-3.5" />
                View Info
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============ TABLE ROW (Enhanced) ============
  const ShipmentRow = ({ shipment }) => {
    const isSelected = selectedShipments.includes(shipment.id);
    const statusColors = getStatusColor(shipment.status);

    return (
      <tr className={`border-b border-gray-200 transition-all duration-300 ${isSelected ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100' : 'hover:bg-blue-50'}`}>
        {isColumnVisible('checkbox') && (
          <td className="px-4 py-3">
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
              className="w-4 h-4 rounded border-2 border-gray-300 cursor-pointer"
            />
          </td>
        )}
        {isColumnVisible('shipment_number') && (
          <td className="px-4 py-3">
            <div className="font-bold text-gray-900 text-sm">{shipment.shipment_number}</div>
            <div className="text-xs text-gray-500 font-mono">{shipment.tracking_number}</div>
          </td>
        )}
        {isColumnVisible('customer') && (
          <td className="px-4 py-3">
            <div className="text-xs font-medium text-gray-900">{shipment.salesOrder?.customer?.name || 'N/A'}</div>
            <div className="text-xs text-gray-500">{shipment.salesOrder?.customer?.email || 'N/A'}</div>
          </td>
        )}
        {isColumnVisible('delivery_address') && (
          <td className="px-4 py-3 text-xs text-gray-700">
            <div className="flex gap-1.5 items-center">
              <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="line-clamp-1">{shipment.delivery_address?.substring(0, 40) || 'N/A'}</span>
            </div>
          </td>
        )}
        {isColumnVisible('status') && (
          <td className="px-4 py-3">
            <div className="space-y-1.5">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors.badge} block`}>
                {shipment.status?.replace('_', ' ').toUpperCase()}
              </span>
              {getNextStatusOptions(shipment.status).length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleQuickStatusUpdate(shipment.id, e.target.value);
                    }
                  }}
                  className="w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer bg-white"
                >
                  <option value="">Update...</option>
                  {getNextStatusOptions(shipment.status).map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </td>
        )}
        {isColumnVisible('date') && (
          <td className="px-4 py-3 text-xs text-gray-600">
            {new Date(shipment.created_at).toLocaleDateString()}
          </td>
        )}
        {isColumnVisible('tracking_number') && (
          <td className="px-4 py-3 text-xs text-gray-600 font-mono">
            {shipment.tracking_number || 'N/A'}
          </td>
        )}
        {isColumnVisible('courier_partner') && (
          <td className="px-4 py-3 text-xs text-gray-700">
            {shipment.courierAgent?.company_name || 'N/A'}
          </td>
        )}
        {isColumnVisible('location') && (
          <td className="px-4 py-3 text-xs text-gray-700">
            {shipment.current_location || 'N/A'}
          </td>
        )}
        {isColumnVisible('actions') && (
          <td className="px-4 py-3">
            <div className="flex gap-1">
              {shipment.status !== 'delivered' && (
                <button
                  onClick={() => {
                    setSelectedShipment(shipment);
                    setShowDispatchModal(true);
                  }}
                  className="p-1.5 hover:bg-blue-100 rounded text-blue-600 transition"
                  title="Dispatch"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedShipment(shipment);
                  setShowDeliveryTrackingModal(true);
                }}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition"
                title={shipment.status === 'delivered' ? "View delivery info & tracking" : "Track"}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              {shipment.status === 'delivered' && (
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" />
                  Delivered
                </span>
              )}
            </div>
          </td>
        )}
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

  // Format last refresh time
  const formatRefreshTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-3 md:p-4">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl shadow-md p-4 md:p-5 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Truck className="w-6 h-6 md:w-7 md:h-7" />
                <h1 className="text-2xl md:text-3xl font-bold">Shipment Dispatch</h1>
              </div>
              <p className="text-blue-100 text-xs md:text-sm">Manage and track shipments in real-time</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center text-sm">
              <div className="bg-white bg-opacity-20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <p className="text-xs text-blue-100 uppercase font-semibold">Updated</p>
                <p className="text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRefreshTime(lastRefresh)}
                </p>
              </div>
              <button
                onClick={() => {
                  fetchShipments();
                  fetchStats();
                }}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 font-bold rounded-lg hover:bg-blue-50 transition text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-xs">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="from-amber-500 to-amber-600" />
          <StatCard label="Dispatched" value={stats.dispatched} icon={Send} color="from-blue-500 to-blue-600" />
          <StatCard label="In Transit" value={stats.inTransit} icon={Truck} color="from-purple-500 to-purple-600" />
          <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle} color="from-emerald-500 to-emerald-600" />
        </div>

        {/* Filters Section (Compact) */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 space-y-3 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Filter className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-base text-gray-900">Filters & Actions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">🔍 Search</label>
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
                <input
                  type="text"
                  placeholder="Shipment, tracking..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none hover:border-blue-300 transition bg-white focus:bg-blue-50 text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">📊 Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none hover:border-blue-300 transition bg-white focus:bg-blue-50 appearance-none cursor-pointer font-medium text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="dispatched">📤 Dispatched</option>
                <option value="in_transit">🚚 In Transit</option>
                <option value="delivered">✅ Delivered</option>
              </select>
            </div>

            {/* Courier Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">🚛 Courier</label>
              <select
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none hover:border-blue-300 transition bg-white focus:bg-blue-50 appearance-none cursor-pointer font-medium text-sm"
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
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">👁️ View</label>
              <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-2.5 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${viewMode === 'grid'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white'
                    }`}
                  title="Grid View"
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-2.5 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${viewMode === 'table'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white'
                    }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Table</span>
                </button>
              </div>
            </div>

            {/* Column Visibility Toggle (Only in Table View) */}
            {viewMode === 'table' && (
              <div className="relative column-menu-container">
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">👁️ Columns</label>
                <button
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors font-bold text-xs w-full justify-center"
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                  <span>Columns</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showColumnMenu ? 'rotate-90' : ''}`} />
                </button>

                {/* Column Menu Dropdown */}
                {showColumnMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-700">Manage Columns</h3>
                        <span className="text-xs text-gray-500">
                          {visibleColumns.length} of {AVAILABLE_COLUMNS.length}
                        </span>
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {AVAILABLE_COLUMNS.map(column => (
                          <label
                            key={column.id}
                            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                              column.alwaysVisible ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isColumnVisible(column.id)}
                              onChange={() => toggleColumn(column.id)}
                              disabled={column.alwaysVisible}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{column.label}</span>
                            {column.alwaysVisible && (
                              <span className="text-xs text-gray-400 ml-auto">(Required)</span>
                            )}
                          </label>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t">
                        <button
                          onClick={showAllColumns}
                          className="flex-1 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors font-semibold"
                        >
                          Show All
                        </button>
                        <button
                          onClick={resetColumns}
                          className="flex-1 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded transition-colors font-semibold"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-600 uppercase">⚡ Actions</label>
                      <button
                        onClick={handleBulkDispatch}
                        disabled={selectedShipments.length === 0 || dispatchableCount === 0}
                        className={`w-full px-3 py-2 font-bold rounded-lg transition flex items-center justify-center gap-1.5 text-xs md:text-sm ${dispatchableCount > 0
                            ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        title={deliveredCount > 0 ? `${deliveredCount} delivered shipments cannot be dispatched` : ''}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>
                          Dispatch{dispatchableCount > 0 ? ` (${dispatchableCount}${deliveredCount > 0 ? `/${selectedShipments.length}` : ''})` : ''}
                        </span>
                      </button>
                    </div>
                    {deliveredCount > 0 && (
                      <div className="ml-1.5 px-2 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs flex items-center gap-0.5 whitespace-nowrap">
                        <CheckCircle className="w-3 h-3" />
                        <span>{deliveredCount}</span>
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
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-gray-100 p-12 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-6">
              <Package className="w-12 h-12 text-blue-600" />
            </div>
            <p className="text-gray-700 font-bold text-lg mb-2">No shipments found</p>
            <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or create a new shipment</p>
            <div className="inline-flex gap-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCourierFilter('');
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          // ============ GRID VIEW WITH COLLAPSIBLE DELIVERED ============
          <div className="space-y-4">
            {/* Active Shipments Grid */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Truck className="w-4.5 h-4.5 text-blue-600" />
                  Active Orders
                </h3>
                <span className="text-xs font-semibold text-gray-600">
                  {shipments.filter(s => s.status !== 'delivered').length} orders
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {shipments.filter(s => s.status !== 'delivered').map(shipment => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))}
              </div>
              {shipments.filter(s => s.status !== 'delivered').length === 0 && (
                <div className="text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-600 font-medium text-sm">No active shipments</p>
                </div>
              )}
            </div>

            {/* Delivered Orders */}
            {shipments.filter(s => s.status === 'delivered').length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {shipments.filter(s => s.status === 'delivered').map(shipment => (
                  <CollapsibleShipmentCard key={shipment.id} shipment={shipment} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // ============ TABLE VIEW ============
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 border-b border-blue-700">
                  <tr>
                    {isColumnVisible('checkbox') && (
                      <th className="px-4 py-3 text-left">
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
                          className="w-4 h-4 rounded border-2 border-gray-300 cursor-pointer"
                        />
                      </th>
                    )}
                    {isColumnVisible('shipment_number') && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Shipment</th>}
                    {isColumnVisible('customer') && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Customer</th>}
                    {isColumnVisible('delivery_address') && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Delivery</th>}
                    {isColumnVisible('status') && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Status</th>}
                    {isColumnVisible('date') && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Date</th>}
                    {isColumnVisible('tracking_number') && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Tracking</th>}
                    {isColumnVisible('courier_partner') && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Courier</th>}
                    {isColumnVisible('location') && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Location</th>}
                    {isColumnVisible('actions') && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Actions</th>}
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