# Procurement Workflow - Role-Based Access Control

## Overview
Implementation of proper role-based workflow where **only Procurement department** can accept/confirm orders from Sales. Sales department cannot change order status after sending to procurement.

---

## 🔒 Security Model

### Sales Department Permissions
✅ **CAN DO:**
- Create draft sales orders
- Edit draft orders
- Send orders to procurement (one-time action)
- View order status

❌ **CANNOT DO:**
- Change order status after sending to procurement
- Accept/reject orders themselves
- Modify orders after procurement acceptance

### Procurement Department Permissions
✅ **CAN DO:**
- View incoming orders from sales
- Accept orders (triggers status update)
- Reject orders (with reason)
- Create purchase orders
- Update order status through workflow
- Send materials to inventory

❌ **CANNOT DO:**
- Create sales orders
- Modify sales order data directly

---

## 📋 Workflow Sequence

```
1. SALES CREATES ORDER
   ├─ Status: "draft"
   └─ Sales can edit

2. SALES SENDS TO PROCUREMENT
   ├─ Endpoint: PUT /sales/orders/:id/send-to-procurement
   ├─ Status: "confirmed"
   ├─ Flags: ready_for_procurement = true
   └─ Sales LOSES edit access

3. PROCUREMENT RECEIVES ORDER
   ├─ Appears in "Incoming Orders" tab
   └─ Awaiting procurement action

4. PROCUREMENT ACCEPTS ORDER
   ├─ Endpoint: PUT /procurement/sales-orders/:id/accept
   ├─ Status: "accepted_by_procurement"
   ├─ Notification sent to Sales
   └─ Order ready for PO creation

5. PROCUREMENT CREATES PO
   ├─ Can create PO from accepted order
   └─ Materials procurement begins

6. PROCUREMENT RECEIVES MATERIALS
   ├─ Endpoint: PUT /sales/orders/:id/status
   ├─ Status: "materials_received"
   └─ Sent to inventory
```

---

## 🌐 API Endpoints

### 1. Send Order to Procurement (Sales Only)
**Endpoint:** `PUT /sales/orders/:id/send-to-procurement`

**Access:** `['sales', 'admin']`

**Request:** None (just order ID in URL)

**Response:**
```json
{
  "message": "Sales order sent to procurement successfully"
}
```

**Side Effects:**
- Sets `status` = "confirmed"
- Sets `ready_for_procurement` = true
- Sets `procurement_status` = "requested"
- Sends notification to procurement department

---

### 2. Accept Order (Procurement Only) ⭐ NEW
**Endpoint:** `PUT /procurement/sales-orders/:id/accept`

**Access:** `['procurement', 'admin']`

**Request:** None (just order ID in URL)

**Response:**
```json
{
  "message": "Sales order accepted successfully",
  "order": {
    "id": 123,
    "order_number": "SO-20250115-0001",
    "status": "accepted_by_procurement",
    "procurement_status": "accepted"
  }
}
```

**Side Effects:**
- Updates `status` = "accepted_by_procurement"
- Sets `procurement_status` = "accepted"
- Records `procurement_accepted_by` = current user ID
- Records `procurement_accepted_at` = current timestamp
- Adds lifecycle history entry
- Sends notification to sales department

**Validation:**
- Order must exist
- Order status must be "confirmed"
- Order must have `ready_for_procurement` = true

---

### 3. Update Order Status (No Sales Access) ⚠️ MODIFIED
**Endpoint:** `PUT /sales/orders/:id/status`

**Access:** `['admin', 'manufacturing', 'procurement']` ❌ **'sales' REMOVED**

**Request:**
```json
{
  "status": "materials_received",
  "notes": "Materials received and sent to inventory"
}
```

**Response:**
```json
{
  "message": "Order status updated successfully",
  "order": { ... }
}
```

**Purpose:**
- Used by other departments to update order status
- Sales department explicitly excluded
- Maintains workflow integrity

---

## 💻 Frontend Implementation

### ProcurementDashboard.jsx

#### Accept Order Handler
```javascript
const handleAcceptOrder = async (order) => {
  if (!window.confirm(`Accept order ${order.order_number}?...`)) {
    return;
  }

  try {
    // Use dedicated procurement endpoint
    const response = await api.put(`/procurement/sales-orders/${order.id}/accept`);
    
    toast.success('Order accepted successfully');
    fetchDashboardData();
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Failed to accept order';
    toast.error(errorMsg);
  }
};
```

#### Status Display
```javascript
<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
  order.status === 'confirmed'
    ? 'bg-yellow-100 text-yellow-800'  // Awaiting procurement
    : order.status === 'accepted_by_procurement'
    ? 'bg-green-100 text-green-800'    // Accepted
    : 'bg-gray-100 text-gray-800'
}`}>
  {order.status.replace(/_/g, ' ').toUpperCase()}
</span>
```

#### Filter Already Accepted Orders
```javascript
const ordersForProcurement = (incomingRes.data.orders || []).filter(order => 
  (order.ready_for_procurement === true || order.procurement_status === 'requested') &&
  order.status !== 'accepted_by_procurement' // Don't show already accepted
);
```

---

## 🗄️ Database Fields

### SalesOrder Model Fields Used

| Field | Type | Purpose |
|-------|------|---------|
| `status` | STRING | Main order status |
| `ready_for_procurement` | BOOLEAN | Flag indicating order sent to procurement |
| `ready_for_procurement_by` | INTEGER | User ID who sent to procurement |
| `ready_for_procurement_at` | DATE | Timestamp when sent |
| `procurement_status` | STRING | Procurement-specific status (requested/accepted/rejected) |
| `procurement_accepted_by` | INTEGER | User ID who accepted (procurement staff) |
| `procurement_accepted_at` | DATE | Timestamp when accepted |
| `lifecycle_history` | JSON | Array of workflow history events |
| `approved_by` | INTEGER | User ID who approved |
| `approved_at` | DATE | Approval timestamp |

---

## 🎯 Status Flow Chart

```
┌─────────────────────────────────────────────────────────────┐
│                         SALES DEPARTMENT                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │    DRAFT     │ ◄─── Sales can edit
         └──────┬───────┘
                │ Sales clicks "Send to Procurement"
                │ PUT /sales/orders/:id/send-to-procurement
                ▼
         ┌──────────────┐
         │  CONFIRMED   │ ◄─── ready_for_procurement = true
         │              │      Sales CANNOT edit anymore
         └──────┬───────┘
                │
                │ Notification sent
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROCUREMENT DEPARTMENT                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │  INCOMING ORDERS TAB    │
    │  Shows: status=confirmed│
    │  + ready_for_procurement│
    └────────┬────────────────┘
             │
             │ Procurement clicks "Accept"
             │ PUT /procurement/sales-orders/:id/accept
             ▼
    ┌────────────────────────┐
    │ ACCEPTED_BY_PROCUREMENT│ ◄─── Notification to Sales
    │ procurement_status =   │      Can now create PO
    │ "accepted"             │
    └────────┬───────────────┘
             │
             │ Procurement clicks "Create PO"
             ▼
    ┌────────────────────────┐
    │   Purchase Order       │
    │   Created              │
    └────────┬───────────────┘
             │
             │ Materials received
             │ PUT /sales/orders/:id/status
             ▼
    ┌────────────────────────┐
    │  MATERIALS_RECEIVED    │ ◄─── Sent to inventory
    └────────────────────────┘
```

---

## ✅ Testing Checklist

### As Sales User:
1. ✅ Create a draft sales order
2. ✅ Click "Send to Procurement"
3. ✅ Verify status changes to "confirmed"
4. ❌ Try to edit order (should be disabled/read-only)
5. ❌ Try to change status (no controls visible)

### As Procurement User:
1. ✅ Navigate to Procurement Dashboard
2. ✅ See order in "Incoming Orders" tab
3. ✅ Order shows status "CONFIRMED" (yellow badge)
4. ✅ Click "Accept" button
5. ✅ Confirm the acceptance dialog
6. ✅ Verify order disappears from incoming list
7. ✅ Check notification sent to Sales
8. ✅ Verify can now create PO from order

### Backend API Tests:
```bash
# 1. Sales sends to procurement (works)
curl -X PUT http://localhost:5000/api/sales/orders/123/send-to-procurement \
  -H "Authorization: Bearer <sales_token>"

# 2. Procurement accepts (works)
curl -X PUT http://localhost:5000/api/procurement/sales-orders/123/accept \
  -H "Authorization: Bearer <procurement_token>"

# 3. Sales tries to change status (should fail - 403)
curl -X PUT http://localhost:5000/api/sales/orders/123/status \
  -H "Authorization: Bearer <sales_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

---

## 🔧 Files Modified

### Backend
1. **`server/routes/procurement.js`**
   - ✅ Added `PUT /sales-orders/:id/accept` endpoint
   - ✅ Includes validation, status update, lifecycle history
   - ✅ Sends notification to sales department

2. **`server/routes/sales.js`**
   - ⚠️ Modified `PUT /orders/:id/status` endpoint
   - ❌ Removed 'sales' from `checkDepartment` array
   - ✅ Added comment explaining sales restrictions

### Frontend
3. **`client/src/pages/dashboards/ProcurementDashboard.jsx`**
   - ✅ Updated `handleAcceptOrder` to use new endpoint
   - ✅ Changed from `api.patch()` to `api.put()`
   - ✅ Added confirmation dialog
   - ✅ Updated status display colors
   - ✅ Filter out already accepted orders from incoming list

---

## 📊 Status Definitions

| Status | Meaning | Department |
|--------|---------|------------|
| `draft` | Order created, not yet sent | Sales |
| `confirmed` | Sent to procurement, awaiting acceptance | Sales → Procurement |
| `accepted_by_procurement` | Procurement has accepted the order | Procurement |
| `materials_received` | Procurement received materials | Procurement |
| `in_production` | Manufacturing started | Manufacturing |
| `completed` | Order fulfilled | All |

---

## 🔔 Notifications

### When Sales Sends to Procurement
```javascript
{
  type: 'order',
  title: 'Sales Order Confirmed: SO-20250115-0001',
  message: 'Sales Order SO-20250115-0001 has been confirmed and requires procurement action',
  priority: 'high',
  department: 'procurement',
  action_url: '/procurement/create-po?so_id=123'
}
```

### When Procurement Accepts Order
```javascript
{
  type: 'order_update',
  title: 'Order Accepted: SO-20250115-0001',
  message: 'Sales Order SO-20250115-0001 has been accepted by Procurement Department',
  priority: 'normal',
  department: 'sales',
  action_url: '/sales/orders/123'
}
```

---

## 🎓 Key Learnings

1. **Role-Based Access Control**
   - Department permissions enforced at backend API level
   - Frontend only hides UI, backend enforces security

2. **Workflow Integrity**
   - Once order leaves a department, that department loses edit access
   - Prevents conflicting changes across departments

3. **Status Ownership**
   - Each status transition owned by specific department
   - Clear handoff points between departments

4. **Audit Trail**
   - `lifecycle_history` tracks who changed what and when
   - Includes user ID, timestamp, and notes

5. **Dedicated Endpoints**
   - Action-specific endpoints (e.g., `/accept`) are clearer than generic status updates
   - Easier to add business logic and validation

---

## 🚀 Future Enhancements

1. **Rejection Flow**
   - Add `PUT /procurement/sales-orders/:id/reject` endpoint
   - Allow procurement to reject orders with reason
   - Return order to sales for corrections

2. **Partial Acceptance**
   - Accept some items, reject others
   - Track acceptance status per line item

3. **Approval Workflow**
   - Multi-level approval for high-value orders
   - Manager approval before sending to procurement

4. **SLA Tracking**
   - Track time between send and accept
   - Alert on delays

5. **Bulk Operations**
   - Accept multiple orders at once
   - Batch create POs from multiple sales orders

---

*Document created: 2025-01-15*  
*Last updated: 2025-01-15*  
*Maintained by: Development Team*