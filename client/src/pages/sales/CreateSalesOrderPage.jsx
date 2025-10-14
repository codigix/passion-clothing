import React, { useState, useMemo } from 'react';
import { FaArrowLeft, FaQrcode, FaDownload, FaPaperPlane, FaFileInvoice, FaTruck, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { generateOrderQRData } from '../../utils/qrCode';
import toast from 'react-hot-toast';

const CreateSalesOrderPage = () => {
  const navigate = useNavigate();
  
  // State for order data
  const [orderData, setOrderData] = useState({
    // Customer & Order Information
    customerName: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    
    // Product / Order Details
    projectTitle: '',
    productName: '',
    productCode: '', // Auto-generated
    productType: '',
    customProductType: '',
    fabricType: '', // NEW: Fabric type field
    color: '', // NEW: Color field
    quantity: '',
    qualitySpecification: '',
    pricePerPiece: '',
    designFile: null,
    designFileName: '',
    sizeOption: 'fixed', // 'fixed' or 'custom'
    sizeDetails: [], // Array of {size: string, quantity: number}
    expectedDeliveryDate: '',
    advancePaid: '',
    gstPercentage: '18',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrData, setQrData] = useState(null);

  // Product type options
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

  // Auto-generate product code when product name changes
  const generateProductCode = (name, type) => {
    if (!name) return '';
    
    const prefix = type ? type.substring(0, 3).toUpperCase() : 'PRD';
    const namePart = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toUpperCase();
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
      const updated = {
        ...prev,
        [field]: value
      };

      // Auto-generate product code when product name or type changes
      if (field === 'productName' || field === 'productType') {
        const productType = field === 'productType' ? value : prev.productType;
        const productName = field === 'productName' ? value : prev.productName;
        updated.productCode = generateProductCode(productName, productType);
      }

      return updated;
    });
  };

  // Handle size details changes
  const handleSizeDetailChange = (index, field, value) => {
    setOrderData((prev) => {
      const newSizeDetails = [...prev.sizeDetails];
      newSizeDetails[index] = {
        ...newSizeDetails[index],
        [field]: value
      };
      return {
        ...prev,
        sizeDetails: newSizeDetails
      };
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
      // Check file size (max 5MB)
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
      // Prepare payload
      const finalProductType = orderData.productType === 'Other' 
        ? orderData.customProductType 
        : orderData.productType;

      const payload = {
        // Customer Information
        customer_name: orderData.customerName.trim(),
        customer_email: orderData.email || null,
        customer_phone: orderData.phone || null,
        customer_address: orderData.address || null,
        contact_person: orderData.contactPerson || null,
        gst_number: orderData.gstNumber || null,
        order_date: orderData.orderDate,
        
        // Order Details
        project_title: orderData.projectTitle.trim(),
        buyer_reference: orderData.projectTitle.trim(),
        
        // Delivery and financial
        delivery_date: orderData.expectedDeliveryDate,
        tax_percentage: parseFloat(orderData.gstPercentage) || 18,
        advance_paid: parseFloat(orderData.advancePaid) || 0,
        
        // Garment specifications
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
        
        // Items array (single product for this order)
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
      const newOrder = response.data.order; // Backend returns { message, order }

      // Generate QR code data for the new order
      const qrCodeData = generateOrderQRData(newOrder, 'sales');
      setQrData(qrCodeData);
      setCreatedOrder(newOrder);
      setShowQRCode(false);

      toast.success('Sales order created successfully!');
      
      // Show success state but don't navigate away
      setCreatedOrder(newOrder);

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
      // Refresh order to get updated status
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

  const handleCreateChallan = () => {
    if (!createdOrder) {
      toast.error('Please save the order first');
      return;
    }
    navigate(`/challans/create?orderId=${createdOrder.id}`);
  };

  const handleGenerateQR = () => {
    if (!createdOrder) {
      toast.error('Please save the order first');
      return;
    }
    
    const qrCodeData = generateOrderQRData(createdOrder, 'sales');
    setQrData(qrCodeData);
    setShowQRCode(true);
  };

  const handleTrackStatus = () => {
    if (!createdOrder) {
      toast.error('Please save the order first');
      return;
    }
    navigate(`/sales/orders/${createdOrder.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/sales/orders')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <FaArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create Sales Order</h1>
          </div>
          
          {createdOrder && (
            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
              <FaCheck className="mr-1 inline" /> Order Created
            </span>
          )}
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {submitError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer & Order Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 border-b pb-3">
              <h2 className="text-xl font-semibold text-gray-900">🔹 Customer & Order Information</h2>
              <p className="mt-1 text-sm text-gray-500">Client details and contact information</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="customerName">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={orderData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="XYZ Pvt Ltd"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="address">
                  Address (Billing / Shipping)
                </label>
                <input
                  id="address"
                  type="text"
                  value={orderData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Complete address with city and pincode"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="contactPerson">
                  Contact Person
                </label>
                <input
                  id="contactPerson"
                  type="text"
                  value={orderData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Name of representative"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={orderData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="contact@company.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={orderData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="gstNumber">
                  GST Number
                </label>
                <input
                  id="gstNumber"
                  type="text"
                  value={orderData.gstNumber}
                  onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="orderDate">
                  Order Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="orderDate"
                  type="date"
                  value={orderData.orderDate}
                  onChange={(e) => handleInputChange('orderDate', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Product / Order Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 border-b pb-3">
              <h2 className="text-xl font-semibold text-gray-900">🔹 Product / Order Details</h2>
              <p className="mt-1 text-sm text-gray-500">Product specifications and pricing</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="projectTitle">
                  Project / Order Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="projectTitle"
                  type="text"
                  value={orderData.projectTitle}
                  onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., Winter Uniforms – XYZ Pvt Ltd"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="productName">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="productName"
                  type="text"
                  value={orderData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., Formal Shirt"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="productCode">
                  Product Code <span className="text-xs text-gray-500">(Auto-generated)</span>
                </label>
                <input
                  id="productCode"
                  type="text"
                  value={orderData.productCode}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600 shadow-sm"
                  placeholder="Auto-generated"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="productType">
                  Product Type
                </label>
                <select
                  id="productType"
                  value={orderData.productType}
                  onChange={(e) => handleInputChange('productType', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select product type</option>
                  {productTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {orderData.productType === 'Other' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="customProductType">
                    Custom Product Type
                  </label>
                  <input
                    id="customProductType"
                    type="text"
                    value={orderData.customProductType}
                    onChange={(e) => handleInputChange('customProductType', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter custom type"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="fabricType">
                  Fabric Type
                </label>
                <input
                  id="fabricType"
                  type="text"
                  value={orderData.fabricType}
                  onChange={(e) => handleInputChange('fabricType', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., Cotton, Polyester, Cotton Blend"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="color">
                  Color
                </label>
                <input
                  id="color"
                  type="text"
                  value={orderData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., Navy Blue, White, Black"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="quantity">
                  Quantity (Units) <span className="text-red-500">*</span>
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={orderData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="1000"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="qualitySpecification">
                  Quality Specification
                </label>
                <input
                  id="qualitySpecification"
                  type="text"
                  value={orderData.qualitySpecification}
                  onChange={(e) => handleInputChange('qualitySpecification', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., 220 GSM Cotton"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="pricePerPiece">
                  Price per Piece (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  id="pricePerPiece"
                  type="number"
                  min="0"
                  step="0.01"
                  value={orderData.pricePerPiece}
                  onChange={(e) => handleInputChange('pricePerPiece', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="250.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Order Price <span className="text-xs text-gray-500">(Auto-calculated)</span>
                </label>
                <div className="flex items-center rounded-lg border border-gray-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-900">
                  ₹ {calculations.orderPrice}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="designFile">
                  Design / Logo Upload
                </label>
                <input
                  id="designFile"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-1 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                {orderData.designFileName && (
                  <p className="mt-1 text-xs text-green-600">✓ {orderData.designFileName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Size Option</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sizeOption"
                      value="fixed"
                      checked={orderData.sizeOption === 'fixed'}
                      onChange={(e) => handleInputChange('sizeOption', e.target.value)}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Fixed (S/M/L/XL)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sizeOption"
                      value="custom"
                      checked={orderData.sizeOption === 'custom'}
                      onChange={(e) => handleInputChange('sizeOption', e.target.value)}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Custom</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Size Details <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addSizeDetail}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Size
                  </button>
                </div>

                {orderData.sizeDetails.length === 0 ? (
                  <div className="text-sm text-gray-500 italic p-4 border border-dashed border-gray-300 rounded-lg text-center">
                    No sizes added. Click "Add Size" to start adding size details.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderData.sizeDetails.map((sizeDetail, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder={orderData.sizeOption === 'fixed' ? 'e.g., S, M, L, XL' : 'e.g., Chest: 38"'}
                            value={sizeDetail.size}
                            onChange={(e) => handleSizeDetailChange(index, 'size', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Quantity"
                            min="1"
                            value={sizeDetail.quantity}
                            onChange={(e) => handleSizeDetailChange(index, 'quantity', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSizeDetail(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove size"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="expectedDeliveryDate">
                  Expected Delivery Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="expectedDeliveryDate"
                  type="date"
                  value={orderData.expectedDeliveryDate}
                  onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="advancePaid">
                  Advance Paid (₹)
                </label>
                <input
                  id="advancePaid"
                  type="number"
                  min="0"
                  step="0.01"
                  value={orderData.advancePaid}
                  onChange={(e) => handleInputChange('advancePaid', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="gstPercentage">
                  GST (%)
                </label>
                <select
                  id="gstPercentage"
                  value={orderData.gstPercentage}
                  onChange={(e) => handleInputChange('gstPercentage', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="mt-6 border-t pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-xs font-medium text-gray-500">Bulk Total</div>
                  <div className="mt-1 text-xl font-bold text-gray-900">₹ {calculations.bulkTotal}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-xs font-medium text-gray-500">GST Amount ({orderData.gstPercentage}%)</div>
                  <div className="mt-1 text-xl font-bold text-gray-900">₹ {calculations.gstAmount}</div>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="text-xs font-medium text-blue-600">Total with GST</div>
                  <div className="mt-1 text-xl font-bold text-blue-900">₹ {calculations.totalWithGST}</div>
                </div>
                <div className="rounded-lg bg-orange-50 p-4">
                  <div className="text-xs font-medium text-orange-600">Remaining Amount</div>
                  <div className="mt-1 text-xl font-bold text-orange-900">₹ {calculations.remainingAmount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">🔹 Actions</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Save Sales Order */}
              <button
                type="submit"
                disabled={isSubmitting || createdOrder}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaCheck className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : createdOrder ? 'Order Saved' : 'Save Sales Order'}
              </button>

              {/* Send Request to Procurement */}
              <button
                type="button"
                onClick={handleSendToProcurement}
                disabled={!createdOrder}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-600 bg-purple-50 px-6 py-3 text-sm font-semibold text-purple-700 shadow-md transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaPaperPlane className="h-4 w-4" />
                Send to Procurement
              </button>

              {/* Download Invoice */}
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={!createdOrder}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-600 bg-green-50 px-6 py-3 text-sm font-semibold text-green-700 shadow-md transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaFileInvoice className="h-4 w-4" />
                Download Invoice
              </button>

              {/* Create Challan */}
              <button
                type="button"
                onClick={handleCreateChallan}
                disabled={!createdOrder}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-600 bg-orange-50 px-6 py-3 text-sm font-semibold text-orange-700 shadow-md transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaTruck className="h-4 w-4" />
                Create Challan
              </button>

              {/* Generate QR Code */}
              <button
                type="button"
                onClick={handleGenerateQR}
                disabled={!createdOrder}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-600 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaQrcode className="h-4 w-4" />
                Generate QR Code
              </button>

              {/* Track Status */}
              <button
                type="button"
                onClick={handleTrackStatus}
                disabled={!createdOrder}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-700 shadow-md transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaDownload className="h-4 w-4" />
                Track Status
              </button>
            </div>
          </div>
        </form>

        {/* QR Code Modal */}
        {showQRCode && qrData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <button
                onClick={() => setShowQRCode(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Order QR Code</h3>
              <QRCodeDisplay data={qrData} />
              <p className="mt-4 text-center text-sm text-gray-600">
                Scan this QR code to view order details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSalesOrderPage;