# Purchase Order Financial Details Enhancement

## Overview

Enhanced the **Create Purchase Order** form's **Financial Details** (Step 3) section with three sophisticated, validation-enabled subsections for better data capture and user experience.

**URL**: `http://localhost:3000/procurement/purchase-orders/create?from_sales_order=7`

---

## Features Implemented

### 🎯 SECTION 1: PAYMENT TERMS (Required)

#### UI Components

- **Input Type**: Radio button group (single select)
- **Options Available**:
  1. 100% Advance Payment
  2. 50% Advance • 50% Before Delivery
  3. 30% Advance • 70% After QC Approval
  4. Net 30 Days (Credit After Delivery)
  5. Other (shows custom input when selected)

#### Behavior

- Radio buttons are mutually exclusive (only one can be selected)
- Hovering over options shows highlight effect (light blue background)
- When "Other" is selected, a required text input appears below
- Custom text input is required when "Other" option is chosen

#### Validation

- **Validation Rule**: Payment terms must be selected
- **Error Messages**:
  - "Select a payment term." (if none selected)
  - "Enter custom payment terms (required)" (if "Other" selected but field empty)
- Error displays in red with ⚠️ icon below the section
- Validation triggers on form submission

#### Styling

- **Background**: Blue gradient (bg-blue-50)
- **Border**: Blue border (border-blue-200)
- **Label Icon**: Red asterisk (\*) indicating required field
- **Focus States**: Focus ring shows blue highlight (focus:ring-blue-500)

---

### 🎯 SECTION 2: SPECIAL INSTRUCTIONS (Required)

#### UI Components

- **Primary Input**: 4 Pre-defined checkboxes (multi-select)
- **Checkboxes**:

  1. ☑️ Urgent order — prioritize production and delivery
  2. ☑️ Separate packaging required per item
  3. ☑️ Add customer branding / labeling
  4. ☑️ Requires quality inspection before dispatch

- **Secondary Input**: "Additional Notes" textarea
  - Placeholder: "e.g., special packing, labeling, priority handling..."
  - Rows: 3 (expandable)
  - Optional by itself, but required if no checkboxes selected

#### Intelligent Validation Logic

**Section is considered COMPLETE if**:

- ✅ At least ONE checkbox is checked, OR
- ✅ Additional Notes textarea has content

**Section shows error if**:

- ❌ No checkboxes selected AND Additional Notes is empty
- **Error Message**: "Select at least one instruction or add a note."

#### Behavior

- Checkboxes are independent (multiple can be selected)
- Hovering shows light purple highlight (hover:bg-purple-100)
- Checking a box stores the full text in the formData array
- Unchecking removes it from the array
- TextField accepts any custom instructions/notes

#### Styling

- **Background**: Purple gradient (bg-purple-50)
- **Border**: Purple border (border-purple-200)
- **Checkboxes**: Purple accent (text-purple-600)
- **Label**: Red asterisk (\*) indicating required section
- **Helper Text**: "Optional, but required if no instruction selected"
- **Error Display**: Red text with ⚠️ icon

---

### 🎯 SECTION 3: TERMS & CONDITIONS (Required - All 6 Must Be Checked)

#### UI Components

- **Input Type**: 6 Required checkboxes (ALL must be checked)
- **Checkboxes**:

  1. ☑️ I confirm the product specifications and quantities are correct.
  2. ☑️ I accept the delivery timeline and schedule.
  3. ☑️ I agree to the selected payment terms.
  4. ☑️ I understand that cancellations after production may incur charges.
  5. ☑️ I agree that warranty covers only manufacturing defects.
  6. ☑️ I accept the return/refund policy.

- **Optional Notes**: Textarea for additional T&C notes
  - Placeholder: "Optional notes about terms..."
  - Rows: 2
  - Optional (doesn't affect validation)

#### Strict Validation Logic

- **Validation Rule**: ALL 6 checkboxes MUST be checked
- **Error Message** (if any unchecked): "You must accept all terms to proceed."
- Error prevents form submission

#### Behavior

- Each checkbox is independent
- Hovering shows light green highlight (hover:bg-green-100)
- Visual checkmark when all 6 are checked
- Error state clears as soon as last required checkbox is checked

#### Styling

- **Background**: Green gradient (bg-green-50)
- **Border**: Green border (border-green-200)
- **Checkboxes**: Green accent (text-green-600)
- **Label**: Red badge "\* All required" to emphasize strict requirement
- **Error Display**: Red text with ⚠️ icon

---

## Form State Management

### FormData Structure

```javascript
{
  // ... other fields ...

  // Financial Details - Payment Terms
  payment_terms: '100% Advance Payment',        // Selected option
  payment_terms_custom: '',                      // Custom text if "Other"

  // Financial Details - Special Instructions
  special_instructions_checkboxes: [],           // Array of selected instruction texts
  special_instructions_notes: '',                // Textarea content

  // Financial Details - Terms & Conditions
  terms_conditions_checkboxes: [                 // Array of 6 booleans
    false, false, false, false, false, false
  ],
  terms_conditions_notes: '',                    // Optional textarea

  // ... cost summary fields ...
  delivery_address: '',
  internal_notes: '',
  discount_percentage: 0,
  tax_percentage: 12,
  freight: 0
}
```

### Validation State

```javascript
validationErrors = {
  payment_terms: null, // Error message or null
  special_instructions: null, // Error message or null
  terms_conditions: null, // Error message or null
};
```

---

## Event Handlers Implemented

### 1. `handlePaymentTermsChange(value)`

- Updates `payment_terms` with selected radio value
- Clears `payment_terms_custom` if not "Other"
- Clears validation error
- Shows custom input when "Other" selected

### 2. `handleSpecialInstructionsCheckbox(index, checked)`

- Adds/removes instruction text from `special_instructions_checkboxes` array
- Updates array on check/uncheck
- Clears validation error when changed
- Supports multi-select

### 3. `handleTermsCheckbox(index, checked)`

- Updates `terms_conditions_checkboxes` array at specific index
- Sets boolean true/false
- Clears validation error when changed
- Validates all 6 are true before allowing submission

### 4. `validateFinancialDetails()`

- Validates Payment Terms: must be selected, custom text required if "Other"
- Validates Special Instructions: at least one checkbox OR notes required
- Validates Terms & Conditions: ALL 6 must be checked
- Returns true if all valid, false if any error
- Sets `validationErrors` state with error messages

---

## Validation Timing

### When Validation Occurs

1. **On Field Change**: Errors clear when user makes changes
2. **On Form Submission**: Full validation runs before submission
   - Only happens when user clicks "Create PO & Send for Approval" button
   - Only on Step 3 (Financial Details) submission
   - Alert shown if validation fails: "Please complete all required Financial Details sections before submitting."

### Validation Flow

```
User clicks Submit Button
  ↓
currentStep === 2? (Is on Financial Details step?)
  ↓
YES → Run validateFinancialDetails()
  ↓
All Valid? → Proceed with submission
All Valid? → Show alert & prevent submission
```

---

## Display & Accessibility Features

### Color Coding

- 🔵 **Blue** (Payment Terms): Information-focused section
- 🟣 **Purple** (Special Instructions): Flexible/Optional-conditional section
- 🟢 **Green** (Terms & Conditions): Strict/Required section
- ⚪ **Gray** (Delivery & Internal Notes): Metadata section

### Visual Indicators

- **Required Fields**: Red asterisk (_) or "_ All required" badge
- **Helper Text**: Smaller gray text explaining field purpose
- **Errors**: Red text with ⚠️ icon
- **Hover Effects**: Subtle background color change on hover
- **Focus States**: Focus ring shows colored outline

### Keyboard Support

- ✅ All inputs are keyboard accessible
- ✅ Tab navigation works through all checkboxes and radio buttons
- ✅ Enter/Space keys toggle checkboxes and radio buttons
- ✅ Screen reader compatible with proper labels

---

## User Experience Flow

### Creating a New Purchase Order

```
Step 1: Basic Information
  ↓ (Enter vendor, customer, dates)
  ↓ Click "Next"

Step 2: Items
  ↓ (Add fabric/accessories items)
  ↓ Click "Next"

Step 3: Financial Details
  ├─ Select Payment Terms (required)
  │  └─ If "Other" selected → Enter custom text
  │
  ├─ Select Special Instructions (required)
  │  ├─ Check at least 1 option OR
  │  └─ Add Additional Notes
  │
  ├─ Accept Terms & Conditions (required)
  │  └─ Check all 6 checkboxes
  │
  ├─ Enter Delivery Address (optional)
  ├─ Add Internal Notes (optional)
  ├─ Review Cost Summary (auto-calculated)
  │
  └─ Click "Create PO & Send for Approval"
     └─ Validates all 3 sections
     └─ If valid → Submits and sends to admin
     └─ If invalid → Shows alert with errors
```

---

## Data Flow on Submission

When form is submitted with action type `'save_draft'`:

```javascript
payload = {
  // ... basic info and items ...

  // Payment Terms
  payment_terms: "50% Advance • 50% Before Delivery",
  payment_terms_custom: "",

  // Special Instructions
  special_instructions_checkboxes: [
    "Urgent order — prioritize production and delivery",
    "Requires quality inspection before dispatch",
  ],
  special_instructions_notes: "Please handle with care",

  // Terms & Conditions
  terms_conditions_checkboxes: [true, true, true, true, true, true],
  terms_conditions_notes: "Standard T&Cs accepted",

  // ... other fields ...
  delivery_address: "Warehouse #3, Delhi",
  internal_notes: "Linked to SO: SO-20251031-0002",

  status: "pending_approval",
  action_type: "save_draft",
};
```

---

## Integration with Existing Features

### Cost Summary Section

- Remains unchanged below the new Financial Details sections
- Shows Discount %, Tax %, and Freight calculations
- Displays Final Cost Summary with Grand Total

### View Mode (`isViewMode`)

- All inputs disabled when `mode === 'view'`
- Validation errors not shown in view mode
- User can still see all entered values
- Print button available to print the PO

### Edit Mode

- Can modify all Financial Details fields
- Re-validates on submission
- Preserves existing data from previous save

---

## Files Modified

- **File**: `client/src/components/procurement/EnhancedPurchaseOrderForm.jsx`
- **Changes**:
  - Added new formData fields for Payment Terms, Special Instructions, Terms & Conditions
  - Added `validationErrors` state
  - Added handler functions for new checkbox/radio interactions
  - Added `validateFinancialDetails()` function
  - Replaced simple text inputs with structured sections
  - Updated form submission logic to validate before submit
  - Enhanced Step 3 UI with color-coded sections

---

## Testing Checklist

- [ ] Payment Terms: Can select each of the 5 radio options
- [ ] Payment Terms: "Other" option shows custom input
- [ ] Payment Terms: Custom input is required when "Other" selected
- [ ] Special Instructions: Can check/uncheck multiple options
- [ ] Special Instructions: Can add notes in textarea
- [ ] Special Instructions: Accepts valid submission with either checkbox OR notes
- [ ] Special Instructions: Shows error when neither checkbox nor notes filled
- [ ] Terms & Conditions: Requires all 6 checkboxes to be checked
- [ ] Terms & Conditions: Shows error if any unchecked
- [ ] Terms & Conditions: Can add optional notes
- [ ] Form Submission: Validates all 3 sections before allowing submit
- [ ] Form Submission: Shows alert with error messages if validation fails
- [ ] View Mode: All inputs disabled, values visible
- [ ] Edit Mode: Can modify values, re-validates on submit
- [ ] Cost Summary: Still displays correctly below new sections
- [ ] Mobile: Responsive design works on smaller screens
- [ ] Accessibility: Can navigate with Tab key, use Enter/Space for checkboxes

---

## Future Enhancements

1. **Dynamic Special Instructions**: Allow users to add custom instruction options
2. **Payment Terms Templates**: Save frequently used payment term combinations
3. **Terms & Conditions Versioning**: Track different T&C versions per vendor
4. **Conditional Validation**: Hide certain T&Cs based on order type
5. **Multi-language Support**: Translate all text labels and error messages
6. **Analytics**: Track which payment terms and special instructions are most used

---

## Quick Reference

### Required Validations

1. ✅ Payment Terms: Must select one option
2. ✅ Special Instructions: At least one checkbox OR notes text
3. ✅ Terms & Conditions: ALL 6 checkboxes must be checked

### Optional Fields

1. 📝 Payment Terms Custom: Only required if "Other" selected
2. 📝 Special Instructions Notes: Only if no checkboxes selected
3. 📝 Terms & Conditions Notes: Always optional
4. 📝 Delivery Address: Optional
5. 📝 Internal Notes: Optional

### Visual Colors

- 🔵 Blue: Payment Terms
- 🟣 Purple: Special Instructions
- 🟢 Green: Terms & Conditions
- ⚪ Gray: Supporting sections

### Error Indicators

- 🔴 Red text with ⚠️ icon for validation errors
- Shown below each section that has error
- Clears when user makes changes
