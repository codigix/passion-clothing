# Production Wizard 400 Error Fix

## Problem
When creating a production order through the Production Wizard, users encountered a 400 Bad Request error:

```
POST http://localhost:3000/api/manufacturing/orders 400 (Bad Request)
{message: "Missing required fields: product_id, quantity, planned_start_date, planned_end_date"}
```

## Root Cause
The backend API requires four mandatory fields for creating a production order:
1. `product_id` - Must be a valid numeric ID
2. `quantity` - Must be a positive number
3. `planned_start_date` - Must be a valid date string
4. `planned_end_date` - Must be a valid date string

However, the frontend had several issues:
1. **Schema Issue**: The `productId` field in `orderDetailsSchema` was marked as `.nullable()` instead of `.required()`
2. **Missing Default Value**: The `productId` was not included in the `defaultValues` object
3. **Weak Validation**: The form could be submitted without proper validation of required fields

## Changes Made

### 1. Updated Schema Validation (`ProductionWizardPage.jsx` line 95)
**Before:**
```javascript
productId: yup.string().nullable(), // Made optional - moved to materials tab
```

**After:**
```javascript
productId: yup.string().required('Product selection is required'), // Required by backend
```

### 2. Added Default Value (`ProductionWizardPage.jsx` line 181)
**Before:**
```javascript
orderDetails: {
  productionType: 'in_house',
  quantity: '',
  priority: 'medium',
  salesOrderId: '',
  specialInstructions: '',
},
```

**After:**
```javascript
orderDetails: {
  productId: '',
  productionType: 'in_house',
  quantity: '',
  priority: 'medium',
  salesOrderId: '',
  specialInstructions: '',
},
```

### 3. Enhanced Pre-Submission Validation (`ProductionWizardPage.jsx` lines 1034-1073)
Added comprehensive validation before the API call:

```javascript
// Validate required fields before building payload
const missingFields = [];

if (!values.orderDetails.productId) {
  missingFields.push('Product');
} else if (isNaN(Number(values.orderDetails.productId))) {
  console.error('Invalid product_id detected:', values.orderDetails.productId);
  toast.error('Invalid product selected. Please select a valid product from the dropdown.');
  setSubmitting(false);
  setCurrentStep(0);
  return;
}

if (!values.orderDetails.quantity || isNaN(Number(values.orderDetails.quantity)) || Number(values.orderDetails.quantity) <= 0) {
  missingFields.push('Quantity');
}

if (!values.scheduling.plannedStartDate) {
  missingFields.push('Planned Start Date');
}

if (!values.scheduling.plannedEndDate) {
  missingFields.push('Planned End Date');
}

// If any required fields are missing, show error and return
if (missingFields.length > 0) {
  const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
  console.error('Validation failed:', errorMsg);
  toast.error(errorMsg);
  setSubmitting(false);
  
  // Navigate to the appropriate step
  if (missingFields.includes('Product') || missingFields.includes('Quantity')) {
    setCurrentStep(1); // Order Details step
  } else if (missingFields.includes('Planned Start Date') || missingFields.includes('Planned End Date')) {
    setCurrentStep(2); // Scheduling step
  }
  return;
}
```

### 4. Enhanced Debugging Logs
Added detailed logging to help diagnose issues:

```javascript
// Log form values for debugging
console.log('Form submission values:', JSON.stringify({
  productId: values.orderDetails.productId,
  quantity: values.orderDetails.quantity,
  plannedStartDate: values.scheduling.plannedStartDate,
  plannedEndDate: values.scheduling.plannedEndDate,
  productionApprovalId: values.orderSelection.productionApprovalId,
  productOptions: productOptions.length,
  availableProductIds: productOptions.map(p => p.value)
}, null, 2));

// Log the actual payload being sent
console.log('Production order payload:', JSON.stringify(payload, null, 2));
```

## Benefits

### ✅ Better User Experience
- **Clear Error Messages**: Users now see specific messages about which fields are missing
- **Auto-Navigation**: The wizard automatically navigates to the step containing the missing field
- **Prevention**: Invalid submissions are blocked before reaching the backend

### ✅ Easier Debugging
- **Console Logs**: Detailed logging shows exactly what values are being submitted
- **Payload Visibility**: The actual API payload is logged for inspection

### ✅ Data Integrity
- **Required Fields**: Schema now enforces that product must be selected
- **Type Validation**: Numeric fields are validated to be actual numbers
- **Date Validation**: Dates are checked for existence before submission

## Testing Checklist

### Test Case 1: Missing Product
1. Navigate to Production Wizard
2. Skip product selection in Order Details step
3. Fill in quantity, dates, and other required fields
4. Try to submit
5. **Expected**: Error message "Missing required fields: Product" and navigate to Order Details step

### Test Case 2: Missing Quantity
1. Navigate to Production Wizard
2. Select a product but leave quantity empty
3. Fill in dates and other required fields
4. Try to submit
5. **Expected**: Error message "Missing required fields: Quantity" and navigate to Order Details step

### Test Case 3: Missing Dates
1. Navigate to Production Wizard
2. Fill in product and quantity
3. Leave Planned Start Date or Planned End Date empty
4. Try to submit
5. **Expected**: Error message "Missing required fields: Planned Start Date, Planned End Date" and navigate to Scheduling step

### Test Case 4: Invalid Product ID
1. Navigate to Production Wizard with pre-filled data
2. If productId somehow becomes non-numeric
3. Try to submit
4. **Expected**: Error message "Invalid product selected. Please select a valid product from the dropdown."

### Test Case 5: Successful Submission
1. Navigate to Production Wizard
2. Fill in all required fields:
   - Select a product
   - Enter quantity (e.g., 100)
   - Select planned start date
   - Select planned end date
   - Add at least one material
   - Add at least one quality checkpoint
3. Submit the form
4. **Expected**: Production order created successfully, navigate to orders list

## Browser Console Debugging

When submitting a production order, check the browser console for:

1. **Form Submission Values** - Shows what's in the form:
```javascript
Form submission values: {
  "productId": "123",
  "quantity": "100",
  "plannedStartDate": "2025-01-15",
  "plannedEndDate": "2025-01-30",
  ...
}
```

2. **Production Order Payload** - Shows what's being sent to API:
```javascript
Production order payload: {
  "product_id": 123,
  "quantity": 100,
  "planned_start_date": "2025-01-15",
  "planned_end_date": "2025-01-30",
  ...
}
```

## Related Files Modified
- `client/src/pages/manufacturing/ProductionWizardPage.jsx`
  - Line 95: Updated schema to require productId
  - Line 181: Added productId to default values
  - Lines 1034-1073: Added comprehensive pre-submission validation
  - Lines 1024-1032, 1077-1078: Added debugging logs

## Backend Validation (No Changes)
The backend validation remains at `server/routes/manufacturing.js` lines 291-297:
```javascript
if (!product_id || !quantity || !planned_start_date || !planned_end_date) {
  await transaction.rollback();
  return res.status(400).json({
    message: 'Missing required fields: product_id, quantity, planned_start_date, planned_end_date'
  });
}
```

## Migration Notes
- ✅ **No Database Changes**: This is purely a frontend validation fix
- ✅ **No Breaking Changes**: Existing production orders are not affected
- ✅ **Backward Compatible**: The fix only adds validation, doesn't change data structure
- ✅ **Immediate Effect**: Changes take effect as soon as the frontend is reloaded

## Status
🟢 **COMPLETE** - All fixes implemented and ready for testing