# GRN Request - Backend Flow Analysis

## 🔧 Technical Deep Dive: What Happens Behind the Scenes

---

## 🔄 Complete Flow from Start to Finish

### Phase 1: Material Received (Procurement Department)

```
📍 ENDPOINT: POST /api/procurement/purchase-orders/:poId/material-received

REQUEST:
{
  "received_quantities": {
    "item_1": 100,
    "item_2": 50
  },
  "received_date": "2025-01-15T10:30:00Z",
  "notes": "Materials received in good condition"
}

BACKEND PROCESS:
├─ 1️⃣ Authenticate user (must be Procurement or Admin)
├─ 2️⃣ Find Purchase Order by ID
├─ 3️⃣ Update PO status to "materials_received"
├─ 4️⃣ Check if GRN request already exists
├─ 5️⃣ CREATE GRN REQUEST (Approval record)
│  └─ entity_type: "grn_creation"
│  └─ entity_id: PO ID
│  └─ status: "pending"
│  └─ assigned_to: Inventory department
├─ 6️⃣ Send notification to Inventory department
└─ 7️⃣ Return success message

RESPONSE:
{
  "message": "Materials marked as received. GRN request created for Inventory department.",
  "po": { ... },
  "grnRequest": {
    "id": 1,
    "entity_type": "grn_creation",
    "status": "pending"
  }
}

DATABASE CHANGE:
✅ PurchaseOrder.status = "materials_received"
✅ Approval created with:
   - entity_type: "grn_creation"
   - status: "pending"
   - entity_id: <PO_ID>
```

---

### Phase 2: Fetch Pending Requests (Inventory Department)

```
📍 ENDPOINT: GET /api/inventory/grn-requests

REQUEST: No body (query params optional)

BACKEND PROCESS:
├─ 1️⃣ Authenticate user (must be Inventory or Admin)
├─ 2️⃣ Query Approval table for all records where:
│  └─ entity_type = "grn_creation"
│  └─ status = "pending"
├─ 3️⃣ Include related PO information
├─ 4️⃣ Format response with all relevant details
└─ 5️⃣ Return list of pending requests

RESPONSE:
{
  "requests": [
    {
      "id": 1,
      "entity_type": "grn_creation",
      "status": "pending",
      "entity_id": 1,
      "po": {
        "id": 1,
        "po_number": "PO-001",
        "vendor": { ... },
        "items": [ ... ]
      }
    }
  ]
}

DISPLAY IN UI:
This data appears in Inventory Dashboard showing pending GRN requests
User can see which POs are waiting for GRN creation
```

---

### Phase 3: Approve GRN Request (Inventory Department)

```
📍 ENDPOINT: POST /api/inventory/grn-requests/:id/approve

REQUEST:
{
  "notes": "All items verified and ready",
  "inspection_notes": "Quality check passed"
}

BACKEND PROCESS:
├─ 1️⃣ Authenticate user (must be Inventory or Admin)
├─ 2️⃣ Find Approval record by ID
├─ 3️⃣ Verify it's a GRN creation request (entity_type = "grn_creation")
├─ 4️⃣ Get associated Purchase Order
├─ 5️⃣ START TRANSACTION (rollback if error)
├─ 6️⃣ UPDATE Approval:
│  └─ status: "approved"
│  └─ approval_date: now
│  └─ reviewer_id: current user
├─ 7️⃣ CREATE ACTUAL GRN (GoodsReceiptNote record):
│  ├─ grn_number: auto-generated
│  ├─ purchase_order_id: from PO
│  ├─ supplier_name: from PO.vendor
│  ├─ received_date: now
│  ├─ status: "pending_verification"
│  └─ items_received: from request
├─ 8️⃣ UPDATE PO status:
│  └─ status: "grn_created"
├─ 9️⃣ SEND NOTIFICATIONS:
│  └─ To Inventory team: "GRN created, ready for verification"
│  └─ To Procurement: "GRN created for PO"
├─ 🔟 COMMIT TRANSACTION
└─ 1️⃣1️⃣ Return success with GRN details

RESPONSE:
{
  "message": "GRN created successfully",
  "grn": {
    "id": 1,
    "grn_number": "GRN-001",
    "purchase_order_id": 1,
    "status": "pending_verification"
  }
}

DATABASE CHANGES:
✅ Approval.status = "approved"
✅ GoodsReceiptNote created with new record
✅ PurchaseOrder.status = "grn_created"
✅ Notifications sent
```

---

### Phase 4: View Actual GRN (Inventory Department)

```
📍 ENDPOINT: GET /api/grn?status=pending_verification

REQUEST: No body (query params: status, po_id, etc.)

BACKEND PROCESS:
├─ 1️⃣ Authenticate user
├─ 2️⃣ Query GoodsReceiptNote table where:
│  └─ status = "pending_verification" (or other filter)
├─ 3️⃣ Include related data:
│  ├─ PurchaseOrder details
│  ├─ Vendor information
│  ├─ Customer information
│  └─ Creator user info
├─ 4️⃣ Format with workflow status indicators
└─ 5️⃣ Return list of GRNs

RESPONSE:
{
  "grns": [
    {
      "id": 1,
      "grn_number": "GRN-001",
      "purchase_order_id": 1,
      "status": "pending_verification",
      "purchaseOrder": {
        "po_number": "PO-001",
        "vendor": { "name": "ABC Supplies" }
      },
      "workflowType": "accurate",
      "items_received": [
        {
          "item_id": 1,
          "product_name": "Fabric",
          "ordered_quantity": 100,
          "received_quantity": 100
        }
      ]
    }
  ]
}

DISPLAY IN UI:
This data appears in /inventory/grn page
User can see all created GRNs in the workflow dashboard
GRNs are now available for verification and further processing
```

---

## 📊 Database State Changes

### Approval Table (GRN Requests)

```
BEFORE:
┌─────────────────────────────────────────────────────┐
│ No record (nothing received yet)                    │
└─────────────────────────────────────────────────────┘

AFTER PHASE 1 (Material Received):
┌──────────────────────────────────────────────────┐
│ id    │ entity_type   │ status   │ entity_id     │
├──────────────────────────────────────────────────┤
│ 1     │ grn_creation  │ pending  │ 1 (PO ID)    │
└──────────────────────────────────────────────────┘

AFTER PHASE 3 (Approved):
┌──────────────────────────────────────────────────┐
│ id    │ entity_type   │ status   │ entity_id     │
├──────────────────────────────────────────────────┤
│ 1     │ grn_creation  │ approved │ 1 (PO ID)    │
└──────────────────────────────────────────────────┘
```

### GoodsReceiptNote Table (Actual GRNs)

```
BEFORE:
┌──────────────────────────────────────────────────┐
│ No record (GRN not created yet)                   │
└──────────────────────────────────────────────────┘

AFTER PHASE 3 (GRN Approved):
┌──────────────────────────────────────────────────┐
│ id    │ grn_number │ po_id │ status               │
├──────────────────────────────────────────────────┤
│ 1     │ GRN-001    │ 1     │ pending_verification│
└──────────────────────────────────────────────────┘
```

### PurchaseOrder Table

```
BEFORE:
┌──────────────────────────────────────────────────┐
│ id │ po_number │ status                           │
├──────────────────────────────────────────────────┤
│ 1  │ PO-001    │ sent (or acknowledged, etc)     │
└──────────────────────────────────────────────────┘

AFTER PHASE 1 (Material Received):
┌──────────────────────────────────────────────────┐
│ id │ po_number │ status                           │
├──────────────────────────────────────────────────┤
│ 1  │ PO-001    │ materials_received              │
└──────────────────────────────────────────────────┘

AFTER PHASE 3 (GRN Approved):
┌──────────────────────────────────────────────────┐
│ id │ po_number │ status                           │
├──────────────────────────────────────────────────┤
│ 1  │ PO-001    │ grn_created                     │
└──────────────────────────────────────────────────┘
```

---

## 🔍 Current System State (Diagnostic Results)

```
✅ PHASE 1 COMPLETE: Material Received
   └─ GRN Request created with ID: 1
   └─ Status: pending

❌ PHASE 3 NOT YET DONE: GRN Not Approved
   └─ No actual GRN record created
   └─ Approval record still in "pending" status

📊 WHAT THIS MEANS:
   Your GRN request exists but hasn't been approved yet.
   You're stuck at Phase 2 (viewing pending requests).
   You need to move to Phase 3 (approving request).
```

---

## 🚀 How to Move Forward

### Option A: Use Inventory Dashboard UI

```
1. Navigate to: /inventory
2. Find pending GRN requests section
3. Click "Approve" button on your request
4. System performs Phase 3 automatically
5. GRN now visible at /inventory/grn
```

**Code Behind This:**
```javascript
// User clicks "Approve" on Inventory Dashboard
// Frontend calls:
POST /api/inventory/grn-requests/1/approve

// Backend:
// 1. Updates Approval record to "approved"
// 2. Creates GoodsReceiptNote record
// 3. Updates PurchaseOrder status
// 4. Sends notifications
// 5. Returns success
```

### Option B: Manual GRN Creation

```
1. Navigate to: /inventory/grn/create
2. Select your PO
3. Enter received quantities
4. Click "Create GRN"
5. GRN now visible at /inventory/grn
```

**Code Behind This:**
```javascript
// User submits GRN creation form
// Frontend calls:
POST /api/grn

// Backend:
// 1. Creates GoodsReceiptNote directly
// 2. Updates PurchaseOrder status
// 3. Returns success
```

---

## 🔗 API Endpoints Reference

| Phase | Endpoint | Method | Purpose |
|-------|----------|--------|---------|
| 1 | `/procurement/purchase-orders/:id/material-received` | POST | Mark materials received, create GRN request |
| 2 | `/inventory/grn-requests` | GET | Fetch pending GRN requests |
| 3a | `/inventory/grn-requests/:id/approve` | POST | Approve request, create actual GRN |
| 3b | `/grn` | POST | Create GRN manually |
| 4 | `/grn` | GET | Fetch actual GRNs |

---

## 🛡️ Error Handling

### What Happens If:

**PO Already Has Pending GRN Request?**
```
Status: 400 Bad Request
Message: "GRN creation request already pending for this Purchase Order"
Action: Cannot create duplicate request. User must approve or reject existing request.
```

**GRN Request Not Found?**
```
Status: 404 Not Found
Message: "GRN request not found"
Action: Request may have been deleted. Create new GRN manually.
```

**User Doesn't Have Permission?**
```
Status: 403 Forbidden
Message: "Access denied. Only Inventory department can perform this action"
Action: Request user with proper department access.
```

---

## 📝 Database Queries

### Find Pending GRN Requests
```sql
SELECT * FROM approvals
WHERE entity_type = 'grn_creation'
AND status = 'pending'
ORDER BY created_at DESC;
```

### Find Actual GRNs
```sql
SELECT * FROM goods_receipt_notes
WHERE status IN ('pending_verification', 'verified', 'added_to_inventory')
ORDER BY created_at DESC;
```

### Find GRN for Specific PO
```sql
SELECT * FROM goods_receipt_notes
WHERE purchase_order_id = 1
ORDER BY created_at DESC;
```

---

## 🎯 Summary

```
Your current state:
├─ ✅ Phase 1 Complete: Materials marked as received
├─ ✅ Phase 2 Complete: GRN request in system (pending)
├─ ❌ Phase 3 Pending: GRN request not yet approved
└─ ❌ Phase 4 Blocked: Actual GRN not visible in /inventory/grn

Next action:
└─ Go to /inventory and approve the pending GRN request
   └─ This will complete Phase 3 and move to Phase 4
   └─ GRN will then appear in /inventory/grn
```
