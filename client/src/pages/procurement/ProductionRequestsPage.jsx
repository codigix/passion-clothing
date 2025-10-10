import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaIndustry, FaFilter, FaSearch, FaEye, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const ProductionRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    project_name: '',
    search: ''
  });

  useEffect(() => {
    fetchProductionRequests();
  }, [filters]);

  const fetchProductionRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.project_name) params.append('project_name', filters.project_name);
      
      const response = await api.get(`/production-requests?${params.toString()}`);
      // Handle response format {success: true, data: [...]}
      let data = response.data.data || response.data;

      // Apply search filter on frontend
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        data = data.filter(req => 
          req.request_number?.toLowerCase().includes(searchLower) ||
          req.product_name?.toLowerCase().includes(searchLower) ||
          req.project_name?.toLowerCase().includes(searchLower) ||
          req.po_number?.toLowerCase().includes(searchLower)
        );
      }

      setRequests(data);
    } catch (error) {
      console.error('Error fetching production requests:', error);
      toast.error('Failed to load production requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Reviewed' },
      in_planning: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'In Planning' },
      materials_checking: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Materials Check' },
      ready_to_produce: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Ready to Produce' },
      in_production: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'In Production' },
      quality_check: { bg: 'bg-pink-100', text: 'text-pink-800', label: 'Quality Check' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      on_hold: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'On Hold' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Low' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Medium' },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High' },
      urgent: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <FaCheckCircle className="text-green-600" />;
    if (status === 'cancelled' || status === 'on_hold') return <FaExclamationTriangle className="text-red-600" />;
    return <FaClock className="text-orange-600" />;
  };

  const handleViewDetails = (requestId) => {
    // For now, show a toast. Later we can create a detailed view page
    toast.info('Detailed view coming soon!');
  };

  const handleViewPO = (poId) => {
    navigate(`/procurement/purchase-orders/${poId}`);
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      project_name: '',
      search: ''
    });
  };

  // Get unique project names for filter dropdown
  const uniqueProjects = [...new Set(requests.map(r => r.project_name).filter(Boolean))];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FaIndustry className="text-3xl text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-900">Production Requests</h1>
        </div>
        <p className="text-gray-600">
          Track production requests sent to Manufacturing department
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Request #, Product, Project..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="in_planning">In Planning</option>
              <option value="materials_checking">Materials Checking</option>
              <option value="ready_to_produce">Ready to Produce</option>
              <option value="in_production">In Production</option>
              <option value="quality_check">Quality Check</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={filters.project_name}
              onChange={(e) => setFilters({...filters, project_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Projects</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading production requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaIndustry className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Production Requests Found</h3>
          <p className="text-gray-500">
            {Object.values(filters).some(f => f) 
              ? 'Try adjusting your filters to see more results.'
              : 'Create production requests from Purchase Orders linked to projects.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {request.request_number}
                        </h3>
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                      </div>
                      <p className="text-xl font-semibold text-orange-600 mb-1">
                        {request.product_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Project: <span className="font-medium text-gray-900">{request.project_name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Quantity</p>
                    <p className="font-semibold text-gray-900">
                      {request.quantity} {request.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Required Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(request.required_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">PO Number</p>
                    <button
                      onClick={() => handleViewPO(request.po_id)}
                      className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {request.po_number}
                    </button>
                  </div>
                </div>

                {/* Description */}
                {request.product_description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {request.product_description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDetails(request.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <FaEye /> View Details
                  </button>
                  <button
                    onClick={() => handleViewPO(request.po_id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    View Purchase Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && requests.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {requests.filter(r => r.status === 'in_production').length}
              </p>
              <p className="text-sm text-gray-600">In Production</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {requests.filter(r => r.priority === 'urgent').length}
              </p>
              <p className="text-sm text-gray-600">Urgent</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionRequestsPage;