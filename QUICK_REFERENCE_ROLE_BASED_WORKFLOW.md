# Quick Reference: Role-Based Procurement Workflow

## 🎯 What Changed

### Before ❌
- Sales could change order status anytime
- No dedicated procurement acceptance process
- Both departments had equal access to status updates

### After ✅
- **Sales**: Create orders → Send to procurement (one-way)
- **Procurement**: Accept orders → Update status → Create POs
- Clear separation of responsibilities

---

## 🔑 Key Points

1. **Sales sends order ONCE** - cannot change status after that
2. **Only Procurement can accept** orders sent by Sales
3. **Automatic notifications** when order status changes
4. **Full audit trail** in lifecycle_history

---

## 📡 New API Endpoint

```
PUT /procurement/sales-orders/:id/accept
```

**Who can call:** Procurement department + Admin only

**What it does:**
- Changes status to "accepted_by_procurement"
- Notifies Sales department
- Records who accepted and when
- Adds to lifecycle history

---

## 🔧 Modified API Endpoint

```
PUT /sales/orders/:id/status
```

**Who can call:** ~~Sales,~~ Procurement, Manufacturing, Admin

**Change:** Sales department **removed** from access list

---

## 🧪 Quick Test

### Test Sales Cannot Change Status:
```javascript
// As Sales user, try to change status (should fail with 403)
await api.put('/sales/orders/123/status', {
  status: 'completed'
});
// Expected: Error 403 Forbidden
```

### Test Procurement Can Accept:
```javascript
// As Procurement user, accept order
await api.put('/procurement/sales-orders/123/accept');
// Expected: Success, order status becomes "accepted_by_procurement"
```

---

## 📊 Status Flow

```
SALES            →  PROCUREMENT       →  NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
draft            →  [Send to Proc]  →  confirmed
                 →  [Accept]        →  accepted_by_procurement
                 →  [Create PO]     →  materials_received
```

---

## 🗂️ Files Changed

### Backend
- `server/routes/procurement.js` - Added accept endpoint
- `server/routes/sales.js` - Removed sales from status update

### Frontend
- `client/src/pages/dashboards/ProcurementDashboard.jsx` - Updated accept handler

---

## 📚 Full Documentation

See `PROCUREMENT_WORKFLOW_ROLE_BASED_ACCESS.md` for complete details.

---

*Created: 2025-01-15*