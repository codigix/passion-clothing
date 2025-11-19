import React, { useState, useEffect } from 'react';
import { 
  FaBoxOpen, FaPlus, FaSearch, FaIndustry, FaProjectDiagram, 
  FaBarcode, FaTruck, FaHistory, FaDownload, FaPrint 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Barcode from 'react-barcode';

const EnhancedInventoryDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // all, factory, project
  const [stats, setStats] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStock: 0,
    factoryStock: 0,
    projectStock: 0
  });
  const [inventory, setInventory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showSendToMfgModal, setShowSendToMfgModal] = useState(false);
  const [sendQty, setSendQty] = useState('');
  const [sendNotes, setSendNotes] = useState('');
  
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await api.get('/inventory/stats');
      setStats(statsRes.data.stats);

      // Fetch inventory based on active tab
      let params = { limit: 50 };
      if (activeTab === 'factory') {
        params.stock_type = 'general_extra';
      } else if (activeTab === 'project') {
        params.stock_type = 'project_specific';
      }

      const inventoryRes = await api.get('/inventory', { params });
      setInventory(inventoryRes.data.inventory || []);

      // Fetch projects summary if on project tab
      if (activeTab === 'project') {
        const projectsRes = await api.get('/inventory/projects-summary');
        setProjects(projectsRes.data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      if (/^\d+$/.test(searchQuery.trim())) {
        // Numeric - look up by barcode
        handleBarcodeSearch(searchQuery.trim());
      } else {
        // Text search
        fetchData();
      }
    }
  };

  const handleBarcodeSearch = async (barcode) => {
    try {
      const res = await api.get(`/inventory/lookup/barcode/${barcode}`);
      if (res.data.success) {
        setSelectedItem(res.data.inventory);
        setShowBarcodeModal(true);
      }
    } catch (error) {
      toast.error('Item not found');
    }
  };

  const handleSendToManufacturing = async () => {
    if (!sendQty || parseFloat(sendQty) <= 0) {
      toast.error('Please enter valid quantity');
      return;
    }

    try {
      await api.post('/inventory/send-to-manufacturing', {
        inventory_id: selectedItem.id,
        quantity: parseFloat(sendQty),
        sales_order_id: selectedItem.sales_order_id,
        notes: sendNotes
      });
      
      toast.success('Materials dispatched to manufacturing');
      setShowSendToMfgModal(false);
      setSendQty('');
      setSendNotes('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to dispatch materials');
    }
  };

  const printBarcode = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">📦 Inventory Management</h1>
          <p className="text-xs text-gray-500">Track and manage your stock levels</p>
        </div>
        <button
          onClick={() => navigate('/inventory/add-item')}
          className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:shadow-md transition text-xs font-semibold"
        >
          <FaPlus size={12} /> Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-3xl opacity-20">📦</div>
          <p className="text-xs font-semibold text-blue-700 uppercase">Total Items</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalItems}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-3xl opacity-20">🏭</div>
          <p className="text-xs font-semibold text-green-700 uppercase">Factory</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.factoryStock.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-3xl opacity-20">📋</div>
          <p className="text-xs font-semibold text-purple-700 uppercase">Project</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.projectStock.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-3xl opacity-20">💰</div>
          <p className="text-xs font-semibold text-indigo-700 uppercase">Total Value</p>
          <p className="text-2xl font-bold text-indigo-900 mt-1">₹{stats.totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm mb-3 p-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 Search products, barcode, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-3 py-2 border border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:shadow-md transition text-xs font-semibold"
          >
            <FaSearch size={12} /> Search
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden">
        <div className="flex gap-1 border-b border-gray-200 p-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              activeTab === 'all'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📦 All ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('factory')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              activeTab === 'factory'
                ? 'bg-green-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏭 Factory ({stats.factoryStock.toFixed(0)})
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              activeTab === 'project'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 Project ({projects.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 text-xs">Loading inventory...</p>
            </div>
          ) : activeTab === 'project' && projects.length > 0 ? (
            // Project Summary View
            <div className="grid gap-2 max-h-[500px] overflow-y-auto">
              {projects.map((project) => (
                <div
                  key={project.sales_order_id}
                  className="border border-blue-200 rounded-lg p-3 bg-blue-50 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/inventory/project/${project.sales_order_id}`)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-xs">{project.order_number}</h4>
                      <p className="text-xs text-gray-600">{project.customer_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(project.order_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right text-xs space-y-1">
                      <p className="text-gray-700">📊 Materials: <span className="font-bold">{project.material_count}</span></p>
                      <p className="text-green-600">✓ In: <span className="font-bold">{parseFloat(project.current_stock).toFixed(2)}</span></p>
                      <p className="text-orange-600">→ Sent: <span className="font-bold">{parseFloat(project.sent_to_manufacturing).toFixed(2)}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-xs">📭 No inventory items found</p>
            </div>
          ) : (
            // Inventory Card View
            <div className="grid gap-2 max-h-[500px] overflow-y-auto">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-xs truncate">{item.product_name || '-'}</h4>
                      <p className="text-xs text-gray-600">{item.product_code || '-'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">
                        {parseFloat(item.current_stock || 0).toFixed(2)} {item.unit_of_measurement || ''}
                      </p>
                      {item.available_stock !== item.current_stock && (
                        <p className="text-xs text-gray-500">
                          Avail: {parseFloat(item.available_stock || 0).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                    <div className="bg-gray-50 rounded p-1.5">
                      <p className="text-gray-600">📌 <span className="font-semibold">{item.category || '-'}</span></p>
                    </div>
                    <div className="bg-gray-50 rounded p-1.5">
                      <p className="text-gray-600">📍 <span className="font-semibold">{item.location || '-'}</span></p>
                    </div>
                    <div className="bg-gray-50 rounded p-1.5">
                      <p className="text-gray-600">🏷️ <span className="font-mono text-xs">{item.barcode || '-'}</span></p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowBarcodeModal(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-500 hover:bg-blue-600 px-2 py-1 text-xs font-semibold text-white transition"
                      title="Show Barcode"
                    >
                      📄 Barcode
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowSendToMfgModal(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-500 hover:bg-green-600 px-2 py-1 text-xs font-semibold text-white transition"
                      title="Send to Manufacturing"
                    >
                      🚚 Send
                    </button>
                    <button
                      onClick={() => navigate(`/inventory/${item.id}/history`)}
                      className="inline-flex items-center gap-1 rounded-lg bg-purple-500 hover:bg-purple-600 px-2 py-1 text-xs font-semibold text-white transition"
                      title="View History"
                    >
                      📊 History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Barcode Modal */}
      {showBarcodeModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-4 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-bold mb-3 text-gray-900">📄 Product Barcode</h3>
            <div className="bg-gray-50 rounded-lg p-3 mb-3 text-center">
              <p className="font-semibold text-gray-900 mb-2 text-xs">{selectedItem.product_name}</p>
              <p className="text-xs text-gray-600 mb-3">Code: {selectedItem.product_code}</p>
              <div className="flex justify-center">
                <Barcode value={selectedItem.barcode} width={1.5} height={50} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={printBarcode}
                className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-lg hover:shadow-md text-xs font-semibold transition"
              >
                <FaPrint size={12} /> Print
              </button>
              <button
                onClick={() => setShowBarcodeModal(false)}
                className="bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-400 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send to Manufacturing Modal */}
      {showSendToMfgModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-4 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-bold mb-3 text-gray-900">🚚 Send to Manufacturing</h3>
            <div className="bg-green-50 rounded-lg p-3 mb-3 border border-green-200">
              <p className="font-semibold text-gray-900 text-xs">{selectedItem.product_name}</p>
              <p className="text-xs text-gray-600 mt-1">📦 Available: <span className="font-bold">{selectedItem.available_stock} {selectedItem.unit_of_measurement}</span></p>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Quantity to Send
              </label>
              <input
                type="number"
                value={sendQty}
                onChange={(e) => setSendQty(e.target.value)}
                max={selectedItem.available_stock}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 text-xs"
                placeholder="Enter quantity"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={sendNotes}
                onChange={(e) => setSendNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 text-xs"
                rows="3"
                placeholder="Add dispatch notes..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSendToManufacturing}
                className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg hover:shadow-md text-xs font-semibold transition"
              >
                🚀 Send
              </button>
              <button
                onClick={() => {
                  setShowSendToMfgModal(false);
                  setSendQty('');
                  setSendNotes('');
                }}
                className="bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-400 text-xs font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedInventoryDashboard;