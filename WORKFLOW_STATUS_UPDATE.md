# Sales to Procurement Workflow - Status Update

## Overview
The sales to procurement workflow has been updated so that orders remain in **'draft'** status until procurement accepts them.

---

## 🔄 New Workflow

### Step 1: Sales Creates Order
- **Initial Status**: `draft`
- **Action**: Sales user creates a new sales order
- **Result**: Order saved with status = `draft`

### Step 2: Sales Sends to Procurement
- **Action**: Sales user clicks "Send to Procurement" button
- **Status Change**: Remains as `draft` (NOT changed to 'confirmed')
- **Database Updates**:
  - `ready_for_procurement` = `true`
  - `ready_for_procurement_by` = Sales user ID
  - `ready_for_procurement_at` = Current timestamp
- **Notification**: Procurement department receives notification
- **Message**: "New Sales Order Request: SO-XXXXX has been sent to procurement and awaiting acceptance"

### Step 3: Procurement Confirms Order
- **Action**: Procurement user clicks "Accept"/"Confirm" button
- **Status Change**: `draft` → `confirmed`
- **Database Updates**:
  - `status` = `confirmed`
  - `approved_by` = Procurement user ID
  - `approved_at` = Current timestamp
  - `lifecycle_history` += New entry recording the confirmation
- **Notification**: Sales department receives notification
- **Message**: "Order Confirmed: SO-XXXXX has been confirmed by Procurement Department"

---

## 📊 Status Flow Diagram

```
┌─────────────────┐
│  Sales Creates  │
│     Order       │
│  Status: draft  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Sales Sends to         │
│  Procurement            │
│  Status: draft          │
│  Flags:                 │
│  ready_for_procurement  │
│       = true            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Procurement Confirms   │
│  Status: confirmed      │
│  approved_by set        │
│  approved_at set        │
└─────────────────────────┘
```

---

## 🔧 Technical Changes

### Backend Changes

#### 1. Sales Route (`server/routes/sales.js`)
**Endpoint**: `PUT /api/sales/orders/:id/send-to-procurement`

**Before**:
```javascript
await order.update({
  status: 'confirmed',  // ❌ Changed status immediately
  approved_by: req.user.id,
  approved_at: new Date(),
  ready_for_procurement: true,
  ready_for_procurement_by: req.user.id,
  ready_for_procurement_at: new Date()
});
```

**After**:
```javascript
await order.update({
  // Status remains 'draft' ✅
  ready_for_procurement: true,
  ready_for_procurement_by: req.user.id,
  ready_for_procurement_at: new Date()
});
```

#### 2. Procurement Route (`server/routes/procurement.js`)
**Endpoint**: `PUT /api/procurement/sales-orders/:id/accept`

**Before**:
```javascript
// Validation
if (order.status !== 'confirmed' || !order.ready_for_procurement) { // ❌
  return res.status(400).json({ message: '...' });
}

// Update
await order.update({
  status: 'accepted_by_procurement',  // ❌ Wrong status
  approved_by: req.user.id,
  approved_at: new Date(),
  lifecycle_history: lifecycleHistory
});
```

**After**:
```javascript
// Validation
if (order.status !== 'draft' || !order.ready_for_procurement) { // ✅
  return res.status(400).json({ 
    message: '...',
    currentStatus: order.status,
    readyForProcurement: order.ready_for_procurement
  });
}

// Update
await order.update({
  status: 'confirmed',  // ✅ Changes to confirmed when accepted
  approved_by: req.user.id,
  approved_at: new Date(),
  lifecycle_history: lifecycleHistory
});
```

### Frontend Changes

#### 1. Sales Dashboard (`client/src/pages/dashboards/SalesDashboard.jsx`)

**Changes**:
- Updated confirmation dialog to explain status will remain 'draft'
- Updated success message to indicate awaiting procurement confirmation

```javascript
if (window.confirm(`Are you sure you want to send order ${order.order_number} to procurement?\n\nThe order will remain in 'draft' status until procurement confirms it.`)) {
  // ...
  toast.success(response.data.message || 'Order sent to procurement successfully. Awaiting procurement confirmation.');
}
```

#### 2. Procurement Dashboard (`client/src/pages/dashboards/ProcurementDashboard.jsx`)

**Changes**:
- Updated confirmation dialog to say "Confirm order" instead of "Accept order"
- Updated success message to indicate order is now confirmed
- Added error handling for status validation

```javascript
if (!window.confirm(`Confirm order ${order.order_number}?\n\nThis will change the order status to 'Confirmed' and notify the Sales department.`)) {
  return;
}

try {
  const response = await api.put(`/procurement/sales-orders/${order.id}/accept`);
  toast.success('Order confirmed successfully. Sales department has been notified.');
  fetchDashboardData();
} catch (error) {
  const errorMsg = error.response?.data?.message || 'Failed to confirm order';
  const currentStatus = error.response?.data?.currentStatus;
  
  if (currentStatus) {
    toast.error(`${errorMsg}. Current status: ${currentStatus}`);
  } else {
    toast.error(errorMsg);
  }
}
```

---

## 🎯 Key Benefits

1. **Clear Status Flow**: Orders only become 'confirmed' when procurement explicitly accepts them
2. **Better Control**: Procurement has authority over when orders are confirmed
3. **Accurate Status**: 'draft' status accurately reflects orders awaiting procurement action
4. **Audit Trail**: `ready_for_procurement` flag + timestamps track the workflow precisely
5. **Clearer Communication**: Notifications and messages accurately reflect the new workflow

---

## 🧪 Testing Checklist

### Sales Department
- [ ] Create a new sales order
- [ ] Verify status is 'draft'
- [ ] Click "Send to Procurement"
- [ ] Verify status remains 'draft'
- [ ] Verify success message says "Awaiting procurement confirmation"
- [ ] Check that procurement receives notification

### Procurement Department
- [ ] See incoming order in "Incoming Orders" tab
- [ ] Verify order status shows as 'draft'
- [ ] Click "Accept"/"Confirm" button
- [ ] Verify confirmation dialog says "Confirm order"
- [ ] Verify success message says "Order confirmed successfully"
- [ ] Check that order status changes to 'confirmed'
- [ ] Check that sales receives notification

### Error Cases
- [ ] Try to send non-draft order to procurement → Should fail with error
- [ ] Try to accept order that's not in draft status → Should fail with error
- [ ] Try to accept order without ready_for_procurement flag → Should fail with error

---

## 📝 API Reference

### Send to Procurement
```http
PUT /api/sales/orders/:id/send-to-procurement
Authorization: Bearer <token>
```

**Requirements**:
- User must be in 'sales' or 'admin' department
- Order status must be 'draft'

**Success Response** (200):
```json
{
  "message": "Sales order sent to procurement successfully",
  "order": {
    "id": 123,
    "order_number": "SO-20250101-0001",
    "status": "draft",
    "ready_for_procurement": true,
    "approved_by": null,
    "approved_at": null
  }
}
```

**Error Response** (400):
```json
{
  "message": "Only draft orders can be sent to procurement",
  "currentStatus": "confirmed"
}
```

### Accept Order (Procurement)
```http
PUT /api/procurement/sales-orders/:id/accept
Authorization: Bearer <token>
```

**Requirements**:
- User must be in 'procurement' or 'admin' department
- Order status must be 'draft'
- Order must have ready_for_procurement = true

**Success Response** (200):
```json
{
  "message": "Sales order accepted successfully",
  "order": {
    "id": 123,
    "order_number": "SO-20250101-0001",
    "status": "confirmed",
    "ready_for_procurement": true,
    "approved_by": 456,
    "approved_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error Response** (400):
```json
{
  "message": "Order must be in draft status and marked as ready for procurement before acceptance",
  "currentStatus": "confirmed",
  "readyForProcurement": false
}
```

---

## 🔍 Database Fields Reference

### Status Field
- `draft`: Initial status, awaiting procurement confirmation
- `confirmed`: Procurement has confirmed the order
- Other statuses: `bom_generated`, `procurement_created`, `materials_received`, `in_production`, etc.

### Procurement Tracking Fields
- `ready_for_procurement` (boolean): Indicates if order has been sent to procurement
- `ready_for_procurement_by` (integer): User ID who sent to procurement
- `ready_for_procurement_at` (datetime): When order was sent to procurement

### Approval Tracking Fields
- `approved_by` (integer): User ID who confirmed/approved the order (reused across workflow stages)
- `approved_at` (datetime): When order was confirmed/approved (reused across workflow stages)

### Lifecycle History
- `lifecycle_history` (JSON): Array of workflow events with timestamps, actions, users, and notes

---

## 🚀 Deployment Notes

1. **No Database Migration Required**: All fields already exist in the schema
2. **Backward Compatibility**: Existing orders with 'confirmed' status are not affected
3. **Server Restart Required**: Changes take effect after server restart
4. **Frontend Refresh Required**: Users should refresh their browsers to get updated UI

---

## 📚 Related Documentation

- [SALES_TO_PROCUREMENT_API_FIX.md](./SALES_TO_PROCUREMENT_API_FIX.md) - Original API fix documentation
- [repo.md](./.zencoder/rules/repo.md) - Repository overview

---

**Last Updated**: January 2025  
**Author**: Zencoder Assistant  
**Status**: ✅ Implemented and Ready for Testing