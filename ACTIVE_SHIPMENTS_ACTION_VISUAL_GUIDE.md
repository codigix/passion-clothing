# 📊 Active Shipments Action - Visual Guide

## Dashboard Overview

```
╔════════════════════════════════════════════════════════════════╗
║        SHIPPING DASHBOARD - Recent Shipments Section            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  ┌─ Shipment Card #SHP001 ────────────────────────────────┐   ║
║  │                                                         │   ║
║  │  Shipment #SHP001                    ⚠️ [DISPATCHED]   │   ║
║  │  Order: SO-2024-001                                    │   ║
║  │                                                         │   ║
║  │  Courier: FedEx          Tracking: FDX-123456789       │   ║
║  │  Date: Oct 20, 2024      Expected: Oct 25, 2024       │   ║
║  │  Quantity: 100 units                                   │   ║
║  │                                                         │   ║
║  │  [🔵 Track]  [🟢 Dispatch]                              │   ║
║  │                                                         │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                 ║
║  ┌─ Shipment Card #SHP002 ────────────────────────────────┐   ║
║  │                                                         │   ║
║  │  Shipment #SHP002                    📦 [PENDING]      │   ║
║  │  Order: SO-2024-002                                    │   ║
║  │                                                         │   ║
║  │  Courier: Not assigned   Tracking: Not available       │   ║
║  │  Date: Oct 21, 2024      Expected: Oct 26, 2024       │   ║
║  │  Quantity: 50 units                                    │   ║
║  │                                                         │   ║
║  │  [❌ Track]  [🟢 Dispatch]                              │   ║
║  │                                                         │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Action 1: Track Button (Blue) 🔵

### **Flow Chart**

```
┌──────────────────┐
│  Click TRACK     │
│   (Dispatched)   │
└────────┬─────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│         DeliveryTrackingModal Opens                 │
├────────────────────────────────────────────────────┤
│                                                     │
│  📍 Track Delivery                                 │
│     Shipment #SHP001 - Customer ABC                │
│                                                     │
│  Current Status: In Transit                        │
│                                                     │
│  DELIVERY JOURNEY:                                 │
│                                                     │
│  ✓ Dispatched (Completed)                          │
│    └─ Package sent from warehouse                  │
│                                                     │
│  🟦 In Transit (Current - clickable)               │
│    └─ On the way to destination                    │
│                                                     │
│  ⚪ Out for Delivery (Upcoming - disabled)          │
│    └─ Scheduled for today                          │
│                                                     │
│  ⚪ Delivered (Upcoming - disabled)                 │
│    └─ Successfully delivered                       │
│                                                     │
│  Expected Delivery: Oct 25, 2024                   │
│  Tracking Number: FDX-123456789                    │
│                                                     │
│                            [Close]                 │
└────────────────────────────────────────────────────┘
         │
         ↓
    User clicks "Out for Delivery"
         │
         ↓
┌────────────────────────────────────────┐
│  Backend Updates:                       │
│  • Shipment status → out_for_delivery   │
│  • SalesOrder status → out_for_delivery │
│  • ShipmentTracking entry created       │
│  • Response: Success toast              │
│  • Data: Auto-refreshed                 │
└────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────┐
│  Frontend Updates:                          │
│  ✓ Modal refreshes                          │
│  ✓ Toast shows success: "Shipment updated" │
│  ✓ Stage buttons update                     │
│  ✓ User can click next stage                │
└────────────────────────────────────────────┘
```

### **Button States**

```
PENDING SHIPMENT:
┌─────────────────┐      ┌─────────────────┐
│ 🔴 Track        │      │ 🟢 Dispatch     │
│ (Disabled)      │      │ (Active)        │
│ ❌ Can't track  │      │ ✅ Can dispatch │
│    pending item │      │    new shipment │
└─────────────────┘      └─────────────────┘

DISPATCHED SHIPMENT:
┌─────────────────┐      ┌─────────────────┐
│ 🔵 Track        │      │ 🟢 Dispatch     │
│ (Active)        │      │ (Active)        │
│ ✅ Open modal   │      │ ✅ Go to page   │
│    to track     │      │    for more     │
└─────────────────┘      └─────────────────┘
```

---

## Action 2: Dispatch Button (Green) 🟢

### **Flow Chart**

```
┌──────────────────┐
│  Click DISPATCH  │
│   (Any status)   │
└────────┬─────────┘
         │
         ↓
┌────────────────────────────────────────┐
│  Navigation Action:                     │
│  navigate('/shipment/dispatch')         │
│  + Toast: "Navigating to dispatch..."  │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────┐
│      ShipmentDispatchPage Loads                │
│                                                │
│  Shows:                                        │
│  • All shipments in table view                 │
│  • Filter by status, courier, date             │
│  • Individual dispatch buttons                 │
│  • Bulk dispatch options                       │
│  • Print label functionality                   │
│  • Tracking modal for each shipment            │
│                                                │
└────────────────────────────────────────────────┘
         │
         ↓
    User manages shipments
         │
         ├─→ Dispatch pending shipment
         ├─→ Update delivery status
         ├─→ Print labels
         └─→ Track delivery
```

---

## Status Flow Diagram

```
┌──────────────┐
│   PENDING    │  ← Initial state (no courier/tracking)
│   📦         │
└──────┬───────┘
       │ Click "Dispatch"
       │ OR
       │ Click "Send" on dispatch page
       ↓
┌──────────────────┐
│  DISPATCHED      │  ← Shipped from warehouse
│  🚚             │
└──────┬───────────┘
       │ Click delivery stage in modal
       │ Choose "In Transit"
       ↓
┌──────────────────┐
│  IN_TRANSIT      │  ← On the way
│  🚛 📍          │
└──────┬───────────┘
       │ Next stage
       ↓
┌──────────────────────────┐
│  OUT_FOR_DELIVERY        │  ← Scheduled for today
│  🏃 📦                   │
└──────┬───────────────────┘
       │ Final stage
       ↓
┌──────────────────┐
│  DELIVERED       │  ← Successfully delivered
│  ✅ 📦           │
└──────────────────┘
```

---

## Component Architecture

```
ShippingDashboardPage
├── State Management
│   ├── showDeliveryTracking (boolean)
│   ├── selectedShipment (object)
│   └── updatingStatus (boolean)
│
├── Handlers
│   ├── handleUpdateDeliveryStatus()
│   │   ├── API Call: PATCH /shipments/:id/status
│   │   ├── Toast Notification
│   │   └── Data Refresh
│   │
│   └── goToDispatch()
│       ├── Navigate to dispatch page
│       └── Show info toast
│
├── Components
│   ├── ShipmentCard
│   │   ├── Track Button (Blue)
│   │   └── Dispatch Button (Green)
│   │
│   └── DeliveryTrackingModal
│       ├── Current Status Display
│       ├── Delivery Stages (4 levels)
│       ├── Interactive Buttons
│       └── Delivery Details
│
└── Rendering
    ├── Recent Shipments Grid
    └── Modal (when showDeliveryTracking = true)
```

---

## Interaction Timeline

```
TIME    USER ACTION              SYSTEM RESPONSE           USER SEES
────    ───────────────────      ──────────────────────    ─────────────
T0      Opens dashboard          Fetches shipments         Recent shipments

T1      Clicks "Track" on        Modal opens              Delivery modal
        shipped shipment         Renders stages           shows 4 stages

T2      Clicks "In Transit"      API updates shipment     Loading state
        stage button             + SalesOrder status      on button

T3      (API response)           Creates ShipmentTracking Success toast
                                 Refreshes data           Modal updates

T4      Sees "Delivered" stage   Stage button now         Can click next
        is highlighted           highlighted              stage

T5      Clicks "Delivered"       Final update              Delivery modal
                                 Complete!                shows delivered

T6      Closes modal             Returns to dashboard     Sees updated
                                                          shipment card
```

---

## Data Flow

```
┌─────────────────────┐
│   User Click Event  │
│  (Track/Dispatch)   │
└────────┬────────────┘
         │
         ↓
┌──────────────────────────────┐
│   Frontend Handler:          │
│   • handleUpdateDeliveryStatus│
│   • goToDispatch             │
└────────┬─────────────────────┘
         │
         ├─→ UPDATE: setShowDeliveryTracking
         ├─→ UPDATE: setSelectedShipment
         ├─→ UPDATE: setUpdatingStatus
         │
         ↓
┌──────────────────────────────┐
│   API Request                │
│   PATCH /shipments/:id/status│
│   { status: "in_transit" }   │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│   Backend Processing:                │
│   1. Update Shipment table           │
│   2. Update SalesOrder table         │
│   3. Create ShipmentTracking entry   │
│   4. Return updated data             │
└────────┬───────────────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│   Frontend Updates:          │
│   • Toast notification       │
│   • Modal re-renders         │
│   • Data refreshes           │
│   • States reset             │
└──────────────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│   User sees:                 │
│   • Success message          │
│   • Updated stages           │
│   • Next clickable stage     │
└──────────────────────────────┘
```

---

## Error Handling

```
User Action
    │
    ├─→ Network Error
    │   └─→ Toast: "Failed to update shipment status"
    │       Modal stays open
    │       Can retry
    │
    ├─→ Invalid Status
    │   └─→ Toast: "Invalid status transition"
    │       Modal stays open
    │
    ├─→ Permission Error (401)
    │   └─→ Toast: "Unauthorized"
    │       Redirect to login
    │
    ├─→ Server Error (500)
    │   └─→ Toast: "Server error occurred"
    │       Contact support
    │
    └─→ Success (200)
        └─→ Toast: "Shipment updated to [status]"
            Modal updates
            Data refreshes
```

---

## Mobile Responsive Layout

```
DESKTOP (1024px+):
┌─────────────────────────────────────────┐
│  Track Button    |    Dispatch Button    │
│  (side by side)  |    (side by side)     │
└─────────────────────────────────────────┘

TABLET (768px):
┌─────────────────────────────────────────┐
│  Track Button                            │
│  Dispatch Button                         │
│  (stacked vertically)                    │
└─────────────────────────────────────────┘

MOBILE (320px):
┌────────────────┐
│ Track Button   │
│                │
│ Dispatch       │
│ Button         │
│                │
│ Full width     │
└────────────────┘
```

---

## Summary

✅ **Track Button:**
- Shows delivery progress
- Allows manual status updates
- Disabled for pending shipments
- Visual 4-stage delivery journey

✅ **Dispatch Button:**
- Navigates to dispatch page
- Enabled for all shipments
- Allows full dispatch workflow
- Helps with batch operations

✅ **Both Actions:**
- Real-time data sync
- Automatic SalesOrder updates
- Complete audit trail
- Toast notifications
- Mobile responsive

**Status: ✅ COMPLETE & FUNCTIONAL**