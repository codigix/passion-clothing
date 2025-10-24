import React, { useState, useEffect } from 'react';
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const UpdateGRNPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grn, setGrn] = useState(null);

  const [formData, setFormData] = useState({
    received_date: '',
    inward_challan_number: '',
    supplier_invoice_number: '',
    items_received: [],
    remarks: '',
    attachments: []
  });

  useEffect(() => {
    fetchGRN();
  }, [id]);

  const fetchGRN = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/grn/${id}`);
      setGrn(response.data);

      // Pre-fill form with existing data
      setFormData({
        received_date: response.data.received_date ?
          new Date(response.data.received_date).toISOString().split('T')[0] : '',
        inward_challan_number: response.data.inward_challan_number || '',
        supplier_invoice_number: response.data.supplier_invoice_number || '',
        items_received: (response.data.items_received || []).map((item, index) => ({
          item_index: index,
          ordered_qty: item.ordered_quantity || 0,
          invoiced_qty: item.invoiced_quantity || item.ordered_quantity || 0,
          received_qty: item.received_quantity || 0,
          weight: item.weight || 0,
          remarks: item.remarks || ''
        })),
        remarks: response.data.remarks || '',
        attachments: response.data.attachments || []
      });
    } catch (error) {
      console.error('Error fetching GRN:', error);
      toast.error('Failed to load GRN data');
      navigate('/inventory/grn');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items_received];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      items_received: updatedItems
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.received_date) {
      toast.error('Please enter received date');
      return;
    }

    if (!formData.items_received.length) {
      toast.error('No items to update');
      return;
    }

    // Validate that all items have received quantities
    const invalidItems = formData.items_received.filter(item =>
      !item.received_qty || parseFloat(item.received_qty) <= 0
    );

    if (invalidItems.length > 0) {
      toast.error('All items must have received quantities greater than 0');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/grn/${id}/update-received`, formData);
      toast.success('GRN updated successfully! Ready for verification.');
      navigate('/inventory/grn');
    } catch (error) {
      console.error('Error updating GRN:', error);
      toast.error(error.response?.data?.message || 'Failed to update GRN');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!grn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">GRN Not Found</h2>
          <p className="text-gray-600">The requested GRN could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/inventory/grn')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="mr-2" />
                Back to GRNs
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Update GRN: {grn.grn_number}
                </h1>
                <p className="text-sm text-gray-600">
                  PO: {grn.purchaseOrder?.po_number} | Vendor: {grn.purchaseOrder?.vendor?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                Draft - Update Required
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Received Information</h3>
              <p className="mt-1 text-sm text-gray-600">Enter the actual received details</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Received Date *
                  </label>
                  <input
                    type="date"
                    value={formData.received_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, received_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inward Challan Number
                  </label>
                  <input
                    type="text"
                    value={formData.inward_challan_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, inward_challan_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                    placeholder="Enter challan number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Invoice Number
                  </label>
                  <input
                    type="text"
                    value={formData.supplier_invoice_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier_invoice_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                    placeholder="Enter invoice number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white shadow-sm rounded">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Received Items</h3>
              <p className="mt-1 text-sm text-gray-600">Update actual received quantities and details</p>
            </div>
            <div className="px-6 py-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ordered Qty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoiced Qty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Received Qty *
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight (kg)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items_received.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {grn.items_received[index]?.material_name || `Item ${index + 1}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {grn.items_received[index]?.color && `Color: ${grn.items_received[index].color}`}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.01"
                            value={item.ordered_qty}
                            onChange={(e) => handleItemChange(index, 'ordered_qty', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20"
                            readOnly
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.01"
                            value={item.invoiced_qty}
                            onChange={(e) => handleItemChange(index, 'invoiced_qty', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.01"
                            value={item.received_qty}
                            onChange={(e) => handleItemChange(index, 'received_qty', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20"
                            required
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.01"
                            value={item.weight}
                            onChange={(e) => handleItemChange(index, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20"
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20"
                            placeholder="Remarks"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-white shadow-sm rounded">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Additional Remarks</h3>
            </div>
            <div className="px-6 py-4">
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                placeholder="Any additional remarks or notes about the received items..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow-sm rounded">
            <div className="px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/inventory/grn')}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-opacity-20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-500 border border-transparent rounded text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FaSave className="mr-2" />
                    Update GRN & Submit for Verification
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateGRNPage;