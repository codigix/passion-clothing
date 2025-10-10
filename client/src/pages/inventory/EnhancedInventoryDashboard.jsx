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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <button
          onClick={() => navigate('/inventory/add-item')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FaPlus /> Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
            </div>
            <FaBoxOpen className="text-4xl text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Factory Stock</p>
              <p className="text-2xl font-bold text-green-600">{stats.factoryStock.toFixed(2)}</p>
            </div>
            <FaIndustry className="text-4xl text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Project Stock</p>
              <p className="text-2xl font-bold text-purple-600">{stats.projectStock.toFixed(2)}</p>
            </div>
            <FaProjectDiagram className="text-4xl text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-indigo-600">₹{stats.totalValue.toFixed(2)}</p>
            </div>
            <FaTruck className="text-4xl text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, code, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FaSearch /> Search
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaBoxOpen className="inline mr-2" />
            All Stock
          </button>
          <button
            onClick={() => setActiveTab('factory')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition ${
              activeTab === 'factory'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaIndustry className="inline mr-2" />
            Factory Stock
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition ${
              activeTab === 'project'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaProjectDiagram className="inline mr-2" />
            Project Stock
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : activeTab === 'project' && projects.length > 0 ? (
            // Project Summary View
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Projects with Materials</h3>
              {projects.map((project) => (
                <div
                  key={project.sales_order_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/inventory/project/${project.sales_order_id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{project.order_number}</h4>
                      <p className="text-sm text-gray-600">{project.customer_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Order Date: {new Date(project.order_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Materials: {project.material_count}</p>
                      <p className="text-sm text-green-600">In Stock: {parseFloat(project.current_stock).toFixed(2)}</p>
                      <p className="text-sm text-orange-600">Sent: {parseFloat(project.sent_to_manufacturing).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Inventory List View
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Barcode
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No inventory items found
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{item.product_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{item.product_code || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-mono text-gray-700">{item.barcode || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{item.category || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{item.location || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {parseFloat(item.current_stock || 0).toFixed(2)} {item.unit_of_measurement || ''}
                          </div>
                          {item.available_stock !== item.current_stock && (
                            <div className="text-xs text-gray-500">
                              Available: {parseFloat(item.available_stock || 0).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowBarcodeModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Barcode"
                            >
                              <FaBarcode size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowSendToMfgModal(true);
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Send to Manufacturing"
                            >
                              <FaTruck size={18} />
                            </button>
                            <button
                              onClick={() => navigate(`/inventory/${item.id}/history`)}
                              className="text-purple-600 hover:text-purple-800"
                              title="View History"
                            >
                              <FaHistory size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Barcode Modal */}
      {showBarcodeModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Barcode</h3>
            <div className="text-center mb-4">
              <p className="font-medium text-gray-800 mb-2">{selectedItem.product_name}</p>
              <div className="flex justify-center">
                <Barcode value={selectedItem.barcode} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={printBarcode}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <FaPrint /> Print
              </button>
              <button
                onClick={() => setShowBarcodeModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send to Manufacturing Modal */}
      {showSendToMfgModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Send to Manufacturing</h3>
            <div className="mb-4">
              <p className="font-medium text-gray-800">{selectedItem.product_name}</p>
              <p className="text-sm text-gray-600">Available: {selectedItem.available_stock} {selectedItem.unit_of_measurement}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Send
              </label>
              <input
                type="number"
                value={sendQty}
                onChange={(e) => setSendQty(e.target.value)}
                max={selectedItem.available_stock}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={sendNotes}
                onChange={(e) => setSendNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add notes..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSendToManufacturing}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Send
              </button>
              <button
                onClick={() => {
                  setShowSendToMfgModal(false);
                  setSendQty('');
                  setSendNotes('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
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