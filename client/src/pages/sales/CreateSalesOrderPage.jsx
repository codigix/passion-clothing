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
  const [imagePreview, setImagePreview] = useState(null); // Image preview URL

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
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setOrderData(prev => ({
        ...prev,
        designFile: file,
        designFileName: file.name
      }));
      toast.success('Design file uploaded successfully');
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setOrderData(prev => ({
      ...prev,
      designFile: null,
      designFileName: ''
    }));
    toast.success('Image removed');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-3">
        <div className="mx-auto max-w-5xl">
          {/* Success Message */}
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4 text-center mb-3">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Order Created Successfully!</h2>
            <p className="text-xs text-gray-600">Order: <span className="font-semibold text-green-600">{createdOrder.order_number}</span></p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Order Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <p className="text-gray-500 mb-0.5">Customer</p>
                <p className="font-medium text-gray-900">{createdOrder.customer_name}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Project</p>
                <p className="font-medium text-gray-900">{createdOrder.project_title}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Total</p>
                <p className="font-semibold text-green-600">₹{parseFloat(createdOrder.total_price || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Status</p>
                <p className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium text-xs">{createdOrder.status}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <button
              onClick={handleViewOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm flex items-center justify-center gap-1 shadow-md"
            >
              <FileText className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm flex items-center justify-center gap-1 border border-gray-300"
            >
              <Download className="w-4 h-4" />
              Invoice
            </button>
            <button
              onClick={handleSendToProcurement}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm flex items-center justify-center gap-1 shadow-md"
            >
              <Send className="w-4 h-4" />
              Send to Procurement
            </button>
          </div>

          {/* Bottom Navigation */}
          <div className="pt-2 border-t border-gray-200 flex gap-2 text-sm">
            <button
              onClick={() => navigate('/sales/orders')}
              className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
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
              className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium flex items-center gap-1 border border-blue-200 text-sm"
            >
              <FaPlus className="w-3 h-3" />
              New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-3">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/sales/orders')}
              className="p-1.5 hover:bg-white rounded-lg transition-all border border-gray-200 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Sales Order</h1>
              <p className="text-xs text-gray-500 mt-0.5">Enter customer & product details</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
            <FaTimesCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 text-xs">Error</p>
              <p className="text-red-700 text-xs">{submitError}</p>
            </div>
          </div>
        )}

        {/* Progress Tabs */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'customer', label: '👤 Customer Info', icon: '1' },
            { id: 'product', label: '📦 Product Details', icon: '2' },
            { id: 'pricing', label: '💰 Pricing & Dates', icon: '3' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSection(tab.id)}
              className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
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
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* SECTION 1: Customer Information */}
          {currentSection === 'customer' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Customer & Order Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="XYZ Pvt Ltd"
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={orderData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="Name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={orderData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="contact@company.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={orderData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={orderData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>

                {/* Order Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Order Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={orderData.orderDate}
                    onChange={(e) => handleInputChange('orderDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                  />
                </div>

                {/* Address - Full Width */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Address (Billing / Shipping)
                  </label>
                  <textarea
                    value={orderData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="Complete address with city and pincode"
                    rows="2"
                  />
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentSection('product')}
                  className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
                >
                  Next: Product Details →
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: Product Details */}
          {currentSection === 'product' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Product & Order Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Project Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Project / Order Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderData.projectTitle}
                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="e.g., Winter Uniforms – XYZ Pvt Ltd"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="e.g., Formal Shirt"
                  />
                </div>

                {/* Product Code (Read-only) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Code <span className="text-xs text-gray-500">(Auto-gen)</span>
                  </label>
                  <input
                    type="text"
                    value={orderData.productCode}
                    readOnly
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 text-xs cursor-not-allowed"
                    placeholder="Auto-generated"
                  />
                </div>

                {/* Product Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <select
                    value={orderData.productType}
                    onChange={(e) => handleInputChange('productType', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                  >
                    <option value="">Select type</option>
                    {productTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Product Type */}
                {orderData.productType === 'Other' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Custom Type
                    </label>
                    <input
                      type="text"
                      value={orderData.customProductType}
                      onChange={(e) => handleInputChange('customProductType', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                      placeholder="Enter type"
                    />
                  </div>
                )}

                {/* Fabric Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fabric Type
                  </label>
                  <input
                    type="text"
                    value={orderData.fabricType}
                    onChange={(e) => handleInputChange('fabricType', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="Cotton, Polyester, etc"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={orderData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="Navy Blue, White, etc"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantity (Units) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="1000"
                  />
                </div>

                {/* Quality Specification */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quality Specification
                  </label>
                  <input
                    type="text"
                    value={orderData.qualitySpecification}
                    onChange={(e) => handleInputChange('qualitySpecification', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="e.g., 220 GSM Cotton"
                  />
                </div>
              </div>

              {/* Size Details */}
              {orderData.sizeOption === 'fixed' && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">Size Breakdown (Optional)</h3>
                    <button
                      type="button"
                      onClick={addSizeDetail}
                      className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-xs font-medium flex items-center gap-1 border border-blue-200"
                    >
                      <FaPlus className="w-2.5 h-2.5" /> Add
                    </button>
                  </div>

                  {orderData.sizeDetails.length > 0 && (
                    <div className="space-y-2">
                      {orderData.sizeDetails.map((detail, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-0.5">Size</label>
                            <input
                              type="text"
                              value={detail.size}
                              onChange={(e) => handleSizeDetailChange(index, 'size', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                              placeholder="M, L, XL"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-0.5">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={detail.quantity}
                              onChange={(e) => handleSizeDetailChange(index, 'quantity', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                              placeholder="0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSizeDetail(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 flex gap-2 justify-between border-t border-gray-200 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentSection('customer')}
                  className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSection('pricing')}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
                >
                  Next: Pricing & Dates →
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: Pricing & Dates */}
          {currentSection === 'pricing' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Pricing & Delivery Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Price Per Piece */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price per Piece (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={orderData.pricePerPiece}
                    onChange={(e) => handleInputChange('pricePerPiece', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="0.00"
                  />
                </div>

                {/* GST Percentage */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    GST Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={orderData.gstPercentage}
                    onChange={(e) => handleInputChange('gstPercentage', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="18"
                  />
                </div>

                {/* Advance Paid */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Advance Paid (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={orderData.advancePaid}
                    onChange={(e) => handleInputChange('advancePaid', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="0.00"
                  />
                </div>

                {/* Expected Delivery Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expected Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={orderData.expectedDeliveryDate}
                    onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                  />
                </div>
              </div>

              {/* Price Summary Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Price Summary</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Order Price (₹):</span>
                    <span className="font-medium">₹{calculations.orderPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST ({orderData.gstPercentage}%):</span>
                    <span className="font-medium">₹{calculations.gstAmount}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-1 flex justify-between text-gray-900 font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{calculations.totalWithGST}</span>
                  </div>
                  {parseFloat(orderData.advancePaid) > 0 && (
                    <div className="flex justify-between text-gray-600 bg-white rounded-lg p-1.5 px-2 text-xs">
                      <span>Remaining:</span>
                      <span className="font-medium text-orange-600">₹{calculations.remainingAmount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload */}
              <div className="border-t border-gray-200 pt-3">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Design File (Optional)
                </label>
                
                {!imagePreview ? (
                  <label className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 cursor-pointer transition-all flex flex-col items-center justify-center gap-2">
                    <FaCloudUploadAlt className="w-5 h-5 text-gray-400" />
                    <div className="text-center">
                      <p className="font-medium text-gray-700 text-xs">Click to upload</p>
                      <p className="text-xs text-gray-500 mt-0.5">Max 5MB</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="w-full border-2 border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {imagePreview.startsWith('data:image') ? (
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-xs font-medium text-gray-700">{orderData.designFileName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {orderData.designFile && (orderData.designFile.size / 1024 / 1024).toFixed(2)}MB
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded text-xs font-medium hover:bg-red-200 transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex gap-2 justify-between border-t border-gray-200 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentSection('product')}
                  className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
                >
                  ← Back
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/sales/orders')}
                    className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaCheck className="w-3 h-3" />
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