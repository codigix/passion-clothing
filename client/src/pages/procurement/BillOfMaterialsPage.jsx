import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaEllipsisV,
  FaEye,
  FaEdit,
  FaCheck,
  FaShoppingCart,
  FaFileAlt,
  FaDownload
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  approved: 'bg-blue-100 text-blue-700',
  procurement_created: 'bg-yellow-100 text-yellow-700',
  materials_received: 'bg-green-100 text-green-700',
  in_production: 'bg-orange-100 text-orange-700',
  completed: 'bg-purple-100 text-purple-700'
};

const BillOfMaterialsPage = () => {
  const navigate = useNavigate();
  const [boms, setBoms] = useState([]);
  const [filteredBoms, setFilteredBoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBom, setSelectedBom] = useState(null);

  useEffect(() => {
    fetchBoms();
  }, []);

  useEffect(() => {
    const filtered = boms.filter(bom =>
      bom.bom_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.salesOrder?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.salesOrder?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBoms(filtered);
  }, [boms, searchTerm]);

  const fetchBoms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bom');
      setBoms(response.data.boms || []);
    } catch (error) {
      console.error('Failed to fetch BOMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBom = async (salesOrderId) => {
    try {
      await api.post(`/bom/generate/${salesOrderId}`);
      fetchBoms();
      alert('BOM generated successfully');
    } catch (error) {
      console.error('Failed to generate BOM:', error);
      alert(error.response?.data?.message || 'Failed to generate BOM');
    }
  };

  const handleApproveBom = async (bomId) => {
    try {
      await api.put(`/bom/${bomId}/approve`);
      fetchBoms();
      alert('BOM approved successfully');
    } catch (error) {
      console.error('Failed to approve BOM:', error);
      alert(error.response?.data?.message || 'Failed to approve BOM');
    }
  };

  const handleCreatePurchaseOrder = (bomId) => {
    navigate(`/procurement/purchase-orders/create?bom_id=${bomId}`);
  };

  const handleViewBom = (bomId) => {
    navigate(`/procurement/bom/${bomId}`);
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`px-2 py-1 rounded text-xs ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bill of Materials</h1>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            onClick={() => navigate('/procurement/bom/generate')}
          >
            <FaPlus size={16} /> Generate BOM
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            onClick={() => navigate('/procurement/purchase-orders')}
          >
            <FaShoppingCart size={16} /> Purchase Orders
          </button>
        </div>
      </div>

      <div className="bg-white p-4 mb-4 rounded shadow">
        <div className="relative">
          <input
            type="text"
            placeholder="Search BOMs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded pl-10"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">BOM Number</th>
              <th className="p-3 text-left">Sales Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Material Cost</th>
              <th className="p-3 text-left">Created Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  Loading BOMs...
                </td>
              </tr>
            ) : filteredBoms.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  No BOMs found
                </td>
              </tr>
            ) : (
              filteredBoms.map((bom) => (
                <tr key={bom.id} className="hover:bg-gray-50 border-b">
                  <td className="p-3 font-medium">{bom.bom_number}</td>
                  <td className="p-3">{bom.salesOrder?.order_number}</td>
                  <td className="p-3">{bom.salesOrder?.customer?.name}</td>
                  <td className="p-3">{getStatusBadge(bom.status)}</td>
                  <td className="p-3">₹{bom.total_material_cost?.toLocaleString()}</td>
                  <td className="p-3">{new Date(bom.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewBom(bom.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View BOM"
                      >
                        <FaEye size={16} />
                      </button>
                      {bom.status === 'draft' && (
                        <button
                          onClick={() => handleApproveBom(bom.id)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Approve BOM"
                        >
                          <FaCheck size={16} />
                        </button>
                      )}
                      {bom.status === 'approved' && (
                        <button
                          onClick={() => handleCreatePurchaseOrder(bom.id)}
                          className="text-orange-600 hover:text-orange-800 p-1"
                          title="Create Purchase Order"
                        >
                          <FaShoppingCart size={16} />
                        </button>
                      )}
                      <button
                        className="text-gray-600 hover:text-gray-800 p-1"
                        title="Export BOM"
                      >
                        <FaDownload size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold text-blue-600">{boms.filter(b => b.status === 'draft').length}</div>
          <div className="text-sm text-gray-600">Draft BOMs</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold text-green-600">{boms.filter(b => b.status === 'approved').length}</div>
          <div className="text-sm text-gray-600">Approved BOMs</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold text-orange-600">{boms.filter(b => b.status === 'procurement_created').length}</div>
          <div className="text-sm text-gray-600">In Procurement</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold text-purple-600">{boms.filter(b => b.status === 'completed').length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>
    </div>
  );
};

export default BillOfMaterialsPage;