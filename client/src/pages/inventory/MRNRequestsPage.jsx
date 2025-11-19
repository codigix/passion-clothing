import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaIndustry, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaClock,
  FaSearch,
  FaTimes,
  FaClipboardCheck,
  FaTruck,
  FaBox,
  FaArrowRight,
  FaList,
  FaCheckDouble
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
  const [activeTab, setActiveTab] = useState('all');

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
    setActiveTab('all');
  };

  const getTabFilteredRequests = () => {
    let requests = filteredRequests;
    
    if (activeTab === 'pending') {
      requests = requests.filter(r => r.status === 'pending' || r.status === 'pending_inventory_review');
    } else if (activeTab === 'progress') {
      requests = requests.filter(r => r.status === 'partially_issued');
    } else if (activeTab === 'completed') {
      requests = requests.filter(r => r.status === 'issued' || r.status === 'completed');
    }
    
    return requests;
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

  const tabFilteredRequests = getTabFilteredRequests();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded-lg">
                  <FaList className="text-lg text-blue-600" />
                </div>
                Material Request Notes
              </h1>
              <p className="text-gray-600 text-xs mt-1">Track and dispatch material requests to manufacturing</p>
            </div>
          </div>

          {/* Summary Statistics - Enhanced with Gradient */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Total Requests</p>
                  <p className="text-2xl font-bold mt-0.5">{stats.total}</p>
                </div>
                <FaBox className="text-3xl opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs font-medium">⏳ Pending</p>
                  <p className="text-2xl font-bold mt-0.5">{stats.pending}</p>
                </div>
                <FaClock className="text-3xl opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs font-medium">📊 In Progress</p>
                  <p className="text-2xl font-bold mt-0.5">{filteredRequests.filter(r => r.status === 'partially_issued').length}</p>
                </div>
                <FaArrowRight className="text-3xl opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium">✓ Issued</p>
                  <p className="text-2xl font-bold mt-0.5">{stats.issued}</p>
                </div>
                <FaTruck className="text-3xl opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium">🎯 Completed</p>
                  <p className="text-2xl font-bold mt-0.5">{stats.completed}</p>
                </div>
                <FaCheckDouble className="text-3xl opacity-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="🔍 Search by request #, project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:border-blue-500 transition-all appearance-none bg-white"
            >
              <option value="">📌 All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:border-blue-500 transition-all appearance-none bg-white"
            >
              <option value="">📋 All Statuses</option>
              <option value="pending">Pending</option>
              <option value="pending_inventory_review">Pending Review</option>
              <option value="partially_issued">Partially Issued</option>
              <option value="issued">Issued</option>
              <option value="completed">Completed</option>
            </select>

            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 focus:border-blue-500 transition-all appearance-none bg-white"
            >
              <option value="">🏢 All Projects</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          {(searchTerm || statusFilter || priorityFilter || projectFilter) && (
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FaTimes className="text-sm" />
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-4">
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: 'all', label: '📦 All', count: filteredRequests.length },
              { id: 'pending', label: '⏳ Pending', count: stats.pending },
              { id: 'progress', label: '📊 Progress', count: filteredRequests.filter(r => r.status === 'partially_issued').length },
              { id: 'completed', label: '✅ Done', count: stats.completed }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-blue-400' : 'bg-gray-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Requests Grid */}
        {tabFilteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaBox className="mx-auto text-4xl text-gray-200 mb-2" />
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              {filteredRequests.length === 0 ? 'No Material Requests Found' : 'No Requests in this Category'}
            </h3>
            <p className="text-gray-500 text-xs">
              {filteredRequests.length === 0 
                ? 'No material requests match your search criteria. Try adjusting your filters.'
                : 'Switch to another tab or adjust your filters to see more requests.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {tabFilteredRequests.map((request) => {
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
            const isCompleted = request.status === 'completed' || request.status === 'issued';

            return (
              <div
                key={request.id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 ${
                  isCompleted ? 'border-l-green-500' : 'border-l-blue-500'
                }`}
              >
                {/* Card Header - Gradient Background */}
                <div className={`p-3 bg-gradient-to-r ${
                  isCompleted 
                    ? 'from-green-50 via-green-25 to-white' 
                    : 'from-blue-50 via-blue-25 to-white'
                } border-b border-gray-100`}>
                  <div className="flex items-start justify-between gap-2">
                    {/* Left Content */}
                    <div className="flex items-start gap-2 flex-1">
                      <div className={`p-1.5 rounded-lg text-sm ${
                        isCompleted ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {getStatusIcon(request.status)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{request.project_name || 'No Project'}</h3>
                        <p className="text-xs text-gray-600 mt-0">{request.request_number}</p>
                      </div>
                    </div>

                    {/* Right Badges */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-1 items-center flex-wrap justify-end">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeColor(request.status)}`}>
                          {request.status?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        {isCompleted && (
                          <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${getPriorityBadgeColor(request.priority)}`}>
                        {request.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3 space-y-2">
                  {/* Department Row */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Dept:</span>
                    <span className="font-semibold text-gray-900">
                      {request.requesting_department?.toUpperCase()?.substring(0, 12) || 'MFG'}
                    </span>
                  </div>

                  {/* Dates Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Req Date</p>
                      <p className="text-xs font-semibold text-gray-900">{formatDate(request.request_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Req By</p>
                      <p className="text-xs font-semibold text-gray-900">{formatDate(request.required_by_date)}</p>
                    </div>
                  </div>

                  {/* Materials Section */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 font-medium">Materials</span>
                      <span className="text-xs font-bold text-gray-900">
                        {issuedMaterials > 0 
                          ? `${issuedMaterials}/${totalMaterials}`
                          : `${totalMaterials}`
                        }
                      </span>
                    </div>
                    {totalMaterials > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: totalMaterials > 0 ? `${(issuedMaterials / totalMaterials) * 100}%` : '0%' }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer - Action Buttons */}
                <div className={`px-3 py-2 flex gap-1.5 border-t text-xs ${
                  isCompleted ? 'bg-green-25 border-green-100' : 'bg-gray-50 border-gray-100'
                }`}>
                  <button
                    onClick={() => navigate(`/inventory/mrn/${request.id}`)}
                    disabled={isCompleted}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg font-medium transition-all text-xs ${
                      isCompleted
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                    }`}
                    title={isCompleted ? 'Dispatch already completed' : 'Review material request details'}
                  >
                    <FaClipboardCheck className="text-sm" />
                    Review
                  </button>
                  <button
                    onClick={() => navigate(`/inventory/dispatch/${request.id}`)}
                    disabled={isCompleted}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg font-medium transition-all text-xs ${
                      isCompleted
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                    }`}
                    title={isCompleted ? 'Dispatch already completed' : 'Dispatch materials to Manufacturing'}
                  >
                    <FaTruck className="text-sm" />
                    {isCompleted ? 'Done ✓' : 'Dispatch'}
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MRNRequestsPage;