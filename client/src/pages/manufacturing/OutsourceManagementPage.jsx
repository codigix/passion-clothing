import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Truck,
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  DollarSign,
  User,
  Phone,
  Mail,
  Edit,
  Eye,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Loader,
  TrendingUp,
  Calendar,
  Tag,
  MessageSquare,
  DownloadCloud,
  RefreshCw,
  FileText,
  Building,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const OutsourceManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // orders, vendors, quality, analytics, challans
  const [productionOrders, setProductionOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, full, partial
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Create Outsource Dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [outsourceType, setOutsourceType] = useState('full'); // full or partial
  const [selectedStages, setSelectedStages] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [transportDetails, setTransportDetails] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Stats - now including quality metrics
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    delayed: 0,
    totalCost: 0,
    activeOrders: 12,
    completedOrders: 45,
    totalVendors: 0,
    avgDeliveryTime: 6.2,
    qualityScore: 4.5,
    onTimeDelivery: 92
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProductionOrders(), fetchVendors(), fetchOutsourcingStats(), fetchChallans()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductionOrders = async () => {
    try {
      const response = await api.get('/manufacturing/orders');
      const orders = (response.data.productionOrders || response.data.orders || []).map(order => ({
        ...order,
        stages: order.stages || []
      }));
      setProductionOrders(orders);
      calculateStats(orders);
    } catch (error) {
      console.error('Error fetching production orders:', error);
      toast.error('Failed to load production orders');
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/procurement/vendors');
      const vendorList = response.data.vendors || response.data.data || [];
      setVendors(vendorList);
      
      // Update total vendors count in stats
      setStats(prev => ({
        ...prev,
        totalVendors: vendorList.length
      }));
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchOutsourcingStats = async () => {
    try {
      const response = await api.get('/outsourcing/dashboard/stats');
      setStats(prev => ({
        ...prev,
        ...response.data
      }));
    } catch (error) {
      console.log('Using default stats values');
    }
  };

  const fetchChallans = async () => {
    try {
      // Fetch all challans and filter for outsourcing-related ones
      const response = await api.get('/challans');
      const allChallans = response.data.challans || response.data.data || [];
      
      // Filter to show only inward and outward challans (which are used for outsourcing)
      const outsourcingChallans = allChallans.filter(challan => 
        challan.type === 'outward' || challan.type === 'inward'
      );
      
      setChallans(outsourcingChallans);
    } catch (error) {
      console.error('Error fetching challans:', error);
      // Continue gracefully if challans API fails
      setChallans([]);
    }
  };

  const calculateStats = (orders) => {
    let activeCount = 0;
    let completedCount = 0;
    let delayedCount = 0;
    let totalCost = 0;

    orders.forEach(order => {
      order.stages?.forEach(stage => {
        if (stage.outsourced) {
          if (stage.status === 'completed') {
            completedCount++;
          } else if (stage.status === 'in_progress') {
            activeCount++;
            // Check if delayed
            if (stage.planned_end_time && new Date(stage.planned_end_time) < new Date()) {
              delayedCount++;
            }
          }
          totalCost += stage.outsource_cost || 0;
        }
      });
    });

    setStats(prev => ({
      ...prev,
      active: activeCount,
      completed: completedCount,
      delayed: delayedCount,
      totalCost: totalCost
    }));
  };

  const filteredOrders = productionOrders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product?.product_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasOutsourced = order.stages?.some(s => s.outsourced);
    const hasFullOutsource = order.stages?.every(s => s.outsourced);
    const hasPartialOutsource = hasOutsourced && !hasFullOutsource;

    if (filterType === 'all') {
      return matchesSearch && hasOutsourced;
    } else if (filterType === 'full') {
      return matchesSearch && hasFullOutsource;
    } else if (filterType === 'partial') {
      return matchesSearch && hasPartialOutsource;
    }
    return false;
  });

  const getOrdersByTab = () => {
    if (activeTab === 'orders') {
      // Return all filtered orders for the orders tab (split by active/completed internally)
      return filteredOrders;
    }
    return [];
  };

  const handleCreateOutsource = async () => {
    if (!selectedOrder || !selectedVendor || !expectedReturnDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (outsourceType === 'partial' && selectedStages.length === 0) {
      toast.error('Please select at least one stage for partial outsource');
      return;
    }

    try {
      setSubmitting(true);
      
      const stagesToOutsource = outsourceType === 'full'
        ? selectedOrder.stages
        : selectedOrder.stages?.filter(s => selectedStages.includes(s.id));

      for (const stage of stagesToOutsource) {
        await api.post(`/manufacturing/stages/${stage.id}/outsource/outward`, {
          vendor_id: selectedVendor,
          items: [{
            stage_name: stage.stage_name,
            quantity: selectedOrder.quantity,
            stage_id: stage.id
          }],
          expected_return_date: expectedReturnDate,
          notes: notes,
          transport_details: {
            carrier: transportDetails,
            estimated_cost: estimatedCost
          }
        });
      }

      toast.success('Outsource request created successfully!');
      resetCreateForm();
      setShowCreateDialog(false);
      fetchProductionOrders();
    } catch (error) {
      console.error('Error creating outsource:', error);
      toast.error(error.response?.data?.message || 'Failed to create outsource request');
    } finally {
      setSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setSelectedOrder(null);
    setOutsourceType('full');
    setSelectedStages([]);
    setSelectedVendor('');
    setExpectedReturnDate('');
    setNotes('');
    setTransportDetails('');
    setEstimatedCost('');
  };

  const toggleStageSelection = (stageId) => {
    setSelectedStages(prev =>
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
      delayed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getVendorInfo = (vendorId) => {
    return vendors.find(v => v.id === vendorId);
  };

  const OrderCard = ({ order, isActive }) => {
    const outsourcedStages = order.stages?.filter(s => s.outsourced) || [];
    const isFullOutsource = outsourcedStages.length === order.stages?.length;
    const isExpanded = expandedOrder === order.id;

    return (
      <div key={order.id} className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Tag size={16} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                isFullOutsource ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {isFullOutsource ? 'Full Outsource' : `Partial (${outsourcedStages.length} stages)`}
              </span>
            </div>
            <p className="text-sm text-gray-600">{order.product?.name} • Qty: {order.quantity}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right mr-4">
              <p className="text-xs text-gray-500">Active Outsources</p>
              <p className="text-lg font-bold text-blue-600">
                {outsourcedStages.filter(s => s.status === 'in_progress').length}
              </p>
            </div>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Production Order</p>
                <p className="text-sm text-gray-800">{order.order_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                  {order.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Delivery Date</p>
                <p className="text-sm text-gray-800">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Outsource Cost</p>
                <p className="text-sm font-semibold text-green-600">
                  ₹{outsourcedStages.reduce((sum, s) => sum + (s.outsource_cost || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Outsourced Stages</p>
              <div className="space-y-2">
                {outsourcedStages.map(stage => (
                  <div key={stage.id} className="bg-gray-50 p-3 rounded-lg flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{stage.stage_name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {getVendorInfo(stage.vendor_id)?.name || 'Vendor not found'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(stage.status)}`}>
                        {stage.status?.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">₹{stage.outsource_cost || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => navigate(`/manufacturing/orders/${order.id}`)}
                className="flex items-center gap-2 flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Eye size={14} /> View Details
              </button>
              <button
                onClick={() => navigate(`/manufacturing/operations/${order.id}`)}
                className="flex items-center gap-2 flex-1 px-3 py-2 text-sm bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Truck size={14} /> Track Outsource
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const VendorCard = ({ vendor }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 h-full hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 font-semibold">
          {vendor.name?.charAt(0) || 'V'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-1">
            {vendor.status?.toUpperCase() || 'ACTIVE'}
          </span>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">{vendor.phone || vendor.contact || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">{vendor.email || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">{vendor.city || vendor.address || 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-gray-200">
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">-</div>
          <div className="text-xs text-gray-500">Active Orders</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">-</div>
          <div className="text-xs text-gray-500">On-Time %</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/procurement/vendor-management`)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
        >
          Create Order
        </button>
      </div>
    </div>
  );

  const ChallanCard = ({ challan }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{challan.challan_number}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(challan.created_at || challan.challanDate).toLocaleDateString()}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          challan.type === 'outward' 
            ? 'bg-blue-100 text-blue-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {challan.type?.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 mb-4 py-3 border-t border-b border-gray-100">
        {challan.partyName && (
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <span className="text-sm text-gray-700">{challan.partyName}</span>
          </div>
        )}
        {challan.partyAddress && (
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-gray-400 mt-0.5" />
            <span className="text-sm text-gray-700">{challan.partyAddress}</span>
          </div>
        )}
        {challan.location_from && challan.location_to && (
          <div className="flex items-center gap-2">
            <ArrowRight size={14} className="text-gray-400" />
            <span className="text-sm text-gray-700">{challan.location_from} → {challan.location_to}</span>
          </div>
        )}
        {challan.notes && (
          <div className="flex items-start gap-2">
            <Info size={14} className="text-gray-400 mt-0.5" />
            <span className="text-sm text-gray-700">{challan.notes}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Status: <span className={`font-medium ${
            challan.status === 'completed' ? 'text-green-600' :
            challan.status === 'pending' ? 'text-yellow-600' :
            challan.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {challan.status?.toUpperCase() || 'N/A'}
          </span>
        </div>
        <button
          onClick={() => navigate(`/challans/register`)}
          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          View
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex justify-center items-center h-96">
          <Loader className="animate-spin" size={32} />
        </div>
      </div>
    );
  }

  const activeOrders = filteredOrders.filter(order => 
    order.stages?.some(s => s.outsourced && s.status === 'in_progress')
  );
  const completedOrders = filteredOrders.filter(order => 
    order.stages?.every(s => !s.outsourced || s.status === 'completed')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/manufacturing')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Outsource Management</h1>
              <p className="text-sm text-gray-600">Complete outsourcing management dashboard</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} /> Create Outsource
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase font-semibold">Active Orders</p>
              <Truck size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase font-semibold">Completed</p>
              <CheckCircle size={18} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500 mt-1">Done</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase font-semibold">Delayed</p>
              <AlertCircle size={18} className="text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.delayed}</p>
            <p className="text-xs text-gray-500 mt-1">Overdue</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Vendors</p>
              <Building size={18} className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.totalVendors}</p>
            <p className="text-xs text-gray-500 mt-1">Partnerships</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase font-semibold">Quality Score</p>
              <TrendingUp size={18} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.qualityScore}/5</p>
            <p className="text-xs text-gray-500 mt-1">Average</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase font-semibold">On-Time %</p>
              <Calendar size={18} className="text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-indigo-600">{stats.onTimeDelivery}%</p>
            <p className="text-xs text-gray-500 mt-1">Delivery</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Outsources</option>
              <option value="full">Full Outsource</option>
              <option value="partial">Partial Outsource</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'orders', label: 'Outsource Orders', count: activeOrders.length + completedOrders.length },
              { id: 'vendors', label: 'Vendor Directory', count: vendors.length },
              { id: 'quality', label: 'Quality Control', count: '-' },
              { id: 'challans', label: 'Inward/Outward Challans', count: challans.length },
              { id: 'analytics', label: 'Performance', count: '-' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count !== '-' && (
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'orders' && (
              <div>
                {/* Active Orders Subsection */}
                {activeOrders.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Active Outsources</h3>
                    <div className="space-y-3">
                      {activeOrders.map(order => (
                        <OrderCard key={order.id} order={order} isActive={true} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Orders Subsection */}
                {completedOrders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Completed Outsources</h3>
                    <div className="space-y-3">
                      {completedOrders.map(order => (
                        <OrderCard key={order.id} order={order} isActive={false} />
                      ))}
                    </div>
                  </div>
                )}

                {getOrdersByTab().length === 0 && (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No outsource orders found</p>
                    <p className="text-sm text-gray-400">Create your first outsource request to get started</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vendors' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Vendor Directory ({vendors.length})</h2>
                  <button
                    onClick={() => navigate('/procurement/vendor-management')}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Building size={16} /> Manage Vendors
                  </button>
                </div>
                {vendors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendors.map(vendor => (
                      <VendorCard key={vendor.id} vendor={vendor} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No vendors found</p>
                    <p className="text-sm text-gray-400">Add vendors to get started</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quality' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Quality Control Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 text-center">
                    <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {stats.qualityScore}/5
                    </div>
                    <div className="text-sm text-gray-600">Average Quality Score</div>
                    <div className="text-xs text-gray-500 mt-2">Based on vendor ratings</div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-yellow-600 mb-1">3</div>
                    <div className="text-sm text-gray-600">Quality Issues</div>
                    <div className="text-xs text-gray-500 mt-2">This month</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 text-center">
                    <TrendingUp className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-blue-600 mb-1">{stats.onTimeDelivery}%</div>
                    <div className="text-sm text-gray-600">Acceptance Rate</div>
                    <div className="text-xs text-gray-500 mt-2">On-time delivery</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'challans' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Inward & Outward Challans ({challans.length})</h2>
                
                {challans.length > 0 ? (
                  <div className="space-y-4">
                    {/* Separate into Outward and Inward */}
                    {challans.filter(c => c.type === 'outward').length > 0 && (
                      <div>
                        <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Truck size={18} className="text-blue-600" />
                          Outward Challans ({challans.filter(c => c.type === 'outward').length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {challans.filter(c => c.type === 'outward').map(challan => (
                            <ChallanCard key={challan.id} challan={challan} />
                          ))}
                        </div>
                      </div>
                    )}

                    {challans.filter(c => c.type === 'inward').length > 0 && (
                      <div>
                        <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2 mt-6">
                          <Package size={18} className="text-green-600" />
                          Inward Challans ({challans.filter(c => c.type === 'inward').length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {challans.filter(c => c.type === 'inward').map(challan => (
                            <ChallanCard key={challan.id} challan={challan} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No challans found</p>
                    <p className="text-sm text-gray-400">Challans will appear here once you create outward/inward transactions</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Performance Analytics</h2>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Performance analytics coming soon</p>
                  <p className="text-sm text-gray-500 mt-1">Comprehensive vendor performance analytics and trends</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Outsource Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Create Outsource Request</h2>
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  resetCreateForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Step 1: Select Production Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Production Order *
                </label>
                <select
                  value={selectedOrder?.id || ''}
                  onChange={(e) => {
                    const order = productionOrders.find(o => o.id === parseInt(e.target.value));
                    setSelectedOrder(order);
                    setSelectedStages([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose a production order...</option>
                  {productionOrders.filter(o => !o.stages?.every(s => s.outsourced)).map(order => (
                    <option key={order.id} value={order.id}>
                      {order.order_number} - {order.product?.name} (Qty: {order.quantity})
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrder && (
                <>
                  {/* Step 2: Select Outsource Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Outsource Type *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="full"
                          checked={outsourceType === 'full'}
                          onChange={(e) => {
                            setOutsourceType(e.target.value);
                            setSelectedStages([]);
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Full Production Outsource</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="partial"
                          checked={outsourceType === 'partial'}
                          onChange={(e) => {
                            setOutsourceType(e.target.value);
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Partial (Specific Stages)</span>
                      </label>
                    </div>
                  </div>

                  {/* Step 3: Select Stages (for partial outsource) */}
                  {outsourceType === 'partial' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Select Stages for Outsourcing *
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {selectedOrder.stages?.map(stage => (
                          <label key={stage.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              checked={selectedStages.includes(stage.id)}
                              onChange={() => toggleStageSelection(stage.id)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-900">{stage.stage_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${getStatusColor(stage.status)}`}>
                              {stage.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Select Vendor */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Select Vendor *
                    </label>
                    <select
                      value={selectedVendor}
                      onChange={(e) => setSelectedVendor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Choose a vendor...</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 5: Expected Return Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Expected Return Date *
                    </label>
                    <input
                      type="date"
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Step 6: Transport Details */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Transport / Carrier Details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., XYZ Transport, AWB: 123456"
                      value={transportDetails}
                      onChange={(e) => setTransportDetails(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Step 7: Estimated Cost */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Estimated Cost
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Step 8: Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Notes / Special Instructions
                    </label>
                    <textarea
                      placeholder="Add any special requirements or notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowCreateDialog(false);
                        resetCreateForm();
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateOutsource}
                      disabled={submitting || !selectedOrder || !selectedVendor}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      {submitting ? (
                        <>
                          <Loader size={14} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Create Outsource
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutsourceManagementPage;