import React, { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronUp, Search, Filter, Download, BarChart3,
  AlertCircle, CheckCircle, Clock, TrendingUp, Boxes, Warehouse
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
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{projects.length}</p>
            </div>
            <Boxes className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Allocated</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {projects.reduce((sum, p) => sum + p.total_allocated, 0).toFixed(0)} Units
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Consumed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {projects.reduce((sum, p) => sum + p.total_consumed, 0).toFixed(0)} Units
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Utilization</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {projects.length > 0 
                  ? (projects.reduce((sum, p) => sum + p.utilization_percent, 0) / projects.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="latest">Latest First</option>
          <option value="high_value">High Value</option>
          <option value="high_usage">High Usage</option>
        </select>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Project</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Materials</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Allocated</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Consumed</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Utilization</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <React.Fragment key={project.sales_order_id}>
                <tr
                  className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${getHealthColor(
                    project.health_status
                  )}`}
                  onClick={() => toggleProjectExpand(project.sales_order_id)}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{project.order_number}</td>
                  <td className="px-6 py-4 text-gray-700">{project.customer_name}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {project.material_count} items
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-mono">
                    {project.total_allocated.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-mono">
                    {project.total_consumed.toFixed(1)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            project.utilization_percent > 110
                              ? 'bg-red-500'
                              : project.utilization_percent >= 90
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(project.utilization_percent, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-12">
                        {project.utilization_percent.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getHealthBadge(project.health_status)}</td>
                  <td className="px-6 py-4">
                    {expandedProject === project.sales_order_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </td>
                </tr>

                {/* Expanded Row - Project Details */}
                {expandedProject === project.sales_order_id && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan="8" className="px-6 py-4">
                      {loadingDetails ? (
                        <div className="text-center py-4">
                          <div className="inline-block animate-spin">⏳</div>
                          <p className="text-gray-600 mt-2">Loading materials...</p>
                        </div>
                      ) : projectDetails ? (
                        <div className="space-y-4">
                          {/* Material Requests */}
                          {projectDetails.material_requests.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-900 mb-2">Material Requests ({projectDetails.material_requests.length})</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {projectDetails.material_requests.map((req) => (
                                  <div key={req.request_id} className="bg-white p-3 rounded border border-gray-300">
                                    <p className="font-mono text-sm text-blue-600">{req.request_number}</p>
                                    <p className="text-xs text-gray-600 mt-1">Status: {req.status}</p>
                                    <p className="text-xs text-gray-600">{req.items_count} items</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Materials Table */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Allocated Materials ({projectDetails.materials.length})</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-white border-b border-gray-300">
                                  <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Material</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Category</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-700">Allocated</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-700">Consumed</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-700">Remaining</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-700">Unit Cost</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Location</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {projectDetails.materials.map((material, idx) => (
                                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                      <td className="px-3 py-2 font-medium text-gray-900">{material.product_name}</td>
                                      <td className="px-3 py-2 text-gray-700">
                                        <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                                          {material.category}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-700 font-mono">
                                        {material.allocated_quantity.toFixed(1)} {material.unit_of_measurement}
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-700 font-mono">
                                        {material.consumed_quantity.toFixed(1)}
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-700 font-mono">
                                        {material.remaining_quantity.toFixed(1)}
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-700 font-mono">
                                        ₹{material.unit_cost.toFixed(2)}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700 text-xs">{material.location}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Consumption Analysis */}
                          {projectDetails.consumption_analysis && (
                            <div className="bg-white p-4 rounded border border-gray-300">
                              <h4 className="font-semibold text-gray-900 mb-3">Consumption Analysis</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Total Allocated</p>
                                  <p className="font-bold text-lg text-gray-900">
                                    {projectDetails.consumption_analysis.total_allocated.toFixed(1)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Consumed</p>
                                  <p className="font-bold text-lg text-green-600">
                                    {projectDetails.consumption_analysis.total_consumed.toFixed(1)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Remaining</p>
                                  <p className="font-bold text-lg text-blue-600">
                                    {projectDetails.consumption_analysis.total_remaining.toFixed(1)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Utilization</p>
                                  <p className="font-bold text-lg text-purple-600">
                                    {projectDetails.consumption_analysis.consumption_percent.toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {projects.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-600">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No projects found</p>
          </div>
        )}
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