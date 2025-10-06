import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaQrcode, FaBarcode, FaBoxOpen, FaMinus, FaPlus, 
  FaWarehouse, FaTruck, FaChartLine, FaPrint, FaDownload 
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import QRCodeDisplay from '../../components/QRCodeDisplay';

const POInventoryTrackingPage = () => {
  const { poId } = useParams();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [poDetails, setPODetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [consumeQuantity, setConsumeQuantity] = useState('');
  const [consumeNotes, setConsumeNotes] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRItem, setSelectedQRItem] = useState(null);

  useEffect(() => {
    fetchInventoryData();
  }, [poId]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/inventory/from-po/${poId}`);
      setInventory(response.data.inventory || []);
      setSummary(response.data.summary || {});
      
      // Get PO details
      if (response.data.inventory.length > 0) {
        setPODetails(response.data.inventory[0].purchaseOrder);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleConsumeStock = async () => {
    if (!selectedItem || !consumeQuantity) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      await api.post(`/inventory/item/${selectedItem.id}/consume`, {
        quantity: parseFloat(consumeQuantity),
        notes: consumeNotes,
        purchase_order_id: poId
      });

      toast.success('Stock consumed successfully');
      setShowConsumeModal(false);
      setConsumeQuantity('');
      setConsumeNotes('');
      setSelectedItem(null);
      fetchInventoryData(); // Refresh
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to consume stock');
    }
  };

  const getUsagePercentage = (item) => {
    const initial = parseFloat(item.initial_quantity) || 0;
    const consumed = parseFloat(item.consumed_quantity) || 0;
    return initial > 0 ? ((consumed / initial) * 100).toFixed(1) : 0;
  };

  const getUsageColor = (percentage) => {
    if (percentage < 30) return 'bg-green-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading inventory data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/procurement/purchase-orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft /> Back to Purchase Orders
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Order Inventory Tracking</h1>
            {poDetails && (
              <p className="text-sm text-gray-600 mt-1">
                PO: {poDetails.po_number} | Vendor: {poDetails.vendor?.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_items}</p>
              </div>
              <FaBoxOpen className="text-3xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Initial Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_initial_quantity?.toFixed(2)}</p>
              </div>
              <FaWarehouse className="text-3xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_current_quantity?.toFixed(2)}</p>
              </div>
              <FaChartLine className="text-3xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consumed</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_consumed?.toFixed(2)}</p>
              </div>
              <FaMinus className="text-3xl text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Inventory Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Inventory Items with Barcode Tracking</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Initial Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => {
                const usagePercentage = getUsagePercentage(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaBarcode className="text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.barcode}</div>
                          <div className="text-xs text-gray-500">{item.batch_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.product?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{item.product?.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FaWarehouse className="text-xs" />
                        {item.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(item.initial_quantity || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {parseFloat(item.consumed_quantity || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {parseFloat(item.current_stock || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getUsageColor(usagePercentage)}`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{usagePercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedQRItem(item);
                            setShowQRModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="View QR Code"
                        >
                          <FaQrcode />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowConsumeModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-800"
                          title="Consume Stock"
                          disabled={parseFloat(item.current_stock) <= 0}
                        >
                          <FaMinus />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {inventory.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No inventory items found for this purchase order
            </div>
          )}
        </div>
      </div>

      {/* Consume Stock Modal */}
      {showConsumeModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-red-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaMinus className="text-orange-600" />
                Consume Stock
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedItem.product?.name || selectedItem.barcode}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Available Stock:</p>
                <p className="text-2xl font-bold text-green-600">
                  {parseFloat(selectedItem.current_stock).toFixed(2)} {selectedItem.product?.unit_of_measurement}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Consume
                </label>
                <input
                  type="number"
                  value={consumeQuantity}
                  onChange={(e) => setConsumeQuantity(e.target.value)}
                  max={selectedItem.current_stock}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={consumeNotes}
                  onChange={(e) => setConsumeNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Reason for consumption..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowConsumeModal(false);
                    setSelectedItem(null);
                    setConsumeQuantity('');
                    setConsumeNotes('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConsumeStock}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
                >
                  Confirm Consumption
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedQRItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Item QR Code</h2>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <QRCodeDisplay
                  data={selectedQRItem.qr_code || JSON.stringify({
                    barcode: selectedQRItem.barcode,
                    product: selectedQRItem.product?.name,
                    location: selectedQRItem.location,
                    batch: selectedQRItem.batch_number
                  })}
                  size={250}
                />
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><strong>Barcode:</strong> {selectedQRItem.barcode}</div>
                <div><strong>Batch:</strong> {selectedQRItem.batch_number}</div>
                <div><strong>Location:</strong> {selectedQRItem.location}</div>
                <div><strong>Stock:</strong> {parseFloat(selectedQRItem.current_stock).toFixed(2)}</div>
              </div>

              <button
                onClick={() => setShowQRModal(false)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POInventoryTrackingPage;