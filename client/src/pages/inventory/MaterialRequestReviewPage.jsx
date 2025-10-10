import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle, 
  FaBoxOpen, 
  FaIndustry,
  FaTruck,
  FaClipboardCheck,
  FaBox,
  FaBarcode,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaShoppingCart
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MaterialRequestReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [inventoryNotes, setInventoryNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Integrated approval results
  const [showResults, setShowResults] = useState(false);
  const [approvalResult, setApprovalResult] = useState(null);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/project-material-requests/${id}`);
      setRequest(response.data);
      setInventoryNotes(response.data.inventory_notes || '');
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast.error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🚀 NEW INTEGRATED WORKFLOW
   * Single API call that:
   * 1. Checks MRN
   * 2. Verifies GRN received
   * 3. Checks entire inventory stock
   * 4. Auto-approves if materials available
   * 5. Creates dispatch
   * 6. Deducts from inventory
   * 7. Notifies manufacturing
   */
  const handleIntegratedApprovalAndDispatch = async (forceDispatch = false) => {
    try {
      setProcessing(true);
      setShowResults(false);

      const response = await api.post(`/project-material-requests/${id}/approve-and-dispatch`, {
        dispatch_notes: inventoryNotes || 'Approved and dispatched via integrated workflow',
        force_dispatch: forceDispatch
      });

      const result = response.data;
      setApprovalResult(result);
      setShowResults(true);

      // Success messages based on status
      if (result.approval_status === 'approved') {
        toast.success(`✅ Materials dispatched! Dispatch #: ${result.dispatch?.dispatch_number}`);
      } else if (result.approval_status === 'partial') {
        if (forceDispatch) {
          toast.success(`✅ Partial dispatch created! Dispatch #: ${result.dispatch?.dispatch_number}`);
        } else {
          toast.warning('⚠️ Partial stock available. Use "Force Dispatch" to proceed.');
        }
      } else {
        toast.error('❌ Materials unavailable. Forward to procurement.');
      }

      // Refresh request details
      await fetchRequestDetails();

    } catch (error) {
      console.error('Error in integrated approval:', error);
      toast.error(error.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const handleForwardToProcurement = async () => {
    try {
      setProcessing(true);
      
      await api.post(`/project-material-requests/${id}/forward-to-procurement`, {
        inventory_notes: inventoryNotes
      });
      
      toast.success('Request forwarded to procurement for material sourcing');
      navigate('/inventory');
    } catch (error) {
      console.error('Error forwarding to procurement:', error);
      toast.error('Failed to forward to procurement');
    } finally {
      setProcessing(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      pending_inventory_review: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pending Review' },
      stock_available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Stock Available' },
      partial_available: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Partial Stock' },
      stock_unavailable: { bg: 'bg-red-100', text: 'text-red-800', label: 'Stock Unavailable' },
      materials_dispatched: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Dispatched' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Loading request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Request not found</div>
      </div>
    );
  }

  // Parse materials
  let materials = [];
  try {
    materials = Array.isArray(request.materials_requested)
      ? request.materials_requested
      : typeof request.materials_requested === 'string'
      ? JSON.parse(request.materials_requested)
      : [];
  } catch (e) {
    materials = [];
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition"
          >
            <FaArrowLeft /> Back to Inventory Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaClipboardCheck className="text-blue-600" />
            Review Material Request
          </h1>
          <p className="text-gray-600 mt-1 font-mono text-lg">{request.request_number}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(request.status)}
          <span className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${getPriorityColor(request.priority)}`}>
            {request.priority?.toUpperCase()} PRIORITY
          </span>
          {/* Quick Dispatch Button */}
          {(request.status === 'pending' || request.status === 'pending_inventory_review' || request.status === 'reviewed') && (
            <button
              onClick={() => navigate(`/inventory/dispatch/${request.id}`)}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold shadow-md"
              title="Go to Manual Dispatch Page"
            >
              <FaTruck />
              Manual Dispatch
            </button>
          )}
        </div>
      </div>

      {/* Request Details Card */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-lg border-2 border-blue-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaIndustry className="text-blue-600" />
          Request Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <label className="text-xs text-gray-500 uppercase font-semibold">Project Name</label>
            <p className="font-bold text-gray-900 text-lg mt-1">{request.project_name}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <label className="text-xs text-gray-500 uppercase font-semibold">Requesting Department</label>
            <p className="font-bold text-gray-900 text-lg mt-1 flex items-center gap-2">
              <FaIndustry className="text-blue-600" />
              {request.requesting_department?.toUpperCase() || 'MANUFACTURING'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <label className="text-xs text-gray-500 uppercase font-semibold">Request Date</label>
            <p className="font-bold text-gray-900 text-lg mt-1">
              {request.request_date ? new Date(request.request_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <label className="text-xs text-gray-500 uppercase font-semibold">Required By Date</label>
            <p className="font-bold text-gray-900 text-lg mt-1">
              {request.required_by_date ? new Date(request.required_by_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <label className="text-xs text-gray-500 uppercase font-semibold">Total Items</label>
            <p className="font-bold text-gray-900 text-lg mt-1">{request.total_items || materials.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <label className="text-xs text-gray-500 uppercase font-semibold">Created By</label>
            <p className="font-bold text-gray-900 text-lg mt-1">{request.creator?.name || 'N/A'}</p>
          </div>
        </div>
        
        {request.manufacturing_notes && (
          <div className="mt-4 p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
            <label className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <FaBox /> Manufacturing Notes
            </label>
            <p className="text-sm text-blue-800 mt-2">{request.manufacturing_notes}</p>
          </div>
        )}

        {request.purchase_order_id && (
          <div className="mt-4 p-4 bg-green-100 rounded-lg border-2 border-green-300">
            <label className="text-sm font-bold text-green-900 flex items-center gap-2">
              <FaShoppingCart /> Linked Purchase Order
            </label>
            <p className="text-sm text-green-800 mt-2">
              PO ID: {request.purchase_order_id} - Materials may have been received via GRN
            </p>
          </div>
        )}
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaBox className="text-purple-600" />
          Materials Requested ({materials.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="font-bold text-gray-700 p-3 text-left">#</th>
                <th className="font-bold text-gray-700 p-3 text-left">Material Name</th>
                <th className="font-bold text-gray-700 p-3 text-left">Description</th>
                <th className="font-bold text-gray-700 p-3 text-left">Specifications</th>
                <th className="font-bold text-gray-700 p-3 text-right">Required Qty</th>
                <th className="font-bold text-gray-700 p-3 text-left">Unit</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material, index) => (
                <tr key={index} className="hover:bg-gray-50 border-b transition">
                  <td className="p-3 font-semibold text-gray-500">{index + 1}</td>
                  <td className="p-3 font-bold text-gray-900">{material.material_name}</td>
                  <td className="p-3 text-gray-600">{material.description || 'N/A'}</td>
                  <td className="p-3 text-gray-600 text-xs">{material.specifications || 'N/A'}</td>
                  <td className="p-3 text-right font-bold text-lg text-blue-600">{material.quantity_required}</td>
                  <td className="p-3 font-semibold">{material.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Notes */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory / Dispatch Notes</h2>
        <textarea
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="4"
          placeholder="Add notes about stock availability, dispatch details, alternative materials, etc."
          value={inventoryNotes}
          onChange={(e) => setInventoryNotes(e.target.value)}
        />
      </div>

      {/* 🚀 INTEGRATED ACTION BUTTONS - NEW WORKFLOW */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-xl border-2 border-green-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FaTruck className="text-green-600" />
          Integrated Approval & Dispatch Workflow
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Single-click workflow: Checks GRN, verifies stock across entire inventory, auto-approves, creates dispatch, deducts stock, and notifies manufacturing!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Auto Approve & Dispatch */}
          <button
            className="px-6 py-4 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleIntegratedApprovalAndDispatch(false)}
            disabled={processing || request.status === 'materials_dispatched'}
          >
            <FaCheckCircle className="text-2xl" />
            <div className="text-left">
              <div>Auto Approve & Dispatch</div>
              <div className="text-xs font-normal opacity-90">Full stock only</div>
            </div>
          </button>

          {/* Force Dispatch (Partial) */}
          <button
            className="px-6 py-4 rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleIntegratedApprovalAndDispatch(true)}
            disabled={processing || request.status === 'materials_dispatched'}
          >
            <FaExclamationTriangle className="text-2xl" />
            <div className="text-left">
              <div>Force Dispatch</div>
              <div className="text-xs font-normal opacity-90">Partial stock OK</div>
            </div>
          </button>

          {/* Forward to Procurement */}
          <button
            className="px-6 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleForwardToProcurement}
            disabled={processing}
          >
            <FaShoppingCart className="text-2xl" />
            <div className="text-left">
              <div>Forward to Procurement</div>
              <div className="text-xs font-normal opacity-90">Material sourcing needed</div>
            </div>
          </button>
        </div>

        {processing && (
          <div className="mt-4 flex items-center justify-center gap-3 text-blue-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="font-semibold">Processing integrated workflow...</span>
          </div>
        )}
      </div>

      {/* 📊 RESULTS DISPLAY */}
      {showResults && approvalResult && (
        <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-300 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FaClipboardCheck className="text-blue-600" />
            Approval & Dispatch Results
          </h2>

          {/* Approval Status */}
          <div className={`p-4 rounded-lg mb-6 ${
            approvalResult.approval_status === 'approved' ? 'bg-green-100 border-2 border-green-400' :
            approvalResult.approval_status === 'partial' ? 'bg-orange-100 border-2 border-orange-400' :
            'bg-red-100 border-2 border-red-400'
          }`}>
            <div className="flex items-center gap-3">
              {approvalResult.approval_status === 'approved' ? <FaCheckCircle className="text-green-600 text-3xl" /> :
               approvalResult.approval_status === 'partial' ? <FaExclamationTriangle className="text-orange-600 text-3xl" /> :
               <FaTimesCircle className="text-red-600 text-3xl" />}
              <div>
                <h3 className="text-xl font-bold">
                  {approvalResult.approval_status === 'approved' ? '✅ Approved & Dispatched' :
                   approvalResult.approval_status === 'partial' ? '⚠️ Partial Stock Available' :
                   '❌ Stock Unavailable'}
                </h3>
                <p className="text-sm">{approvalResult.message}</p>
              </div>
            </div>
          </div>

          {/* GRN Check Results */}
          {approvalResult.grn_check && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <FaBox /> GRN Verification Results
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">GRN Received:</span>
                  <p className="font-bold">
                    {approvalResult.grn_check.exists ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <FaCheckCircle /> Yes
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <FaTimesCircle /> No
                      </span>
                    )}
                  </p>
                </div>
                {approvalResult.grn_check.grn_numbers && approvalResult.grn_check.grn_numbers.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">GRN Numbers:</span>
                    <p className="font-bold text-blue-600">
                      {approvalResult.grn_check.grn_numbers.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stock Check Results */}
          {approvalResult.stock_check && approvalResult.stock_check.length > 0 && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <FaBoxOpen /> Stock Availability Details
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="p-2 text-left">Material</th>
                      <th className="p-2 text-right">Requested</th>
                      <th className="p-2 text-right">Available</th>
                      <th className="p-2 text-right">Shortage</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-center">GRN Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalResult.stock_check.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-semibold">{item.material_name}</td>
                        <td className="p-2 text-right font-bold">{item.requested_qty} {item.unit}</td>
                        <td className="p-2 text-right font-bold text-blue-600">{item.available_qty} {item.unit}</td>
                        <td className="p-2 text-right font-bold text-red-600">
                          {item.shortage_qty > 0 ? `${item.shortage_qty} ${item.unit}` : '-'}
                        </td>
                        <td className="p-2 text-center">
                          {item.status === 'available' ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                              ✅ Available
                            </span>
                          ) : item.status === 'partial' ? (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">
                              ⚠️ Partial
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                              ❌ Unavailable
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {item.grn_received ? (
                            <FaCheckCircle className="text-green-600 mx-auto" />
                          ) : (
                            <FaTimesCircle className="text-gray-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inventory Items Details */}
              {approvalResult.stock_check.some(item => item.inventory_items && item.inventory_items.length > 0) && (
                <div className="mt-4">
                  <h4 className="font-bold text-purple-900 mb-2">Inventory Item Details:</h4>
                  {approvalResult.stock_check.map((stockItem, stockIndex) => (
                    stockItem.inventory_items && stockItem.inventory_items.length > 0 && (
                      <div key={stockIndex} className="mb-3 p-3 bg-white rounded border border-purple-200">
                        <p className="font-semibold text-gray-800 mb-2">{stockItem.material_name}:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {stockItem.inventory_items.map((invItem, invIndex) => (
                            <div key={invIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <FaMapMarkerAlt className="text-blue-500" />
                              <span className="font-semibold">{invItem.location || 'N/A'}</span>
                              <FaLayerGroup className="text-green-500" />
                              <span>{invItem.batch_number || 'N/A'}</span>
                              <FaBarcode className="text-purple-500" />
                              <span className="text-xs">{invItem.barcode || 'N/A'}</span>
                              <span className="ml-auto font-bold text-blue-600">{invItem.quantity} units</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dispatch Details */}
          {approvalResult.dispatch && (
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <FaTruck /> Dispatch Created Successfully
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Dispatch Number:</span>
                  <p className="font-bold text-lg text-green-600">{approvalResult.dispatch.dispatch_number}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total Items:</span>
                  <p className="font-bold text-lg">{approvalResult.dispatch.total_items}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Dispatched At:</span>
                  <p className="font-bold">
                    {new Date(approvalResult.dispatch.dispatched_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <p className="font-bold text-green-600">✅ Dispatched</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialRequestReviewPage;