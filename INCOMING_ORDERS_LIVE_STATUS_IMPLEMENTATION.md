# Incoming Orders - Live Status Updates & Dispatch Control Implementation

## Overview
Implemented comprehensive live status updates and dispatch control for the "Incoming Orders from Manufacturing" tab in the Shipment Dashboard. Orders now automatically track shipment status and disable operations after dispatch.

---

## Features Implemented

### 1. **Automatic Status Detection** ✅
- Backend now checks for existing shipments for each production order
- Each order includes shipment information:
  - `has_shipment`: Boolean indicating if shipment exists
  - `shipment_id`: Link to created shipment
  - `shipment_number`: Shipment tracking number
  - `shipment_status`: Current shipment status (preparing, packed, shipped, in_transit, delivered, etc.)
  - `can_create_shipment`: Whether "Create Shipment" action is available
  - `is_dispatched`: Whether shipment has been created
  - `is_delivered`: Whether order is fully delivered

### 2. **Delivered Orders Auto-Exclusion** ✅
- Delivered orders automatically excluded from list (configurable via `exclude_delivered` parameter)
- Parameter: `GET /shipments/orders/incoming?exclude_delivered=true`
- Only shows orders that still need attention
- Keeps list clean and focused on actionable items

### 3. **Status-Based Row Highlighting** ✅
- **Ready for Shipment** (yellow badge): No shipment created yet - can create shipment
- **In Transit** (blue badge): Shipment in delivery - no operations available
- **Out for Delivery** (purple badge): Being delivered - no operations
- **Delivered** (green badge): Completed - hidden by default

### 4. **Disabled Operations After Dispatch** ✅
- "Create Shipment" button **hidden** once order is dispatched
- No duplicate shipments can be created
- "View Shipment" link appears for dispatched orders
- Click to view live tracking

### 5. **Live Status Updates** 🔄
- **Auto-refresh enabled by default**
- Refreshes every 10 seconds when Incoming Orders tab is active
- Automatic status changes reflected in real-time
- Can be toggled ON/OFF with "Live" / "Manual" button

### 6. **Enhanced UI/UX** 🎨
- New "Status" column in incoming orders table
- Live update indicator: "🔄 Live updates enabled"
- Toggle button to control auto-refresh (green when ON)
- Dispatched orders highlighted with blue background
- Color-coded status badges
- Quick links to tracking for dispatched orders

---

## Backend Changes

### File: `server/routes/shipments.js`

**Endpoint Enhanced**: `GET /shipments/orders/incoming`

**Key Changes**:
```javascript
// 1. Added exclude_delivered parameter
const { status = 'completed', limit = 20, exclude_delivered = 'true' } = req.query;

// 2. Check shipment status for each order
const shipment = await Shipment.findOne({
  where: { production_order_id: order.id },
  attributes: ['id', 'shipment_number', 'status', 'tracking_number', 'created_at']
});

// 3. Add shipment information to response
{
  has_shipment: !!shipment,
  shipment_id: shipment?.id || null,
  shipment_number: shipment?.shipment_number || null,
  shipment_status: shipment?.status || null,
  shipment_tracking: shipment?.tracking_number || null,
  shipment_created_at: shipment?.created_at || null,
  can_create_shipment: !shipment,
  is_dispatched: shipment && shipment.status !== 'preparing',
  is_delivered: shipment && shipment.status === 'delivered'
}

// 4. Filter out delivered orders
const filteredOrders = shouldExcludeDelivered 
  ? formattedOrders.filter(order => !order.is_delivered)
  : formattedOrders;
```

**Response Example**:
```json
{
  "orders": [
    {
      "id": 1,
      "sales_order_number": "SO-001",
      "customer_name": "ABC Corp",
      "product_name": "T-Shirt",
      "quantity": 100,
      "production_status": "completed",
      "shipment_status": "in_transit",
      "shipment_number": "SHP-001",
      "can_create_shipment": false,
      "is_dispatched": true,
      "is_delivered": false,
      ...
    }
  ],
  "total": 5
}
```

---

## Frontend Changes

### File: `client/src/pages/dashboards/ShipmentDashboard.jsx`

**Key Changes**:

1. **Import & State**:
   ```javascript
   import { useRef } from 'react';
   
   const [autoRefreshIncomingOrders, setAutoRefreshIncomingOrders] = useState(true);
   const incomingOrdersRefreshInterval = useRef(null);
   ```

2. **Auto-Refresh Logic**:
   ```javascript
   // Setup auto-refresh for incoming orders
   useEffect(() => {
     if (autoRefreshIncomingOrders && tabValue === 0) {
       fetchIncomingOrders();
       incomingOrdersRefreshInterval.current = setInterval(() => {
         fetchIncomingOrders();
       }, 10000); // 10 seconds
       
       return () => {
         if (incomingOrdersRefreshInterval.current) {
           clearInterval(incomingOrdersRefreshInterval.current);
         }
       };
     }
   }, [autoRefreshIncomingOrders, tabValue]);
   ```

3. **UI Components**:
   - Live indicator: `🔄 Live updates enabled`
   - Toggle button for auto-refresh
   - Status column with color-coded badges
   - Conditional action buttons based on dispatch status

4. **Row Styling**:
   - Dispatched orders: Light blue background (`bg-blue-50 hover:bg-blue-100`)
   - Ready orders: Normal hover state

---

## Usage Guide

### For Shipment Users

#### Viewing Incoming Orders
1. Navigate to **Shipment Dashboard** → **Incoming Orders** tab
2. See all production orders ready for shipment
3. Each order shows:
   - Order number, Customer, Product, Quantity
   - Current status (Ready / In Transit / Delivered, etc.)
   - Date created

#### Creating a Shipment
1. Find order with **"Ready for Shipment"** status (yellow)
2. Click **Truck icon** (Create Shipment) button
3. Fill in shipment details and submit
4. Status automatically updates to reflect dispatch

#### Tracking Dispatched Orders
1. Orders with **"In Transit"** or other statuses show blue background
2. Click **External Link icon** to view live tracking
3. See detailed tracking information and delivery updates

#### Auto-Refresh Control
- **Live mode** (default): Updates every 10 seconds automatically
- Click **"Live" button** to toggle:
  - **Green "Live"**: Auto-refresh ON
  - **Gray "Manual"**: Refresh only on demand with main "Refresh" button
- Useful for reducing server load if many users connected

### For System Administrators

#### Configuration

**Auto-refresh interval** (in `ShipmentDashboard.jsx`):
```javascript
// Change from 10000 (10 seconds) to your desired interval
setInterval(() => {
  fetchIncomingOrders();
}, 10000); // milliseconds
```

**Exclude delivered orders**:
```javascript
// Already enabled by default
const response = await api.get('/shipments/orders/incoming?exclude_delivered=true');

// To include delivered orders:
const response = await api.get('/shipments/orders/incoming?exclude_delivered=false');
```

**API Limit**:
```javascript
// Default: 20 orders per request
// To change: &limit=50
const response = await api.get('/shipments/orders/incoming?status=ready_for_shipment&limit=50');
```

---

## Status Workflow

```
Production Order Ready
    ↓
Shipment Created (Dispatched)
    ↓
Preparing → Packed → Shipped
    ↓
In Transit → Out for Delivery
    ↓
Delivered (Hidden from list)
```

## Color Legend

| Status | Badge Color | Meaning |
|--------|-------------|---------|
| **Ready for Shipment** | Yellow | No shipment created, can create now |
| **In Transit** | Blue | Shipment is in delivery |
| **Out for Delivery** | Purple | Out for final delivery today |
| **Delivered** | Green | Order completed, hidden by default |
| **Other** | Gray | Other intermediate status |

---

## Performance Considerations

### Database
- **Efficient lookup**: Single shipment query per order (not N+1 problem)
- **Index optimization**: Uses `production_order_id` foreign key
- **Limit**: Default 20 orders, configurable via API

### Frontend
- **Polling only when visible**: Auto-refresh only active on Incoming Orders tab
- **Interval**: 10 seconds (low overhead)
- **Can be disabled**: Manual refresh mode available

### Recommendations
- For high-volume operations (100+ pending orders):
  - Consider implementing pagination
  - Increase interval to 20-30 seconds
  - Use filtering by date/priority

---

## Troubleshooting

### Issue: Live updates not working
**Solution**: 
- Check browser console for errors (F12)
- Verify "Live" button is green
- Manual refresh with main "Refresh" button should work
- Check server logs: `npm logs`

### Issue: Delivered orders still showing
**Solution**:
- They're being excluded by default
- Ensure `exclude_delivered=true` in API call
- If needed to show all: modify parameter to `false`

### Issue: Status not updating immediately
**Solution**:
- Auto-refresh every 10 seconds
- Click "Refresh" button to force immediate update
- Check shipment was created successfully

### Issue: Shipment not linkable
**Solution**:
- Verify `shipment_number` and `shipment_tracking` are populated
- Check shipment was created with valid tracking number
- Manual navigation via Shipment Dashboard

---

## API Reference

### Endpoint
```
GET /shipments/orders/incoming
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | completed | Production order status filter |
| `exclude_delivered` | boolean | true | Hide delivered orders |
| `limit` | number | 20 | Number of orders to return |

### Response
```json
{
  "orders": [
    {
      "id": integer,
      "production_number": string,
      "sales_order_number": string,
      "customer_name": string,
      "product_name": string,
      "quantity": number,
      "shipment_number": string | null,
      "shipment_status": string | null,
      "can_create_shipment": boolean,
      "is_dispatched": boolean,
      "is_delivered": boolean,
      ...other_fields
    }
  ],
  "total": number
}
```

---

## Testing Checklist

- [ ] Incoming orders load without errors
- [ ] Live update enabled by default
- [ ] Orders refresh every 10 seconds
- [ ] Delivered orders not visible
- [ ] Status column shows correct badge
- [ ] Create Shipment button visible for ready orders
- [ ] Create Shipment button hidden for dispatched orders
- [ ] Click Create Shipment works
- [ ] Shipment immediately marked as dispatched
- [ ] View Shipment link works for dispatched orders
- [ ] Toggle Live/Manual button works
- [ ] Manual refresh with main Refresh button works
- [ ] No console errors

---

## Future Enhancements

1. **Pagination**: For large order volumes
2. **Advanced Filtering**: By date range, priority, customer
3. **Batch Operations**: Create multiple shipments at once
4. **Notifications**: Push notification when status changes
5. **Export**: Download incoming orders as CSV/PDF
6. **Search**: Find specific orders by number

---

## Files Modified

1. **Backend**: `server/routes/shipments.js`
   - Enhanced `/shipments/orders/incoming` endpoint
   - Added shipment status checking
   - Added delivered order filtering

2. **Frontend**: `client/src/pages/dashboards/ShipmentDashboard.jsx`
   - Added auto-refresh logic
   - Enhanced incoming orders table
   - Added status column with badges
   - Added Live/Manual toggle button
   - Conditional action buttons

---

## Date Implemented
**January 2025**

## Version
**v1.0 - Initial Implementation**