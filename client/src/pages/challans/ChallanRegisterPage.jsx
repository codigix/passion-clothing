import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaPrint,
  FaTruck,
  FaArrowDown,
  FaArrowUp,
  FaFileInvoice,
  FaChevronDown,
  FaClock,
  FaCheck
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ChallanRegisterPage = () => {
  const navigate = useNavigate();
  const [challans, setChallans] = useState([]);
  const [filteredChallans, setFilteredChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);

  useEffect(() => {
    fetchChallans();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [challans, searchTerm, statusFilter, typeFilter]);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/challans');
      setChallans(response.data.challans || []);
    } catch (error) {
      console.error('Failed to fetch challans:', error);
      toast.error('Failed to load challans');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...challans];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(challan =>
        challan.challan_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challan.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challan.location_from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challan.location_to?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(challan => challan.status === statusFilter);
    }

    // Type filter
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(challan => challan.type === typeFilter);
    }

    setFilteredChallans(filtered);
  };

  const handleDelete = async (challan) => {
    if (window.confirm(`Are you sure you want to delete challan ${challan.challan_number}?`)) {
      try {
        await api.delete(`/challans/${challan.id}`);
        toast.success('Challan deleted successfully');
        fetchChallans();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete challan');
      }
    }
  };

  const handlePrint = (challan) => {
    // TODO: Implement print functionality
    toast.success(`Printing challan ${challan.challan_number}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-700', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
      completed: { color: 'bg-blue-100 text-blue-700', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      inward: { color: 'bg-green-50 text-green-600', icon: FaArrowDown, label: 'Inward' },
      outward: { color: 'bg-blue-50 text-blue-600', icon: FaArrowUp, label: 'Outward' },
      dispatch: { color: 'bg-purple-50 text-purple-600', icon: FaTruck, label: 'Dispatch' },
      receipt: { color: 'bg-teal-50 text-teal-600', icon: FaArrowDown, label: 'Receipt' },
      internal_transfer: { color: 'bg-orange-50 text-orange-600', icon: FaArrowUp, label: 'Internal Transfer' },
      sample_outward: { color: 'bg-indigo-50 text-indigo-600', icon: FaArrowUp, label: 'Sample Outward' },
      sample_inward: { color: 'bg-cyan-50 text-cyan-600', icon: FaArrowDown, label: 'Sample Inward' },
      return: { color: 'bg-yellow-50 text-yellow-600', icon: FaArrowDown, label: 'Return' }
    };
    const config = typeConfig[type] || typeConfig.outward;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        <Icon className="text-xs" />
        {config.label}
      </span>
    );
  };

  const getSubTypeBadge = (subType) => {
    const labels = {
      sales: 'Sales',
      purchase: 'Purchase',
      production: 'Production',
      outsourcing: 'Outsourcing',
      store_issue: 'Store Issue',
      store_return: 'Store Return',
      sample: 'Sample',
      waste: 'Waste',
      adjustment: 'Adjustment'
    };
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
        {labels[subType] || subType}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Challan Register</h1>
          <p className="text-gray-600 mt-1">Manage and track all challans</p>
        </div>
        <button
          onClick={() => navigate('/challans/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <FaPlus />
          Create Challan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Challans</p>
              <p className="text-2xl font-bold text-gray-800">{challans.length}</p>
            </div>
            <FaFileInvoice className="text-3xl text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {challans.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <FaClock className="text-3xl text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {challans.filter(c => c.status === 'approved').length}
              </p>
            </div>
            <FaCheck className="text-3xl text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {challans.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <FaTruck className="text-3xl text-blue-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by challan number, party name, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaFilter />
            Filters
            <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="inward">Inward</option>
                <option value="outward">Outward</option>
                <option value="dispatch">Dispatch</option>
                <option value="receipt">Receipt</option>
                <option value="internal_transfer">Internal Transfer</option>
                <option value="sample_outward">Sample Outward</option>
                <option value="sample_inward">Sample Inward</option>
                <option value="return">Return</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Challans Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Challan Number
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub Type
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Party Name
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From → To
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading challans...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No challans found
                  </td>
                </tr>
              ) : (
                filteredChallans.map((challan) => (
                  <tr key={challan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{challan.challan_number}</div>
                      {challan.order_number && (
                        <div className="text-xs text-gray-500">Order: {challan.order_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(challan.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSubTypeBadge(challan.sub_type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{challan.party_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{challan.location_from || 'N/A'}</span>
                        <span className="text-gray-400 mx-1">→</span>
                        <span className="font-medium">{challan.location_to || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(challan.challan_date)}</div>
                      {challan.expected_date && (
                        <div className="text-xs text-gray-500">
                          Expected: {formatDate(challan.expected_date)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(challan.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/challans/${challan.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => navigate(`/challans/edit/${challan.id}`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handlePrint(challan)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Print"
                        >
                          <FaPrint />
                        </button>
                        <button
                          onClick={() => handleDelete(challan)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-center text-gray-600 text-sm">
        Showing {filteredChallans.length} of {challans.length} challans
      </div>
    </div>
  );
};

export default ChallanRegisterPage;