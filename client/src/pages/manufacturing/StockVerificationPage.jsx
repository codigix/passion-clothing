import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Camera, 
  AlertTriangle,
  Loader2,
  Trash2
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StockVerificationPage = () => {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [verificationChecklist, setVerificationChecklist] = useState([]);
  const [overallResult, setOverallResult] = useState('passed');
  const [issuesFound, setIssuesFound] = useState([]);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationPhotos, setVerificationPhotos] = useState([]);

  useEffect(() => {
    fetchReceiptDetails();
  }, [receiptId]);

  const fetchReceiptDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/material-receipt/${receiptId}`);
      const receiptData = response.data.receipt || response.data;
      setReceipt(receiptData);

      // Initialize verification checklist from received materials
      const initialChecklist = receiptData.received_materials.map(material => ({
        material_name: material.material_name,
        material_code: material.material_code,
        quantity_received: material.quantity_received,
        correct_quantity: 'yes',
        good_quality: 'yes',
        specs_match: 'yes',
        no_damage: 'yes',
        barcode_valid: 'yes',
        inspection_result: 'pass',
        remarks: ''
      }));
      setVerificationChecklist(initialChecklist);
    } catch (error) {
      console.error('Error fetching receipt details:', error);
      toast.error('Failed to load receipt details');
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistChange = (index, field, value) => {
    const updated = [...verificationChecklist];
    updated[index][field] = value;

    // Auto-determine inspection result
    const checks = ['correct_quantity', 'good_quality', 'specs_match', 'no_damage', 'barcode_valid'];
    const allPass = checks.every(check => updated[index][check] === 'yes');
    updated[index].inspection_result = allPass ? 'pass' : 'fail';

    // Update overall result
    const anyFail = updated.some(item => item.inspection_result === 'fail');
    setOverallResult(anyFail ? 'failed' : 'passed');

    setVerificationChecklist(updated);
  };

  const handleAddIssue = () => {
    setIssuesFound([...issuesFound, {
      material_name: '',
      issue_type: 'quality',
      severity: 'minor',
      description: '',
      action_required: ''
    }]);
  };

  const handleIssueChange = (index, field, value) => {
    const updated = [...issuesFound];
    updated[index][field] = value;
    setIssuesFound(updated);
  };

  const handleRemoveIssue = (index) => {
    const updated = issuesFound.filter((_, i) => i !== index);
    setIssuesFound(updated);
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const photoUrls = files.map(file => URL.createObjectURL(file));
    setVerificationPhotos([...verificationPhotos, ...photoUrls]);
    toast.success(`${files.length} photo(s) added`);
  };

  const handleSubmitVerification = async () => {
    try {
      setSubmitting(true);

      const verificationData = {
        mrn_request_id: receipt.mrn_request_id,
        receipt_id: parseInt(receiptId),
        verification_checklist: verificationChecklist,
        overall_result: overallResult,
        issues_found: issuesFound.length > 0 ? issuesFound : null,
        verification_notes: verificationNotes,
        verification_photos: verificationPhotos
      };

      const response = await api.post('/material-verification/create', verificationData);
      const verificationId = response.data?.verification?.id;
      
      if (overallResult === 'passed') {
        toast.success('Verification completed! Redirecting to Production Approval...');
        // Navigate to Production Approval page when verification PASSED
        if (verificationId) {
          navigate(`/manufacturing/production-approval/${verificationId}`);
        } else {
          navigate('/manufacturing/mrm-list');
        }
      } else {
        toast.warning('Verification failed. Materials need to be rejected or addressed.');
        navigate('/manufacturing/mrm-list');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error(error.response?.data?.message || 'Failed to submit verification');
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

  if (!receipt) {
    return (
      <div className="p-6">
        <div className="bg-error-50 border border-error-200 text-error-800 rounded p-4">
          Receipt record not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-display-4 font-bold text-dark-800">
          Stock Verification (QC)
        </h1>
      </div>

      {overallResult === 'failed' && (
        <div className="bg-error-50 border border-error-200 text-error-800 rounded p-4 mb-4">
          <p className="font-bold text-body-2">Verification Failed</p>
          <p className="text-body-2">
            One or more materials failed quality checks. Please review issues below.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Receipt Details */}
        <div className="card p-6">
          <h2 className="text-display-6 font-semibold mb-4">Receipt Details</h2>
          <hr className="border-border mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Receipt Number</p>
              <p className="text-body-1 font-medium">{receipt.receipt_number}</p>
            </div>
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Project Name</p>
              <p className="text-body-1 font-medium">{receipt.project_name}</p>
            </div>
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Received By</p>
              <p className="text-body-1 font-medium">{receipt.receiver?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Discrepancy</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                receipt.has_discrepancy 
                  ? 'bg-warning-100 text-warning-700' 
                  : 'bg-success-100 text-success-700'
              }`}>
                {receipt.has_discrepancy ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="card p-6">
          <h2 className="text-display-6 font-semibold mb-4">Quality Verification Checklist</h2>
          <hr className="border-border mb-4" />
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 py-2 text-xs text-left font-semibold text-gray-700">Material</th>
                  <th className="px-2 py-2 text-xs text-center font-semibold text-gray-700">Qty OK?</th>
                  <th className="px-2 py-2 text-xs text-center font-semibold text-gray-700">Quality OK?</th>
                  <th className="px-2 py-2 text-xs text-center font-semibold text-gray-700">Specs Match?</th>
                  <th className="px-2 py-2 text-xs text-center font-semibold text-gray-700">No Damage?</th>
                  <th className="px-2 py-2 text-xs text-center font-semibold text-gray-700">Barcode OK?</th>
                  <th className="px-2 py-2 text-xs text-center font-semibold text-gray-700">Result</th>
                  <th className="px-2 py-2 text-xs text-left font-semibold text-gray-700">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {verificationChecklist.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-2 py-2">
                      <p className="font-medium">{item.material_name}</p>
                      <p className="text-caption text-text-secondary">{item.material_code}</p>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`correct_quantity_${index}`}
                            value="yes"
                            checked={item.correct_quantity === 'yes'}
                            onChange={(e) => handleChecklistChange(index, 'correct_quantity', e.target.value)}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm">Y</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`correct_quantity_${index}`}
                            value="no"
                            checked={item.correct_quantity === 'no'}
                            onChange={(e) => handleChecklistChange(index, 'correct_quantity', e.target.value)}
                            className="w-4 h-4 text-error-600"
                          />
                          <span className="text-sm">N</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`good_quality_${index}`}
                            value="yes"
                            checked={item.good_quality === 'yes'}
                            onChange={(e) => handleChecklistChange(index, 'good_quality', e.target.value)}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm">Y</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`good_quality_${index}`}
                            value="no"
                            checked={item.good_quality === 'no'}
                            onChange={(e) => handleChecklistChange(index, 'good_quality', e.target.value)}
                            className="w-4 h-4 text-error-600"
                          />
                          <span className="text-sm">N</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`specs_match_${index}`}
                            value="yes"
                            checked={item.specs_match === 'yes'}
                            onChange={(e) => handleChecklistChange(index, 'specs_match', e.target.value)}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm">Y</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`specs_match_${index}`}
                            value="no"
                            checked={item.specs_match === 'no'}
                            onChange={(e) => handleChecklistChange(index, 'specs_match', e.target.value)}
                            className="w-4 h-4 text-error-600"
                          />
                          <span className="text-sm">N</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`no_damage_${index}`}
                            value="yes"
                            checked={item.no_damage === 'yes'}
                            onChange={(e) => handleChecklistChange(index, 'no_damage', e.target.value)}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm">Y</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`no_damage_${index}`}
                            value="no"
                            checked={item.no_damage === 'no'}
                            onChange={(e) => handleChecklistChange(index, 'no_damage', e.target.value)}
                            className="w-4 h-4 text-error-600"
                          />
                          <span className="text-sm">N</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`barcode_valid_${index}`}
                            value="yes"
                            checked={item.barcode_valid === 'yes'}
                            onChange={(e) => handleChecklistChange(index, 'barcode_valid', e.target.value)}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm">Y</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`barcode_valid_${index}`}
                            value="no"
                            checked={item.barcode_valid === 'no'}
                            onChange={(e) => handleChecklistChange(index, 'barcode_valid', e.target.value)}
                            className="w-4 h-4 text-error-600"
                          />
                          <span className="text-sm">N</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        item.inspection_result === 'pass' 
                          ? 'bg-success-100 text-success-700' 
                          : 'bg-error-100 text-error-700'
                      }`}>
                        {item.inspection_result === 'pass' ? (
                          <CheckCircle size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {item.inspection_result.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                        value={item.remarks}
                        onChange={(e) => handleChecklistChange(index, 'remarks', e.target.value)}
                        placeholder="Notes"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issues Found */}
        {overallResult === 'failed' && (
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-display-6 font-semibold">Issues Found</h2>
              <button
                className="btn btn-outline text-sm"
                onClick={handleAddIssue}
              >
                <AlertTriangle size={14} />
                Add Issue
              </button>
            </div>
            <hr className="border-border mb-4" />
            
            {issuesFound.map((issue, index) => (
              <div key={index} className="border border-gray-200 rounded p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                      value={issue.material_name}
                      onChange={(e) => handleIssueChange(index, 'material_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                      value={issue.issue_type}
                      onChange={(e) => handleIssueChange(index, 'issue_type', e.target.value)}
                    >
                      <option value="quality">Quality Issue</option>
                      <option value="quantity">Quantity Issue</option>
                      <option value="damage">Damage</option>
                      <option value="specification">Specification Mismatch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                      value={issue.severity}
                      onChange={(e) => handleIssueChange(index, 'severity', e.target.value)}
                    >
                      <option value="minor">Minor</option>
                      <option value="major">Major</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                      rows="2"
                      value={issue.description}
                      onChange={(e) => handleIssueChange(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Required
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                      value={issue.action_required}
                      onChange={(e) => handleIssueChange(index, 'action_required', e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      className="w-full px-4 py-2 border border-error-500 text-error-700 rounded hover:bg-error-50 transition-colors"
                      onClick={() => handleRemoveIssue(index)}
                    >
                      <Trash2 className="w-4 h-4 inline mr-2" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verification Notes & Photos */}
        <div className="card p-6">
          <h2 className="text-display-6 font-semibold mb-4">Verification Notes & Photos</h2>
          <hr className="border-border mb-4" />
          
          <textarea
            className="w-full px-2.5 py-1.5 border border-gray text-xs-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500 mb-4"
            rows="4"
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            placeholder="Overall inspection observations and notes..."
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
            {verificationPhotos.length > 0 && (
              <p className="text-body-2 text-text-secondary">
                {verificationPhotos.length} photo(s) attached
              </p>
            )}
          </div>
        </div>

        {/* Overall Result */}
        <div className="card p-6">
          <h2 className="text-display-6 font-semibold mb-4">Overall Verification Result</h2>
          <hr className="border-border mb-4" />
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2 py-2 rounded-full text-lg font-semibold ${
              overallResult === 'passed' 
                ? 'bg-success-100 text-success-700' 
                : 'bg-error-100 text-error-700'
            }`}>
              {overallResult === 'passed' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
              {overallResult.toUpperCase()}
            </span>
            <p className="text-body-2 text-text-secondary">
              {overallResult === 'passed' 
                ? 'All materials passed quality checks and are ready for production.'
                : 'Some materials failed verification. Review issues above.'}
            </p>
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
            className={`btn ${overallResult === 'passed' ? 'btn-primary bg-success-600 hover:bg-success-700' : 'bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded'}`}
            onClick={handleSubmitVerification}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                Submit Verification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockVerificationPage;