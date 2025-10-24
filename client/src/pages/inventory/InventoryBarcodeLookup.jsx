import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaBoxOpen, FaBarcode, FaQrcode, FaPrint, 
  FaMapMarkerAlt, FaDollarSign, FaWarehouse, FaTruck,
  FaInfoCircle, FaHistory, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import BarcodeScanner from '../../components/BarcodeScanner';
import Barcode from 'react-barcode';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const InventoryBarcodeLookup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if barcode is provided in URL parameters
    const urlParams = new URLSearchParams(location.search);
    const barcodeParam = urlParams.get('barcode');
    if (barcodeParam) {
      setManualBarcode(barcodeParam);
      setScannedBarcode(barcodeParam);
      lookupInventory(barcodeParam);
    }
  }, [location]);

  const handleScanSuccess = async (decodedText) => {
    setScannedBarcode(decodedText);
    setIsScanning(false);
    await lookupInventory(decodedText);
  };

  const handleScanError = (error) => {
    console.log('Scan error:', error);
  };

  const handleManualLookup = async () => {
    if (!manualBarcode.trim()) {
      toast.error('Please enter a barcode');
      return;
    }
    setScannedBarcode(manualBarcode);
    await lookupInventory(manualBarcode);
  };

  const lookupInventory = async (barcode) => {
    setLoading(true);
    try {
      const response = await api.get(`/inventory/lookup/barcode/${barcode}`);
      setInventoryData(response.data.inventory);
      toast.success('Item found!');
    } catch (error) {
      console.error('Barcode lookup error:', error);
      if (error.response?.status === 404) {
        toast.error('Item not found with this barcode');
      } else {
        toast.error('Failed to lookup item');
      }
      setInventoryData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStockTypeLabel = (type) => {
    const types = {
      'general_extra': 'General/Factory Stock',
      'project_specific': 'Project Specific',
      'consignment': 'Consignment',
      'returned': 'Returned'
    };
    return types[type] || type;
  };

  const getStockTypeColor = (type) => {
    const colors = {
      'general_extra': 'bg-blue-100 text-blue-800',
      'project_specific': 'bg-purple-100 text-purple-800',
      'consignment': 'bg-yellow-100 text-yellow-800',
      'returned': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getQualityColor = (status) => {
    const colors = {
      'approved': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'quarantine': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStockAlert = (current, min, max) => {
    if (current <= 0) {
      return { text: 'Out of Stock', color: 'text-red-600', icon: FaExclamationTriangle };
    } else if (current < min) {
      return { text: 'Low Stock', color: 'text-orange-600', icon: FaExclamationTriangle };
    } else if (current > max) {
      return { text: 'Overstock', color: 'text-yellow-600', icon: FaExclamationTriangle };
    } else {
      return { text: 'Normal Stock', color: 'text-green-600', icon: FaCheckCircle };
    }
  };

  const printPage = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaQrcode className="mr-3 text-blue-600" />
            Inventory Barcode Scanner
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Scan or enter a barcode to view complete product information
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Manual Barcode Input */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaBarcode className="inline mr-2" />
                Enter Barcode Manually
              </label>
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter barcode number..."
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                onKeyPress={(e) => e.key === 'Enter' && handleManualLookup()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleManualLookup}
                disabled={loading}
                className="w-full md:w-auto px-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <FaSearch />
                {loading ? 'Searching...' : 'Lookup'}
              </button>
            </div>
          </div>

          {/* Barcode Scanner */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <FaQrcode className="inline mr-2" />
              Or Use Camera to Scan
            </h3>
            <BarcodeScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              isScanning={isScanning}
              setIsScanning={setIsScanning}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded shadow-md p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Searching for item...</p>
        </div>
      )}

      {/* Product Information Display */}
      {inventoryData && !loading && (
        <div className="space-y-6">
          {/* Barcode Display & Print */}
          <div className="bg-white rounded shadow-md print-section">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Barcode Display</h3>
              <button
                onClick={printPage}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                <FaPrint /> Print
              </button>
            </div>
            <div className="p-6 text-center bg-gray-50">
              <p className="font-semibold text-gray-800 mb-4 text-lg">{inventoryData.product_name}</p>
              <div className="flex justify-center mb-2">
                <Barcode value={inventoryData.barcode} />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Code: {inventoryData.product_code || 'N/A'}
              </p>
            </div>
          </div>

          {/* Main Product Information */}
          <div className="bg-white rounded shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaBoxOpen className="mr-2 text-blue-600" />
                Product Information
              </h3>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Basic Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2">
                  Basic Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Product Name</label>
                    <p className="font-medium text-gray-900">{inventoryData.product_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Product Code</label>
                    <p className="font-medium text-gray-900">{inventoryData.product_code || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Description</label>
                    <p className="text-sm text-gray-700">{inventoryData.description || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Category</label>
                    <p className="font-medium text-gray-900">{inventoryData.category || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Sub Category</label>
                    <p className="text-sm text-gray-700">{inventoryData.sub_category || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Product Type</label>
                    <p className="text-sm text-gray-700">{inventoryData.product_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">HSN Code</label>
                    <p className="text-sm text-gray-700">{inventoryData.hsn_code || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Column 2: Physical Attributes */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2">
                  Physical Attributes
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Brand</label>
                    <p className="font-medium text-gray-900">{inventoryData.brand || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Color</label>
                    <p className="text-sm text-gray-700">{inventoryData.color || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Size</label>
                    <p className="text-sm text-gray-700">{inventoryData.size || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Material</label>
                    <p className="text-sm text-gray-700">{inventoryData.material || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Weight</label>
                    <p className="text-sm text-gray-700">{inventoryData.weight || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Dimensions</label>
                    <p className="text-sm text-gray-700">{inventoryData.dimensions || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Unit of Measurement</label>
                    <p className="font-medium text-gray-900">{inventoryData.unit_of_measurement || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Column 3: Pricing & Stock Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2">
                  Pricing & Stock
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Cost Price</label>
                    <p className="font-semibold text-gray-900">
                      ₹{inventoryData.cost_price ? parseFloat(inventoryData.cost_price).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Selling Price</label>
                    <p className="font-semibold text-gray-900">
                      ₹{inventoryData.selling_price ? parseFloat(inventoryData.selling_price).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">MRP</label>
                    <p className="text-sm text-gray-700">
                      ₹{inventoryData.mrp ? parseFloat(inventoryData.mrp).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Tax Percentage</label>
                    <p className="text-sm text-gray-700">{inventoryData.tax_percentage || '0'}%</p>
                  </div>
                  <div className="pt-3 border-t">
                    <label className="text-xs text-gray-500">Stock Type</label>
                    <p>
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStockTypeColor(inventoryData.stock_type)}`}>
                        {getStockTypeLabel(inventoryData.stock_type)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Quality Status</label>
                    <p>
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getQualityColor(inventoryData.quality_status)}`}>
                        {inventoryData.quality_status || 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Tracking</label>
                    <div className="flex gap-2 mt-1">
                      {inventoryData.is_serialized && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Serialized</span>
                      )}
                      {inventoryData.is_batch_tracked && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Batch Tracked</span>
                      )}
                      {!inventoryData.is_serialized && !inventoryData.is_batch_tracked && (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="r from-blue-500 to-blue-600 rounded shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaWarehouse className="text-3xl opacity-80" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Current Stock</p>
                  <p className="text-3xl font-bold">
                    {parseFloat(inventoryData.current_stock || 0).toFixed(2)}
                  </p>
                  <p className="text-xs opacity-75">{inventoryData.unit_of_measurement}</p>
                </div>
              </div>
              {(() => {
                const alert = getStockAlert(
                  inventoryData.current_stock || 0,
                  inventoryData.minimum_stock_level || 0,
                  inventoryData.maximum_stock_level || 0
                );
                return (
                  <div className="flex items-center gap-1 text-xs bg-white bg-opacity-20 rounded px-2 py-1 mt-2">
                    <alert.icon className="text-xs" />
                    <span>{alert.text}</span>
                  </div>
                );
              })()}
            </div>

            <div className="r from-green-500 to-green-600 rounded shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <FaCheckCircle className="text-3xl opacity-80" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Available Stock</p>
                  <p className="text-3xl font-bold">
                    {parseFloat(inventoryData.available_stock || 0).toFixed(2)}
                  </p>
                  <p className="text-xs opacity-75">{inventoryData.unit_of_measurement}</p>
                </div>
              </div>
            </div>

            <div className="r from-orange-500 to-orange-600 rounded shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <FaTruck className="text-3xl opacity-80" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Reserved</p>
                  <p className="text-3xl font-bold">
                    {parseFloat(inventoryData.reserved_quantity || 0).toFixed(2)}
                  </p>
                  <p className="text-xs opacity-75">{inventoryData.unit_of_measurement}</p>
                </div>
              </div>
            </div>

            <div className="r from-purple-500 to-purple-600 rounded shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <FaBoxOpen className="text-3xl opacity-80" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Consumed</p>
                  <p className="text-3xl font-bold">
                    {parseFloat(inventoryData.consumed_quantity || 0).toFixed(2)}
                  </p>
                  <p className="text-xs opacity-75">{inventoryData.unit_of_measurement}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Info */}
            <div className="bg-white rounded shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-red-600" />
                  Location Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-500">Warehouse Location</label>
                  <p className="font-medium text-gray-900">{inventoryData.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Rack/Bin</label>
                  <p className="text-sm text-gray-700">{inventoryData.rack || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Batch Number</label>
                  <p className="text-sm text-gray-700">{inventoryData.batch_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Serial Number</label>
                  <p className="text-sm text-gray-700">{inventoryData.serial_number || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Stock Limits */}
            <div className="bg-white rounded shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-600" />
                  Stock Management
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-500">Minimum Stock Level</label>
                  <p className="font-medium text-orange-600">
                    {inventoryData.minimum_stock_level || 0} {inventoryData.unit_of_measurement}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Maximum Stock Level</label>
                  <p className="font-medium text-green-600">
                    {inventoryData.maximum_stock_level || 0} {inventoryData.unit_of_measurement}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Reorder Point</label>
                  <p className="text-sm text-gray-700">
                    {inventoryData.reorder_point || 0} {inventoryData.unit_of_measurement}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Reorder Quantity</label>
                  <p className="text-sm text-gray-700">
                    {inventoryData.reorder_quantity || 0} {inventoryData.unit_of_measurement}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Calculation */}
          <div className="bg-white rounded shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaDollarSign className="mr-2 text-green-600" />
                Stock Value
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600 mb-2">Total Value (Cost)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{((inventoryData.current_stock || 0) * (inventoryData.cost_price || 0)).toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <p className="text-sm text-gray-600 mb-2">Total Value (Selling)</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{((inventoryData.current_stock || 0) * (inventoryData.selling_price || 0)).toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <p className="text-sm text-gray-600 mb-2">Potential Profit</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{((inventoryData.current_stock || 0) * ((inventoryData.selling_price || 0) - (inventoryData.cost_price || 0))).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded shadow-md p-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate(`/inventory/${inventoryData.id}/history`)}
                className="flex items-center gap-2 bg-purple-600 text-white px-2 py-2 rounded hover:bg-purple-700 transition"
              >
                <FaHistory />
                View History
              </button>
              <button
                onClick={() => navigate('/inventory')}
                className="flex items-center gap-2 bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600 transition"
              >
                <FaBoxOpen />
                View All Inventory
              </button>
              <button
                onClick={() => {
                  setInventoryData(null);
                  setScannedBarcode('');
                  setManualBarcode('');
                }}
                className="flex items-center gap-2 bg-gray-600 text-white px-2 py-2 rounded hover:bg-gray-700 transition"
              >
                <FaSearch />
                Scan Another Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results Found */}
      {!inventoryData && scannedBarcode && !loading && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-2xl text-yellow-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Item Not Found</h3>
              <p className="text-yellow-700 mt-1">
                No inventory item found with barcode: <strong>{scannedBarcode}</strong>
              </p>
              <button
                onClick={() => {
                  setScannedBarcode('');
                  setManualBarcode('');
                }}
                className="mt-3 text-sm text-yellow-800 underline hover:text-yellow-900"
              >
                Try another barcode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryBarcodeLookup;