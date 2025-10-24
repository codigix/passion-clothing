# Complete MRN → Production Order Flow - Manual Step-by-Step Guide

## 🎯 GOAL: Create a Production Order from Scratch

This guide walks you through the **complete workflow** from sales order creation to starting production.

---

## ✅ STEP 1: Create a Sales Order

**Where:** Sales Dashboard

1. Navigate to **Sales Dashboard**
2. Click **"Create Order"** button
3. Fill in:
   - **Customer Name** - Select or create
   - **Product** - Select product to manufacture
   - **Quantity** - How many units (e.g., 100)
   - **Delivery Date** - When needed
   - **Color** - Color of fabric (optional)
   - **Fabric Type** - Type of fabric (optional)
4. Click **"Create Sales Order"**
5. **RESULT:** Sales Order created with status: `pending`

---

## ✅ STEP 2: Create a Purchase Order

**Where:** Procurement Dashboard

1. Navigate to **Procurement Dashboard**
2. Click on the sales order you just created OR
3. Click **"Create Purchase Order"** button
4. Fill in:
   - **Sales Order** - Select the one you created
   - **Vendor** - Select supplier
   - **Materials** - Auto-populated from sales order
   - **Quantity** - Matches sales order
   - **Expected Delivery** - Date when materials should arrive
5. Click **"Create Purchase Order"**
6. **RESULT:** PO created, Sales Order status changes to: `procurement_created`

---

## ✅ STEP 3: Create Material Request (MRN)

**Where:** Inventory → Material Requests OR Procurement Dashboard

### Option A: From Procurement Dashboard
1. Go to **Procurement Dashboard**
2. Find PO you created
3. Click **"Create MRN"** button

### Option B: From Manufacturing Dashboard
1. Go to **Manufacturing Dashboard**
2. Tab: **"Ready for Production"** section
3. Click **"Request Materials"** button
4. Select Sales Order

### Details to Fill:
- **Sales Order** - Auto-filled
- **Materials Required** - Auto-populated from PO
- **Quantity** - Should match
- **Priority** - High/Medium/Low
- **Required By** - ASAP

5. Click **"Submit"**
6. **RESULT:** MRN Request created with status: `pending_inventory`
   - Sales Order status: `material_requested`

---

## ✅ STEP 4: Dispatch Materials from Inventory

**Where:** Inventory Dashboard

1. Navigate to **Inventory Dashboard**
2. Find the MRN you created (status: `pending_inventory`)
3. Click **"Dispatch to Manufacturing"** button
4. Fill in:
   - **Dispatch Details** - Where from, where to
   - **Materials** - Select items to dispatch
   - **Quantities** - How much of each
   - **Transport Details** - Who's carrying it (optional)
5. Click **"Dispatch"**
6. **RESULT:** Material Dispatch created
   - Inventory deducted
   - Manufacturing Dashboard shows **"Dispatches Awaiting Receipt"**

---

## ⚠️ STEP 5: Receive Materials in Manufacturing (FIRST MISSING STEP)

**Where:** Manufacturing Dashboard → Material Receipts

1. Go to **Manufacturing Dashboard**
2. Scroll to **"Material Receipts"** section
3. Find **"Dispatches Awaiting Receipt"** cards
4. Click **"Receive Materials"** button on dispatch
5. **REDIRECTS TO:** Material Receipt Page (`/manufacturing/material-receipt/{dispatchId}`)
6. Fill in:
   - **Materials Received** - Verify quantities match dispatch
   - **Condition** - Good/Damaged/Partial
   - **Remarks** - Any notes
   - **Photos** - Optional photos
7. Click **"Submit Receipt"**
8. **RESULT:** Material Receipt created
   - Status: `verification_status: 'pending'`
   - MRN Request status: `issued`
   - **NEXT STEP REQUIRED:** Go to verification

---

## 🔴 STEP 6: Verify Materials (QC) - YOUR MISSING STEP!

**Where:** Manufacturing Dashboard → Material Receipts (or navigate manually)

**THIS IS THE STEP THAT'S MISSING!**

After Step 5 completes, you should see:
- Toast message: "Material receipt created successfully"
- Auto-redirect: To `StockVerificationPage`

OR manually navigate:
1. Go to **Manufacturing Dashboard**
2. Tab: **"Material Receipts"**
3. Find receipts with status: **"Pending Verification"**
4. Click receipt → **"Verify Materials"** link
5. **REDIRECTS TO:** Stock Verification Page (`/manufacturing/stock-verification/{receiptId}`)

### On Stock Verification Page:

6. Fill in Verification Checklist:
   - For each material:
     - **Correct Quantity?** - Yes/No
     - **Good Quality?** - Yes/No
     - **Specs Match?** - Yes/No
     - **No Damage?** - Yes/No
   - If any "No", mark as inspection failed

7. If failures, add "Issues Found":
   - Material name
   - Issue type (quality, shortage, damage, etc.)
   - Severity
   - Description

8. Add Notes and Photos (optional)

9. Click **"Submit Verification"**

10. **RESULT:** Material Verification created
    - `approval_status: 'pending'`
    - `overall_result: 'passed'` (if all checks OK)
    - Receipt status: `verification_status: 'verified'`
    - **NOW VERIFICATIONS WILL APPEAR IN API RESPONSE!**

---

## ✅ STEP 7: Approve Production (Create Approval)

**Where:** Manufacturing → Production Approvals OR Auto after Verification

1. Go to **Manufacturing Dashboard**
2. Tab: **"Approved Productions"** (or Production Orders page)
3. Should see **"Pending Approvals"** section

OR manually navigate:
1. Go to **`/manufacturing/production-wizard?approvalId=...`**
   OR
2. Find verification in MRN List → Click "Approve for Production"

### On Production Approval Page:

4. Review Materials Verified
5. Set **Approval Status:**
   - **"Approved"** - Materials OK, start production
   - **"Rejected"** - Materials not OK
   - **"Conditional"** - OK with conditions
6. If approved, set **Production Start Date**
7. Add Notes
8. Click **"Submit"**
9. **RESULT:** Production Approval created
   - Status: `approval_status: 'approved'`
   - MRN Request status: `materials_ready`
   - **PRODUCTION APPROVALS WILL NOW APPEAR IN API!**

---

## ✅ STEP 8: Create Production Order

**Where:** Manufacturing Dashboard → Production Wizard

1. Go to **Manufacturing Dashboard**
2. Tab: **"Approved Productions"**
3. Find approved material → Click **"Start Production"** OR
4. Click **"Create Production Order"** button
5. **REDIRECTS TO:** Production Wizard (`/manufacturing/production-wizard`)

### On Production Wizard Page:

6. Auto-filled from approval:
   - Sales Order
   - Product
   - Quantity
   - Materials
   - Due Date

7. Review/Edit:
   - **Assigned To** - Which supervisor
   - **Stages** - Production stages (Cutting, Printing, Stitching, Finishing, QC)
   - **Special Instructions** - Any notes

8. Click **"Create Production Order"**

9. **RESULT:** Production Order created!
   - Status: `in_progress` or `pending`
   - Appears in **"Active Production Orders"**
   - Sales Order status: `in_production`
   - **✅ FLOW COMPLETE!**

---

## 🎬 STEP 9: Track Production (Optional)

Once production order created:

1. Go to **Manufacturing Dashboard** → **"Active Production Orders"**
2. Click **"View"** on order
3. **REDIRECTS TO:** Production Operations View
4. Track each stage:
   - Start Stage
   - Track quantities
   - Mark complete
   - View metrics

---

## 🔍 TROUBLESHOOTING

### Problem: "No dispatches showing in Material Receipts"
- **Cause:** Materials not dispatched from inventory
- **Fix:** Complete STEP 4 (Dispatch Materials)

### Problem: "Can't find Stock Verification page after receipt"
- **Cause:** Auto-redirect not working OR receipt not created
- **Fix:**
  1. Check browser console for errors (F12 → Console)
  2. Manually navigate: `/manufacturing/stock-verification/{receiptId}`
  3. Get receiptId from database: `SELECT id FROM MaterialReceipts ORDER BY created_at DESC LIMIT 1`

### Problem: "Verification submitting but not appearing in API"
- **Cause:** Verification created but overall_result is 'failed' or approval_status is not 'pending'
- **Fix:** Ensure all QC checks pass (all "Yes")
- **SQL Check:**
```sql
SELECT id, verification_number, overall_result, approval_status 
FROM MaterialVerifications 
ORDER BY created_at DESC LIMIT 5;
```

### Problem: "Production Approvals not appearing"
- **Cause:** No verifications with passed status
- **Fix:** Complete STEP 6 with all checks passing

### Problem: "Login not working"
- **Cause:** User not in database, wrong password, or auth endpoint broken
- **Fix:**
  1. Check user exists: 
  ```sql
  SELECT * FROM Users WHERE email = 'your.email@example.com';
  ```
  2. Check auth endpoint: Test with Postman
  3. Check server console for errors

---

## 📋 QUICK VERIFICATION CHECKLIST

Before starting production order, verify:

- [ ] Sales Order created (status: `procurement_created`)
- [ ] Purchase Order created (status: `confirmed`)
- [ ] MRN Request created (status: `issued`)
- [ ] Materials Dispatched (visible in dashboard)
- [ ] Materials Received (receipt created)
- [ ] **⚠️ Materials Verified** (verification created with `overall_result: 'passed'`)
- [ ] Production Approved (approval created with `approval_status: 'approved'`)
- [ ] Production Order created (visible in Active Orders)

**If any of these missing, flow is incomplete!**

---

## 🚀 QUICK LINKS

- **Sales Dashboard:** `/sales/dashboard`
- **Procurement Dashboard:** `/procurement/dashboard`
- **Inventory Dashboard:** `/inventory/dashboard`
- **Manufacturing Dashboard:** `/manufacturing/dashboard`
- **Material Requests:** `/manufacturing/mrm-list`
- **Production Wizard:** `/manufacturing/production-wizard`
- **Production Orders:** `/manufacturing/production-orders`
- **Stock Verification:** `/manufacturing/stock-verification/{receiptId}`

---

## 💡 TIPS

1. **Check console after each step** (F12 → Console) for any errors
2. **Refresh page** if data doesn't update immediately
3. **Use browser back button** if redirect doesn't work
4. **Check permissions** - User must have manufacturing department
5. **Test with admin user** if regular user has issues

---

**That's the complete flow! Follow steps 1-8, and production order will be created. Let me know if any step fails!**