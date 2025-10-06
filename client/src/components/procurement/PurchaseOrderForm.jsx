import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Save, X } from 'lucide-react';

const PurchaseOrderForm = ({ 
  open, 
  mode, 
  initialValues, 
  linkedSalesOrder, 
  vendorOptions = [], 
  customerOptions = [],
  productOptions = [], 
  onClose, 
  onSubmit 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [productSearchTerms, setProductSearchTerms] = useState({});
  const [formData, setFormData] = useState({
    // Basic Order Information
    project_name: '',
    customer_id: '',
    client_name: '',
    vendor_id: '',
    po_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    priority: 'medium',
    status: 'draft',

    // Items Section
    items: [{
      product_id: '',
      description: '',
      hsn: '',
      uom: '',
      quantity: '',
      rate: '',
      total: 0
    }],

    // Financial Details
    payment_terms: '',
    delivery_address: '',
    special_instructions: '',
    terms_conditions: '',
    internal_notes: '',
    discount_percentage: 0,
    tax_percentage: 12,
    freight: 0
  });

  // Initialize form data when modal opens or initialValues change
  useEffect(() => {
    if (open) {
      if (mode === 'create' && !initialValues) {
        // Reset form for new PO
        setFormData({
          project_name: linkedSalesOrder?.customer?.name || '',
          customer_id: linkedSalesOrder?.customer_id || '',
          client_name: linkedSalesOrder?.customer?.name || '',
          vendor_id: '',
          po_date: new Date().toISOString().split('T')[0],
          expected_delivery_date: linkedSalesOrder?.delivery_date || '',
          priority: 'medium',
          status: 'draft',
          items: [{
            product_id: '',
            description: '',
            hsn: '',
            uom: '',
            quantity: '',
            rate: '',
            total: 0
          }],
          payment_terms: '',
          delivery_address: '',
          special_instructions: '',
          terms_conditions: '',
          internal_notes: '',
          discount_percentage: 0,
          tax_percentage: 12,
          freight: 0
        });
        setCurrentStep(0);
        setProductSearchTerms({});
      } else if (initialValues) {
        // Load existing PO data for edit/view
        setFormData({
          project_name: initialValues.project_name || '',
          customer_id: initialValues.customer_id || '',
          client_name: initialValues.client_name || '',
          vendor_id: initialValues.vendor_id || '',
          po_date: initialValues.po_date ? new Date(initialValues.po_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          expected_delivery_date: initialValues.expected_delivery_date ? new Date(initialValues.expected_delivery_date).toISOString().split('T')[0] : '',
          priority: initialValues.priority || 'medium',
          status: initialValues.status || 'draft',
          items: initialValues.items?.length > 0 ? initialValues.items : [{
            product_id: '',
            description: '',
            hsn: '',
            uom: '',
            quantity: '',
            rate: '',
            total: 0
          }],
          payment_terms: initialValues.payment_terms || '',
          delivery_address: initialValues.delivery_address || '',
          special_instructions: initialValues.special_instructions || '',
          terms_conditions: initialValues.terms_conditions || '',
          internal_notes: initialValues.internal_notes || '',
          discount_percentage: initialValues.discount_percentage || 0,
          tax_percentage: initialValues.tax_percentage || 12,
          freight: initialValues.freight || 0
        });
        setCurrentStep(0);
      }
    }
  }, [open, mode, initialValues, linkedSalesOrder]);

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'sent', label: 'Sent to Vendor' }
  ];

  const uomOptions = [
    'Meters', 'Kg', 'Yards', 'Pcs', 'Gross', 'Box', 'Cones', 'Rolls', 'Bales'
  ];

  // Calculate totals
  const calculateItemTotal = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return qty * rate;
  };

  const subtotal = formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const discountAmount = (subtotal * (parseFloat(formData.discount_percentage) || 0)) / 100;
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = (discountedSubtotal * (parseFloat(formData.tax_percentage) || 0)) / 100;
  const freightAmount = parseFloat(formData.freight) || 0;
  const grandTotal = discountedSubtotal + taxAmount + freightAmount;

  // Handle form changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].total = calculateItemTotal(updatedItems[index]);
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        product_id: '',
        description: '',
        hsn: '',
        uom: '',
        quantity: '',
        rate: '',
        total: 0
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.vendor_id) {
      return;
    }

    const payload = {
      ...formData,
      vendor_id: parseInt(formData.vendor_id),
      customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
      items: formData.items.filter(item => item.product_id || item.description),
      final_amount: grandTotal
    };

    if (linkedSalesOrder) {
      payload.linked_sales_order_id = linkedSalesOrder.id;
    }

    await onSubmit(payload, onClose);
  };

  const steps = [
    { title: 'Basic Information', description: 'Order details and vendor information' },
    { title: 'Items', description: 'Add items and products' },
    { title: 'Financial Details', description: 'Payment terms and additional details' }
  ];

  const isViewMode = mode === 'view';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create Purchase Order' : mode === 'edit' ? 'Edit Purchase Order' : 'View Purchase Order'}
            </h2>
            {linkedSalesOrder && (
              <p className="text-sm text-blue-600 mt-1">
                Creating PO from Sales Order: {linkedSalesOrder.order_number}
              </p>
            )}
            {initialValues?.po_number && (
              <p className="text-sm text-gray-600 mt-1">
                PO Number: {initialValues.po_number}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {/* Progress Indicator */}
          {!isViewMode && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        index <= currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <div className={`text-sm font-medium ${
                          index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-400">{step.description}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {(currentStep === 0 || isViewMode) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Order Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Show Client dropdown for independent POs, text field for SO-linked POs */}
                  {linkedSalesOrder ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name
                      </label>
                      <input
                        type="text"
                        value={formData.client_name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        disabled
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer / Client <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.customer_id}
                        onChange={(e) => {
                          handleInputChange('customer_id', e.target.value);
                          // Update client_name for display
                          const selectedCustomer = customerOptions.find(c => c.value === parseInt(e.target.value));
                          if (selectedCustomer) {
                            handleInputChange('client_name', selectedCustomer.label);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled={isViewMode}
                      >
                        <option value="">Select customer</option>
                        {customerOptions.map(customer => (
                          <option key={customer.value} value={customer.value}>{customer.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={formData.project_name}
                      onChange={(e) => handleInputChange('project_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isViewMode || !!linkedSalesOrder}
                      placeholder="Enter project name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.vendor_id}
                      onChange={(e) => handleInputChange('vendor_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isViewMode}
                    >
                      <option value="">Select vendor</option>
                      {vendorOptions.map(vendor => (
                        <option key={vendor.value} value={vendor.value}>{vendor.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PO Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.po_date}
                      onChange={(e) => handleInputChange('po_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isViewMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Delivery <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.expected_delivery_date}
                      onChange={(e) => handleInputChange('expected_delivery_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isViewMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isViewMode}
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isViewMode}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Items Section */}
            {(currentStep === 1 || isViewMode) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Item {index + 1} of {formData.items.length}</h4>
                        {formData.items.length > 1 && !isViewMode && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                          <input
                            type="text"
                            value={productSearchTerms[index] || (item.product_id ? productOptions.find(p => p.value === item.product_id)?.label : '')}
                            onChange={(e) => {
                              setProductSearchTerms(prev => ({ ...prev, [index]: e.target.value }));
                              // Try to find matching product
                              const matchingProduct = productOptions.find(p => 
                                p.label.toLowerCase() === e.target.value.toLowerCase()
                              );
                              if (matchingProduct) {
                                handleItemChange(index, 'product_id', matchingProduct.value);
                              } else {
                                handleItemChange(index, 'product_id', '');
                              }
                            }}
                            list={`products-list-${index}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isViewMode}
                            placeholder="Type to search products..."
                          />
                          <datalist id={`products-list-${index}`}>
                            {productOptions.map(product => (
                              <option key={product.value} value={product.label} />
                            ))}
                          </datalist>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Item description"
                            disabled={isViewMode}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">HSN</label>
                          <input
                            type="text"
                            value={item.hsn}
                            onChange={(e) => handleItemChange(index, 'hsn', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="HSN code"
                            disabled={isViewMode}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                          <select
                            value={item.uom}
                            onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isViewMode}
                          >
                            <option value="">Select UOM</option>
                            {uomOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Qty"
                            step="0.01"
                            disabled={isViewMode}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Rate"
                            step="0.01"
                            disabled={isViewMode}
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total (₹)</label>
                          <input
                            type="number"
                            value={item.total.toFixed(2)}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!isViewMode && (
                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                )}

                {/* Cost Summary */}
                <div className="mt-6 bg-gray-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Cost Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Financial Details */}
            {(currentStep === 2 || isViewMode) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                    <input
                      type="text"
                      value={formData.payment_terms}
                      onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 30 days credit"
                      disabled={isViewMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                    <textarea
                      value={formData.delivery_address}
                      onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Delivery address"
                      disabled={isViewMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                    <textarea
                      value={formData.special_instructions}
                      onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Special instructions"
                      disabled={isViewMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                    <textarea
                      value={formData.terms_conditions}
                      onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Terms and conditions"
                      disabled={isViewMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                    <textarea
                      value={formData.internal_notes}
                      onChange={(e) => handleInputChange('internal_notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Internal notes"
                      disabled={isViewMode}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                      <input
                        type="number"
                        value={formData.discount_percentage}
                        onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.01"
                        disabled={isViewMode}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax %</label>
                      <input
                        type="number"
                        value={formData.tax_percentage}
                        onChange={(e) => handleInputChange('tax_percentage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12"
                        min="0"
                        max="100"
                        step="0.01"
                        disabled={isViewMode}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Freight (₹)</label>
                      <input
                        type="number"
                        value={formData.freight}
                        onChange={(e) => handleInputChange('freight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        step="0.01"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Final Cost Summary */}
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">Final Cost Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({formData.discount_percentage}%):</span>
                      <span className="font-medium">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({formData.tax_percentage}%):</span>
                      <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Freight:</span>
                      <span className="font-medium">₹{freightAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Grand Total:</span>
                      <span className="text-blue-600">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          {isViewMode ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded shadow-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded shadow-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                {currentStep === steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    {mode === 'create' ? 'Create' : 'Update'} Purchase Order
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;