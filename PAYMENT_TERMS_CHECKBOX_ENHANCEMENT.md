# Payment Terms - Checkbox Enhancement

## Overview

Successfully transformed **Payment Terms** from radio buttons (select one) to **checkboxes** (select all required), matching the visual pattern of **Terms & Conditions**.

**Status:** ✅ COMPLETE

---

## What Changed

### Before ❌

- Radio buttons (only ONE selection allowed)
- Custom "Other" field for non-standard terms
- Validation: Must select exactly one term

### After ✅

- Checkboxes (ALL terms must be checked)
- Simplified UI without "Other" option
- Validation: All 4 payment terms required
- Color scheme: BLUE (kept same as before)
- Label: "All required" indicator added

---

## Visual Design

**Section Header:**

```
📋 Payment Terms * All required
```

**Color Scheme (BLUE):**

- Background: `bg-blue-50`
- Border: `border-blue-200`
- Hover: `hover:bg-blue-100`
- Focus Ring: `focus:ring-blue-200`
- Checkbox Color: `text-blue-600`

**Payment Terms (4 required options):**

1. ☑ 100% Advance Payment
2. ☑ 50% Advance • 50% Before Delivery
3. ☑ 30% Advance • 70% After QC Approval
4. ☑ Net 30 Days (Credit After Delivery)

---

## Validation Rules

**Payment Terms Validation:**

```javascript
// All 4 payment terms must be checked
if (orderData.payment_terms.selected.length !== paymentTermOptions.length) {
  error = "You must accept all payment terms to proceed.";
}
```

**Error Message:**

- ⚠️ "You must accept all payment terms to proceed."
- Appears in red box below checkboxes
- Clears automatically on first checkbox interaction

---

## State Structure

**Updated State:**

```javascript
payment_terms: {
  selected: [],        // Array of checked payment terms
  custom_value: ""     // Removed (no longer used)
}
```

**Example State:**

```javascript
// When all 4 terms are checked
payment_terms: {
  selected: [
    "100% Advance Payment",
    "50% Advance • 50% Before Delivery",
    "30% Advance • 70% After QC Approval",
    "Net 30 Days (Credit After Delivery)"
  ],
  custom_value: ""
}
```

---

## Backend Serialization

**JSON Storage Format:**

```json
{
  "selected": [
    "100% Advance Payment",
    "50% Advance • 50% Before Delivery",
    "30% Advance • 70% After QC Approval",
    "Net 30 Days (Credit After Delivery)"
  ],
  "custom_value": ""
}
```

**Stored in Database:**

- Serialized as JSON string in `payment_terms` column
- Allows future migrations to relational structure
- Fully backward compatible with existing data

---

## Code Changes

### 1. **State Structure** (Line 58-61)

Changed from:

```javascript
payment_terms: {
  selected: "",        // String (single selection)
  custom_value: "",
}
```

To:

```javascript
payment_terms: {
  selected: [],        // Array (multiple selections)
  custom_value: "",
}
```

### 2. **Validation Function** (Lines 450-456)

Changed validation logic to require ALL payment terms:

```javascript
// Validate Payment Terms - must have all required payment terms checked
if (orderData.payment_terms.selected.length !== paymentTermOptions.length) {
  errors.paymentTerms = "You must accept all payment terms to proceed.";
}
```

### 3. **Event Handler** (Lines 479-492)

Renamed and updated handler from `handlePaymentTermChange` to `handlePaymentTermToggle`:

```javascript
const handlePaymentTermToggle = (term) => {
  setOrderData((prev) => ({
    ...prev,
    payment_terms: {
      ...prev.payment_terms,
      selected: prev.payment_terms.selected.includes(term)
        ? prev.payment_terms.selected.filter((t) => t !== term)
        : [...prev.payment_terms.selected, term],
    },
  }));
  if (financialErrors.paymentTerms) {
    setFinancialErrors((prev) => ({ ...prev, paymentTerms: "" }));
  }
};
```

### 4. **Deserialization** (Lines 259-288)

Enhanced deserialization to convert legacy string format to new array format:

```javascript
payment_terms: (() => {
  try {
    if (typeof po.payment_terms === "object")
      return po.payment_terms;
    if (
      typeof po.payment_terms === "string" &&
      po.payment_terms.startsWith("{")
    ) {
      const parsed = JSON.parse(po.payment_terms);
      // Convert old format (selected: string) to new format (selected: array)
      if (parsed.selected && typeof parsed.selected === "string") {
        return {
          ...parsed,
          selected: parsed.selected ? [parsed.selected] : [],
        };
      }
      return parsed;
    }
    // Legacy format: convert string to array
    return {
      selected: po.payment_terms ? [po.payment_terms] : [],
      custom_value: "",
    };
  } catch {
    return {
      selected: po.payment_terms ? [po.payment_terms] : [],
      custom_value: "",
    };
  }
})(),
```

### 5. **UI Component** (Lines 1404-1436)

Changed from radio buttons to checkboxes and added "All required" label:

```javascript
{/* Payment Terms Section - BLUE */}
<div className="space-y-3 md:col-span-3 rounded-lg bg-blue-50 border border-blue-200 p-4">
  <div className="flex items-center gap-2">
    <span className="text-lg">📋</span>
    <label className="text-sm font-semibold text-gray-900">
      Payment Terms <span className="text-red-500">*</span> All required
    </label>
  </div>
  <div className="space-y-2">
    {paymentTermOptions.map((term) => (
      <label key={term} className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-blue-100 transition">
        <input
          type="checkbox"  {/* Changed from "radio" */}
          checked={orderData.payment_terms.selected.includes(term)}
          onChange={() => handlePaymentTermToggle(term)}  {/* New handler */}
          disabled={createdOrder}
          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
        />
        <span className="text-sm text-gray-700">{term}</span>
      </label>
    ))}
  </div>
  {financialErrors.paymentTerms && (
    <div className="mt-2 rounded bg-red-50 border border-red-200 px-3 py-2">
      <p className="text-sm text-red-700">
        ⚠️ {financialErrors.paymentTerms}
      </p>
    </div>
  )}
</div>
```

---

## User Workflow

### Creating a New Purchase Order

```
1. Navigate to Payment Terms section (BLUE)
   ↓
2. See 4 payment term checkboxes with "All required" label
   ↓
3. Check ALL 4 boxes one by one
   ↓
4. Error message clears when first checkbox is checked
   ↓
5. All 4 checkboxes now checked ✓
   ↓
6. Can proceed to submit order
```

### Editing Existing Purchase Order

```
1. Open existing PO
   ↓
2. Payment Terms section loads
   ↓
3. Old data auto-converts to new format
   - Single selection → Array with 1 item
   - JSON string → Parsed and converted
   ↓
4. All 4 checkboxes still need to be checked
   ↓
5. User checks remaining boxes and submits
```

---

## Backward Compatibility

✅ **Fully backward compatible:**

- Old POs with single string payment term: Auto-converts to array
- Old POs with JSON string: Parses and converts format
- No database migration required
- Legacy data gracefully handled on load

**Example Conversions:**

```javascript
// Legacy format 1: Plain string
"100% Advance Payment"
// → Converts to
{ selected: ["100% Advance Payment"], custom_value: "" }

// Legacy format 2: JSON string (old structure)
'{"selected":"50% Advance • 50% Before Delivery","custom_value":""}'
// → Converts to
{ selected: ["50% Advance • 50% Before Delivery"], custom_value: "" }

// New format: JSON string (new structure)
'{"selected":["100% Advance Payment","50% Advance • 50% Before Delivery","30% Advance • 70% After QC Approval","Net 30 Days (Credit After Delivery)"],"custom_value":""}'
// → Loaded as-is
```

---

## Submission Format

When a Purchase Order is submitted, the financial details are serialized:

```javascript
const payload = {
  ...orderData,
  // Serialize as JSON string
  payment_terms: JSON.stringify(orderData.payment_terms),
  special_instructions: JSON.stringify(orderData.special_instructions),
  terms_conditions: JSON.stringify(orderData.terms_conditions),
  // ... other fields
};
```

**Payload Example:**

```json
{
  "payment_terms": "{\"selected\":[\"100% Advance Payment\",\"50% Advance • 50% Before Delivery\",\"30% Advance • 70% After QC Approval\",\"Net 30 Days (Credit After Delivery)\"],\"custom_value\":\"\"}",
  "special_instructions": "...",
  "terms_conditions": "...",
  ...
}
```

---

## Files Modified

### `client/src/pages/procurement/CreatePurchaseOrderPage.jsx`

**Changes Summary:**

- ✅ Line 59: Changed state structure (string → array)
- ✅ Lines 450-456: Updated validation logic
- ✅ Lines 479-492: Renamed handler, updated logic
- ✅ Lines 259-288: Enhanced deserialization
- ✅ Lines 1404-1436: Updated UI from radio to checkboxes

---

## Testing Checklist

- [ ] Open Create PO form
- [ ] Navigate to Payment Terms section
- [ ] See 4 checkboxes with "All required" label
- [ ] Try to submit without checking any boxes → See error
- [ ] Check 1 box → Error clears
- [ ] Check all 4 boxes
- [ ] Submit → Should succeed
- [ ] Edit existing PO → Data loads correctly
- [ ] Check old format conversions in browser console

---

## Error States

### ❌ Insufficient Selection

```
State: 0, 1, 2, or 3 boxes checked
Error: ⚠️ You must accept all payment terms to proceed.
Action: User must check all 4 boxes
```

### ✅ Valid Selection

```
State: All 4 boxes checked
Error: None
Action: Can submit form
```

---

## Future Enhancements

1. Add payment term templates/presets
2. Add vendor-specific default payment terms
3. Add approval workflow for custom terms
4. Multi-language support for term descriptions

---

## Support & Troubleshooting

**Issue: Checkboxes not appearing**

- Solution: Clear browser cache and reload
- Check console for JavaScript errors

**Issue: Error message not clearing**

- Solution: Automatic on first checkbox interaction
- If stuck, try refreshing the page

**Issue: Old data not loading correctly**

- Solution: Deserialization handles all formats
- Check browser console for any parse errors

**Issue: Can't submit order**

- Solution: Ensure all 4 payment terms are checked
- Check for other validation errors below

---

## Summary

The Payment Terms section has been successfully transformed from a single-selection radio button interface to a checkbox interface requiring all 4 payment terms to be accepted, matching the pattern used by Terms & Conditions and providing a more formal, compliance-oriented user experience.

**Key Benefits:**

- ✅ More formal/official appearance
- ✅ Explicit acceptance of all payment terms
- ✅ Consistent with Terms & Conditions UI pattern
- ✅ Clearer compliance messaging
- ✅ Fully backward compatible
