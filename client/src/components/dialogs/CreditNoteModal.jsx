import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaCheck,
  FaSpinner,
  FaTrash,
  FaPlus,
  FaMoneyBillWave,
  FaDollarSign,
  FaPercent,
  FaBox,
  FaUser,
  FaCalendar
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreditNoteModal = ({ isOpen, onClose, grnData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    credit_note_type: 'partial_credit',
    tax_percentage: 0,
    settlement_method: null,
    remarks: '',
    items: []
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    total: 0
  });

  useEffect(() => {
    if (isOpen && grnData) {
      // Pre-populate items with overage data
      const overageItems = (grnData.metadata?.items_affected || [])
        .filter(item => item.overage_qty > 0)
        .map(item => ({
          material_name: item.material_name,
          quantity: item.overage_qty,
          unit_price: item.unit_price || 0,
          total_price: (item.overage_qty || 0) * (item.unit_price || 0)
        }));
      
      setSelectedItems(overageItems);
      setFormData(prev => ({
        ...prev,
        items: overageItems
      }));
      calculateTotals(overageItems, 0);
    }
  }, [isOpen, grnData]);

  const calculateTotals = (items, taxPercentage) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const tax = (subtotal * taxPercentage) / 100;
    const total = subtotal + tax;

    setTotals({
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    });
  };

  const handleTaxChange = (e) => {
    const taxPercentage = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ ...prev, tax_percentage: taxPercentage }));
    calculateTotals(selectedItems, taxPercentage);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updatedItems);
    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateTotals(updatedItems, formData.tax_percentage);
  };

  const handleUpdateItem = (index, field, value) => {
    const updatedItems = [...selectedItems];
    updatedItems[index][field] = field === 'quantity' || field === 'unit_price' ? parseFloat(value) : value;
    
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setSelectedItems(updatedItems);
    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateTotals(updatedItems, formData.tax_percentage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedItems.length) {
      toast.error('Please add at least one item to the credit note');
      return;
    }

    if (!formData.settlement_method) {
      toast.error('Please select a settlement method');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        grn_id: grnData.metadata?.grn_id,
        credit_note_type: formData.credit_note_type,
        tax_percentage: formData.tax_percentage,
        settlement_method: formData.settlement_method,
        remarks: formData.remarks,
        items: selectedItems
      };

      const response = await api.post('/credit-notes/', payload);
      
      toast.success('Credit note created successfully');
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      setFormData({
        credit_note_type: 'partial_credit',
        tax_percentage: 0,
        settlement_method: null,
        remarks: '',
        items: []
      });
      setSelectedItems([]);
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create credit note';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const grnMetadata = grnData?.metadata || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Create Credit Note</h2>
              <p className="text-sm text-blue-100">Material Overage - GRN {grnMetadata.grn_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-2 rounded-lg transition"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* GRN & Vendor Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">GRN Number</label>
              <p className="text-sm font-bold text-slate-800">{grnMetadata.grn_number}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Vendor</label>
              <p className="text-sm font-bold text-slate-800">{grnMetadata.vendor_name}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">PO Number</label>
              <p className="text-sm font-bold text-slate-800">{grnMetadata.po_number}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Total Overage Value</label>
              <p className="text-sm font-bold text-orange-600">₹{grnMetadata.total_overage_value || 0}</p>
            </div>
          </div>

          {/* Credit Note Type & Settlement Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FaBox className="inline w-4 h-4 mr-2" />
                Credit Note Type
              </label>
              <select
                value={formData.credit_note_type}
                onChange={(e) => setFormData(prev => ({ ...prev, credit_note_type: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="partial_credit">Partial Credit</option>
                <option value="full_return">Full Return</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FaDollarSign className="inline w-4 h-4 mr-2" />
                Settlement Method
              </label>
              <select
                value={formData.settlement_method || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, settlement_method: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select settlement method</option>
                <option value="cash_credit">Cash Credit</option>
                <option value="return_material">Return Material</option>
                <option value="adjust_invoice">Adjust Invoice</option>
                <option value="future_deduction">Future Deduction</option>
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Overage Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Material Name</th>
                    <th className="px-4 py-2 text-center font-semibold text-slate-700">Quantity</th>
                    <th className="px-4 py-2 text-center font-semibold text-slate-700">Unit Price</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-700">Total</th>
                    <th className="px-4 py-2 text-center font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedItems.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.material_name}
                          onChange={(e) => handleUpdateItem(index, 'material_name', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleUpdateItem(index, 'unit_price', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        ₹{(item.total_price || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 font-semibold"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax & Totals */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                <FaPercent className="inline w-3 h-3 mr-1" />
                Tax Percentage
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.tax_percentage}
                onChange={handleTaxChange}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Subtotal</label>
              <p className="text-lg font-bold text-slate-800">₹{totals.subtotal}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Tax Amount</label>
              <p className="text-lg font-bold text-orange-600">₹{totals.tax}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Total</label>
              <p className="text-lg font-bold text-blue-600">₹{totals.total}</p>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="Add any remarks or notes about this credit note..."
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FaCheck className="w-4 h-4" />
                  Create Credit Note
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditNoteModal;
