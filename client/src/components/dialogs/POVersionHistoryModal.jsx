import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaHistory,
  FaUser,
  FaCalendar,
  FaBoxes,
  FaPercent,
  FaFileAlt,
  FaSpinner,
  FaCheckCircle
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const POVersionHistoryModal = ({ isOpen, onClose, poId, poNumber }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedChange, setExpandedChange] = useState(null);

  useEffect(() => {
    if (isOpen && poId) {
      fetchHistory();
    }
  }, [isOpen, poId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/procurement/pos/${poId}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching PO history:', error);
      toast.error('Failed to load change history');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <FaSpinner className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading version history...</p>
        </div>
      </div>
    );
  }

  if (!history) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex items-center justify-between border-b border-purple-800 z-10">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FaHistory size={24} />
              Version History
            </h2>
            <p className="text-purple-100 text-sm mt-1">{poNumber} - Version {history.current_version}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-500 rounded-lg transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-blue-600 text-xs font-semibold uppercase">Current Version</p>
              <p className="text-3xl font-bold text-blue-900">{history.current_version}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-purple-600 text-xs font-semibold uppercase">Total Changes</p>
              <p className="text-3xl font-bold text-purple-900">{history.total_changes}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <p className="text-orange-600 text-xs font-semibold uppercase">Last Edited</p>
              <p className="text-xs font-semibold text-orange-900 mt-2">
                {history.last_edited_at
                  ? new Date(history.last_edited_at).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>

          {/* Creation Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FaCheckCircle className="text-gray-600" size={18} />
              Original Creation
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 uppercase">Created By</p>
                <p className="font-semibold text-gray-900">
                  {history.created_by?.name || 'Unknown'}
                  {history.created_by?.employee_id && (
                    <span className="text-xs text-gray-600 ml-2">({history.created_by.employee_id})</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Created On</p>
                <p className="font-semibold text-gray-900">
                  {new Date(history.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Change History */}
          {history.change_history && history.change_history.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Change Timeline</h3>
              {history.change_history.map((change, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 transition-colors"
                >
                  {/* Change Summary */}
                  <button
                    onClick={() =>
                      setExpandedChange(expandedChange === index ? null : index)
                    }
                    className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition-colors text-left flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                          v{change.version_before} → v{change.version_after}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(change.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaUser size={14} className="text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {change.changed_by_name}
                        </span>
                      </div>
                      {change.reason && (
                        <p className="text-xs text-gray-600 mt-1 italic">{change.reason}</p>
                      )}
                    </div>
                    <div
                      className={`transition-transform duration-300 ${
                        expandedChange === index ? 'rotate-180' : ''
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedChange === index && (
                    <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                      <h4 className="font-bold text-gray-900">Changes Made:</h4>

                      {change.changes.items && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <p className="flex items-center gap-2 font-semibold text-blue-900 mb-2">
                            <FaBoxes size={16} />
                            Items Modified
                          </p>
                          <div className="space-y-1 text-sm text-blue-800">
                            <p>
                              Items changed from{' '}
                              <span className="font-bold">{change.changes.items.old_count}</span> to{' '}
                              <span className="font-bold">{change.changes.items.new_count}</span>
                            </p>
                            {change.changes.items.items_added > 0 && (
                              <p className="text-green-700">
                                +{change.changes.items.items_added} new item(s) added
                              </p>
                            )}
                            {change.changes.items.items_added < 0 && (
                              <p className="text-red-700">
                                {Math.abs(change.changes.items.items_added)} item(s) removed
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {change.changes.discount_percentage && (
                        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                          <p className="flex items-center gap-2 font-semibold text-orange-900 mb-2">
                            <FaPercent size={16} />
                            Discount Changed
                          </p>
                          <p className="text-sm text-orange-800">
                            From <span className="font-bold">{change.changes.discount_percentage.from}%</span> to{' '}
                            <span className="font-bold">{change.changes.discount_percentage.to}%</span>
                          </p>
                        </div>
                      )}

                      {change.changes.tax_percentage && (
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="flex items-center gap-2 font-semibold text-green-900 mb-2">
                            <FaPercent size={16} />
                            Tax Changed
                          </p>
                          <p className="text-sm text-green-800">
                            From <span className="font-bold">{change.changes.tax_percentage.from}%</span> to{' '}
                            <span className="font-bold">{change.changes.tax_percentage.to}%</span>
                          </p>
                        </div>
                      )}

                      {change.changes.payment_terms && (
                        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                          <p className="flex items-center gap-2 font-semibold text-indigo-900 mb-2">
                            <FaFileAlt size={16} />
                            Payment Terms Updated
                          </p>
                          <p className="text-sm text-indigo-800">
                            From: <span className="font-semibold">{change.changes.payment_terms.from || 'N/A'}</span>
                          </p>
                          <p className="text-sm text-indigo-800">
                            To: <span className="font-semibold">{change.changes.payment_terms.to || 'N/A'}</span>
                          </p>
                        </div>
                      )}

                      {change.changes.special_instructions && (
                        <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                          <p className="flex items-center gap-2 font-semibold text-pink-900 mb-2">
                            <FaFileAlt size={16} />
                            Special Instructions Updated
                          </p>
                          <p className="text-sm text-pink-800 italic">
                            "{change.changes.special_instructions.to}"
                          </p>
                        </div>
                      )}

                      {change.changes.approval_reset && (
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                          <p className="flex items-center gap-2 font-semibold text-red-900 mb-2">
                            ⚠️ Approval Reset
                          </p>
                          <p className="text-sm text-red-800">
                            {change.changes.approval_reset.reason}
                          </p>
                        </div>
                      )}

                      {change.changes.status && (
                        <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                          <p className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
                            📊 Status Changed
                          </p>
                          <p className="text-sm text-gray-800">
                            From: <span className="font-semibold uppercase">{change.changes.status.from}</span> →{' '}
                            <span className="font-semibold uppercase">{change.changes.status.to}</span>
                          </p>
                        </div>
                      )}

                      {/* Additional Changes */}
                      {Object.keys(change.changes).length > 0 && (
                        <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                          <p className="font-semibold text-gray-700 mb-2">All Changes:</p>
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(change.changes, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
              <FaHistory size={32} className="mx-auto mb-3 text-gray-400" />
              <p>No changes recorded for this purchase order yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default POVersionHistoryModal;