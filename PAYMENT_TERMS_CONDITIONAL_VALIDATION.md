# Payment Terms & Terms & Conditions - Conditional Validation 🎯

## Overview

**Both Payment Terms and Terms & Conditions** are now **context-aware**:

- **Direct PO Creation**: ✅ All items required
- **From Sales Order**: ❌ Both sections optional

This ensures efficient workflow for auto-created POs while maintaining compliance for direct orders.

## 🔄 Validation Behavior

### Direct PO Creation (No Sales Order)

```
URL: /procurement/purchase-orders/create
↓
📋 Payment Terms * All required
✓ Terms & Conditions * All required
↓
Validation: ALL 4 terms + ALL 6 conditions MUST be checked
↓
Error if incomplete: ⚠️ "You must accept all [section] to proceed."
↓
Result: Cannot submit without full compliance
```

### PO Creation from Sales Order

```
URL: /procurement/purchase-orders/create?from_sales_order=7
↓
📋 Payment Terms (Optional)
✓ Terms & Conditions (Optional)
↓
Validation: BOTH sections skipped
↓
No error shown - user can submit freely
↓
Result: Fast workflow for auto-generated POs
```

## 🛠️ Technical Implementation

### File Modified

- `client/src/pages/procurement/CreatePurchaseOrderPage.jsx`

### Key Changes

#### 1. Validation Function - Now Accepts Context Parameter

```javascript
const validateFinancialDetails = (isFromSalesOrder = false) => {
  const errors = {};

  // Skip payment terms validation if creating from sales order
  if (
    !isFromSalesOrder &&
    orderData.payment_terms.selected.length !== paymentTermOptions.length
  ) {
    errors.paymentTerms = "You must accept all payment terms to proceed.";
  }

  // ... other validations continue
};
```

#### 2. Form Submission - Passes Context

```javascript
// Line 566 - In handleSubmit()
if (!validateFinancialDetails(!!linkedSalesOrderId)) {
  setSubmitError("Please complete all required financial details sections");
  return;
}
```

#### 3. UI Label - Updates Dynamically

```javascript
// Line 1405-1410 - In render section
Payment Terms {linkedSalesOrderId ? "" : <span className="text-red-500">*</span>}
{linkedSalesOrderId ? (
  <span className="text-gray-500 font-normal">(Optional)</span>
) : (
  <span> All required</span>
)}
```

## ✅ Test Cases

### Test 1: Direct PO Creation (Strict Validation)

**Setup:** Open `/procurement/purchase-orders/create` (no query params)

| Step | Action                                       | Expected                                              |
| ---- | -------------------------------------------- | ----------------------------------------------------- |
| 1    | Try to submit without checking payment terms | Error appears: "You must accept all payment terms..." |
| 2    | Check 1-3 payment terms                      | Error remains                                         |
| 3    | Check all 4 payment terms                    | Error disappears                                      |
| 4    | Submit                                       | Order created successfully                            |

### Test 2: PO from Sales Order (Lenient Validation)

**Setup:** Open `/procurement/purchase-orders/create?from_sales_order=7`

| Step | Action                           | Expected                          |
| ---- | -------------------------------- | --------------------------------- |
| 1    | Leave payment terms unchecked    | No error for payment terms        |
| 2    | Try to submit                    | No payment terms validation error |
| 3    | Other fields must still be valid | Standard validation applies       |
| 4    | Submit without payment terms     | Order created successfully ✅     |

### Test 3: Edit Mode (Existing PO)

**Setup:** Open `/procurement/purchase-orders/{id}/edit`

| Step | Action                                 | Expected                                   |
| ---- | -------------------------------------- | ------------------------------------------ |
| 1    | Note the URL context                   | Determine if original was from sales order |
| 2    | If was from SO: Payment terms optional | Can edit and save without all 4            |
| 3    | If was direct: Payment terms required  | Must have all 4 to save                    |

## 📊 Comparison

Both **Payment Terms** and **Terms & Conditions** now follow the same conditional pattern:

| Scenario             | Payment Terms     | T&C (6 items)     | Label Pattern     | Use Case                |
| -------------------- | ----------------- | ----------------- | ----------------- | ----------------------- |
| **Direct PO**        | YES (all 4)       | YES (all 6)       | "\* All required" | Standalone vendor order |
| **From Sales Order** | NO (optional)     | NO (optional)     | "(Optional)"      | Auto-created from SO    |
| **Edit Mode**        | Inherits original | Inherits original | Dynamic           | Modify existing PO      |

## 🎨 Visual Indicators

### Direct Creation (All Required)

```
📋 Payment Terms * All required

☐ 100% Advance Payment
☐ 50% Advance • 50% Before Delivery
☐ 30% Advance • 70% After QC Approval
☐ Net 30 Days (Credit After Delivery)

⚠️ Error appears if not all checked
```

### From Sales Order (Optional)

```
📋 Payment Terms (Optional)

☐ 100% Advance Payment
☐ 50% Advance • 50% Before Delivery
☐ 30% Advance • 70% After QC Approval
☐ Net 30 Days (Credit After Delivery)

✅ No error - user can skip

---

✓ Terms & Conditions (Optional)

☐ Delivery terms and acceptance of quotation
☐ Payment terms as per agreement
☐ Inspection and quality checks
☐ Compliance with packaging standards
☐ Cancellation policy and force majeure clause
☐ Dispute resolution and governing law

✅ No error - user can skip
```

## 🔗 Related Fields

**Validation Behavior by Context:**

| Field                    | Direct Creation              | From Sales Order | Notes           |
| ------------------------ | ---------------------------- | ---------------- | --------------- |
| **Payment Terms**        | ✅ Required (all 4)          | ❌ Optional      | Conditional     |
| **Special Instructions** | ✅ Required (select or note) | ✅ Required      | Always enforced |
| **Terms & Conditions**   | ✅ Required (all 6)          | ❌ Optional      | Conditional     |
| **Items, Vendor, Dates** | ✅ Required                  | ✅ Required      | Always enforced |

## 🚀 Why This Matters

1. **Workflow Efficiency** - POs auto-created from sales orders don't get blocked
2. **Flexibility** - Direct PO creation still enforces compliance standards
3. **User Experience** - Clear visual labels indicate requirement level
4. **Business Logic** - Different workflows have different requirements

## ⚡ Migration Notes

✅ **No database changes required** - purely UI/validation logic

✅ **Backward compatible** - existing POs work as before

✅ **Non-breaking** - all previous functionality preserved

## 📝 Code Locations

| Component                | Location                      | Line(s)   | Details                                   |
| ------------------------ | ----------------------------- | --------- | ----------------------------------------- |
| Payment Terms Validation | `CreatePurchaseOrderPage.jsx` | 465-471   | Conditional check with `isFromSalesOrder` |
| T&C Validation           | `CreatePurchaseOrderPage.jsx` | 482-488   | Conditional check with `isFromSalesOrder` |
| Form Submission          | `CreatePurchaseOrderPage.jsx` | 566       | Passes `linkedSalesOrderId` to validation |
| Payment Terms UI         | `CreatePurchaseOrderPage.jsx` | 1405-1420 | Dynamic label with (Optional)             |
| T&C UI Label             | `CreatePurchaseOrderPage.jsx` | 1521-1533 | Dynamic label with (Optional)             |

## 🆘 Troubleshooting

| Issue                                       | Solution                                                    |
| ------------------------------------------- | ----------------------------------------------------------- |
| Payment terms still showing as required     | Clear browser cache, hard refresh                           |
| Validation not skipping on from_sales_order | Check URL has `?from_sales_order=X` param                   |
| Error message won't disappear               | Check all 4 boxes if direct creation, or refresh if from SO |
| Visual label not updating                   | Verify linkedSalesOrderId is being set at line 23           |
