import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  QrCode,
  Loader2,
  X
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MaterialReceiptPage = () => {
  const { dispatchId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dispatch, setDispatch] = useState(null);
  const [receivedMaterials, setReceivedMaterials] = useState([]);
  const [hasDiscrepancy, setHasDiscrepancy] = useState(false);
  const [discrepancyModalOpen, setDiscrepancyModalOpen] = useState(false);
  const [currentDiscrepancy, setCurrentDiscrepancy] = useState(null);
  const [receiptNotes, setReceiptNotes] = useState('');
  const [receiptPhotos, setReceiptPhotos] = useState([]);

  useEffect(() => {
    fetchDispatchDetails();
  }, [dispatchId]);

  const fetchDispatchDetails = async () => {
    try {
      setLoading(true);
      // Get dispatch by ID
      const response = await api.get(`/material-dispatch/${dispatchId}`);
      const dispatchData = response.data.dispatch || response.data;
      setDispatch(dispatchData);

      // Initialize received materials from dispatched materials
      const initialMaterials = dispatchData.dispatched_materials.map(material => ({
        material_name: material.material_name,
        material_code: material.material_code,
        quantity_dispatched: material.quantity_dispatched,
        quantity_received: material.quantity_dispatched,
        uom: material.uom,
        barcode_scanned: material.barcode || '',
        condition: 'good',
        remarks: ''
      }));
      setReceivedMaterials(initialMaterials);
    } catch (error) {
      console.error('Error fetching dispatch details:', error);
      toast.error('Failed to load dispatch details');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...receivedMaterials];
    updated[index][field] = value;

    // Check if quantity doesn't match
    if (field === 'quantity_received') {
      const dispatched = updated[index].quantity_dispatched;
      const received = parseFloat(value) || 0;
      
      if (received !== dispatched) {
        setHasDiscrepancy(true);
      }
    }

    setReceivedMaterials(updated);
  };

  const handleAddDiscrepancy = (index) => {
    setCurrentDiscrepancy({
      index,
      material_name: receivedMaterials[index].material_name,
      issue_type: 'shortage',
      expected_qty: receivedMaterials[index].quantity_dispatched,
      received_qty: receivedMaterials[index].quantity_received,
      description: ''
    });
    setDiscrepancyModalOpen(true);
  };

  const handleSaveDiscrepancy = () => {
    // Add logic to save discrepancy details
    setHasDiscrepancy(true);
    setDiscrepancyModalOpen(false);
    toast.info('Discrepancy noted');
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const photoUrls = files.map(file => URL.createObjectURL(file));
    setReceiptPhotos([...receiptPhotos, ...photoUrls]);
    toast.success(`${files.length} photo(s) added`);
  };

  const handleSubmitReceipt = async () => {
    try {
      setSubmitting(true);

      const receiptData = {
        mrn_request_id: dispatch.mrn_request_id,
        dispatch_id: parseInt(dispatchId),
        received_materials: receivedMaterials,
        has_discrepancy: hasDiscrepancy,
        discrepancy_details: hasDiscrepancy ? currentDiscrepancy : null,
        receipt_notes: receiptNotes,
        receipt_photos: receiptPhotos
      };

      const response = await api.post('/material-receipt/create', receiptData);
      const receiptId = response.data?.receipt?.id;
      
      toast.success('Materials received successfully! Redirecting to QC Verification...');
      
      // Navigate to Stock Verification for QC checks (NOT back to list)
      if (receiptId) {
        navigate(`/manufacturing/stock-verification/${receiptId}`);
      } else {
        navigate('/manufacturing/mrm-list');
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      toast.error(error.response?.data?.message || 'Failed to create receipt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!dispatch) {
    return (
      <div className="p-6">
        <div className="bg-error-50 border border-error-200 text-error-800 rounded p-4">
          Dispatch record not found
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-8 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg mr-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Receive Materials
            </h1>
            <p className="text-sm text-slate-600 mt-2">Record received materials and verify quantities</p>
          </div>
        </div>

        {hasDiscrepancy && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 mb-6">
            <p className="font-bold text-sm">Discrepancy Detected</p>
            <p className="text-sm mt-1">
              One or more materials have quantity mismatches or issues.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Dispatch Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Dispatch Details</h2>
            <hr className="border-slate-200 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-body-2 text-text-secondary mb-1">Dispatch Number</p>
                <p className="text-body-1 font-medium">{dispatch.dispatch_number}</p>
              </div>
              <div>
                <p className="text-body-2 text-text-secondary mb-1">Project Name</p>
                <p className="text-body-1 font-medium">{dispatch.project_name}</p>
              </div>
              <div>
                <p className="text-body-2 text-text-secondary mb-1">Dispatched By</p>
                <p className="text-body-1 font-medium">{dispatch.dispatcher?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-body-2 text-text-secondary mb-1">Dispatched At</p>
                <p className="text-body-1 font-medium">
                  {new Date(dispatch.dispatched_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Materials Receipt Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Receive Materials</h2>
            <hr className="border-slate-200 mb-4" />
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Material Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Code</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Dispatched</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Received</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Condition</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Barcode</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Remarks</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {receivedMaterials.map((material, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-2 py-2 text-sm">{material.material_name}</td>
                      <td className="px-2 py-2 text-sm">{material.material_code}</td>
                      <td className="px-2 py-2 text-sm text-right">
                        {material.quantity_dispatched} {material.uom}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                            value={material.quantity_received}
                            onChange={(e) => handleMaterialChange(index, 'quantity_received', e.target.value)}
                            min="0"
                          />
                          {material.quantity_received !== material.quantity_dispatched && (
                            <AlertTriangle className="w-4 h-4 text-warning-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-32 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                          value={material.condition}
                          onChange={(e) => handleMaterialChange(index, 'condition', e.target.value)}
                        >
                          <option value="good">Good</option>
                          <option value="damaged">Damaged</option>
                          <option value="defective">Defective</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                            value={material.barcode_scanned}
                            onChange={(e) => handleMaterialChange(index, 'barcode_scanned', e.target.value)}
                            placeholder="Scan"
                          />
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <QrCode size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                          value={material.remarks}
                          onChange={(e) => handleMaterialChange(index, 'remarks', e.target.value)}
                          placeholder="Notes"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <button
                          className="px-3 py-1 border border-warning-500 text-warning-700 rounded hover:bg-warning-50 text-sm"
                          onClick={() => handleAddDiscrepancy(index)}
                        >
                          Report Issue
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Receipt Notes & Photos */}
          <div className="card p-6">
            <h2 className="text-display-6 font-semibold mb-4">Receipt Notes & Photos</h2>
            <hr className="border-border mb-4" />
            
            <textarea
              className="w-full px-2.5 py-1.5 border border-gray text-xs-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500 mb-4"
              rows="4"
              value={receiptNotes}
              onChange={(e) => setReceiptNotes(e.target.value)}
              placeholder="Any observations or notes about received materials..."
            />

            <div className="flex items-center gap-2">
              <label className="btn btn-outline cursor-pointer">
                <Camera size={14} />
                Add Photos
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </label>
              {receiptPhotos.length > 0 && (
                <p className="text-body-2 text-text-secondary">
                  {receiptPhotos.length} photo(s) attached
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-outline"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmitReceipt}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Confirm Receipt
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Discrepancy Modal */}
      {discrepancyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-display-6 font-semibold">Report Discrepancy</h3>
              <button
                onClick={() => setDiscrepancyModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md"
              >
                <X size={16} />
              </button>
            </div>
            
            {currentDiscrepancy && (
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-body-2 mb-1">
                    <strong>Material:</strong> {currentDiscrepancy.material_name}
                  </p>
                  <p className="text-body-2 mb-1">
                    <strong>Expected:</strong> {currentDiscrepancy.expected_qty}
                  </p>
                  <p className="text-body-2">
                    <strong>Received:</strong> {currentDiscrepancy.received_qty}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Type
                  </label>
                  <select
                    className="w-full px-2.5 py-1.5 border border-gray text-xs-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                    value={currentDiscrepancy.issue_type}
                    onChange={(e) => setCurrentDiscrepancy({...currentDiscrepancy, issue_type: e.target.value})}
                  >
                    <option value="shortage">Shortage</option>
                    <option value="damage">Damage</option>
                    <option value="wrong_item">Wrong Item</option>
                    <option value="quality_issue">Quality Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-2.5 py-1.5 border border-gray text-xs-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                    rows="4"
                    value={currentDiscrepancy.description}
                    onChange={(e) => setCurrentDiscrepancy({...currentDiscrepancy, description: e.target.value})}
                    placeholder="Describe the issue in detail..."
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                className="btn btn-outline"
                onClick={() => setDiscrepancyModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-warning-500 text-white rounded hover:bg-warning-600 focus:ring-2 focus:ring-warning-300 transition-colors"
                onClick={handleSaveDiscrepancy}
              >
                Save Discrepancy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialReceiptPage;