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
    // PRIMARY IDENTIFIERS
    projectTitle: '',
    customerName: '',
    email: '',
    phone: '',
    contactPerson: '',
    clientPoNumber: '',
    
    // PRODUCT DETAILS
    productName: '',
    productType: '',
    fabricType: '',
    color: '',
    quantity: '',
    qualitySpecification: '',
    specialInstructions: '',
    deliveryAddress: '',
    department: '',
    orderReference: '',
    
    // PRICING & DELIVERY
    pricePerPiece: '',
    expectedDeliveryDate: '',
    advancePaid: '',
    gstPercentage: '18',
    
    // OPTIONAL/ADVANCED
    gstNumber: '',
    address: '',
    designFiles: [], // Changed to array for multiple files
    
    // INTERNAL (not shown)
    orderDate: new Date().toISOString().split('T')[0],
    productCode: '',
    sizeOption: 'fixed',
    sizeDetails: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [currentSection, setCurrentSection] = useState('primary'); // Tab control
  const [imagePreviews, setImagePreviews] = useState([]); // Changed to array for multiple previews

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
    // Calculate total qty from size details OR use main quantity field as fallback
    let totalQty = orderData.sizeDetails.reduce((sum, size) => sum + (parseFloat(size.quantity) || 0), 0);
    
    // If size details are empty, use the main quantity field
    if (totalQty === 0) {
      totalQty = parseFloat(orderData.quantity) || 0;
    }
    
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
  }, [orderData.sizeDetails, orderData.quantity, orderData.pricePerPiece, orderData.advancePaid, orderData.gstPercentage]);

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

  // Handle multiple file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    
    if (imagePreviews.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} design files allowed`);
      return;
    }
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 5MB limit`);
        return;
      }
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrderData(prev => ({
          ...prev,
          designFiles: [...prev.designFiles, { file, name: file.name, preview: reader.result }]
        }));
        setImagePreviews(prev => [...prev, { name: file.name, preview: reader.result, size: file.size }]);
        toast.success(`"${file.name}" uploaded successfully`);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle remove individual design file
  const handleRemoveDesignFile = (index) => {
    setOrderData(prev => ({
      ...prev,
      designFiles: prev.designFiles.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    toast.success('Design file removed');
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
    if (parseFloat(calculations.totalQty) <= 0) {
      setSubmitError('Total quantity must be greater than 0. Please enter quantity or add size details.');
      return;
    }
    if (!orderData.pricePerPiece || parseFloat(orderData.pricePerPiece) <= 0) {
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
        customer_address: orderData.deliveryAddress || orderData.address || null,
        contact_person: orderData.contactPerson || null,
        gst_number: orderData.gstNumber || null,
        order_date: orderData.orderDate,
        project_title: orderData.projectTitle.trim(),
        buyer_reference: orderData.orderReference || orderData.projectTitle.trim(),
        client_po_number: orderData.clientPoNumber || null,
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
          design_files: orderData.designFiles.map(df => df.name), // Store array of file names
          special_instructions: orderData.specialInstructions || null,
          department: orderData.department || null
        },
        items: [
          {
            item_code: orderData.productCode,
            product_id: orderData.productCode,
            product_type: finalProductType,
            fabric_type: orderData.fabricType,
            color: orderData.color,
            description: orderData.productName,
            quantity: parseFloat(calculations.totalQty),
            unit_price: parseFloat(orderData.pricePerPiece),
            unit_of_measure: 'pcs',
            size_breakdown: orderData.sizeDetails || null,
            remarks: `${finalProductType} - ${orderData.fabricType || 'N/A'} - ${orderData.color || 'N/A'} - ${orderData.qualitySpecification || 'Standard quality'}`
          }
        ]
      };

      const response = await api.post('/sales/orders', payload);
      const newOrder = response.data.order;
      
      // Upload design files if any
      if (orderData.designFiles && orderData.designFiles.length > 0 && newOrder?.id) {
        try {
          const formData = new FormData();
          orderData.designFiles.forEach(df => {
            formData.append('files', df.file);
          });
          
          await api.post(`/sales/orders/${newOrder.id}/upload-design-files`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          toast.success('Design files uploaded successfully!');
        } catch (uploadErr) {
          console.warn('Failed to upload some design files:', uploadErr);
          toast.warning('Order created but design file upload failed');
        }
      }
      
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
        responseType: 'blob',
        timeout: 30000,
      });
      
      // Verify it's actually a PDF
      if (!response.data || response.data.size === 0) {
        throw new Error('Empty invoice response');
      }

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${createdOrder.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Download invoice error:', error);
      
      let errorMsg = 'Failed to download invoice';
      
      // Handle different error types
      if (error.response?.data instanceof Blob) {
        // For blob errors, try to parse as JSON if it's JSON content
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          errorMsg = json.message || errorMsg;
        } catch {
          errorMsg = `Server error: ${error.response?.status || 'Unknown'}`;
        }
      } else if (error.response?.data?.message) {
        // For JSON errors
        errorMsg = error.response.data.message;
      } else if (error.message) {
        // For network/other errors
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
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
                  projectTitle: '',
                  customerName: '',
                  email: '',
                  phone: '',
                  contactPerson: '',
                  clientPoNumber: '',
                  productName: '',
                  productType: '',
                  fabricType: '',
                  color: '',
                  quantity: '',
                  qualitySpecification: '',
                  specialInstructions: '',
                  deliveryAddress: '',
                  department: '',
                  orderReference: '',
                  pricePerPiece: '',
                  expectedDeliveryDate: '',
                  advancePaid: '',
                  gstPercentage: '18',
                  gstNumber: '',
                  address: '',
                  designFile: null,
                  designFileName: '',
                  orderDate: new Date().toISOString().split('T')[0],
                  productCode: '',
                  sizeOption: 'fixed',
                  sizeDetails: [],
                });
                setCurrentSection('primary');
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
            { id: 'primary', label: '🎯 Project & Customer', icon: '1' },
            { id: 'product', label: '📦 Product Details', icon: '2' },
            { id: 'pricing', label: '💰 Pricing & Delivery', icon: '3' }
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
          {/* SECTION 1: PRIMARY - Project & Customer (HIGHLIGHTED) */}
          {currentSection === 'primary' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              {/* PROJECT TITLE - HIGHLIGHTED AS PRIMARY */}
              <div className="mb-4 pb-4 border-b-2 border-amber-200">
                <label className="block text-xs font-bold text-amber-700 mb-2 uppercase tracking-wider">
                  🎯 Primary Project Name
                </label>
                <input
                  type="text"
                  value={orderData.projectTitle}
                  onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition text-sm font-semibold bg-amber-50 placeholder-amber-300"
                  placeholder="e.g., Winter Uniforms – XYZ Pvt Ltd"
                />
                <p className="text-xs text-amber-600 mt-1">This is your order's unique project identifier</p>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                {/* Customer Name - Required */}
                <div className="lg:col-span-1">
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

                {/* Email & Phone in row */}
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

                {/* Client PO Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Client PO Number
                  </label>
                  <input
                    type="text"
                    value={orderData.clientPoNumber}
                    onChange={(e) => handleInputChange('clientPoNumber', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="e.g., PO-2024-001"
                  />
                </div>

                {/* GST & Address - Optional Footer */}
                <div className="lg:col-span-2 pt-2 border-t border-gray-200">
                  <details className="group cursor-pointer">
                    <summary className="text-xs font-medium text-gray-600 hover:text-gray-900 select-none">
                      + Additional Information (GST, Address)
                    </summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
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
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          value={orderData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                          placeholder="City, pincode"
                          rows="2"
                        />
                      </div>
                    </div>
                  </details>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Product Name - REQUIRED */}
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

                {/* Product Type - Consolidated */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  {orderData.productType === 'Other' ? (
                    <input
                      type="text"
                      value={orderData.productType === 'Other' ? orderData.customProductType : orderData.productType}
                      onChange={(e) => {
                        if (orderData.productType === 'Other') {
                          handleInputChange('customProductType', e.target.value);
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                      placeholder="Enter custom type"
                    />
                  ) : (
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
                  )}
                </div>

                {/* Quantity - REQUIRED */}
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
                    placeholder="e.g., 220 GSM, Double Stitching, etc (Optional)"
                  />
                </div>
              </div>

              {/* DIVIDER - NEW FIELDS SECTION */}
              <div className="my-4 pt-4 border-t-2 border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">📦 Size Breakdown</h3>
                
                {/* Size Breakdown Table */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  {orderData.sizeDetails.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-3">No sizes added yet. Click "Add Size" to start.</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 font-semibold text-xs text-gray-700 pb-2 border-b border-gray-200">
                        <div>Size</div>
                        <div>Quantity</div>
                        <div>Action</div>
                      </div>
                      {orderData.sizeDetails.map((size, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 items-center">
                          <input
                            type="text"
                            value={size.size}
                            onChange={(e) => handleSizeDetailChange(index, 'size', e.target.value)}
                            className="px-2 py-1.5 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                            placeholder="XS, S, M, L, XL"
                          />
                          <input
                            type="number"
                            min="0"
                            value={size.quantity}
                            onChange={(e) => handleSizeDetailChange(index, 'quantity', e.target.value)}
                            className="px-2 py-1.5 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                            placeholder="0"
                          />
                          <button
                            type="button"
                            onClick={() => removeSizeDetail(index)}
                            className="px-2 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-xs font-medium flex items-center justify-center gap-1"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={addSizeDetail}
                    className="mt-2 w-full px-3 py-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition font-medium text-xs flex items-center justify-center gap-1"
                  >
                    <FaPlus className="w-3 h-3" />
                    Add Size
                  </button>
                </div>

                {/* Additional Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Order Reference */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Order Reference Number
                    </label>
                    <input
                      type="text"
                      value={orderData.orderReference}
                      onChange={(e) => handleInputChange('orderReference', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                      placeholder="e.g., ORD-2024-001"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Department / Buyer
                    </label>
                    <input
                      type="text"
                      value={orderData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                      placeholder="e.g., Sales, Marketing"
                    />
                  </div>

                  {/* Delivery Address */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      value={orderData.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                      placeholder="Street address, City, Pincode"
                      rows="2"
                    />
                  </div>

                  {/* Special Instructions */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Special Instructions / Notes
                    </label>
                    <textarea
                      value={orderData.specialInstructions}
                      onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                      placeholder="Any special requirements or production notes..."
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2 justify-between border-t border-gray-200 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentSection('primary')}
                  className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSection('pricing')}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
                >
                  Next: Pricing & Delivery →
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
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">💰 Price Calculation Summary</h3>
                <div className="space-y-1.5 text-xs bg-white rounded-lg p-2.5 border border-blue-100">
                  {/* Calculation Breakdown */}
                  <div className="pb-1.5 border-b border-blue-100">
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>Quantity:</span>
                      <span className="font-semibold text-blue-600">{parseFloat(calculations.totalQty).toLocaleString()} pcs</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Price per Piece:</span>
                      <span className="font-semibold text-blue-600">₹{parseFloat(orderData.pricePerPiece || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Results */}
                  <div className="pt-1.5 space-y-1">
                    <div className="flex justify-between text-gray-700 font-medium">
                      <span>Subtotal ({parseFloat(calculations.totalQty).toLocaleString()} × ₹{parseFloat(orderData.pricePerPiece || 0).toFixed(2)}):</span>
                      <span className="text-gray-900">₹{calculations.orderPrice}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 font-medium">
                      <span>GST ({orderData.gstPercentage}%):</span>
                      <span className="text-amber-600">+ ₹{calculations.gstAmount}</span>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="border-t-2 border-blue-300 pt-1.5 flex justify-between text-gray-900 font-bold">
                    <span>Total Amount:</span>
                    <span className="text-green-600 text-sm">₹{calculations.totalWithGST}</span>
                  </div>
                  
                  {/* Advance Paid */}
                  {parseFloat(orderData.advancePaid) > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-blue-100 flex justify-between text-gray-600 bg-orange-50 rounded-lg p-1.5 px-2">
                      <span>Advance Paid:</span>
                      <span className="font-medium text-orange-700">- ₹{parseFloat(orderData.advancePaid).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Remaining Amount */}
                  {parseFloat(orderData.advancePaid) > 0 && (
                    <div className="flex justify-between text-gray-900 font-bold bg-blue-100 rounded-lg p-1.5 px-2">
                      <span>Remaining Amount:</span>
                      <span className="text-blue-700">₹{calculations.remainingAmount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Multiple Design Files Upload */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-700">
                    🎨 Design Patterns (Optional) - Up to 5 files
                  </label>
                  {imagePreviews.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                      {imagePreviews.length} file{imagePreviews.length !== 1 ? 's' : ''} uploaded
                    </span>
                  )}
                </div>
                
                {/* Upload Area */}
                <label className="block w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 mb-3">
                  <FaCloudUploadAlt className="w-5 h-5 text-gray-400" />
                  <div className="text-center">
                    <p className="font-medium text-gray-700 text-xs">Click or drag to add more patterns</p>
                    <p className="text-xs text-gray-500 mt-0.5">Max 5MB per file • Images, PDF, DOC</p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                    multiple
                    className="hidden"
                  />
                </label>
                
                {/* File Preview Grid */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                    {imagePreviews.map((filePreview, index) => (
                      <div
                        key={index}
                        className="relative group border-2 border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-all"
                      >
                        {/* Preview Image/Icon */}
                        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                          {filePreview.preview.startsWith('data:image') ? (
                            <img
                              src={filePreview.preview}
                              alt={`Pattern ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1">
                              <FileText className="w-6 h-6 text-gray-400" />
                              <span className="text-xs text-gray-500 text-center px-1">
                                {filePreview.name.split('.').pop().toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="p-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 truncate" title={filePreview.name}>
                            {filePreview.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(filePreview.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveDesignFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          title="Remove this design file"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
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