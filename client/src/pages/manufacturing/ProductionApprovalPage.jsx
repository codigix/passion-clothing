import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Play, 
  Calendar,
  Loader2
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ProductionApprovalPage = () => {
  const { verificationId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verification, setVerification] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('approved');
  const [productionStartDate, setProductionStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [conditions, setConditions] = useState('');

  useEffect(() => {
    fetchVerificationDetails();
  }, [verificationId]);

  const fetchVerificationDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/material-verification/${verificationId}`);
      const verificationData = response.data.verification || response.data;
      setVerification(verificationData);

      // Auto-set approval status based on verification result
      if (verificationData.overall_result === 'failed') {
        setApprovalStatus('rejected');
      }
    } catch (error) {
      console.error('Error fetching verification details:', error);
      toast.error('Failed to load verification details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApproval = async () => {
    try {
      setSubmitting(true);

      // Validate based on status
      if (approvalStatus === 'rejected' && !rejectionReason.trim()) {
        toast.error('Please provide a rejection reason');
        setSubmitting(false);
        return;
      }

      const approvalData = {
        mrn_request_id: verification.mrn_request_id,
        verification_id: parseInt(verificationId),
        approval_status: approvalStatus,
        production_start_date: approvalStatus === 'approved' ? productionStartDate : null,
        approval_notes: approvalNotes,
        rejection_reason: approvalStatus === 'rejected' ? rejectionReason : null,
        conditions: approvalStatus === 'conditional' ? conditions : null
      };

      const response = await api.post('/production-approval/create', approvalData);
      const approvalId = response.data?.approval?.id;
      
      if (approvalStatus === 'approved') {
        toast.success('Production approved! Redirecting to Production Wizard...');
        // Redirect to Production Wizard with approval ID for auto-prefill
        if (approvalId) {
          navigate(`/manufacturing/wizard?approvalId=${approvalId}`);
        } else {
          navigate('/manufacturing/wizard');
        }
      } else {
        toast.success('Approval submitted successfully');
        navigate('/manufacturing/mrm-list');
      }
    } catch (error) {
      console.error('Error submitting approval:', error);
      toast.error(error.response?.data?.message || 'Failed to submit approval');
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

  if (!verification) {
    return (
      <div className="p-6">
        <div className="bg-error-50 border border-error-200 text-error-800 rounded p-4">
          Verification record not found
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
          Production Approval
        </h1>
      </div>

      {verification.overall_result === 'failed' && (
        <div className="bg-warning-50 border border-warning-200 text-warning-800 rounded p-4 mb-4">
          <p className="font-bold text-body-2">Verification Failed</p>
          <p className="text-body-2">
            Materials failed quality verification. Review the verification report before deciding.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Verification Summary */}
        <div className="card p-6">
          <h2 className="text-display-6 font-semibold mb-4">Verification Summary</h2>
          <hr className="border-border mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Verification Number</p>
              <p className="text-body-1 font-medium">{verification.verification_number}</p>
            </div>
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Project Name</p>
              <p className="text-body-1 font-medium">{verification.project_name}</p>
            </div>
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Verified By</p>
              <p className="text-body-1 font-medium">{verification.verifier?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Verification Result</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                verification.overall_result === 'passed' 
                  ? 'bg-success-100 text-success-700' 
                  : 'bg-error-100 text-error-700'
              }`}>
                {verification.overall_result === 'passed' ? (
                  <CheckCircle size={14} />
                ) : (
                  <XCircle size={14} />
                )}
                {verification.overall_result.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Materials Verification */}
        <div className="card p-6">
          <h2 className="text-display-6 font-semibold mb-4">Materials Verification</h2>
          <hr className="border-border mb-4" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {verification.verification_checklist.map((item, index) => (
              <div
                key={index}
                className={`p-4 border-2 rounded ${
                  item.inspection_result === 'pass' 
                    ? 'border-success-300 bg-success-50' 
                    : 'border-error-300 bg-error-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-body-2 font-bold">{item.material_name}</p>
                  <span className={`inline-flex px-1.5 py-0.5 rounded-full text-sm ${
                    item.inspection_result === 'pass' 
                      ? 'bg-success-100 text-success-700' 
                      : 'bg-error-100 text-error-700'
                  }`}>
                    {item.inspection_result.toUpperCase()}
                  </span>
                </div>
                <p className="text-caption text-text-secondary">
                  {item.material_code} | Qty: {item.quantity_received}
                </p>
                {item.remarks && (
                  <p className="text-caption mt-2">Note: {item.remarks}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Issues Found */}
        {verification.issues_found && verification.issues_found.length > 0 && (
          <div className="card p-6">
            <h2 className="text-display-6 font-semibold text-error-700 mb-4">Issues Found</h2>
            <hr className="border-border mb-4" />
            
            {verification.issues_found.map((issue, index) => (
              <div
                key={index}
                className={`border-l-4 p-4 mb-3 rounded ${
                  issue.severity === 'critical' 
                    ? 'border-error-500 bg-error-50' 
                    : 'border-warning-500 bg-warning-50'
                }`}
              >
                <p className="text-body-2 font-bold">
                  {issue.material_name} - {issue.issue_type}
                </p>
                <p className="text-body-2 mt-1">{issue.description}</p>
                {issue.action_required && (
                  <p className="text-caption mt-2">
                    Action Required: {issue.action_required}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Approval Decision */}
        <div className="card p-6">
          <h2 className="text-display-6 font-semibold mb-4">Manager Approval Decision</h2>
          <hr className="border-border mb-4" />
          
          <div className="space-y-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Approval Status</p>
            
            <label className="flex items-center p-4 border-2 border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="approval_status"
                value="approved"
                checked={approvalStatus === 'approved'}
                onChange={(e) => setApprovalStatus(e.target.value)}
                className="w-4 h-4 text-success-600"
              />
              <span className="ml-3 text-body-1">✅ Approve - Ready for Production</span>
            </label>

            <label className="flex items-center p-4 border-2 border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="approval_status"
                value="conditional"
                checked={approvalStatus === 'conditional'}
                onChange={(e) => setApprovalStatus(e.target.value)}
                className="w-4 h-4 text-warning-600"
              />
              <span className="ml-3 text-body-1">⚠️ Conditional Approval - With Conditions</span>
            </label>

            <label className="flex items-center p-4 border-2 border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="approval_status"
                value="rejected"
                checked={approvalStatus === 'rejected'}
                onChange={(e) => setApprovalStatus(e.target.value)}
                className="w-4 h-4 text-error-600"
              />
              <span className="ml-3 text-body-1">❌ Reject - Not Ready</span>
            </label>
          </div>

          {/* Approved */}
          {approvalStatus === 'approved' && (
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Production Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-2.5 py-1.5 border border-gray text-xs-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                  value={productionStartDate}
                  onChange={(e) => setProductionStartDate(e.target.value)}
                />
              </div>
              
              <div className="bg-success-50 border border-success-200 text-success-800 rounded p-4">
                <p className="text-body-2">
                  Materials will be marked as <strong>READY FOR PRODUCTION</strong> and available for manufacturing operations.
                </p>
              </div>
            </div>
          )}

          {/* Conditional */}
          {approvalStatus === 'conditional' && (
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Conditions
                </label>
                <textarea
                  className="w-full px-2.5 py-1.5 border border-gray text-xs-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                  rows="4"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="Specify conditions for approval (e.g., 'Use only for non-critical parts', 'Additional inspection required before use', etc.)"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Production Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-2.5 py-1.5 border border-gray text-xs-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
                  value={productionStartDate}
                  onChange={(e) => setProductionStartDate(e.target.value)}
                />
              </div>

              <div className="bg-warning-50 border border-warning-200 text-warning-800 rounded p-4">
                <p className="text-body-2">
                  Materials will be approved with conditions. Manufacturing team must comply with specified conditions.
                </p>
              </div>
            </div>
          )}

          {/* Rejected */}
          {approvalStatus === 'rejected' && (
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500 ${
                    !rejectionReason.trim() ? 'border-error-500' : 'border-gray-300'
                  }`}
                  rows="4"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why materials are not ready for production..."
                  required
                />
                {!rejectionReason.trim() && (
                  <p className="text-error-600 text-sm mt-1">Rejection reason is required</p>
                )}
              </div>

              <div className="bg-error-50 border border-error-200 text-error-800 rounded p-4">
                <p className="text-body-2">
                  MRN request will be marked as <strong>REJECTED</strong>. Materials will NOT be available for production.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Approval Notes */}
        <div className="card p-6">
          <h2 className="text-display-6 font-semibold mb-4">Approval Notes (Optional)</h2>
          <hr className="border-border mb-4" />
          
          <textarea
            className="w-full px-2.5 py-1.5 border border-gray text-xs-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-blue-500"
            rows="4"
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Any additional notes or instructions for manufacturing team..."
          />
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
            className={`px-2 py-2 rounded text-white font-medium transition-colors ${
              approvalStatus === 'approved' 
                ? 'bg-success-600 hover:bg-success-700' 
                : approvalStatus === 'rejected' 
                  ? 'bg-error-600 hover:bg-error-700' 
                  : 'bg-warning-600 hover:bg-warning-700'
            } ${submitting || (approvalStatus === 'rejected' && !rejectionReason.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSubmitApproval}
            disabled={submitting || (approvalStatus === 'rejected' && !rejectionReason.trim())}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 inline animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                {approvalStatus === 'approved' && <Play className="w-5 h-5 inline mr-2" />}
                {approvalStatus === 'rejected' && <XCircle className="w-5 h-5 inline mr-2" />}
                {approvalStatus === 'conditional' && <CheckCircle className="w-5 h-5 inline mr-2" />}
                {approvalStatus === 'approved' 
                  ? 'Approve & Ready for Production' 
                  : approvalStatus === 'rejected' 
                    ? 'Submit Rejection' 
                    : 'Approve with Conditions'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionApprovalPage;