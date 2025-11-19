# GRN Verification & Complaint System - Quick Start Guide

## 🚀 What's New?

When you click **"Create GRN"** in the Inventory Dashboard, the system now:

✅ **Compares 3-way quantities**:
- What you ordered (PO)
- What vendor invoiced
- What you actually received

✅ **Detects discrepancies automatically**:
- 🔴 **SHORTAGES** - Received less than expected (auto-creates complaint, vendor return request)
- 🟡 **OVERAGES** - Received more than expected (auto-creates complaint)
- 🟠 **INVOICE MISMATCHES** - Invoice qty ≠ PO qty

✅ **Auto-verifies perfect matches**:
- If all items match perfectly → GRN auto-verified ✓
- Redirects you to Inventory Addition (skip verification)

✅ **Logs complaints for Procurement team**:
- All discrepancies visible in **Procurement Dashboard**
- Procurement can track and approve complaints
- Notifications sent automatically

---

## 📋 How to Use

### Step 1: Create GRN (Inventory Staff)

1. Go to **Inventory → GRN Workflow → Incoming Requests**
2. Click **Create GRN** button on a Purchase Order
3. Enter received quantities (compare with PO and invoice)
4. You'll see real-time feedback:
   - ✅ Green = Perfect match
   - 🔴 Red background = Shortage
   - 🟡 Yellow background = Overage
   - 🟠 Orange = Invoice mismatch

**Example Table View:**
```
Material        | Ordered | Invoiced | Received | Status
─────────────────────────────────────────────────────
Cotton (100m)   |   100   |   100    |   100    | ✓ Perfect Match
Polyester (50m) |    50   |    50    |    45    | ⚠️ SHORT: 5 units
Silk (75m)      |    75   |    75    |    80    | ⚠️ OVER: 5 units
```

### Step 2: Submit GRN

Click **"Create GRN & Proceed to Verification"**

**If Perfect Match:**
- ✅ Shows: "GRN CREATED & AUTO-VERIFIED!"
- Redirects to → **Inventory Addition** page
- You can directly add to inventory

**If Discrepancies Found:**
- ⚠️ Shows: "GRN created with 2 shortage(s)..."
- Lists what complaints were created
- Redirects to → **Verification** page
- Complaints automatically visible to Procurement team

### Step 3: Check Procurement Dashboard (Procurement Staff)

1. Go to **Procurement Dashboard**
2. See complaints in notifications
3. Navigate to **Complaints** tab (to be added)
4. Filter by:
   - Status: Pending, Approved, Rejected
   - Type: Shortage, Overage, Invoice Mismatch
5. View details and take action

---

## 📊 Complaint Types Explained

### Type 1: SHORTAGE 🔴
**When:** Received < Expected

**Example:**
- PO Ordered: 100 units
- Invoice: 100 units  
- Received: 95 units
- **Shortage: 5 units**

**What Happens:**
- Complaint created in Procurement Dashboard
- Vendor Return request auto-generated
- Notification sent to Procurement
- Procurement approves and coordinates with vendor

**Action Items:**
- Approve shortage
- Contact vendor for replacement/credit
- Track resolution

---

### Type 2: OVERAGE 🟡
**When:** Received > Expected

**Example:**
- PO Ordered: 100 units
- Invoice: 100 units
- Received: 110 units
- **Overage: 10 units**

**What Happens:**
- Complaint created in Procurement Dashboard
- Notification sent: "Extra quantity provided by vendor"
- Needs verification before payment

**Action Items:**
- Approve overage
- Request credit note from vendor
- Or arrange return of extra items

---

### Type 3: INVOICE MISMATCH 🟠
**When:** Invoice Qty ≠ PO Qty (but received matches one)

**Example:**
- PO Ordered: 100 units
- Invoice: 105 units
- Received: 105 units

**What Happens:**
- Complaint created: "Invoice qty doesn't match PO"
- Notification sent to Procurement
- Needs clarification before payment

**Action Items:**
- Verify invoice with vendor
- Check if PO needs to be updated
- Resolve billing discrepancy

---

## 💡 Example Workflows

### Scenario 1: Perfect Delivery ✅

```
Create GRN
├─ All quantities match
└─ ✅ AUTO-VERIFIED
   └─ Redirect to Inventory Addition
      └─ Add to inventory immediately
```

**Time Saved:** No manual verification needed!

---

### Scenario 2: Shortage Detected ⚠️

```
Create GRN
├─ 5 units missing
├─ ⚠️ SHORTAGE COMPLAINT CREATED
└─ Vendor Return Request Generated
   ├─ Notification → Procurement
   ├─ Complaint visible in Dashboard
   └─ Procurement approves → Contacts vendor
      └─ Vendor sends replacement
         └─ New GRN created for replacement
```

---

### Scenario 3: Extra Quantity Received 📦

```
Create GRN
├─ 10 units extra received
├─ 📦 OVERAGE COMPLAINT CREATED
└─ Notification → Procurement
   ├─ Complaint visible in Dashboard
   └─ Procurement decides:
      ├─ Option A: Approve overage + pay extra
      ├─ Option B: Request credit note
      └─ Option C: Arrange return
```

---

## 🔍 Viewing Complaints

### In Procurement Dashboard (New Tab - Coming Soon)

**Complaints Tab will show:**

| Complaint Type | PO # | Vendor | Items | Value | Status |
|---|---|---|---|---|---|
| 🔴 Shortage | PO-001 | ABC Fabrics | 1 | ₹2,500 | Pending |
| 📦 Overage | PO-002 | XYZ Supplies | 1 | ₹5,000 | Pending |
| 🟠 Mismatch | PO-003 | QRS Ltd | 2 | - | Pending |

**Filter Options:**
- By Status: All, Pending, Approved, Rejected
- By Type: All, Shortage, Overage, Invoice Mismatch
- Date Range: Last 7 days, Last 30 days, Custom

---

## 📡 API Endpoints (For Developers)

### Create GRN with Auto-Complaint
```
POST /api/grn/from-po/:poId
```

**Response includes:**
```json
{
  "message": "✅ GRN CREATED & AUTO-VERIFIED! All items match perfectly.",
  "grn": { /* GRN details */ },
  "complaints": [ /* Auto-created complaints */ ],
  "all_items_verified": true,
  "perfect_match_count": 3,
  "has_shortages": false,
  "has_overages": false,
  "next_step": "inventory_addition"
}
```

### Fetch Complaints
```
GET /api/procurement/dashboard/grn-complaints?status=pending&type=shortage
```

**Response:**
```json
{
  "complaints": [
    {
      "id": 123,
      "grn_number": "GRN-20250111-00001",
      "po_number": "PO-001",
      "vendor_name": "ABC Fabrics",
      "complaint_type": "shortage",
      "items_affected": [
        {
          "material_name": "Cotton Fabric",
          "shortage_qty": 5,
          "shortage_value": "₹2,500"
        }
      ],
      "status": "pending",
      "action_required": "Approve shortage and coordinate with vendor for replacement"
    }
  ],
  "total": 15
}
```

---

## ⚙️ Configuration

### Auto-Verify Perfect Matches
Currently enabled by default. All items that perfectly match (Ordered = Invoiced = Received) are auto-verified.

**To modify:** Edit `server/routes/grn.js` line ~680

### Tolerance Levels (Future Feature)
You can set tolerance % for auto-approval:
```javascript
// e.g., Auto-approve if shortage < 2%
const SHORTAGE_TOLERANCE = 0.02; // 2%
const OVERAGE_TOLERANCE = 0.02;  // 2%
```

---

## 🧪 Testing the System

### Test Scenario 1: Perfect Match
1. Go to Create GRN page
2. Ensure **all quantities match** exactly
3. Submit → Should see ✅ "Auto-Verified"

### Test Scenario 2: Create a Shortage
1. Go to Create GRN page
2. Set Received = Ordered - 5
3. Submit → Should see ⚠️ "Shortage Complaint Created"
4. Check Procurement Dashboard → Complaint visible

### Test Scenario 3: View All Complaints
1. Go to Procurement Dashboard
2. Open Complaints tab
3. Filter by Status = Pending
4. View complaints with details

---

## 📞 Support & Troubleshooting

### Issue: GRN shows as verified but I got a notification about shortage

**Solution:** Check the exact quantities. If received < min(ordered, invoiced), it's a shortage.

### Issue: No complaints appearing in Procurement Dashboard

**Solution:**
1. Check that complaints were created (check response message)
2. Make sure you're logged in as Procurement user
3. Check filters - might be filtering out your complaint type

### Issue: Auto-verification not working

**Solution:** Auto-verify only works when ALL items perfectly match. Even one mismatch triggers manual verification.

---

## 📝 Checklist for Implementation

- [x] Backend: GRN complaint generation endpoint
- [x] Backend: Complaint fetching endpoint for dashboard
- [x] Frontend: Enhanced CreateGRNPage with feedback
- [ ] Frontend: Complaints tab in Procurement Dashboard (to be built)
- [ ] Frontend: Complaint approval/rejection UI
- [ ] Email notifications (future)
- [ ] Vendor performance tracking (future)

---

## 🎯 Key Benefits

✅ **Faster Processing:** Perfect matches auto-verified
✅ **Better Visibility:** All discrepancies tracked in dashboard
✅ **Reduced Manual Work:** Auto-complaints eliminate manual logging
✅ **Vendor Accountability:** Complaints recorded with metrics
✅ **Proactive Management:** Issues flagged immediately
✅ **Complete Audit Trail:** All matched vs actual stored

---

## 📚 Related Documentation

- `GRN_VERIFICATION_COMPLAINT_SYSTEM.md` - Complete technical documentation
- `server/routes/grn.js` - Backend implementation
- `server/routes/procurement.js` - Procurement endpoints
- `client/src/pages/inventory/CreateGRNPage.jsx` - Frontend implementation

---

**Status:** ✅ **READY FOR TESTING**

Start creating GRNs and watch the system handle discrepancies automatically!