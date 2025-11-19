import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, ChevronLeft, Plus, Trash2, Save, Upload, FileText, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreateGRNPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Support both 'po_id' and 'from_po' parameter names
  const poId = searchParams.get('po_id') || searchParams.get('from_po');

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
      const response = await api.get(`/grn/create/${poId}`);
      const po = response.data;
      
      console.log('=== GRN FORM DEBUG ===');
      console.log('Full PO Response:', po);
      console.log('PO Items:', po.items);
      console.log('Items Array?:', Array.isArray(po.items));
      console.log('Items Length:', po.items?.length);
      if (po.items?.length > 0) {
        console.log('First Item Structure:', po.items[0]);
      }
      console.log('=== END DEBUG ===');
      
      setPurchaseOrder(po);

      // Initialize items with data from /grn/create/:poId endpoint
      // This endpoint already handles hierarchy and returns only shortage items for 2nd+ GRNs
      const items = (po.items || []).map((item, index) => {
        console.log(`Mapping item ${index}:`, item);
        
        return {
          item_index: index,
          material_name: item.product_name || item.material_name || item.item_name || '',
          color: item.color || '',
          gsm: item.gsm || '',
          uom: item.unit || item.uom || 'Meters',
          ordered_qty: parseFloat(item.ordered_qty || item.quantity || 0),
          invoiced_qty: parseFloat(item.ordered_qty || item.quantity || 0),
          received_qty: parseFloat(item.ordered_qty || item.quantity || 0),
          weight: '',
          remarks: item.remarks || ''
        };
      });

      console.log('Mapped items for form:', items);
      
      // Pre-fill challan number from PO if available
      const challanNumber = po.challan?.challan_number || '';
      setFormData(prev => ({ 
        ...prev, 
        items_received: items,
        inward_challan_number: challanNumber
      }));
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
      
      // Build detailed feedback message
      let message = response.data.message;
      let detailedInfo = [];
      
      if (response.data.all_items_verified) {
        message = "✅ GRN CREATED & AUTO-VERIFIED! All items match perfectly.";
        detailedInfo.push("Perfect Match: " + response.data.perfect_match_count + " item(s)");
      } else {
        detailedInfo = [];
        if (response.data.perfect_match_count > 0) {
          detailedInfo.push("✓ Perfect Matches: " + response.data.perfect_match_count + " item(s)");
        }
        if (response.data.has_shortages) {
          detailedInfo.push("⚠️ Shortages: " + response.data.shortage_count + " item(s)");
        }
        if (response.data.has_overages) {
          detailedInfo.push("📦 Overages: " + response.data.overage_count + " item(s)");
        }
        if (response.data.has_invoice_mismatches) {
          detailedInfo.push("🔍 Invoice Mismatches: " + response.data.invoice_mismatch_count + " item(s)");
        }
      }
      
      const detailsMsg = detailedInfo.length > 0 ? "\n\nSummary:\n" + detailedInfo.join("\n") : "";
      toast.success(message);
      if (detailsMsg) {
        toast(detailsMsg, { duration: 4000 });
      }
      
      // Redirect based on result
      const nextPage = response.data.all_items_verified 
        ? `/inventory/grn/${response.data.grn.id}/add-to-inventory`
        : `/inventory/grn/${response.data.grn.id}/verify`;
      
      setTimeout(() => {
        navigate(nextPage);
      }, 1500);
    } catch (error) {
      console.error('Error creating GRN:', error);
      toast.error(error.response?.data?.message || 'Failed to create GRN');
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
          <div className="bg-yellow-50 border border-yellow-200 rounded p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Purchase Order Selected</h2>
            <p className="text-yellow-700 mb-4">Please select a purchase order to create GRN.</p>
            <button
              onClick={() => navigate('/procurement/purchase-orders')}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create GRN</h1>
              <p className="text-gray-600 text-sm">3-way matching verification</p>
            </div>
          </div>
        </div>

        {/* GRN Hierarchy Alert */}
        {purchaseOrder?.hierarchy && (
          <div className={`border-l-4 rounded p-4 mb-4 flex items-start gap-3 ${
            purchaseOrder.hierarchy.is_first_grn 
              ? 'bg-blue-50 border-blue-500' 
              : 'bg-purple-50 border-purple-500'
          }`}>
            <Package className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              purchaseOrder.hierarchy.is_first_grn 
                ? 'text-blue-600' 
                : 'text-purple-600'
            }`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold text-sm ${
                  purchaseOrder.hierarchy.is_first_grn 
                    ? 'text-blue-900' 
                    : 'text-purple-900'
                }`}>
                  {purchaseOrder.hierarchy.is_first_grn ? '📦 Original Receipt' : '🔄 Shortage Fulfillment Receipt'}
                </h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  purchaseOrder.hierarchy.is_first_grn 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-purple-200 text-purple-800'
                }`}>
                  {purchaseOrder.hierarchy.grn_status_badge}
                </span>
              </div>
              
              <p className={`text-xs mt-1 ${
                purchaseOrder.hierarchy.is_first_grn 
                  ? 'text-blue-700' 
                  : 'text-purple-700'
              }`}>
                {purchaseOrder.hierarchy.is_first_grn 
                  ? `This is the first GRN for PO ${purchaseOrder.po_number}. All original items are shown below.`
                  : `This is a shortage fulfillment GRN. Only shortage items are shown below (${formData.items_received.length} item${formData.items_received.length !== 1 ? 's' : ''}).`
                }
              </p>
              
              {!purchaseOrder.hierarchy.is_first_grn && purchaseOrder.hierarchy.existing_grns && purchaseOrder.hierarchy.existing_grns.length > 0 && (
                <div className="mt-2 bg-purple-100 rounded p-2">
                  <p className="text-xs font-medium text-purple-800">Previous GRNs for this PO:</p>
                  <ul className="text-xs text-purple-700 mt-1">
                    {purchaseOrder.hierarchy.existing_grns.map((grn, idx) => (
                      <li key={idx}>• GRN: <strong>{grn.grn_number}</strong> (Created: {new Date(grn.created_at).toLocaleDateString()})</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {purchaseOrder?.is_shortage_fulfillment && (
                <p className={`text-xs mt-2 font-medium bg-opacity-100 inline-block px-2 py-1 rounded ${
                  purchaseOrder.hierarchy.is_first_grn 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-purple-200 text-purple-800'
                }`}>
                  Vendor Request: <strong>{purchaseOrder.vendor_request_number}</strong>
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Shortage Fulfillment Alert - Legacy */}
        {purchaseOrder?.is_shortage_fulfillment && !purchaseOrder?.hierarchy && (
          <div className="bg-purple-50 border-l-4 border-purple-500 rounded p-4 mb-4 flex items-start gap-3">
            <Package className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 text-sm">🔄 Shortage Fulfillment GRN</h3>
              <p className="text-purple-700 text-xs mt-1">
                This GRN is for shortage materials from vendor request <strong>{purchaseOrder.vendor_request_number}</strong>.
              </p>
              {purchaseOrder.original_grn_number && (
                <p className="text-purple-700 text-xs mt-1">
                  📋 Reference: Original GRN <strong>{purchaseOrder.original_grn_number}</strong> (ID: #{purchaseOrder.original_grn_id})
                </p>
              )}
              <p className="text-purple-600 text-xs mt-2 font-medium bg-purple-100 inline-block px-2 py-1 rounded">
                ✓ Only shortage items are shown below ({formData.items_received.length} item{formData.items_received.length !== 1 ? 's' : ''})
              </p>
            </div>
          </div>
        )}

        {/* Alert if shortages detected */}
        {!purchaseOrder?.is_shortage_fulfillment && summary.shortages > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded p-3 mb-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 text-sm">Shortage Detected!</h3>
              <p className="text-red-700 text-xs mt-1">
                {summary.shortages} item(s) have shortages. Vendor return will be auto-created.
              </p>
            </div>
          </div>
        )}

        {/* PO Info Card */}
        {purchaseOrder && (
          <div className="bg-white rounded-lg shadow border p-4 mb-4">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">Purchase Order Details</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded p-3 border border-blue-200">
                <label className="text-xs font-medium text-blue-700 block mb-1">PO Number</label>
                <p className="text-gray-900 font-bold font-mono text-sm">{purchaseOrder.po_number}</p>
              </div>
              <div className="bg-purple-50 rounded p-3 border border-purple-200">
                <label className="text-xs font-medium text-purple-700 block mb-1">Vendor</label>
                <p className="text-gray-900 font-semibold text-sm">{purchaseOrder.vendor?.name || 'N/A'}</p>
              </div>
              <div className="bg-green-50 rounded p-3 border border-green-200">
                <label className="text-xs font-medium text-green-700 block mb-1">PO Date</label>
                <p className="text-gray-900 font-semibold text-sm">{new Date(purchaseOrder.po_date).toLocaleDateString()}</p>
              </div>
              <div className="bg-orange-50 rounded p-3 border border-orange-200">
                <label className="text-xs font-medium text-orange-700 block mb-1">Project</label>
                <p className="text-gray-900 font-semibold text-sm">{purchaseOrder.customer?.name || purchaseOrder.project_name || 'N/A'}</p>
              </div>
              <div className="bg-indigo-50 rounded p-3 border border-indigo-200">
                <label className="text-xs font-medium text-indigo-700 block mb-1">Items</label>
                <p className="text-gray-900 font-bold text-lg">{purchaseOrder.items?.length || 0}</p>
              </div>
              <div className="bg-emerald-50 rounded p-3 border border-emerald-200">
                <label className="text-xs font-medium text-emerald-700 block mb-1">Amount</label>
                <p className="text-gray-900 font-bold text-lg">₹{parseFloat(purchaseOrder.total_amount || 0).toLocaleString('en-IN')}</p>
              </div>
              {purchaseOrder.challan && (
                <div className="bg-cyan-50 rounded p-3 border border-cyan-200">
                  <label className="text-xs font-medium text-cyan-700 block mb-1">Challan Number</label>
                  <p className="text-gray-900 font-mono font-bold text-sm">{purchaseOrder.challan.challan_number}</p>
                  <p className="text-xs text-cyan-600 mt-1">Status: <span className="font-semibold capitalize">{purchaseOrder.challan.status}</span></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GRN Form */}
        <div className="bg-white rounded-lg shadow border p-4 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">Receipt Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Received Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.received_date}
                onChange={(e) => handleInputChange('received_date', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Vendor Challan Number
              </label>
              <input
                type="text"
                value={formData.inward_challan_number}
                onChange={(e) => handleInputChange('inward_challan_number', e.target.value)}
                placeholder="DC-12345"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Supplier Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.supplier_invoice_number}
                onChange={(e) => handleInputChange('supplier_invoice_number', e.target.value)}
                placeholder="INV-12345"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="Optional notes"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow border overflow-hidden mb-4">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="text-base font-bold text-gray-900">3-Way Matching</h2>
            <p className="text-xs text-gray-600 mt-1">
              Compare PO, Invoice & Received quantities
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Material</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Specs</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">UOM</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase bg-blue-50">
                    Ordered
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase bg-orange-50">
                    Invoiced*
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase bg-green-50">
                    Received*
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Weight</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Remarks</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
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
                      <td className="px-3 py-2 text-xs text-gray-900">{index + 1}</td>
                      <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                        {item.material_name}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {item.color && <span>{item.color}</span>}
                        {item.gsm && <span className="text-gray-500 ml-1">({item.gsm})</span>}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">{item.uom}</td>
                      <td className="px-3 py-2 text-xs text-gray-900 font-semibold bg-blue-50">{item.ordered_qty}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.invoiced_qty}
                          onChange={(e) => handleItemChange(index, 'invoiced_qty', e.target.value)}
                          className={`w-20 border rounded px-2 py-1 text-xs ${
                            invoiceVsOrderMismatch ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                          }`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.received_qty}
                          onChange={(e) => handleItemChange(index, 'received_qty', e.target.value)}
                          className={`w-20 border rounded px-2 py-1 text-xs font-semibold ${
                            hasShortage ? 'border-red-500 bg-red-100' : 
                            hasOverage ? 'border-yellow-500 bg-yellow-100' : 
                            'border-gray-300'
                          }`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.weight}
                          onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                          placeholder="Optional"
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                          placeholder="Notes"
                          className="w-24 border border-gray-300 rounded px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        {hasShortage ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                            SHORT: {(Math.min(orderedQty, invoicedQty) - receivedQty).toFixed(2)}
                          </span>
                        ) : hasOverage ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                            OVER: {(receivedQty - Math.max(orderedQty, invoicedQty)).toFixed(2)}
                          </span>
                        ) : invoiceVsOrderMismatch ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            Invoice≠PO
                          </span>
                        ) : perfectMatch ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                            ✓ Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
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
        <div className="bg-white rounded-lg shadow border p-4 mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">Summary</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="text-xs font-medium text-green-700 mb-1">Perfect</div>
              <div className="text-2xl font-bold text-green-800">{summary.perfectMatches}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="text-xs font-medium text-red-700 mb-1">Shortages</div>
              <div className="text-2xl font-bold text-red-800">{summary.shortages}</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="text-xs font-medium text-yellow-700 mb-1">Overages</div>
              <div className="text-2xl font-bold text-yellow-800">{summary.overages}</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <div className="text-xs font-medium text-orange-700 mb-1">Mismatches</div>
              <div className="text-2xl font-bold text-orange-800">{summary.invoiceMismatches}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create GRN & Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGRNPage;