import React, { useState, useMemo } from 'react';
import { FaArrowLeft, FaCheck, FaPlus, FaTrash, FaCloudUploadAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ArrowLeft, Send, Download, FileText, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreateSalesOrderPage = () => {
  const navigate = useNavigate();
  
  // State for order data
  const [orderData, setOrderData] = useState({
    customerName: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    projectTitle: '',
    productName: '',
    productCode: '',
    productType: '',
    customProductType: '',
    fabricType: '',
    color: '',
    quantity: '',
    qualitySpecification: '',
    pricePerPiece: '',
    designFile: null,
    designFileName: '',
    sizeOption: 'fixed',
    sizeDetails: [],
    expectedDeliveryDate: '',
    advancePaid: '',
    gstPercentage: '18',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [currentSection, setCurrentSection] = useState('customer'); // Tab control

  const productTypes = [
    'Shirt',
    'T-Shirt', 
    'Polo Shirt',
    'Pant',
    'Trouser',
    'Jeans',
    'Jacket',
    'Blazer',
    'Uniform',
    'Kurta',
    'Other'
  ];

  // Auto-generate product code
  const generateProductCode = (name, type) => {
    if (!name) return '';
    const prefix = type ? type.substring(0, 3).toUpperCase() : 'PRD';
    const namePart = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${namePart}-${timestamp}`;
  };

  // Auto-calculate values
  const calculations = useMemo(() => {
    const totalQty = orderData.sizeDetails.reduce((sum, size) => sum + (parseFloat(size.quantity) || 0), 0);
    const price = parseFloat(orderData.pricePerPiece) || 0;
    const orderPrice = totalQty * price;
    const advance = parseFloat(orderData.advancePaid) || 0;
    const gst = parseFloat(orderData.gstPercentage) || 0;

    const gstAmount = (orderPrice * gst) / 100;
    const totalWithGST = orderPrice + gstAmount;
    const remainingAmount = totalWithGST - advance;
    
    return {
      totalQty: totalQty,
      orderPrice: orderPrice.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalWithGST: totalWithGST.toFixed(2),
      remainingAmount: remainingAmount.toFixed(2)
    };
  }, [orderData.sizeDetails, orderData.pricePerPiece, orderData.advancePaid, orderData.gstPercentage]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setOrderData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'productName' || field === 'productType') {
        const productType = field === 'productType' ? value : prev.productType;
        const productName = field === 'productName' ? value : prev.productName;
        updated.productCode = generateProductCode(productName, productType);
      }
      return updated;
    });
  };

  // Handle size details
  const handleSizeDetailChange = (index, field, value) => {
    setOrderData((prev) => {
      const newSizeDetails = [...prev.sizeDetails];
      newSizeDetails[index] = { ...newSizeDetails[index], [field]: value };
      return { ...prev, sizeDetails: newSizeDetails };
    });
  };

  const addSizeDetail = () => {
    setOrderData((prev) => ({
      ...prev,
      sizeDetails: [...prev.sizeDetails, { size: '', quantity: '' }]
    }));
  };

  const removeSizeDetail = (index) => {
    setOrderData((prev) => ({
      ...prev,
      sizeDetails: prev.sizeDetails.filter((_, i) => i !== index)
    }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setOrderData(prev => ({
        ...prev,
        designFile: file,
        designFileName: file.name
      }));
      toast.success('Design file uploaded successfully');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validation
    if (!orderData.customerName.trim()) {
      setSubmitError('Customer name is required');
      return;
    }
    if (!orderData.projectTitle.trim()) {
      setSubmitError('Project/Order title is required');
      return;
    }
    if (!orderData.productName.trim()) {
      setSubmitError('Product name is required');
      return;
    }
    if (!orderData.quantity || orderData.quantity <= 0) {
      setSubmitError('Quantity must be greater than 0');
      return;
    }
    if (!orderData.pricePerPiece || orderData.pricePerPiece <= 0) {
      setSubmitError('Price per piece must be greater than 0');
      return;
    }
    if (!orderData.expectedDeliveryDate) {
      setSubmitError('Expected delivery date is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalProductType = orderData.productType === 'Other' ? orderData.customProductType : orderData.productType;

      const payload = {
        customer_name: orderData.customerName.trim(),
        customer_email: orderData.email || null,
        customer_phone: orderData.phone || null,
        customer_address: orderData.address || null,
        contact_person: orderData.contactPerson || null,
        gst_number: orderData.gstNumber || null,
        order_date: orderData.orderDate,
        project_title: orderData.projectTitle.trim(),
        buyer_reference: orderData.projectTitle.trim(),
        delivery_date: orderData.expectedDeliveryDate,
        tax_percentage: parseFloat(orderData.gstPercentage) || 18,
        advance_paid: parseFloat(orderData.advancePaid) || 0,
        garment_specifications: {
          product_name: orderData.productName,
          product_code: orderData.productCode,
          product_type: finalProductType,
          fabric_type: orderData.fabricType,
          color: orderData.color,
          quality_specification: orderData.qualitySpecification,
          size_option: orderData.sizeOption,
          size_details: orderData.sizeDetails,
          design_file: orderData.designFileName
        },
        items: [
          {
            item_code: orderData.productCode,
            product_id: orderData.productCode,
            product_type: finalProductType,
            fabric_type: orderData.fabricType,
            color: orderData.color,
            description: orderData.productName,
            quantity: parseFloat(orderData.quantity),
            unit_price: parseFloat(orderData.pricePerPiece),
            unit_of_measure: 'pcs',
            size_breakdown: orderData.sizeDetails || null,
            remarks: `${finalProductType} - ${orderData.fabricType || 'N/A'} - ${orderData.color || 'N/A'} - ${orderData.qualitySpecification || 'Standard quality'}`
          }
        ]
      };

      const response = await api.post('/sales/orders', payload);
      const newOrder = response.data.order;
      setCreatedOrder(newOrder);
      toast.success('Sales order created successfully!');
    } catch (err) {
      const response = err.response?.data;
      if (response?.message) {
        setSubmitError(response.message);
      } else if (Array.isArray(response?.errors)) {
        setSubmitError(response.errors.join(', '));
      } else {
        setSubmitError('Failed to create sales order. Please try again.');
      }
      console.error('Order creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action handlers
  const handleSendToProcurement = async () => {
    if (!createdOrder || !createdOrder.id) {
      toast.error('Please save the order first');
      return;
    }
    try {
      await api.put(`/sales/orders/${createdOrder.id}/send-to-procurement`);
      toast.success('Request sent to Procurement Department');
      const updatedOrder = await api.get(`/sales/orders/${createdOrder.id}`);
      setCreatedOrder(updatedOrder.data.order);
    } catch (error) {
      toast.error('Failed to send request to procurement');
      console.error('Send to procurement error:', error);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!createdOrder) {
      toast.error('Please save the order first');
      return;
    }
    try {
      const response = await api.get(`/sales/orders/${createdOrder.id}/invoice`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${createdOrder.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
      console.error('Download invoice error:', error);
    }
  };

  const handleViewOrder = () => {
    if (!createdOrder) return;
    navigate(`/sales/orders/${createdOrder.id}`);
  };

  // Success screen
  if (createdOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="mx-auto max-w-4xl">
          {/* Success Message */}
          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-8 text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <FaCheckCircle className="text-4xl text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Created Successfully!</h2>
            <p className="text-gray-600 mb-1">Order Number: <span className="font-bold text-lg text-green-600">{createdOrder.order_number}</span></p>
            <p className="text-gray-600">Date: {new Date(createdOrder.order_date).toLocaleDateString()}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer</p>
                <p className="text-lg font-semibold text-gray-900">{createdOrder.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Project</p>
                <p className="text-lg font-semibold text-gray-900">{createdOrder.project_title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-lg font-semibold text-green-600">₹{parseFloat(createdOrder.total_price || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">{createdOrder.status}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleViewOrder}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <FileText className="w-5 h-5" />
              View Order Details
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold flex items-center justify-center gap-2 border border-gray-300"
            >
              <Download className="w-5 h-5" />
              Download Invoice
            </button>
            <button
              onClick={handleSendToProcurement}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <Send className="w-5 h-5" />
              Send to Procurement
            </button>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => navigate('/sales/orders')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>
            <button
              onClick={() => {
                setCreatedOrder(null);
                setOrderData({
                  customerName: '',
                  address: '',
                  contactPerson: '',
                  email: '',
                  phone: '',
                  gstNumber: '',
                  orderDate: new Date().toISOString().split('T')[0],
                  projectTitle: '',
                  productName: '',
                  productCode: '',
                  productType: '',
                  customProductType: '',
                  fabricType: '',
                  color: '',
                  quantity: '',
                  qualitySpecification: '',
                  pricePerPiece: '',
                  designFile: null,
                  designFileName: '',
                  sizeOption: 'fixed',
                  sizeDetails: [],
                  expectedDeliveryDate: '',
                  advancePaid: '',
                  gstPercentage: '18',
                });
                setCurrentSection('customer');
                setSubmitError('');
              }}
              className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium flex items-center gap-2 border border-blue-200"
            >
              <FaPlus className="w-4 h-4" />
              Create Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/sales/orders')}
              className="p-2 hover:bg-white rounded-lg transition-all border border-gray-200 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Sales Order</h1>
              <p className="text-sm text-gray-500 mt-1">Fill in order details and customer information</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <FaTimesCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          </div>
        )}

        {/* Progress Tabs */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {[
            { id: 'customer', label: '👤 Customer Info', icon: '1' },
            { id: 'product', label: '📦 Product Details', icon: '2' },
            { id: 'pricing', label: '💰 Pricing & Dates', icon: '3' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSection(tab.id)}
              className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                currentSection === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Customer Information */}
          {currentSection === 'customer' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Customer & Order Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="XYZ Pvt Ltd"
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={orderData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="Name of representative"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={orderData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="contact@company.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={orderData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={orderData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>

                {/* Order Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={orderData.orderDate}
                    onChange={(e) => handleInputChange('orderDate', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                  />
                </div>

                {/* Address - Full Width */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address (Billing / Shipping)
                  </label>
                  <textarea
                    value={orderData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="Complete address with city and pincode"
                    rows="3"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentSection('product')}
                  className="ml-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                >
                  Next: Product Details →
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: Product Details */}
          {currentSection === 'product' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Product & Order Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Project Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project / Order Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderData.projectTitle}
                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="e.g., Winter Uniforms – XYZ Pvt Ltd"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="e.g., Formal Shirt"
                  />
                </div>

                {/* Product Code (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Code <span className="text-xs text-gray-500">(Auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    value={orderData.productCode}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
                    placeholder="Auto-generated"
                  />
                </div>

                {/* Product Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Type
                  </label>
                  <select
                    value={orderData.productType}
                    onChange={(e) => handleInputChange('productType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                  >
                    <option value="">Select product type</option>
                    {productTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Product Type */}
                {orderData.productType === 'Other' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Custom Product Type
                    </label>
                    <input
                      type="text"
                      value={orderData.customProductType}
                      onChange={(e) => handleInputChange('customProductType', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                      placeholder="Enter custom type"
                    />
                  </div>
                )}

                {/* Fabric Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fabric Type
                  </label>
                  <input
                    type="text"
                    value={orderData.fabricType}
                    onChange={(e) => handleInputChange('fabricType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="e.g., Cotton, Polyester"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={orderData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="e.g., Navy Blue, White"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity (Units) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="1000"
                  />
                </div>

                {/* Quality Specification */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quality Specification
                  </label>
                  <input
                    type="text"
                    value={orderData.qualitySpecification}
                    onChange={(e) => handleInputChange('qualitySpecification', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="e.g., 220 GSM Cotton"
                  />
                </div>
              </div>

              {/* Size Details */}
              {orderData.sizeOption === 'fixed' && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Size Breakdown (Optional)</h3>
                    <button
                      type="button"
                      onClick={addSizeDetail}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium flex items-center gap-2 border border-blue-200"
                    >
                      <FaPlus className="w-3 h-3" /> Add Size
                    </button>
                  </div>

                  {orderData.sizeDetails.length > 0 && (
                    <div className="space-y-3">
                      {orderData.sizeDetails.map((detail, index) => (
                        <div key={index} className="flex gap-3 items-end">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Size</label>
                            <input
                              type="text"
                              value={detail.size}
                              onChange={(e) => handleSizeDetailChange(index, 'size', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm"
                              placeholder="e.g., M, L, XL"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={detail.quantity}
                              onChange={(e) => handleSizeDetailChange(index, 'quantity', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm"
                              placeholder="0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSizeDetail(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex gap-3 justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentSection('customer')}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSection('pricing')}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                >
                  Next: Pricing & Dates →
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: Pricing & Dates */}
          {currentSection === 'pricing' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing & Delivery Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Price Per Piece */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price per Piece (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={orderData.pricePerPiece}
                    onChange={(e) => handleInputChange('pricePerPiece', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="0.00"
                  />
                </div>

                {/* GST Percentage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GST Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={orderData.gstPercentage}
                    onChange={(e) => handleInputChange('gstPercentage', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="18"
                  />
                </div>

                {/* Advance Paid */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Advance Paid (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={orderData.advancePaid}
                    onChange={(e) => handleInputChange('advancePaid', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    placeholder="0.00"
                  />
                </div>

                {/* Expected Delivery Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expected Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={orderData.expectedDeliveryDate}
                    onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                  />
                </div>
              </div>

              {/* Price Summary Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Price Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Order Price (₹):</span>
                    <span className="font-semibold">₹{calculations.orderPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST ({orderData.gstPercentage}%):</span>
                    <span className="font-semibold">₹{calculations.gstAmount}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-3 flex justify-between text-gray-900 font-bold text-base">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{calculations.totalWithGST}</span>
                  </div>
                  {parseFloat(orderData.advancePaid) > 0 && (
                    <div className="flex justify-between text-gray-600 bg-white rounded-lg p-2 px-3">
                      <span>Remaining Balance:</span>
                      <span className="font-semibold text-orange-600">₹{calculations.remainingAmount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload */}
              <div className="border-t pt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Design File (Optional)
                </label>
                <label className="w-full px-6 py-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 cursor-pointer transition-all flex flex-col items-center justify-center gap-3">
                  <FaCloudUploadAlt className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-700">Click to upload design file</p>
                    <p className="text-xs text-gray-500 mt-1">Maximum size: 5MB</p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {orderData.designFileName && (
                  <p className="mt-3 text-sm text-green-600 font-medium">✓ {orderData.designFileName}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3 justify-between border-t pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentSection('product')}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                  ← Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/sales/orders')}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaCheck className="w-4 h-4" />
                        Create Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateSalesOrderPage;