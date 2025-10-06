import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, ChevronLeft, Plus, Trash2, Save, Upload, FileText, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';

const CreateGRNPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const poId = searchParams.get('po_id');

  const [loading, setLoading] = useState(false);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [formData, setFormData] = useState({
    received_date: new Date().toISOString().split('T')[0],
    inward_challan_number: '',
    supplier_invoice_number: '',
    remarks: '',
    items_received: []
  });

  useEffect(() => {
    if (poId) {
      fetchPurchaseOrder();
    }
  }, [poId]);

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/procurement/pos/${poId}`);
      const po = response.data;
      setPurchaseOrder(po);

      // Initialize items with PO data
      const items = (po.items || []).map((item, index) => ({
        item_index: index,
        material_name: item.type === 'fabric' ? item.fabric_name : item.item_name,
        color: item.color || '',
        gsm: item.gsm || '',
        uom: item.uom || 'Meters',
        ordered_qty: parseFloat(item.quantity) || 0,
        invoiced_qty: parseFloat(item.quantity) || 0, // Default to ordered qty - user will update from vendor invoice
        received_qty: parseFloat(item.quantity) || 0, // Default to ordered qty - user will update after physical count
        weight: '',
        remarks: ''
      }));

      setFormData(prev => ({ ...prev, items_received: items }));
    } catch (error) {
      console.error('Error fetching PO:', error);
      alert('Failed to fetch Purchase Order details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items_received];
    updatedItems[index][field] = value;
    setFormData(prev => ({ ...prev, items_received: updatedItems }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.items_received.some(item => parseFloat(item.received_qty) > 0)) {
        alert('Please enter received quantities for at least one item');
        return;
      }

      setLoading(true);

      const payload = {
        received_date: formData.received_date,
        inward_challan_number: formData.inward_challan_number,
        supplier_invoice_number: formData.supplier_invoice_number,
        items_received: formData.items_received.filter(item => parseFloat(item.received_qty) > 0),
        remarks: formData.remarks
      };

      const response = await api.post(`/grn/from-po/${poId}`, payload);
      
      const message = response.data.has_shortages 
        ? `GRN created with ${response.data.shortage_count} shortage(s). Vendor return request auto-generated.`
        : 'GRN created successfully!';
      
      alert(message + ' Redirecting to verification...');
      navigate(`/inventory/grn/${response.data.grn.id}/verify`);
    } catch (error) {
      console.error('Error creating GRN:', error);
      alert(error.response?.data?.message || 'Failed to create GRN');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const summary = formData.items_received.reduce((acc, item) => {
    const orderedQty = parseFloat(item.ordered_qty);
    const invoicedQty = parseFloat(item.invoiced_qty);
    const receivedQty = parseFloat(item.received_qty);
    
    if (receivedQty < Math.min(orderedQty, invoicedQty)) acc.shortages++;
    if (receivedQty > Math.max(orderedQty, invoicedQty)) acc.overages++;
    if (invoicedQty !== orderedQty) acc.invoiceMismatches++;
    if (receivedQty === orderedQty && receivedQty === invoicedQty) acc.perfectMatches++;
    
    return acc;
  }, { shortages: 0, overages: 0, invoiceMismatches: 0, perfectMatches: 0 });

  if (!poId) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Purchase Order Selected</h2>
            <p className="text-yellow-700 mb-4">Please select a purchase order to create GRN.</p>
            <button
              onClick={() => navigate('/procurement/purchase-orders')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              Go to Purchase Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !purchaseOrder) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Purchase Order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Create Goods Receipt Note
              </h1>
              <p className="text-gray-600 mt-1">
                Record materials received from vendor with 3-way matching
              </p>
            </div>
          </div>
        </div>

        {/* Alert if shortages detected */}
        {summary.shortages > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Shortage Detected!</h3>
              <p className="text-red-700 text-sm">
                {summary.shortages} item(s) have quantity shortages. A vendor return request will be automatically created.
              </p>
            </div>
          </div>
        )}

        {/* PO Info Card */}
        {purchaseOrder && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Purchase Order Details
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">PO Number</label>
                <p className="text-gray-900 font-semibold">{purchaseOrder.po_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vendor</label>
                <p className="text-gray-900">{purchaseOrder.vendor?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">PO Date</label>
                <p className="text-gray-900">{new Date(purchaseOrder.po_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Customer/Project</label>
                <p className="text-gray-900">{purchaseOrder.customer?.name || purchaseOrder.project_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Items</label>
                <p className="text-gray-900">{purchaseOrder.items?.length || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">PO Amount</label>
                <p className="text-gray-900 font-semibold">₹{parseFloat(purchaseOrder.final_amount || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}

        {/* GRN Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Receipt Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Received Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.received_date}
                onChange={(e) => handleInputChange('received_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Challan Number
              </label>
              <input
                type="text"
                value={formData.inward_challan_number}
                onChange={(e) => handleInputChange('inward_challan_number', e.target.value)}
                placeholder="DC-12345"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.supplier_invoice_number}
                onChange={(e) => handleInputChange('supplier_invoice_number', e.target.value)}
                placeholder="INV-12345"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="Optional notes"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold">3-Way Matching: PO vs Invoice vs Actual Receipt</h2>
            <p className="text-sm text-gray-600 mt-1">
              Compare ordered, invoiced, and received quantities to detect discrepancies
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specs</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-blue-100">
                    <div className="flex flex-col">
                      <span>Ordered</span>
                      <span className="text-xs text-gray-400 font-normal">(PO)</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-orange-100">
                    <div className="flex flex-col">
                      <span>Invoiced*</span>
                      <span className="text-xs text-gray-400 font-normal">(Invoice)</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-green-100">
                    <div className="flex flex-col">
                      <span>Received*</span>
                      <span className="text-xs text-gray-400 font-normal">(Actual)</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.items_received.map((item, index) => {
                  const orderedQty = parseFloat(item.ordered_qty);
                  const invoicedQty = parseFloat(item.invoiced_qty);
                  const receivedQty = parseFloat(item.received_qty);
                  
                  const hasShortage = receivedQty < Math.min(orderedQty, invoicedQty);
                  const hasOverage = receivedQty > Math.max(orderedQty, invoicedQty);
                  const invoiceVsOrderMismatch = invoicedQty !== orderedQty;
                  const perfectMatch = receivedQty === orderedQty && receivedQty === invoicedQty;
                  
                  return (
                    <tr key={index} className={`hover:bg-gray-50 ${hasShortage ? 'bg-red-50' : hasOverage ? 'bg-yellow-50' : ''}`}>
                      <td className="px-3 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 font-medium">
                        {item.material_name}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {item.color && <span className="text-gray-700">{item.color}</span>}
                        {item.gsm && <span className="text-gray-500 ml-1">({item.gsm} GSM)</span>}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">{item.uom}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 font-medium bg-blue-50">{item.ordered_qty}</td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={item.invoiced_qty}
                          onChange={(e) => handleItemChange(index, 'invoiced_qty', e.target.value)}
                          className={`w-28 border rounded px-2 py-1 text-sm ${
                            invoiceVsOrderMismatch ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                          }`}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={item.received_qty}
                          onChange={(e) => handleItemChange(index, 'received_qty', e.target.value)}
                          className={`w-28 border rounded px-2 py-1 text-sm ${
                            hasShortage ? 'border-red-500 bg-red-100 font-semibold' : 
                            hasOverage ? 'border-yellow-500 bg-yellow-100' : 
                            'border-gray-300'
                          }`}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={item.weight}
                          onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                          placeholder="Optional"
                          className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                          placeholder="Notes"
                          className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-3">
                        {hasShortage ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            ⚠️ SHORT: {(Math.min(orderedQty, invoicedQty) - receivedQty).toFixed(2)}
                          </span>
                        ) : hasOverage ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            ⚠️ OVER: {(receivedQty - Math.max(orderedQty, invoicedQty)).toFixed(2)}
                          </span>
                        ) : invoiceVsOrderMismatch ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            ⚠️ Invoice≠PO
                          </span>
                        ) : perfectMatch ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            ✓ Perfect Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="font-semibold mb-4">Discrepancy Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">Perfect Matches</div>
              <div className="text-2xl font-bold text-green-700">{summary.perfectMatches}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-600 mb-1">Shortages</div>
              <div className="text-2xl font-bold text-red-700">{summary.shortages}</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-yellow-600 mb-1">Overages</div>
              <div className="text-2xl font-bold text-yellow-700">{summary.overages}</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm text-orange-600 mb-1">Invoice Mismatches</div>
              <div className="text-2xl font-bold text-orange-700">{summary.invoiceMismatches}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Creating GRN...' : 'Create GRN & Proceed to Verification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGRNPage;