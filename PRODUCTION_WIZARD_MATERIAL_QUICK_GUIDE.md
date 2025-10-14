# Production Wizard Material Pre-filling - Quick Guide

## 🎯 What Was Fixed

### Problem
Materials in Production Wizard were not pre-filling correctly from Material Receipts.

### Solution
Fixed material field mapping and added validation to ensure materials come from actual received materials against the project.

---

## 📋 Quick Test

### 1. Create Production with Approved Materials
```
1. Go to: /manufacturing/approval (Production Approvals page)
2. Find an approved material receipt
3. Click "Start Production" button
4. Production Wizard opens with ?approvalId=X parameter
```

### 2. Verify Auto-fill
**On Materials Step (Step 3), you should see:**
- ✅ Green banner: "Materials loaded from approved receipt"
- ✅ All material fields pre-filled
- ✅ Correct quantities (received, not dispatched)
- ✅ Barcode, condition, and remarks (if available)

---

## 🔍 What Data Gets Pre-filled

| Field | Source | Example |
|-------|--------|---------|
| Material ID | `material_code` or `barcode_scanned` | FAB-001 |
| Description | `material_name` | Cotton Fabric |
| Required Quantity | `quantity_received` | 98 |
| Unit | `uom` | meters |
| Status | Auto-set | available |
| Barcode | `barcode_scanned` | BAR123456 |
| Condition | `condition` | Good |
| Remarks | `remarks` | 2 meters damaged |

---

## 🚨 Error Handling

### If Materials Don't Pre-fill

**Check 1: Console Logs**
```
Look for: "📦 Pre-filling materials from receipt: [...]"
If you see: "📦 Pre-filling materials from request: [...]"
→ Materials were requested but not yet received
```

**Check 2: API Response**
```
GET /api/production-approval/{id}/details

Should return:
{
  approval: {
    verification: {
      receipt: {
        received_materials: [...]  ← This array should have items
      }
    }
  }
}
```

**Check 3: Approval Status**
```
Only approvals with:
- approval_status = 'approved'
- production_started = false
- verification.receipt.received_materials has items

Will pre-fill materials.
```

---

## 🎨 Visual Indicators

### Success State
```
┌──────────────────────────────────────────┐
│ ✅ Materials loaded from approved receipt │
│                                            │
│ These materials were dispatched from       │
│ inventory and received in manufacturing.   │
└──────────────────────────────────────────┘

Material #1
├─ Material ID: FAB-001
├─ Description: Cotton Fabric  
├─ Required Quantity: 98
├─ Unit: meters
├─ Status: Available
├─ Barcode: BAR123456 (read-only)
├─ Condition: Good (read-only)
└─ Remarks: 2 meters damaged (read-only)
```

### Fallback State (No Receipt)
```
⚠️ Using requested materials (3 items) - receipt not yet received

Material #1
├─ Material ID: FAB-001
├─ Description: Cotton Fabric
├─ Required Quantity: 100
├─ Unit: meters
└─ Status: Ordered
```

---

## 🔗 Complete Flow

```
Material Request (MRN)
    ↓
Dispatch from Inventory
    ↓
Receipt in Manufacturing ←─────┐
    ↓                          │
QC Verification                │
    ↓                          │
Production Approval            │
    ↓                          │
Production Wizard ─────────────┘
(Materials pre-filled from receipt)
```

---

## 🐛 Troubleshooting

### Problem: "Unknown column 'subcategory' in 'field list'"
**Status:** ✅ Fixed  
**Fix:** Removed `subcategory` from Product query in manufacturing routes

### Problem: Materials field empty
**Status:** ✅ Fixed  
**Fix:** Corrected field mapping to use `material_name`, `quantity_received`, `uom` instead of wrong field names

### Problem: Wrong quantities shown
**Status:** ✅ Fixed  
**Fix:** Now uses `quantity_received` (actual) instead of `quantity_dispatched` (planned)

### Problem: No validation
**Status:** ✅ Fixed  
**Fix:** Added visual indicators and validation checks

---

## 📞 API Endpoints Used

### 1. Get Approval Details
```http
GET /api/production-approval/:id/details
```
**Returns:** Full approval with receipt and dispatch data

### 2. Create Production Order
```http
POST /api/manufacturing/orders
```
**Body:**
```json
{
  "product_id": 1,
  "quantity": 100,
  "planned_start_date": "2025-02-01",
  "planned_end_date": "2025-02-15",
  "materials": [
    {
      "materialId": "FAB-001",
      "description": "Cotton Fabric",
      "requiredQuantity": 98,
      "unit": "meters",
      "status": "available"
    }
  ],
  "production_approval_id": 5
}
```

---

## ✅ Testing Checklist

- [ ] Materials pre-fill when opening wizard with `?approvalId=X`
- [ ] Green success banner shows at top of Materials step
- [ ] All material fields populated correctly
- [ ] Quantities match received quantities (not dispatched)
- [ ] Barcode, condition, remarks show if available
- [ ] Can manually add additional materials
- [ ] Can remove pre-filled materials
- [ ] Fallback to requested materials if no receipt
- [ ] Warning toast shows for fallback scenario
- [ ] No console errors
- [ ] Production order creates successfully with materials

---

## 🎯 Key Improvements

1. **Correct Field Mapping** - Uses actual receipt field names
2. **Validation** - Ensures materials are from approved receipts
3. **Visual Feedback** - Green banner and success toasts
4. **Fallback Logic** - Uses requested materials if receipt not available
5. **Traceability** - Shows barcode, condition, remarks
6. **User Experience** - Clear messaging and read-only fields

---

**Last Updated:** January 2025  
**Status:** ✅ Complete and Working