# Purchase Order Financial Details - Implementation Reference

## File Location

```
client/src/components/procurement/EnhancedPurchaseOrderForm.jsx
```

---

## New State Variables

### Form Data Fields

```javascript
// Payment Terms Section
payment_terms: '100% Advance Payment',    // Radio value (string)
payment_terms_custom: '',                  // Custom text (string, if "Other")

// Special Instructions Section
special_instructions_checkboxes: [],       // Array of selected instruction texts
special_instructions_notes: '',            // Textarea content (string)

// Terms & Conditions Section
terms_conditions_checkboxes: [             // Array of 6 booleans
  false, false, false, false, false, false
],
terms_conditions_notes: '',                // Optional textarea (string)
```

### Validation State

```javascript
const [validationErrors, setValidationErrors] = useState({
  payment_terms: null, // null | error message string
  special_instructions: null, // null | error message string
  terms_conditions: null, // null | error message string
});
```

---

## Event Handlers

### 1. Handle Payment Terms Selection

```javascript
const handlePaymentTermsChange = (value) => {
  // Update selected option
  setFormData(prev => ({
    ...prev,
    payment_terms: value,
    // Clear custom field if not "Other"
    payment_terms_custom: value === 'Other' ? prev.payment_terms_custom : ''
  }));
  // Clear any validation error
  setValidationErrors(prev => ({ ...prev, payment_terms: null }));
};

// Usage:
onChange={(e) => handlePaymentTermsChange(e.target.value)}
```

### 2. Handle Special Instructions Checkboxes

```javascript
const handleSpecialInstructionsCheckbox = (index, checked) => {
  const instructions = [
    'Urgent order — prioritize production and delivery',
    'Separate packaging required per item',
    'Add customer branding / labeling',
    'Requires quality inspection before dispatch'
  ];

  setFormData(prev => {
    const updated = [...prev.special_instructions_checkboxes];
    if (checked) {
      // Add to array if checked
      if (!updated.includes(instructions[index])) {
        updated.push(instructions[index]);
      }
    } else {
      // Remove from array if unchecked
      updated = updated.filter(item => item !== instructions[index]);
    }
    return { ...prev, special_instructions_checkboxes: updated };
  });

  // Clear validation error
  setValidationErrors(prev => ({ ...prev, special_instructions: null }));
};

// Usage:
onChange={(e) => handleSpecialInstructionsCheckbox(index, e.target.checked)}
```

### 3. Handle Terms & Conditions Checkboxes

```javascript
const handleTermsCheckbox = (index, checked) => {
  setFormData(prev => {
    const updated = [...prev.terms_conditions_checkboxes];
    updated[index] = checked;  // Set boolean at index
    return { ...prev, terms_conditions_checkboxes: updated };
  });

  // Clear validation error
  setValidationErrors(prev => ({ ...prev, terms_conditions: null }));
};

// Usage:
onChange={(e) => handleTermsCheckbox(index, e.target.checked)}
```

### 4. Validation Function

```javascript
const validateFinancialDetails = () => {
  const errors = {};

  // Validation 1: Payment Terms
  if (!formData.payment_terms) {
    errors.payment_terms = "Select a payment term.";
  } else if (
    formData.payment_terms === "Other" &&
    !formData.payment_terms_custom.trim()
  ) {
    errors.payment_terms = "Enter custom payment terms (required)";
  }

  // Validation 2: Special Instructions
  // Must have at least 1 checkbox selected OR notes text
  if (
    formData.special_instructions_checkboxes.length === 0 &&
    !formData.special_instructions_notes.trim()
  ) {
    errors.special_instructions =
      "Select at least one instruction or add a note.";
  }

  // Validation 3: Terms & Conditions
  // ALL 6 must be true
  if (
    !formData.terms_conditions_checkboxes.every((checked) => checked === true)
  ) {
    errors.terms_conditions = "You must accept all terms to proceed.";
  }

  // Update state and return validity
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};
```

### 5. Updated Submit Handler

```javascript
const handleSubmit = async (actionType = "save_draft") => {
  if (!formData.vendor_id) {
    alert("Please select a vendor");
    return;
  }

  // NEW: Validate Financial Details on final step
  if (currentStep === 2 && !validateFinancialDetails()) {
    alert(
      "Please complete all required Financial Details sections before submitting."
    );
    return;
  }

  // Rest of submission logic...
  const payload = {
    ...formData,
    // Data structure is ready to send as-is
  };

  // Submit...
};
```

---

## Form Initialization

### When Linked to Sales Order

```javascript
// In useEffect when linkedSalesOrder changes:
setFormData({
  // ... basic fields ...

  payment_terms: "100% Advance Payment", // Default
  payment_terms_custom: "", // Empty
  delivery_address: "",
  special_instructions_checkboxes: [], // Empty array
  special_instructions_notes: linkedSalesOrder.special_instructions || "", // Prefilled if available
  terms_conditions_checkboxes: [false, false, false, false, false, false], // All unchecked
  terms_conditions_notes: "",

  // ... cost fields ...
});
```

### When Creating New PO (No Sales Order)

```javascript
setFormData({
  // ... basic fields ...

  payment_terms: "100% Advance Payment",
  payment_terms_custom: "",
  delivery_address: "",
  special_instructions_checkboxes: [],
  special_instructions_notes: "",
  terms_conditions_checkboxes: [false, false, false, false, false, false],
  terms_conditions_notes: "",

  // ... cost fields ...
});
```

### When Editing Existing PO

```javascript
setFormData({
  // ... basic fields ...

  payment_terms: initialValues.payment_terms || "100% Advance Payment",
  payment_terms_custom: initialValues.payment_terms_custom || "",
  delivery_address: initialValues.delivery_address || "",
  special_instructions_checkboxes:
    initialValues.special_instructions_checkboxes || [],
  special_instructions_notes: initialValues.special_instructions_notes || "",
  terms_conditions_checkboxes: initialValues.terms_conditions_checkboxes || [
    false,
    false,
    false,
    false,
    false,
    false,
  ],
  terms_conditions_notes: initialValues.terms_conditions_notes || "",

  // ... cost fields ...
});
```

---

## Rendering Logic

### Payment Terms Section (Blue)

```javascript
<div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
  <div className="flex items-center gap-2 mb-4">
    <h3 className="text-lg font-semibold text-gray-900">Payment Terms</h3>
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
        className="flex items-center gap-3 p-3 rounded-lg 
                                      hover:bg-blue-100 cursor-pointer transition-colors"
      >
        <input
          type="radio"
          name="payment_terms"
          value={option}
          checked={formData.payment_terms === option}
          onChange={(e) => handlePaymentTermsChange(e.target.value)}
          disabled={isViewMode}
          className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">{option}</span>
      </label>
    ))}
  </div>

  {/* Conditional: Custom field for "Other" */}
  {formData.payment_terms === "Other" && (
    <div className="mt-4">
      <input
        type="text"
        value={formData.payment_terms_custom}
        onChange={(e) =>
          handleInputChange("payment_terms_custom", e.target.value)
        }
        placeholder="Enter custom payment terms (required)"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )}

  {/* Error display */}
  {validationErrors.payment_terms && (
    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
      <span>⚠️</span> {validationErrors.payment_terms}
    </p>
  )}
</div>
```

### Special Instructions Section (Purple)

```javascript
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
        className="flex items-start gap-3 p-3 rounded-lg 
                                          hover:bg-purple-100 cursor-pointer transition-colors"
      >
        <input
          type="checkbox"
          checked={formData.special_instructions_checkboxes.includes(
            instruction
          )}
          onChange={(e) =>
            handleSpecialInstructionsCheckbox(index, e.target.checked)
          }
          className="w-4 h-4 mt-0.5 text-purple-600 focus:ring-2 
                     focus:ring-purple-500 rounded"
        />
        <span className="text-sm font-medium text-gray-700">{instruction}</span>
      </label>
    ))}
  </div>

  {/* Additional Notes textarea */}
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
        handleInputChange("special_instructions_notes", e.target.value)
      }
      placeholder="e.g., special packing, labeling, priority handling..."
      rows="3"
      className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    />
  </div>

  {/* Error display */}
  {validationErrors.special_instructions && (
    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
      <span>⚠️</span> {validationErrors.special_instructions}
    </p>
  )}
</div>
```

### Terms & Conditions Section (Green)

```javascript
<div className="bg-green-50 rounded-lg border border-green-200 p-6">
  <div className="flex items-center gap-2 mb-4">
    <h3 className="text-lg font-semibold text-gray-900">Terms & Conditions</h3>
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
        className="flex items-start gap-3 p-3 rounded-lg 
                                    hover:bg-green-100 cursor-pointer transition-colors"
      >
        <input
          type="checkbox"
          checked={formData.terms_conditions_checkboxes[index] === true}
          onChange={(e) => handleTermsCheckbox(index, e.target.checked)}
          className="w-4 h-4 mt-0.5 text-green-600 focus:ring-2 
                     focus:ring-green-500 rounded"
        />
        <span className="text-sm font-medium text-gray-700">{term}</span>
      </label>
    ))}
  </div>

  {/* Optional Notes textarea */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Optional Notes
    </label>
    <textarea
      value={formData.terms_conditions_notes}
      onChange={(e) =>
        handleInputChange("terms_conditions_notes", e.target.value)
      }
      placeholder="Optional notes about terms..."
      rows="2"
      className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-green-500 focus:border-transparent"
    />
  </div>

  {/* Error display */}
  {validationErrors.terms_conditions && (
    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
      <span>⚠️</span> {validationErrors.terms_conditions}
    </p>
  )}
</div>
```

---

## Data Payload Structure

### On Form Submission

```javascript
{
  // Basic Information
  project_name: "SO-20251031-0002",
  customer_id: 5,
  client_name: "Ashwini Khedekar",
  vendor_id: 3,
  po_date: "2025-01-15",
  expected_delivery_date: "2025-02-15",
  priority: "high",

  // Items
  items: [
    {
      type: "fabric",
      fabric_name: "Cotton Lycra",
      color: "Navy Blue",
      hsn: "52081900",
      gsm: "180",
      width: "60 inch",
      uom: "Meters",
      quantity: 100,
      rate: 150,
      total: 15000,
      supplier: "Vendor Name",
      remarks: "Pre-shrunk"
    }
  ],

  // Financial Details - PAYMENT TERMS
  payment_terms: "50% Advance • 50% Before Delivery",
  payment_terms_custom: "",

  // Financial Details - SPECIAL INSTRUCTIONS
  special_instructions_checkboxes: [
    "Urgent order — prioritize production and delivery",
    "Requires quality inspection before dispatch"
  ],
  special_instructions_notes: "Please expedite this order",

  // Financial Details - TERMS & CONDITIONS
  terms_conditions_checkboxes: [
    true, true, true, true, true, true  // All 6 checked
  ],
  terms_conditions_notes: "Standard terms accepted",

  // Supporting Fields
  delivery_address: "Warehouse #3, Delhi",
  internal_notes: "Linked to SO: SO-20251031-0002",

  // Cost Calculations
  discount_percentage: 5,
  tax_percentage: 12,
  freight: 500,
  final_amount: 21300,

  // Submission Metadata
  status: "pending_approval",
  action_type: "save_draft",
  linked_sales_order_id: 7
}
```

---

## Backend Database Schema (Suggested)

```sql
-- PurchaseOrders table additions
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS (
  payment_terms VARCHAR(255),
  payment_terms_custom VARCHAR(500),
  special_instructions_checkboxes JSON,
  special_instructions_notes LONGTEXT,
  terms_conditions_checkboxes JSON,
  terms_conditions_notes LONGTEXT,
  delivery_address VARCHAR(500),
  internal_notes LONGTEXT
);
```

### Sequelize Model Definition

```javascript
// In PurchaseOrder model
payment_terms: {
  type: DataTypes.STRING(255),
  defaultValue: '100% Advance Payment'
},
payment_terms_custom: {
  type: DataTypes.STRING(500)
},
special_instructions_checkboxes: {
  type: DataTypes.JSON,
  defaultValue: []
},
special_instructions_notes: {
  type: DataTypes.TEXT
},
terms_conditions_checkboxes: {
  type: DataTypes.JSON,
  defaultValue: [false, false, false, false, false, false]
},
terms_conditions_notes: {
  type: DataTypes.TEXT
},
delivery_address: {
  type: DataTypes.STRING(500)
},
internal_notes: {
  type: DataTypes.TEXT
}
```

---

## Common Issues & Solutions

### Issue 1: Custom Payment Terms Not Showing

**Problem**: Custom text input doesn't appear when "Other" is selected

```javascript
// Check: Is the condition correct?
{formData.payment_terms === 'Other' && (
  // Custom input JSX
)}
```

### Issue 2: Special Instructions Not Saving

**Problem**: Checkboxes don't persist when editing

```javascript
// Ensure initialValues includes the new fields:
special_instructions_checkboxes: initialValues.special_instructions_checkboxes || [],
special_instructions_notes: initialValues.special_instructions_notes || ''
```

### Issue 3: Validation Not Triggering

**Problem**: Form submits even with validation errors

```javascript
// Check: Is validateFinancialDetails() called in handleSubmit?
if (currentStep === 2 && !validateFinancialDetails()) {
  alert("Please complete all required Financial Details sections.");
  return; // Prevent submission
}
```

### Issue 4: Terms Checkbox Shows Unchecked After Selection

**Problem**: Clicking checkbox doesn't update state

```javascript
// Ensure index is correct:
checked={formData.terms_conditions_checkboxes[index] === true}
// Not: checked={formData.terms_conditions_checkboxes[index]}
```

---

## Testing Checklist

### Unit Tests

- [ ] Radio button selection updates formData correctly
- [ ] "Other" payment term shows/hides custom input
- [ ] Custom payment term validation triggers
- [ ] Special instructions checkboxes can be checked/unchecked
- [ ] Special instructions validation: checkbox OR notes
- [ ] Terms & Conditions validation: all 6 must be true

### Integration Tests

- [ ] Form submission validates all sections
- [ ] Validation errors display correctly
- [ ] Error messages clear on field change
- [ ] Prefilled data loads on edit
- [ ] Payload structure correct on submit

### User Tests

- [ ] Can complete form on desktop (1920px)
- [ ] Can complete form on tablet (768px)
- [ ] Can complete form on mobile (375px)
- [ ] Keyboard navigation works
- [ ] Screen reader announces all fields
- [ ] Tab order is logical

---

## Performance Considerations

### Optimization Points

1. **Checkbox Arrays**: Using array.includes() is O(n) - acceptable for 4 instructions
2. **State Updates**: Each handler creates new array - necessary for React
3. **Validation**: Runs only on submit, not on every keystroke
4. **Re-renders**: Validation errors component only re-renders when error changes

### Memory Usage

- Minimal: 3 string fields, 2 small arrays, 1 boolean array
- Total: ~200 bytes per form instance

---

## Browser Compatibility

✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ Mobile Safari 14+
❌ IE 11 (Not supported - uses modern React hooks)
