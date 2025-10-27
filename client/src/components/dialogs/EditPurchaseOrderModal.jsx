import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaPlus,
  FaTrash2,
  FaSave,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EditPurchaseOrderModal = ({ isOpen, onClose, purchaseOrder, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    material_name: '',
    description: '',
    quantity: '',
    unit_price: '',
    unit: 'meters'
  });
  const [editReason, setEditReason] = useState('');

  useEffect(() => {
    if (isOpen && purchaseOrder) {
      setFormData({
        expected_delivery_date: purchaseOrder.expected_delivery_date,
        discount_percentage: purchaseOrder.discount_percentage || 0,
        tax_percentage: purchaseOrder.tax_percentage || 0,
        payment_terms: purchaseOrder.payment_terms || '',
        delivery_address: purchaseOrder.delivery_address || '',
        special_instructions: purchaseOrder.special_instructions || '',
        internal_notes: purchaseOrder.internal_notes || ''
      });
      setItems(purchaseOrder.items || []);
      setEditReason('');
    }
  }, [isOpen, purchaseOrder]);

  const handleAddItem = () => {
    if (!newItem.material_name || !newItem.quantity || !newItem.unit_price) {
      toast.error('Please fill in all required item fields');
      return;
    }

    const itemToAdd = {
      ...newItem,
      quantity: parseFloat(newItem.quantity),
      unit_price: parseFloat(newItem.unit_price),
      total_price: parseFloat(newItem.quantity) * parseFloat(newItem.unit_price)
    };

    setItems([...items, itemToAdd]);
    setNewItem({
      material_name: '',
      description: '',
      quantity: '',
      unit_price: '',
      unit: 'meters'
    });
    toast.success('Item added');
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    toast.success('Item removed');
  };

  const handleUpdateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = field === 'quantity' || field === 'unit_price' ? parseFloat(value) : value;
    
    // Recalculate total
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setItems(updatedItems);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field.includes('percentage') ? parseFloat(value) : value
    }));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      toast.error('Purchase order must have at least one item');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        editMode: true,
        items,
        ...formData,
        edit_reason: editReason
      };

      const response = await api.patch(`/procurement/pos/${purchaseOrder.id}`, updateData);
      
      toast.success('Purchase order updated successfully');
      if (onSave) {
        onSave(response.data.purchaseOrder);
      }
      onClose();
    } catch (error) {
      console.error('Error updating PO:', error);
      toast.error(error.response?.data?.message || 'Failed to update purchase order');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !formData) return null;

  // Calculate totals
  const itemsTotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const discountAmount = (itemsTotal * (formData.discount_percentage || 0)) / 100;
  const taxAmount = ((itemsTotal - discountAmount) * (formData.tax_percentage || 0)) / 100;
  const finalAmount = itemsTotal - discountAmount + taxAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between border-b border-blue-800 z-10">
          <div>
            <h2 className="text-2xl font-bold">Edit Purchase Order</h2>
            <p className="text-blue-100 text-sm mt-1">{purchaseOrder?.po_number}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning if requires re-approval */}
          {purchaseOrder?.requires_reapproval && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h3 className="font-semibold text-amber-900">Requires Re-approval</h3>
                <p className="text-amber-800 text-sm mt-1">
                  This PO has been modified and will need to be re-submitted for approval after your changes.
                </p>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaCheck className="text-blue-600" size={18} />
              Purchase Order Items
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto mb-4">
              {items.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="grid grid-cols-6 gap-2 mb-2 text-xs">
                    <input
                      type="text"
                      placeholder="Material Name"
                      value={item.material_name}
                      onChange={(e) => handleUpdateItem(index, 'material_name', e.target.value)}
                      className="col-span-2 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unit_price}
                      onChange={(e) => handleUpdateItem(index, 'unit_price', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <div className="px-2 py-1 bg-blue-50 rounded font-semibold text-blue-700">
                      ₹{(item.total_price || 0).toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors font-semibold text-xs flex items-center justify-center gap-1"
                    >
                      <FaTrash2 size={12} /> Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description || ''}
                    onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Add New Item */}
            <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaPlus className="text-blue-600" size={16} />
                Add New Item
              </h4>
              <div className="grid grid-cols-6 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Material Name"
                  value={newItem.material_name}
                  onChange={(e) => setNewItem({ ...newItem, material_name: e.target.value })}
                  className="col-span-2 px-3 py-2 border border-blue-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={newItem.unit_price}
                  onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                  className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="meters">Meters</option>
                  <option value="kg">Kg</option>
                  <option value="pieces">Pieces</option>
                  <option value="boxes">Boxes</option>
                </select>
                <button
                  onClick={handleAddItem}
                  className="col-span-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-1 text-sm"
                >
                  <FaPlus size={14} /> Add
                </button>
              </div>
              <input
                type="text"
                placeholder="Item Description (optional)"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3">Cost Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Items Total:</span>
                <span className="font-semibold">₹{itemsTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Discount:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount_percentage}
                    onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-gray-600">%</span>
                </div>
                <span className="font-semibold text-red-600">-₹{discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Tax:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.tax_percentage}
                    onChange={(e) => handleInputChange('tax_percentage', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-gray-600">%</span>
                </div>
                <span className="font-semibold text-green-600">+₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">Final Amount:</span>
                <span className="font-bold text-blue-600">₹{finalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Other Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Delivery Date</label>
              <input
                type="date"
                value={formData.expected_delivery_date?.split('T')[0] || ''}
                onChange={(e) => handleInputChange('expected_delivery_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Terms</label>
              <input
                type="text"
                value={formData.payment_terms}
                onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                placeholder="e.g., Net 30"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address</label>
            <textarea
              value={formData.delivery_address}
              onChange={(e) => handleInputChange('delivery_address', e.target.value)}
              placeholder="Enter delivery address"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
            <textarea
              value={formData.special_instructions}
              onChange={(e) => handleInputChange('special_instructions', e.target.value)}
              placeholder="Enter any special instructions"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Edit Reason (optional)</label>
            <textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="Why are you making these changes? (This will be recorded in history)"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
              rows="2"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || items.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold flex items-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" size={16} />
                Saving...
              </>
            ) : (
              <>
                <FaSave size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPurchaseOrderModal;