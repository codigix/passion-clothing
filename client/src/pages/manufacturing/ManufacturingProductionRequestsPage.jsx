import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaIndustry, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaClock,
  FaSearch,
  FaFilter,
  FaTimes,
  FaBox,
  FaCalendarAlt,
  FaClipboardList,
  FaArrowRight
} from 'react-icons/fa';
import api from '../../utils/api';

const ManufacturingProductionRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  // Fetch production requests for manufacturing department
  useEffect(() => {
    fetchProductionRequests();
  }, [statusFilter, priorityFilter, projectFilter]);

  const fetchProductionRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('department', 'manufacturing');
      
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (projectFilter) params.append('project_name', projectFilter);

      const response = await api.get(`/production-requests?${params.toString()}`);
      setRequests(response.data);
      setFilteredRequests(response.data);
    } catch (error) {
      console.error('Error fetching production requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = requests.filter(request =>
        request.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.sales_order_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(requests);
    }
  }, [searchTerm, requests]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setProjectFilter('');
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <FaCheckCircle className="text-green-500" />;
    if (status === 'cancelled' || status === 'on_hold') return <FaExclamationTriangle className="text-red-500" />;
    return <FaClock className="text-blue-500" />;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      in_planning: 'bg-indigo-100 text-indigo-800',
      materials_checking: 'bg-purple-100 text-purple-800',
      ready_to_produce: 'bg-cyan-100 text-cyan-800',
      in_production: 'bg-orange-100 text-orange-800',
      quality_check: 'bg-pink-100 text-pink-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleProcessRequest = (request) => {
    // Navigate to Create MRN page with prefilled project data
    navigate('/manufacturing/material-requests/create', {
      state: {
        prefilledData: {
          project_name: request.project_name,
          production_request_id: request.id,
          request_number: request.request_number,
          product_name: request.product_name,
          required_date: request.required_date,
          priority: request.priority,
          sales_order_number: request.sales_order_number,
          po_number: request.po_number
        }
      }
    });
  };

  const handleViewPO = (poId) => {
    navigate(`/procurement/purchase-orders/${poId}`);
  };

  const handleViewSO = (soId) => {
    navigate(`/sales/orders/${soId}`);
  };

  // Calculate summary statistics
  const stats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter(r => r.status === 'pending' || r.status === 'reviewed').length,
    inProgress: filteredRequests.filter(r => 
      ['in_planning', 'materials_checking', 'ready_to_produce', 'in_production', 'quality_check'].includes(r.status)
    ).length,
    completed: filteredRequests.filter(r => r.status === 'completed').length,
    urgent: filteredRequests.filter(r => r.priority === 'urgent').length
  };

  // Get unique projects for filter
  const uniqueProjects = [...new Set(requests.map(r => r.project_name).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600">Loading production requests...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaIndustry className="mr-3 text-orange-500" />
              Production Requests
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and process production requests from Procurement
            </p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Total Requests</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600">Pending Review</div>
          <div className="text-2xl font-bold text-gray-800">{stats.pending}</div>
        </div>
        <div className="bg-white rounded shadow p-4 border-l-4 border-orange-500">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-gray-800">{stats.inProgress}</div>
        </div>
        <div className="bg-white rounded shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-gray-800">{stats.completed}</div>
        </div>
        <div className="bg-white rounded shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600">Urgent Priority</div>
          <div className="text-2xl font-bold text-gray-800">{stats.urgent}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-blue-500 appearance-none"
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
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-blue-500 appearance-none"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Project Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-blue-500 appearance-none"
            >
              <option value="">All Projects</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filters Button */}
        {(searchTerm || statusFilter || priorityFilter || projectFilter) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              <FaTimes className="mr-2" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded shadow-md p-12 text-center">
          <FaIndustry className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {requests.length === 0 ? 'No Production Requests' : 'No Matching Requests'}
          </h3>
          <p className="text-gray-500">
            {requests.length === 0 
              ? 'Production requests from Sales and Procurement will appear here.'
              : 'Try adjusting your filters to see more results.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {request.request_number}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                      {request.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(request.priority)}`}>
                      {request.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                {/* Product Name */}
                <h4 className="text-lg font-bold text-orange-600 mb-2">
                  {request.product_name}
                </h4>

                {/* Project Name */}
                {request.project_name && (
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <FaClipboardList className="mr-2" />
                    <span className="font-medium">Project:</span>
                    <span className="ml-1">{request.project_name}</span>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500 mb-1">Quantity</div>
                    <div className="font-semibold text-gray-800">
                      {request.quantity} {request.unit}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500 mb-1">Required Date</div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {formatDate(request.required_date)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500 mb-1">
                      {request.sales_order_number ? 'Sales Order' : 'PO Number'}
                    </div>
                    {request.sales_order_number ? (
                      <button
                        onClick={() => handleViewSO(request.sales_order_id)}
                        className="font-semibold text-green-600 hover:text-green-800 text-sm"
                      >
                        {request.sales_order_number}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewPO(request.po_id)}
                        className="font-semibold text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {request.po_number}
                      </button>
                    )}
                  </div>
                </div>

                {/* Product Description */}
                {request.product_description && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Description</div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {request.product_description}
                    </p>
                  </div>
                )}

                {/* Sales Notes */}
                {request.sales_notes && (
                  <div className="mb-3 bg-green-50 border-l-4 border-green-400 p-2 rounded">
                    <div className="text-xs text-green-700 font-medium mb-1">Sales Notes</div>
                    <p className="text-sm text-green-900 line-clamp-2">
                      {request.sales_notes}
                    </p>
                  </div>
                )}

                {/* Procurement Notes */}
                {request.procurement_notes && (
                  <div className="mb-3 bg-blue-50 border-l-4 border-blue-400 p-2 rounded">
                    <div className="text-xs text-blue-700 font-medium mb-1">Procurement Notes</div>
                    <p className="text-sm text-blue-900 line-clamp-2">
                      {request.procurement_notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleProcessRequest(request)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center"
                  >
                    <FaArrowRight className="mr-2" />
                    Create MRN
                  </button>
                  {request.sales_order_number ? (
                    <button
                      onClick={() => handleViewSO(request.sales_order_id)}
                      className="px-4 py-2 border border-green-300 hover:bg-green-50 text-green-700 rounded font-medium transition-colors"
                    >
                      View SO
                    </button>
                  ) : (
                    <button
                      onClick={() => handleViewPO(request.po_id)}
                      className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded font-medium transition-colors"
                    >
                      View PO
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManufacturingProductionRequestsPage;