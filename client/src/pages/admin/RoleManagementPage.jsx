import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaShieldAlt, FaEye, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const RoleManagementPage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchRoles();
  }, [selectedDepartment]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/roles');
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter is handled in the filteredRoles computation
  };

  const handleRoleViewDetails = (roleId) => {
    navigate(`/admin/roles/${roleId}`);
  };

  const handleRoleEdit = (roleId) => {
    navigate(`/admin/roles/edit/${roleId}`);
  };

  const handleRoleDelete = async (roleId, roleName) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/roles/${roleId}`);
        alert('Role deleted successfully');
        fetchRoles(); // Refresh the list
      } catch (error) {
        alert('Failed to delete role');
      }
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      sales: 'bg-blue-500',
      inventory: 'bg-green-500',
      manufacturing: 'bg-orange-600',
      procurement: 'bg-purple-600',
      outsourcing: 'bg-pink-600',
      shipment: 'bg-indigo-600',
      store: 'bg-teal-600',
      finance: 'bg-red-500',
      admin: 'bg-gray-600',
      samples: 'bg-yellow-600'
    };
    return colors[department] || 'bg-gray-600';
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || role.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  if (loading && roles.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-4 text-gray-600">Loading roles...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Role Management</h1>
        <div className="text-sm text-gray-500 mb-4">Manage system roles and permissions</div>
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100"
            >
              ← Back to Admin Dashboard
            </button>
          </div>
          <button
            onClick={() => navigate('/admin/roles/create')}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1.5"
          >
            <FaPlus className="text-sm" /> Create New Role
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded shadow border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
              />
            </div>
          </form>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            <option value="sales">Sales</option>
            <option value="procurement">Procurement</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="inventory">Inventory</option>
            <option value="finance">Finance</option>
            <option value="admin">Admin</option>
            <option value="store">Store</option>
            <option value="shipment">Shipment</option>
            <option value="outsourcing">Outsourcing</option>
            <option value="samples">Samples</option>
          </select>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredRoles.length === 0 ? (
          <div className="col-span-full bg-white rounded shadow border border-gray-200 p-12 text-center">
            <FaShieldAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
            <p className="text-gray-500">
              {loading ? 'Loading roles...' : 'Try adjusting your search criteria.'}
            </p>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div key={role.id} className="bg-white rounded shadow border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                        <FaShieldAlt className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {role.display_name || role.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Level {role.level}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getDepartmentColor(role.department)}`}>
                    {role.department}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {role.description || 'No description available'}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaUsers className="mr-1" />
                    <span>Users: {role.userCount || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRoleViewDetails(role.id)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                      title="View Details"
                    >
                      <FaEye size={14} />
                    </button>
                    <button
                      onClick={() => handleRoleEdit(role.id)}
                      className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded transition-colors"
                      title="Edit Role"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleRoleDelete(role.id, role.display_name || role.name)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                      title="Delete Role"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 bg-white rounded shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{roles.length}</div>
            <div className="text-sm text-gray-500">Total Roles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {roles.filter(r => r.level <= 2).length}
            </div>
            <div className="text-sm text-gray-500">Basic Roles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {roles.filter(r => r.level >= 3 && r.level <= 4).length}
            </div>
            <div className="text-sm text-gray-500">Manager Roles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {roles.filter(r => r.level >= 5).length}
            </div>
            <div className="text-sm text-gray-500">Admin Roles</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementPage;