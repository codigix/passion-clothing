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
  FaTag,
  FaShoppingCart,
  FaInfoCircle,
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EnhancedPOItemsBuilder_V2 = ({
  items = [],
  onItemsChange,
  vendorId,
  vendorName,
  vendorDetails = {},
  salesOrderItems = [],
  customerName = '',
  projectName = '',
  disabled = false,
}) => {
  const [expandedItemIndex, setExpandedItemIndex] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState({});
  const [filteredResults, setFilteredResults] = useState({});
  const [loadingInventory, setLoadingInventory] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [uomPrices, setUomPrices] = useState({});
  const [hsnCodes, setHsnCodes] = useState([]);
  const [loadingHSN, setLoadingHSN] = useState(false);

  const sampleHSNCodes = [
    { code: '5208', description: 'Woven fabrics of cotton' },
    { code: '5209', description: 'Woven fabrics of cotton (more than 85%)' },
    { code: '5210', description: 'Woven fabrics of cotton (less than 85%)' },
    { code: '5407', description: 'Woven fabrics of synthetic filament yarn' },
    { code: '5408', description: 'Woven fabrics of artificial filament yarn' },
    { code: '5512', description: 'Woven fabrics of synthetic staple fibers' },
    { code: '6117', description: 'Other made-up clothing articles' },
    { code: '6203', description: 'Men\'s suits, ensembles, jackets, trousers' },
    { code: '6204', description: 'Women\'s suits, ensembles, jackets, trousers' },
    { code: '6205', description: 'Men\'s shirts' },
    { code: '6206', description: 'Women\'s shirts' },
    { code: '6210', description: 'Garments, made up of fabrics' },
  ];

  // Item Type options
  const itemTypes = [
    {
      value: 'fabric',
      label: '🧵 Fabric',
      icon: '🧵',
      fields: ['fabric_name', 'color', 'gsm', 'width', 'material', 'hsn'],
    },
    {
      value: 'accessories',
      label: '🔘 Accessories',
      icon: '🔘',
      fields: ['item_name', 'material', 'hsn', 'specifications'],
    },
  ];

  const uomOptions = [
    { value: 'Meters', label: 'Meters (m)', conversionFactor: 1, category: 'length' },
    { value: 'Yards', label: 'Yards (yd)', conversionFactor: 0.9144, category: 'length' },
    { value: 'Feet', label: 'Feet (ft)', conversionFactor: 0.3048, category: 'length' },
    { value: 'Centimeters', label: 'Centimeters (cm)', conversionFactor: 0.01, category: 'length' },
    { value: 'Kilograms', label: 'Kilograms (kg)', conversionFactor: 1, category: 'weight' },
    { value: 'Grams', label: 'Grams (g)', conversionFactor: 0.001, category: 'weight' },
    { value: 'Milligrams', label: 'Milligrams (mg)', conversionFactor: 0.000001, category: 'weight' },
    { value: 'Pounds', label: 'Pounds (lb)', conversionFactor: 0.453592, category: 'weight' },
    { value: 'Pieces', label: 'Pieces (pcs)', conversionFactor: 1, category: 'count' },
    { value: 'Sets', label: 'Sets', conversionFactor: 1, category: 'count' },
    { value: 'Dozens', label: 'Dozens', conversionFactor: 12, category: 'count' },
    { value: 'Boxes', label: 'Boxes', conversionFactor: 1, category: 'count' },
    { value: 'Liters', label: 'Liters (L)', conversionFactor: 1, category: 'volume' },
    { value: 'Milliliters', label: 'Milliliters (ml)', conversionFactor: 0.001, category: 'volume' },
  ];

  // Fetch inventory and HSN codes on component load
  useEffect(() => {
    fetchInventoryItems();
    fetchHSNCodes();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      setLoadingInventory((prev) => ({
        ...prev,
        global: true,
      }));
      const response = await api.get('/inventory?limit=500');
      const items = response.data.inventory || [];
      setInventoryItems(items);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoadingInventory((prev) => ({
        ...prev,
        global: false,
      }));
    }
  };

  const fetchHSNCodes = async () => {
    try {
      setLoadingHSN(true);
      const response = await api.get('/procurement/hsn-codes');
      setHsnCodes(response.data.hsnCodes || []);
    } catch (error) {
      console.error('Error fetching HSN codes:', error);
      toast.error('Failed to load HSN codes');
    } finally {
      setLoadingHSN(false);
    }
  };

  // Search inventory items with type filtering
  const handleSearch = useCallback(
    (itemIndex, query, itemType) => {
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

      let results = inventoryItems.filter((item) => {
        const searchLower = query.toLowerCase();
        const matchesSearch =
          item.product_name?.toLowerCase().includes(searchLower) ||
          item.category?.toLowerCase().includes(searchLower) ||
          item.material?.toLowerCase().includes(searchLower) ||
          item.barcode?.includes(query) ||
          item.hsn?.includes(query);

        // Filter by item type
        const matchesType =
          !itemType ||
          item.product_type?.toLowerCase() === itemType.toLowerCase() ||
          (itemType === 'fabric' && item.category?.toLowerCase().includes('fabric')) ||
          (itemType === 'accessories' && item.category?.toLowerCase().includes('accessories'));

        return matchesSearch && matchesType;
      });

      setFilteredResults((prev) => ({
        ...prev,
        [itemIndex]: results.slice(0, 10),
      }));
    },
    [inventoryItems]
  );

  // Select item from dropdown
  const handleSelectInventoryItem = (itemIndex, inventoryItem) => {
    const currentItem = items[itemIndex];
    
    const updatedItem = {
      ...currentItem,
      product_id: inventoryItem.id,
      item_name: inventoryItem.product_name,
      fabric_name:
        inventoryItem.product_type === 'Fabric' ? inventoryItem.product_name : '',
      material: inventoryItem.material || '',
      description: inventoryItem.description || '',
      hsn: inventoryItem.hsn || '',
      uom: inventoryItem.uom || 'Pieces',
      available_quantity: inventoryItem.quantity_available || 0,
      warehouse_location: inventoryItem.warehouse_location || '',
      rate: inventoryItem.cost_price || inventoryItem.purchase_price || 0,
      product_type: inventoryItem.product_type || 'material',
      category: inventoryItem.category || '',
    };

    // Auto-set item type based on product
    if (inventoryItem.product_type === 'Fabric') {
      updatedItem.type = 'fabric';
      updatedItem.gsm = inventoryItem.gsm || '';
      updatedItem.width = inventoryItem.width || '';
    } else {
      updatedItem.type = 'accessories';
    }

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

  const handleItemUpdate = (itemIndex, updatedItem) => {
    const updatedItems = [...items];
    updatedItem.total = parseFloat(calculateTotalValue(updatedItem)) || 0;
    updatedItems[itemIndex] = updatedItem;
    onItemsChange(updatedItems);
  };

  // Handle item field change
  const handleFieldChange = (itemIndex, fieldName, value) => {
    const updatedItem = { ...items[itemIndex] };

    if (fieldName === 'uom') {
      // Handle UOM change with price conversion
      const oldUOM = updatedItem.uom;
      const oldFactor =
        uomOptions.find((u) => u.value === oldUOM)?.conversionFactor || 1;
      const newFactor =
        uomOptions.find((u) => u.value === value)?.conversionFactor || 1;

      const oldRate = parseFloat(updatedItem.rate) || 0;
      const newRate = oldRate * (oldFactor / newFactor);

      updatedItem.rate = newRate.toFixed(2);
      updatedItem.uom = value;
    } else {
      updatedItem[fieldName] = value;
    }

    handleItemUpdate(itemIndex, updatedItem);
  };

  // Remove item
  const handleRemoveItem = (itemIndex) => {
    if (items.length === 1) {
      toast.error('At least one item is required');
      return;
    }

    const updatedItems = items.filter((_, index) => index !== itemIndex);
    onItemsChange(updatedItems);
    setExpandedItemIndex(null);
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
      fabric_name: '',
      color: '',
      material: '',
      hsn: '',
      gsm: '',
      width: '',
      type: 'fabric',
      description: '',
      uom: 'Pieces',
      quantity: '',
      rate: '',
      total: 0,
      supplier: vendorName || '',
      remarks: '',
      available_quantity: 0,
      warehouse_location: '',
      tax_rate: 12,
      specifications: '',
    };

    onItemsChange([...items, newItem]);
    setExpandedItemIndex(items.length);
  };

  const getUomInfo = (uomValue) => {
    return uomOptions.find((u) => u.value === uomValue) || uomOptions[0];
  };

  const calculateTotalMaterial = (item) => {
    const material_needed = parseFloat(item.material_needed) || 0;
    const quantity = parseFloat(item.quantity) || 0;
    return (material_needed * quantity).toFixed(2);
  };

  const getUomShortLabel = (uomValue) => {
    const uom = getUomInfo(uomValue);
    const label = uom.label.match(/\(([^)]*)\)/)?.[1] || uom.label;
    return label;
  };

  const getMaterialRequirementDisplay = (item) => {
    const total = calculateTotalMaterial(item);
    const uomShort = getUomShortLabel(item.uom);
    return `${total} ${uomShort}`;
  };

  const getConversionInfo = (item) => {
    const uom = getUomInfo(item.uom);
    const material_needed = parseFloat(item.material_needed) || 0;
    const quantity = parseFloat(item.quantity) || 0;
    const total = material_needed * quantity;
    
    if (uom.category === 'length') {
      const metersEquivalent = total * uom.conversionFactor;
      return `(≈ ${metersEquivalent.toFixed(2)} meters)`;
    } else if (uom.category === 'weight') {
      const kgEquivalent = total * uom.conversionFactor;
      return `(≈ ${kgEquivalent.toFixed(2)} kg)`;
    } else if (uom.category === 'volume') {
      const literEquivalent = total * uom.conversionFactor;
      return `(≈ ${literEquivalent.toFixed(2)} liters)`;
    }
    return '';
  };

  const calculateTotalValue = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const material_needed = parseFloat(item.material_needed) || 0;
    
    if (item.type === 'fabric' && material_needed > 0) {
      const totalMaterial = material_needed * quantity;
      return (totalMaterial * rate).toFixed(2);
    } else {
      return (quantity * rate).toFixed(2);
    }
  };

  const calculateTotalQuantityByUom = (items) => {
    if (items.length === 0) return '0';
    const uom = items[0].uom;
    const totalQty = items.reduce(
      (sum, item) => sum + (parseFloat(item.quantity) || 0),
      0
    );
    return `${totalQty.toFixed(2)} ${getUomShortLabel(uom)}`;
  };

  const calculateSummaryStats = () => {
    const totalValue = items.reduce((sum, item) => sum + (parseFloat(calculateTotalValue(item)) || 0), 0);
    const totalMaterial = items.reduce((sum, item) => {
      if (item.type === 'fabric') {
        return sum + parseFloat(calculateTotalMaterial(item) || 0);
      }
      return sum;
    }, 0);
    const totalQuantity = items.reduce(
      (sum, item) => sum + (parseFloat(item.quantity) || 0),
      0
    );
    
    return {
      totalItems: items.length,
      totalQuantity,
      totalValue,
      totalMaterial,
    };
  };

  const summaryStats = calculateSummaryStats();

  // Get vendor supply capability info
  const getVendorSupplyInfo = () => {
    const capabilities = vendorDetails?.capabilities || [];
    const leadTime = vendorDetails?.lead_time_days || 'Not specified';
    const minOrder = vendorDetails?.minimum_order_value || 'Not specified';

    return { capabilities, leadTime, minOrder };
  };

  const vendorSupplyInfo = getVendorSupplyInfo();

  return (
    <div className="space-y-4">
      {/* Vendor Information Header */}
      {vendorId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Vendor</p>
              <p className="text-sm font-semibold text-gray-900">{vendorName}</p>
              <p className="text-xs text-gray-600">
                {vendorDetails?.vendor_code || 'Code: N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Project</p>
              <p className="text-sm font-semibold text-gray-900">
                {projectName || 'N/A'}
              </p>
              <p className="text-xs text-gray-600">Customer: {customerName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Lead Time</p>
              <p className="text-sm font-semibold text-gray-900">
                {vendorSupplyInfo.leadTime} days
              </p>
              <p className="text-xs text-gray-600">Min Order: ₹{vendorSupplyInfo.minOrder}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Capabilities</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {vendorSupplyInfo.capabilities.length > 0 ? (
                  vendorSupplyInfo.capabilities.slice(0, 2).map((cap, idx) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {cap}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">Not specified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs font-semibold text-green-600 uppercase">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{summaryStats.totalItems}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-green-600 uppercase">Total Quantity</p>
            <p className="text-2xl font-bold text-gray-900">
              {summaryStats.totalQuantity.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-green-600 uppercase">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{summaryStats.totalValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Sales Order Items Reference */}
      {salesOrderItems && salesOrderItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2 mb-3">
            <FaInfoCircle className="h-4 w-4" />
            Customer Requirements (from Sales Order)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {salesOrderItems.slice(0, 4).map((soItem, idx) => (
              <div key={idx} className="bg-white rounded p-2 border border-amber-100 text-xs">
                <p className="font-semibold text-gray-900">
                  {soItem.fabric_name || soItem.description || 'Item ' + (idx + 1)}
                </p>
                <p className="text-gray-600">
                  {soItem.quantity} {soItem.uom} | Color: {soItem.color || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
          >
            {/* Collapsed Header */}
            <div
              onClick={() =>
                setExpandedItemIndex(expandedItemIndex === index ? null : index)
              }
              className="p-4 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {itemTypes.find((t) => t.value === item.type)?.icon || '📦'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {item.fabric_name || item.item_name || `Item #${index + 1}`}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">
                      {item.quantity} {getUomShortLabel(item.uom)} @ ₹{parseFloat(item.rate || 0).toFixed(2)} =
                      ₹{item.total.toFixed(2)}
                      {item.color && <span> | {item.color}</span>}
                      {item.material && <span> | {item.material}</span>}
                    </p>
                  </div>
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
                  title="Remove item"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              )}

              <div className="ml-2 text-gray-400">
                {expandedItemIndex === index ? (
                  <FaChevronUp className="h-4 w-4" />
                ) : (
                  <FaChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedItemIndex === index && (
              <div className="p-6 space-y-5 max-h-[700px] overflow-y-auto bg-gray-50 border-t border-gray-200">
                {/* 1. Item Type Selection */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaTag className="h-4 w-4 text-purple-600" />
                    Step 1: Item Type
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {itemTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleFieldChange(index, 'type', type.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          item.type === type.value
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Product Selection Section */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaBox className="h-4 w-4 text-blue-600" />
                    Step 2: Select Product
                  </h4>

                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Search by Name, Category, HSN, or Barcode
                    </label>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Type at least 2 characters..."
                        value={searchQuery[index] || ''}
                        onChange={(e) =>
                          handleSearch(index, e.target.value, item.type)
                        }
                        disabled={disabled}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    {/* Search Results Dropdown */}
                    {(filteredResults[index] || []).length > 0 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredResults[index].map((invItem) => (
                          <button
                            key={invItem.id}
                            type="button"
                            onClick={() => handleSelectInventoryItem(index, invItem)}
                            className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                          >
                            <p className="text-sm font-semibold text-gray-900">
                              {invItem.product_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {invItem.category} | HSN: {invItem.hsn || 'N/A'} | Available:{' '}
                              {invItem.quantity_available || 0}
                            </p>
                            <p className="text-xs text-green-600 font-semibold">
                              ₹{invItem.cost_price || invItem.purchase_price || 0}/unit
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Item Display */}
                  {item.product_id && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            ✓ {item.fabric_name || item.item_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            📦 Available: {item.available_quantity} units | 📍 Location:{' '}
                            {item.warehouse_location || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Type-Specific Fields - Fabric */}
                {item.type === 'fabric' && (
                  <div className="space-y-3 pb-4 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaRuler className="h-4 w-4 text-indigo-600" />
                      Step 3: Fabric Specifications
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Fabric Name
                        </label>
                        <input
                          type="text"
                          value={item.fabric_name}
                          onChange={(e) =>
                            handleFieldChange(index, 'fabric_name', e.target.value)
                          }
                          placeholder="e.g., Cotton, Polyester"
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          value={item.color}
                          onChange={(e) =>
                            handleFieldChange(index, 'color', e.target.value)
                          }
                          placeholder="e.g., White, Navy Blue"
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          GSM (Grams per Square Meter)
                        </label>
                        <input
                          type="number"
                          value={item.gsm}
                          onChange={(e) =>
                            handleFieldChange(index, 'gsm', e.target.value)
                          }
                          placeholder="e.g., 200, 250"
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Width (inches)
                        </label>
                        <input
                          type="number"
                          value={item.width}
                          onChange={(e) =>
                            handleFieldChange(index, 'width', e.target.value)
                          }
                          placeholder="e.g., 58, 60"
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Tax & HSN Codes */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaTag className="h-4 w-4 text-orange-600" />
                    Step 4: Tax & HSN Code
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        HSN Code <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.hsn}
                        onChange={(e) =>
                          handleFieldChange(index, 'hsn', e.target.value)
                        }
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                      >
                        <option value="">Select HSN Code</option>
                        <optgroup label="Sample HSN Codes">
                          {sampleHSNCodes.map((hsnItem) => (
                            <option key={hsnItem.code} value={hsnItem.code}>
                              {hsnItem.code} - {hsnItem.description}
                            </option>
                          ))}
                        </optgroup>
                        {hsnCodes.length > 0 && (
                          <optgroup label="Database HSN Codes">
                            {hsnCodes.map((hsnItem) => (
                              <option key={hsnItem.id} value={hsnItem.code}>
                                {hsnItem.code} - {hsnItem.description}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      {loadingHSN && (
                        <p className="text-xs text-gray-500 mt-1">Loading HSN codes...</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={item.tax_rate}
                        onChange={(e) =>
                          handleFieldChange(index, 'tax_rate', e.target.value)
                        }
                        placeholder="e.g., 12"
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Material Requirements (Fabric Only) */}
                {item.type === 'fabric' && (
                  <div className="space-y-3 pb-4 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaWeightHanging className="h-4 w-4 text-amber-600" />
                      Step 5: Material Requirements
                    </h4>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Quantity Needed
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.quantity || ''}
                          onChange={(e) =>
                            handleFieldChange(index, 'quantity', e.target.value)
                          }
                          placeholder="e.g., 200"
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">No. of units</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Material Per Unit
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.material_needed || ''}
                            onChange={(e) =>
                              handleFieldChange(index, 'material_needed', e.target.value)
                            }
                            placeholder="e.g., 2.5"
                            disabled={disabled}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                          />
                          <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 whitespace-nowrap">
                            {getUomShortLabel(item.uom)}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">per unit</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Total Material Required
                        </label>
                        <div className="space-y-1">
                          <div className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-amber-50 text-gray-900 font-bold">
                            {getMaterialRequirementDisplay(item)}
                          </div>
                          <p className="text-xs text-gray-500">
                            {getConversionInfo(item)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {item.material_needed && item.quantity && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <span className="text-amber-600 text-lg">ℹ️</span>
                        <div className="text-xs text-amber-800">
                          <strong>Calculation:</strong> {item.material_needed} {getUomShortLabel(item.uom)}/unit × {item.quantity} units = <strong>{getMaterialRequirementDisplay(item)}</strong>
                          {getConversionInfo(item) && <div className="mt-1">{getConversionInfo(item)}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Pricing & Rate */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaDollarSign className="h-4 w-4 text-green-600" />
                    Step 6: Pricing
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        UOM
                      </label>
                      <select
                        value={item.uom}
                        onChange={(e) => handleFieldChange(index, 'uom', e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      >
                        {uomOptions.map((uom) => (
                          <option key={uom.value} value={uom.value}>
                            {uom.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Rate (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) =>
                          handleFieldChange(index, 'rate', e.target.value)
                        }
                        placeholder="0.00"
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600">Total Value</p>
                    <p className="text-lg font-bold text-green-700">₹{item.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* 7. Type-Specific Fields - Accessories */}
                {item.type === 'accessories' && (
                  <div className="space-y-3 pb-4 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaShoppingCart className="h-4 w-4 text-pink-600" />
                      Step 5: Accessory Details
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={item.item_name}
                          onChange={(e) =>
                            handleFieldChange(index, 'item_name', e.target.value)
                          }
                          placeholder="e.g., Buttons, Zippers"
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Material/Type
                        </label>
                        <input
                          type="text"
                          value={item.material}
                          onChange={(e) =>
                            handleFieldChange(index, 'material', e.target.value)
                          }
                          placeholder="e.g., Plastic, Metal"
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Quantity Needed
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.quantity || ''}
                          onChange={(e) =>
                            handleFieldChange(index, 'quantity', e.target.value)
                          }
                          placeholder="e.g., 100"
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">No. of units</p>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Specifications
                        </label>
                        <textarea
                          value={item.specifications || ''}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              'specifications',
                              e.target.value
                            )
                          }
                          placeholder="e.g., Size, Model, Special Requirements"
                          disabled={disabled}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. Additional Details & Remarks */}
                <div className="space-y-3 pb-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaInfoCircle className="h-4 w-4 text-orange-600" />
                    Step {item.type === 'fabric' ? '7' : '6'}: Remarks & Notes
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Remarks
                    </label>
                    <textarea
                      value={item.remarks}
                      onChange={(e) =>
                        handleFieldChange(index, 'remarks', e.target.value)
                      }
                      placeholder="Add any special notes or requirements..."
                      disabled={disabled}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                    />
                  </div>

                  {item.warehouse_location && (
                    <div className="bg-gray-100 rounded-lg p-3 mt-3">
                      <p className="text-xs font-semibold text-gray-600">Warehouse Location</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.warehouse_location}
                      </p>
                    </div>
                  )}
                </div>


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
          className="w-full py-3 px-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <FaPlus className="h-4 w-4" />
          Add More Items
        </button>
      )}

      {/* Validation Error */}
      {items.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          ⚠️ At least one item is required to create a purchase order.
        </div>
      )}
    </div>
  );
};

export default EnhancedPOItemsBuilder_V2;