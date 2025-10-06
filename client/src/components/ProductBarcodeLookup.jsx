import React, { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import BarcodeScanner from './BarcodeScanner';
import BarcodeDisplay from './BarcodeDisplay';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProductBarcodeLookup = () => {
  const location = useLocation();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if barcode is provided in URL parameters
    const urlParams = new URLSearchParams(location.search);
    const barcodeParam = urlParams.get('barcode');
    if (barcodeParam) {
      setManualBarcode(barcodeParam);
      setScannedBarcode(barcodeParam);
      lookupProduct(barcodeParam);
    }
  }, [location]);

  const handleScanSuccess = async (decodedText) => {
    setScannedBarcode(decodedText);
    await lookupProduct(decodedText);
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
    await lookupProduct(manualBarcode);
  };

  const lookupProduct = async (barcode) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/scan/${barcode}`);
      setProductData(response.data.product);
      toast.success('Product found!');
    } catch (error) {
      console.error('Barcode lookup error:', error);
      if (error.response?.status === 404) {
        toast.error('Product not found with this barcode');
      } else {
        toast.error('Failed to lookup product');
      }
      setProductData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'discontinued': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'quarantine': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Search className="h-6 w-6 mr-2" />
            Product Barcode Lookup
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Manual Barcode Input */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Barcode Manually
              </label>
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter barcode number..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleManualLookup()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleManualLookup}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Lookup'}
              </button>
            </div>
          </div>

          {/* Barcode Scanner */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Or Scan Barcode</h3>
            <BarcodeScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              isScanning={isScanning}
              setIsScanning={setIsScanning}
            />
          </div>
        </div>
      </div>

      {/* Scanned Barcode Display */}
      {scannedBarcode && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Scanned Barcode</h3>
          </div>
          <div className="p-6">
            <div className="flex justify-center">
              <BarcodeDisplay value={scannedBarcode} />
            </div>
          </div>
        </div>
      )}

      {/* Product Information */}
      {productData && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Product Information
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Product Details</h4>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Code:</span> {productData.product_code}</p>
                  <p><span className="font-medium">Name:</span> {productData.name}</p>
                  <p><span className="font-medium">Category:</span> {productData.category}</p>
                  <p><span className="font-medium">Type:</span> {productData.product_type}</p>
                  <p><span className="font-medium">Brand:</span> {productData.brand || 'N/A'}</p>
                  <p><span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(productData.status)}`}>
                      {productData.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pricing & Stock</h4>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Cost Price:</span> ₹{productData.cost_price}</p>
                  <p><span className="font-medium">Selling Price:</span> ₹{productData.selling_price}</p>
                  <p><span className="font-medium">Unit:</span> {productData.unit_of_measurement}</p>
                  <p><span className="font-medium">Min Stock:</span> {productData.minimum_stock_level}</p>
                  <p><span className="font-medium">Max Stock:</span> {productData.maximum_stock_level}</p>
                </div>
              </div>
            </div>

            {/* Inventory Summary */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Inventory Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{productData.inventory_summary.total_stock}</div>
                  <div className="text-sm text-blue-600">Total Stock</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{productData.inventory_summary.total_available}</div>
                  <div className="text-sm text-green-600">Available Stock</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{productData.inventory_summary.total_reserved}</div>
                  <div className="text-sm text-yellow-600">Reserved Stock</div>
                </div>
              </div>

              {/* Location Details */}
              {productData.inventory_summary.locations.length > 0 && (
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-3">Stock by Location</h5>
                  <div className="space-y-3">
                    {productData.inventory_summary.locations.map((location, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="font-medium">Location:</span> {location.location}
                          </div>
                          <div>
                            <span className="font-medium">Stock:</span> {location.current_stock}
                            {location.available_stock !== location.current_stock && (
                              <span className="text-gray-500"> ({location.available_stock} available)</span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">Quality:</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getQualityColor(location.quality_status)}`}>
                              {location.quality_status}
                            </span>
                          </div>
                        </div>
                        {location.last_movement && (
                          <div className="mt-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 inline mr-1" />
                            Last movement: {new Date(location.last_movement).toLocaleDateString()}
                            {location.movement_type && ` (${location.movement_type})`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!productData && scannedBarcode && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">No product found with barcode: {scannedBarcode}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductBarcodeLookup;