# ⚡ Conditional Validation - Quick Reference

## 🎯 Quick Overview

Both **Payment Terms** and **Terms & Conditions** are now **optional** when creating PO from Sales Order, but **required** for direct PO creation.

## 🔗 URLs

### Direct PO (Strict Validation)

```
/procurement/purchase-orders/create
```

✅ Payment Terms: _ All 4 required
✅ Terms & Conditions: _ All 6 required

### From Sales Order (Lenient Validation)

```
/procurement/purchase-orders/create?from_sales_order=7
```

⏭️ Payment Terms: (Optional)
⏭️ Terms & Conditions: (Optional)

## 📋 Quick Test

### Test Direct PO

```
1. Go to: http://localhost:3000/procurement/purchase-orders/create
2. Leave Payment Terms empty → Try Submit
3. Expected: ⚠️ "You must accept all payment terms..."
4. Check all 4 → Error clears
5. Leave Terms & Conditions empty → Try Submit
6. Expected: ⚠️ "You must accept all terms..."
7. Check all 6 → Error clears
8. Submit → ✅ Success
```

### Test From Sales Order

```
1. Go to: http://localhost:3000/procurement/purchase-orders/create?from_sales_order=7
2. Leave Payment Terms empty → Try Submit
3. Expected: ✅ No error (optional)
4. Leave T&C empty → Try Submit
5. Expected: ✅ No error (optional)
6. Fill vendor, items, dates → Submit
7. ✅ Order created without payment terms/T&C
```

## 🎨 Visual Indicators

### Direct (Required)

```
📋 Payment Terms * All required
✓ Terms & Conditions * All required
```

→ Red asterisk = MUST complete

### From SO (Optional)

```
📋 Payment Terms (Optional)
✓ Terms & Conditions (Optional)
```

→ Gray text = Can skip

## 🔧 Code Changes

| Location  | What Changed        | Why                                 |
| --------- | ------------------- | ----------------------------------- |
| Line 462  | Validation function | Added `isFromSalesOrder` parameter  |
| Line 466  | Payment Terms check | Wrapped with `!isFromSalesOrder &&` |
| Line 483  | T&C check           | Wrapped with `!isFromSalesOrder &&` |
| Line 566  | Form submit         | Passes `!!linkedSalesOrderId`       |
| Line 1405 | Payment Terms label | Dynamic "(Optional)" display        |
| Line 1521 | T&C label           | Dynamic "(Optional)" display        |

## ✅ Validation Logic

```javascript
// If creating from sales order → Skip validation
if (linkedSalesOrderId) {
  validateFinancialDetails(true); // isFromSalesOrder = true
}

// If direct creation → Enforce validation
else {
  validateFinancialDetails(false); // isFromSalesOrder = false
}
```

## 🧪 Test Checklist

- [ ] Direct PO: Both sections show "\* All required"
- [ ] Direct PO: Cannot submit without all 4 payment terms
- [ ] Direct PO: Cannot submit without all 6 T&C items
- [ ] Direct PO: Errors clear when all items checked
- [ ] From SO: Both sections show "(Optional)"
- [ ] From SO: Can submit without checking payment terms
- [ ] From SO: Can submit without checking T&C
- [ ] From SO: No validation errors appear
- [ ] Edit Direct: Inherits strict validation
- [ ] Edit From SO: Inherits lenient validation
- [ ] Special Instructions: Still required in both cases

## 🚀 Related Features (Unchanged)

- Special Instructions (always required)
- Items validation (always required)
- Vendor selection (always required)
- Delivery dates (always required)

## ⚙️ Implementation Stats

- Files modified: 1 (`CreatePurchaseOrderPage.jsx`)
- Lines changed: ~15
- Database migrations: 0
- Breaking changes: 0
- Backward compatible: ✅

## 🔄 How It Works

1. **Component loads** → Extract `linkedSalesOrderId` from URL
2. **User fills form** → Labels update dynamically
3. **User submits** → Pass context to validation function
4. **Validation runs** → Skip payment checks if from SO
5. **Success/Error** → Display appropriate message

## 💡 Key Points

✅ **Smart Validation**: Context-aware, not one-size-fits-all
✅ **Clear UX**: Visual labels indicate requirement level
✅ **Efficient Workflows**: Auto-created POs don't get blocked
✅ **Compliance**: Direct POs maintain strict standards
✅ **No Migration**: Pure UI/validation logic change

## 🆘 Common Issues

| Problem                        | Solution                            |
| ------------------------------ | ----------------------------------- |
| Still showing required         | Hard refresh + clear cache          |
| Not detecting from_sales_order | Check URL parameter spelling        |
| Can't submit either way        | Fill other required fields first    |
| Errors not updating            | React state is batched - wait 200ms |

## 📚 Full Docs

- Read: `PAYMENT_TERMS_CONDITIONAL_VALIDATION.md`
- Read: `CONDITIONAL_VALIDATION_COMPLETE.md`

## 🎯 Status: ✅ READY FOR TESTING
