# 🚀 Quick Test Guide - Purchase Order Approval Workflow

## ✅ What Was Fixed

Your admin panel will now show purchase order approval requests! Here's what was implemented:

### Backend
1. ✅ **New Endpoint**: `POST /api/procurement/pos/:id/submit-for-approval`
2. ✅ **New Endpoint**: `GET /api/admin/pending-approvals`
3. ✅ Approval record creation in database
4. ✅ Notification system for admins

### Frontend
1. ✅ **New Button**: "Submit for Approval" in Purchase Orders page
2. ✅ **Updated**: Admin Dashboard to fetch pending approvals

---

## 🧪 Quick Test (5 Minutes)

### Test 1: Create & Submit a PO

```bash
# 1. Start the server
npm run dev

# 2. Open browser: http://localhost:3000
```

**Steps:**
1. **Login**: Use `admin@pashion.com` / `admin123`
2. **Navigate**: Procurement → Purchase Orders → Create PO
3. **Fill Form**:
   - Vendor: Select any vendor (e.g., "Supreme Fabrics")
   - Add at least one item
   - Expected Delivery: Any future date
   - **Important**: Keep status as "Draft"
4. **Save** the PO
5. **Actions Menu**: Click the 3-dot menu on the new PO row
6. **Click**: "Submit for Approval" (orange button)
7. **Confirm**: Click OK on the confirmation dialog
8. ✅ **Success**: You should see "Purchase order submitted for approval successfully!"

### Test 2: View in Admin Panel

**Steps:**
1. **Navigate**: Admin Dashboard (home page or /admin/dashboard)
2. **Look for**: "Pending Purchase Order Approvals" section
3. ✅ **Verify**: You should see:
   - Total pending POs: 1
   - Total value: (the PO amount)
   - The PO number listed
4. **Click**: On the PO to view details

### Test 3: Approve the PO

**Steps:**
1. **Navigate**: Procurement → Purchase Orders
2. **Filter**: Status = "Pending Approval"
3. **Find**: The PO you just submitted
4. **Actions Menu**: Click 3-dot menu
5. **Click**: "Approve PO" (green button)
6. **Confirm**: Click OK
7. ✅ **Success**: "Purchase order approved and sent to vendor!"
8. **Verify**: PO status changed to "Sent"

### Test 4: Check Notifications

**Steps:**
1. **Click**: Bell icon (top right)
2. ✅ **Verify**: You should see notifications:
   - "🔔 New PO Approval Request: PO-..."
   - "✅ PO PO-... Approved & Sent to Vendor"

---

## 📊 Expected Results

### Before Submission
- PO Status: `Draft`
- Approval Status: `not_requested`
- No approval record in database

### After Submission
- PO Status: `Pending Approval` (yellow badge)
- Approval Status: `pending`
- Approval record created in `approvals` table
- Admin notification sent

### After Approval
- PO Status: `Sent` (blue badge)
- Approval Status: `approved`
- Approved timestamp recorded
- Notifications sent to Procurement & Inventory

---

## 🎯 Quick Visual Check

### Purchase Orders Page (Procurement)

When you click the action menu for a **DRAFT** PO, you should see:

```
┌─────────────────────────────────┐
│  👁️ View / Edit                 │
│  📋 Submit for Approval  🟠     │  ← NEW! (Orange)
│  🚚 Send to Vendor              │
│  📄 Generate Invoice             │
│  🔲 Generate QR Code            │
└─────────────────────────────────┘
```

When you click the action menu for a **PENDING APPROVAL** PO, you should see:

```
┌─────────────────────────────────┐
│  👁️ View / Edit                 │
│  ✅ Approve PO  🟢              │  ← Admin only (Green)
│  📄 Generate Invoice             │
│  🔲 Generate QR Code            │
└─────────────────────────────────┘
```

### Admin Dashboard

You should see a card like this:

```
┌──────────────────────────────────────────┐
│  📋 Pending Purchase Order Approvals     │
├──────────────────────────────────────────┤
│  Total Pending: 1                        │
│  Total Value: ₹50,000                    │
│  Urgent Requests: 0                      │
│                                          │
│  • PO-20250120-0001 - ₹50,000          │
│    Vendor: Supreme Fabrics               │
│    Priority: Medium                      │
│    [View] [Approve]                      │
└──────────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### "Submit for Approval" button not visible
**Problem**: Button doesn't appear in action menu  
**Solution**: 
- ✅ Make sure PO status is "Draft"
- ✅ Refresh the page (Ctrl+F5)
- ✅ Clear browser cache

### Admin panel shows 0 pending POs
**Problem**: Dashboard shows no pending approvals  
**Solution**:
- ✅ Make sure you submitted a PO for approval
- ✅ Check PO status is "Pending Approval"
- ✅ Open browser console (F12) and check for errors
- ✅ Try refreshing the admin dashboard

### Error: "Failed to submit for approval"
**Problem**: API error when submitting  
**Solution**:
- ✅ Check server console for error messages
- ✅ Verify database connection is working
- ✅ Ensure `approvals` table exists
- ✅ Check user has procurement or admin role

---

## 📱 API Testing (Optional)

If you want to test the APIs directly:

### Submit PO for Approval
```bash
curl -X POST http://localhost:5000/api/procurement/pos/1/submit-for-approval \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Please approve this PO"}'
```

### Get Pending Approvals
```bash
curl http://localhost:5000/api/admin/pending-approvals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✨ Summary

**What You Can Do Now:**

1. ✅ **Procurement Users** can submit draft POs for admin approval
2. ✅ **Admin Users** can see all pending approval requests in one place
3. ✅ **System** automatically creates approval records and sends notifications
4. ✅ **Complete Workflow**: Draft → Submit → Approve → Send to Vendor → GRN

**Next Workflow Steps:**
1. Create Draft PO
2. Submit for Approval (Procurement)
3. Review & Approve (Admin)
4. PO sent to Vendor automatically
5. When materials arrive → Create GRN
6. Verify quality → Add to Inventory

---

## 📚 Related Documents

- **Full Documentation**: `PURCHASE_ORDER_APPROVAL_WORKFLOW_FIX.md`
- **GRN Workflow**: `GRN_WORKFLOW_COMPLETE_GUIDE.md`
- **System Setup**: `QUICK_START_GUIDE.md`

---

**Status**: ✅ Ready to Test  
**Time to Test**: ~5 minutes  
**Complexity**: Easy 🟢