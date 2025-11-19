import React, { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
  FaUser,
  FaCalendar,
  FaFileAlt,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaPrint,
  FaDownload,
  FaHistory
} from 'react-icons/fa';
import { CreditCard } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreditNoteFlow = ({ creditNote, onUpdate, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [showActionModal, setShowActionModal] = useState(null);
  const [actionData, setActionData] = useState({
    response: '',
    settlement_notes: '',
    settlement_method: creditNote?.settlement_method || ''
  });

  useEffect(() => {
    loadStatusHistory();
  }, [creditNote?.id]);

  const loadStatusHistory = async () => {
    try {
      // Status history can be tracked from the model timestamps
      setStatusHistory([
        {
          status: creditNote?.status,
          timestamp: creditNote?.created_at,
          user: creditNote?.CreatedBy?.username || 'System',
          action: 'Created'
        },
        ...(creditNote?.issued_at ? [{
          status: 'issued',
          timestamp: creditNote.issued_at,
          user: creditNote?.IssuedBy?.username || 'System',
          action: 'Issued to Vendor'
        }] : []),
        ...(creditNote?.approved_at ? [{
          status: 'accepted',
          timestamp: creditNote.approved_at,
          user: creditNote?.ApprovedBy?.username || 'System',
          action: 'Accepted'
        }] : [])
      ]);
    } catch (error) {
      console.error('Error loading status history:', error);
    }
  };

  const handleStatusTransition = async (action) => {
    setLoading(true);
    try {
      const endpoint = `/credit-notes/${creditNote.id}/${action}`;
      const response = await api.post(endpoint, actionData);

      toast.success(`Credit note ${action} successfully`);
      setShowActionModal(null);
      setActionData({
        response: '',
        settlement_notes: '',
        settlement_method: creditNote?.settlement_method || ''
      });

      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${action} credit note`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const canTransition = {
    issue: creditNote?.status === 'draft',
    accept: creditNote?.status === 'issued',
    reject: creditNote?.status === 'issued',
    settle: creditNote?.status === 'accepted',
    cancel: ['draft', 'issued', 'accepted'].includes(creditNote?.status)
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700 border-slate-300',
    issued: 'bg-blue-100 text-blue-700 border-blue-300',
    accepted: 'bg-green-100 text-green-700 border-green-300',
    rejected: 'bg-red-100 text-red-700 border-red-300',
    settled: 'bg-purple-100 text-purple-700 border-purple-300',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  const statusIcons = {
    draft: FaClock,
    issued: FaFileAlt,
    accepted: FaCheckCircle,
    rejected: FaTimesCircle,
    settled: CreditCard,
    cancelled: FaTimes
  };

  const StatusIcon = statusIcons[creditNote?.status] || FaClock;

  return (
    <div className="space-y-6">
      {/* Credit Note Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaMoneyBillWave className="text-blue-600 w-6 h-6" />
              <h2 className="text-2xl font-bold text-slate-800">
                {creditNote?.credit_note_number}
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              GRN: {creditNote?.GRN?.grn_number} | PO: {creditNote?.PurchaseOrder?.po_number}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full border-2 font-bold flex items-center gap-2 ${statusColors[creditNote?.status]}`}>
            <StatusIcon className="w-4 h-4" />
            {creditNote?.status?.toUpperCase().replace('_', ' ')}
          </div>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-600 mb-1">Vendor</p>
            <p className="font-bold text-slate-800">{creditNote?.Vendor?.vendor_name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Credit Note Type</p>
            <p className="font-bold text-slate-800 capitalize">{creditNote?.credit_note_type?.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Settlement Method</p>
            <p className="font-bold text-slate-800 capitalize">{creditNote?.settlement_method?.replace('_', ' ') || 'Pending'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Total Amount</p>
            <p className="font-bold text-blue-600 text-lg">₹{creditNote?.total_amount?.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-slate-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Subtotal</p>
          <p className="text-2xl font-bold text-slate-800">₹{creditNote?.subtotal_amount?.toFixed(2)}</p>
        </div>
        <div className="bg-white border-2 border-slate-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Tax ({creditNote?.tax_percentage}%)</p>
          <p className="text-2xl font-bold text-orange-600">₹{creditNote?.tax_amount?.toFixed(2)}</p>
        </div>
        <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Total Amount</p>
          <p className="text-2xl font-bold text-blue-600">₹{creditNote?.total_amount?.toFixed(2)}</p>
        </div>
      </div>

      {/* Credit Note Items */}
      <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b-2 border-slate-200">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FaFileAlt className="w-4 h-4" />
            Credit Note Items
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Material</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Quantity</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Unit Price</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {creditNote?.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.material_name}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    ₹{item.unit_price?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">
                    ₹{(item.quantity * item.unit_price)?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FaHistory className="w-4 h-4" />
          Status History
        </h3>
        <div className="space-y-3">
          {statusHistory.map((history, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  history.status === 'draft' ? 'bg-slate-400' :
                  history.status === 'issued' ? 'bg-blue-500' :
                  history.status === 'accepted' ? 'bg-green-500' :
                  history.status === 'rejected' ? 'bg-red-500' :
                  history.status === 'settled' ? 'bg-purple-500' : 'bg-gray-400'
                }`}>
                  {idx + 1}
                </div>
                {idx < statusHistory.length - 1 && (
                  <div className="w-0.5 h-12 bg-slate-300 mt-2"></div>
                )}
              </div>
              <div className="flex-1 pt-1">
                <p className="font-bold text-slate-800">{history.action}</p>
                <p className="text-xs text-slate-600 mt-1">
                  By {history.user} on {new Date(history.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remarks */}
      {creditNote?.remarks && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-800 mb-2">Remarks</p>
          <p className="text-sm text-slate-700">{creditNote.remarks}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-slate-200">
        {canTransition.issue && (
          <button
            onClick={() => setShowActionModal('issue')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <FaArrowRight className="w-4 h-4" />
            Issue to Vendor
          </button>
        )}

        {canTransition.accept && (
          <button
            onClick={() => setShowActionModal('accept')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <FaCheck className="w-4 h-4" />
            Accept
          </button>
        )}

        {canTransition.reject && (
          <button
            onClick={() => setShowActionModal('reject')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <FaTimes className="w-4 h-4" />
            Reject
          </button>
        )}

        {canTransition.settle && (
          <button
            onClick={() => setShowActionModal('settle')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Settle
          </button>
        )}

        {canTransition.cancel && (
          <button
            onClick={() => setShowActionModal('cancel')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <FaTimes className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 capitalize">
              {showActionModal === 'issue' && 'Issue Credit Note to Vendor'}
              {showActionModal === 'accept' && 'Accept Credit Note'}
              {showActionModal === 'reject' && 'Reject Credit Note'}
              {showActionModal === 'settle' && 'Settle Credit Note'}
              {showActionModal === 'cancel' && 'Cancel Credit Note'}
            </h3>

            <div className="space-y-4">
              {(showActionModal === 'reject' || showActionModal === 'cancel') && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={actionData.response}
                    onChange={(e) => setActionData(prev => ({ ...prev, response: e.target.value }))}
                    placeholder="Please provide a reason..."
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {showActionModal === 'settle' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Settlement Method
                    </label>
                    <select
                      value={actionData.settlement_method}
                      onChange={(e) => setActionData(prev => ({ ...prev, settlement_method: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select method</option>
                      <option value="cash_credit">Cash Credit</option>
                      <option value="return_material">Return Material</option>
                      <option value="adjust_invoice">Adjust Invoice</option>
                      <option value="future_deduction">Future Deduction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Settlement Notes
                    </label>
                    <textarea
                      value={actionData.settlement_notes}
                      onChange={(e) => setActionData(prev => ({ ...prev, settlement_notes: e.target.value }))}
                      placeholder="Add settlement details..."
                      rows="3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  setActionData({
                    response: '',
                    settlement_notes: '',
                    settlement_method: creditNote?.settlement_method || ''
                  });
                }}
                disabled={loading}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusTransition(showActionModal)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditNoteFlow;
