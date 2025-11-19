import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, ChevronLeft, Package } from 'lucide-react';
import api from '../../utils/api';

const GRNVerificationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [grn, setGrn] = useState(null);
  const [verificationForm, setVerificationForm] = useState({
    verification_status: 'verified', // 'verified' or 'discrepancy'
    verification_notes: '',
    discrepancy_details: {
      qty_mismatch: false,
      weight_mismatch: false,
      quality_issue: false,
      details: ''
    }
  });
  const [showVendorRevertModal, setShowVendorRevertModal] = useState(false);
  const [vendorRevertForm, setVendorRevertForm] = useState({
    reason: '',
    notes: ''
  });

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

  const handleVerificationChange = (field, value) => {
    setVerificationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDiscrepancyChange = (field, value) => {
    setVerificationForm(prev => ({
      ...prev,
      discrepancy_details: {
        ...prev.discrepancy_details,
        [field]: value
      }
    }));

    // Auto-change verification status to discrepancy if any issue is checked
    if ((field !== 'details') && value === true) {
      setVerificationForm(prev => ({ ...prev, verification_status: 'discrepancy' }));
    }
  };

  const handleSubmit = async (status) => {
    try {
      const hasDiscrepancy =
        verificationForm.discrepancy_details.qty_mismatch ||
        verificationForm.discrepancy_details.weight_mismatch ||
        verificationForm.discrepancy_details.quality_issue;

      if (status === 'verified' && hasDiscrepancy) {
        if (!window.confirm('You have marked discrepancies but choosing "Verified". This will ignore the discrepancies. Continue?')) {
          return;
        }
      }

      setSubmitting(true);

      const payload = {
        verification_status: status,
        verification_notes: verificationForm.verification_notes,
        discrepancy_details: status === 'discrepancy' ? verificationForm.discrepancy_details : null
      };

      const response = await api.post(`/grn/${id}/verify`, payload);

      if (status === 'verified') {
        // Check for excess materials that need approval
        const hasExcess = grn.items_received?.some(item => item.overage_quantity > 0);

        if (hasExcess) {
          // Redirect to excess approval page
          alert('GRN verified! Excess materials detected - proceeding to approval workflow.');
          navigate(`/inventory/grn/${id}/excess-approval`);
        } else {
          // Check if stock should be allocated to project or warehouse
          const isProjectStock = grn.purchaseOrder?.linked_sales_order_id;

          if (isProjectStock) {
            // Allocate to project
            const allocationResponse = await api.post(`/inventory/allocate-to-project`, {
              grn_id: id,
              sales_order_id: grn.purchaseOrder.linked_sales_order_id
            });

            const itemsAdded = response.data.inventory_items_added || 0;
            alert(`GRN verified successfully! ${itemsAdded} items allocated to project ${grn.purchaseOrder.project_name || grn.purchaseOrder.linked_sales_order_id}.`);
            navigate('/inventory/allocations');
          } else {
            // Store in warehouse
            const itemsAdded = response.data.inventory_items_added || 0;
            alert(`GRN verified successfully! ${itemsAdded} items added to warehouse stock with barcodes generated.`);
            navigate('/inventory/stock');
          }
        }
      } else {
        alert('Discrepancy reported. Awaiting manager approval...');
        navigate('/inventory/grn');
      }
    } catch (error) {
      console.error('Error verifying GRN:', error);
      alert(error.response?.data?.message || 'Failed to verify GRN');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVendorRevert = async () => {
    try {
      if (!vendorRevertForm.reason.trim()) {
        alert('Please provide a reason for vendor revert request');
        return;
      }

      setSubmitting(true);

      // Collect shortage items
      const shortageItems = (grn.items_received || [])
        .filter(item => {
          const shortage = Math.min(item.ordered_quantity, item.invoiced_quantity || item.ordered_quantity) - item.received_quantity;
          return shortage > 0;
        })
        .map(item => ({
          material_name: item.material_name,
          color: item.color,
          ordered_qty: item.ordered_quantity,
          invoiced_qty: item.invoiced_quantity || item.ordered_quantity,
          received_qty: item.received_quantity,
          shortage_qty: Math.min(item.ordered_quantity, item.invoiced_quantity || item.ordered_quantity) - item.received_quantity,
          notes: item.remarks
        }));

      const payload = {
        reason: vendorRevertForm.reason,
        shortage_items: shortageItems,
        notes: vendorRevertForm.notes
      };

      await api.post(`/grn/${id}/request-vendor-revert`, payload);

      alert('Vendor revert request sent successfully. Procurement team will contact vendor.');
      navigate('/inventory/grn');
    } catch (error) {
      console.error('Error requesting vendor revert:', error);
      alert(error.response?.data?.message || 'Failed to request vendor revert');
    } finally {
      setSubmitting(false);
      setShowVendorRevertModal(false);
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
            <p className="text-red-700 mb-4">The requested GRN could not be found.</p>
            <button
              onClick={() => navigate('/inventory/grn')}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Go to GRN List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasAnyDiscrepancy = grn.items_received?.some(item => 
    parseFloat(item.received_quantity) !== parseFloat(item.ordered_quantity)
  );

  const hasShortage = grn.items_received?.some(item => {
    const shortage = Math.min(
      item.ordered_quantity, 
      item.invoiced_quantity || item.ordered_quantity
    ) - item.received_quantity;
    return shortage > 0;
  });

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Verify GRN: {grn.grn_number}
              </h1>
              <p className="text-gray-600 mt-1">
                Quality check and verification of received materials
              </p>
            </div>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                grn.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                grn.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                grn.verification_status === 'discrepancy' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {grn.verification_status}
              </span>
            </div>
          </div>
        </div>

        {/* GRN Info Card */}
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
            <div>
              <label className="text-sm font-medium text-gray-500">Challan Number</label>
              <p className="text-gray-900">{grn.inward_challan_number || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Invoice Number</label>
              <p className="text-gray-900">{grn.supplier_invoice_number || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total Value</label>
              <p className="text-gray-900 font-semibold">₹{parseFloat(grn.total_received_value || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Created By</label>
              <p className="text-gray-900">{grn.creator?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Warning if discrepancies detected */}
        {hasAnyDiscrepancy && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900">Quantity Variance Detected</h3>
            </div>
            <p className="text-sm text-yellow-800 mt-2">
              Some items have received quantities different from ordered quantities. Please verify and mark as discrepancy if needed.
            </p>
          </div>
        )}

        {/* Items Table */}
        <div className="bg-white rounded shadow-sm border overflow-hidden mb-6">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold">Received Items - Quality Check</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color/Specs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordered</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {grn.items_received?.map((item, index) => {
                  const ordered = parseFloat(item.ordered_quantity) || 0;
                  const received = parseFloat(item.received_quantity) || 0;
                  const variance = received - ordered;
                  const variancePercent = ordered > 0 ? ((variance / ordered) * 100).toFixed(1) : 0;
                  const isMatch = variance === 0;

                  return (
                    <tr key={index} className={!isMatch ? 'bg-yellow-50' : ''}>
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {item.material_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.color && <span className="text-gray-700">{item.color}</span>}
                        {item.gsm && <span className="text-gray-500 ml-1">({item.gsm} GSM)</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.uom}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{ordered}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{received}</td>
                      <td className="px-4 py-3 text-sm">
                        {isMatch ? (
                          <span className="text-green-600 font-medium">0 (0%)</span>
                        ) : (
                          <span className="text-yellow-600 font-medium">
                            {variance > 0 ? '+' : ''}{variance} ({variancePercent}%)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.weight ? `${item.weight} kg` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {isMatch ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Variance
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

        {/* Verification Form */}
        <div className="bg-white rounded shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Verification Decision</h2>
          
          {/* Discrepancy Checkboxes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mark any issues found:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={verificationForm.discrepancy_details.qty_mismatch}
                  onChange={(e) => handleDiscrepancyChange('qty_mismatch', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-opacity-20"
                />
                <span className="ml-2 text-sm text-gray-700">Quantity Mismatch</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={verificationForm.discrepancy_details.weight_mismatch}
                  onChange={(e) => handleDiscrepancyChange('weight_mismatch', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-opacity-20"
                />
                <span className="ml-2 text-sm text-gray-700">Weight Mismatch</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={verificationForm.discrepancy_details.quality_issue}
                  onChange={(e) => handleDiscrepancyChange('quality_issue', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-opacity-20"
                />
                <span className="ml-2 text-sm text-gray-700">Quality Issue (Color, GSM, Condition)</span>
              </label>
            </div>
          </div>

          {/* Discrepancy Details */}
          {(verificationForm.discrepancy_details.qty_mismatch || 
            verificationForm.discrepancy_details.weight_mismatch || 
            verificationForm.discrepancy_details.quality_issue) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discrepancy Details <span className="text-red-500">*</span>
              </label>
              <textarea
                value={verificationForm.discrepancy_details.details}
                onChange={(e) => handleDiscrepancyChange('details', e.target.value)}
                rows="3"
                placeholder="Describe the issue in detail..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
              />
            </div>
          )}

          {/* Verification Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Notes
            </label>
            <textarea
              value={verificationForm.verification_notes}
              onChange={(e) => handleVerificationChange('verification_notes', e.target.value)}
              rows="3"
              placeholder="Additional notes about verification..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-3">
          <div className="flex gap-3">
            {hasShortage && (
              <button
                onClick={() => setShowVendorRevertModal(true)}
                disabled={submitting}
                className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                Request Vendor Revert (Shortage Detected)
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/inventory/grn')}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            
            {(verificationForm.discrepancy_details.qty_mismatch || 
              verificationForm.discrepancy_details.weight_mismatch || 
              verificationForm.discrepancy_details.quality_issue) && (
              <button
                onClick={() => handleSubmit('discrepancy')}
                disabled={submitting}
                className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Report Discrepancy
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => handleSubmit('verified')}
              disabled={submitting}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Verify & Add to Inventory
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">🔍 Verification Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>Verified:</strong> All items match expected quality and quantity. Ready to add to inventory.</li>
            <li><strong>Discrepancy:</strong> Issues found. Will require manager approval before adding to inventory.</li>
            <li><strong>Vendor Revert:</strong> Shortage detected. Send request to vendor for pending items.</li>
            <li>Check quantity, weight, color, GSM, packaging condition, and overall quality.</li>
            <li>Red highlighted rows indicate shortage - consider vendor revert request.</li>
          </ul>
        </div>

        {/* Vendor Revert Modal */}
        {showVendorRevertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b bg-orange-50">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  Request Vendor Revert for Shortage
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Send request to vendor for pending items that were not delivered
                </p>
              </div>

              <div className="px-6 py-4">
                {/* Shortage Items Summary */}
                <div className="mb-6 bg-red-50 border border-red-200 rounded p-4">
                  <h3 className="font-semibold text-red-900 mb-3">Items with Shortage:</h3>
                  <div className="space-y-2">
                    {grn.items_received?.filter(item => {
                      const shortage = Math.min(
                        item.ordered_quantity, 
                        item.invoiced_quantity || item.ordered_quantity
                      ) - item.received_quantity;
                      return shortage > 0;
                    }).map((item, idx) => {
                      const shortage = Math.min(
                        item.ordered_quantity, 
                        item.invoiced_quantity || item.ordered_quantity
                      ) - item.received_quantity;
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                          <div>
                            <span className="font-medium text-gray-900">{item.material_name}</span>
                            {item.color && <span className="text-gray-600 ml-2">({item.color})</span>}
                          </div>
                          <div className="text-right">
                            <span className="text-red-700 font-semibold">Shortage: {shortage.toFixed(2)} {item.uom}</span>
                            <div className="text-xs text-gray-600">
                              Ordered: {item.ordered_quantity} | Received: {item.received_quantity}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Revert Request Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Revert Request <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={vendorRevertForm.reason}
                      onChange={(e) => setVendorRevertForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-blue-500"
                    >
                      <option value="">Select reason...</option>
                      <option value="shortage_in_delivery">Shortage in Delivery</option>
                      <option value="partial_delivery">Partial Delivery - Balance Pending</option>
                      <option value="items_missing">Items Missing from Package</option>
                      <option value="invoice_quantity_mismatch">Invoice vs Physical Quantity Mismatch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={vendorRevertForm.notes}
                      onChange={(e) => setVendorRevertForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows="3"
                      placeholder="Provide any additional details about the shortage or expected delivery..."
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> This will notify the procurement team to contact vendor 
                      <strong> {grn.supplier_name}</strong> regarding the pending items. The GRN will be marked 
                      as "Awaiting Vendor Response" until the issue is resolved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowVendorRevertModal(false);
                    setVendorRevertForm({ reason: '', notes: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-white"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVendorRevert}
                  disabled={submitting || !vendorRevertForm.reason}
                  className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      Send Revert Request
                    </>
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

export default GRNVerificationPage;