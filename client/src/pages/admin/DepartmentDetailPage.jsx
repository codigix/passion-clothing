import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Users, Briefcase, TrendingUp, AlertCircle,
  CheckCircle2, Clock, BarChart3, Filter, Download, Eye
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DepartmentDetailPage = () => {
  const { departmentName } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState(null);
  const [employeePerformance, setEmployeePerformance] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDepartmentData();
  }, [departmentName]);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const [deptRes, empRes] = await Promise.all([
        api.get(`/admin/department/${departmentName}`),
        api.get(`/admin/department/${departmentName}/employee-performance`)
      ]);

      setDepartmentData(deptRes.data);
      setEmployeePerformance(empRes.data);
    } catch (error) {
      console.error('Error fetching department data:', error);
      toast.error('Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  const getDeptColor = (dept) => {
    const colors = {
      sales: 'from-blue-600 to-blue-700',
      procurement: 'from-purple-600 to-purple-700',
      manufacturing: 'from-orange-600 to-orange-700',
      inventory: 'from-green-600 to-green-700',
      finance: 'from-red-600 to-red-700',
      shipment: 'from-indigo-600 to-indigo-700',
      store: 'from-teal-600 to-teal-700',
      outsourcing: 'from-pink-600 to-pink-700',
      samples: 'from-yellow-600 to-yellow-700',
      admin: 'from-gray-600 to-gray-700'
    };
    return colors[dept] || 'from-gray-600 to-gray-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading department data...</p>
        </div>
      </div>
    );
  }

  if (!departmentData) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="text-center py-8">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Failed to load department data</p>
        </div>
      </div>
    );
  }

  const colorGradient = getDeptColor(departmentName);
  const filteredProjects = filterStatus === 'all'
    ? departmentData.projects
    : departmentData.projects.filter(p => p.status === filterStatus);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className={`bg-gradient-to-r ${colorGradient} rounded-lg p-8 text-white mb-8`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold capitalize mb-2">{departmentName} Department</h1>
              <p className="text-blue-100">Comprehensive department overview and analytics</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Download size={20} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Total Employees</h3>
            <Users size={24} className="text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{departmentData.totalEmployees}</div>
          <div className="text-sm text-green-600">{departmentData.activeEmployees} active</div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Projects</h3>
            <Briefcase size={24} className="text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{departmentData.projects.length}</div>
          <div className="text-sm text-gray-600">total projects</div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Total Value</h3>
            <TrendingUp size={24} className="text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">₹{(departmentData.stats.totalValue || 0 / 100000).toFixed(1)}L</div>
          <div className="text-sm text-gray-600">department value</div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Performance</h3>
            <BarChart3 size={24} className="text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {departmentData.projects.length > 0
              ? ((departmentData.projects.filter(p => p.status === 'completed').length / departmentData.projects.length) * 100).toFixed(0)
              : 0}%
          </div>
          <div className="text-sm text-gray-600">completion rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
        <div className="border-b border-gray-200 flex">
          {['overview', 'employees', 'projects'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Department Statistics</h3>
                  <div className="space-y-3">
                    {Object.entries(departmentData.stats).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-semibold text-gray-900">
                          {typeof value === 'number' ? (value > 1000 ? `₹${(value / 100000).toFixed(1)}L` : value) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Key Performance Indicators</h3>
                  <div className="space-y-3">
                    {departmentData.projects.length > 0 && (
                      <>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Completed Projects</span>
                            <span className="font-semibold text-green-700">
                              {departmentData.projects.filter(p => p.status === 'completed').length}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {((departmentData.projects.filter(p => p.status === 'completed').length / departmentData.projects.length) * 100).toFixed(1)}% completion rate
                          </div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">In Progress</span>
                            <span className="font-semibold text-yellow-700">
                              {departmentData.projects.filter(p => p.status === 'in_progress').length}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Currently active projects
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Pending</span>
                            <span className="font-semibold text-blue-700">
                              {departmentData.projects.filter(p => ['draft', 'pending'].includes(p.status)).length}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Awaiting action
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">Team Members ({departmentData.totalEmployees})</h3>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Employees</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {departmentData.employees
                  .filter(emp => filterStatus === 'all' || emp.status === filterStatus)
                  .map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{emp.name}</h4>
                          <p className="text-sm text-gray-600">{emp.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(emp.status)}`}>
                        {emp.status}
                      </span>
                    </div>
                  ))}

                {departmentData.employees.filter(emp => filterStatus === 'all' || emp.status === filterStatus).length === 0 && (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No employees found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">Projects ({departmentData.projects.length})</h3>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Projects</option>
                    {[...new Set(departmentData.projects.map(p => p.status).filter(s => s))].map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{project.po_number || project.order_number || project.shipment_number || `Project #${project.id}`}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Created: {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                        {project.status ? project.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>
                        {project.final_amount && (
                          <span className="font-semibold text-gray-900">₹{(project.final_amount / 100000).toFixed(2)}L</span>
                        )}
                        {project.shipping_cost && (
                          <span className="font-semibold text-gray-900">₹{(project.shipping_cost / 100000).toFixed(2)}L</span>
                        )}
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <Eye size={16} />
                        View
                      </button>
                    </div>
                  </div>
                ))}

                {filteredProjects.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No projects found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailPage;
