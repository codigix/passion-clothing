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
  FaClipboardCheck,
  FaTruck,
  FaBox,
  FaArrowRight
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MRNRequestsPage = () => {
  const navigate = useNavigate();
  const [materialRequests, setMaterialRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  useEffect(() => {
    fetchMaterialRequests();
  }, [statusFilter, priorityFilter, projectFilter]);

  const fetchMaterialRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Show all MRN requests sent to inventory
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (projectFilter) params.append('project_name', projectFilter);

      const response = await api.get(`/project-material-requests?${params.toString()}`);
      
      // Handle both array and object responses
      const requests = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || response.data.requests || [];
      
      setMaterialRequests(requests);
      setFilteredRequests(requests);
    } catch (error) {
      console.error('Error fetching material requests:', error);
      toast.error('Failed to load material requests');
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = materialRequests.filter(request =>
        request.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requesting_department?.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (status === 'issued' || status === 'completed') {
      return <FaCheckCircle className="text-green-500" />;
    }
    if (status === 'pending_inventory_review' || status === 'pending') {
      return <FaClock className="text-yellow-500" />;
    }
    if (status === 'pending_procurement') {
      return <FaExclamationTriangle className="text-orange-500" />;
    }
    if (status === 'partially_issued') {
      return <FaArrowRight className="text-blue-500" />;
    }
    return <FaClock className="text-blue-500" />;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      pending_inventory_review: 'bg-blue-100 text-blue-800',
      partially_issued: 'bg-orange-100 text-orange-800',
      issued: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      pending_procurement: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
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

  // Calculate summary statistics
  const stats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter(r => 
      r.status === 'pending' || r.status === 'pending_inventory_review'
    ).length,
    issued: filteredRequests.filter(r => 
      r.status === 'issued' || r.status === 'partially_issued'
    ).length,
    completed: filteredRequests.filter(r => r.status === 'completed').length,
    urgent: filteredRequests.filter(r => r.priority === 'urgent').length
  };

  // Get unique projects for filter
  const uniqueProjects = [...new Set(materialRequests.map(r => r.project_name).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading MRN requests...</span>
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
              <FaIndustry className="mr-3 text-blue-600" />
              Material Request Notes (MRN)
            </h1>
            <p className="text-gray-600 mt-1">
              Process material requests from Manufacturing department
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
          <div className="text-sm text-gray-600">Pending Review</div>
          <div className="text-2xl font-bold text-gray-800">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Issued</div>
          <div className="text-2xl font-bold text-gray-800">{stats.issued}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-gray-800">{stats.completed}</div>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="pending_inventory_review">Pending Review</option>
              <option value="partially_issued">Partially Issued</option>
              <option value="issued">Issued</option>
              <option value="completed">Completed</option>
              <option value="pending_procurement">Pending Procurement</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
            {materialRequests.length === 0 ? 'No Material Requests Yet' : 'No Matching Requests'}
          </h3>
          <p className="text-gray-500 mb-4">
            {materialRequests.length === 0 
              ? 'No material requests have been sent to Inventory yet.'
              : 'Try adjusting your filters to see more results.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map((request) => {
            // Parse materials if it's a JSON string
            let materials = [];
            try {
              materials = typeof request.materials_requested === 'string'
                ? JSON.parse(request.materials_requested)
                : request.materials_requested || [];
            } catch (e) {
              materials = [];
            }

            const totalMaterials = materials.length;
            const issuedMaterials = materials.filter(m => m.status === 'issued').length;

            return (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {request.request_number}
                        </h3>
                        <p className="text-sm text-gray-600">{request.project_name || 'No Project'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(request.status)}`}>
                        {request.status?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeColor(request.priority)}`}>
                        {request.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Department */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-gray-800">
                      {request.requesting_department?.toUpperCase() || 'MANUFACTURING'}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Request Date:</span>
                    <span className="font-medium text-gray-800">{formatDate(request.request_date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Required By:</span>
                    <span className="font-medium text-gray-800">{formatDate(request.required_by_date)}</span>
                  </div>

                  {/* Materials Count */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Materials:</span>
                    <span className="font-medium text-gray-800">
                      {issuedMaterials > 0 
                        ? `${issuedMaterials} / ${totalMaterials} Issued`
                        : `${totalMaterials} Items`
                      }
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {totalMaterials > 0 && issuedMaterials > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(issuedMaterials / totalMaterials) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Card Footer - Action Buttons */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => navigate(`/inventory/mrn/${request.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    title="Review material request details"
                  >
                    <FaClipboardCheck />
                    Review
                  </button>
                  <button
                    onClick={() => navigate(`/inventory/dispatch/${request.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    title="Dispatch materials to Manufacturing"
                  >
                    <FaTruck />
                    Dispatch
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MRNRequestsPage;