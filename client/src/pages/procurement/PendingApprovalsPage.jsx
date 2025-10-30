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
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import api from '../../utils/api';
import { formatINR, formatDate, safePath } from '../../utils/procurementFormatters';
import { PRIORITY_BADGES } from '../../constants/procurementStatus';
import { useAuth } from '../../contexts/AuthContext';

const PendingApprovalsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingPOs, setPendingPOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    urgent: 0
  });

  // Check if user is admin
  const isAdmin = user?.department === 'admin' || user?.role === 'admin';

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
    const badge = PRIORITY_BADGES[priority?.toLowerCase()] || PRIORITY_BADGES.medium;
    return `${badge.color} ${badge.text} border-2 ${badge.border}`;
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Approvals</h1>
        <p className="text-gray-600">Review and approve purchase orders waiting for authorization</p>
        
        {/* Admin-Only Notice */}
        {!isAdmin && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">View Only Access</p>
              <p className="text-xs text-yellow-700 mt-1">
                PO approval is restricted to Admin department only. You can view pending approvals but cannot approve or reject them.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatINR(stats.totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Urgent Priority</p>
              <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* PO List */}
      {pendingPOs.length === 0 ? (
        <div className="bg-white rounded shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up! 🎉</h3>
          <p className="text-gray-600">No purchase orders pending approval at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPOs.map((po) => (
            <div key={po.id} className="bg-white rounded shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {po.po_number || `PO-${po.id}`}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityBadge(po.priority)}`}>
                      {PRIORITY_BADGES[po.priority?.toLowerCase()]?.label || 'Medium'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Building2 size={14} />
                      <span className="truncate">{safePath(po, 'vendor.name', 'Unknown Vendor')}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <User size={14} />
                      <span className="truncate">{safePath(po, 'customer.name', safePath(po, 'client_name', 'Unknown Customer'))}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>Expected: {formatDate(po.expected_delivery_date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Package size={14} />
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
                    {formatINR(po.final_amount)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewDetails(po.id)}
                  className="flex items-center gap-1.5 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex-1"
                >
                  <Eye size={14} />
                  View Order Details to Approve
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleReject(po.id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                )}

                {!isAdmin && (
                  <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 bg-gray-50 rounded border border-gray-200">
                    <ShieldAlert size={12} />
                    <span>Admin only</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default PendingApprovalsPage;