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
    <div className="p-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-semibold text-gray-800">Inventory Management</h1>
        <button
          onClick={() => navigate('/inventory/add-item')}
          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition text-xs font-normal"
        >
          <FaPlus size={12} /> Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white p-2.5 rounded shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Total Items</p>
              <p className="text-lg font-bold text-gray-800 mt-0.5">{stats.totalItems}</p>
            </div>
            <FaBoxOpen className="text-2xl text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-2.5 rounded shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Factory</p>
              <p className="text-lg font-bold text-green-600 mt-0.5">{stats.factoryStock.toFixed(2)}</p>
            </div>
            <FaIndustry className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white p-2.5 rounded shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Project</p>
              <p className="text-lg font-bold text-purple-600 mt-0.5">{stats.projectStock.toFixed(2)}</p>
            </div>
            <FaProjectDiagram className="text-2xl text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-2.5 rounded shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Total Value</p>
              <p className="text-lg font-bold text-indigo-600 mt-0.5">₹{stats.totalValue.toFixed(2)}</p>
            </div>
            <FaTruck className="text-2xl text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2.5 rounded shadow-sm mb-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-2.5 py-1.5 border border-gray-300 text-xs rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition text-xs font-normal"
          >
            <FaSearch size={12} /> Search
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded shadow-sm mb-3">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-3 py-2 text-center font-medium text-xs transition ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaBoxOpen className="inline mr-1" size={12} />
            All
          </button>
          <button
            onClick={() => setActiveTab('factory')}
            className={`flex-1 px-3 py-2 text-center font-medium text-xs transition ${
              activeTab === 'factory'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaIndustry className="inline mr-1" size={12} />
            Factory
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`flex-1 px-3 py-2 text-center font-medium text-xs transition ${
              activeTab === 'project'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaProjectDiagram className="inline mr-1" size={12} />
            Project
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3">
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="mt-1.5 text-gray-600 text-xs">Loading...</p>
            </div>
          ) : activeTab === 'project' && projects.length > 0 ? (
            // Project Summary View
            <div className="space-y-2">
              <h3 className="text-sm font-semibold mb-2 text-gray-800">Projects</h3>
              {projects.map((project) => (
                <div
                  key={project.sales_order_id}
                  className="border border-gray-200 rounded p-2.5 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/inventory/project/${project.sales_order_id}`)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm">{project.order_number}</h4>
                      <p className="text-xs text-gray-600">{project.customer_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(project.order_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Materials: {project.material_count}</p>
                      <p className="text-xs text-green-600">In: {parseFloat(project.current_stock).toFixed(2)}</p>
                      <p className="text-xs text-orange-600">Sent: {parseFloat(project.sent_to_manufacturing).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Inventory List View
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-2 py-1.5 text-left font-medium text-gray-700">Product</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-700">Barcode</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-700">Category</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-700">Location</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-700">Stock</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-2 py-4 text-center text-gray-500">
                        No inventory items found
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-2 py-1.5">
                          <div className="font-medium text-gray-900 max-w-xs truncate">{item.product_name || '-'}</div>
                          <div className="text-xs text-gray-500">{item.product_code || '-'}</div>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="text-xs font-mono text-gray-700">{item.barcode || '-'}</div>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="text-xs text-gray-900">{item.category || '-'}</div>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="text-xs text-gray-900">{item.location || '-'}</div>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="text-xs font-medium text-gray-900">
                            {parseFloat(item.current_stock || 0).toFixed(2)} {item.unit_of_measurement || ''}
                          </div>
                          {item.available_stock !== item.current_stock && (
                            <div className="text-xs text-gray-500">
                              Avail: {parseFloat(item.available_stock || 0).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowBarcodeModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Barcode"
                            >
                              <FaBarcode size={12} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowSendToMfgModal(true);
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Send"
                            >
                              <FaTruck size={12} />
                            </button>
                            <button
                              onClick={() => navigate(`/inventory/${item.id}/history`)}
                              className="text-purple-600 hover:text-purple-800"
                              title="History"
                            >
                              <FaHistory size={12} />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded p-4 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-semibold mb-3 text-gray-800">Barcode</h3>
            <div className="text-center mb-3">
              <p className="font-medium text-gray-800 mb-1.5 text-xs">{selectedItem.product_name}</p>
              <div className="flex justify-center">
                <Barcode value={selectedItem.barcode} width={1.5} height={50} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={printBarcode}
                className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-xs font-normal"
              >
                <FaPrint size={12} /> Print
              </button>
              <button
                onClick={() => setShowBarcodeModal(false)}
                className="bg-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-400 text-xs font-normal"
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
          <div className="bg-white rounded p-4 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-semibold mb-3 text-gray-800">Send to Manufacturing</h3>
            <div className="mb-3">
              <p className="font-medium text-gray-800 text-xs">{selectedItem.product_name}</p>
              <p className="text-xs text-gray-600 mt-0.5">Available: {selectedItem.available_stock} {selectedItem.unit_of_measurement}</p>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={sendQty}
                onChange={(e) => setSendQty(e.target.value)}
                max={selectedItem.available_stock}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 text-xs"
                placeholder="Enter quantity"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={sendNotes}
                onChange={(e) => setSendNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 text-xs"
                rows="2"
                placeholder="Add notes..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSendToManufacturing}
                className="bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 text-xs font-normal"
              >
                Send
              </button>
              <button
                onClick={() => {
                  setShowSendToMfgModal(false);
                  setSendQty('');
                  setSendNotes('');
                }}
                className="bg-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-400 text-xs font-normal"
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