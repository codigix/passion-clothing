import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  Plus,
  Search,
  Eye,
  Edit,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  Phone,
  MapPin,
  Building,
  Activity,
  Clock,
  Trash2,
  ExternalLink,
  RefreshCw,
  Filter,
  Package,
  Users,
  BarChart3,
  Zap,
  X,
  ChevronRight,
  Star,
  Box,
  Zap as ZapIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import ShipmentDetailsDialog from '../../components/dialogs/ShipmentDetailsDialog';
import MinimalStatCard from '../../components/common/MinimalStatCard';

const ShipmentDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const incomingOrdersRefreshInterval = useRef(null);
  
  // State for data
  const [stats, setStats] = useState({
    totalShipments: 0,
    inTransit: 0,
    delivered: 0,
    delayed: 0,
    onTimeDeliveryRate: 0,
    avgDeliveryTime: 0
  });
  const [shipments, setShipments] = useState([]);
  const [courierPartners, setCourierPartners] = useState([]);
  const [courierAgents, setCourierAgents] = useState([]);
  const [deliveryTracking, setDeliveryTracking] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [autoRefreshIncomingOrders, setAutoRefreshIncomingOrders] = useState(true);
  
  // State for dialogs and modals
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editShipmentOpen, setEditShipmentOpen] = useState(false);
  const [trackingTimelineOpen, setTrackingTimelineOpen] = useState(false);
  const [courierDetailsOpen, setCourierDetailsOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courierFilter, setCourierFilter] = useState('');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/shipments/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  // Fetch shipments
  const fetchShipments = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (courierFilter) params.append('courier_partner_id', courierFilter);
      params.append('limit', '20');

      const response = await api.get(`/shipments?${params.toString()}`);
      setShipments(response.data.shipments);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
      toast.error('Failed to load shipments');
    }
  };

  // Fetch courier partners
  const fetchCourierPartners = async () => {
    try {
      const response = await api.get('/courier-partners?is_active=true');
      setCourierPartners(response.data.courierPartners);
    } catch (error) {
      console.error('Failed to fetch courier partners:', error);
      toast.error('Failed to load courier partners');
    }
  };

  // Fetch courier agents
  const fetchCourierAgents = async () => {
    try {
      const response = await api.get('/courier-agents?is_active=true');
      setCourierAgents(response.data.agents || []);
    } catch (error) {
      console.error('Failed to fetch courier agents:', error);
      toast.error('Failed to load courier agents');
    }
  };

  // Fetch delivery tracking
  const fetchDeliveryTracking = async () => {
    try {
      const response = await api.get('/shipments?status=in_transit,out_for_delivery&limit=10');
      const trackingData = response.data.shipments.map(shipment => ({
        shipmentNo: shipment.shipment_number,
        status: shipment.status,
        location: shipment.trackingUpdates?.[0]?.location || 'Unknown',
        timestamp: shipment.trackingUpdates?.[0]?.timestamp || shipment.last_status_update,
        remarks: shipment.trackingUpdates?.[0]?.description || 'No updates available'
      }));
      setDeliveryTracking(trackingData);
    } catch (error) {
      console.error('Failed to fetch delivery tracking:', error);
      toast.error('Failed to load delivery tracking');
    }
  };

  // Fetch incoming orders from manufacturing with live status
  const fetchIncomingOrders = async () => {
    try {
      const response = await api.get('/shipments/orders/incoming?status=ready_for_shipment&exclude_delivered=true');
      setIncomingOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching incoming orders:', error);
    }
  };

  // Setup auto-refresh for incoming orders
  useEffect(() => {
    if (autoRefreshIncomingOrders && tabValue === 0) {
      // Fetch immediately
      fetchIncomingOrders();
      
      // Setup interval to refresh every 10 seconds when on Incoming Orders tab
      incomingOrdersRefreshInterval.current = setInterval(() => {
        fetchIncomingOrders();
      }, 10000); // 10 seconds

      return () => {
        if (incomingOrdersRefreshInterval.current) {
          clearInterval(incomingOrdersRefreshInterval.current);
        }
      };
    }
  }, [autoRefreshIncomingOrders, tabValue]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchShipments(),
        fetchCourierPartners(),
        fetchCourierAgents(),
        fetchDeliveryTracking(),
        fetchIncomingOrders()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Refresh data when filters change
  useEffect(() => {
    if (!loading) {
      fetchShipments();
    }
  }, [searchTerm, statusFilter, courierFilter]);

  // Action handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardData(),
      fetchShipments(),
      fetchCourierPartners(),
      fetchCourierAgents(),
      fetchDeliveryTracking(),
      fetchIncomingOrders()
    ]);
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('format', 'csv');

      const response = await api.get(`/shipments/export/data?${params.toString()}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shipments_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Shipments data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export shipments data');
    }
  };

  const handleViewTracking = (shipment) => {
    navigate(`/shipment/tracking/${shipment.tracking_number || shipment.shipment_number}`);
  };

  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment);
    setViewDetailsOpen(true);
  };

  const handleEditShipment = (shipment) => {
    setSelectedShipment(shipment);
    setEditShipmentOpen(true);
  };

  const handleDeleteShipment = async (shipmentId) => {
    if (!window.confirm('Are you sure you want to delete this shipment? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/shipments/${shipmentId}`);
      toast.success('Shipment deleted successfully');
      fetchShipments();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete shipment');
    }
  };

  const handleTrackingClick = (trackingNumber) => {
    if (trackingNumber) {
      navigate(`/shipment/tracking/${trackingNumber}`);
    } else {
      toast.error('No tracking number available');
    }
  };

  const handleTimelineView = (shipment) => {
    setSelectedShipment(shipment);
    setTrackingTimelineOpen(true);
  };

  const handleCourierDetails = (courier) => {
    setSelectedCourier(courier);
    setCourierDetailsOpen(true);
  };

  const handleCreateShipmentWithCourier = (courier) => {
    navigate('/shipment/create', { state: { selectedCourier: courier } });
  };

  const handleCreateShipment = (order) => {
    navigate('/shipment/create', { state: { orderFromManufacturing: order } });
  };

  const handleViewOrderDetails = (order) => {
    setSelectedShipment(order);
    setViewDetailsOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      preparing: 'bg-amber-100 text-amber-700 border-amber-200',
      packed: 'bg-blue-100 text-blue-700 border-blue-200',
      ready_to_ship: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      shipped: 'bg-sky-100 text-sky-700 border-sky-200',
      in_transit: 'bg-blue-100 text-blue-700 border-blue-200',
      out_for_delivery: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      failed_delivery: 'bg-rose-100 text-rose-700 border-rose-200',
      returned: 'bg-rose-100 text-rose-700 border-rose-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Calculate delivery time in days - works for both delivered and in-progress
  const calculateDeliveryTime = (createdAt, deliveredAt, status) => {
    if (!createdAt) {
      return 'N/A';
    }
    
    const created = new Date(createdAt);
    const endDate = status === 'delivered' && deliveredAt ? new Date(deliveredAt) : new Date();
    const diffMs = endDate - created;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (status === 'delivered') {
      return `${diffDays} days`;
    } else {
      return `${diffDays} days (In progress)`;
    }
  };

  const TabPanel = ({ children, value, index }) => {
    if (value !== index) {
      return null;
    }
    return <div className="p-6">{children}</div>;
  };

  const tabs = [
    { name: 'Incoming Orders', icon: Box, color: 'from-blue-500 to-blue-600' },
    { name: 'Active Shipments', icon: Truck, color: 'from-emerald-500 to-emerald-600' },
    { name: 'Delivery Tracking', icon: Activity, color: 'from-violet-500 to-violet-600' },
    { name: 'Courier Agents', icon: Users, color: 'from-pink-500 to-pink-600' },
    { name: 'Analytics', icon: BarChart3, color: 'from-indigo-500 to-indigo-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 bg-gray-50 min-h-screen -m-6 p-6">
      {/* Header Section - Redesigned */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 rounded-2xl shadow-2xl p-8 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full -mr-48 -mt-48"></div>
        </div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-400 bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                  <Truck size={28} className="text-blue-300" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-semibold">LOGISTICS MANAGEMENT</p>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2">Shipment & Delivery Dashboard</h1>
              <p className="text-blue-100 text-base leading-relaxed">Real-time tracking, performance analytics, and logistics coordination</p>
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-white bg-opacity-15 hover:bg-opacity-25 rounded-xl transition-all duration-200 text-white border border-white border-opacity-30 backdrop-blur-sm font-medium"
                onClick={() => navigate('/shipment/tracking')}
                title="Track shipments"
              >
                <TrendingUp size={18} />
                <span className="hidden sm:inline">Live Track</span>
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:shadow-xl rounded-xl transition-all duration-200 font-medium"
                onClick={() => navigate('/shipment/create')}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Create</span>
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-white bg-opacity-15 hover:bg-opacity-25 rounded-xl transition-all duration-200 text-white border border-white border-opacity-30 backdrop-blur-sm"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh data"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard 
          title="Total Shipments" 
          value={stats.totalShipments} 
          icon={Truck}
          bgGradient="from-blue-50 to-blue-100"
          iconColor="text-blue-600"
          borderColor="border-blue-200"
          shadow="shadow-lg hover:shadow-xl"
        />
        <StatCard 
          title="In Transit" 
          value={stats.inTransit} 
          icon={Activity}
          bgGradient="from-violet-50 to-violet-100"
          iconColor="text-violet-600"
          borderColor="border-violet-200"
          shadow="shadow-lg hover:shadow-xl"
        />
        <StatCard 
          title="Delivered" 
          value={stats.delivered} 
          icon={CheckCircle}
          bgGradient="from-emerald-50 to-emerald-100"
          iconColor="text-emerald-600"
          borderColor="border-emerald-200"
          shadow="shadow-lg hover:shadow-xl"
        />
        <StatCard 
          title="Delayed" 
          value={stats.delayed} 
          icon={AlertTriangle}
          bgGradient="from-rose-50 to-rose-100"
          iconColor="text-rose-600"
          borderColor="border-rose-200"
          shadow="shadow-lg hover:shadow-xl"
        />
        <StatCard 
          title="On-Time %" 
          value={stats.onTimeDeliveryRate}
          unit="%"
          icon={TrendingUp}
          bgGradient="from-amber-50 to-amber-100"
          iconColor="text-amber-600"
          borderColor="border-amber-200"
          shadow="shadow-lg hover:shadow-xl"
        />
        <StatCard 
          title="Avg. Delivery" 
          value={stats.avgDeliveryTime}
          unit=" days"
          icon={Clock}
          bgGradient="from-indigo-50 to-indigo-100"
          iconColor="text-indigo-600"
          borderColor="border-indigo-200"
          shadow="shadow-lg hover:shadow-xl"
        />
      </div>

      {/* Quick Actions Bar - Enhanced */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <div className="relative group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by shipment, tracking #, customer..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full px-3 py-2.5 border border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-all text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
              onClick={() => navigate('/shipment/bulk-tracking')}
            >
              <Package size={16} />
              <span className="hidden sm:inline">Bulk Track</span>
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full px-3 py-2.5 border border-gray-300 hover:border-violet-400 hover:bg-violet-50 rounded-lg transition-all text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
              onClick={() => navigate('/shipment/performance')}
            >
              <BarChart3 size={16} />
              <span className="hidden sm:inline">Performance</span>
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full px-3 py-2.5 border border-gray-300 hover:border-amber-400 hover:bg-amber-50 rounded-lg transition-all text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
              onClick={() => navigate('/shipment/reports')}
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Reports</span>
            </button>
          </div>
          <div className="md:col-span-1">
            <button 
              className="w-full px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              onClick={handleExport}
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Tabs - Enhanced */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Enhanced Tab Navigation */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white overflow-x-auto">
          <div className="flex">
            {tabs.map((tab, index) => {
              const TabIcon = tab.icon;
              const isActive = tabValue === index;
              return (
                <button
                  key={index}
                  onClick={() => setTabValue(index)}
                  className={`px-6 py-4 text-sm font-semibold border-b-3 transition-all duration-200 flex items-center gap-2 whitespace-nowrap hover:bg-gray-100
                    ${isActive 
                      ? `border-blue-600 text-blue-700 bg-blue-50` 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <TabIcon size={20} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {/* Incoming Orders Tab */}
        <TabPanel value={tabValue} index={0}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Incoming Orders from Manufacturing</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {autoRefreshIncomingOrders && '🔄 Live updates enabled'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutoRefreshIncomingOrders(!autoRefreshIncomingOrders)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    autoRefreshIncomingOrders 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                  title={autoRefreshIncomingOrders ? 'Live updates ON' : 'Live updates OFF'}
                >
                  <RefreshCw size={16} className="inline mr-1" />
                  {autoRefreshIncomingOrders ? 'Live' : 'Manual'}
                </button>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-full font-medium">{incomingOrders.length} orders</span>
              </div>
            </div>
            {incomingOrders.length === 0 ? (
              <EmptyState 
                icon={Box}
                title="No incoming orders"
                description="Orders from manufacturing ready for shipment will appear here"
              />
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {incomingOrders.map((order) => {
                      const canCreateShipment = order.can_create_shipment;
                      const isDispatched = order.is_dispatched;
                      const shipmentStatus = order.shipment_status;
                      
                      return (
                        <tr 
                          key={order.id} 
                          className={`transition-colors ${
                            isDispatched 
                              ? 'bg-blue-50 hover:bg-blue-100' 
                              : 'hover:bg-blue-50'
                          }`}
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900">{order.sales_order_number || order.order_number || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-700">{order.customer_name || order.customer?.name || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-700">{order.product_name || order.garment_specs?.product_type || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-900 font-medium">{order.quantity || 0}</td>
                          <td className="px-4 py-3">
                            {isDispatched ? (
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                  shipmentStatus === 'in_transit' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                  shipmentStatus === 'delivered' ? 'bg-green-100 text-green-700 border border-green-200' :
                                  shipmentStatus === 'out_for_delivery' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                  'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                  {shipmentStatus?.replace(/_/g, ' ').charAt(0).toUpperCase() + shipmentStatus?.slice(1).replace(/_/g, ' ')}
                                </span>
                                <Zap size={14} className="text-amber-500" title="Order dispatched" />
                              </div>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                Ready for Shipment
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{order.last_updated ? new Date(order.last_updated).toLocaleDateString() : new Date(order.updated_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {canCreateShipment && (
                                <ActionButton 
                                  icon={Truck}
                                  color="blue"
                                  onClick={() => handleCreateShipment(order)}
                                  title="Create Shipment"
                                />
                              )}
                              {isDispatched && order.shipment_number && (
                                <ActionButton 
                                  icon={ExternalLink}
                                  color="purple"
                                  onClick={() => navigate(`/shipment/tracking/${order.shipment_tracking}`)}
                                  title={`View Shipment ${order.shipment_number}`}
                                />
                              )}
                              <ActionButton 
                                icon={Eye}
                                color="green"
                                onClick={() => handleViewOrderDetails(order)}
                                title="View Details"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabPanel>

        {/* Active Shipments Tab */}
        <TabPanel value={tabValue} index={1}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Active Shipments</h3>
              <div className="flex gap-2 flex-wrap">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="preparing">Preparing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
                <button
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium text-gray-700"
                  onClick={() => navigate('/shipment/all')}
                >
                  View All
                </button>
              </div>
            </div>

            {shipments.length === 0 ? (
              <EmptyState 
                icon={Truck}
                title="No active shipments"
                description="Create or track shipments from here"
              />
            ) : (
              <div className="overflow-x-auto border-0">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Shipment #</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Order #</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Address</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Courier</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Tracking</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Delivery</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">⏱️ Time Taken</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-blue-100 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {shipments.map((shipment) => {
                      const isDelivered = shipment.status === 'delivered';
                      return (
                        <tr 
                          key={shipment.id} 
                          className={`transition-all duration-200 border-l-4 ${
                            isDelivered 
                              ? 'bg-emerald-50 hover:bg-emerald-100 border-l-emerald-500 hover:shadow-md' 
                              : 'bg-white hover:bg-blue-50 border-l-blue-400 hover:shadow-md'
                          }`}
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900">{shipment.shipment_number || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-700">{shipment.salesOrder?.order_number || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{shipment.salesOrder?.customer?.name || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{shipment.recipient_phone || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-1.5 text-gray-600 text-xs">
                              <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                              <span>{shipment.shipping_address || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{shipment.courierAgent?.name ? `${shipment.courierAgent.name} (${shipment.courierAgent.company_name || 'N/A'})` : shipment.courier_company || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <button
                              className="text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => handleTrackingClick(shipment.tracking_number)}
                            >
                              {shipment.tracking_number || 'Not assigned'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{shipment.expected_delivery_date ? new Date(shipment.expected_delivery_date).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-4 py-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm w-fit ${
                              isDelivered 
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                              <Clock size={16} />
                              <span>
                                {calculateDeliveryTime(shipment.created_at, shipment.delivered_at, shipment.status)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shipment.status)}`}>
                              {(shipment.status || 'unknown').replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-2">
                              
                              {!isDelivered && (
                                <>
                                  <ActionButton 
                                    icon={TrendingUp}
                                    color="blue"
                                    onClick={() => handleViewTracking(shipment)}
                                    title="Track"
                                  />
                                  <ActionButton 
                                    icon={Edit}
                                    color="amber"
                                    onClick={() => handleEditShipment(shipment)}
                                    title="Edit"
                                  />
                                  <ActionButton 
                                    icon={Trash2}
                                    color="red"
                                    onClick={() => handleDeleteShipment(shipment.id)}
                                    title="Delete"
                                  />
                                </>
                              )}
                              <ActionButton 
                                icon={Eye}
                                color="green"
                                onClick={() => handleViewDetails(shipment)}
                                title="View Details"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabPanel>

        {/* Delivery Tracking Tab */}
        <TabPanel value={tabValue} index={2}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Real-time Delivery Tracking</h3>
              <button
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium text-gray-700 flex items-center gap-2 w-full sm:w-auto"
                onClick={() => navigate('/shipment/live-tracking')}
              >
                <Activity size={16} />
                Live Map
              </button>
            </div>

            {deliveryTracking.length === 0 ? (
              <EmptyState 
                icon={Activity}
                title="No active tracking"
                description="In-transit shipments will appear here"
              />
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Shipment #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Update</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remarks</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {deliveryTracking.map((track) => (
                      <tr key={track.shipmentNo} className="hover:bg-violet-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">{track.shipmentNo}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(track.status.toLowerCase().replace(/\s+/g, '_'))}`}>
                            {track.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                            {track.location}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{new Date(track.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs max-w-xs">{track.remarks}</td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            className="inline-flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                            onClick={() => handleTimelineView({ shipment_number: track.shipmentNo })}
                          >
                            <Activity size={16} />
                            Timeline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabPanel>

        {/* Courier Agents Tab */}
        <TabPanel value={tabValue} index={3}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Courier Agents</h3>
                <p className="text-sm text-gray-600 mt-1">Active delivery personnel and performance metrics</p>
              </div>
              <button
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 w-full sm:w-auto font-medium"
                onClick={() => navigate('/admin/courier-agents')}
              >
                <Plus size={16} />
                Add Agent
              </button>
            </div>

            {courierAgents.length === 0 ? (
              <EmptyState 
                icon={Users}
                title="No courier agents"
                description="Add courier agents from the admin panel"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courierAgents.map((agent) => (
                  <CourierAgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={4}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard 
                title="On-Time Delivery Rate"
                value={`${stats.onTimeDeliveryRate}%`}
                icon={TrendingUp}
                color="emerald"
                onClick={() => navigate('/shipment/performance')}
              />
              <AnalyticsCard 
                title="Avg Delivery Time"
                value={`${stats.avgDeliveryTime} days`}
                icon={Clock}
                color="blue"
                onClick={() => navigate('/shipment/analytics')}
              />
              <AnalyticsCard 
                title="Delayed Shipments"
                value={stats.delayed}
                icon={AlertTriangle}
                color="rose"
                onClick={() => navigate('/shipment/issues')}
              />
              <AnalyticsCard 
                title="Success Rate"
                value="98.5%"
                icon={FileText}
                color="indigo"
                onClick={() => navigate('/shipment/reports')}
              />
            </div>
          </div>
        </TabPanel>
      </div>

      {/* Dialogs and Modals */}
      <ShipmentDetailsDialog
        isOpen={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        shipment={selectedShipment}
      />
    </div>
  );
};

// Stat Card Component - Enhanced
const StatCard = ({ title, value, unit = '', icon: Icon, bgGradient, iconColor, borderColor, shadow = '' }) => (
  <div className={`bg-gradient-to-br ${bgGradient} border ${borderColor} rounded-xl p-5 ${shadow} transition-all duration-300 transform hover:scale-105 cursor-pointer`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs text-gray-700 font-bold uppercase tracking-widest mb-3">{title}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {unit && <p className="text-xs text-gray-600 font-medium">{unit}</p>}
        </div>
      </div>
      <div className={`p-3 rounded-lg bg-white bg-opacity-70 ${iconColor} transform hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

// Action Button Component
const ActionButton = ({ icon: Icon, color, onClick, title }) => {
  const colors = {
    blue: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
    green: 'text-green-600 hover:text-green-800 hover:bg-green-50',
    amber: 'text-amber-600 hover:text-amber-800 hover:bg-amber-50',
    red: 'text-red-600 hover:text-red-800 hover:bg-red-50'
  };
  
  return (
    <button
      className={`p-2 rounded-lg transition-colors ${colors[color]}`}
      onClick={onClick}
      title={title}
    >
      <Icon size={16} />
    </button>
  );
};

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="p-4 rounded-full bg-gray-100 mb-4">
      <Icon size={32} className="text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 max-w-md text-center">{description}</p>
  </div>
);

// Courier Card Component
const CourierCard = ({ courier, onDetails, onCreateShipment }) => (
  <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 overflow-hidden group">
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-amber-500 text-white">
          <Building size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{courier.name}</h3>
          <p className="text-xs text-gray-600">{courier.service_areas?.join(', ') || 'Service areas not specified'}</p>
        </div>
      </div>
    </div>
    
    <div className="p-4 space-y-3">
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-amber-500 flex-shrink-0" />
          <span>{courier.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <MailIcon className="text-amber-500 flex-shrink-0" />
          <span className="truncate">{courier.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
        <div className="bg-blue-50 rounded p-2 text-center">
          <p className="text-sm font-bold text-blue-600">{courier.activeShipments || 0}</p>
          <p className="text-xs text-gray-600">Active</p>
        </div>
        <div className="bg-emerald-50 rounded p-2 text-center">
          <p className="text-sm font-bold text-emerald-600">{courier.on_time_delivery_rate || 0}%</p>
          <p className="text-xs text-gray-600">On-Time</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          onClick={onDetails}
        >
          Details
        </button>
        <button 
          className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
          onClick={onCreateShipment}
        >
          Create
        </button>
      </div>
    </div>
  </div>
);

// Courier Agent Card Component
const CourierAgentCard = ({ agent }) => (
  <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 overflow-hidden">
    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 border-b border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 rounded-lg bg-pink-500 text-white">
            <Users size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{agent.agent_name}</h3>
            <p className="text-xs text-gray-600">{agent.agent_id}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${agent.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {agent.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>

    <div className="p-4 space-y-3">
      <div className="space-y-2 text-sm text-gray-600 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <Building size={14} className="text-pink-500 flex-shrink-0" />
          <span>{agent.courier_company}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-pink-500 flex-shrink-0" />
          <span>{agent.phone}</span>
        </div>
        {agent.region && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-pink-500 flex-shrink-0" />
            <span>{agent.region}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 rounded p-2 text-center">
          <p className="text-sm font-bold text-blue-600">{agent.total_shipments || 0}</p>
          <p className="text-xs text-gray-600">Shipments</p>
        </div>
        <div className="bg-green-50 rounded p-2 text-center">
          <p className="text-sm font-bold text-green-600">{agent.on_time_deliveries || 0}</p>
          <p className="text-xs text-gray-600">On-time</p>
        </div>
        <div className="bg-amber-50 rounded p-2 text-center">
          <p className="text-sm font-bold text-amber-600">{parseFloat(agent.performance_rating || 0).toFixed(1)}</p>
          <p className="text-xs text-gray-600">Rating</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.floor(agent.performance_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>
        <span className="text-xs text-gray-600 font-medium">{agent.failed_deliveries || 0} failed</span>
      </div>

      <button className="w-full px-3 py-2 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-sm font-medium">
        View Details
      </button>
    </div>
  </div>
);

// Analytics Card Component
const AnalyticsCard = ({ title, value, icon: Icon, color, onClick }) => {
  const colors = {
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-600',
    blue: 'from-blue-50 to-blue-100 text-blue-600',
    rose: 'from-rose-50 to-rose-100 text-rose-600',
    indigo: 'from-indigo-50 to-indigo-100 text-indigo-600'
  };
  
  return (
    <div 
      onClick={onClick}
      className={`bg-gradient-to-br ${colors[color]} rounded-lg p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
    >
      <Icon size={32} className="mx-auto mb-3 opacity-80" />
      <p className="text-2xl font-bold mb-2">{value}</p>
      <p className="text-sm font-medium opacity-80">{title}</p>
    </div>
  );
};

// Mail Icon Component
const MailIcon = ({ className = '' }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

export default ShipmentDashboard;