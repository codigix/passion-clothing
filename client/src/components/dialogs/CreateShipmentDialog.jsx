import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const CreateShipmentDialog = ({ order, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [courierPartners, setCourierPartners] = useState([]);
  const [fetchingCouriers, setFetchingCouriers] = useState(true);

  const [formData, setFormData] = useState({
    courier_company: '',
    tracking_number: '',
    expected_delivery_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchCourierPartners();
  }, []);

  const fetchCourierPartners = async () => {
    try {
      setFetchingCouriers(true);
      const response = await api.get('/courier-partners?is_active=true');
      setCourierPartners(response.data.courierPartners || []);
    } catch (error) {
      console.error('Failed to fetch courier partners:', error);
    } finally {
      setFetchingCouriers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.courier_company.trim()) {
      toast.error('Please enter a courier company');
      return false;
    }

    if (!formData.tracking_number.trim()) {
      toast.error('Please enter a tracking number');
      return false;
    }

    if (!formData.expected_delivery_date) {
      toast.error('Please select an expected delivery date');
      return false;
    }

    const deliveryDate = new Date(formData.expected_delivery_date);
    const today = new Date();
    if (deliveryDate < today) {
      toast.error('Delivery date must be in the future');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Call the shipment creation API
      const response = await api.post(`/shipments/create-from-order/${order.id}`, {
        courier_company: formData.courier_company,
        tracking_number: formData.tracking_number,
        expected_delivery_date: formData.expected_delivery_date,
        notes: formData.notes
      });

      toast.success('Shipment created successfully!');
      
      if (onSuccess) {
        onSuccess(response.data.shipment);
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const getMinDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const customerName = order.customer_name || order.customer?.name || 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Create Shipment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Order Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  Order: {order.sales_order_number || order.order_number}
                </p>
                <p className="text-sm text-blue-800">Customer: {customerName}</p>
              </div>
            </div>
          </div>

          <form id="createShipmentForm" onSubmit={handleSubmit} className="space-y-4">
            {/* Courier Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Courier Company <span className="text-red-500">*</span>
              </label>
              <select
                name="courier_company"
                value={formData.courier_company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                disabled={fetchingCouriers}
              >
                <option value="">Select a courier...</option>
                {courierPartners.map(courier => (
                  <option key={courier.id} value={courier.name || courier.id}>
                    {courier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tracking Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tracking_number"
                placeholder="e.g., TRK-123456789"
                value={formData.tracking_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                required
              />
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Expected Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expected_delivery_date"
                value={formData.expected_delivery_date}
                onChange={handleInputChange}
                min={getMinDeliveryDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Special Instructions
              </label>
              <textarea
                name="notes"
                placeholder="e.g., Fragile, Handle with care"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="createShipmentForm"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || fetchingCouriers}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Create Shipment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShipmentDialog;