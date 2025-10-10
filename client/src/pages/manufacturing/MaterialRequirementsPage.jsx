import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBox, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaClock,
  FaSearch,
  FaFilter,
  FaTimes,
  FaIndustry,
  FaClipboardList,
  FaArrowRight,
  FaWarehouse
} from 'react-icons/fa';
import api from '../../utils/api';

const MaterialRequirementsPage = () => {
  const navigate = useNavigate();
  const [materialRequests, setMaterialRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  // Fetch material requests for manufacturing department
  useEffect(() => {
    fetchMaterialRequests();
  }, [statusFilter, priorityFilter, projectFilter]);

  const fetchMaterialRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('department', 'manufacturing');
      
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (projectFilter) params.append('project_name', projectFilter);

      const response = await api.get(`/project-material-requests?${params.toString()}`);
      setMaterialRequests(response.data);
      setFilteredRequests(response.data);
    } catch (error) {
      console.error('Error fetching material requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = materialRequests.filter(request =>
        request.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.material_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.po_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(materialRequests);
    }
  }, [searchTerm, materialRequests]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setProjectFilter('');
  };

  const getStatusIcon = (status) => {
    if (status === 'fulfilled' || status === 'completed') return <FaCheckCircle className="text-green-500" />;
    if (status === 'cancelled' || status === 'rejected') return <FaExclamationTriangle className="text-red-500" />;
    return <FaClock className="text-blue-500" />;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      fulfilled: 'bg-green-100 text-green-800',
      partially_fulfilled: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-gray-100 text-gray-800'
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

  const handleViewRequest = (requestId) => {
    // Navigate to request details
    navigate(`/manufacturing/material-requirements/${requestId}`);
  };

  const handleViewPO = (poId) => {
    navigate(`/procurement/purchase-orders/${poId}`);
  };

  // Calculate summary statistics
  const stats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter(r => r.status === 'pending').length,
    approved: filteredRequests.filter(r => r.status === 'approved' || r.status === 'in_progress').length,
    fulfilled: filteredRequests.filter(r => r.status === 'fulfilled').length,
    urgent: filteredRequests.filter(r => r.priority === 'urgent').length
  };

  // Get unique projects for filter
  const uniqueProjects = [...new Set(materialRequests.map(r => r.project_name).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-600">Loading material requirements...</span>
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
              <FaBox className="mr-3 text-purple-500" />
              Material Requirements
            </h1>
            <p className="text-gray-600 mt-1">
              View material requests needed for production from Inventory
            </p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Total Requests</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-gray-800">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Approved</div>
          <div className="text-2xl font-bold text-gray-800">{stats.approved}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600">Fulfilled</div>
          <div className="text-2xl font-bold text-gray-800">{stats.fulfilled}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600">Urgent Priority</div>
          <div className="text-2xl font-bold text-gray-800">{stats.urgent}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="in_progress">In Progress</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="partially_fulfilled">Partially Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
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
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="mr-2" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaBox className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {materialRequests.length === 0 ? 'No Material Requirements' : 'No Matching Requests'}
          </h3>
          <p className="text-gray-500">
            {materialRequests.length === 0 
              ? 'Material requests from Inventory will appear here.'
              : 'Try adjusting your filters to see more results.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
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
                {/* Material Name */}
                <h4 className="text-lg font-bold text-purple-600 mb-2">
                  {request.material_name}
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
                      {request.quantity_requested} {request.unit}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500 mb-1">Required Date</div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {formatDate(request.required_date)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500 mb-1">PO Number</div>
                    {request.po_id ? (
                      <button
                        onClick={() => handleViewPO(request.po_id)}
                        className="font-semibold text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {request.po_number}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </div>
                </div>

                {/* Material Specifications */}
                {request.material_specifications && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Specifications</div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {request.material_specifications}
                    </p>
                  </div>
                )}

                {/* Purpose */}
                {request.purpose && (
                  <div className="mb-3 bg-purple-50 border-l-4 border-purple-400 p-2 rounded">
                    <div className="text-xs text-purple-700 font-medium mb-1">Purpose</div>
                    <p className="text-sm text-purple-900 line-clamp-2">
                      {request.purpose}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleViewRequest(request.id)}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <FaArrowRight className="mr-2" />
                    View Details
                  </button>
                  {request.po_id && (
                    <button
                      onClick={() => handleViewPO(request.po_id)}
                      className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
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

export default MaterialRequirementsPage;