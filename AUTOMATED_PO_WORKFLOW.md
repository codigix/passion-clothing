# 🔄 Automated Purchase Order Workflow

## 📋 Overview

This document describes the **fully automated** Purchase Order approval and inventory workflow implemented in the Passion ERP system.

---

## ✨ **What's Automated?**

### **Step 1: Create Purchase Order → Auto-Send for Approval**
When a procurement user creates a PO, it is **automatically sent for admin approval**.

- **Old Behavior:** PO created in "draft" status → manual action needed to send for approval
- **New Behavior:** PO created in "pending_approval" status → auto-sent to admin panel

### **Step 2: Admin Approves → Auto-Send to Vendor**
When admin approves the PO, it is **automatically sent to the vendor**.

- **Old Behavior:** PO status changed to "approved" → manual action needed to send to vendor
- **New Behavior:** PO status changed to "sent" → vendor can start preparing materials

### **Step 3: Vendor Delivers → Create GRN → Add to Inventory**
When vendor delivers materials, store team creates GRN for quality verification before adding to inventory.

- **Manual Step:** Store team creates GRN from approved PO
- **Manual Step:** Quality team verifies GRN (quantity, weight, quality checks)
- **Manual Step:** After verification, materials are added to inventory

---

## 🔄 **Complete Automated Workflow**

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Create Purchase Order                                  │
│  ────────────────────────────────────────────────────────────   │
│  User: Procurement Team                                         │
│  Action: Fill PO form and click "Create PO & Send for Approval" │
│  Status: pending_approval (AUTOMATIC)                           │
│  ✅ PO automatically sent to admin panel for review             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Admin Approval                                         │
│  ────────────────────────────────────────────────────────────   │
│  User: Admin / Procurement Manager                              │
│  Page: /procurement/pending-approvals                           │
│  Action: Review PO details and click "Approve Purchase Order"   │
│  Status: sent (AUTOMATIC)                                       │
│  ✅ PO automatically sent to vendor after approval              │
│  📧 Notifications sent to procurement & inventory teams         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Vendor Delivers Materials                              │
│  ────────────────────────────────────────────────────────────   │
│  Vendor ships materials with delivery challan and invoice       │
│  Store team receives physical materials                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Create GRN (Goods Receipt Note)                        │
│  ────────────────────────────────────────────────────────────   │
│  User: Store / Inventory Team                                   │
│  Page: /inventory/grn/create?po_id=123                          │
│  Action: Enter received quantities, challan details             │
│  Status: GRN created with verification_status: pending          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: GRN Quality Verification                               │
│  ────────────────────────────────────────────────────────────   │
│  User: QC / Inventory Team                                      │
│  Page: /inventory/grn/:id/verify                                │
│  Action: Verify quantity, weight, quality                       │
│  Options:                                                        │
│    ✅ Verified (no issues) → Continue to inventory              │
│    ⚠️ Discrepancy found → Report to manager                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: Add to Inventory                                       │
│  ────────────────────────────────────────────────────────────   │
│  User: Inventory Team                                           │
│  Page: /inventory/grn/:id/add-to-inventory                      │
│  Action: Select warehouse location and confirm                  │
│  Result:                                                         │
│    ✅ Inventory entries created with barcodes & QR codes        │
│    ✅ Products auto-created if they don't exist                 │
│    ✅ Inventory movements recorded                              │
│    ✅ PO status updated to "completed"                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 **Status Transitions**

### **Purchase Order Statuses:**
```
pending_approval → sent → received → completed
```

| Status | Description | How it's set |
|--------|-------------|--------------|
| `pending_approval` | PO awaiting admin approval | **Automatic** when PO is created |
| `sent` | PO approved and sent to vendor | **Automatic** when admin approves |
| `received` | Vendor delivered materials | Manual when GRN is created |
| `completed` | Materials added to inventory | Automatic when inventory is added |

### **GRN Statuses:**
```
received → inspected → approved
```

### **GRN Verification Statuses:**
```
pending → verified → (inventory added)
       → discrepancy → approved/rejected
```

---

## 🎯 **Benefits of Automation**

### **1. Faster Processing**
- ✅ No manual "Send for Approval" button click needed
- ✅ No manual "Send to Vendor" button click needed
- ✅ Reduced workflow steps from 5 to 3 manual actions

### **2. Consistency**
- ✅ Every PO automatically goes through approval
- ✅ No POs sent to vendor without approval
- ✅ Enforced quality control via GRN workflow

### **3. Audit Trail**
- ✅ Automatic notifications at each stage
- ✅ Timestamp tracking: created, approved, sent, received
- ✅ Full traceability from PO to inventory

### **4. Error Prevention**
- ✅ Can't skip approval step
- ✅ Can't add materials without GRN verification
- ✅ Quality checks mandatory before inventory addition

---

## 🔧 **Technical Implementation**

### **Frontend Changes**

#### **1. EnhancedPurchaseOrderForm.jsx** (Line 297-315)
```javascript
// All new POs automatically go to 'pending_approval'
switch (actionType) {
  case 'send_for_approval':
  case 'save_draft': // Auto-send for approval
    payload.status = 'pending_approval';
    break;
  default:
    payload.status = 'pending_approval'; // Default: auto-send for approval
}
```

#### **2. CreatePurchaseOrderPage.jsx** (Line 929-935)
```jsx
{!createdOrder && (
  <div className="mt-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
    <p className="text-sm text-blue-800">
      <strong>📋 Automated Workflow:</strong> PO will be automatically sent to 
      admin for approval. After approval, it will be sent to vendor automatically.
    </p>
  </div>
)}
```

#### **3. PendingApprovalsPage.jsx** (Line 297)
```javascript
alert(`✅ Purchase Order approved and automatically sent to vendor! 
       When materials arrive, create a GRN for quality verification.`);
```

### **Backend Changes**

#### **procurement.js** (Line 1300-1336)
```javascript
// Auto-send to vendor after approval
await po.update({
  status: 'sent',  // Changed from 'approved' to 'sent'
  approval_status: 'approved',
  approved_by: req.user.id,
  approved_date: new Date(),
  approval_notes: notes || '',
  sent_to_vendor_at: new Date()
}, { transaction });

// Notifications sent to both procurement and inventory teams
```

---

## 📱 **User Interface Changes**

### **Before Automation:**
1. Create PO → "Save Draft" button
2. Manual → "Send for Approval" button
3. Admin → "Approve" button
4. Manual → "Send to Vendor" button
5. Create GRN → Add to Inventory

### **After Automation:**
1. Create PO → "Create PO & Send for Approval" button ✅
2. Admin → "Approve Purchase Order" button (auto-sends to vendor) ✅
3. Create GRN → Add to Inventory

**Result:** 2 fewer manual steps!

---

## 🚀 **How to Use the New Workflow**

### **For Procurement Team:**

1. **Navigate to:** `/procurement/purchase-orders/create`
2. **Fill in:**
   - Vendor details
   - Project name & customer
   - Items with quantities and rates
   - Payment terms
3. **Click:** "Create PO & Send for Approval"
4. **Result:** PO automatically sent to admin panel with status `pending_approval`

### **For Admin/Managers:**

1. **Navigate to:** `/procurement/pending-approvals`
2. **See:** List of POs awaiting approval with stats
3. **Click:** "Approve Order" button on any PO
4. **Review:** PO details, items, vendor info
5. **Add:** Optional approval notes
6. **Click:** "Approve Purchase Order"
7. **Result:** PO automatically sent to vendor with status `sent`
8. **Notification:** Procurement & inventory teams notified

### **For Store/Inventory Team:**

1. **Wait:** For vendor to deliver materials
2. **Navigate to:** `/inventory/grn/create?po_id=123`
3. **Create GRN:** Enter received quantities and challan details
4. **Verify:** Quality, quantity, weight checks
5. **Add to Inventory:** Select warehouse location
6. **Result:** Materials available in inventory with full traceability

---

## 📧 **Notifications**

### **When PO is Created:**
- **To:** Admin panel
- **Message:** New PO awaiting approval
- **Action:** Review and approve

### **When PO is Approved:**
- **To:** Procurement team
- **Message:** PO approved and sent to vendor
- **Action:** Contact vendor if needed

- **To:** Inventory team
- **Message:** Prepare for material receipt
- **Action:** Be ready to create GRN when materials arrive

### **When GRN is Created:**
- **To:** QC/Inventory team
- **Message:** GRN pending verification
- **Action:** Verify quality and quantity

### **When Materials Added to Inventory:**
- **To:** Procurement & inventory teams
- **Message:** Materials successfully added
- **Action:** PO workflow complete

---

## 🔒 **Security & Permissions**

### **Department Access:**

| Action | Required Department | Permission Level |
|--------|-------------------|------------------|
| Create PO | Procurement, Admin | Standard |
| Approve PO | Procurement, Admin | Manager/Admin |
| Create GRN | Inventory, Admin | Standard |
| Verify GRN | Inventory, QC, Admin | Standard |
| Add to Inventory | Inventory, Admin | Standard |

---

## 📝 **API Endpoints**

### **Create Purchase Order**
```http
POST /api/procurement/pos
Body: { vendor_id, items, status: 'pending_approval', ... }
Response: { purchaseOrder: {...} }
```

### **Approve Purchase Order (Auto-sends to vendor)**
```http
POST /api/procurement/pos/:id/approve
Body: { notes: string }
Response: {
  message: 'Purchase Order approved and sent to vendor successfully',
  purchase_order: {...},
  next_step: 'await_delivery_then_create_grn',
  workflow_info: '...'
}
```

### **Create GRN**
```http
POST /api/grn/from-po/:poId
Body: { received_date, items_received, ... }
Response: { grn: {...} }
```

### **Verify GRN**
```http
POST /api/grn/:id/verify
Body: { verification_status, discrepancy_details, ... }
Response: { grn: {...} }
```

### **Add to Inventory**
```http
POST /api/grn/:id/add-to-inventory
Body: { location }
Response: { inventory_items: [...], movements: [...] }
```

---

## ✅ **Testing Checklist**

- [ ] Create new PO → Status should be `pending_approval`
- [ ] Check admin panel → PO should appear in pending approvals
- [ ] Approve PO → Status should change to `sent`
- [ ] Check notifications → Procurement & inventory teams notified
- [ ] Create GRN from approved PO
- [ ] Verify GRN (with and without discrepancies)
- [ ] Add verified GRN to inventory
- [ ] Check PO status → Should be `completed`
- [ ] Verify inventory entries created with barcodes
- [ ] Check audit trail → All timestamps recorded

---

## 🎉 **Summary**

The automated workflow reduces manual steps, enforces quality control, and ensures full traceability from purchase order to inventory. Every material goes through:

1. ✅ Automatic admin approval
2. ✅ Automatic vendor notification
3. ✅ Mandatory GRN creation
4. ✅ Mandatory quality verification
5. ✅ Controlled inventory addition

**Result:** Better compliance, fewer errors, faster processing! 🚀

---

*Last Updated: January 2025*  
*Maintained by: Zencoder Assistant*