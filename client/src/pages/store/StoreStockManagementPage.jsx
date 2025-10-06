import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Eye,
  Package,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SELF_REGISTER_ALLOWED_DEPARTMENTS, DEPARTMENT_DISPLAY_MAP } from '../../config/rolePolicies';

const StoreStockManagementPage = () => {
  const navigate = useNavigate();
  const [stockSearch, setStockSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [stockTab, setStockTab] = useState(0);

  // Stock Management Data
  const stockItems = [
    {
      id: 1,
      name: 'School Uniform Set',
      category: 'Uniforms',
      totalQuantity: 1500,
      availableQuantity: 1200,
      allocatedQuantity: 300,
      department: 'store',
      unitPrice: 450,
      lastUpdated: '2024-12-01',
      status: 'in_stock'
    },
    {
      id: 2,
      name: 'Sports T-Shirt',
      category: 'Sports Wear',
      totalQuantity: 800,
      availableQuantity: 650,
      allocatedQuantity: 150,
      department: 'store',
      unitPrice: 280,
      lastUpdated: '2024-11-30',
      status: 'in_stock'
    },
    {
      id: 3,
      name: 'Winter Jacket',
      category: 'Outerwear',
      totalQuantity: 200,
      availableQuantity: 80,
      allocatedQuantity: 120,
      department: 'store',
      unitPrice: 1200,
      lastUpdated: '2024-11-29',
      status: 'low_stock'
    },
    {
      id: 4,
      name: 'School Bag',
      category: 'Accessories',
      totalQuantity: 600,
      availableQuantity: 450,
      allocatedQuantity: 150,
      department: 'store',
      unitPrice: 350,
      lastUpdated: '2024-12-01',
      status: 'in_stock'
    }
  ];

  const filteredStock = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
                         item.category.toLowerCase().includes(stockSearch.toLowerCase());
    const matchesDepartment = !selectedDepartment || item.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAddItem = () => {
    navigate('/store/stock/add');
  };

  const handleExport = () => {
    const csvContent = stockItems.map(item =>
      [item.id, item.name, item.category, item.totalQuantity, item.availableQuantity, item.allocatedQuantity, item.department, item.unitPrice, item.status, item.lastUpdated].join(',')
    ).join('\n');
    const header = 'ID,Name,Category,Total Qty,Available Qty,Allocated Qty,Department,Unit Price,Status,Last Updated\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store-stock.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEdit = (item) => {
    navigate(`/store/stock/edit/${item.id}`);
  };

  const handleAllocate = (item) => {
    navigate(`/store/stock/allocate/${item.id}`);
  };

  const handleViewDetails = (item) => {
    navigate(`/store/stock/${item.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Store Stock Management
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/store')}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-blue-600">Total Items</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{stockItems.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            <span className="text-sm font-medium text-green-600">In Stock</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">
            {stockItems.filter(item => item.status === 'in_stock').length}
          </p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-amber-600" size={20} />
            <span className="text-sm font-medium text-amber-600">Low Stock</span>
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-2">
            {stockItems.filter(item => item.status === 'low_stock').length}
          </p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="text-indigo-600" size={20} />
            <span className="text-sm font-medium text-indigo-600">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900 mt-2">
            ₹{stockItems.reduce((sum, item) => sum + (item.availableQuantity * item.unitPrice), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by item name or category..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {SELF_REGISTER_ALLOWED_DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>
                {DEPARTMENT_DISPLAY_MAP[dept] || dept}
              </option>
            ))}
          </select>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          onClick={handleAddItem}
        >
          <Plus size={18} />
          Add Item
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={handleExport}
        >
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Stock Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Qty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStock.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">ID: {item.id}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-900">{item.category}</td>
                <td className="px-4 py-3 text-gray-900">{item.totalQuantity}</td>
                <td className="px-4 py-3 text-gray-900">{item.availableQuantity}</td>
                <td className="px-4 py-3 text-gray-900">{item.allocatedQuantity}</td>
                <td className="px-4 py-3 text-gray-900 capitalize">
                  {DEPARTMENT_DISPLAY_MAP[item.department] || item.department}
                </td>
                <td className="px-4 py-3 text-gray-900">₹{item.unitPrice}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'in_stock'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status === 'in_stock' ? 'In Stock' : 'Low Stock'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      title="Allocate"
                      onClick={() => handleAllocate(item)}
                    >
                      <Package size={16} />
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-800"
                      title="View Details"
                      onClick={() => handleViewDetails(item)}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStock.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No stock items found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default StoreStockManagementPage;