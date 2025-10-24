import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

const ProductionStagesDialog = ({ isOpen, onClose, order, handleUpdateStage, getStageIcon, getStageStatusColor }) => {
  if (!isOpen || !order) return null;

  const stages = order.stages || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-800">Production Stages: {order.productName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {stages.length === 0 ? (
            <p className="text-center text-gray-500">No stages available</p>
          ) : (
            <div className="space-y-3">
              {stages.map((stage, idx) => (
                <div key={stage.id} className={`p-4 rounded-lg border ${getStageStatusColor(stage.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStageIcon(stage.status)}
                      <div>
                        <h3 className="font-semibold">{stage.name}</h3>
                        <p className="text-sm opacity-75">Status: {stage.status.replace(/_/g, ' ').toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      {stage.startTime && <p>Started: {stage.startTime}</p>}
                      {stage.endTime && <p>Ended: {stage.endTime}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionStagesDialog;