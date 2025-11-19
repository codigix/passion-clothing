import React, { useState, useMemo, useEffect } from 'react';
import { FaArrowLeft, FaCheck, FaPlus, FaTrash, FaCloudUploadAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ArrowLeft, Send, Download, FileText, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EditSalesOrderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // State for order data
  const [orderData, setOrderData] = useState({
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
    designFiles: [],
    orderDate: new Date().toISOString().split('T')[0],
    productCode: '',
    sizeOption: 'fixed',
    sizeDetails: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [currentSection, setCurrentSection] = useState('primary');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [orderSaved, setOrderSaved] = useState(false);
  const [existingOrder, setExistingOrder] = useState(null);

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

  // Load existing order data
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/sales/orders/${id}`);
        const order = response.data.order;

        // Check if order is in draft status
        if (order.status !== 'draft') {
          toast.error('Only draft orders can be edited');
          navigate(`/sales/orders/${id}`);
          return;
        }

        setExistingOrder(order);

        // Extract data from order
        const specs = order.garment_specifications || {};
        const items = order.items || [];
        const item = items[0] || {};

        setOrderData({
          projectTitle: order.project_name || '',
          customerName: order.customer?.name || '',
          email: order.customer?.email || '',
          phone: order.customer?.phone || '',
          contactPerson: order.contact_person || '',
          clientPoNumber: order.client_po_number || '',
          productName: specs.product_name || item.description || '',
          productType: specs.product_type || item.product_type || '',
          fabricType: specs.fabric_type || item.fabric_type || '',
          color: specs.color || item.color || '',
          quantity: order.total_quantity ? order.total_quantity.toString() : '',
          qualitySpecification: specs.quality_specification || '',
          specialInstructions: specs.special_instructions || order.special_instructions || '',
          deliveryAddress: order.shipping_address || order.billing_address || '',
          department: specs.department || '',
          orderReference: order.buyer_reference || '',
          pricePerPiece: item.unit_price ? item.unit_price.toString() : '',
          expectedDeliveryDate: order.delivery_date ? order.delivery_date.split('T')[0] : '',
          advancePaid: order.advance_paid ? order.advance_paid.toString() : '0',
          gstPercentage: order.tax_percentage ? order.tax_percentage.toString() : '18',
          gstNumber: order.customer?.gst_number || '',
          address: order.shipping_address || order.billing_address || '',
          designFiles: [],
          orderDate: order.order_date ? order.order_date.split('T')[0] : new Date().toISOString().split('T')[0],
          productCode: specs.product_code || item.item_code || '',
          sizeOption: specs.size_option || 'fixed',
          sizeDetails: specs.size_details || item.size_breakdown || [],
        });
      } catch (err) {
        console.error('Error fetching order:', err);
        toast.error(err.response?.data?.message || 'Failed to load order');
        navigate('/sales/orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrderData();
    }
  }, [id, navigate]);

  const generateProductCode = (name, type) => {
    if (!name) return '';
    const prefix = type ? type.substring(0, 3).toUpperCase() : 'PRD';
    const namePart = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${namePart}-${timestamp}`;
  };

  const calculations = useMemo(() => {
    let totalQty = orderData.sizeDetails.reduce((sum, size) => sum + (parseFloat(size.quantity) || 0), 0);

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

  const handleRemoveDesignFile = (index) => {
    setOrderData(prev => ({
      ...prev,
      designFiles: prev.designFiles.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    toast.success('Design file removed');
  };

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
      setSubmitError('Total quantity must be greater than 0');
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
          design_files: orderData.designFiles.map(df => df.name),
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

      await api.put(`/sales/orders/${id}`, payload);
      setOrderSaved(true);
      toast.success('Sales order updated successfully!');
    } catch (err) {
      const response = err.response?.data;
      if (response?.message) {
        setSubmitError(response.message);
      } else if (Array.isArray(response?.errors)) {
        setSubmitError(response.errors.join(', '));
      } else {
        setSubmitError('Failed to update sales order. Please try again.');
      }
      console.error('Order update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToProcurement = async () => {
    try {
      await api.put(`/sales/orders/${id}/send-to-procurement`);
      toast.success('Request sent to Procurement Department');
      navigate(`/sales/orders/${id}`);
    } catch (error) {
      toast.error('Failed to send request to procurement');
      console.error('Send to procurement error:', error);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!existingOrder || !existingOrder.id) {
      toast.error('Please save the order first');
      return;
    }
    try {
      const response = await api.get(`/sales/orders/${existingOrder.id}/invoice`, {
        responseType: 'blob',
        timeout: 30000,
      });
      
      if (!response.data || response.data.size === 0) {
        throw new Error('Empty invoice response');
      }

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${existingOrder.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Download invoice error:', error);
      
      let errorMsg = 'Failed to download invoice';
      
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          errorMsg = json.message || errorMsg;
        } catch {
          errorMsg = `Server error: ${error.response?.status || 'Unknown'}`;
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-3 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (orderSaved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-3">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4 text-center mb-3">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Order Updated Successfully!</h2>
            <p className="text-xs text-gray-600">Order: <span className="font-semibold text-green-600">{existingOrder?.order_number}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => navigate(`/sales/orders/${id}`)}
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
              Download Invoice
            </button>
            <button
              onClick={handleSendToProcurement}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm flex items-center justify-center gap-1 shadow-md"
            >
              <Send className="w-4 h-4" />
              Send to Procurement
            </button>
          </div>

          <button
            onClick={() => navigate('/sales/orders')}
            className="w-full px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Orders
          </button>
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
              onClick={() => navigate(`/sales/orders/${id}`)}
              className="p-1.5 hover:bg-white rounded-lg transition-all border border-gray-200 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Sales Order</h1>
              <p className="text-xs text-gray-500 mt-0.5">Update customer & product details (Draft Status)</p>
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
          {/* SECTION 1: PRIMARY */}
          {currentSection === 'primary' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
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
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                <div className="md:col-span-2 pt-2 border-t border-gray-200">
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
                      <div>
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

          {/* SECTION 2: PRODUCT DETAILS */}
          {currentSection === 'product' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

                <div className="md:col-span-3 lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quality Specification
                  </label>
                  <input
                    type="text"
                    value={orderData.qualitySpecification}
                    onChange={(e) => handleInputChange('qualitySpecification', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="e.g., 220 GSM"
                  />
                </div>
              </div>

              {/* Size Breakdown */}
              <div className="my-4 pt-4 border-t-2 border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">📦 Size Breakdown</h3>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  {orderData.sizeDetails.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-3">No sizes added yet</p>
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
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentSection('primary')}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSection('pricing')}
                  className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
                >
                  Next: Pricing & Delivery →
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: PRICING & DELIVERY */}
          {currentSection === 'pricing' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Pricing & Delivery</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    placeholder="500"
                  />
                </div>

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

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Advance Paid (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={orderData.advancePaid}
                    onChange={(e) => handleInputChange('advancePaid', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    GST Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={orderData.gstPercentage}
                    onChange={(e) => handleInputChange('gstPercentage', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                    placeholder="18"
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className="mt-4 p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                <h3 className="text-xs font-bold text-blue-900 mb-2">Order Summary</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Quantity:</span>
                    <span className="font-semibold text-blue-900">{calculations.totalQty} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Order Price (before GST):</span>
                    <span className="font-semibold text-blue-900">₹{calculations.orderPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">GST ({orderData.gstPercentage}%):</span>
                    <span className="font-semibold text-blue-900">₹{calculations.gstAmount}</span>
                  </div>
                  <div className="border-t-2 border-blue-300 pt-1 mt-1 flex justify-between">
                    <span className="text-blue-900 font-bold">Total (with GST):</span>
                    <span className="font-bold text-green-600 text-sm">₹{calculations.totalWithGST}</span>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>Advance Paid:</span>
                    <span className="font-semibold">₹{orderData.advancePaid || '0'}</span>
                  </div>
                  <div className="border-t-2 border-blue-200 pt-1 flex justify-between">
                    <span className="font-semibold text-blue-900">Balance Amount:</span>
                    <span className="font-bold text-blue-900">₹{calculations.remainingAmount}</span>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={orderData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-xs"
                  placeholder="Any special requirements..."
                  rows="3"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentSection('product')}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-6 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <FaCheck className="w-3 h-3" />}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditSalesOrderPage;