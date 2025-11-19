import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, CheckCircle, ChevronLeft, MapPin, AlertTriangle, Plus } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AddGRNToInventoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [grn, setGrn] = useState(null);
  const [location, setLocation] = useState('Main Warehouse');
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [mismatchForm, setMismatchForm] = useState({
    mismatched_items: [],
    requested_action: 'accept_shortage',
    requested_action_notes: '',
    request_description: ''
  });
  const [mismatchSubmitting, setMismatchSubmitting] = useState(false);

  useEffect(() => {
    fetchGRN();
  }, [id]);

  const fetchGRN = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/grn/${id}`);
      setGrn(response.data);
    } catch (error) {
      console.error('Error fetching GRN:', error);
      alert('Failed to fetch GRN details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!location.trim()) {
        alert('Please select a warehouse location');
        return;
      }

      if (!window.confirm('Are you sure you want to add these items to inventory? This action cannot be undone.')) {
        return;
      }

      setSubmitting(true);

      const response = await api.post(`/grn/${id}/add-to-inventory`, { location });

      alert(`Success! ${response.data.inventory_items.length} items added to inventory.`);
      navigate('/inventory/stock');
    } catch (error) {
      console.error('Error adding to inventory:', error);
      alert(error.response?.data?.message || 'Failed to add items to inventory');
    } finally {
      setSubmitting(false);
    }
  };

  const checkForMismatches = () => {
    if (!grn || !grn.items_received) return { hasShortages: false, hasOverages: false, items: [] };
    
    const mismatchedItems = [];
    grn.items_received.forEach((item) => {
      if ((item.shortage_quantity && item.shortage_quantity > 0) || (item.overage_quantity && item.overage_quantity > 0)) {
        mismatchedItems.push(item);
      }
    });

    return {
      hasShortages: mismatchedItems.some(item => item.shortage_quantity > 0),
      hasOverages: mismatchedItems.some(item => item.overage_quantity > 0),
      items: mismatchedItems
    };
  };

  const handleCreateMismatchRequest = () => {
    const { items } = checkForMismatches();
    const processedItems = items.map(item => ({
      item_name: item.material_name,
      color: item.color || '',
      gsm: item.gsm || '',
      uom: item.uom || '',
      po_quantity: item.ordered_quantity || item.po_quantity || 0,
      received_quantity: item.received_quantity || 0,
      invoiced_quantity: item.invoiced_qty || item.invoiced_quantity || 0,
      shortage_quantity: item.shortage_quantity || 0,
      overage_quantity: item.overage_quantity || 0,
      rate: item.rate || 0,
      notes: item.remarks || ''
    }));

    setMismatchForm({
      mismatched_items: processedItems,
      requested_action: 'accept_shortage',
      requested_action_notes: '',
      request_description: ''
    });
    setShowMismatchModal(true);
  };

  const handleMismatchSubmit = async () => {
    try {
      if (!mismatchForm.mismatched_items || mismatchForm.mismatched_items.length === 0) {
        toast.error('No mismatched items selected');
        return;
      }

      if (!mismatchForm.requested_action) {
        toast.error('Please select a requested action');
        return;
      }

      setMismatchSubmitting(true);

      const payload = {
        mismatch_items: mismatchForm.mismatched_items,
        requested_action: mismatchForm.requested_action,
        requested_action_notes: mismatchForm.requested_action_notes,
        request_description: mismatchForm.request_description
      };

      const response = await api.post(`/grn/${id}/create-mismatch-request`, payload);

      toast.success(`Mismatch request created: ${response.data.request_number}`);
      setShowMismatchModal(false);
      
      setTimeout(() => {
        fetchGRN();
      }, 1000);
    } catch (error) {
      console.error('Error creating mismatch request:', error);
      toast.error(error.response?.data?.message || 'Failed to create mismatch request');
    } finally {
      setMismatchSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading GRN...</p>
        </div>
      </div>
    );
  }

  if (!grn) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">GRN Not Found</h2>
            <p className="text-red-700">The requested GRN could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!['verified', 'approved'].includes(grn.verification_status)) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">GRN Not Ready</h2>
            <p className="text-yellow-700 mb-4">
              This GRN has not been verified yet. Current status: <strong>{grn.verification_status}</strong>
            </p>
            <button
              onClick={() => navigate(`/inventory/grn/${id}/verify`)}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Go to Verification
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (grn.inventory_added) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded p-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">Already Added to Inventory</h2>
            <p className="text-green-700 mb-4">
              This GRN has already been added to inventory on {new Date(grn.inventory_added_date).toLocaleString()}.
            </p>
            <button
              onClick={() => navigate('/inventory/stock')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              View Inventory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/inventory/grn')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to GRN List
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-green-600" />
              Add GRN to Inventory
            </h1>
            <p className="text-gray-600 mt-1">
              Final step: Add verified materials to inventory system
            </p>
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded p-6 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-green-900 mb-1">GRN Verified Successfully!</h2>
              <p className="text-sm text-green-800">
                All quality checks passed. Ready to add {grn.items_received?.length || 0} items to inventory.
              </p>
              {grn.verification_status === 'approved' && grn.discrepancy_details && (
                <div className="mt-2 text-sm text-green-800">
                  <strong>Note:</strong> Discrepancies were reported and approved by manager.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GRN Info */}
        <div className="bg-white rounded shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">GRN Information</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">GRN Number</label>
              <p className="text-gray-900 font-semibold">{grn.grn_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">PO Number</label>
              <p className="text-gray-900">{grn.purchaseOrder?.po_number || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Vendor</label>
              <p className="text-gray-900">{grn.supplier_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Received Date</label>
              <p className="text-gray-900">{new Date(grn.received_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Mismatch Alert */}
        {(() => {
          const { hasShortages, hasOverages, items } = checkForMismatches();
          return (hasShortages || hasOverages) && (
            <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-2">Material Mismatches Detected</h3>
                  <p className="text-sm text-amber-800 mb-3">
                    {hasShortages && hasOverages ? (
                      `${items.filter(i => i.shortage_quantity > 0).length} shortage(s) and ${items.filter(i => i.overage_quantity > 0).length} overage(s) detected in received materials.`
                    ) : hasShortages ? (
                      `${items.length} item(s) with shortages detected. Expected quantity was not fully received.`
                    ) : (
                      `${items.length} item(s) with overages detected. More quantity was received than ordered.`
                    )}
                  </p>
                  <button
                    onClick={handleCreateMismatchRequest}
                    className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded text-sm hover:bg-amber-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Mismatch Request
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Items to Add */}
        <div className="bg-white rounded shadow-sm border overflow-hidden mb-6">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-base font-semibold text-gray-900">Items to Add to Inventory</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wide">#</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wide">Material</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wide">Color/Specs</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wide">UOM</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wide">Quantity</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wide">Weight</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700 uppercase tracking-wide">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grn.items_received?.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                    <td className="px-3 py-2 text-gray-600 font-medium">{index + 1}</td>
                    <td className="px-3 py-2 text-gray-900 font-medium">
                      {item.material_name}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {item.color && <span className="text-gray-700 font-medium">{item.color}</span>}
                      {item.gsm && <span className="text-gray-500 text-xs ml-1">({item.gsm}GSM)</span>}
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-center">{item.uom}</td>
                    <td className="px-3 py-2 text-gray-900 font-semibold text-center">
                      {item.received_quantity}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {item.weight ? `${item.weight} kg` : '-'}
                    </td>
                    <td className="px-3 py-2 text-gray-900 font-semibold text-right">
                      ₹{parseFloat(item.total || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan="6" className="px-3 py-2 font-semibold text-gray-900 text-right">
                    Total Value:
                  </td>
                  <td className="px-3 py-2 font-bold text-gray-900 text-right">
                    ₹{parseFloat(grn.total_received_value || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Location Selection */}
        <div className="bg-white rounded shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Select Warehouse Location
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
              >
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="Warehouse A">Warehouse A</option>
                <option value="Warehouse B">Warehouse B</option>
                <option value="Factory Store">Factory Store</option>
                <option value="Rack-R1-FAB01">Rack-R1-FAB01</option>
                <option value="Rack-R1-FAB02">Rack-R1-FAB02</option>
                <option value="Rack-R2-ACC01">Rack-R2-ACC01</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <p>Items will be stored at this location.</p>
                <p className="mt-1">Barcodes and QR codes will be auto-generated.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate('/inventory/grn')}
            className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding to Inventory...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Add {grn.items_received?.length || 0} Items to Inventory
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">📦 What Will Happen</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Each item will get a unique barcode (e.g., INV-20250117-00001)</li>
            <li>QR codes will be generated with full traceability data</li>
            <li>Inventory stock will be updated automatically</li>
            <li>Audit trail (Inventory Movement) will be created</li>
            <li>PO status will be marked as "Completed"</li>
            <li>Notifications will be sent to relevant departments</li>
          </ul>
        </div>

        {/* Mismatch Request Modal */}
        {showMismatchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto shadow-xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create Material Mismatch Request</h2>
                <button
                  onClick={() => setShowMismatchModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Mismatch Items Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mismatched Items</h3>
                  <div className="bg-gray-50 rounded overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Item</th>
                          <th className="px-4 py-2 text-center font-medium text-gray-700">PO Qty</th>
                          <th className="px-4 py-2 text-center font-medium text-gray-700">Received</th>
                          <th className="px-4 py-2 text-center font-medium text-gray-700">Shortage</th>
                          <th className="px-4 py-2 text-center font-medium text-gray-700">Overage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {mismatchForm.mismatched_items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-100">
                            <td className="px-4 py-2 text-gray-900 font-medium">
                              {item.item_name}
                              {item.color && <div className="text-xs text-gray-600">{item.color}</div>}
                            </td>
                            <td className="px-4 py-2 text-center text-gray-900">{item.po_quantity} {item.uom}</td>
                            <td className="px-4 py-2 text-center text-gray-900">{item.received_quantity} {item.uom}</td>
                            <td className="px-4 py-2 text-center">
                              {item.shortage_quantity > 0 ? (
                                <span className="text-red-600 font-semibold">{item.shortage_quantity} {item.uom}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {item.overage_quantity > 0 ? (
                                <span className="text-orange-600 font-semibold">{item.overage_quantity} {item.uom}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Request Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description of Mismatches
                  </label>
                  <textarea
                    value={mismatchForm.request_description}
                    onChange={(e) => setMismatchForm({...mismatchForm, request_description: e.target.value})}
                    placeholder="Describe the situation, impact, and any observations about the mismatches..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>

                {/* Requested Action */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested Action <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mismatchForm.requested_action}
                    onChange={(e) => setMismatchForm({...mismatchForm, requested_action: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="accept_shortage">Accept Shortage & Close PO</option>
                    <option value="return_overage">Return Overage to Vendor</option>
                    <option value="wait_for_remaining">Wait for Remaining Materials</option>
                    <option value="accept_and_adjust">Accept with Price Adjustment</option>
                    <option value="request_replacement">Request Replacement from Vendor</option>
                    <option value="cancel_remaining">Cancel Remaining PO Quantity</option>
                    <option value="other">Other (Specify in Notes)</option>
                  </select>
                </div>

                {/* Action Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={mismatchForm.requested_action_notes}
                    onChange={(e) => setMismatchForm({...mismatchForm, requested_action_notes: e.target.value})}
                    placeholder="Any additional details about the requested action..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-6 flex justify-end gap-3 bg-gray-50">
                <button
                  onClick={() => setShowMismatchModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                  disabled={mismatchSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleMismatchSubmit}
                  disabled={mismatchSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {mismatchSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddGRNToInventoryPage;