import React from 'react';
import { FaReceipt, FaPlus, FaSearch, FaEye, FaDownload, FaChartLine, FaClock, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ChallanDashboard = () => {
  const navigate = useNavigate();

  // Mock data
  const stats = {
    totalChallans: 342,
    pendingApproval: 15,
    approved: 298,
    rejected: 8
  };

  const recentChallans = [
    {
      id: 1,
      challanNumber: 'CHN-20241201-0001',
      type: 'inward',
      vendor: 'ABC Textiles',
      amount: 25000,
      status: 'approved',
      createdDate: '2024-12-01'
    },
    {
      id: 2,
      challanNumber: 'CHN-20241201-0002',
      type: 'outward',
      customer: 'XYZ School',
      amount: 18000,
      status: 'pending',
      createdDate: '2024-12-01'
    },
    {
      id: 3,
      challanNumber: 'CHN-20241201-0003',
      type: 'internal_transfer',
      department: 'Manufacturing',
      amount: 12000,
      status: 'approved',
      createdDate: '2024-12-01'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getTypeColor = (type) => {
    const colors = {
      inward: 'bg-green-100 text-green-700',
      outward: 'bg-blue-100 text-blue-700',
      internal_transfer: 'bg-cyan-100 text-cyan-700',
      sample_outward: 'bg-purple-100 text-purple-700',
      sample_inward: 'bg-purple-100 text-purple-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Challan Management
        </h1>
        <button
          className="px-3 py-1.5 bg-blue-500 text-sm text-white rounded hover:bg-blue-600 flex items-center gap-1.5"
          onClick={() => navigate('/challans/create')}
        >
          <FaPlus />
          Create Challan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MinimalStatCard
          title="Total Challans"
          value={stats.totalChallans}
          icon={<FaReceipt />}
          
        />
        <MinimalStatCard
          title="Pending Approval"
          value={stats.pendingApproval}
          icon={<FaClock />}
          
        />
        <MinimalStatCard
          title="Approved"
          value={stats.approved}
          icon={<FaCheckCircle />}
          
        />
        <MinimalStatCard
          title="Rejected"
          value={stats.rejected}
          icon={<FaTimes />}
          
        />
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-white rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Search
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
          <div className="md:col-span-6">
            <div className="relative">
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                placeholder="Search by challan number, vendor, customer..."
              />
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-3">
            <button
              className="w-full px-2.5 py-1.5 border border-gray text-xs-300 text-gray-700 rounded hover:bg-gray-50"
              onClick={() => navigate('/challans/register')}
            >
              Advanced Search
            </button>
          </div>
          <div className="md:col-span-3">
            <button
              className="w-full px-3 py-1.5 bg-blue-500 text-sm text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <FaDownload />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Recent Challans */}
      <div className="grid grid-cols-1 gap-3">
        <div className="p-4 bg-white rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Challans
            </h2>
            <button
              className="px-2.5 py-1.5 border border-gray text-xs-300 text-gray-700 rounded hover:bg-gray-50"
              onClick={() => navigate('/challans/register')}
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challan Number</th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                  <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-2 py-2 text-xs text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentChallans.map((challan) => (
                  <tr key={challan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {challan.challanNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(challan.type)}`}>
                        {challan.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {challan.vendor || challan.customer || challan.department}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ₹{challan.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(challan.status)}`}>
                        {challan.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {challan.createdDate}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button className="text-blue-600 hover:text-blue-900 mr-2">
                        <FaEye />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallanDashboard;