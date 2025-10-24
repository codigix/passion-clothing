import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

const QualityCheckDialog = ({ isOpen, onClose, order, onComplete }) => {
  const [passed, setPassed] = useState(true);
  const [reason, setReason] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = () => {
    onComplete(passed, reason);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Quality Check</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Order:</span> {order.productName} (Qty: {order.quantity})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Quality Check Result</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={passed}
                  onChange={() => { setPassed(true); setReason(''); }}
                  className="w-4 h-4 text-green-600"
                />
                <span className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Passed - Product meets quality standards</span>
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!passed}
                  onChange={() => setPassed(false)}
                  className="w-4 h-4 text-red-600"
                />
                <span className="flex items-center space-x-2 text-red-700">
                  <XCircle className="w-4 h-4" />
                  <span>Rejected - Product needs rework</span>
                </span>
              </label>
            </div>
          </div>

          {!passed && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the quality issues..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="4"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-white rounded transition ${
              passed ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {passed ? 'Confirm Pass' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QualityCheckDialog;