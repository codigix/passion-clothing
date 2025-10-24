import React, { useState, useEffect } from 'react';
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
  Package
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
  const [deliveryTracking, setDeliveryTracking] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  
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

  // Fetch incoming orders from manufacturing
  const fetchIncomingOrders = async () => {
    try {
      const response = await api.get('/shipments/orders/incoming?status=ready_for_shipment');
      setIncomingOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching incoming orders:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchShipments(),
        fetchCourierPartners(),
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
      preparing: 'bg-amber-100 text-amber-700',
      packed: 'bg-blue-100 text-blue-700',
      ready_to_ship: 'bg-indigo-100 text-indigo-700',
      shipped: 'bg-sky-100 text-sky-700',
      in_transit: 'bg-blue-100 text-blue-700',
      out_for_delivery: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-emerald-100 text-emerald-700',
      failed_delivery: 'bg-rose-100 text-rose-700',
      returned: 'bg-rose-100 text-rose-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const TabPanel = ({ children, value, index }) => {
    if (value !== index) {
      return null;
    }
    return <div className="p-6">{children}</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Shipment & Delivery Dashboard
        </h1>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray text-xs-300 rounded hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/shipment/tracking')}
          >
            <TrendingUp size={18} />
            Track Shipment
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            onClick={() => navigate('/shipment/create')}
          >
            <Plus size={18} />
            Create Shipment
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
        <MinimalStatCard
          title="Total Shipments"
          value={stats.totalShipments}
          icon={<Truck size={24} />}
        />
        <MinimalStatCard
          title="In Transit"
          value={stats.inTransit}
          icon={<Calendar size={24} />}
        />
        <MinimalStatCard
          title="Delivered"
          value={stats.delivered}
          icon={<CheckCircle size={24} />}
        />
        <MinimalStatCard
          title="Delayed"
          value={stats.delayed}
          icon={<AlertTriangle size={24} />}
        />
        <MinimalStatCard
          title="On-Time Delivery"
          value={stats.onTimeDeliveryRate}
          unit="%"
          icon={<TrendingUp size={24} />}
        />
        <MinimalStatCard
          title="Avg Delivery Time"
          value={stats.avgDeliveryTime}
          unit=" days"
          icon={<Clock size={24} />}
        />
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          Quick Search & Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          <div className="md:col-span-5">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by shipment no, tracking no, customer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full px-2.5 py-1.5 border border-gray text-xs-300 rounded hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/shipment/bulk-tracking')}
            >
              Bulk Tracking
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full px-2.5 py-1.5 border border-gray text-xs-300 rounded hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/shipment/performance')}
            >
              Delivery Performance
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full px-2.5 py-1.5 border border-gray text-xs-300 rounded hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/shipment/reports')}
            >
              Shipment Reports
            </button>
          </div>
          <div className="md:col-span-1">
            <button 
              className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              onClick={handleExport}
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <div className="flex flex-wrap">
            {['Incoming Orders', 'Active Shipments', 'Delivery Tracking', 'Courier Partners', 'Performance Analytics'].map((label, index) => (
              <button
                key={label}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tabValue === index
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setTabValue(index)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Incoming Orders Tab */}
        <TabPanel value={tabValue} index={0}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Incoming Orders from Manufacturing</h3>
            </div>
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order No.</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {incomingOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{order.order_number}</td>
                      <td className="px-6 py-4">{order.customer?.name}</td>
                      <td className="px-6 py-4">{order.garment_specs?.product_type}</td>
                      <td className="px-6 py-4 text-right">{order.quantity}</td>
                      <td className="px-6 py-4">{new Date(order.updated_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleCreateShipment(order)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="Create Shipment"
                          >
                            <Truck size={14} />
                          </button>
                          <button
                            onClick={() => handleViewOrderDetails(order)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {incomingOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No incoming orders from manufacturing
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">
                Active Shipments ({shipments.length})
              </h2>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded text-sm"
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
                  className="px-2.5 py-1.5 border border-gray text-xs-300 rounded hover:bg-gray-50 transition-colors"
                  onClick={() => navigate('/shipment/all')}
                >
                  View All Shipments
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment No.</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Order No.</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Address</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Courier</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking No.</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Delivery</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {shipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-2 py-2 font-medium text-gray-900">{shipment.shipment_number}</td>
                      <td className="px-2 py-2">{shipment.salesOrder?.order_number || 'N/A'}</td>
                      <td className="px-2 py-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{shipment.salesOrder?.customer?.name || 'N/A'}</span>
                          <span className="text-xs text-gray-500">{shipment.recipient_phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin size={16} className="text-gray-400" />
                          {shipment.shipping_address}
                        </div>
                      </td>
                      <td className="px-2 py-2">{shipment.courierPartner?.name || shipment.courier_company || 'N/A'}</td>
                      <td className="px-2 py-2">
                        <button
                          className="text-primary-600 hover:text-primary-800 underline"
                          onClick={() => handleTrackingClick(shipment.tracking_number)}
                        >
                          {shipment.tracking_number || 'Not assigned'}
                        </button>
                      </td>
                      <td className="px-2 py-2">{new Date(shipment.expected_delivery_date).toLocaleDateString()}</td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {shipment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="flex justify-center gap-2 text-gray-500">
                          <button 
                            className="hover:text-primary-600" 
                            aria-label="View tracking"
                            onClick={() => handleViewTracking(shipment)}
                          >
                            <TrendingUp size={16} />
                          </button>
                          <button 
                            className="hover:text-secondary-600" 
                            aria-label="View details"
                            onClick={() => handleViewDetails(shipment)}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="hover:text-gray-700" 
                            aria-label="Edit shipment"
                            onClick={() => handleEditShipment(shipment)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="hover:text-red-600" 
                            aria-label="Delete shipment"
                            onClick={() => handleDeleteShipment(shipment.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">
                Real-time Delivery Tracking
              </h2>
              <button
                className="self-start md:self-auto px-2.5 py-1.5 border border-gray text-xs-300 rounded hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/shipment/live-tracking')}
              >
                Live Tracking Map
              </button>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment No.</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deliveryTracking.map((track) => (
                    <tr key={track.shipmentNo} className="hover:bg-gray-50">
                      <td className="px-2 py-2 font-medium text-gray-900">{track.shipmentNo}</td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(track.status.toLowerCase().replace(/\s+/g, '_'))}`}>
                          {track.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin size={16} className="text-gray-400" />
                          {track.location}
                        </div>
                      </td>
                      <td className="px-2 py-2">{new Date(track.timestamp).toLocaleString()}</td>
                      <td className="px-2 py-2">{track.remarks}</td>
                      <td className="px-2 py-2 text-center">
                        <button 
                          className="inline-flex items-center justify-center gap-1 text-primary-600 hover:text-primary-700"
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
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">
                Courier Partners
              </h2>
              <button
                className="self-start md:self-auto px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center gap-1.5"
                onClick={() => navigate('/shipment/add-courier')}
              >
                <Building size={16} />
                Add Courier Partner
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {courierPartners.map((courier) => (
                <div key={courier.id} className="bg-white border border-gray-200 rounded shadow-sm p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                      <Truck size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{courier.name}</h3>
                      <p className="text-xs text-gray-500">{courier.service_areas?.join(', ') || 'Service areas not specified'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Phone size={16} className="text-gray-400" />
                      <span>{courier.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MailIcon />
                      <span>{courier.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold text-primary-600">{courier.activeShipments || 0}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Active Shipments</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-emerald-600">{courier.on_time_delivery_rate || 0}%</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">On-Time Delivery</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Services</p>
                    <div className="flex flex-wrap gap-2">
                      {(courier.services_offered || ['Standard']).map((service) => (
                        <span
                          key={service}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 border border-primary-200"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Avg: {courier.average_delivery_time || 0} days</span>
                    <span>Rating: {courier.rating || 0}/5</span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                      onClick={() => handleCourierDetails(courier)}
                    >
                      View Details
                    </button>
                    <button 
                      className="flex-1 px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm"
                      onClick={() => handleCreateShipmentWithCourier(courier)}
                    >
                      Create Shipment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6 text-center cursor-pointer hover:shadow-md transition-shadow"
                 onClick={() => navigate('/shipment/performance')}>
              <TrendingUp size={40} className="text-emerald-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-emerald-600">{stats.onTimeDeliveryRate}%</p>
              <p className="text-sm text-gray-600">On-Time Delivery Rate</p>
            </div>
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6 text-center cursor-pointer hover:shadow-md transition-shadow"
                 onClick={() => navigate('/shipment/analytics')}>
              <Clock size={40} className="text-primary-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stats.avgDeliveryTime}</p>
              <p className="text-sm text-gray-600">Average Delivery Time (Days)</p>
            </div>
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6 text-center cursor-pointer hover:shadow-md transition-shadow"
                 onClick={() => navigate('/shipment/issues')}>
              <AlertTriangle size={40} className="text-rose-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stats.delayed}</p>
              <p className="text-sm text-gray-600">Delayed Shipments</p>
            </div>
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6 text-center cursor-pointer hover:shadow-md transition-shadow"
                 onClick={() => navigate('/shipment/reports')}>
              <FileText size={40} className="text-blue-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">98.5%</p>
              <p className="text-sm text-gray-600">Successful Delivery Rate</p>
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

const MailIcon = () => (
  <svg
    className="w-4 h-4 text-gray-400"
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