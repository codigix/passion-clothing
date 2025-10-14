# 🧪 Stage Customization Complete Testing Guide

## ✅ What Was Implemented

### 1. **Permission Removal** 
- ✅ All manufacturing users can now customize stages
- ✅ No special permission required
- **File**: `ProductionWizardPage.jsx` line 474

### 2. **Vendor Selection Enhancement**
- ✅ Professional dropdown instead of manual text input
- ✅ Shows vendor name + contact person
- ✅ Loading state indicator
- ✅ Warning when no vendors exist
- **File**: `ProductionWizardPage.jsx` lines 2052-2101

### 3. **Visual Stage Tracking**
- ✅ Sidebar badges: 🧵 Embroidery, 🖨️ Printing, 🚚 Outsourced, 🏭 In-House
- ✅ Details panel showing customization info
- **File**: `ProductionOperationsViewPage.jsx` lines 490-628

### 4. **Backend Processing**
- ✅ Custom stages with embroidery/printing flags
- ✅ Outsourced vs in-house tracking
- ✅ Vendor assignment
- **File**: `manufacturing.js` lines 593-606

### 5. **Outsourcing Flow**
- ✅ Outward challan creation (send to vendor)
- ✅ Inward challan creation (receive from vendor)
- ✅ Material reconciliation
- **File**: `manufacturing.js` lines 3400-3747

---

## 🧪 Complete Testing Checklist

### **Test 1: Verify Permission Removal** ✅

**Expected**: Any manufacturing user can customize stages

1. Login as **any manufacturing user** (doesn't need special permission)
2. Navigate to: **Manufacturing → Production Wizard**
3. Scroll to **"Customize stages"** section
4. Toggle **"Enable stage customization"** switch

**✅ Pass Criteria**: Switch enables without error, section expands showing stage list

---

### **Test 2: Create Custom Production Order with Embroidery** 🧵

1. **Step 1 - Product Selection**:
   - Select a product from dropdown
   - Enter quantity: `100`
   - Select priority: `High`

2. **Step 2 - Scheduling**:
   - Set planned start date: Tomorrow
   - Set planned end date: +7 days
   - Select shift: `Day`

3. **Step 3 - Materials**:
   - Add at least 1 material
   - Enter required quantity

4. **Step 4 - Quality**:
   - Add at least 1 checkpoint

5. **Step 5 - Team**:
   - Assign supervisor (optional)

6. **Step 6 - Customization**:
   - Toggle **"Enable stage customization"** ✅
   - Click **"Add Stage"**
   - Enter stage name: `Embroidery Design`
   - Toggle **"Embroidery Stage"** ✅
   - Select Work Type: **"🏭 In-House Production"**
   - Click **"Add Stage"** again
   - Enter stage name: `Embroidery Stitching`
   - Toggle **"Embroidery Stage"** ✅
   - Select Work Type: **"🚚 Outsourced to Vendor"**
   - **Select vendor from dropdown** ✅
   
7. **Step 7 - Review & Submit**:
   - Check "I confirm order details are accurate"
   - Click **"Submit Production Order"**

**✅ Pass Criteria**: 
- Order created successfully
- Redirected to production orders list
- Success message displayed

---

### **Test 3: Verify Visual Indicators** 👁️

1. Navigate to: **Manufacturing → Production Orders**
2. Find the order you just created
3. Click the **eye icon** (Production Operations View)

**✅ Pass Criteria**:
- Sidebar shows stages with badges:
  - 🧵 Purple badge on embroidery stages
  - 🚚 Orange badge + "Outsourced" on outsourced stage
  - 🏭 Green badge + "In-House" on in-house stage
- Click on outsourced stage
- **Customization Details** card appears with:
  - Large badges showing customization
  - Vendor ID displayed

---

### **Test 4: Create Outward Challan** 📦➡️

**Prerequisites**: Stage must be outsourced

1. In Production Operations View
2. Select the **outsourced embroidery stage**
3. Scroll to **Quick Actions** section
4. Select Work Type: **"Outsourced"**
5. Click **"Create Outward Challan"** button

6. **Fill Outward Challan Form**:
   - Vendor: Should be pre-selected
   - Expected Return Date: Select date (+3 days)
   - Add items:
     - Description: `50 pcs for embroidery`
     - Quantity: `50`
     - Unit: `pieces`
     - Rate: `10`
   - Transport Details: `Courier Service`
   - Notes: `Please complete within 3 days`
   - Click **"Create Outward Challan"**

**✅ Pass Criteria**:
- Challan created with number like `CHN-20250119-0001`
- Success message displayed
- Challan appears in the challans list below
- Shows "Outward - Pending" status

---

### **Test 5: Create Inward Challan** 📦⬅️

**Prerequisites**: Outward challan must exist

1. In same stage, click **"Create Inward Challan"** button
2. **Fill Inward Challan Form**:
   - Select the outward challan from dropdown
   - Received Quantity: `50`
   - Quality Notes: `Good quality work, no issues`
   - Discrepancies: `None`
   - Click **"Create Inward Challan"**

**✅ Pass Criteria**:
- Inward challan created successfully
- Outward challan status changed to "Completed"
- Stage quantity updated
- Both challans visible in challans list

---

### **Test 6: Test Printing Stage with Outsourcing** 🖨️

1. Create new production order
2. In customization section:
   - Add stage: `Screen Printing`
   - Toggle **"Printing Stage"** ✅
   - Work Type: **"🚚 Outsourced to Vendor"**
   - Select vendor
3. Submit order
4. Go to Operations View
5. Verify:
   - 🖨️ Indigo badge shows "Printing Stage"
   - 🚚 Orange badge shows "Outsourced"
   - Vendor ID displayed in customization card

**✅ Pass Criteria**: All badges and info displayed correctly

---

### **Test 7: Test Combined Stage (Both Embroidery + Printing)** 🧵+🖨️

1. Create new production order
2. Add custom stage:
   - Name: `Complex Customization`
   - Toggle **"Embroidery Stage"** ✅
   - Toggle **"Printing Stage"** ✅
   - Work Type: In-House
3. Submit and verify
4. Check backend receives:
   - `is_embroidery: true`
   - `is_printing: true`
   - `customization_type: 'both'`

**✅ Pass Criteria**: Both badges appear on the stage

---

### **Test 8: Material Reconciliation** 📊

**Prerequisites**: All stages completed

1. Complete all production stages
2. On final stage, look for **"Material Reconciliation"** button
3. Click and fill form:
   - For each allocated material:
     - Consumed: Actual used quantity
     - Wasted: Any waste
     - Returned: Leftover quantity
4. Submit reconciliation

**✅ Pass Criteria**:
- Reconciliation saved successfully
- Leftover materials returned to inventory automatically
- Inventory movements created
- Complete audit trail recorded

---

### **Test 9: Stage Reordering** 🔄

1. Create custom order with 4+ stages
2. Use **"Move Up"** / **"Move Down"** buttons
3. Reorder stages
4. Submit order

**✅ Pass Criteria**:
- Stages created in correct order
- `stage_order` field reflects custom sequence

---

### **Test 10: Vendor Dropdown Edge Cases** 🧪

**Test A - No Vendors Exist**:
1. Temporarily delete all vendors from database
2. Try to create outsourced stage
3. **Expected**: Red warning box appears: "⚠️ No vendors found..."

**Test B - Many Vendors**:
1. Add 20+ vendors
2. Create outsourced stage
3. **Expected**: Dropdown shows all vendors, scrollable

**Test C - Vendor Selection Validation**:
1. Select "Outsourced to Vendor"
2. Don't select vendor
3. Try to submit
4. **Expected**: Validation error (if validation enabled)

---

## 🐛 Common Issues & Fixes

### Issue 1: "Permission Denied" when customizing stages
**Fix**: Verify line 474 in ProductionWizardPage.jsx:
```javascript
const canCustomizeStages = true; // Should be true
```

### Issue 2: Vendor dropdown shows "Loading vendors..." forever
**Fix**: Check browser console for API errors. Ensure `/api/procurement/vendors` endpoint is working.

### Issue 3: Badges don't appear in Operations View
**Fix**: Verify stage data includes:
- `is_embroidery` 
- `is_printing`
- `outsourced`
- `vendor_id`

### Issue 4: Outward challan creation fails
**Fix**: 
- Check vendor_id is valid
- Ensure items array has at least one item
- Check backend logs for SQL errors

### Issue 5: Material reconciliation not saving
**Fix**: 
- Verify MaterialAllocation records exist for the order
- Check line 3669-3747 in manufacturing.js is complete
- Ensure consumed + wasted + returned ≤ allocated

---

## 📊 Database Verification Queries

### Check custom stages were created:
```sql
SELECT 
  ps.id, 
  ps.stage_name, 
  ps.is_embroidery, 
  ps.is_printing,
  ps.customization_type,
  ps.outsourced,
  ps.vendor_id,
  ps.stage_order
FROM production_stages ps
JOIN production_orders po ON ps.production_order_id = po.id
WHERE po.production_number = 'PRO-YOUR-NUMBER'
ORDER BY ps.stage_order;
```

### Check challans were created:
```sql
SELECT 
  id,
  challan_number,
  type,
  sub_type,
  vendor_id,
  status,
  total_quantity,
  created_at
FROM challans
WHERE order_type = 'production_order'
  AND sub_type = 'outsourcing'
ORDER BY created_at DESC
LIMIT 10;
```

### Check material reconciliation:
```sql
SELECT 
  ma.id,
  ma.quantity_allocated,
  ma.quantity_consumed,
  ma.quantity_wasted,
  ma.quantity_returned,
  inv.item_name
FROM material_allocations ma
JOIN inventory inv ON ma.inventory_id = inv.id
WHERE ma.production_order_id = YOUR_ORDER_ID;
```

---

## 🎯 Success Metrics

After completing all tests, you should have:

✅ **5+ Custom Production Orders** created with different stage configurations  
✅ **At least 2 Outward Challans** created for outsourced stages  
✅ **At least 2 Inward Challans** created for received work  
✅ **Material Reconciliation** completed for 1 order  
✅ **All Visual Badges** appearing correctly in Operations View  
✅ **No Permission Errors** for any manufacturing user  
✅ **Vendor Dropdown** populated with real vendors  

---

## 📚 Related Documentation

- **Complete Implementation Guide**: `STAGE_CUSTOMIZATION_FLOW_COMPLETE.md`
- **Quick Reference**: `STAGE_CUSTOMIZATION_QUICK_REFERENCE.md`
- **Repository Info**: `.zencoder/rules/repo.md`

---

## 🚀 Next Steps After Testing

1. **Train Users**: Show manufacturing team how to use customization
2. **Add More Vendors**: Populate vendor database for better testing
3. **Monitor Production**: Track first few custom orders closely
4. **Gather Feedback**: Ask users about missing features
5. **Optimize**: Based on usage patterns, add shortcuts or presets

---

## 💡 Pro Tips

1. **Create Stage Templates**: Save common stage sequences as presets
2. **Vendor Management**: Keep vendor list updated with contact info
3. **Challan Numbering**: Unique numbers generated automatically (CHN-YYYYMMDD-####)
4. **Material Tracking**: Always reconcile materials to maintain accurate inventory
5. **Audit Trail**: All challans and movements are logged for compliance

---

**Last Updated**: January 2025  
**Status**: ✅ All features implemented and ready for testing  
**Version**: 1.0  