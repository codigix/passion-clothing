import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  Search,
  Eye,
  Download,
  Package,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

const StoreReturnsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleExportReport = () => {
    const csvContent = returnsData.map(item =>
      [item.returnId, item.storeName, item.customerName, item.product, item.quantity, item.reason, item.returnValue, item.date, item.status].join(',')
    ).join('\n');
    const header = 'Return ID,Store Name,Customer Name,Product,Quantity,Reason,Return Value,Date,Status\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store-returns-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Mock data for returns
  const returnsData = [
    {
      id: 1,
      returnId: 'RTN-20241201-0001',
      storeName: 'ABC School Store',
      customerName: 'Rahul Sharma',
      product: 'School Uniform Set',
      quantity: 2,
      reason: 'Size mismatch',
      returnValue: 1800,
      date: '2024-12-01',
      status: 'processed'
    },
    {
      id: 2,
      returnId: 'RTN-20241130-0002',
      storeName: 'XYZ College Store',
      customerName: 'Priya Patel',
      product: 'Sports Jersey',
      quantity: 1,
      reason: 'Defective item',
      returnValue: 950,
      date: '2024-11-30',
      status: 'pending'
    },
    {
      id: 3,
      returnId: 'RTN-20241129-0003',
      storeName: 'PQR Academy Store',
      customerName: 'Amit Kumar',
      product: 'Winter Jacket',
      quantity: 1,
      reason: 'Changed mind',
      returnValue: 2200,
      date: '2024-11-29',
      status: 'approved'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-blue-100 text-blue-700',
      processed: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-rose-100 text-rose-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredReturns = returnsData.filter(item =>
    item.returnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Store Returns Management
        </h1>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={handleExportReport}
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Total Returns
              </p>
              <p className="text-2xl font-bold text-gray-900">247</p>
              <p className="text-sm text-gray-600 mt-1">This month</p>
            </div>
            <div className="rounded-full p-3 bg-blue-100 text-blue-600">
              <RotateCcw className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Return Value
              </p>
              <p className="text-2xl font-bold text-gray-900">₹45.2K</p>
              <p className="text-sm text-gray-600 mt-1">This month</p>
            </div>
            <div className="rounded-full p-3 bg-emerald-100 text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Pending Returns
              </p>
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-sm text-gray-600 mt-1">Awaiting approval</p>
            </div>
            <div className="rounded-full p-3 bg-amber-100 text-amber-600">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Return Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">3.2%</p>
              <p className="text-sm text-gray-600 mt-1">Of total sales</p>
            </div>
            <div className="rounded-full p-3 bg-rose-100 text-rose-600">
              <User className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search returns by ID, store, customer, product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processed">Processed</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500">
              <option value="">All Stores</option>
              <option value="ABC School Store">ABC School Store</option>
              <option value="XYZ College Store">XYZ College Store</option>
              <option value="PQR Academy Store">PQR Academy Store</option>
            </select>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReturns.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.returnId}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.storeName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.customerName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.product}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.reason}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{item.returnValue}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.date}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => navigate(`/store/returns/${item.id}`)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoreReturnsPage;