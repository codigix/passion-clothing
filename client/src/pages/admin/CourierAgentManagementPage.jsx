import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaStar } from 'react-icons/fa';
import { AlertCircle, Truck, Mail, Phone, MapPin, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const CourierAgentManagementPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [formData, setFormData] = useState({
    agent_name: '',
    email: '',
    phone: '',
    courier_company: '',
    region: '',
    notes: ''
  });

  useEffect(() => {
    fetchAgents();
    fetchCompanies();
  }, [searchTerm, filterCompany, filterStatus]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/courier-partners?is_active=true');
      const uniqueCompanies = [...new Set((response.data.courierPartners || []).map(p => p.company_name))];
      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCompany) params.append('courier_company', filterCompany);
      if (filterStatus) params.append('is_active', filterStatus === 'active');
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/courier-agents?${params}`);
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      toast.error('Failed to fetch courier agents');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();

    if (!formData.agent_name || !formData.email || !formData.phone || !formData.courier_company) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await api.post('/courier-agents/add', formData);
      toast.success(`Agent added! Temp password: ${response.data.tempPassword}`);
      
      // Copy password to clipboard
      navigator.clipboard.writeText(response.data.tempPassword);
      toast.success('Temporary password copied to clipboard');
      
      setFormData({
        agent_name: '',
        email: '',
        phone: '',
        courier_company: '',
        region: '',
        notes: ''
      });
      setShowAddForm(false);
      fetchAgents();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add agent';
      toast.error(errorMsg);
    }
  };

  const handleUpdateAgent = async (id, updates) => {
    try {
      await api.put(`/courier-agents/${id}`, updates);
      toast.success('Agent updated successfully');
      fetchAgents();
    } catch (error) {
      toast.error('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (id, name) => {
    if (!window.confirm(`Deactivate agent "${name}"?`)) return;

    try {
      await api.delete(`/courier-agents/${id}`);
      toast.success('Agent deactivated');
      fetchAgents();
    } catch (error) {
      toast.error('Failed to deactivate agent');
    }
  };

  const handleResetPassword = async (id, name) => {
    try {
      const response = await api.post(`/courier-agents/${id}/reset-password`);
      toast.success(`Password reset! Temp password: ${response.data.tempPassword}`);
      navigator.clipboard.writeText(response.data.tempPassword);
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Truck className="w-8 h-8 text-blue-600" />
                Courier Agent Management
              </h1>
              <p className="text-gray-600 mt-1">Manage all courier agents and their performance</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Add New Agent
            </button>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Company Filter */}
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Refresh */}
              <button
                onClick={fetchAgents}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Add Agent Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Courier Agent</h2>
            <form onSubmit={handleAddAgent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Agent Name *"
                value={formData.agent_name}
                onChange={(e) => setFormData({...formData, agent_name: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Courier Company *"
                value={formData.courier_company}
                onChange={(e) => setFormData({...formData, courier_company: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Region (Optional)"
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Notes (Optional)"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 md:col-span-2"
                rows="2"
              />
              <div className="flex gap-2 md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Add Agent
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Agents Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No courier agents found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Agent ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Region</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Performance</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Shipments</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agents.map(agent => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{agent.agent_id}</td>
                      <td className="px-4 py-3 text-sm">{agent.agent_name}</td>
                      <td className="px-4 py-3 text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {agent.email}
                      </td>
                      <td className="px-4 py-3 text-sm">{agent.courier_company}</td>
                      <td className="px-4 py-3 text-sm">{agent.region || '-'}</td>
                      <td className="px-4 py-3 text-sm flex items-center gap-1">
                        {agent.performance_rating > 0 && (
                          <>
                            <FaStar className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold">{agent.performance_rating.toFixed(1)}</span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">{agent.total_shipments}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          agent.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <button
                          onClick={() => handleResetPassword(agent.id, agent.agent_name)}
                          className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 text-xs"
                          title="Reset Password"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent.id, agent.agent_name)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                          title="Deactivate"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Total Agents</p>
            <p className="text-3xl font-bold text-blue-600">{agents.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Active Agents</p>
            <p className="text-3xl font-bold text-green-600">{agents.filter(a => a.is_active).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Verified Agents</p>
            <p className="text-3xl font-bold text-purple-600">{agents.filter(a => a.is_verified).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Total Shipments</p>
            <p className="text-3xl font-bold text-indigo-600">{agents.reduce((sum, a) => sum + a.total_shipments, 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierAgentManagementPage;