import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Truck,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Package,
  Calendar,
  User,
  MapPin,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const CreateShipmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderFromManufacturing;

  const [loading, setLoading] = useState(false);
  const [courierPartners, setCourierPartners] = useState([]);
  const [courierAgents, setCourierAgents] = useState([]);
  const [fetchingCouriers, setFetchingCouriers] = useState(true);
  const [fetchingAgents, setFetchingAgents] = useState(false);
  const [showCourierDropdown, setShowCourierDropdown] = useState(false);
  const [courierSearchInput, setCourierSearchInput] = useState('');
  const [shipmentCreated, setShipmentCreated] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState({
    courier_company: '',
    courier_agent_id: '',
    agent_id: '',
    tracking_number: '',
    expected_delivery_date: '',
    notes: '',
    shipping_address: '',
    recipient_name: '',
    recipient_phone: '',
    recipient_email: ''
  });

  useEffect(() => {
    if (!orderData) {
      toast.error('No order selected');
      navigate('/shipment');
      return;
    }
    
    const populateRecipientDetails = () => {
      const recipientName = orderData.customer_name || orderData.customer?.name || '';
      const recipientPhone = orderData.customer?.phone || '';
      const recipientEmail = orderData.customer?.email || '';
      const shippingAddress = orderData.delivery_address || orderData.customer?.address || '';
      
      setFormData(prev => ({
        ...prev,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_email: recipientEmail,
        shipping_address: shippingAddress
      }));
    };
    
    populateRecipientDetails();
    fetchCourierPartners();
  }, [orderData, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCourierDropdown && !event.target.closest('.relative')) {
        setShowCourierDropdown(false);
      }
    };

    if (showCourierDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCourierDropdown]);

  const fetchCourierPartners = async () => {
    try {
      setFetchingCouriers(true);
      const response = await api.get('/courier-partners?is_active=true');
      setCourierPartners(response.data.courierPartners || []);
    } catch (error) {
      console.error('Failed to fetch courier partners:', error);
      toast.error('Failed to load courier partners');
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

  const handleSelectChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'courier_company' && { courier_agent_id: '', agent_id: '' })
    }));

    if (name === 'courier_company' && value) {
      await fetchAgentsForCompany(value);
    }
  };

  const handleCourierCompanySearch = (value) => {
    setCourierSearchInput(value);
    setFormData(prev => ({
      ...prev,
      courier_company: value,
      courier_agent_id: '',
      agent_id: ''
    }));
    setShowCourierDropdown(true);
  };

  const generateTrackingNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TRK-${timestamp}-${random}`;
  };

  const selectCourierCompany = async (courierName) => {
    const trackingNumber = generateTrackingNumber();
    setFormData(prev => ({
      ...prev,
      courier_company: courierName,
      courier_agent_id: '',
      agent_id: '',
      tracking_number: trackingNumber
    }));
    setCourierSearchInput('');
    setShowCourierDropdown(false);
    await fetchAgentsForCompany(courierName);
  };

  const clearCourierCompany = () => {
    setFormData(prev => ({
      ...prev,
      courier_company: '',
      courier_agent_id: '',
      agent_id: ''
    }));
    setCourierSearchInput('');
    setCourierAgents([]);
  };

  const filteredCouriers = courierPartners.filter(courier =>
    (courier.name || '').toLowerCase().includes(courierSearchInput.toLowerCase())
  );

  const fetchAgentsForCompany = async (company) => {
    try {
      setFetchingAgents(true);
      const response = await api.get(`/courier-agents/by-company/${encodeURIComponent(company)}`);
      setCourierAgents(response.data.agents || []);
      if (response.data.agents?.length === 0) {
        toast.success('No agents available for this company');
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setCourierAgents([]);
      toast.error('Failed to fetch agents for this company');
    } finally {
      setFetchingAgents(false);
    }
  };

  const handleAgentChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.courier_company.trim()) {
      toast.error('Please select a courier company');
      return false;
    }

    if (!formData.courier_agent_id && courierAgents.length > 0) {
      toast.error('Please select a courier agent');
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

    const shippingAddress = (formData.shipping_address || orderData?.delivery_address || '').trim();
    if (!shippingAddress) {
      toast.error('Please provide a shipping address');
      return false;
    }

    if (!formData.recipient_name.trim()) {
      toast.error('Please enter recipient name');
      return false;
    }

    if (!formData.recipient_phone.trim()) {
      toast.error('Please enter recipient phone');
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

    if (!window.confirm('Create shipment for this order?')) {
      return;
    }

    try {
      setLoading(true);

      const salesOrderId = orderData.sales_order_id || orderData.id;
      
      const response = await api.post(`/shipments/create-from-order/${salesOrderId}`, {
        courier_company: formData.courier_company,
        tracking_number: formData.tracking_number,
        expected_delivery_date: formData.expected_delivery_date,
        notes: formData.notes,
        shipping_address: formData.shipping_address || orderData?.delivery_address || '',
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        recipient_email: formData.recipient_email
      });

      setShipmentCreated({
        ...response.data.shipment,
        orderInfo: orderData,
        formData: formData
      });
      setShowConfirmation(true);
      toast.success('Shipment created successfully!');
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

  // Confirmation Screen
  if (showConfirmation && shipmentCreated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Shipment Created!</h1>
            <p className="text-sm text-gray-600 mt-2">Your shipment is now ready for dispatch</p>
          </div>

          {/* Details Cards */}
          <div className="space-y-4 mb-6">
            {/* Order & Shipment Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order Info */}
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-2">Order Information</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Order Number</p>
                      <p className="font-semibold text-gray-900">{shipmentCreated.orderInfo?.sales_order_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="font-semibold text-gray-900">{shipmentCreated.orderInfo?.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="font-bold text-lg text-gray-900">{shipmentCreated.orderInfo?.quantity || 0} <span className="text-sm font-normal text-gray-600">units</span></p>
                    </div>
                  </div>
                </div>

                {/* Shipment Info */}
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-2">Shipment Details</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Courier</p>
                      <p className="font-semibold text-gray-900">{shipmentCreated.formData?.courier_company}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tracking Number</p>
                      <p className="font-mono font-semibold text-gray-900 bg-gray-50 rounded px-2 py-1 inline-block">{shipmentCreated.formData?.tracking_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expected Delivery</p>
                      <p className="font-semibold text-gray-900">{new Date(shipmentCreated.formData?.expected_delivery_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 font-semibold mb-3">Recipient Address</p>
              <div className="bg-gray-50 rounded p-3 mb-3 text-sm text-gray-900 leading-relaxed">
                {shipmentCreated.formData?.shipping_address}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Name</p>
                  <p className="text-gray-900 mt-1">{shipmentCreated.formData?.recipient_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Phone</p>
                  <p className="text-gray-900 mt-1">{shipmentCreated.formData?.recipient_phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/shipment')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition text-sm shadow-sm"
            >
              View Dashboard
            </button>
            <button
              onClick={() => {
                setShowConfirmation(false);
                setShipmentCreated(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-100 transition text-sm"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-sm w-full shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-gray-700" />
            <h2 className="font-semibold text-gray-900">No Order Selected</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Please go back to the shipment dashboard and select an order to create a shipment.</p>
          <button
            onClick={() => navigate('/shipment')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition text-sm"
          >
            Back to Shipments
          </button>
        </div>
      </div>
    );
  }

  const customerName = orderData.customer_name || orderData.customer?.name || 'N/A';
  const customerEmail = orderData.customer?.email || 'N/A';
  const customerPhone = orderData.customer?.phone || 'N/A';
  const deliveryAddress = orderData.delivery_address || orderData.customer?.address || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/shipment')}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-3 text-sm font-medium transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Shipment</h1>
          <p className="text-sm text-gray-600 mt-1">Order: <span className="font-semibold text-gray-900">{orderData.sales_order_number || orderData.order_number}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Order Summary - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Order Summary</h2>
              </div>
              
              <div className="space-y-3 text-sm divide-y divide-gray-100">
                <div className="pb-3">
                  <p className="text-xs text-gray-600 font-semibold">Order Number</p>
                  <p className="font-bold text-gray-900 mt-0.5">{orderData.sales_order_number || orderData.order_number}</p>
                </div>

                <div className="pt-3 pb-3">
                  <p className="text-xs text-gray-600 font-semibold">Customer</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{customerName}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{customerEmail}</p>
                </div>

                <div className="pt-3 pb-3">
                  <p className="text-xs text-gray-600 font-semibold">Product Type</p>
                  <p className="text-sm text-gray-900 mt-0.5">{orderData.product_name || orderData.garment_specs?.product_type || 'N/A'}</p>
                </div>

                <div className="pt-3 pb-3">
                  <p className="text-xs text-gray-600 font-semibold">Quantity</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-bold text-gray-900">{orderData.quantity || orderData.total_quantity || 0}</span>
                    <span className="text-xs text-gray-600">units</span>
                  </div>
                </div>

                {deliveryAddress && (
                  <div className="pt-3">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Delivery Address</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{deliveryAddress}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form - Right */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Courier Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Courier Details</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Courier Company</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={courierSearchInput}
                        onChange={(e) => handleCourierCompanySearch(e.target.value)}
                        placeholder="Search courier..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm transition"
                        disabled={fetchingCouriers}
                      />
                      {formData.courier_company && (
                        <button
                          type="button"
                          onClick={clearCourierCompany}
                          className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                          title="Clear selection"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {showCourierDropdown && filteredCouriers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-md z-10 max-h-40 overflow-y-auto">
                        {filteredCouriers.map((courier) => (
                          <button
                            key={courier.id}
                            type="button"
                            onClick={() => selectCourierCompany(courier.name)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-900 border-b border-gray-100 last:border-0 transition"
                          >
                            {courier.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {formData.courier_company && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded text-sm font-medium text-green-900">
                      ✓ {formData.courier_company} selected
                    </div>
                  )}

                  {/* Courier Agent */}
                  {courierAgents.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Agent Location</label>
                      <select
                        name="courier_agent_id"
                        value={formData.courier_agent_id}
                        onChange={handleAgentChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm transition"
                      >
                        <option value="">Select agent...</option>
                        {courierAgents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} - {agent.location || 'N/A'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tracking Number</label>
                      <input
                        type="text"
                        name="tracking_number"
                        value={formData.tracking_number}
                        onChange={handleInputChange}
                        placeholder="Auto-generated"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none text-sm bg-gray-50 text-gray-600 cursor-not-allowed font-mono"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Expected Delivery</label>
                      <input
                        type="date"
                        name="expected_delivery_date"
                        value={formData.expected_delivery_date}
                        onChange={handleInputChange}
                        min={getMinDeliveryDate()}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Recipient Details</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      name="recipient_name"
                      value={formData.recipient_name}
                      onChange={handleInputChange}
                      placeholder="Recipient name"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        name="recipient_phone"
                        value={formData.recipient_phone}
                        onChange={handleInputChange}
                        placeholder="Phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                      <input
                        type="email"
                        name="recipient_email"
                        value={formData.recipient_email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Shipping Address</label>
                    <textarea
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      placeholder="Full shipping address"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm resize-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Special Instructions</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Handle with care / Fragile items / etc."
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm resize-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || fetchingCouriers}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm shadow-sm"
              >
                {loading ? 'Creating Shipment...' : '+ Create Shipment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShipmentPage;