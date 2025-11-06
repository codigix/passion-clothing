import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Send,
  Package,
  CheckCircle,
  Printer,
  X,
} from "lucide-react";

const EnhancedPurchaseOrderForm = ({
  open,
  mode,
  initialValues,
  linkedSalesOrder,
  vendorOptions = [],
  customerOptions = [],
  productOptions = [],
  onClose,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Order Information
    project_name: "",
    customer_id: "",
    client_name: "",
    vendor_id: "",
    po_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: "",
    priority: "medium",
    status: "draft",

    // Items Section (Unified Fabric + Accessories)
    items: [
      {
        type: "fabric", // 'fabric' or 'accessories'
        // Fabric fields
        fabric_name: "",
        color: "",
        hsn: "",
        gsm: "",
        width: "",
        // Accessories fields
        item_name: "",
        description: "",
        // Common fields
        uom: "",
        quantity: "",
        rate: "",
        total: 0,
        supplier: "", // Auto-filled from vendor
        remarks: "",
      },
    ],

    // Financial Details
    payment_terms: "100% Advance Payment", // Radio selection
    payment_terms_custom: "", // Custom text if "Other" selected
    delivery_address: "",
    special_instructions_checkboxes: [], // Array of checked items
    special_instructions_notes: "", // Additional notes textarea
    terms_conditions_checkboxes: [], // Array of 6 checkbox states
    terms_conditions_notes: "", // Optional notes textarea
    internal_notes: "",
    discount_percentage: 0,
    tax_percentage: 12,
    freight: 0,
  });

  // Validation state for Financial Details sections
  const [validationErrors, setValidationErrors] = useState({
    payment_terms: null,
    special_instructions: null,
    terms_conditions: null,
  });

  // Initialize form data when modal opens or initialValues change
  useEffect(() => {
    if (open) {
      if (mode === "create" && !initialValues) {
        // Check if linked to Sales Order
        if (linkedSalesOrder) {
          // Auto-fill from Sales Order
          const soItems = linkedSalesOrder.items || [];
          const mappedItems = soItems.map((item) => ({
            type: item.product_type === "Fabric" ? "fabric" : "accessories",
            fabric_name:
              item.product_type === "Fabric" ? item.description || "" : "",
            color: item.color || "",
            hsn: item.hsn || "",
            gsm: item.gsm || "",
            width: item.width || "",
            item_name:
              item.product_type !== "Fabric" ? item.description || "" : "",
            description: item.description || "",
            uom: item.uom || "Meters",
            quantity: item.quantity || "",
            rate: item.unit_price || "",
            total: (item.quantity || 0) * (item.unit_price || 0),
            supplier: "",
            remarks: item.remarks || "",
          }));

          setFormData({
            project_name: linkedSalesOrder.buyer_reference || "",
            customer_id: linkedSalesOrder.customer_id || "",
            client_name: linkedSalesOrder.customer?.name || "",
            vendor_id: "",
            po_date: new Date().toISOString().split("T")[0],
            expected_delivery_date: linkedSalesOrder.delivery_date
              ? new Date(linkedSalesOrder.delivery_date)
                  .toISOString()
                  .split("T")[0]
              : "",
            priority: linkedSalesOrder.priority || "medium",
            status: "draft",
            items:
              mappedItems.length > 0
                ? mappedItems
                : [
                    {
                      type: "fabric",
                      fabric_name: "",
                      color: "",
                      hsn: "",
                      gsm: "",
                      width: "",
                      item_name: "",
                      description: "",
                      uom: "Meters",
                      quantity: "",
                      rate: "",
                      total: 0,
                      supplier: "",
                      remarks: "",
                    },
                  ],
            payment_terms: "100% Advance Payment",
            payment_terms_custom: "",
            delivery_address: "",
            special_instructions_checkboxes: [],
            special_instructions_notes:
              linkedSalesOrder.special_instructions || "",
            terms_conditions_checkboxes: [
              false,
              false,
              false,
              false,
              false,
              false,
            ],
            terms_conditions_notes: "",
            internal_notes: `Linked to SO: ${linkedSalesOrder.order_number}`,
            discount_percentage: 0,
            tax_percentage: 12,
            freight: 0,
          });
        } else {
          // Reset form for new PO
          setFormData({
            project_name: "",
            customer_id: "",
            client_name: "",
            vendor_id: "",
            po_date: new Date().toISOString().split("T")[0],
            expected_delivery_date: "",
            priority: "medium",
            status: "draft",
            items: [
              {
                type: "fabric",
                fabric_name: "",
                color: "",
                hsn: "",
                gsm: "",
                width: "",
                item_name: "",
                description: "",
                uom: "Meters",
                quantity: "",
                rate: "",
                total: 0,
                supplier: "",
                remarks: "",
              },
            ],
            payment_terms: "100% Advance Payment",
            payment_terms_custom: "",
            delivery_address: "",
            special_instructions_checkboxes: [],
            special_instructions_notes: "",
            terms_conditions_checkboxes: [
              false,
              false,
              false,
              false,
              false,
              false,
            ],
            terms_conditions_notes: "",
            internal_notes: "",
            discount_percentage: 0,
            tax_percentage: 12,
            freight: 0,
          });
        }
        setCurrentStep(0);
      } else if (initialValues) {
        // Load existing PO data for edit/view
        setFormData({
          project_name: initialValues.project_name || "",
          customer_id: initialValues.customer_id || "",
          client_name: initialValues.client_name || "",
          vendor_id: initialValues.vendor_id || "",
          po_date: initialValues.po_date
            ? new Date(initialValues.po_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          expected_delivery_date: initialValues.expected_delivery_date
            ? new Date(initialValues.expected_delivery_date)
                .toISOString()
                .split("T")[0]
            : "",
          priority: initialValues.priority || "medium",
          status: initialValues.status || "draft",
          items:
            initialValues.items?.length > 0
              ? initialValues.items
              : [
                  {
                    type: "fabric",
                    fabric_name: "",
                    color: "",
                    hsn: "",
                    gsm: "",
                    width: "",
                    item_name: "",
                    description: "",
                    uom: "Meters",
                    quantity: "",
                    rate: "",
                    total: 0,
                    supplier: "",
                    remarks: "",
                  },
                ],
          payment_terms: initialValues.payment_terms || "100% Advance Payment",
          payment_terms_custom: initialValues.payment_terms_custom || "",
          delivery_address: initialValues.delivery_address || "",
          special_instructions_checkboxes:
            initialValues.special_instructions_checkboxes || [],
          special_instructions_notes:
            initialValues.special_instructions_notes || "",
          terms_conditions_checkboxes:
            initialValues.terms_conditions_checkboxes || [
              false,
              false,
              false,
              false,
              false,
              false,
            ],
          terms_conditions_notes: initialValues.terms_conditions_notes || "",
          internal_notes: initialValues.internal_notes || "",
          discount_percentage: initialValues.discount_percentage || 0,
          tax_percentage: initialValues.tax_percentage || 12,
          freight: initialValues.freight || 0,
        });
        setCurrentStep(0);
      }
    }
  }, [open, mode, initialValues, linkedSalesOrder]);

  // Auto-fill supplier from vendor when vendor changes
  useEffect(() => {
    if (formData.vendor_id) {
      const selectedVendor = vendorOptions.find(
        (v) => v.value === parseInt(formData.vendor_id)
      );
      if (selectedVendor) {
        const updatedItems = formData.items.map((item) => ({
          ...item,
          supplier: selectedVendor.label,
        }));
        setFormData((prev) => ({ ...prev, items: updatedItems }));
      }
    }
  }, [formData.vendor_id, vendorOptions]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle payment terms radio change
  const handlePaymentTermsChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      payment_terms: value,
      payment_terms_custom: value === "Other" ? prev.payment_terms_custom : "",
    }));
    // Clear validation error when selection changes
    setValidationErrors((prev) => ({ ...prev, payment_terms: null }));
  };

  // Handle special instructions checkbox change
  const handleSpecialInstructionsCheckbox = (index, checked) => {
    const instructions = [
      "Urgent order — prioritize production and delivery",
      "Separate packaging required per item",
      "Add customer branding / labeling",
      "Requires quality inspection before dispatch",
    ];

    setFormData((prev) => {
      let updated = [...prev.special_instructions_checkboxes];
      if (checked) {
        if (!updated.includes(instructions[index])) {
          updated.push(instructions[index]);
        }
      } else {
        updated = updated.filter((item) => item !== instructions[index]);
      }
      return { ...prev, special_instructions_checkboxes: updated };
    });

    // Clear validation error
    setValidationErrors((prev) => ({ ...prev, special_instructions: null }));
  };

  // Handle terms & conditions checkbox change
  const handleTermsCheckbox = (index, checked) => {
    setFormData((prev) => {
      const updated = [...prev.terms_conditions_checkboxes];
      updated[index] = checked;
      return { ...prev, terms_conditions_checkboxes: updated };
    });

    // Clear validation error
    setValidationErrors((prev) => ({ ...prev, terms_conditions: null }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    // Auto-calculate total
    if (field === "quantity" || field === "rate") {
      const qty = parseFloat(updatedItems[index].quantity) || 0;
      const rate = parseFloat(updatedItems[index].rate) || 0;
      updatedItems[index].total = qty * rate;
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    const selectedVendor = vendorOptions.find(
      (v) => v.value === parseInt(formData.vendor_id)
    );
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          type: "fabric",
          fabric_name: "",
          color: "",
          hsn: "",
          gsm: "",
          width: "",
          item_name: "",
          description: "",
          uom: "Meters",
          quantity: "",
          rate: "",
          total: 0,
          supplier: selectedVendor ? selectedVendor.label : "",
          remarks: "",
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  // Calculate totals
  const subtotal = formData.items.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  );
  const discountAmount = subtotal * (formData.discount_percentage / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (formData.tax_percentage / 100);
  const freightAmount = parseFloat(formData.freight) || 0;
  const grandTotal = afterDiscount + taxAmount + freightAmount;

  // Validation function for Financial Details sections
  const validateFinancialDetails = () => {
    const errors = {};

    // Validate Payment Terms - must be selected
    if (!formData.payment_terms) {
      errors.payment_terms = "Select a payment term.";
    } else if (
      formData.payment_terms === "Other" &&
      !formData.payment_terms_custom.trim()
    ) {
      errors.payment_terms = "Enter custom payment terms (required)";
    }

    // Validate Special Instructions - at least one checkbox OR additional notes
    if (
      formData.special_instructions_checkboxes.length === 0 &&
      !formData.special_instructions_notes.trim()
    ) {
      errors.special_instructions =
        "Select at least one instruction or add a note.";
    }

    // Validate Terms & Conditions - ALL 6 must be checked
    if (
      !formData.terms_conditions_checkboxes.every((checked) => checked === true)
    ) {
      errors.terms_conditions = "You must accept all terms to proceed.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (actionType = "save_draft") => {
    if (!formData.vendor_id) {
      alert("Please select a vendor");
      return;
    }

    // Validate Financial Details on final step before submission
    if (currentStep === 2 && !validateFinancialDetails()) {
      alert(
        "Please complete all required Financial Details sections before submitting."
      );
      return;
    }

    const payload = {
      ...formData,
      vendor_id: parseInt(formData.vendor_id),
      customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
      items: formData.items.filter((item) => {
        if (item.type === "fabric") {
          return item.fabric_name || item.color;
        } else {
          return item.item_name || item.description;
        }
      }),
      final_amount: grandTotal,
      action_type: actionType, // For backend to handle different actions
    };

    if (linkedSalesOrder) {
      payload.linked_sales_order_id = linkedSalesOrder.id;
    }

    // Update status based on action
    // Note: All new POs automatically go to 'pending_approval' for admin approval
    switch (actionType) {
      case "send_for_approval":
      case "save_draft": // Auto-send for approval
        payload.status = "pending_approval";
        break;
      case "send_to_vendor":
        payload.status = "sent";
        break;
      case "mark_as_ordered":
        payload.status = "acknowledged";
        break;
      case "mark_as_received":
        payload.status = "received";
        break;
      default:
        payload.status = "pending_approval"; // Default: auto-send for approval
    }

    await onSubmit(payload, onClose);
  };

  const handlePrint = () => {
    window.print();
  };

  const steps = [
    {
      title: "Basic Information",
      description: "Order details and vendor information",
    },
    { title: "Items", description: "Add fabric and accessories" },
    {
      title: "Financial Details",
      description: "Payment terms and additional details",
    },
  ];

  const isViewMode = mode === "view";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-xl my-8 flex flex-col max-h-[calc(100vh-4rem)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === "create"
                ? "Create Purchase Order"
                : mode === "edit"
                ? "Edit Purchase Order"
                : "View Purchase Order"}
            </h2>
            {linkedSalesOrder && (
              <p className="text-sm text-blue-600 mt-1 font-medium">
                📋 Creating PO from Sales Order: {linkedSalesOrder.order_number}
              </p>
            )}
            {initialValues?.po_number && (
              <p className="text-sm text-gray-600 mt-1">
                PO Number:{" "}
                <span className="font-semibold">{initialValues.po_number}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Progress Indicator */}
          {!isViewMode && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all ${
                          index <= currentStep
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <div
                          className={`text-sm font-medium ${
                            index <= currentStep
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          index < currentStep ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Basic Order Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {linkedSalesOrder ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Name (from SO)
                        </label>
                        <input
                          type="text"
                          value={formData.client_name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Project Name (from SO)
                        </label>
                        <input
                          type="text"
                          value={formData.project_name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          disabled
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer / Client
                        </label>
                        <select
                          value={formData.customer_id}
                          onChange={(e) => {
                            handleInputChange("customer_id", e.target.value);
                            const selectedCustomer = customerOptions.find(
                              (c) => c.value === parseInt(e.target.value)
                            );
                            if (selectedCustomer) {
                              handleInputChange(
                                "client_name",
                                selectedCustomer.label
                              );
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isViewMode}
                        >
                          <option value="">Select customer</option>
                          {customerOptions.map((customer) => (
                            <option key={customer.value} value={customer.value}>
                              {customer.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Project Name
                        </label>
                        <input
                          type="text"
                          value={formData.project_name}
                          onChange={(e) =>
                            handleInputChange("project_name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isViewMode}
                          placeholder="Enter project name"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.vendor_id}
                      onChange={(e) =>
                        handleInputChange("vendor_id", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isViewMode}
                    >
                      <option value="">Select vendor</option>
                      {vendorOptions.map((vendor) => (
                        <option key={vendor.value} value={vendor.value}>
                          {vendor.label}
                        </option>
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
                      onChange={(e) =>
                        handleInputChange("po_date", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange(
                          "expected_delivery_date",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isViewMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        handleInputChange("priority", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isViewMode}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Items (Fabric & Accessories) */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Items (Fabric & Accessories)
                  </h3>
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border-2 border-purple-100 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">
                          Item #{index + 1}
                        </h4>
                        {!isViewMode && formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Type Selector */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={item.type}
                            onChange={(e) =>
                              handleItemChange(index, "type", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={isViewMode}
                          >
                            <option value="fabric">Fabric</option>
                            <option value="accessories">Accessories</option>
                          </select>
                        </div>

                        {/* Conditional Fields Based on Type */}
                        {item.type === "fabric" ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fabric Name
                              </label>
                              <input
                                type="text"
                                value={item.fabric_name}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "fabric_name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={isViewMode}
                                placeholder="e.g., Cotton Lycra"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color
                              </label>
                              <input
                                type="text"
                                value={item.color}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "color",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={isViewMode}
                                placeholder="e.g., Navy Blue"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                HSN
                              </label>
                              <input
                                type="text"
                                value={item.hsn}
                                onChange={(e) =>
                                  handleItemChange(index, "hsn", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={isViewMode}
                                placeholder="HSN Code"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                GSM
                              </label>
                              <input
                                type="text"
                                value={item.gsm}
                                onChange={(e) =>
                                  handleItemChange(index, "gsm", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={isViewMode}
                                placeholder="e.g., 180"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Width
                              </label>
                              <input
                                type="text"
                                value={item.width}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "width",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={isViewMode}
                                placeholder="e.g., 60 inch"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Item Name
                              </label>
                              <input
                                type="text"
                                value={item.item_name}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "item_name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={isViewMode}
                                placeholder="e.g., Buttons"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={isViewMode}
                                placeholder="Detailed description"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                HSN
                              </label>
                              <input
                                type="text"
                                value={item.hsn}
                                onChange={(e) =>
                                  handleItemChange(index, "hsn", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={isViewMode}
                                placeholder="HSN Code"
                              />
                            </div>
                          </>
                        )}

                        {/* Common Fields */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            UOM
                          </label>
                          <select
                            value={item.uom}
                            onChange={(e) =>
                              handleItemChange(index, "uom", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={isViewMode}
                          >
                            <option value="Meters">Meters</option>
                            <option value="Yards">Yards</option>
                            <option value="Pieces">Pieces</option>
                            <option value="Kg">Kg</option>
                            <option value="Grams">Grams</option>
                            <option value="Sets">Sets</option>
                            <option value="Rolls">Rolls</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={isViewMode}
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rate (₹)
                          </label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemChange(index, "rate", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={isViewMode}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total (₹)
                          </label>
                          <input
                            type="text"
                            value={item.total.toFixed(2)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-semibold"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supplier
                          </label>
                          <input
                            type="text"
                            value={item.supplier}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50"
                            disabled
                            placeholder="Auto-filled from vendor"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Remarks
                          </label>
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) =>
                              handleItemChange(index, "remarks", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={isViewMode}
                            placeholder="Additional notes"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financial Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* SECTION 1: PAYMENT TERMS */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Payment Terms
                  </h3>
                  <span className="text-red-500 font-bold">*</span>
                </div>

                <div className="space-y-3">
                  {[
                    "100% Advance Payment",
                    "50% Advance • 50% Before Delivery",
                    "30% Advance • 70% After QC Approval",
                    "Net 30 Days (Credit After Delivery)",
                    "Other",
                  ].map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="payment_terms"
                        value={option}
                        checked={formData.payment_terms === option}
                        onChange={(e) =>
                          handlePaymentTermsChange(e.target.value)
                        }
                        disabled={isViewMode}
                        className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Custom Payment Terms Input */}
                {formData.payment_terms === "Other" && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={formData.payment_terms_custom}
                      onChange={(e) =>
                        handleInputChange(
                          "payment_terms_custom",
                          e.target.value
                        )
                      }
                      placeholder="Enter custom payment terms (required)"
                      disabled={isViewMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {validationErrors.payment_terms && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {validationErrors.payment_terms}
                  </p>
                )}
              </div>

              {/* SECTION 2: SPECIAL INSTRUCTIONS */}
              <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Special Instructions
                  </h3>
                  <span className="text-red-500 font-bold">*</span>
                </div>

                <div className="space-y-3 mb-4">
                  {[
                    "Urgent order — prioritize production and delivery",
                    "Separate packaging required per item",
                    "Add customer branding / labeling",
                    "Requires quality inspection before dispatch",
                  ].map((instruction, index) => (
                    <label
                      key={instruction}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.special_instructions_checkboxes.includes(
                          instruction
                        )}
                        onChange={(e) =>
                          handleSpecialInstructionsCheckbox(
                            index,
                            e.target.checked
                          )
                        }
                        disabled={isViewMode}
                        className="w-4 h-4 mt-0.5 text-purple-600 focus:ring-2 focus:ring-purple-500 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {instruction}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes{" "}
                    <span className="text-gray-500 text-xs">
                      (optional, but required if no instruction selected)
                    </span>
                  </label>
                  <textarea
                    value={formData.special_instructions_notes}
                    onChange={(e) =>
                      handleInputChange(
                        "special_instructions_notes",
                        e.target.value
                      )
                    }
                    placeholder="e.g., special packing, labeling, priority handling..."
                    disabled={isViewMode}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {validationErrors.special_instructions && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {validationErrors.special_instructions}
                  </p>
                )}
              </div>

              {/* SECTION 3: TERMS & CONDITIONS */}
              <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Terms & Conditions
                  </h3>
                  <span className="text-red-500 font-bold">* All required</span>
                </div>

                <div className="space-y-3 mb-4">
                  {[
                    "I confirm the product specifications and quantities are correct.",
                    "I accept the delivery timeline and schedule.",
                    "I agree to the selected payment terms.",
                    "I understand that cancellations after production may incur charges.",
                    "I agree that warranty covers only manufacturing defects.",
                    "I accept the return/refund policy.",
                  ].map((term, index) => (
                    <label
                      key={term}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-100 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData.terms_conditions_checkboxes[index] === true
                        }
                        onChange={(e) =>
                          handleTermsCheckbox(index, e.target.checked)
                        }
                        disabled={isViewMode}
                        className="w-4 h-4 mt-0.5 text-green-600 focus:ring-2 focus:ring-green-500 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {term}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Optional Notes
                  </label>
                  <textarea
                    value={formData.terms_conditions_notes}
                    onChange={(e) =>
                      handleInputChange(
                        "terms_conditions_notes",
                        e.target.value
                      )
                    }
                    placeholder="Optional notes about terms..."
                    disabled={isViewMode}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {validationErrors.terms_conditions && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {validationErrors.terms_conditions}
                  </p>
                )}
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delivery & Internal Notes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      value={formData.delivery_address}
                      onChange={(e) =>
                        handleInputChange("delivery_address", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isViewMode}
                      placeholder="Delivery location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Internal Notes
                    </label>
                    <textarea
                      value={formData.internal_notes}
                      onChange={(e) =>
                        handleInputChange("internal_notes", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isViewMode}
                      rows="2"
                      placeholder="Internal notes (not visible to vendor)"
                    />
                  </div>
                </div>
              </div>

              {/* Cost Calculations */}
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-3">
                  Cost Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      value={formData.discount_percentage}
                      onChange={(e) =>
                        handleInputChange("discount_percentage", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      disabled={isViewMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax %
                    </label>
                    <input
                      type="number"
                      value={formData.tax_percentage}
                      onChange={(e) =>
                        handleInputChange("tax_percentage", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="12"
                      min="0"
                      max="100"
                      step="0.01"
                      disabled={isViewMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Freight (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.freight}
                      onChange={(e) =>
                        handleInputChange("freight", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                      step="0.01"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>

              {/* Final Cost Summary */}
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 border-2 border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-3">
                  Final Cost Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-semibold">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({formData.discount_percentage}%):</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>After Discount:</span>
                    <span className="font-medium">
                      ₹{afterDiscount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({formData.tax_percentage}%):</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freight:</span>
                    <span>₹{freightAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-blue-300 pt-2 mt-2 flex justify-between text-lg font-bold text-blue-900">
                    <span>Grand Total:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
          {isViewMode ? (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print PO
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              {/* Navigation Buttons */}
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                {currentStep === steps.length - 1 ? (
                  // Final step: Show primary action button (auto-sends for approval)
                  <>
                    <button
                      type="button"
                      onClick={() => handleSubmit("save_draft")}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Send className="w-5 h-5" />
                      Create PO & Send for Approval
                    </button>
                    <div className="text-xs text-gray-500 italic max-w-xs">
                      Note: PO will be automatically sent to admin for approval
                    </div>
                  </>
                ) : (
                  // Not final step: Show Next button
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentStep(
                        Math.min(steps.length - 1, currentStep + 1)
                      )
                    }
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
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

export default EnhancedPurchaseOrderForm;
