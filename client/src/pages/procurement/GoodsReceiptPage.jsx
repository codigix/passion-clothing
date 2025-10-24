import React, { useState, useEffect } from 'react';
import { CheckCircle, Truck, ClipboardList, Search, Download } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const GoodsReceiptPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [receiptData, setReceiptData] = useState({
    received_date: new Date().toISOString().split('T')[0],
    received_quantity: '',
    quality_status: 'approved',
    notes: '',
    items: []
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await api.get('/procurement/pos?status=sent&limit=50');
      setPurchaseOrders(response.data.purchaseOrders || []);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePOSelect = (po) => {
    setSelectedPO(po);
    setReceiptData({
      ...receiptData,
      received_quantity: po.total_quantity || '',
      items: po.items?.map(item => ({
        ...item,
        received_quantity: 0,
        quality_status: 'approved'
      })) || []
    });
  };

  const handleReceiptSubmit = async () => {
    if (!selectedPO) {
      toast.error('Please select a purchase order');
      return;
    }

    if (!receiptData.received_date) {
      toast.error('Please select received date');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        po_id: selectedPO.id,
        ...receiptData,
        received_quantity: parseFloat(receiptData.received_quantity) || 0
      };

      await api.post('/procurement/goods-receipt', payload);

      // Update PO status
      await api.patch(`/procurement/pos/${selectedPO.id}/status`, {
        status: 'received'
      });

      toast.success('Goods receipt recorded successfully');
      setSelectedPO(null);
      setReceiptData({
        received_date: new Date().toISOString().split('T')[0],
        received_quantity: '',
        quality_status: 'approved',
        notes: '',
        items: []
      });
      fetchPurchaseOrders();
    } catch (error) {
      console.error('Error recording goods receipt:', error);
      toast.error('Failed to record goods receipt');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      partial_received: 'bg-yellow-100 text-yellow-800',
      received: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goods Receipt</h1>
          <p className="text-gray-600 mt-1">Record material receipts from vendors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Purchase Orders List */}
        <div className="bg-white rounded shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-1.5">
              <ClipboardList size={16} />
              Purchase Orders Ready for Receipt
            </h2>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {purchaseOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No purchase orders ready for receipt</p>
              </div>
            ) : (
              <div className="space-y-3">
                {purchaseOrders.map((po) => (
                  <div
                    key={po.id}
                    onClick={() => handlePOSelect(po)}
                    className={`p-4 border rounded cursor-pointer transition-colors ${
                      selectedPO?.id === po.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{po.po_number}</h3>
                        <p className="text-sm text-gray-600">{po.vendor?.name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(po.status)}`}>
                        {po.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Expected: {new Date(po.expected_delivery_date).toLocaleDateString()}</p>
                      <p>Qty: {po.total_quantity} | Amount: ₹{po.final_amount?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Receipt Form */}
        <div className="bg-white rounded shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-1.5">
              <Truck size={16} />
              Record Goods Receipt
            </h2>
          </div>
          <div className="p-4">
            {selectedPO ? (
              <div className="space-y-4">
                {/* PO Details */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-2">PO Details</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">PO:</span> {selectedPO.po_number}</p>
                    <p><span className="font-medium">Vendor:</span> {selectedPO.vendor?.name}</p>
                    <p><span className="font-medium">Expected Qty:</span> {selectedPO.total_quantity}</p>
                  </div>
                </div>

                {/* Receipt Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Received Date *
                    </label>
                    <input
                      type="date"
                      value={receiptData.received_date}
                      onChange={(e) => setReceiptData({...receiptData, received_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Received Quantity *
                    </label>
                    <input
                      type="number"
                      value={receiptData.received_quantity}
                      onChange={(e) => setReceiptData({...receiptData, received_quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                      placeholder="Enter received quantity"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality Status
                    </label>
                    <select
                      value={receiptData.quality_status}
                      onChange={(e) => setReceiptData({...receiptData, quality_status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                    >
                      <option value="approved">Approved</option>
                      <option value="pending_qc">Pending Quality Check</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={receiptData.notes}
                      onChange={(e) => setReceiptData({...receiptData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                      placeholder="Additional notes about the receipt..."
                    />
                  </div>

                  <button
                    onClick={handleReceiptSubmit}
                    disabled={submitting}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={14} />
                    {submitting ? 'Recording...' : 'Record Goods Receipt'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a Purchase Order</p>
                <p className="text-sm">Choose a purchase order from the list to record goods receipt</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsReceiptPage;