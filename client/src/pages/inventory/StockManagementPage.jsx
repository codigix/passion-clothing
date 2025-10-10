import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Edit,
  Plus,
  Minus,
  Package,
  AlertTriangle
} from 'lucide-react';
import { FaQrcode, FaBarcode, FaEllipsisV, FaColumns, FaEye } from 'react-icons/fa';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { useColumnVisibility } from '../../hooks/useColumnVisibility';
import { useSmartDropdown } from '../../hooks/useSmartDropdown';

// Define all available columns with their properties
const AVAILABLE_COLUMNS = [
  { id: 'barcode', label: 'Barcode / Batch', defaultVisible: true, alwaysVisible: true },
  { id: 'item_name', label: 'Item Name', defaultVisible: true, alwaysVisible: true },
  { id: 'category', label: 'Category', defaultVisible: true },
  { id: 'current_stock', label: 'Current Stock', defaultVisible: true },
  { id: 'min_stock', label: 'Min Stock', defaultVisible: true },
  { id: 'max_stock', label: 'Max Stock', defaultVisible: false },
  { id: 'unit', label: 'Unit', defaultVisible: false },
  { id: 'location', label: 'Location', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'actions', label: 'Actions', defaultVisible: true, alwaysVisible: true }
];

// Action Dropdown Component
function ActionDropdown({ stock, onView, onAdd, onRemove, onEdit, showQRModal, setSelectedQRItem, setShowQRModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = (event) => {
    if (!isOpen) {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpward(spaceBelow < 250 && spaceAbove > spaceBelow);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center justify-center rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        aria-label="Actions"
      >
        <FaEllipsisV className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className={`absolute right-0 z-50 ${openUpward ? 'bottom-full mb-2' : 'mt-2'} w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}>
          <div className="py-1">
            {(stock.barcode || stock.qrCode) && (
              <button
                onClick={() => {
                  setSelectedQRItem(stock);
                  setShowQRModal(true);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50"
              >
                <FaQrcode className="h-4 w-4" />
                View QR Code
              </button>
            )}
            <button
              onClick={() => {
                onAdd();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" />
              Add Stock
            </button>
            <button
              onClick={() => {
                onRemove();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Minus className="h-4 w-4" />
              Remove Stock
            </button>
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Edit Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const StockManagementPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustMode, setAdjustMode] = useState('edit');
  const [selected, setSelected] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRItem, setSelectedQRItem] = useState(null);

  // Column visibility management
  const { visibleColumns, isColumnVisible, toggleColumn, resetColumns, showAllColumns } = 
    useColumnVisibility('stockManagementVisibleColumns', AVAILABLE_COLUMNS);

  // Column manager menu state
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef(null);

  // Close column menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target)) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        lastUpdated: row.updated_at,
        barcode: row.barcode,
        batchNumber: row.batch_number,
        qrCode: row.qr_code,
        product: row.product
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
        <div className="flex gap-3">
          {/* Column Manager */}
          <div className="relative" ref={columnMenuRef}>
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <FaColumns className="h-4 w-4" />
              Columns
            </button>
            
            {showColumnMenu && (
              <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Show/Hide Columns</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={showAllColumns}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Show All
                      </button>
                      <span className="text-xs text-gray-300">|</span>
                      <button
                        onClick={resetColumns}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {AVAILABLE_COLUMNS.map((column) => (
                      <label
                        key={column.id}
                        className={`flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50 ${
                          column.alwaysVisible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isColumnVisible(column.id)}
                          onChange={() => toggleColumn(column.id)}
                          disabled={column.alwaysVisible}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-700">{column.label}</span>
                        {column.alwaysVisible && (
                          <span className="ml-auto text-xs text-gray-400">(Required)</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="px-4 py-1 text-sm font-medium text-white bg-primary border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-primary hover:text-primary  hover:bg-transparent flex gap-2 items-center"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={18} />
            Add Stock
          </button>
        </div>
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

      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {isColumnVisible('barcode') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode / Batch</th>
              )}
              {isColumnVisible('item_name') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              )}
              {isColumnVisible('category') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              )}
              {isColumnVisible('current_stock') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
              )}
              {isColumnVisible('min_stock') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
              )}
              {isColumnVisible('max_stock') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Stock</th>
              )}
              {isColumnVisible('unit') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              )}
              {isColumnVisible('location') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              )}
              {isColumnVisible('status') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              )}
              {isColumnVisible('actions') && (
                <th className="sticky right-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStocks.map((stock) => {
              const stockStatus = getStockStatus(stock.currentStock, stock.minStock, stock.maxStock);
              return (
                <tr key={stock.id} className="group hover:bg-gray-50">
                  {isColumnVisible('barcode') && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stock.barcode || stock.batchNumber ? (
                        <div className="flex items-center gap-2">
                          <FaBarcode className="text-gray-400" />
                          <div>
                            {stock.barcode && (
                              <div className="text-sm font-medium text-gray-900">{stock.barcode}</div>
                            )}
                            {stock.batchNumber && (
                              <div className="text-xs text-gray-500">{stock.batchNumber}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No barcode</span>
                      )}
                    </td>
                  )}
                  {isColumnVisible('item_name') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stock.itemName}</td>
                  )}
                  {isColumnVisible('category') && (
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{stock.category}</td>
                  )}
                  {isColumnVisible('current_stock') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.currentStock}</td>
                  )}
                  {isColumnVisible('min_stock') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.minStock}</td>
                  )}
                  {isColumnVisible('max_stock') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.maxStock}</td>
                  )}
                  {isColumnVisible('unit') && (
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{stock.unit}</td>
                  )}
                  {isColumnVisible('location') && (
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{stock.location}</td>
                  )}
                  {isColumnVisible('status') && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stockStatus.color === 'error' ? 'bg-red-100 text-red-800' :
                        stockStatus.color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {stockStatus.status}
                      </span>
                    </td>
                  )}
                  {isColumnVisible('actions') && (
                    <td className="sticky right-0 bg-white group-hover:bg-gray-50 px-6 py-4 whitespace-nowrap text-sm font-medium shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                      <ActionDropdown
                        stock={stock}
                        onAdd={() => { setSelected(stock); setAdjustMode('add'); setAdjustOpen(true); }}
                        onRemove={() => { setSelected(stock); setAdjustMode('remove'); setAdjustOpen(true); }}
                        onEdit={() => { setSelected(stock); setAdjustMode('edit'); setAdjustOpen(true); }}
                        showQRModal={showQRModal}
                        setSelectedQRItem={setSelectedQRItem}
                        setShowQRModal={setShowQRModal}
                      />
                    </td>
                  )}
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

      {/* QR Code Modal */}
      {showQRModal && selectedQRItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Item QR Code & Barcode</h2>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <QRCodeDisplay
                  data={selectedQRItem.qrCode || JSON.stringify({
                    barcode: selectedQRItem.barcode,
                    product: selectedQRItem.itemName,
                    location: selectedQRItem.location,
                    batch: selectedQRItem.batchNumber,
                    stock: selectedQRItem.currentStock
                  })}
                  size={250}
                />
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {selectedQRItem.barcode && (
                  <div className="flex items-center gap-2">
                    <FaBarcode className="text-gray-400" />
                    <strong>Barcode:</strong> {selectedQRItem.barcode}
                  </div>
                )}
                {selectedQRItem.batchNumber && (
                  <div><strong>Batch:</strong> {selectedQRItem.batchNumber}</div>
                )}
                <div><strong>Item:</strong> {selectedQRItem.itemName}</div>
                <div><strong>Location:</strong> {selectedQRItem.location}</div>
                <div><strong>Current Stock:</strong> {selectedQRItem.currentStock} {selectedQRItem.unit}</div>
                <div><strong>Category:</strong> {selectedQRItem.category}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <FaBarcode /> Print
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagementPage;