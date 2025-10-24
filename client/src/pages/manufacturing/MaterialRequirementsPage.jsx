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
  FaWarehouse,
  FaColumns,
  FaChevronDown
} from 'react-icons/fa';
import api from '../../utils/api';

// Define available columns with their properties
const AVAILABLE_COLUMNS = [
  { id: 'request_number', label: 'Request #', defaultVisible: true, alwaysVisible: true },
  { id: 'material_name', label: 'Material Name', defaultVisible: true },
  { id: 'project_name', label: 'Project', defaultVisible: true },
  { id: 'quantity_requested', label: 'Quantity Requested', defaultVisible: true },
  { id: 'unit', label: 'Unit', defaultVisible: false },
  { id: 'quantity_issued', label: 'Issued', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'priority', label: 'Priority', defaultVisible: false },
  { id: 'created_at', label: 'Created Date', defaultVisible: false },
  { id: 'actions', label: 'Actions', defaultVisible: true, alwaysVisible: true }
];

const MaterialRequirementsPage = () => {
  const navigate = useNavigate();
  const [materialRequests, setMaterialRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'cards' or 'table'
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showPastRequests, setShowPastRequests] = useState(false);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('materialRequestsVisibleColumns');
    if (saved) {
      return JSON.parse(saved);
    }
    return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
  });

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
      localStorage.setItem('materialRequestsVisibleColumns', JSON.stringify(newColumns));
      return newColumns;
    });
  };

  const resetColumns = () => {
    const defaultCols = AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
    setVisibleColumns(defaultCols);
    localStorage.setItem('materialRequestsVisibleColumns', JSON.stringify(defaultCols));
  };

  const showAllColumns = () => {
    const allCols = AVAILABLE_COLUMNS.map(col => col.id);
    setVisibleColumns(allCols);
    localStorage.setItem('materialRequestsVisibleColumns', JSON.stringify(allCols));
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnMenu && !event.target.closest('.column-menu-container')) {
        setShowColumnMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnMenu]);

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

  // Separate active and past requests
  const isCompletedStatus = (status) => {
    return ['fulfilled', 'completed', 'rejected', 'cancelled', 'partially_fulfilled'].includes(status);
  };

  const activeRequests = filteredRequests.filter(r => !isCompletedStatus(r.status));
  const pastRequests = filteredRequests.filter(r => isCompletedStatus(r.status));

  // Calculate summary statistics
  const stats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter(r => r.status === 'pending').length,
    approved: filteredRequests.filter(r => r.status === 'approved' || r.status === 'in_progress').length,
    fulfilled: filteredRequests.filter(r => r.status === 'fulfilled').length,
    urgent: filteredRequests.filter(r => r.priority === 'urgent').length,
    active: activeRequests.length,
    past: pastRequests.length
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
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaBox className="mr-3 text-purple-500" />
              Material Requirements (MRN)
            </h1>
            <p className="text-gray-600 mt-1">
              View material requests needed for production from Inventory
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
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-gray-800">{stats.pending}</div>
        </div>
        <div className="bg-white rounded shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Approved</div>
          <div className="text-2xl font-bold text-gray-800">{stats.approved}</div>
        </div>
        <div className="bg-white rounded shadow p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600">Fulfilled</div>
          <div className="text-2xl font-bold text-gray-800">{stats.fulfilled}</div>
        </div>
        <div className="bg-white rounded shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600">Urgent Priority</div>
          <div className="text-2xl font-bold text-gray-800">{stats.urgent}</div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="bg-white p-4 rounded shadow-md mb-4">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by Request #, Material, or Project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded pl-10 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 focus:border-purple-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="flex gap-2">
            <div className="relative column-menu-container">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="flex items-center gap-1.5 px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
              >
                <FaColumns size={16} />
                <span className="hidden sm:inline">Columns</span>
                <FaChevronDown size={14} className={`transition-transform ${showColumnMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Column Menu Dropdown */}
              {showColumnMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded shadow-xl z-50 border">
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
                          className={`flex items-center gap-1.5 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                            column.alwaysVisible ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isColumnVisible(column.id)}
                            onChange={() => toggleColumn(column.id)}
                            disabled={column.alwaysVisible}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
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
                        className="flex-1 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                      >
                        Show All
                      </button>
                      <button
                        onClick={resetColumns}
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <FaFilter size={16} />
              <span className="hidden sm:inline">Filters</span>
              <FaChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex gap-2 bg-gray-100 p-1 rounded">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded font-medium transition-colors text-sm ${viewMode === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded font-medium transition-colors text-sm ${viewMode === 'cards' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
              >
                <option value="">All Projects</option>
                {uniqueProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {(searchTerm || statusFilter || priorityFilter || projectFilter) && (
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center gap-1"
                >
                  <FaTimes size={14} />
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Requests Display */}
      <div>
        {/* Header for Active Requests */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaClipboardList className="mr-2 text-blue-500" />
            Active Requests ({stats.active})
          </h2>
        </div>

        {activeRequests.length === 0 ? (
          <div className="bg-white rounded shadow-md p-12 text-center mb-8">
            <FaBox className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {materialRequests.length === 0 ? 'No Material Requirements' : 'No Active Requests'}
            </h3>
            <p className="text-gray-500">
              {materialRequests.length === 0 
                ? 'Material requests from Inventory will appear here.'
                : 'All requests have been completed or past requests are not being displayed.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded shadow-md mb-8">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {isColumnVisible('request_number') && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request #</th>
                    )}
                    {isColumnVisible('material_name') && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    )}
                    {isColumnVisible('project_name') && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    )}
                    {isColumnVisible('quantity_requested') && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Requested</th>
                    )}
                    {isColumnVisible('unit') && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    )}
                    {isColumnVisible('quantity_issued') && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                    )}
                    {isColumnVisible('status') && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    )}
                    {isColumnVisible('priority') && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    )}
                    {isColumnVisible('created_at') && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    )}
                    {isColumnVisible('actions') && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    {isColumnVisible('request_number') && (
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{request.request_number}</td>
                    )}
                    {isColumnVisible('material_name') && (
                      <td className="px-4 py-3 text-sm text-gray-900">{request.material_name}</td>
                    )}
                    {isColumnVisible('project_name') && (
                      <td className="px-4 py-3 text-sm text-gray-600">{request.project_name || 'N/A'}</td>
                    )}
                    {isColumnVisible('quantity_requested') && (
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{request.quantity_requested}</td>
                    )}
                    {isColumnVisible('unit') && (
                      <td className="px-4 py-3 text-sm text-gray-600">{request.unit || 'N/A'}</td>
                    )}
                    {isColumnVisible('quantity_issued') && (
                      <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">{request.quantity_issued || 0}</td>
                    )}
                    {isColumnVisible('status') && (
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                          {request.status?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                    )}
                    {isColumnVisible('priority') && (
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(request.priority)}`}>
                          {request.priority?.toUpperCase()}
                        </span>
                      </td>
                    )}
                    {isColumnVisible('created_at') && (
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(request.created_at)}</td>
                    )}
                    {isColumnVisible('actions') && (
                      <td className="px-4 py-3 text-sm space-x-2">
                        <button
                          onClick={() => handleViewRequest(request.id)}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-xs"
                        >
                          View
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {activeRequests.map((request) => (
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
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center"
                  >
                    <FaArrowRight className="mr-2" />
                    View Details
                  </button>
                  {request.po_id && (
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

      {/* Past Requests Section */}
      {pastRequests.length > 0 && (
        <div className="mt-8">
          {/* Past Requests Header with Toggle */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaWarehouse className="mr-2 text-gray-600" />
                Past Orders/Requests ({stats.past})
              </h2>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                Completed, Fulfilled, Rejected, or Cancelled
              </span>
            </div>
            <button
              onClick={() => setShowPastRequests(!showPastRequests)}
              className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${
                showPastRequests 
                  ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {showPastRequests ? '▼ Hide' : '▶ Show'} Past Requests
            </button>
          </div>

          {/* Past Requests Content */}
          {showPastRequests && (
            <div className="space-y-4">
              {viewMode === 'table' ? (
                <div className="bg-white rounded shadow-md">
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {isColumnVisible('request_number') && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request #</th>
                          )}
                          {isColumnVisible('material_name') && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                          )}
                          {isColumnVisible('project_name') && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                          )}
                          {isColumnVisible('quantity_requested') && (
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Requested</th>
                          )}
                          {isColumnVisible('unit') && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                          )}
                          {isColumnVisible('quantity_issued') && (
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                          )}
                          {isColumnVisible('status') && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Status</th>
                          )}
                          {isColumnVisible('created_at') && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          )}
                          {isColumnVisible('actions') && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-gray-50">
                        {pastRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-100">
                            {isColumnVisible('request_number') && (
                              <td className="px-4 py-3 text-sm font-medium text-gray-700">{request.request_number}</td>
                            )}
                            {isColumnVisible('material_name') && (
                              <td className="px-4 py-3 text-sm text-gray-600">{request.material_name}</td>
                            )}
                            {isColumnVisible('project_name') && (
                              <td className="px-4 py-3 text-sm text-gray-600">{request.project_name || 'N/A'}</td>
                            )}
                            {isColumnVisible('quantity_requested') && (
                              <td className="px-4 py-3 text-sm text-right text-gray-600">{request.quantity_requested}</td>
                            )}
                            {isColumnVisible('unit') && (
                              <td className="px-4 py-3 text-sm text-gray-600">{request.unit || 'N/A'}</td>
                            )}
                            {isColumnVisible('quantity_issued') && (
                              <td className="px-4 py-3 text-sm text-right text-gray-600">{request.quantity_issued || 0}</td>
                            )}
                            {isColumnVisible('status') && (
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                                  {request.status?.replace(/_/g, ' ').toUpperCase()}
                                </span>
                              </td>
                            )}
                            {isColumnVisible('created_at') && (
                              <td className="px-4 py-3 text-sm text-gray-600">{formatDate(request.created_at)}</td>
                            )}
                            {isColumnVisible('actions') && (
                              <td className="px-4 py-3 text-sm">
                                <button
                                  onClick={() => handleViewRequest(request.id)}
                                  className="text-blue-600 hover:text-blue-800 hover:underline text-xs"
                                >
                                  View
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pastRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white rounded shadow-md hover:shadow-lg transition-shadow border-l-4 border-gray-400 opacity-85 hover:opacity-100"
                    >
                      {/* Card Header */}
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(request.status)}
                            <div>
                              <h3 className="font-semibold text-gray-700">
                                {request.request_number}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Created {formatDate(request.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(request.status)}`}>
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
                        <h4 className="text-lg font-bold text-gray-700 mb-2">
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
                          <div className="bg-gray-100 rounded p-2">
                            <div className="text-xs text-gray-600 mb-1">Quantity</div>
                            <div className="font-semibold text-gray-800">
                              {request.quantity_requested} {request.unit}
                            </div>
                          </div>
                          <div className="bg-gray-100 rounded p-2">
                            <div className="text-xs text-gray-600 mb-1">Issued</div>
                            <div className="font-semibold text-gray-800 text-sm">
                              {request.quantity_issued || 0}
                            </div>
                          </div>
                          <div className="bg-gray-100 rounded p-2">
                            <div className="text-xs text-gray-600 mb-1">Status</div>
                            <span className={`text-xs font-bold ${
                              request.status === 'fulfilled' ? 'text-green-700' :
                              request.status === 'cancelled' ? 'text-red-700' :
                              request.status === 'rejected' ? 'text-red-700' :
                              'text-gray-700'
                            }`}>
                              {request.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => handleViewRequest(request.id)}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center"
                          >
                            <FaArrowRight className="mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialRequirementsPage;