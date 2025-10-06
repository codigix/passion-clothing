import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import BarcodeDisplay from '../BarcodeDisplay';

const STAGES = [
  { value: 'created', label: 'Created', color: 'bg-gray-100 text-gray-800' },
  { value: 'material_allocated', label: 'Material Allocated', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_production', label: 'In Production', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cutting', label: 'Cutting', color: 'bg-orange-100 text-orange-800' },
  { value: 'embroidery', label: 'Embroidery', color: 'bg-purple-100 text-purple-800' },
  { value: 'printing', label: 'Printing', color: 'bg-pink-100 text-pink-800' },
  { value: 'stitching', label: 'Stitching', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'finishing', label: 'Finishing', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'ironing', label: 'Ironing', color: 'bg-teal-100 text-teal-800' },
  { value: 'quality_check', label: 'Quality Check', color: 'bg-amber-100 text-amber-800' },
  { value: 'packing', label: 'Packing', color: 'bg-lime-100 text-lime-800' },
  { value: 'ready_for_dispatch', label: 'Ready for Dispatch', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'dispatched', label: 'Dispatched', color: 'bg-green-100 text-green-800' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-blue-100 text-blue-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-200 text-green-900' },
  { value: 'returned', label: 'Returned', color: 'bg-red-100 text-red-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-200 text-red-900' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'returned', label: 'Returned', color: 'bg-gray-100 text-gray-800' }
];

export default function ProductLifecycleTracker() {
  const [barcode, setBarcode] = useState('');
  const [lifecycle, setLifecycle] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTransitionForm, setShowTransitionForm] = useState(false);
  const [transitionData, setTransitionData] = useState({
    new_stage: '',
    new_status: 'active',
    location: '',
    machine_id: '',
    quantity_processed: '',
    quantity_approved: '',
    quantity_rejected: '',
    rejection_reasons: '',
    quality_parameters: '',
    cost_incurred: '',
    materials_consumed: '',
    notes: ''
  });

  const fetchLifecycle = async (barcodeValue) => {
    if (!barcodeValue.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/product-lifecycle/barcode/${barcodeValue}`);
      setLifecycle(response.data.lifecycle);
      setHistory(response.data.history);
      setShowTransitionForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch product lifecycle');
      setLifecycle(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    fetchLifecycle(barcode);
  };

  const handleTransition = async (e) => {
    e.preventDefault();
    
    if (!transitionData.new_stage) {
      toast.error('Please select a new stage');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/product-lifecycle/scan/${barcode}/transition`, transitionData);
      toast.success(response.data.message);
      
      // Refresh lifecycle data
      await fetchLifecycle(barcode);
      setShowTransitionForm(false);
      setTransitionData({
        new_stage: '',
        new_status: 'active',
        location: '',
        machine_id: '',
        quantity_processed: '',
        quantity_approved: '',
        quantity_rejected: '',
        rejection_reasons: '',
        quality_parameters: '',
        cost_incurred: '',
        materials_consumed: '',
        notes: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stage');
    } finally {
      setLoading(false);
    }
  };

  const getStageInfo = (stage) => {
    return STAGES.find(s => s.value === stage) || { label: stage, color: 'bg-gray-100 text-gray-800' };
  };

  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find(s => s.value === status) || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Barcode Scanner Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Product Lifecycle Tracker</h2>
        
        <form onSubmit={handleBarcodeSubmit} className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Scan or Enter Barcode</label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter product barcode..."
              className="w-full border border-gray-300 rounded px-3 py-2"
              autoFocus
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !barcode.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Product Information */}
      {lifecycle && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{lifecycle.product.name}</h3>
              <p className="text-gray-600">Code: {lifecycle.product.product_code}</p>
              <p className="text-gray-600">Category: {lifecycle.product.category}</p>
            </div>
            <div className="text-right">
              <div className="flex gap-2 mb-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStageInfo(lifecycle.current_stage).color}`}>
                  {getStageInfo(lifecycle.current_stage).label}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusInfo(lifecycle.current_status).color}`}>
                  {getStatusInfo(lifecycle.current_status).label}
                </span>
              </div>
              <button
                onClick={() => setShowTransitionForm(!showTransitionForm)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Update Stage
              </button>
            </div>
          </div>

          {/* Barcode Display */}
          <div className="mb-4">
            <BarcodeDisplay value={lifecycle.barcode} />
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Quantity:</span> {lifecycle.quantity}
            </div>
            <div>
              <span className="font-medium">Location:</span> {lifecycle.location || 'Not specified'}
            </div>
            <div>
              <span className="font-medium">Total Cost:</span> ₹{lifecycle.total_cost}
            </div>
            {lifecycle.customer && (
              <div>
                <span className="font-medium">Customer:</span> {lifecycle.customer.name}
              </div>
            )}
            {lifecycle.estimated_delivery_date && (
              <div>
                <span className="font-medium">Est. Delivery:</span> {formatDate(lifecycle.estimated_delivery_date)}
              </div>
            )}
            {lifecycle.actual_delivery_date && (
              <div>
                <span className="font-medium">Delivered:</span> {formatDate(lifecycle.actual_delivery_date)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage Transition Form */}
      {showTransitionForm && lifecycle && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Update Product Stage</h3>
          
          <form onSubmit={handleTransition} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Stage <span className="text-red-500">*</span></label>
                <select
                  value={transitionData.new_stage}
                  onChange={(e) => setTransitionData(prev => ({ ...prev, new_stage: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  <option value="">Select Stage</option>
                  {STAGES.map(stage => (
                    <option key={stage.value} value={stage.value}>{stage.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={transitionData.new_status}
                  onChange={(e) => setTransitionData(prev => ({ ...prev, new_status: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={transitionData.location}
                  onChange={(e) => setTransitionData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Workshop, Station, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Machine ID</label>
                <input
                  type="text"
                  value={transitionData.machine_id}
                  onChange={(e) => setTransitionData(prev => ({ ...prev, machine_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Machine or workstation ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity Processed</label>
                <input
                  type="number"
                  value={transitionData.quantity_processed}
                  onChange={(e) => setTransitionData(prev => ({ ...prev, quantity_processed: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cost Incurred</label>
                <input
                  type="number"
                  step="0.01"
                  value={transitionData.cost_incurred}
                  onChange={(e) => setTransitionData(prev => ({ ...prev, cost_incurred: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                rows={3}
                value={transitionData.notes}
                onChange={(e) => setTransitionData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Additional notes about this stage transition..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Stage'}
              </button>
              <button
                type="button"
                onClick={() => setShowTransitionForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lifecycle History */}
      {history.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Lifecycle History</h3>
          
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex gap-2 items-center mb-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStageInfo(entry.stage_to).color}`}>
                        {getStageInfo(entry.stage_to).label}
                      </span>
                      {entry.stage_from && (
                        <span className="text-xs text-gray-500">
                          from {getStageInfo(entry.stage_from).label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{formatDate(entry.transition_time)}</p>
                    {entry.operator && (
                      <p className="text-xs text-gray-500">Operator: {entry.operator.name}</p>
                    )}
                    {entry.location && (
                      <p className="text-xs text-gray-500">Location: {entry.location}</p>
                    )}
                    {entry.notes && (
                      <p className="text-sm mt-1">{entry.notes}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {entry.duration_in_previous_stage_hours && (
                      <p>Duration: {entry.duration_in_previous_stage_hours.toFixed(1)}h</p>
                    )}
                    {entry.cost_incurred > 0 && (
                      <p>Cost: ₹{entry.cost_incurred}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}