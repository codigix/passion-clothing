import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Package, 
  Calendar, 
  DollarSign,
  AlertCircle,
  FileText,
  User,
  Building2,
  TrendingUp
} from 'lucide-react';
import api from '../../utils/api';

const PendingApprovalsPage = () => {
  const navigate = useNavigate();
  const [pendingPOs, setPendingPOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    urgent: 0
  });

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/procurement/pos', {
        params: { status: 'pending_approval' }
      });
      
      const pos = response.data.purchaseOrders || response.data.pos || [];
      setPendingPOs(pos);

      // Calculate stats
      const totalValue = pos.reduce((sum, po) => sum + (parseFloat(po.final_amount) || 0), 0);
      const urgentCount = pos.filter(po => po.priority === 'high' || po.priority === 'urgent').length;

      setStats({
        total: pos.length,
        totalValue,
        urgent: urgentCount
      });
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (po) => {
    setSelectedPO(po);
    setShowApprovalModal(true);
  };

  const handleReject = async (poId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.patch(`/procurement/pos/${poId}`, {
        status: 'rejected',
        approval_decision_note: reason
      });
      
      alert('Purchase Order rejected successfully');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error rejecting PO:', error);
      alert('Failed to reject PO');
    }
  };

  const handleViewDetails = (poId) => {
    navigate(`/procurement/purchase-orders/${poId}`);
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return badges[priority] || badges.medium;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Approvals</h1>
        <p className="text-gray-600">Review and approve purchase orders waiting for authorization</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Urgent Priority</p>
              <p className="text-3xl font-bold text-gray-900">{stats.urgent}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* PO List */}
      {pendingPOs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up! 🎉</h3>
          <p className="text-gray-600">No purchase orders pending approval at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPOs.map((po) => (
            <div key={po.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {po.po_number || `PO-${po.id}`}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityBadge(po.priority)}`}>
                      {(po.priority || 'medium').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span className="truncate">{po.vendor?.name || 'Unknown Vendor'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="truncate">{po.customer?.name || po.client_name || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Expected: {formatDate(po.expected_delivery_date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>{po.items?.length || 0} items</span>
                    </div>
                  </div>

                  {po.project_name && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Project:</span> {po.project_name}
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(po.final_amount)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewDetails(po.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>

                <button
                  onClick={() => handleApprove(po)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Order
                </button>

                <button
                  onClick={() => handleReject(po.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedPO && (
        <ApprovalModal
          po={selectedPO}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedPO(null);
          }}
          onSuccess={() => {
            setShowApprovalModal(false);
            setSelectedPO(null);
            fetchPendingApprovals();
          }}
        />
      )}
    </div>
  );
};

// Approval Modal Component - UPDATED FOR NEW GRN WORKFLOW
const ApprovalModal = ({ po, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      
      const response = await api.post(
        `/procurement/pos/${po.id}/approve`,
        {
          notes: notes || `Approved via Pending Approvals on ${new Date().toLocaleDateString()}`
        }
      );

      alert(`✅ Purchase Order approved and automatically sent to vendor! When materials arrive, create a GRN for quality verification.`);
      onSuccess();
    } catch (error) {
      console.error('Error approving PO:', error);
      alert(`❌ Error: ${error.response?.data?.message || 'Failed to approve PO'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Approve Purchase Order</h2>
          <p className="text-sm text-gray-600 mt-1">
            PO: {po.po_number || `PO-${po.id}`} • {po.vendor?.name}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Items Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
              {po.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.fabric_name || item.item_name || item.description || 'Unnamed Item'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.color && `Color: ${item.color} • `}
                      {item.gsm && `GSM: ${item.gsm} • `}
                      Qty: {item.quantity} {item.uom}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{(parseFloat(item.total) || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this approval..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Summary - Automated workflow */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border-l-4 border-blue-600">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">🔄 Automated Workflow - What happens when you approve:</p>
                <ul className="list-disc list-inside space-y-1.5 text-blue-800">
                  <li><strong>✅ Instant:</strong> PO automatically sent to vendor (status: "Sent")</li>
                  <li><strong>📦 When materials arrive:</strong> Store team creates GRN (Goods Receipt Note)</li>
                  <li><strong>🔍 Quality Check:</strong> GRN verified for quantity, weight, and quality</li>
                  <li><strong>💾 Final Step:</strong> Verified materials added to inventory</li>
                </ul>
                <p className="mt-3 px-3 py-2 bg-white/70 rounded text-xs text-blue-800 font-medium border border-blue-200">
                  💡 <strong>Note:</strong> Materials will NOT be added to inventory immediately. They'll be added only after GRN quality verification is complete.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve Purchase Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalsPage;