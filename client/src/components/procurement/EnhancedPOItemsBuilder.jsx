import React, { useState, useEffect, useCallback } from 'react';
import {
  FaPlus,
  FaTrash,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaCheck,
  FaBox,
  FaDollarSign,
  FaWeightHanging,
  FaRuler,
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EnhancedPOItemsBuilder = ({
  items = [],
  onItemsChange,
  vendorId,
  vendorName,
  disabled = false,
}) => {
  const [expandedItemIndex, setExpandedItemIndex] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState({});
  const [filteredResults, setFilteredResults] = useState({});
  const [loadingInventory, setLoadingInventory] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [uomPrices, setUomPrices] = useState({});

  // UOM options
  const uomOptions = [
    { value: 'Meters', label: 'Meters (m)', conversionFactor: 1 },
    { value: 'Yards', label: 'Yards (yd)', conversionFactor: 0.9144 },
    { value: 'Kilograms', label: 'Kilograms (kg)', conversionFactor: 1 },
    { value: 'Pieces', label: 'Pieces (pcs)', conversionFactor: 1 },
    { value: 'Sets', label: 'Sets', conversionFactor: 1 },
    { value: 'Dozens', label: 'Dozens', conversionFactor: 12 },
    { value: 'Boxes', label: 'Boxes', conversionFactor: 1 },
    { value: 'Liters', label: 'Liters (L)', conversionFactor: 1 },
    { value: 'Grams', label: 'Grams (g)', conversionFactor: 0.001 },
  ];

  // Fetch inventory on component load
  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const response = await api.get('/inventory?limit=500');
      const items = response.data.inventory || [];
      setInventoryItems(items);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory items');
    }
  };

  // Search inventory items
  const handleSearch = useCallback((itemIndex, query) => {
    setSearchQuery((prev) => ({
      ...prev,
      [itemIndex]: query,
    }));

    if (query.trim().length < 2) {
      setFilteredResults((prev) => ({
        ...prev,
        [itemIndex]: [],
      }));
      return;
    }

    const results = inventoryItems.filter((item) => {
      const searchLower = query.toLowerCase();
      return (
        item.product_name?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.material?.toLowerCase().includes(searchLower) ||
        item.barcode?.includes(query) ||
        item.hsn?.includes(query)
      );
    });

    setFilteredResults((prev) => ({
      ...prev,
      [itemIndex]: results.slice(0, 10),
    }));
  }, [inventoryItems]);

  // Select item from dropdown
  const handleSelectInventoryItem = (itemIndex, inventoryItem) => {
    const currentItem = items[itemIndex];
    const updatedItem = {
      ...currentItem,
      product_id: inventoryItem.id,
      item_name: inventoryItem.product_name,
      description: inventoryItem.category || inventoryItem.material,
      hsn: inventoryItem.hsn || '',
      uom: inventoryItem.uom || 'Pieces',
      available_quantity: inventoryItem.quantity_available || 0,
      warehouse_location: inventoryItem.warehouse_location || '',
      rate: inventoryItem.cost_price || inventoryItem.purchase_price || 0,
      product_type: inventoryItem.product_type || 'material',
    };

    handleItemUpdate(itemIndex, updatedItem);
    setSearchQuery((prev) => ({
      ...prev,
      [itemIndex]: '',
    }));
    setFilteredResults((prev) => ({
      ...prev,
      [itemIndex]: [],
    }));
  };

  // Add new item
  const handleAddItem = () => {
    if (!vendorId) {
      toast.error('Please select a vendor first');
      return;
    }

    const newItem = {
      product_id: null,
      item_name: '',
      description: '',
      type: 'material',
      fabric_name: '',
      color: '',
      hsn: '',
      gsm: '',
      width: '',
      uom: 'Pieces',
      quantity: '',
      rate: '',
      total: 0,
      supplier: vendorName || '',
      remarks: '',
      available_quantity: 0,
      warehouse_location: '',
      tax_rate: 0,
    };

    onItemsChange([...items, newItem]);
    setExpandedItemIndex(items.length);
  };

  // Remove item
  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      onItemsChange(items.filter((_, i) => i !== index));
      if (expandedItemIndex === index) {
        setExpandedItemIndex(null);
      }
    } else {
      toast.error('At least one item is required');
    }
  };

  // Update item
  const handleItemUpdate = (index, updates) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index], ...updates };

    // Auto-calculate total
    if (updates.quantity !== undefined || updates.rate !== undefined) {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      item.total = qty * rate;
    }

    updatedItems[index] = item;
    onItemsChange(updatedItems);
  };

  // Handle UOM change and recalculate price
  const handleUomChange = (index, newUom) => {
    const item = items[index];
    const oldUom = item.uom;

    // Convert rate if UOM changes
    let convertedRate = item.rate;
    if (oldUom !== newUom) {
      const oldUomData = uomOptions.find((u) => u.value === oldUom);
      const newUomData = uomOptions.find((u) => u.value === newUom);

      if (oldUomData && newUomData) {
        // Convert price proportionally (e.g., price per meter -> price per yard)
        convertedRate = item.rate * (oldUomData.conversionFactor / newUomData.conversionFactor);
      }
    }

    handleItemUpdate(index, {
      uom: newUom,
      rate: convertedRate,
    });
  };

  // Calculate summary stats
  const summaryStats = {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0),
    totalValue: items.reduce((sum, item) => sum + (item.total || 0), 0),
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded bg-blue-50 p-3 border border-blue-200">
          <div className="text-xs font-semibold text-blue-600">Total Items</div>
          <div className="text-2xl font-bold text-blue-900">{summaryStats.totalItems}</div>
        </div>
        <div className="rounded bg-green-50 p-3 border border-green-200">
          <div className="text-xs font-semibold text-green-600">Total Quantity</div>
          <div className="text-2xl font-bold text-green-900">
            {summaryStats.totalQuantity.toFixed(2)}
          </div>
        </div>
        <div className="rounded bg-purple-50 p-3 border border-purple-200">
          <div className="text-xs font-semibold text-purple-600">Total Value</div>
          <div className="text-2xl font-bold text-purple-900">
            ₹{summaryStats.totalValue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Item Header - Always Visible */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => setExpandedItemIndex(expandedItemIndex === index ? null : index)}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedItemIndex(expandedItemIndex === index ? null : index);
                  }}>
                  {expandedItemIndex === index ? (
                    <FaChevronUp className="h-4 w-4" />
                  ) : (
                    <FaChevronDown className="h-4 w-4" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {item.item_name || `Item #${index + 1}`}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {item.quantity} {item.uom} @ ₹{parseFloat(item.rate || 0).toFixed(2)} = ₹{item.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(index);
                  }}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded ml-2"
                  title="Remove item">
                  <FaTrash className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Expanded Content */}
            {expandedItemIndex === index && (
              <div className="p-6 space-y-5 max-h-[600px] overflow-y-auto">
                {/* Product Selection Section */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaBox className="h-4 w-4 text-blue-600" />
                    Product Selection
                  </h4>

                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Search & Select Material/Product
                    </label>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery[index] || ''}
                        onChange={(e) => handleSearch(index, e.target.value)}
                        placeholder="Search by name, category, barcode, HSN..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={disabled}
                      />
                    </div>

                    {/* Search Results Dropdown */}
                    {filteredResults[index] && filteredResults[index].length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                        {filteredResults[index].map((invItem) => (
                          <button
                            key={invItem.id}
                            type="button"
                            onClick={() => handleSelectInventoryItem(index, invItem)}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {invItem.product_name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {invItem.category} • {invItem.material}
                                </p>
                              </div>
                              <span className="text-xs font-semibold text-green-700 whitespace-nowrap ml-2">
                                ₹{(invItem.cost_price || invItem.purchase_price || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex gap-3 mt-1 text-xs text-gray-500">
                              <span>📦 {invItem.quantity_available || 0} in stock</span>
                              <span>📍 {invItem.warehouse_location || 'N/A'}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Product Info */}
                  {item.product_id && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.item_name}</p>
                          <p className="text-xs text-gray-600">
                            {item.description}
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            ✓ Available: {item.available_quantity} units
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleItemUpdate(index, {
                              product_id: null,
                              item_name: '',
                              description: '',
                            })
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTimes className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity & Pricing Section */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaDollarSign className="h-4 w-4 text-green-600" />
                    Quantity & Pricing
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {/* UOM Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Unit of Measure
                      </label>
                      <select
                        value={item.uom}
                        onChange={(e) => handleUomChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={disabled}
                      >
                        {uomOptions.map((uom) => (
                          <option key={uom.value} value={uom.value}>
                            {uom.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemUpdate(index, { quantity: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={disabled}
                      />
                    </div>

                    {/* Rate per Unit */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Rate per Unit (₹)
                      </label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemUpdate(index, { rate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={disabled}
                      />
                    </div>

                    {/* Total Amount */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Total Amount (₹)
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 font-semibold text-gray-700">
                        {item.total.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">
                        {parseFloat(item.quantity || 0).toFixed(2)} × ₹{parseFloat(item.rate || 0).toFixed(2)}
                      </span>
                      <span className="font-bold text-yellow-800">
                        ₹{item.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Details Section */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Additional Details
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {/* HSN Code */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        HSN Code
                      </label>
                      <input
                        type="text"
                        value={item.hsn}
                        onChange={(e) =>
                          handleItemUpdate(index, { hsn: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="HSN Code"
                        disabled={disabled}
                      />
                    </div>

                    {/* Tax Rate */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        value={item.tax_rate || 0}
                        onChange={(e) =>
                          handleItemUpdate(index, { tax_rate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.1"
                        disabled={disabled}
                      />
                    </div>

                    {/* GSM (for fabrics) */}
                    {item.type === 'fabric' && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          GSM
                        </label>
                        <input
                          type="text"
                          value={item.gsm || ''}
                          onChange={(e) =>
                            handleItemUpdate(index, { gsm: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="180, 200, etc."
                          disabled={disabled}
                        />
                      </div>
                    )}

                    {/* Width (for fabrics) */}
                    {item.type === 'fabric' && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Width
                        </label>
                        <input
                          type="text"
                          value={item.width || ''}
                          onChange={(e) =>
                            handleItemUpdate(index, { width: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="60 inch"
                          disabled={disabled}
                        />
                      </div>
                    )}

                    {/* Color (for fabrics) */}
                    {item.type === 'fabric' && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          value={item.color || ''}
                          onChange={(e) =>
                            handleItemUpdate(index, { color: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Red, Blue, etc."
                          disabled={disabled}
                        />
                      </div>
                    )}
                  </div>

                  {/* Remarks / Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Remarks / Special Instructions
                    </label>
                    <textarea
                      value={item.remarks || ''}
                      onChange={(e) =>
                        handleItemUpdate(index, { remarks: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Add any special instructions or remarks..."
                      rows="2"
                      disabled={disabled}
                    />
                  </div>
                </div>

                {/* Warehouse Info */}
                {item.warehouse_location && (
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700">
                      📍 Warehouse Location: {item.warehouse_location}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Item Button */}
      {!disabled && (
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition"
        >
          <FaPlus className="h-4 w-4" />
          Add More Items
        </button>
      )}
    </div>
  );
};

export default EnhancedPOItemsBuilder;