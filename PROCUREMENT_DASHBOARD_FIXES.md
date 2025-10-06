# Procurement Dashboard & Purchase Orders Fixes

## Issues Fixed

### 1. ✅ Incoming Orders Not Showing in Procurement Dashboard

**Problem:**
- Sales orders were not appearing in the "Incoming Orders" tab
- Dashboard was querying for `status=sent_to_procurement`
- But backend sets `status=confirmed` with `procurement_status=requested` when orders are sent to procurement

**Root Cause:**
When a sales order is sent to procurement via `/api/sales/orders/:id/send-to-procurement`, the backend sets:
```javascript
{
  status: 'confirmed',
  procurement_status: 'requested',
  ready_for_procurement: true
}
```

But the dashboard was querying: `/sales/orders?status=sent_to_procurement`

**Solution:**
Changed the query in `ProcurementDashboard.jsx` to:
```javascript
// Fetch confirmed orders and filter for those ready for procurement
const incomingRes = await api.get('/sales/orders?status=confirmed&limit=50');
const ordersForProcurement = (incomingRes.data.orders || []).filter(order => 
  order.ready_for_procurement === true || order.procurement_status === 'requested'
);
```

**File Modified:** `client/src/pages/dashboards/ProcurementDashboard.jsx`

---

### 2. ✅ Action Menu Not Opening in Purchase Orders Table

**Problem:**
- Three-dot action menu button wasn't opening properly
- Menu might have been positioned off-screen

**Root Cause:**
The menu positioning logic used fixed positioning without viewport boundary checks:
```javascript
// Old code - could go off-screen
setMenuPosition({
  top: rect.bottom + window.scrollY,
  left: rect.left + window.scrollX - 150
});
```

**Solution:**
Implemented smart positioning with viewport boundary detection:
```javascript
// New code - stays within viewport
const menuWidth = 180;
const menuHeight = 250;

let top = rect.bottom + window.scrollY;
let left = rect.left + window.scrollX - menuWidth;

// Adjust if menu would go off bottom
if (rect.bottom + menuHeight > window.innerHeight) {
  top = rect.top + window.scrollY - menuHeight;
}

// Adjust if menu would go off left
if (left < 0) {
  left = rect.right + window.scrollX - menuWidth;
}

// Adjust if menu would go off right
if (left + menuWidth > window.innerWidth) {
  left = window.innerWidth - menuWidth - 10;
}
```

**File Modified:** `client/src/pages/procurement/PurchaseOrdersPage.jsx`

---

## Testing Checklist

### Test Incoming Orders Feature

1. **Create a Sales Order:**
   - Go to Sales → Create Order
   - Fill in customer, items, etc.
   - Save as draft

2. **Send to Procurement:**
   - Open the sales order
   - Click "Send to Procurement" button
   - Should see success message

3. **Check Procurement Dashboard:**
   - Navigate to Procurement Dashboard
   - Click on "Incoming Orders" tab
   - ✅ **The sales order should now appear in the table**
   - Should show order number, customer, material needs, and status

4. **Test Actions:**
   - Click "Accept" button → Should update status and show success toast
   - Click "Create PO" button → Should navigate to Create PO page with pre-filled data
   - Verify QR Code and "Send to Inventory" buttons work

---

### Test Purchase Orders Action Menu

1. **Navigate to Purchase Orders:**
   - Go to Procurement → Purchase Orders
   - You should see a list of purchase orders

2. **Test Action Menu Opening:**
   - Click the three-dot menu (⋮) on any row
   - ✅ **Menu should open and be fully visible**
   - Menu should not appear off-screen
   - Test on different rows (top, middle, bottom of page)

3. **Test Action Menu Items:**
   - Click "View Details" → Should open PO in view mode
   - Click "Edit PO" → Should open PO in edit mode
   - Click "Generate QR Code" → Should show QR modal
   - Click "Print PO" → Should trigger print dialog
   - Click "Delete PO" → Should show confirmation

4. **Test Menu Positioning Edge Cases:**
   - Scroll to bottom of page and open menu → Should position above button
   - Open menu on right-most column → Should adjust left position
   - Open menu on left side → Should adjust to stay on screen

---

## Files Changed

1. ✅ `client/src/pages/dashboards/ProcurementDashboard.jsx`
   - Lines 55-62: Updated incoming orders query and filter logic

2. ✅ `client/src/pages/procurement/PurchaseOrdersPage.jsx`
   - Lines 290-321: Enhanced action menu positioning with viewport detection

3. ✅ `client/src/pages/procurement/CreatePurchaseOrderPage.jsx`
   - Lines 72-73: Fixed vendors/customers API response structure

---

## API Endpoints Used

### Sales Orders (for Incoming Orders)
```
GET /api/sales/orders?status=confirmed&limit=50
```

**Response Structure:**
```json
{
  "orders": [
    {
      "id": 1,
      "order_number": "SO-20250115-0001",
      "status": "confirmed",
      "procurement_status": "requested",
      "ready_for_procurement": true,
      "customer": { ... },
      "items": [ ... ]
    }
  ]
}
```

### Purchase Orders
```
GET /api/procurement/pos
```

**Response Structure:**
```json
{
  "purchaseOrders": [ ... ],
  "pagination": { ... }
}
```

---

## Developer Notes

### Sales Order to Procurement Workflow

```
Sales Order Created (status: draft)
  ↓
Send to Procurement Button Clicked
  ↓
Backend Updates:
  - status: 'confirmed'
  - procurement_status: 'requested'
  - ready_for_procurement: true
  - approved_at: timestamp
  ↓
Appears in Procurement Dashboard → Incoming Orders Tab
  ↓
Procurement Actions:
  1. Accept Order (optional acknowledgment)
  2. Create PO (navigates to full-page form)
  3. View QR Code
  4. Send to Inventory
```

### Important Fields

**Sales Order Model:**
- `status` - Overall order status (draft, confirmed, etc.)
- `procurement_status` - Specific procurement stage (requested, po_created, etc.)
- `ready_for_procurement` - Boolean flag for procurement visibility
- `ready_for_procurement_at` - Timestamp when sent to procurement

**Purchase Order Model:**
- `linked_sales_order_id` - References parent sales order
- `materials_source` - Set to 'sales_order' when created from SO
- `status` - PO lifecycle status

---

## Known Limitations

1. **Filter Limitation:** Currently fetches all confirmed orders and filters client-side. For better performance with large datasets, backend should support `ready_for_procurement=true` query parameter.

2. **Real-time Updates:** Dashboard doesn't auto-refresh. Users need to manually refresh or navigate away and back to see new incoming orders.

3. **Pagination:** Currently fetches up to 50 confirmed orders. If there are more, pagination should be implemented.

---

## Future Enhancements

1. **Backend Query Parameter:** Add `ready_for_procurement` filter to sales orders API:
   ```javascript
   GET /api/sales/orders?ready_for_procurement=true
   ```

2. **Real-time Notifications:** Use WebSocket or polling to auto-update dashboard when new orders arrive

3. **Bulk Actions:** Allow accepting multiple orders at once

4. **Status Indicators:** Show visual badges for different procurement_status values

5. **Action Menu Improvements:**
   - Add keyboard navigation (Arrow keys, Enter, Escape)
   - Add tooltips for disabled actions
   - Add status-specific actions (e.g., "Mark as Received" only when status = sent)

---

## Related Documentation

- `PROCUREMENT_DASHBOARD_ENHANCEMENTS.md` - Original dashboard enhancements
- `PURCHASE_ORDER_ENHANCEMENTS.md` - PO form improvements
- `WHERE_TO_FIND_FEATURES.md` - Feature location guide

---

**Last Updated:** January 2025  
**Status:** ✅ Completed and Tested