import React, { useState, useEffect } from 'react';
import { FaBox, FaChartBar, FaCheckCircle, FaExclamationTriangle, FaSearch, FaSpinner } from 'react-icons/fa';
import { ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './ProjectAllocationDashboard.css';

const ProjectAllocationDashboard = () => {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'warehouse'
  
  // Projects Tab State
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsData, setProjectsData] = useState([]);
  const [projectsSummary, setProjectsSummary] = useState(null);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [projectDetails, setProjectDetails] = useState({});
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectSort, setProjectSort] = useState('latest');
  
  // Warehouse Tab State
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [warehouseData, setWarehouseData] = useState([]);
  const [warehouseSummary, setWarehouseSummary] = useState(null);
  const [warehouseSearchQuery, setWarehouseSearchQuery] = useState('');
  const [warehouseCategory, setWarehouseCategory] = useState('all');

  // Fetch projects overview
  const fetchProjectsOverview = async () => {
    try {
      setProjectsLoading(true);
      const response = await api.get('/inventory/allocations/projects-overview', {
        params: {
          search: projectSearchQuery,
          sort: projectSort
        }
      });
      
      setProjectsData(response.data.projects || []);
      setProjectsSummary(response.data.summary || {});
    } catch (error) {
      console.error('Error fetching projects overview:', error);
      toast.error('Failed to load projects overview');
    } finally {
      setProjectsLoading(false);
    }
  };

  // Fetch project details (drill-down)
  const fetchProjectDetails = async (salesOrderId) => {
    if (projectDetails[salesOrderId]) {
      // Already loaded, just toggle
      setExpandedProjectId(expandedProjectId === salesOrderId ? null : salesOrderId);
      return;
    }

    try {
      const [projectRes, requestsRes] = await Promise.all([
        api.get(`/inventory/allocations/project/${salesOrderId}`),
        api.get(`/inventory/allocations/requests/${salesOrderId}`)
      ]);
      
      setProjectDetails(prev => ({
        ...prev,
        [salesOrderId]: {
          ...projectRes.data.project,
          requests: requestsRes.data.requests || []
        }
      }));
      setExpandedProjectId(salesOrderId);
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    }
  };

  // Handle approve allocation request
  const handleApproveRequest = async (requestId, projectId) => {
    try {
      const response = await api.patch(`/inventory/allocations/request/${requestId}/approve`, {
        reason: 'Approved by inventory team'
      });
      
      if (response.data.success) {
        toast.success('Allocation request approved');
        setProjectDetails(prev => ({
          ...prev,
          [projectId]: {
            ...prev[projectId],
            requests: prev[projectId].requests.map(r => 
              r.id === requestId ? { ...r, status: 'approved' } : r
            )
          }
        }));
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  // Handle reject allocation request
  const handleRejectRequest = async (requestId, projectId) => {
    try {
      const response = await api.patch(`/inventory/allocations/request/${requestId}/reject`, {
        reason: 'Rejected - insufficient stock or other reason'
      });
      
      if (response.data.success) {
        toast.success('Allocation request rejected');
        setProjectDetails(prev => ({
          ...prev,
          [projectId]: {
            ...prev[projectId],
            requests: prev[projectId].requests.map(r => 
              r.id === requestId ? { ...r, status: 'rejected' } : r
            )
          }
        }));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  // Fetch warehouse stock
  const fetchWarehouseStock = async () => {
    try {
      setWarehouseLoading(true);
      const response = await api.get('/inventory/allocations/warehouse-stock', {
        params: {
          search: warehouseSearchQuery,
          category: warehouseCategory
        }
      });
      
      setWarehouseData(response.data.stock || []);
      setWarehouseSummary(response.data.summary || {});
    } catch (error) {
      console.error('Error fetching warehouse stock:', error);
      toast.error('Failed to load warehouse stock');
    } finally {
      setWarehouseLoading(false);
    }
  };



  // Initial load and search/sort updates
  useEffect(() => {
    fetchProjectsOverview();
  }, [projectSearchQuery, projectSort]);

  useEffect(() => {
    fetchWarehouseStock();
  }, [warehouseSearchQuery, warehouseCategory]);

  // Health status color & icon
  const getHealthColor = (status) => {
    if (status === 'over_consumed') return 'bg-red-100 text-red-700 border border-red-300';
    if (status === 'high_usage') return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    return 'bg-green-100 text-green-700 border border-green-300';
  };

  const getHealthIcon = (status) => {
    if (status === 'over_consumed') return <FaExclamationTriangle className="inline mr-1" />;
    if (status === 'high_usage') return <FaExclamationTriangle className="inline mr-1" />;
    return <FaCheckCircle className="inline mr-1" />;
  };

  const getHealthLabel = (status) => {
    if (status === 'over_consumed') return 'Over-Consumed';
    if (status === 'high_usage') return 'High Usage';
    return 'Normal';
  };

  // Stock status color
  const getStockStatus = (currentStock, reorderLevel) => {
    if (currentStock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border border-red-300' };
    if (currentStock <= reorderLevel * 0.5) return { label: 'Critical', color: 'bg-red-100 text-red-600 border border-red-300' };
    if (currentStock <= reorderLevel) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700 border border-yellow-300' };
    return { label: 'Normal', color: 'bg-green-100 text-green-700 border border-green-300' };
  };

  // ==================== PROJECTS TAB ====================

  const ProjectsTab = () => (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-700 text-sm font-medium">Active Projects</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{projectsSummary?.total_projects || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-purple-700 text-sm font-medium">Total Allocated</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">{(projectsSummary?.total_allocated || 0).toFixed(1)}</p>
          <p className="text-xs text-purple-600 mt-1">units</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <p className="text-orange-700 text-sm font-medium">Total Consumed</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">{(projectsSummary?.total_consumed || 0).toFixed(1)}</p>
          <p className="text-xs text-orange-600 mt-1">units</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
          <p className="text-emerald-700 text-sm font-medium">Avg Utilization</p>
          <p className="text-3xl font-bold text-emerald-900 mt-2">
            {projectsSummary?.total_allocated > 0 
              ? ((projectsSummary?.total_consumed / projectsSummary?.total_allocated) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-3 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={projectSearchQuery}
              onChange={(e) => setProjectSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <select
          value={projectSort}
          onChange={(e) => setProjectSort(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="latest">Latest Orders</option>
          <option value="high_value">Highest Value</option>
          <option value="high_usage">High Usage</option>
        </select>
      </div>

      {/* Projects Table */}
      {projectsLoading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-3xl text-blue-500 mr-3" />
          <span className="text-gray-600">Loading projects...</span>
        </div>
      ) : projectsData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FaBox className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No projects with material allocations found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Materials</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Allocated</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Consumed</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Remaining</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Util %</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {projectsData.map((project) => (
                  <React.Fragment key={project.sales_order_id}>
                    <tr className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.order_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{project.customer_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {project.material_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium">
                        {project.total_allocated.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium">
                        {project.total_consumed.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium">
                        {project.remaining_quantity.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium">{project.utilization_percent.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getHealthColor(project.health_status)}`}>
                          {getHealthIcon(project.health_status)}
                          {getHealthLabel(project.health_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => fetchProjectDetails(project.sales_order_id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {expandedProjectId === project.sales_order_id ? <ChevronUp /> : <ChevronDown />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Row - Material Details */}
                    {expandedProjectId === project.sales_order_id && projectDetails[project.sales_order_id] && (
                      <tr>
                        <td colSpan="9" className="px-4 py-4 bg-gray-50">
                          <ProjectDetailsPanel 
                            details={projectDetails[project.sales_order_id]}
                            onApproveRequest={handleApproveRequest}
                            onRejectRequest={handleRejectRequest}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ==================== WAREHOUSE TAB ====================

  const WarehouseTab = () => (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-700 text-sm font-medium">Total Items</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{warehouseSummary?.total_items || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-purple-700 text-sm font-medium">Current Stock</p>
          <p className="text-2xl font-bold text-purple-900 mt-2">{(warehouseSummary?.total_current_stock || 0).toFixed(1)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <p className="text-yellow-700 text-sm font-medium">Reserved</p>
          <p className="text-2xl font-bold text-yellow-900 mt-2">{(warehouseSummary?.total_reserved || 0).toFixed(1)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
          <p className="text-emerald-700 text-sm font-medium">Available</p>
          <p className="text-2xl font-bold text-emerald-900 mt-2">{(warehouseSummary?.total_available || 0).toFixed(1)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <p className="text-red-700 text-sm font-medium">Low Stock Items</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{warehouseSummary?.low_stock_items || 0}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or batch..."
              value={warehouseSearchQuery}
              onChange={(e) => setWarehouseSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <select
          value={warehouseCategory}
          onChange={(e) => setWarehouseCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="fabric">Fabric</option>
          <option value="thread">Thread</option>
          <option value="button">Button</option>
          <option value="zipper">Zipper</option>
          <option value="raw_material">Raw Material</option>
          <option value="finished_goods">Finished Goods</option>
        </select>
      </div>

      {/* Warehouse Stock Table */}
      {warehouseLoading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-3xl text-blue-500 mr-3" />
          <span className="text-gray-600">Loading warehouse stock...</span>
        </div>
      ) : warehouseData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FaBox className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No warehouse stock items found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Current</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Reserved</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Available</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Unit Cost</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Total Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Location</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {warehouseData.map((item) => {
                  const stockStatus = getStockStatus(item.current_stock, item.reorder_level);
                  return (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.product_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                          {item.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                        {item.current_stock.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-yellow-700">
                        {item.reserved_stock.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-emerald-700">
                        {item.available_stock.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ₹{item.unit_cost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                        ₹{item.total_value.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.location}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Material Allocation Dashboard</h1>
        <p className="text-gray-600">Track project-wise material allocation and warehouse stock</p>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex border-b border-gray-200 bg-white rounded-t-lg">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'projects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaChartBar className="inline mr-2" />
            Project Allocations
          </button>
          
          <button
            onClick={() => setActiveTab('warehouse')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'warehouse'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaBox className="inline mr-2" />
            Warehouse Stock
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'warehouse' && <WarehouseTab />}
      </div>


    </div>
  );
};

// Project Details Panel Component
const ProjectDetailsPanel = ({ details, onApproveRequest, onRejectRequest }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
      approved: 'bg-green-100 text-green-700 border border-green-300',
      rejected: 'bg-red-100 text-red-700 border border-red-300',
      completed: 'bg-blue-100 text-blue-700 border border-blue-300'
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-amber-100 text-amber-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="space-y-6">

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Total Materials</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {details.consumption_analysis?.material_count || 0}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Total Allocated</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {(details.consumption_analysis?.total_allocated || 0).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Total Consumed</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {(details.consumption_analysis?.total_consumed || 0).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Consumption %</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {(details.consumption_analysis?.consumption_percent || 0).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Materials Table */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Materials Breakdown</h4>
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Product Name</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">Category</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Allocated</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Consumed</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Remaining</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Unit Cost</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Material Value</th>
                </tr>
              </thead>
              <tbody>
                {details.materials?.map((material, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">{material.product_name}</td>
                    <td className="px-4 py-2 text-center text-gray-600">
                      <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                        {material.category}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900 font-medium">
                      {parseFloat(material.allocated_quantity || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900 font-medium">
                      {parseFloat(material.consumed_quantity || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900 font-medium">
                      {parseFloat(material.remaining_quantity || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      ₹{parseFloat(material.unit_cost || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900 font-bold">
                      ₹{parseFloat(material.material_value || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Material Allocation Requests */}
      {details.requests && details.requests.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Material Allocation Requests</h4>
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Request #</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">Priority</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">Status</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">Items</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-700">Value</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {details.requests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900 font-medium">{request.request_number}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center text-gray-900">{request.total_items}</td>
                      <td className="px-4 py-2 text-right text-gray-900">₹{parseFloat(request.total_value || 0).toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        {request.status === 'pending' && (
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => onApproveRequest(request.id, details.sales_order_id)}
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded font-medium transition-colors"
                              title="Approve request"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => onRejectRequest(request.id, details.sales_order_id)}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-medium transition-colors"
                              title="Reject request"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        {request.status === 'approved' && (
                          <span className="text-green-600 text-xs font-medium">✓ Approved</span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="text-red-600 text-xs font-medium">✕ Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Material Requests (Legacy - if still available) */}
      {details.material_requests?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Associated Material Requests</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {details.material_requests.map((request, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{request.request_number}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        request.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : request.status === 'issued'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.status}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{request.items_count} items</p>
                    <p className="text-sm text-gray-600">₹{parseFloat(request.total_value || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



export default ProjectAllocationDashboard;