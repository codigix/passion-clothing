# Shipment Status Mapping - Quick Reference & Action Guide

## 🚀 What Changed

**Three critical fixes implemented:**

1. **Generic Order Endpoint Now Supports Shipment** 
   - Previously: Only checked SalesOrder, PurchaseOrder, ProductionOrder
   - Now: Also checks Shipment model
   - Impact: Can now update shipment status without 500 error

2. **Incoming Orders Endpoint Fixed**
   - Previously: Filtered by invalid `status='ready_for_shipment'` (doesn't exist in ProductionOrder)
   - Now: Intelligently maps to valid statuses: `['completed', 'quality_check']`
   - Impact: ShipmentDashboard now shows actual orders ready for shipment

3. **Shipment Tracking Added**
   - Previously: No audit trail when shipment status changed
   - Now: Automatically creates ShipmentTracking entries
   - Impact: Complete visibility into shipment lifecycle

---

## 🔧 How to Use

### Scenario 1: Create Shipment from Dashboard

```
1. Go to Shipment Dashboard
2. Click "Incoming Orders" tab
3. See ProductionOrders with status "completed" or "quality_check"
4. Click "Create Shipment" button on any order
5. Fill shipment details and save
6. Order status is now "preparing"
```

### Scenario 2: Update Shipment Status

```bash
# Mark shipment as shipped
curl -X PUT http://localhost:3000/api/orders/3/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "shipped",
    "department": "shipment",
    "action": "dispatch"
  }'

# Response will include shipment info and tracking
```

### Scenario 3: Production Order Auto-Sync

```bash
# When production completes, send:
curl -X PUT http://localhost:3000/api/orders/2/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "ready_for_shipment",
    "department": "manufacturing"
  }'

# This AUTOMATICALLY:
# ✅ Updates ProductionOrder to "completed"
# ✅ Updates linked SalesOrder to "ready_to_ship"
# ✅ Regenerates QR codes
# ✅ Updates lifecycle history
```

---

## ✅ Status Mapping Reference

### What Status Should I Use?

**For ProductionOrder (Manufacturing):**
- Use: `"completed"` or `"quality_check"` when ready for shipment
- Or send: `"ready_for_shipment"` → automatically maps to `"completed"`

**For Shipment (Shipment Department):**
```
preparing
  ↓
packed
  ↓
ready_to_ship
  ↓
shipped
  ↓
in_transit
  ↓
out_for_delivery
  ↓
delivered
```

**For SalesOrder (Automatic):**
- Auto-syncs with ProductionOrder
- When Production = "completed" → Sales = "ready_to_ship"
- Don't manually update if linked to production

---

## 🧪 Testing Checklist

- [ ] Shipment Dashboard loads without errors
- [ ] Incoming Orders tab shows orders (click refresh if empty)
- [ ] Can click "Create Shipment" on any order
- [ ] Can update shipment status to "shipped"
- [ ] No 500 errors or "Data truncated" messages
- [ ] Shipment tracking shows status history

---

## 🐛 Troubleshooting

### "No incoming orders from manufacturing"
**Cause:** No ProductionOrders with status "completed" or "quality_check"  
**Fix:** Create a production order and complete it first

### "Invalid ENUM value" error
**Cause:** Using invalid status value for order type  
**Fix:** Check valid status values in reference above

### "Order not found"
**Cause:** Using wrong order ID or deleted order  
**Fix:** Verify order ID exists in database

### Shipment update works but tracking not showing
**Cause:** Tracking page not refreshed  
**Fix:** Reload page or refresh tracking timeline

---

## 📋 Files Modified

```
server/routes/orders.js
  ✅ Added Shipment model support
  ✅ Added shipment tracking on status update
  ✅ All existing functionality preserved

server/routes/shipments.js
  ✅ Fixed incoming orders endpoint
  ✅ Smart status mapping
  ✅ Invalid status handling
```

---

## 🎯 Key Endpoints

| Endpoint | Method | Purpose | Status Values |
|----------|--------|---------|----------------|
| `/api/orders/:id/status` | PUT | Update any order status | See mapping above |
| `/api/orders/:id/qr-code` | PUT | Update QR code | N/A |
| `/shipments/orders/incoming` | GET | Get orders ready for shipment | Auto-mapped |
| `/shipments` | GET/POST | Manage shipments | Shipment statuses |
| `/shipments/:id` | PUT | Update shipment details | Shipment statuses |

---

## ✨ Summary

**Before Fix:**
```
❌ Shipment updates failed (500 error)
❌ No incoming orders shown in dashboard
❌ No audit trail for changes
```

**After Fix:**
```
✅ All order types can be updated
✅ Incoming orders display correctly
✅ Complete audit trail maintained
✅ Cross-order synchronization automatic
```

---

## 🔗 More Information

See `SHIPMENT_DASHBOARD_STATUS_FIX.md` for:
- Complete technical implementation details
- Comprehensive testing scenarios
- Error handling information
- Status flow diagrams
- Complete workflow walkthrough

---

## 💡 Pro Tips

1. **Always use proper department** when updating: "shipment", "manufacturing", "sales", etc.
2. **Production ready_for_shipment** automatically syncs with Sales - don't manually update both
3. **Shipment tracking** is automatically created - just update status and audit trail is handled
4. **Batch operations** - can update multiple orders using the same endpoint
5. **Rollback on error** - if update fails, nothing is partially updated (transaction safety)

---

## 🆘 Need Help?

1. Check SHIPMENT_DASHBOARD_STATUS_FIX.md for detailed docs
2. Verify API is running on http://localhost:3000
3. Check browser console for detailed error messages
4. Test with curl/Postman first if web UI is unclear
5. Verify user has proper department permissions

---

**Last Updated:** January 2025  
**Status:** ✅ Production Ready