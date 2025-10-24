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
  FaPlus,
  FaEye,
  FaIndustry,
  FaWarehouse,
  FaArrowRight,
  FaClipboardList
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MRNListPage = () => {
  const navigate = useNavigate();
  const [materialRequests, setMaterialRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchMaterialRequests();
  }, [statusFilter, priorityFilter, projectFilter]);

  const fetchMaterialRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('requesting_department', 'manufacturing');
      
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (projectFilter) params.append('project_name', projectFilter);

      const response = await api.get(`/project-material-requests?${params.toString()}`);
      
      // Handle both array and object responses
      const requests = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      
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
        request.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const handleCreateNew = () => {
    navigate('/manufacturing/material-requests/create');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-600">Loading material requests...</span>
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
              <FaIndustry className="mr-3 text-purple-500" />
              Material Requests (MRN)
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage material requests sent to Inventory department
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center px-2 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors shadow-lg"
          >
            <FaPlus className="mr-2" />
            Create New MRN
          </button>
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
        <div className="bg-white rounded shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Issued</div>
          <div className="text-2xl font-bold text-gray-800">{stats.issued}</div>
        </div>
        <div className="bg-white rounded shadow p-4 border-l-4 border-purple-500">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500 appearance-none"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500 appearance-none"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500 appearance-none"
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
          <FaBox className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {materialRequests.length === 0 ? 'No Material Requests Yet' : 'No Matching Requests'}
          </h3>
          <p className="text-gray-500 mb-4">
            {materialRequests.length === 0 
              ? 'Create your first material request to get started.'
              : 'Try adjusting your filters to see more results.'}
          </p>
          {materialRequests.length === 0 && (
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-2 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              <FaPlus className="mr-2" />
              Create Material Request
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                className="bg-white rounded shadow-md hover:shadow-lg transition-shadow border border-gray-200"
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
                  {/* Project Name */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <FaClipboardList className="mr-2 text-purple-500" />
                    <span className="font-medium">Project:</span>
                    <span className="ml-1 text-gray-800">{request.project_name}</span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500 mb-1">Materials</div>
                      <div className="font-semibold text-gray-800">{totalMaterials}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500 mb-1">Issued</div>
                      <div className="font-semibold text-gray-800">{issuedMaterials}/{totalMaterials}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500 mb-1">Required By</div>
                      <div className="font-semibold text-gray-800 text-xs">
                        {formatDate(request.required_by_date)}
                      </div>
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {request.notes && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded mb-3">
                      <span className="font-medium">Notes:</span> {request.notes.substring(0, 80)}
                      {request.notes.length > 80 && '...'}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* Show dispatch button for pending requests */}
                    {(request.status === 'pending' || 
                      request.status === 'pending_inventory_review' ||
                      request.status === 'reviewed') && (
                      <button
                        onClick={() => navigate(`/inventory/dispatch/${request.id}`)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        <FaWarehouse className="mr-2" />
                        Dispatch
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(request)}
                      className={`${(request.status === 'pending' || request.status === 'pending_inventory_review' || request.status === 'reviewed') ? 'flex-1' : 'w-full'} flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors`}
                    >
                      <FaEye className="mr-2" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {detailsModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedRequest.request_number}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Material Request Details
                  </p>
                </div>
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500">Project</span>
                  <p className="font-semibold text-gray-800">{selectedRequest.project_name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status</span>
                  <p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedRequest.status)}`}>
                      {selectedRequest.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Priority</span>
                  <p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(selectedRequest.priority)}`}>
                      {selectedRequest.priority.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Required By</span>
                  <p className="font-semibold text-gray-800">{formatDate(selectedRequest.required_by_date)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Created</span>
                  <p className="font-semibold text-gray-800">{formatDate(selectedRequest.created_at)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <p className="font-semibold text-gray-800">{formatDate(selectedRequest.updated_at)}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                  <div className="bg-blue-50 p-3 rounded text-sm text-gray-700">
                    {selectedRequest.notes}
                  </div>
                </div>
              )}

              {/* Materials List */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Materials Requested</h3>
                <div className="space-y-3">
                  {(() => {
                    let materials = [];
                    try {
                      materials = typeof selectedRequest.materials_requested === 'string'
                        ? JSON.parse(selectedRequest.materials_requested)
                        : selectedRequest.materials_requested || [];
                    } catch (e) {
                      materials = [];
                    }

                    return materials.map((material, index) => (
                      <div key={index} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{material.material_name}</h4>
                            {material.description && (
                              <p className="text-sm text-gray-600">{material.description}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(material.status)}`}>
                            {material.status?.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Required</span>
                            <p className="font-semibold text-gray-800">
                              {material.quantity_required} {material.unit}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Available</span>
                            <p className="font-semibold text-gray-800">
                              {material.available_qty || 0} {material.unit}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Issued</span>
                            <p className="font-semibold text-green-600">
                              {material.issued_qty || 0} {material.unit}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Balance</span>
                            <p className="font-semibold text-orange-600">
                              {material.balance_qty || material.quantity_required} {material.unit}
                            </p>
                          </div>
                        </div>
                        {material.specifications && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Specs:</span> {material.specifications}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                {/* Show dispatch button only for pending/pending_inventory_review status */}
                {(selectedRequest.status === 'pending' || 
                  selectedRequest.status === 'pending_inventory_review' ||
                  selectedRequest.status === 'reviewed') && (
                  <button
                    onClick={() => {
                      setDetailsModalOpen(false);
                      navigate(`/inventory/dispatch/${selectedRequest.id}`);
                    }}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium"
                  >
                    <FaWarehouse className="mr-2" />
                    Accept & Release Material
                  </button>
                )}
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className={`${selectedRequest.status === 'pending' || selectedRequest.status === 'pending_inventory_review' || selectedRequest.status === 'reviewed' ? 'flex-1' : 'w-full'} px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MRNListPage;