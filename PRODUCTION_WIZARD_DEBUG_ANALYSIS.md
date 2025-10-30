# Production Wizard Network Error - Root Cause Analysis

## Current Situation
- **Error Message**: "Network error - backend may be offline"
- **Actual Status**: Backend IS running (HTTP 200 on health check)
- **Real Problem**: Request validation failure + potential CORS issue

## Form Submission Data (Current)
```json
{
  "productId": "",           // ❌ EMPTY - must be numeric if provided
  "salesOrderId": "1",       // ✅ Has value
  "productOptions": 1,       // Available product count
  "availableProductIds": ["1"]
}
```

## Backend Validation Rules
The `/manufacturing/orders` endpoint (line 391 in `manufacturing.js`) requires:

**EITHER:**
1. `product_id` (numeric) + `quantity` (numeric) 
   
**OR:**
2. `sales_order_id` + `materials_required` (non-empty array)

## Current Payload Problem
The `buildPayload()` function (line 2410) creates:
```javascript
{
  product_id: null,              // ❌ Empty → null (fails option 1)
  quantity: NaN,                 // ❌ Empty string → NaN (fails option 1)
  sales_order_id: 1,             // ✅ Present
  materials_required: [],        // ❌ EMPTY ARRAY (fails option 2)
  // ... other fields
}
```

## Why "Network Error" Instead of Validation Error?
The actual issue might be:
1. **Validation fails silently** (400 response)
2. Backend returns 400 but something is breaking the response handling
3. **POSSIBLE**: The materials.items array is truly empty, causing the validation check on line 432-437 to fail before sending a response

## The Real Issue
Users need to EITHER:
1. ✅ Select a product from the dropdown AND enter a quantity, OR
2. ✅ Add materials to the "Materials" section of the wizard

Currently the form allows submission with BOTH empty, which is invalid.

## Solution Required
Add **client-side validation** to prevent submission when:
- Both `productId` is empty AND `materials.items` is empty
- Show clear error message: "Please either select a product + quantity OR add materials"

## Files to Modify
1. **ProductionWizardPage.jsx** (line ~1140-1165):
   - Add pre-submission validation
   - Check for empty product ID when materials are empty
   - Show helpful error toast with instructions