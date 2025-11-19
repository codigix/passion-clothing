import React, { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronUp, Search, Filter, Download, BarChart3,
  AlertCircle, CheckCircle, Clock, TrendingUp, Boxes, Warehouse,
  Package, Layers, Zap, AlertTriangle, GripHorizontal, TrendingDown, DollarSign
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MaterialAllocationDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Overview Tab State
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Warehouse Stock Tab State
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [stockSummary, setStockSummary] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [activeTab, searchTerm, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        await fetchProjectsOverview();
      } else if (activeTab === 'warehouse') {
        await fetchWarehouseStock();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsOverview = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('sort', sortBy);

      const response = await api.get(`/inventory/allocations/projects-overview?${params}`);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects overview');
    }
  };

  const fetchProjectDetails = async (salesOrderId) => {
    setLoadingDetails(true);
    try {
      const response = await api.get(`/inventory/allocations/project/${salesOrderId}`);
      setProjectDetails(response.data.project);
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchWarehouseStock = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      params.append('sort', sortBy);

      const response = await api.get(`/inventory/allocations/warehouse-stock?${params}`);
      setWarehouseStock(response.data.stock || []);
      setStockSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching warehouse stock:', error);
      toast.error('Failed to load warehouse stock');
    }
  };

  const toggleProjectExpand = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
      setProjectDetails(null);
    } else {
      setExpandedProject(projectId);
      fetchProjectDetails(projectId);
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'normal':
        return 'bg-green-50 border-green-200';
      case 'high_usage':
        return 'bg-amber-50 border-amber-200';
      case 'over_consumed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getHealthBadge = (status) => {
    switch (status) {
      case 'normal':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✓ Normal</span>;
      case 'high_usage':
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">⚠ High Usage</span>;
      case 'over_consumed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">✕ Over-consumed</span>;
      default:
        return null;
    }
  };

  // =================== RENDER FUNCTIONS ===================

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics - Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Active Projects</p>
              <p className="text-4xl font-bold text-blue-900 mt-2">{projects.length}</p>
              <p className="text-xs text-blue-600 mt-2">Currently tracked</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Boxes className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-l-4 border-purple-500 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Total Allocated</p>
              <p className="text-4xl font-bold text-purple-900 mt-2">
                {projects.reduce((sum, p) => sum + p.total_allocated, 0).toFixed(0)}
              </p>
              <p className="text-xs text-purple-600 mt-2">Units in projects</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">Total Consumed</p>
              <p className="text-4xl font-bold text-green-900 mt-2">
                {projects.reduce((sum, p) => sum + p.total_consumed, 0).toFixed(0)}
              </p>
              <p className="text-xs text-green-600 mt-2">Units used</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-600 text-sm font-semibold uppercase tracking-wide">Total Value</p>
              <p className="text-4xl font-bold text-amber-900 mt-2">
                ₹{projects.reduce((sum, p) => sum + p.total_value, 0).toFixed(0)}
              </p>
              <p className="text-xs text-amber-600 mt-2">Allocated inventory</p>
            </div>
            <div className="p-3 bg-amber-200 rounded-lg">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Projects</label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order # or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="latest">📅 Latest First</option>
              <option value="high_value">💰 High Value</option>
              <option value="high_usage">📊 High Usage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Cards Grid */}
      <div className="space-y-4">
        {projects.length === 0 && !loading ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg font-medium">No projects found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          projects.map((project) => (
            <React.Fragment key={project.sales_order_id}>
              {/* Project Card */}
              <div
                onClick={() => toggleProjectExpand(project.sales_order_id)}
                className={`${getHealthColor(
                  project.health_status
                )} border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 bg-white`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Boxes className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order #</p>
                        <p className="text-xl font-bold text-gray-900">{project.order_number}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getHealthBadge(project.health_status)}
                    <p className="text-xs text-gray-500 mt-2">{project.project_name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="text-lg font-semibold text-gray-900">{project.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Materials</p>
                    <p className="text-2xl font-bold text-blue-600">{project.material_count}</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 font-semibold">Allocated</p>
                    <p className="text-lg font-bold text-purple-900">{project.total_allocated.toFixed(0)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                    <p className="text-xs text-green-600 font-semibold">Consumed</p>
                    <p className="text-lg font-bold text-green-900">{project.total_consumed.toFixed(0)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-semibold">Remaining</p>
                    <p className="text-lg font-bold text-blue-900">{project.total_remaining.toFixed(0)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
                    <p className="text-xs text-amber-600 font-semibold">Value</p>
                    <p className="text-lg font-bold text-amber-900">₹{(project.total_value/1000).toFixed(0)}K</p>
                  </div>
                </div>

                {/* Utilization Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-700">Material Utilization</p>
                    <span className={`text-sm font-bold ${
                      project.utilization_percent > 110 ? 'text-red-600' :
                      project.utilization_percent >= 90 ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {project.utilization_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        project.utilization_percent > 110
                          ? 'bg-red-500'
                          : project.utilization_percent >= 90
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(project.utilization_percent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Expand Indicator */}
                <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
                  {expandedProject === project.sales_order_id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details - Material Breakdowns & Requests */}
              {expandedProject === project.sales_order_id && (
                <div className="bg-white border-t-4 border-blue-500 rounded-b-xl p-8 space-y-8">
                  {loadingDetails ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin">⏳</div>
                      <p className="text-gray-600 mt-4 font-semibold">Loading material details...</p>
                    </div>
                  ) : projectDetails ? (
                    <div className="space-y-8">
                      {/* Material Allocation Requests Section */}
                      {projectDetails.material_requests.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Layers className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Material Allocation Requests</h3>
                            <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                              {projectDetails.material_requests.length} Requests
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projectDetails.material_requests.map((req) => (
                              <div key={req.request_id} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 hover:shadow-md transition">
                                <div className="flex items-start justify-between mb-3">
                                  <p className="font-mono text-sm font-bold text-blue-700">{req.request_number}</p>
                                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                    req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {req.status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gray-500" />
                                    <p className="text-sm text-gray-600">{req.items_count} items</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Material Breakdown Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <GripHorizontal className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Material Breakdown</h3>
                          <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                            {projectDetails.materials.length} Items
                          </span>
                        </div>
                        <div className="space-y-3 overflow-x-auto">
                          {projectDetails.materials.length > 0 ? (
                            projectDetails.materials.map((material, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{material.product_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-semibold">
                                        {material.category}
                                      </span>
                                      <span className="text-xs text-gray-600">📍 {material.location}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600">Cost</p>
                                    <p className="text-lg font-bold text-amber-600">₹{material.unit_cost.toFixed(2)}</p>
                                  </div>
                                </div>

                                {/* Material Stats Grid */}
                                <div className="grid grid-cols-4 gap-2">
                                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 rounded text-center">
                                    <p className="text-xs text-purple-600 font-semibold">Allocated</p>
                                    <p className="text-sm font-bold text-purple-900">{material.allocated_quantity.toFixed(0)}</p>
                                    <p className="text-xs text-purple-600">{material.unit_of_measurement}</p>
                                  </div>
                                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 rounded text-center">
                                    <p className="text-xs text-green-600 font-semibold">Consumed</p>
                                    <p className="text-sm font-bold text-green-900">{material.consumed_quantity.toFixed(0)}</p>
                                    <p className="text-xs text-green-600">{material.unit_of_measurement}</p>
                                  </div>
                                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded text-center">
                                    <p className="text-xs text-blue-600 font-semibold">Remaining</p>
                                    <p className="text-sm font-bold text-blue-900">{material.remaining_quantity.toFixed(0)}</p>
                                    <p className="text-xs text-blue-600">{material.unit_of_measurement}</p>
                                  </div>
                                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-2 rounded text-center">
                                    <p className="text-xs text-amber-600 font-semibold">Usage %</p>
                                    <p className="text-sm font-bold text-amber-900">
                                      {material.allocated_quantity > 0 
                                        ? ((material.consumed_quantity / material.allocated_quantity) * 100).toFixed(0)
                                        : 0}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p>No materials allocated yet</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Consumption Analysis Summary */}
                      {projectDetails.consumption_analysis && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <BarChart3 className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Consumption Analysis</h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                              <p className="text-xs text-purple-600 font-semibold mb-2">Total Allocated</p>
                              <p className="text-3xl font-bold text-purple-900">{projectDetails.consumption_analysis.total_allocated.toFixed(0)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                              <p className="text-xs text-green-600 font-semibold mb-2">Total Consumed</p>
                              <p className="text-3xl font-bold text-green-900">{projectDetails.consumption_analysis.total_consumed.toFixed(0)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                              <p className="text-xs text-blue-600 font-semibold mb-2">Total Remaining</p>
                              <p className="text-3xl font-bold text-blue-900">{projectDetails.consumption_analysis.total_remaining.toFixed(0)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                              <p className="text-xs text-indigo-600 font-semibold mb-2">Overall Utilization</p>
                              <p className="text-3xl font-bold text-indigo-900">{projectDetails.consumption_analysis.consumption_percent.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderWarehouseTab = () => (
    <div className="space-y-4">
      {/* Summary Cards */}
      {stockSummary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium">Total Items</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stockSummary.total_items}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium">Current Stock</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stockSummary.total_current_stock.toFixed(0)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium">Reserved</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{stockSummary.total_reserved.toFixed(0)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium">Available</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stockSummary.total_available.toFixed(0)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium">Total Value</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">₹{stockSummary.total_value.toFixed(0)}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-gray-200 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="fabric">Fabric</option>
          <option value="thread">Thread</option>
          <option value="button">Button</option>
          <option value="zipper">Zipper</option>
          <option value="raw_material">Raw Material</option>
        </select>
      </div>

      {/* Warehouse Stock Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Product Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Category</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">Current Stock</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">Reserved</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">Available</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">Unit Cost</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">Total Value</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Location</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {warehouseStock.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{item.product_name}</td>
                <td className="px-6 py-4 text-gray-700">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-700 font-mono">{item.current_stock.toFixed(1)}</td>
                <td className="px-6 py-4 text-right text-gray-700 font-mono">{item.reserved_stock.toFixed(1)}</td>
                <td className="px-6 py-4 text-right text-green-600 font-mono font-bold">
                  {item.available_stock.toFixed(1)}
                </td>
                <td className="px-6 py-4 text-right text-gray-700 font-mono">₹{item.unit_cost.toFixed(2)}</td>
                <td className="px-6 py-4 text-right text-gray-700 font-mono font-bold">
                  ₹{item.total_value.toFixed(0)}
                </td>
                <td className="px-6 py-4 text-gray-700 text-xs">{item.location}</td>
                <td className="px-6 py-4">
                  {item.is_low_stock ? (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      Low Stock
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      OK
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {warehouseStock.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-600 w-full">
            <Warehouse className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No warehouse stock found</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Boxes className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Material Allocation Dashboard</h1>
                <p className="text-gray-600 text-sm mt-1">Project-wise material allocation and warehouse tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Projects Overview
            </button>
            <button
              onClick={() => setActiveTab('warehouse')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${
                activeTab === 'warehouse'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Warehouse Stock
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin mb-3">⏳</div>
                <p className="text-gray-600">Loading data...</p>
              </div>
            ) : activeTab === 'overview' ? (
              renderOverviewTab()
            ) : (
              renderWarehouseTab()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialAllocationDashboard;