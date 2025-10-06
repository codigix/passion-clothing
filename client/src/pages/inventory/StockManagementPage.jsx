import React, { useState, useEffect } from 'react';
import {
  Search,
  Edit,
  Plus,
  Minus,
  Package,
  AlertTriangle
} from 'lucide-react';

const StockManagementPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustMode, setAdjustMode] = useState('edit');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const params = {};
      const res = await (await import('../../utils/api')).default.get('/inventory/stock', { params });
      const rows = (res.data.inventory || []).map((row) => ({
        id: row.id,
        itemName: row.product?.name || `Inventory Item #${row.id}`,
        category: row.product?.category || 'Uncategorized',
        currentStock: row.current_stock,
        minStock: row.minimum_level ?? row.reorder_level ?? 0,
        maxStock: row.maximum_level ?? (row.reorder_level ? row.reorder_level * 3 : 100),
        unit: row.product?.unit_of_measurement || 'Units',
        location: row.location || 'Unknown',
        lastUpdated: row.updated_at
      }));
      setStocks(rows);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current, min, max) => {
    if (current <= min) return { status: 'Low Stock', color: 'error' };
    if (current >= max) return { status: 'Overstock', color: 'warning' };
    return { status: 'Normal', color: 'success' };
  };

  const filteredStocks = stocks.filter(stock =>
    stock.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = stocks.filter(stock => stock.currentStock <= stock.minStock);
  const overstockItems = stocks.filter(stock => stock.currentStock >= stock.maxStock);

  const [creatingForm, setCreatingForm] = useState({ product_id: '', location: '', current_stock: 0, unit_cost: 0 });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
  }

  const handleCreateStock = async (form) => {
    try {
      const api = (await import('../../utils/api')).default;
      await api.post('/inventory/stock', form);
      setCreateOpen(false);
      fetchStocks();
    } catch (e) {
      console.error('Create stock failed', e);
    }
  };

  const handleAdjustStock = async (form) => {
    try {
      const api = (await import('../../utils/api')).default;
      // For add/remove modes, we'll compute new current_stock relative to selected
      let payload = { ...form };
      if (selected && (adjustMode === 'add' || adjustMode === 'remove')) {
        const delta = Number(form.current_stock) - Number(selected.currentStock);
        const newCurrent = adjustMode === 'add' ? (Number(selected.currentStock) + Math.abs(delta || 0)) : (Number(selected.currentStock) - Math.abs(delta || 0));
        payload.current_stock = newCurrent;
      }
      await api.put(`/inventory/stock/${selected.id}`, payload);
      setAdjustOpen(false);
      setSelected(null);
      fetchStocks();
    } catch (e) {
      console.error('Adjust stock failed', e);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Stock Management
        </h1>
        <button
          className="px-4 py-1 text-sm font-medium text-white bg-primary border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-primary hover:text-primary  hover:bg-transparent flex gap-2 items-center"
          onClick={() => setCreateOpen(true)}
        >
          <Plus size={18} />
          Add Stock
        </button>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{stocks.length}</p>
            </div>
            <Package className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
              <p className="text-3xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
            <AlertTriangle className="text-red-600" size={32} />
          </div>
        </div>
        <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overstock Items</p>
              <p className="text-3xl font-bold text-yellow-600">{overstockItems.length}</p>
            </div>
            <AlertTriangle className="text-yellow-600" size={32} />
          </div>
        </div>
        <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Normal Stock</p>
              <p className="text-3xl font-bold text-green-600">{stocks.length - lowStockItems.length - overstockItems.length}</p>
            </div>
            <Package className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white  shadow border mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              tabValue === 0
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setTabValue(0)}
          >
            All Stock
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              tabValue === 1
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setTabValue(1)}
          >
            Low Stock
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              tabValue === 2
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setTabValue(2)}
          >
            Overstock
          </button>
        </div>
      </div>

      <div className="bg-white  shadow border mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search stock items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStocks.map((stock) => {
              const stockStatus = getStockStatus(stock.currentStock, stock.minStock, stock.maxStock);
              return (
                <tr key={stock.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stock.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{stock.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.minStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.maxStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{stock.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{stock.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      stockStatus.color === 'error' ? 'bg-red-100 text-red-800' :
                      stockStatus.color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {stockStatus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-1">
                      <button
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        onClick={() => { setSelected(stock); setAdjustMode('add'); setAdjustOpen(true); }}
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        onClick={() => { setSelected(stock); setAdjustMode('remove'); setAdjustOpen(true); }}
                      >
                        <Minus size={16} />
                      </button>
                      <button
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        onClick={() => { setSelected(stock); setAdjustMode('edit'); setAdjustOpen(true); }}
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {/* Create Stock Simple Dialog */}
      {createOpen && (
        <div className="mt-6">
          <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
            <h3 className="text-lg font-semibold mb-4">New Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                <input
                  type="text"
                  value={creatingForm.product_id}
                  onChange={(e) => setCreatingForm({ ...creatingForm, product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={creatingForm.location}
                  onChange={(e) => setCreatingForm({ ...creatingForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                <input
                  type="number"
                  value={creatingForm.current_stock}
                  onChange={(e) => setCreatingForm({ ...creatingForm, current_stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={creatingForm.unit_cost}
                  onChange={(e) => setCreatingForm({ ...creatingForm, unit_cost: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setCreateOpen(false)}
                className="px-4 py-1 text-sm font-medium text-white bg-gray-700 border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-gray-700 hover:text-gray-700 :bg-transparent flex gap-2 items-center"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateStock(creatingForm)}
                className="px-4 py-1 text-sm font-medium text-white bg-secondary border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-primary hover:text-primary  hover:bg-transparent flex gap-2 items-center"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Dialog */}
      {adjustOpen && (
        <div className="mt-6">
          <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
            <h3 className="text-lg font-semibold mb-4">
              {adjustMode === 'add' ? 'Increase Stock' : adjustMode === 'remove' ? 'Decrease Stock' : 'Edit Stock'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                <input
                  type="number"
                  defaultValue={selected?.currentStock ?? 0}
                  onChange={(e) => setSelected({ ...selected, currentStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reserved Stock</label>
                <input
                  type="number"
                  defaultValue={selected?.reserved_stock ?? 0}
                  onChange={(e) => setSelected({ ...selected, reserved_stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={selected?.unit_cost ?? 0}
                  onChange={(e) => setSelected({ ...selected, unit_cost: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setAdjustOpen(false); setSelected(null); }}
                className="px-4 py-1 text-sm font-medium text-white bg-gray-700 border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-gray-700 hover:text-gray-700 :bg-transparent flex gap-2 items-center"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAdjustStock({ current_stock: selected?.currentStock, unit_cost: selected?.unit_cost })}
                className="px-4 py-1 text-sm font-medium text-white bg-secondary border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-primary hover:text-primary  hover:bg-transparent flex gap-2 items-center"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagementPage;