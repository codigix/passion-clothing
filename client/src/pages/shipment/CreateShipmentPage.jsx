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
  X,
  Star,
  Phone,
  Mail,
  MapPin as LocationIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const CreateShipmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderFromManufacturing;

  const [loading, setLoading] = useState(false);
  const [courierAgents, setCourierAgents] = useState([]);
  const [fetchingAgents, setFetchingAgents] = useState(true);
  const [shipmentCreated, setShipmentCreated] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [selectedAgent, setSelectedAgent] = useState(null);
  
  const [formData, setFormData] = useState({
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
    fetchAllCourierAgents();
  }, [orderData, navigate]);

  const fetchAllCourierAgents = async () => {
    try {
      setFetchingAgents(true);
      const response = await api.get('/courier-agents?is_active=true');
      setCourierAgents(response.data.agents || []);
    } catch (error) {
      console.error('Failed to fetch courier agents:', error);
      toast.error('Failed to load courier agents');
    } finally {
      setFetchingAgents(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateTrackingNumber = (agent = null) => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // If agent is selected, include agent code in tracking number
    if (agent?.agent_id) {
      return `${agent.agent_id}-${timestamp}-${random}`;
    }
    
    return `TRK-${timestamp}-${random}`;
  };

  const handleAgentChange = (e) => {
    const { name, value } = e.target;
    
    // Find the selected agent from the list
    const agent = courierAgents.find(a => a.id.toString() === value);
    
    if (agent) {
      setSelectedAgent(agent);
      
      // Generate tracking number with agent code
      const trackingNumber = generateTrackingNumber(agent);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        tracking_number: trackingNumber,
        agent_id: agent.agent_id // Store agent_id for reference
      }));
    } else {
      setSelectedAgent(null);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        agent_id: '',
        tracking_number: ''
      }));
    }
  };

  const validateForm = () => {
    if (!formData.courier_agent_id) {
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
        courier_agent_id: formData.courier_agent_id,
        agent_id: formData.agent_id,
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
        formData: formData,
        agentInfo: selectedAgent
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
                      <p className="text-xs text-gray-500">Courier Agent</p>
                      <p className="font-semibold text-gray-900">{shipmentCreated.agentInfo?.agent_name || 'N/A'}</p>
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
                  {/* Courier Agent */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Courier Agent</label>
                    {fetchingAgents ? (
                      <div className="px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm">
                        Loading agents...
                      </div>
                    ) : courierAgents.length > 0 ? (
                      <select
                        name="courier_agent_id"
                        value={formData.courier_agent_id}
                        onChange={handleAgentChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm transition"
                      >
                        <option value="">Select agent...</option>
                        {courierAgents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.agent_name || agent.name} ({agent.region || 'All regions'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="px-3 py-2 border border-red-300 rounded bg-red-50 text-red-700 text-sm">
                        No courier agents available
                      </div>
                    )}
                  </div>

                  {/* Selected Agent Details Card */}
                  {selectedAgent && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-blue-900 mb-2">Agent Details</p>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2 text-blue-800">
                              <User className="w-4 h-4 flex-shrink-0" />
                              <span><strong>{selectedAgent.agent_name}</strong></span>
                            </div>
                            {selectedAgent.email && (
                              <div className="flex items-center gap-2 text-blue-800">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span>{selectedAgent.email}</span>
                              </div>
                            )}
                            {selectedAgent.phone && (
                              <div className="flex items-center gap-2 text-blue-800">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>{selectedAgent.phone}</span>
                              </div>
                            )}
                            {selectedAgent.region && (
                              <div className="flex items-center gap-2 text-blue-800">
                                <LocationIcon className="w-4 h-4 flex-shrink-0" />
                                <span>{selectedAgent.region}</span>
                              </div>
                            )}
                            {selectedAgent.performance_rating > 0 && (
                              <div className="flex items-center gap-2 text-blue-800">
                                <Star className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                                <span>{selectedAgent.performance_rating.toFixed(2)}/5.00 ({selectedAgent.total_shipments || 0} shipments)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-xs font-semibold text-blue-900">Tracking ID will include: <span className="font-mono text-blue-700">{selectedAgent.agent_id}</span></p>
                      </div>
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
                disabled={loading || fetchingAgents}
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