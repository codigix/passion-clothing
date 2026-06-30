import React, { useState, useMemo, useEffect } from 'react';
import { FaArrowLeft, FaCheck, FaPlus, FaTrash, FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaLock, FaDownload, FaFileAlt } from 'react-icons/fa';
import { ArrowLeft, Send, Download, FileText, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreateSalesOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isFromRequirement = !!(location.state && location.state.fromRequirement);
  
  // State for order data
  const [orderData, setOrderData] = useState({
    // PRIMARY IDENTIFIERS
    projectTitle: '',
    customerName: '',
    email: '',
    phone: '',
    contactPerson: '',
    clientPoNumber: '',
    
    // REFERENCE INFO
    clientRequirementId: '',
    quotationId: '',
    orderReference: '', // Client Requirement No
    quotationNo: '',
    salesPerson: '',
    deliveryTerms: '',
    paymentTerms: '',
    
    // PRODUCT DETAILS
    productName: '',
    productType: '',
    fabricType: '',
    color: '',
    quantity: '',
    unit: 'Pcs',
    pricePerPiece: '',
    discountPercentage: '0',
    gstPercentage: '18',
    specialInstructions: '',
    
    // TECHNICAL SPECS
    gsm: '',
    size: '',
    fit: '',
    pattern: '',
    sleeveType: '',
    neckType: '',
    printType: '',
    embroidery: '',
    packingType: '',
    customerInstructions: '',
    
    // DOCUMENTS / ATTACHMENTS
    designFiles: [], 
    
    // DELIVERY INFO
    expectedDeliveryDate: '',
    deliveryAddress: '',
    address: '', // Billing Address
    transportMode: '',
    shippingMethod: '',
    priority: 'medium',
    dispatchInstructions: '',
    
    // INTERNAL
    orderDate: new Date().toISOString().split('T')[0],
    productCode: '',
    sizeOption: 'fixed',
    sizeDetails: [],
  });

  const [loadingRequirement, setLoadingRequirement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [currentSection, setCurrentSection] = useState('customer_so'); // Tab control
  const [imagePreviews, setImagePreviews] = useState([]);

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

  // Auto-fetch and prefill details
  useEffect(() => {
    const fetchRequirementAndPrefill = async () => {
      if (location.state && location.state.requirementId) {
        setLoadingRequirement(true);
        try {
          const res = await api.get(`/client-requirements/${location.state.requirementId}`);
          const d = res.data;
          
          // Map attachments if present
          const mainAttachments = d.attachments || {};
          const productAttachments = d.products?.[0]?.attachments || {};
          const mergedAttachments = { ...mainAttachments, ...productAttachments };
          const prefilledFiles = [];
          Object.entries(mergedAttachments).forEach(([key, val]) => {
            if (val) {
              prefilledFiles.push({
                name: val.split('/').pop() || `${key}_doc`,
                path: val,
                preview: val.startsWith('/uploads') ? `${api.defaults.baseURL.replace('/api', '')}${val}` : val,
                isExisting: true,
                label: key
              });
            }
          });

          // Sizes required parsed
          const sizeReq = d.products?.[0]?.clothing_data?.sizes_required || {};
          const parsedSizes = Object.keys(sizeReq)
            .filter(sizeKey => sizeReq[sizeKey])
            .map(sizeKey => ({ size: sizeKey, quantity: '' }));

          setOrderData((prev) => ({
            ...prev,
            customerName: d.customer_name || '',
            contactPerson: d.contact_person || '',
            phone: d.mobile_number || '',
            email: d.email || '',
            gstNumber: d.customer_gstin || '',
            address: d.customer_address || '',
            deliveryAddress: d.delivery_address || d.customer_address || '',
            projectTitle: d.project_name || '',
            orderReference: d.requirement_number || '',
            quotationNo: d.quotation?.quotation_number || '',
            clientRequirementId: d.id,
            quotationId: d.quotation?.id || '',
            
            // Product info
            productName: d.product_name || '',
            productType: d.product_category || '',
            quantity: d.quantity || '',
            unit: d.unit || 'Pcs',
            pricePerPiece: d.quotation?.unit_price || '',
            gstPercentage: d.quotation?.tax_percentage || '18',
            discountPercentage: d.quotation?.discount_percentage || '0',
            advancePaid: d.quotation?.advance_paid || '0',
            paymentTerms: d.payment_terms || d.quotation?.payment_terms || '',
            
            // Technical Specs (auto-fetched)
            fabricType: d.material || d.products?.[0]?.clothing_data?.fabric_type || '',
            gsm: d.products?.[0]?.clothing_data?.fabric_gsm || '',
            color: d.color || d.products?.[0]?.clothing_data?.colors?.join(', ') || '',
            size: Object.keys(sizeReq).filter(k => sizeReq[k]).join(', ') || '',
            fit: d.products?.[0]?.clothing_data?.fit || '',
            pattern: d.products?.[0]?.clothing_data?.product_type || '',
            sleeveType: d.products?.[0]?.clothing_data?.sleeve_type || '',
            neckType: d.products?.[0]?.clothing_data?.neck_type || '',
            printType: d.products?.[0]?.clothing_data?.printing_required ? Object.keys(d.products[0].clothing_data.printing_required).filter(k => d.products[0].clothing_data.printing_required[k]).join(', ') : '',
            embroidery: d.products?.[0]?.clothing_data?.embroidery || '',
            packingType: d.products?.[0]?.clothing_data?.packing_type || '',
            specialInstructions: d.customer_special_instructions || d.description || '',
            customerInstructions: d.customer_special_instructions || d.description || '',
            
            sizeDetails: parsedSizes.length > 0 ? parsedSizes : prev.sizeDetails,
            designFiles: prefilledFiles
          }));
          toast.success('Auto-fetched all Client Requirement details!');
        } catch (err) {
          console.error('Error loading client requirement:', err);
          toast.error('Failed to auto-fetch Client Requirement details');
        } finally {
          setLoadingRequirement(false);
        }
      }
    };
    fetchRequirementAndPrefill();
  }, [location.state]);

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
    let totalQty = orderData.sizeDetails.reduce((sum, size) => sum + (parseFloat(size.quantity) || 0), 0);
    if (totalQty === 0) {
      totalQty = parseFloat(orderData.quantity) || 0;
    }
    
    const price = parseFloat(orderData.pricePerPiece) || 0;
    const subtotal = totalQty * price;
    const discountPercent = parseFloat(orderData.discountPercentage) || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    
    const gst = parseFloat(orderData.gstPercentage) || 0;
    const gstAmount = (taxableAmount * gst) / 100;
    const grandTotal = taxableAmount + gstAmount;
    
    const advance = parseFloat(orderData.advancePaid) || 0;
    const remainingAmount = grandTotal - advance;
    
    return {
      totalQty,
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxableAmount: taxableAmount.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      remainingAmount: remainingAmount.toFixed(2)
    };
  }, [orderData.sizeDetails, orderData.quantity, orderData.pricePerPiece, orderData.discountPercentage, orderData.gstPercentage, orderData.advancePaid]);

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
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 5MB limit`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrderData(prev => ({
          ...prev,
          designFiles: [...prev.designFiles, { file, name: file.name, preview: reader.result, isExisting: false }]
        }));
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
    toast.success('Attachment removed');
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
        customer_address: orderData.address || orderData.deliveryAddress || null,
        contact_person: orderData.contactPerson || null,
        gst_number: orderData.gstNumber || null,
        order_date: orderData.orderDate,
        project_title: orderData.projectTitle.trim(),
        buyer_reference: orderData.orderReference || orderData.projectTitle.trim(),
        client_po_number: orderData.clientPoNumber || null,
        delivery_date: orderData.expectedDeliveryDate,
        tax_percentage: parseFloat(orderData.gstPercentage) || 18,
        discount_percentage: parseFloat(orderData.discountPercentage) || 0,
        advance_paid: parseFloat(orderData.advancePaid) || 0,
        payment_terms: orderData.paymentTerms || null,
        shipping_address: orderData.deliveryAddress || null,
        billing_address: orderData.address || null,
        special_instructions: orderData.specialInstructions || null,
        client_requirement_id: orderData.clientRequirementId || null,
        quotation_id: orderData.quotationId || null,
        priority: orderData.priority || 'medium',
        garment_specifications: {
          product_name: orderData.productName,
          product_code: orderData.productCode,
          product_type: finalProductType,
          fabric_type: orderData.fabricType,
          gsm: orderData.gsm,
          color: orderData.color,
          size: orderData.size,
          fit: orderData.fit,
          pattern: orderData.pattern,
          sleeve_type: orderData.sleeveType,
          neck_type: orderData.neckType,
          print_type: orderData.printType,
          embroidery: orderData.embroidery,
          packing_type: orderData.packingType,
          customer_instructions: orderData.customerInstructions,
          design_files: orderData.designFiles.filter(df => !df.isExisting).map(df => df.name),
          existing_files: orderData.designFiles.filter(df => df.isExisting).map(df => df.path),
          department: orderData.department || null,
          transport_mode: orderData.transportMode || null,
          shipping_method: orderData.shippingMethod || null,
          dispatch_instructions: orderData.dispatchInstructions || null,
          delivery_terms: orderData.deliveryTerms || null,
          sales_person: orderData.salesPerson || null
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
            unit_of_measure: orderData.unit || 'pcs',
            size_breakdown: orderData.sizeDetails || null,
            remarks: `${finalProductType} - ${orderData.fabricType || 'N/A'} - ${orderData.color || 'N/A'}`
          }
        ]
      };

      const response = await api.post('/sales/orders', payload);
      const newOrder = response.data.order;
      
      // Update Client Requirement status if linked
      if (orderData.clientRequirementId) {
        try {
          await api.patch(`/client-requirements/${orderData.clientRequirementId}/status`, {
            status: 'Converted to SO'
          });
        } catch (statusErr) {
          console.error('Failed to update client requirement status:', statusErr);
        }
      }
      
      // Upload new design files
      const newFiles = orderData.designFiles.filter(df => !df.isExisting);
      if (newFiles.length > 0 && newOrder?.id) {
        try {
          const formData = new FormData();
          newFiles.forEach(df => {
            formData.append('files', df.file);
          });
          
          await api.post(`/sales/orders/${newOrder.id}/upload-design-files`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success('Design files uploaded successfully!');
        } catch (uploadErr) {
          console.warn('Failed to upload design files:', uploadErr);
          toast.warning('Order created but design file upload failed');
        }
      }
      
      setCreatedOrder(newOrder);
      toast.success('Sales order created successfully!');
    } catch (err) {
      console.error('Order creation error:', err);
      setSubmitError(err.response?.data?.message || 'Failed to create sales order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actions on success
  const handlePrintOrder = () => window.print();
  const handleDownloadPDF = async () => {
    if (!createdOrder) return;
    try {
      const response = await api.get(`/sales/orders/${createdOrder.id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SalesOrder-${createdOrder.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  if (loadingRequirement) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">Fetching details from Client Requirement...</p>
        </div>
      </div>
    );
  }

  // Success view
  if (createdOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
        <div className="mx-auto max-w-4xl bg-white border border-gray-200 rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <FaCheckCircle className="text-4xl text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Order Created Successfully!</h1>
            <p className="text-sm text-gray-500 mt-1">Order No: <span className="font-bold text-blue-600">{createdOrder.order_number}</span></p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Customer</p>
              <p className="font-bold text-gray-800 text-sm mt-1">{createdOrder.customer_name || orderData.customerName}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Project Name</p>
              <p className="font-bold text-gray-800 text-sm mt-1">{orderData.projectTitle}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Total Qty</p>
              <p className="font-bold text-gray-800 text-sm mt-1">{calculations.totalQty} Pcs</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Grand Total</p>
              <p className="font-bold text-green-700 text-sm mt-1">₹{calculations.grandTotal}</p>
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider text-center">Sales Order Workflow Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={() => navigate(`/sales/orders/${createdOrder.id}`)}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow animate-pulse"
              >
                Confirm Sales Order
              </button>
              <button
                onClick={() => toast.success('Mock Action: Design team notified!')}
                className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs border border-indigo-200 transition"
              >
                Assign Design Team
              </button>
              <button
                onClick={() => toast.success('Mock Action: Design order generated!')}
                className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs border border-indigo-200 transition"
              >
                Create Design Order
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.post(`/bom/generate/${createdOrder.id}`);
                    navigate('/procurement/bom');
                    toast.success('BOM Generated Successfully!');
                  } catch (err) {
                    toast.error('Failed to generate BOM');
                  }
                }}
                className="px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-semibold text-xs border border-orange-200 transition"
              >
                Generate BOM
              </button>
              <button
                onClick={() => {
                  navigate('/manufacturing/orders');
                  toast.success('Navigated to Production Planning');
                }}
                className="px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-semibold text-xs border border-purple-200 transition"
              >
                Production Planning
              </button>
              <button
                onClick={handlePrintOrder}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-gray-800 rounded-lg font-semibold text-xs border border-slate-300 transition"
              >
                Print Sales Order
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-gray-800 rounded-lg font-semibold text-xs border border-slate-300 transition"
              >
                Download PDF
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/sales/orders')}
              className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium text-xs transition"
            >
              ← Back to Sales Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/sales/orders')}
              className="p-2 hover:bg-white rounded-lg transition border border-gray-200 text-gray-600"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Sales Order</h1>
              {isFromRequirement && (
                <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit animate-pulse">
                  <FaLock className="w-2.5 h-2.5" />
                  <span>Converting from Requirement: {orderData.orderReference}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {submitError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5">
            <FaTimesCircle className="flex-shrink-0 text-red-500 w-4 h-4" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Multi-Section Tabs */}
        <div className="mb-4 flex gap-1 border-b border-gray-200 overflow-x-auto pb-1 bg-white p-1 rounded-lg border">
          {[
            { id: 'customer_so', label: '🎯 Customer & SO' },
            { id: 'product_info', label: '📦 Product Info' },
            { id: 'tech_specs', label: '⚙️ Technical Specs' },
            { id: 'documents', label: '📄 Documents' },
            { id: 'delivery_summary', label: '🚚 Summary & Delivery' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentSection(tab.id)}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs whitespace-nowrap transition ${
                currentSection === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TAB 1: Customer & SO */}
          {currentSection === 'customer_so' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center justify-between">
                <span>1. Customer & Sales Order Information</span>
                {isFromRequirement && <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Locked Fields Auto-filled</span>}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={orderData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Customer Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={orderData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Contact Person"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={orderData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Mobile Number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={orderData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Email Address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={orderData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="GSTIN"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sales Order No (Auto)</label>
                  <input
                    type="text"
                    value="SO-YYYYMMDD-XXXX (Auto-Generated)"
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Order Date</label>
                  <input
                    type="date"
                    value={orderData.orderDate}
                    onChange={(e) => handleInputChange('orderDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Client Requirement No.</label>
                  <input
                    type="text"
                    value={orderData.orderReference}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                    placeholder="CR-XXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quotation No.</label>
                  <input
                    type="text"
                    value={orderData.quotationNo}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                    placeholder="QT-XXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Customer PO No.</label>
                  <input
                    type="text"
                    value={orderData.clientPoNumber}
                    onChange={(e) => handleInputChange('clientPoNumber', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    placeholder="e.g. PO-12345"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sales Person</label>
                  <input
                    type="text"
                    value={orderData.salesPerson}
                    onChange={(e) => handleInputChange('salesPerson', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    placeholder="Responsible Sales Person"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Terms</label>
                  <input
                    type="text"
                    value={orderData.deliveryTerms}
                    onChange={(e) => handleInputChange('deliveryTerms', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    placeholder="e.g. EXW, FOB"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={orderData.paymentTerms}
                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    placeholder="e.g. 50% Advance, 50% on Delivery"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Billing Address</label>
                  <textarea
                    value={orderData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Billing Address"
                    rows="2"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentSection('product_info')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs transition animate-pulse"
                >
                  Next: Product Info →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Product Info */}
          {currentSection === 'product_info' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-800 border-b pb-2">2. Product Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Category</label>
                  <input
                    type="text"
                    value={orderData.productType}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={orderData.productName}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Type</label>
                  <input
                    type="text"
                    value={orderData.productType}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity (Units) *</label>
                  <input
                    type="number"
                    value={orderData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs font-semibold"
                    placeholder="Quantity"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={orderData.unit}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={orderData.pricePerPiece}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={orderData.discountPercentage}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">GST (%)</label>
                  <input
                    type="number"
                    value={orderData.gstPercentage}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Total Amount (₹)</label>
                  <input
                    type="text"
                    value={`₹${calculations.grandTotal}`}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 font-bold text-xs"
                  />
                </div>
              </div>

              {/* Size Breakdown */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-bold text-gray-800 mb-2">📋 Size breakdown / Breakdown quantities</h3>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                  {orderData.sizeDetails.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic">No size details loaded. Add below if required.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {orderData.sizeDetails.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                          <span className="text-xs font-bold text-gray-700 w-10 uppercase">{item.size}</span>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleSizeDetailChange(idx, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-full px-2 py-1 border border-gray-200 rounded text-xs outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={addSizeDetail}
                    className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    + Add Size Row
                  </button>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1">Remarks / Product Note</label>
                <textarea
                  value={orderData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                  placeholder="Additional order notes or customization remarks..."
                  rows="2"
                />
              </div>

              <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentSection('customer_so')}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 font-semibold text-xs transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSection('tech_specs')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs transition animate-pulse"
                >
                  Next: Technical Specs →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Technical Specs */}
          {currentSection === 'tech_specs' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center justify-between">
                <span>3. Technical Specifications</span>
                {isFromRequirement && <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Auto-fetched & Locked</span>}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fabric</label>
                  <input
                    type="text"
                    value={orderData.fabricType}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('fabricType', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">GSM</label>
                  <input
                    type="text"
                    value={orderData.gsm}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('gsm', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={orderData.color}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Size</label>
                  <input
                    type="text"
                    value={orderData.size}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fit</label>
                  <input
                    type="text"
                    value={orderData.fit}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('fit', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pattern</label>
                  <input
                    type="text"
                    value={orderData.pattern}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('pattern', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sleeve Type</label>
                  <input
                    type="text"
                    value={orderData.sleeveType}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('sleeveType', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Neck Type</label>
                  <input
                    type="text"
                    value={orderData.neckType}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('neckType', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Print Type</label>
                  <input
                    type="text"
                    value={orderData.printType}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('printType', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Embroidery</label>
                  <input
                    type="text"
                    value={orderData.embroidery}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('embroidery', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Packing Type</label>
                  <input
                    type="text"
                    value={orderData.packingType}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('packingType', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Customer Instructions</label>
                  <textarea
                    value={orderData.customerInstructions}
                    disabled={isFromRequirement}
                    onChange={(e) => handleInputChange('customerInstructions', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-normal"
                    rows="3"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentSection('product_info')}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 font-semibold text-xs transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSection('documents')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs transition animate-pulse"
                >
                  Next: Documents →
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Documents */}
          {currentSection === 'documents' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-800 border-b pb-2">4. Documents & Design Files</h2>

              {/* Existing Auto-fetched Attachments */}
              {orderData.designFiles.some(f => f.isExisting) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">📎 Auto-fetched Reference Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {orderData.designFiles.filter(f => f.isExisting).map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50 text-xs">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-gray-700 capitalize block">{file.label || 'Reference Document'}</span>
                          <span className="text-gray-500 truncate block mt-0.5">{file.name}</span>
                        </div>
                        <a
                          href={file.preview}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg shadow-sm flex items-center justify-center"
                          title="Download Reference File"
                        >
                          <FaDownload size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Files */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-2">Upload Customer PO / Design Files / Artwork</label>
                <label className="block w-full px-4 py-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 cursor-pointer transition flex flex-col items-center justify-center gap-2">
                  <FaCloudUploadAlt className="w-6 h-6 text-gray-400" />
                  <div className="text-center">
                    <p className="font-bold text-gray-700 text-xs">Click to browse or drop files here</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Images, PDFs, Tech Packs, Design Files (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    multiple
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded Files List */}
              {orderData.designFiles.some(f => !f.isExisting) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">📤 Newly Added Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {orderData.designFiles.filter(f => !f.isExisting).map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white text-xs">
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-700 truncate font-semibold">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDesignFile(orderData.designFiles.indexOf(file))}
                          className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentSection('tech_specs')}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 font-semibold text-xs transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSection('delivery_summary')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs transition animate-pulse"
                >
                  Next: Delivery & Summary →
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Delivery & Summary */}
          {currentSection === 'delivery_summary' && (
            <div className="space-y-4">
              {/* Delivery Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-gray-800 border-b pb-2">5. Delivery & Execution Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Expected Delivery Date *</label>
                    <input
                      type="date"
                      value={orderData.expectedDeliveryDate}
                      onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Transport Mode</label>
                    <input
                      type="text"
                      value={orderData.transportMode}
                      onChange={(e) => handleInputChange('transportMode', e.target.value)}
                      placeholder="e.g. Road, Air, Sea"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Shipping Method</label>
                    <input
                      type="text"
                      value={orderData.shippingMethod}
                      onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                      placeholder="e.g. Express, Normal"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                    <select
                      value={orderData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Dispatch Instructions</label>
                    <input
                      type="text"
                      value={orderData.dispatchInstructions}
                      onChange={(e) => handleInputChange('dispatchInstructions', e.target.value)}
                      placeholder="e.g. Ship with safety packing, double wrapping"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Address</label>
                    <textarea
                      value={orderData.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs font-semibold"
                      placeholder="Delivery address details..."
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary & Price Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-gray-800 border-b pb-2">6. Order Financial Summary</h2>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-gray-500 font-semibold">Total Quantity:</span>
                      <span className="font-bold text-gray-800">{calculations.totalQty} Pcs</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-gray-500 font-semibold">Total Amount (Before Tax):</span>
                      <span className="font-bold text-gray-800">₹{calculations.subtotal}</span>
                    </div>
                    {parseFloat(orderData.discountPercentage) > 0 && (
                      <div className="flex justify-between border-b pb-1.5 text-red-600">
                        <span className="font-semibold">Discount ({orderData.discountPercentage}%):</span>
                        <span className="font-bold">- ₹{calculations.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b pb-1.5 text-amber-600">
                      <span className="font-semibold">GST ({orderData.gstPercentage}%):</span>
                      <span className="font-bold">+ ₹{calculations.gstAmount}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm bg-blue-50 p-2 rounded border border-blue-200">
                      <span className="text-blue-800">Grand Total:</span>
                      <span className="text-blue-800">₹{calculations.grandTotal}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Advance Received (₹)</label>
                      <input
                        type="number"
                        value={orderData.advancePaid}
                        onChange={(e) => handleInputChange('advancePaid', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex justify-between font-bold text-xs bg-orange-50 p-2.5 rounded border border-orange-200 mt-2 text-orange-800">
                      <span>Balance Amount:</span>
                      <span>₹{calculations.remainingAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentSection('documents')}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 font-semibold text-xs transition"
                  >
                    ← Back
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/sales/orders')}
                      className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-semibold text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <FaCheck className="w-3 h-3" />
                          <span>Create Sales Order</span>
                        </>
                      )}
                    </button>
                  </div>
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