# Delivery Tracking Flow Implementation Guide

## Overview
Complete end-to-end delivery tracking system that manages shipment status updates and automatically synchronizes with sales order status.

## Features Implemented

### 1. **Automatic Sales Order Status Update**
When a shipment status is updated, the linked sales order status is automatically updated.

**Status Mapping:**
```
Shipment Status → Sales Order Status
- preparing → order_confirmed
- dispatched → dispatched
- in_transit → in_transit
- out_for_delivery → out_for_delivery
- delivered → delivered
```

### 2. **Delivery Tracking Stages**
Standard delivery flow with 4 stages:
- **Dispatched** - Package sent from warehouse (30% progress)
- **In Transit** - On the way to destination (60% progress)
- **Out for Delivery** - Scheduled for today (85% progress)
- **Delivered** - Successfully delivered (100% progress)

### 3. **Dispatch Management**
Located in `ShipmentDispatchPage` with:
- Single shipment dispatch
- Bulk dispatch multiple shipments
- Print shipping labels
- Track delivery status

### 4. **Delivery Status Tracking Modal**
Interactive modal in Dispatch Page showing:
- Current shipment status
- Visual delivery journey timeline
- Stage progression indicators
- One-click status updates
- Expected delivery date and tracking number

### 5. **Customer-Facing Tracking**
Enhanced `ShipmentTrackingPage` with:
- **Delivery Flow Stages** - Visual progress indicator showing all 4 stages
- **Tracking History** - Complete timeline of status updates
- **Progress Bar** - Percentage-based completion indicator
- **Real-time Updates** - Live tracking information

## Backend Changes

### Updated Endpoint: `POST /api/shipments/:id/status`

**File:** `server/routes/shipments.js` (lines 491-551)

**Features:**
- Updates shipment status
- Automatically updates linked SalesOrder status via status mapping
- Creates ShipmentTracking entry for audit trail
- Returns updated shipment with all associations
- Records location, description, latitude, longitude for tracking

**Request Body:**
```json
{
  "status": "in_transit",
  "location": "In transit to destination",
  "description": "Status updated to in transit",
  "latitude": null,
  "longitude": null
}
```

**Response:**
```json
{
  "message": "Shipment status updated successfully",
  "shipment": {
    "id": 1,
    "status": "in_transit",
    "salesOrder": { /* linked sales order with updated status */ },
    "courierPartner": { /* courier info */ }
  }
}
```

## Frontend Changes

### 1. ShipmentDispatchPage Enhancements

**File:** `client/src/pages/shipment/ShipmentDispatchPage.jsx`

**New Imports:**
```javascript
import { 
  ChevronRight, 
  Navigation, 
  CheckCheck, 
  Zap 
} from 'lucide-react';
import api from '../../utils/api';
```

**Delivery Stages Configuration:**
```javascript
const deliveryStages = [
  { key: 'dispatched', label: 'Dispatched', icon: Send, description: 'Package sent from warehouse' },
  { key: 'in_transit', label: 'In Transit', icon: Truck, description: 'On the way to destination' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation, description: 'Scheduled for today' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Successfully delivered' }
];
```

**New State:**
```javascript
const [showDeliveryTrackingModal, setShowDeliveryTrackingModal] = useState(false);
```

**New Function: `handleUpdateDeliveryStatus`**
```javascript
const handleUpdateDeliveryStatus = async (shipmentId, newStatus) => {
  // Updates shipment status and syncs with sales order
  // Shows success toast and refreshes data
}
```

**New Component: `DeliveryTrackingModal`**
- Displays current shipment status
- Shows delivery journey as interactive timeline
- Allows clicking next stage to update status
- Shows completed stages in green
- Current stage highlighted in blue with pulse animation
- Future stages disabled (grayed out)
- Displays delivery details (expected date, tracking number)

**New Action Button:**
- Added purple "Track Delivery" button (Navigation icon) in Actions column
- Enabled for all non-pending shipments
- Opens DeliveryTrackingModal

### 2. ShipmentTrackingPage Enhancements

**File:** `client/src/pages/shipment/ShipmentTrackingPage.jsx`

**New Component: `DeliveryFlowStages`**
Shows visual progress of delivery stages:
- 4-stage horizontal flow diagram
- Completed stages: Green with checkmark
- Current stage: Blue with pulse animation
- Upcoming stages: Gray and disabled
- Progress bars connecting stages
- Stage labels below each indicator

**Enhanced Progress Percentage:**
```javascript
const getProgressPercentage = (status) => {
  // preparing: 10%
  // pending: 15%
  // dispatched: 30%
  // in_transit: 60%
  // out_for_delivery: 85%
  // delivered: 100%
}
```

**Updated TrackingTimeline:**
- Now shows `description` field instead of `notes`
- Displays description text from ShipmentTracking entries

## User Workflows

### 1. Dispatch a Shipment
```
1. Go to Dispatch Orders page
2. Select shipment(s) with "pending" status
3. Click "Send" button (or "Bulk Dispatch" for multiple)
4. Fill dispatch details in modal
5. Click "Dispatch"
6. ✓ Shipment status → "dispatched"
7. ✓ Sales Order status → "dispatched"
8. ✓ ShipmentTracking entry created
```

### 2. Update Delivery Status
```
1. Go to Dispatch Orders page
2. Find dispatched/in-transit shipment
3. Click "Track Delivery" button (purple Navigation icon)
4. See current status and delivery journey
5. Click next stage to update:
   - dispatched → in_transit → out_for_delivery → delivered
6. ✓ Shipment and Sales Order updated automatically
7. ✓ ShipmentTracking entry with timestamp created
```

### 3. Customer Tracking
```
1. Go to Shipment Tracking page
2. Enter tracking number or shipment number
3. See:
   - Delivery Flow Stages with visual progress
   - Tracking History with all updates and timestamps
   - Progress bar showing completion percentage
   - Shipment details with customer/delivery info
```

## Database Integration

### ShipmentTracking Table
Each status update creates an entry with:
- `shipment_id` - Link to shipment
- `status` - Current status at that moment
- `location` - Pickup/delivery location
- `description` - Update description
- `latitude`, `longitude` - GPS coordinates
- `created_by` - User who made the update
- `timestamp` - When update occurred

### SalesOrder Status Update
When shipment status changes, the linked SalesOrder is automatically updated:
- Status field updated via status mapping
- `updated_at` timestamp refreshed
- No manual intervention required

## Status Flow Diagram

```
Shipment Creation
        ↓
    preparing → dispatch → dispatched ← [Dispatch Button]
        ↓           ↓           ↓
    ShipmentTracking entries created for audit trail
        ↓
    [Track Delivery Modal]
        ↓
    dispatched → in_transit → out_for_delivery → delivered
        ↓
    Sales Order Status Updated
        ↓
    Customer Tracking Page Updated
```

## API Integration Points

### 1. Dispatch Shipment
```
POST /api/shipments/:id/status
{
  status: "dispatched",
  location: "Warehouse",
  description: "Shipment dispatched from warehouse"
}
```

### 2. Update Delivery Stage
```
POST /api/shipments/:id/status
{
  status: "in_transit",
  location: "In transit to destination",
  description: "Status updated to in transit"
}
```

### 3. Get Tracking History
```
GET /api/shipments/:id/tracking
Response: [{status, location, timestamp, description, creator}, ...]
```

### 4. Track by Tracking Number
```
GET /api/shipments/track/:trackingNumber
Response: { shipment, tracking: [...] }
```

## Visual Indicators

### ShipmentDispatchPage
- **Dispatch Button** (Send icon, Blue) - For pending shipments only
- **Track Delivery Button** (Navigation icon, Purple) - For dispatched+ shipments
- **Print Labels Button** (Printer icon, Gray)
- **Status Badge** - Shows current status with color coding

### ShipmentTrackingPage
- **Delivery Flow Stages** - Horizontal progress diagram (new)
- **Progress Bar** - Percentage-based completion
- **Status Icon** - Color-coded by status
- **Tracking Timeline** - Chronological history with icons

## Error Handling

### Frontend
- Toast notifications for success/failure
- Disabled buttons during loading
- Validation of form data
- Graceful handling of API errors

### Backend
- 404 response if shipment not found
- 400 response if invalid status transition
- 500 response with error message for failures
- Transaction support for atomic updates

## Notification Flow

When a shipment status is updated:
1. Shipment status changes
2. SalesOrder status changes (automatic)
3. ShipmentTracking entry created (audit trail)
4. Frontend toast notification shown
5. Data automatically refreshed
6. SalesOrder workflow updated

## Future Enhancements

1. **Real-time GPS Tracking** - Integrate GPS coordinates during transit
2. **Proof of Delivery** - Photo/signature capture on delivery
3. **Delivery Window Alerts** - Notify customer when out for delivery
4. **Exception Handling** - Support failed delivery, returned items, etc.
5. **Courier Integration API** - Auto-sync status from courier API
6. **SMS/Email Notifications** - Send tracking updates to customers
7. **Mobile Tracking** - QR code scanning for delivery updates
8. **Analytics Dashboard** - Delivery performance metrics

## Testing Checklist

- [ ] Dispatch a shipment successfully
- [ ] Verify SalesOrder status updated to "dispatched"
- [ ] Open Track Delivery modal
- [ ] Update to "in_transit" status
- [ ] Verify SalesOrder status updated
- [ ] Check ShipmentTracking entries created
- [ ] Search tracking number on Tracking page
- [ ] Verify Delivery Flow Stages displays correctly
- [ ] Check progress bar updates
- [ ] Verify tracking history shows all updates
- [ ] Test bulk dispatch
- [ ] Test print labels
- [ ] Verify filter by status works

## Troubleshooting

**Issue:** "Failed to update delivery status" error
- Check network connection
- Verify shipment exists
- Check user permissions (shipment department)
- Review console for detailed error

**Issue:** Sales Order status not updating
- Verify shipment has linked sales_order_id
- Check status mapping in backend code
- Review error logs

**Issue:** Tracking history not showing
- Ensure shipment has status updates
- Check ShipmentTracking table for entries
- Verify user has view permissions

## Summary

This implementation provides:
✅ Complete dispatch workflow
✅ Real-time delivery tracking
✅ Automatic sales order synchronization
✅ Full audit trail via ShipmentTracking
✅ Customer-facing tracking interface
✅ Visual progress indicators
✅ Error handling and validation
✅ Responsive design for all devices