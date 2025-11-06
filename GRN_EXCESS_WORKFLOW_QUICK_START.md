# GRN Excess Workflow - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Access the Workflow

**Step 1**: Navigate to Inventory Module

```
Sidebar → Inventory → Goods Receipt Note
```

**Step 2**: You'll see the new **GRN Workflow Dashboard**

```
http://localhost:3000/inventory/grn
```

---

## 📊 Understanding the Workflow Status Colors

| Color     | Status    | Meaning            | Action                       |
| --------- | --------- | ------------------ | ---------------------------- |
| 🟢 Green  | Accurate  | Received = Ordered | Verify & add to inventory    |
| 🟠 Orange | Short Qty | Received < Ordered | Vendor Return auto-generated |
| 🔵 Blue   | Excess    | Received > Ordered | Decide: Reject or Accept     |
| 🔴 Red    | Mixed     | Both issues        | Handle both cases            |

---

## 🎯 Quick Actions

### 1. Create a New GRN

**From Dashboard**:

```
Click: "+ Create GRN" button (top right)
↓
Select Purchase Order
↓
Enter received quantities
↓
Submit
```

**Or Direct URL**:

```
/inventory/grn/create?po_id=<YOUR_PO_ID>
```

---

### 2. Handle Excess Quantity

**From Dashboard**:

```
1. Find GRN with 🔵 Blue badge (Excess Qty)
2. Click on the GRN card
3. Click "Handle Excess" button
4. Choose Option A or B
5. Add notes (optional)
6. Click "Reject Excess" or "Approve Excess"
```

---

## 🔻 Case 1: Shortage Detected

**What You See**:

- GRN appears with 🟠 **Orange Badge** "Short Received"
- Detail modal shows shortage details

**What Happened Automatically**:

- ✅ Vendor Return created (e.g., VR-20250117-00001)
- ✅ Debit note issued
- ✅ Team notified

**Your Action**:

```
1. Click on GRN
2. View shortage details
3. Contact vendor for replacement
4. When replacement received, create another GRN
```

---

## 🔺 Case 2: Excess Quantity

**What You See**:

- GRN appears with 🔵 **Blue Badge** "Excess Received"
- "Handle Excess" button available

**Decision 1: Reject Excess (Option A)**

```
1. Click "Handle Excess"
2. Select "Option A: Auto-Reject Excess"
3. Click "Reject Excess"

Result:
├─ ✅ Vendor Return auto-generated
├─ 📋 PO status: received (only ordered qty)
├─ 🚚 Excess to be returned
└─ 🔔 Vendor notified
```

**Decision 2: Accept Excess (Option B)**

```
1. Click "Handle Excess"
2. Select "Option B: Accept Excess with Approval"
3. Add notes (e.g., "Approved by Manager X")
4. Click "Approve Excess"

Result:
├─ ✅ All quantity accepted
├─ 📋 PO status: excess_received
├─ 📦 Extra stock available
└─ 🔔 Procurement notified
```

---

## ✅ Case 3: Perfect Match

**What You See**:

- GRN appears with 🟢 **Green Badge** "Accurate Qty"
- No action buttons needed

**What Happens**:

```
1. GRN created
2. No discrepancies
3. Sent to verification
4. After approval → Added to inventory
5. PO marked as "received"
```

---

## 📋 Quick Reference: Workflow Decisions

### When Quantity is Short (Less Received)

```
Ordered: 100 | Received: 75 (25 short)

Action: AUTOMATIC
├─ Vendor Return: Auto-generated
├─ PO Status: short_received
└─ Next: Follow up with vendor
```

### When Quantity is Excess (More Received)

```
Ordered: 100 | Received: 125 (25 extra)

Action: USER DECIDES

Option A: Reject Extra 🚫
├─ Vendor Return: Auto-generated
├─ Inventory: 100 units
├─ PO Status: received
└─ Extra: Returns to vendor

Option B: Accept Extra ✅
├─ Vendor Return: None
├─ Inventory: 125 units
├─ PO Status: excess_received
└─ Extra: Available for use
```

---

## 🔄 Complete Workflow Example

### Scenario: Fabric Order with Excess

**Background**:

- Order: 100 meters Cotton Fabric
- Invoice: 100 meters
- Received: 110 meters (10 extra)

**Step 1: Create GRN**

```
Go to: /inventory/grn/create?po_id=PO-2025-001
Enter received qty: 110 meters
Submit → GRN-20250117-00001 created
```

**Step 2: Detect Excess**

```
System calculates:
├─ Ordered: 100
├─ Received: 110
├─ Excess: 10 meters
└─ Status: 🔵 Blue (Excess Qty)
```

**Step 3: Access Dashboard**

```
Go to: /inventory/grn
Find: GRN-20250117-00001 (Blue badge)
Click: "Handle Excess"
```

**Step 4: Make Decision**

**If Reject**:

```
Select: "Option A: Auto-Reject Excess"
Notes: "Not needed for current orders"
Click: "Reject Excess"

Result:
├─ Inventory: 100 meters added
├─ VR Created: VR-20250117-00001
├─ Excess: 10 meters to return
└─ Status: Approved ✅
```

**If Accept**:

```
Select: "Option B: Accept Excess with Approval"
Notes: "Can use extra for upcoming order"
Click: "Approve Excess"

Result:
├─ Inventory: 110 meters added
├─ VR Created: None
├─ Extra: Available for production
└─ Status: Approved ✅
```

**Step 5: Continue**

```
Go to: GRN Verification
Verify quality
Add to inventory
Complete workflow
```

---

## 💾 Key Information to Remember

### PO Statuses Used

```
received        → Accurate or rejected excess
short_received  → Shortage detected
excess_received → Excess quantity accepted
```

### Auto-Generated Documents

```
Vendor Return (VR) Format: VR-YYYYMMDD-XXXXX
Example: VR-20250117-00001

Created for:
├─ Shortages (automatic)
└─ Excess (only if Option A selected)
```

### Notifications Sent

```
Type: excess_rejected
Message: "Excess quantity in GRN... has been auto-rejected"

Type: excess_approved
Message: "Excess quantity in GRN... has been approved"
```

---

## 🎯 Common Scenarios

### Scenario A: Partial Delivery

```
Expected: 50 units → Received: 40 units (10 short)

✅ Automatic Actions:
├─ GRN created with shortage flag
├─ Vendor Return VR-xxx created
├─ Debit note issued for 10 units value
├─ Vendor notified
└─ Your action: Follow up with vendor
```

### Scenario B: Over-Delivery - Accept

```
Expected: 50 units → Received: 55 units (5 extra)

👤 User Decision: Accept Extra

✅ Results:
├─ All 55 units added to inventory
├─ Extra 5 available for other orders
├─ PO marked as excess_received
└─ No vendor return needed
```

### Scenario C: Over-Delivery - Reject

```
Expected: 50 units → Received: 55 units (5 extra)

👤 User Decision: Reject Extra

✅ Results:
├─ Only 50 units added to inventory
├─ Vendor Return created for 5 units
├─ 5 units scheduled for return
├─ PO marked as received
└─ Coordination with vendor for pickup
```

---

## 📊 Dashboard Features

**View All GRNs**:

```
Dashboard shows:
├─ GRN Number & Status Badge
├─ PO Reference
├─ Vendor Name
├─ Received Date
├─ Quantity Summary (Ordered vs Received)
└─ Quick Actions
```

**Filter & Search**:

```
Search Box: GRN #, PO #, Vendor name
Status Filter: All / Received / Verified
```

**Action Buttons**:

```
View Details    → See full GRN information
Verify          → Go to verification page
Handle Excess   → Make decision for excess qty
```

---

## 🔐 Access Control

**Who Can Create GRNs**:

- ✅ Inventory Users
- ✅ Admin Users
- ❌ Others (blocked)

**Who Can Handle Excess**:

- ✅ Inventory Users
- ✅ Procurement Users
- ✅ Admin Users
- ❌ Others (blocked)

---

## 🚨 Troubleshooting

### Issue: No "Handle Excess" Button

```
Reason: GRN doesn't have excess quantities
Solution: Check if Received Qty > Ordered Qty
```

### Issue: Excess Approval Page Won't Load

```
Reason: GRN ID not found or already handled
Solution: Verify correct GRN ID in URL
```

### Issue: Can't Submit Excess Decision

```
Reason: Missing required fields
Solution: Make sure approval notes are needed or optional
         Select an option (A or B)
```

---

## ✨ Pro Tips

1. **Note Your Decisions**

   - Always add notes when approving excess
   - Helps with audit trail

2. **Monitor Vendor Patterns**

   - Frequent shortages? Escalate with vendor
   - Frequent excess? Set expectations

3. **Use Option B Wisely**

   - Only approve excess if needed for production
   - Reduces carrying costs

4. **Quick Access**
   - Bookmark: `/inventory/grn`
   - Direct URL to create: `/inventory/grn/create?po_id=<ID>`

---

## 📞 Need Help?

**For Technical Issues**:

- Check browser console for errors
- Verify user department is "inventory"
- Check API connectivity

**For Workflow Questions**:

- Review case examples above
- Check decision matrix table
- Refer to full documentation

---

## 🎓 Learning Resources

**Read These Docs**:

1. `GRN_WORKFLOW_WITH_EXCESS_LOGIC_COMPLETE.md` - Full reference
2. `GRN_WORKFLOW_CURRENT_FLOW.md` - Visual diagrams
3. `GRN_WORKFLOW_CODE_FLOW.md` - Code implementation

---

**Status**: ✅ Ready to Use

**Start Here**: `http://localhost:3000/inventory/grn`
