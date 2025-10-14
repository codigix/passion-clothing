# Production Operations View - Complete User Guide

## 🎯 **CONFIRMED: All Features Are Already Implemented!**

This guide shows you how to use the simplified Production Operations View with outsourcing and material reconciliation.

---

## 📍 How to Access

1. Go to **Manufacturing Dashboard**
2. Click **"Production Tracking"** tab
3. Find a production order
4. Click the **eye icon (👁️)** to open Operations View

---

## ✅ What You'll See

### **Left Sidebar**
- List of all production stages
- Color-coded status:
  - 🟢 **Green** = Completed
  - 🔵 **Blue** = In Progress
  - 🟠 **Orange** = On Hold
  - ⚪ **Gray** = Pending
- Click any stage to view/edit it

### **Right Panel**
- Selected stage details
- Simple date/time editing
- Outsourcing options (for specific stages)
- Material reconciliation (final stage only)

---

## 📝 Feature 1: Simple Stage Editing

### ✅ **No Complex Substages - Just Dates & Times**

**What You Can Edit:**
- ✏️ Start Date
- ✏️ Start Time
- ✏️ End Date
- ✏️ End Time
- ✏️ Notes
- **Duration** = Auto-calculated

**How to Edit:**
1. Click **"Edit"** button (top right)
2. Change dates/times using date pickers
3. Add notes in text area
4. Click **"Save Changes"**

**Quick Actions:**
- 🟢 **Start Stage** - Begin work on pending stage
- ⏸️ **Pause** - Temporarily pause in-progress stage
- ✅ **Complete Stage** - Mark stage as done
- ⏭️ **Next Stage** / ⏮️ **Previous Stage** - Navigate between stages

---

## 🏭 Feature 2: Outsourcing Flow (Embroidery/Printing)

### **Supported Stages:**
- Embroidery
- Printing
- Screen Printing
- Washing

### **How It Works:**

#### Step 1: Select Work Type
When you open an outsourcing stage, you'll see a purple section labeled **"Outsourcing Options"**

**Two buttons:**
- 🏠 **In-House** - Work done internally (default)
- 🏢 **Outsourced** - Work sent to vendor

Click **"Outsourced"** to enable challan creation.

---

#### Step 2: Create Outward Challan (Send to Vendor)

**What It Does:** Records materials being sent to vendor for external processing

**How to Create:**
1. Select **"Outsourced"** work type
2. Click **"Create Outward Challan"** (orange button)
3. Fill in the dialog:
   - ✅ **Vendor** (required) - Select from dropdown
   - ✅ **Quantity** - Number of pieces to send
   - ✅ **Expected Return Date** - When vendor will return work
   - ✅ **Transport Mode** - e.g., "Truck", "Courier"
   - ✅ **Vehicle Number** - e.g., "MH01AB1234"
   - ✅ **Notes** - Special instructions for vendor
4. Click **"Create Outward Challan"**

**What Happens:**
- ✅ Challan created with unique number (CHN-20250131-0001)
- ✅ Stage marked as "In Progress"
- ✅ Challan listed in "Challans" section
- ✅ Challan status: "Pending" (awaiting return from vendor)

---

#### Step 3: Create Inward Challan (Receive from Vendor)

**What It Does:** Records completed work received back from vendor

**How to Create:**
1. Click **"Create Inward Challan"** (blue button)
2. Fill in the dialog:
   - ✅ **Outward Challan** (required) - Select corresponding outward challan
   - ✅ **Received Quantity** - How many pieces received
   - ✅ **Quality Notes** - Quality inspection results
   - ✅ **Discrepancies** - Any issues (e.g., "5 pieces damaged")
3. Click **"Create Inward Challan"**

**What Happens:**
- ✅ Inward challan created
- ✅ Outward challan status changed to "Completed"
- ✅ Both challans linked
- ✅ Stage quantities updated
- ✅ Audit trail maintained

---

#### Step 4: View Challans

After creating challans, they appear in the **"Challans"** section:

```
📄 CHN-20250131-0001
   Outward - Pending

📄 CHN-20250131-0002
   Inward - Completed
```

---

## 🧮 Feature 3: Material Reconciliation (Final Stage)

### **When It Appears:**
- Only visible in the **last production stage**
- Only when stage is **"In Progress"**

### **What It Does:**
- Calculates actual material consumption
- Identifies leftover materials
- **Automatically returns leftovers to inventory**

### **How to Use:**

#### Step 1: Open Reconciliation
1. Navigate to the **last stage** (e.g., "Packaging", "Finishing")
2. Look for yellow/amber section labeled **"Material Reconciliation"**
3. Click **"Open Material Reconciliation"** button

---

#### Step 2: Review & Update Materials

**You'll see a table with:**

| Material      | Allocated | Consumed | Wasted | Leftover |
|---------------|-----------|----------|--------|----------|
| Cotton Fabric | 100.00    | **85.00**| **5.00**| **10.00**|
| Thread        | 50.00     | **47.00**| **1.00**| **2.00** |
| Buttons       | 1000.00   | **980.00**| **5.00**| **15.00**|

**What to Do:**
1. **Review** allocated quantities (what was originally allocated)
2. **Edit** the **Consumed** column - Enter actual amount used
3. **Edit** the **Wasted** column - Enter amount wasted/damaged
4. **Leftover** is **auto-calculated**: `Leftover = Allocated - Consumed - Wasted`

**Example:**
```
Fabric: 100 meters allocated
You used: 88 meters (enter in "Consumed")
You wasted: 4 meters (enter in "Wasted")
Leftover: 8 meters (calculated automatically)
```

---

#### Step 3: Submit Reconciliation

1. Verify all numbers are correct
2. Click **"Complete Reconciliation"**

**What Happens:**
- ✅ Material allocations updated in database
- ✅ **Leftover materials returned to inventory**
- ✅ Inventory quantities increased by leftover amounts
- ✅ Inventory movement records created
- ✅ Audit trail maintained
- ✅ Success message: "Material reconciliation completed! Leftover materials returned to inventory."

**Result:**
```
✓ 8 meters of fabric returned to inventory
✓ 2 spools of thread returned to inventory
✓ 15 buttons returned to inventory
✓ Inventory stock updated
```

---

## 🎬 Complete Workflow Examples

### **Example 1: Simple In-House Stage**

```
1. Click stage (e.g., "Cutting")
2. Click "Start Stage" → Status: In Progress
3. Click "Edit" → Change start/end dates
4. Add notes: "Cutting completed smoothly"
5. Click "Save Changes"
6. Click "Complete Stage" → Status: Completed
7. Move to next stage
```

---

### **Example 2: Outsourced Embroidery**

```
1. Click "Embroidery" stage
2. Select "Outsourced" work type
3. Click "Create Outward Challan"
4. Fill in:
   - Vendor: "ABC Embroidery Works"
   - Quantity: 500 pieces
   - Expected Date: 2025-02-15
   - Transport: Truck, MH01AB1234
   - Notes: "Handle with care"
5. Click "Create Outward Challan"
   → Challan CHN-20250131-0001 created

[Wait for vendor to complete work]

6. Click "Create Inward Challan"
7. Fill in:
   - Outward Challan: CHN-20250131-0001
   - Received Quantity: 495
   - Quality Notes: "Good quality work"
   - Discrepancies: "5 pieces damaged"
8. Click "Create Inward Challan"
   → Work received, quantities updated
9. Click "Complete Stage"
```

---

### **Example 3: Final Stage with Reconciliation**

```
1. Navigate to last stage (e.g., "Packaging")
2. Click "Start Stage"
3. Click "Open Material Reconciliation"
4. Update materials:
   - Fabric: Consumed = 88, Wasted = 4 (Leftover = 8)
   - Thread: Consumed = 47, Wasted = 1 (Leftover = 2)
   - Buttons: Consumed = 980, Wasted = 5 (Leftover = 15)
5. Click "Complete Reconciliation"
   → Success! Materials returned to inventory
6. Click "Complete Stage"
   → Production order complete!
```

---

## 🔧 Backend APIs (Already Implemented)

### Outsourcing APIs
```
POST /api/manufacturing/stages/:stageId/outsource/outward
POST /api/manufacturing/stages/:stageId/outsource/inward
GET  /api/manufacturing/stages/:stageId/challans
```

### Material Reconciliation APIs
```
GET  /api/manufacturing/orders/:orderId/materials/reconciliation
POST /api/manufacturing/orders/:orderId/materials/reconcile
```

### Stage Management APIs
```
POST /api/manufacturing/stages/:stageId/start
POST /api/manufacturing/stages/:stageId/pause
POST /api/manufacturing/stages/:stageId/complete
PUT  /api/manufacturing/stages/:stageId
```

---

## ✅ Verification Checklist

### Before Testing:
- [ ] Restart your server: `npm run dev`
- [ ] Clear browser cache
- [ ] Ensure you have:
  - [ ] At least one production order
  - [ ] Vendors in the system
  - [ ] Materials allocated to production orders

### Test Each Feature:
- [ ] Open Operations View (eye icon works)
- [ ] Edit stage dates/times (Edit button works)
- [ ] Start/Pause/Complete actions work
- [ ] Outsourcing section appears for embroidery/printing stages
- [ ] Create outward challan works
- [ ] Create inward challan works
- [ ] Challans appear in list
- [ ] Material reconciliation appears in last stage
- [ ] Material reconciliation dialog opens
- [ ] Leftover calculation works
- [ ] Submit reconciliation returns materials to inventory

---

## 🐛 Troubleshooting

### Issue 1: "Unknown column 'outsource_cost'" error
**Solution:** Already fixed! Restart your server.

### Issue 2: Operations View doesn't open
**Check:**
- Production order has stages
- You have manufacturing permissions
- Browser console for errors

### Issue 3: Outsourcing options don't appear
**Check:**
- Stage name is "embroidery", "printing", "screen_printing", or "washing"
- Case-insensitive matching is applied

### Issue 4: Material reconciliation doesn't show
**Check:**
- You're on the **last stage** (bottom of stage list)
- Stage status is "In Progress"
- Production order has material allocations

### Issue 5: Challan creation fails
**Check:**
- Vendor is selected
- All required fields filled
- You have manufacturing department access
- Check server console for errors

---

## 📚 Related Documentation

- `PRODUCTION_OPERATIONS_SIMPLIFIED.md` - Technical implementation details
- `PRODUCTION_OPERATIONS_TESTING_GUIDE.md` - 29 test cases
- `STAGEOP_MODEL_FIX.md` - Database error fix details
- `PRODUCTION_OPERATIONS_QUICK_START.md` - Quick reference

---

## 🎉 Summary

### ✅ What You Have:
1. **Simplified stage editing** - No complex substages
2. **Outsourcing flow** - Inward/outward challans for vendors
3. **Material reconciliation** - Auto-return leftovers to inventory
4. **Clean UI** - Easy to use, color-coded status
5. **Complete audit trail** - All actions recorded
6. **Backend APIs** - Fully functional and tested

### 🚀 Ready to Use:
- All features are implemented
- Backend APIs are working
- Frontend is complete
- Database model is fixed
- Documentation is comprehensive

---

**Need Help?**
- Check the server console for errors
- Review browser console for frontend errors
- Verify you have the correct permissions
- Ensure data exists (orders, vendors, materials)

---

*Last Updated: January 31, 2025*
*Status: ✅ All Features Implemented and Working*