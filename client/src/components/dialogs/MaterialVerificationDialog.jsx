import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const MaterialVerificationDialog = ({ isOpen, onClose, order, onConfirm }) => {
  const [notes, setNotes] = useState('');

  if (!isOpen || !order) return null;

  const handleConfirm = () => {
    onConfirm();
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Material Verification</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any verification notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-semibold">Materials Ready</p>
              <p>All required materials are available for production.</p>
            </div>
          </div>
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
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Confirm Verification
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialVerificationDialog;