# 🎨 Material Request Workflow - Visual Flow Diagram

## 📊 Complete System Flow

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                         PROCUREMENT DEPARTMENT                             ║
║                                                                            ║
║  Step 1: Create Material Request                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📄 Purchase Order Details Page                                   │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  PO-20240115-00001                                          │  │    ║
║  │  │  Project: ABC Manufacturing Project                         │  │    ║
║  │  │  Status: APPROVED                                           │  │    ║
║  │  │                                                             │  │    ║
║  │  │  Quick Actions:                                             │  │    ║
║  │  │  [Send to Vendor] [Create GRN]                             │  │    ║
║  │  │  [📦 Send Material Request to Manufacturing] ← CLICK HERE  │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📝 Material Request Form Modal                                   │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  Priority: [High ▼]                                         │  │    ║
║  │  │  Required Date: [2024-01-20]                                │  │    ║
║  │  │  Procurement Notes: [Urgent for Project ABC...]            │  │    ║
║  │  │                                                             │  │    ║
║  │  │  Select Materials:                                          │  │    ║
║  │  │  ☑ Cotton Fabric - 100 Meters                              │  │    ║
║  │  │  ☑ Polyester Thread - 50 Spools                            │  │    ║
║  │  │  ☐ Buttons - 1000 Pieces                                   │  │    ║
║  │  │                                                             │  │    ║
║  │  │  [Send Request] [Cancel]                                    │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  ✅ Request Created Successfully!                                 │    ║
║  │  Request ID: #1                                                   │    ║
║  │  Status: PENDING                                                  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  Step 2: Track in Dashboard                                               ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📊 Procurement Dashboard → Material Requests Tab                 │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  [View All Material Requests]                               │  │    ║
║  │  │                                                             │  │    ║
║  │  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │  │    ║
║  │  │  │  5   │  │  3   │  │  8   │  │  16  │                   │  │    ║
║  │  │  │Pend. │  │Review│  │Reserv│  │Total │                   │  │    ║
║  │  │  └──────┘  └──────┘  └──────┘  └──────┘                   │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                    │
                                    │ 🔔 Notification Sent
                                    │ "New material request from Procurement"
                                    │
                                    ▼
╔═══════════════════════════════════════════════════════════════════════════╗
║                        MANUFACTURING DEPARTMENT                            ║
║                                                                            ║
║  Step 3: Receive Notification                                             ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  🔔 Notifications                                                  │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  📬 New Material Request                                    │  │    ║
║  │  │  From: Procurement Department                               │  │    ║
║  │  │  Request #1 for Project ABC                                 │  │    ║
║  │  │  Priority: HIGH                                             │  │    ║
║  │  │  [View Request] ← CLICK HERE                                │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  Step 4: View Material Requests Page                                      ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📋 Material Requests (/manufacturing/material-requests)          │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  Filter: [Pending ▼]                                        │  │    ║
║  │  │                                                             │  │    ║
║  │  │  ┌──────────────────────────────────────────────────────┐  │  │    ║
║  │  │  │ #1 │ ABC Proj │ PO-001 │ HIGH │ PENDING │ [View]   │  │  │    ║
║  │  │  └──────────────────────────────────────────────────────┘  │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  Step 5: Review Request                                                   ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📄 Request Details Modal                                          │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  Request #1 - Project ABC                                   │  │    ║
║  │  │  Priority: HIGH | Status: PENDING                           │  │    ║
║  │  │                                                             │  │    ║
║  │  │  Materials Requested:                                       │  │    ║
║  │  │  • Cotton Fabric - 100 Meters                              │  │    ║
║  │  │  • Polyester Thread - 50 Spools                            │  │    ║
║  │  │                                                             │  │    ║
║  │  │  Procurement Notes:                                         │  │    ║
║  │  │  "Urgent for Project ABC..."                               │  │    ║
║  │  │                                                             │  │    ║
║  │  │  [Review Request] [Forward to Inventory]                   │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📝 Review Modal                                                   │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  Manufacturing Notes:                                       │  │    ║
║  │  │  [Reviewed and approved. Ready for inventory check...]     │  │    ║
║  │  │                                                             │  │    ║
║  │  │  [Submit Review] [Cancel]                                   │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  ✅ Request Reviewed!                                              │    ║
║  │  Status: REVIEWED                                                  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  Step 6: Forward to Inventory                                             ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📤 Forward to Inventory Modal                                     │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  Inventory Notes:                                           │  │    ║
║  │  │  [Please check stock and reserve materials...]             │  │    ║
║  │  │                                                             │  │    ║
║  │  │  [Forward to Inventory] [Cancel]                            │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  ✅ Forwarded to Inventory!                                        │    ║
║  │  Status: FORWARDED_TO_INVENTORY                                    │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                    │
                                    │ 🔔 Notification Sent
                                    │ "Material request forwarded by Manufacturing"
                                    │
                                    ▼
╔═══════════════════════════════════════════════════════════════════════════╗
║                         INVENTORY DEPARTMENT                               ║
║                                                                            ║
║  Step 7: Receive Notification                                             ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  🔔 Notifications                                                  │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  📬 Material Request Forwarded                              │  │    ║
║  │  │  From: Manufacturing Department                             │  │    ║
║  │  │  Request #1 for Project ABC                                 │  │    ║
║  │  │  Priority: HIGH                                             │  │    ║
║  │  │  [View Request] ← CLICK HERE                                │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  Step 8: View Material Requests Page                                      ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📋 Material Requests (/inventory/material-requests)              │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  Filter: [Forwarded to Inventory ▼]                         │  │    ║
║  │  │                                                             │  │    ║
║  │  │  ┌──────────────────────────────────────────────────────┐  │  │    ║
║  │  │  │ #1 │ ABC Proj │ PO-001 │ HIGH │ FORWARDED │ [View] │  │  │    ║
║  │  │  └──────────────────────────────────────────────────────┘  │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  Step 9: Check Stock Availability                                         ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📄 Request Details Modal                                          │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  Request #1 - Project ABC                                   │  │    ║
║  │  │  Priority: HIGH | Status: FORWARDED_TO_INVENTORY            │  │    ║
║  │  │                                                             │  │    ║
║  │  │  Materials Requested:                                       │  │    ║
║  │  │  • Cotton Fabric - 100 Meters                              │  │    ║
║  │  │  • Polyester Thread - 50 Spools                            │  │    ║
║  │  │                                                             │  │    ║
║  │  │  [Check Stock Availability] ← CLICK HERE                   │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  🔍 Checking Stock...                                              │    ║
║  │  System is checking inventory database...                          │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  ✅ Stock Check Complete!                                          │    ║
║  │  Status: STOCK_AVAILABLE                                           │    ║
║  │                                                                    │    ║
║  │  Materials Availability:                                           │    ║
║  │  • Cotton Fabric: ✓ Available (120 Meters in stock)              │    ║
║  │  • Polyester Thread: ✓ Available (75 Spools in stock)            │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  Step 10: Reserve Materials                                               ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📄 Request Details Modal (Updated)                                │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  Request #1 - Project ABC                                   │  │    ║
║  │  │  Priority: HIGH | Status: STOCK_AVAILABLE                   │  │    ║
║  │  │                                                             │  │    ║
║  │  │  Materials Availability:                                    │  │    ║
║  │  │  ┌────────────────────────────────────────────────────┐    │  │    ║
║  │  │  │ Material         │ Requested │ Available │ Status  │    │  │    ║
║  │  │  ├────────────────────────────────────────────────────┤    │  │    ║
║  │  │  │ Cotton Fabric    │ 100 M     │ 120 M     │ ✓ Avail │    │  │    ║
║  │  │  │ Polyester Thread │ 50 Spools │ 75 Spools │ ✓ Avail │    │  │    ║
║  │  │  └────────────────────────────────────────────────────┘    │  │    ║
║  │  │                                                             │  │    ║
║  │  │  [Reserve Materials] ← CLICK HERE                          │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📝 Reserve Materials Modal                                        │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  Reservation Notes:                                         │  │    ║
║  │  │  [Materials reserved for Project ABC. Location: Rack 5...] │  │    ║
║  │  │                                                             │  │    ║
║  │  │  [Confirm Reservation] [Cancel]                             │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  🔄 Reserving Materials...                                         │    ║
║  │  • Updating inventory status to "Reserved"                         │    ║
║  │  • Linking materials to Project ABC                                │    ║
║  │  • Generating reservation records                                  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  ✅ Materials Reserved Successfully!                               │    ║
║  │  Status: MATERIALS_RESERVED                                        │    ║
║  │                                                                    │    ║
║  │  Reserved Items:                                                   │    ║
║  │  • Barcode: INV-2024-001234 | Location: Rack 5, Shelf 2          │    ║
║  │  • Barcode: INV-2024-001235 | Location: Rack 3, Shelf 1          │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                    │
                                    │ 🔔 Notifications Sent
                                    │ To: Manufacturing & Procurement
                                    │ "Materials reserved for Request #1"
                                    │
                                    ▼
╔═══════════════════════════════════════════════════════════════════════════╗
║                  MANUFACTURING & PROCUREMENT DEPARTMENTS                   ║
║                                                                            ║
║  Step 11: Receive Reservation Notification                                ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  🔔 Notifications                                                  │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  📬 Materials Reserved                                       │  │    ║
║  │  │  From: Inventory Department                                 │  │    ║
║  │  │  Request #1 for Project ABC                                 │  │    ║
║  │  │  All materials have been reserved                           │  │    ║
║  │  │  [View Details] ← CLICK HERE                                │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  📄 Request Details - Final Status                                 │    ║
║  │  ┌────────────────────────────────────────────────────────────┐  │    ║
║  │  │  Request #1 - Project ABC                                   │  │    ║
║  │  │  Priority: HIGH | Status: MATERIALS_RESERVED ✅             │  │    ║
║  │  │                                                             │  │    ║
║  │  │  ✅ Reserved Materials:                                     │  │    ║
║  │  │  ┌────────────────────────────────────────────────────┐    │  │    ║
║  │  │  │ Barcode: INV-2024-001234                           │    │  │    ║
║  │  │  │ Product: Cotton Fabric                             │    │  │    ║
║  │  │  │ Quantity: 100 Meters                               │    │  │    ║
║  │  │  │ Location: Warehouse A - Rack 5 - Shelf 2           │    │  │    ║
║  │  │  ├────────────────────────────────────────────────────┤    │  │    ║
║  │  │  │ Barcode: INV-2024-001235                           │    │  │    ║
║  │  │  │ Product: Polyester Thread                          │    │  │    ║
║  │  │  │ Quantity: 50 Spools                                │    │  │    ║
║  │  │  │ Location: Warehouse A - Rack 3 - Shelf 1           │    │  │    ║
║  │  │  └────────────────────────────────────────────────────┘    │  │    ║
║  │  │                                                             │  │    ║
║  │  │  📅 Timeline:                                               │  │    ║
║  │  │  ● PENDING - Jan 15, 10:30 AM                              │  │    ║
║  │  │  ● REVIEWED - Jan 15, 11:15 AM                             │  │    ║
║  │  │  ● FORWARDED TO INVENTORY - Jan 15, 11:20 AM               │  │    ║
║  │  │  ● STOCK AVAILABLE - Jan 15, 11:45 AM                      │  │    ║
║  │  │  ● MATERIALS RESERVED - Jan 15, 12:00 PM ✅                │  │    ║
║  │  │                                                             │  │    ║
║  │  │  🎉 Materials are ready for production!                    │  │    ║
║  │  └────────────────────────────────────────────────────────────┘  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 Status Flow Diagram

```
┌─────────────┐
│   PENDING   │ ← Request created by Procurement
└──────┬──────┘
       │ Manufacturing reviews
       ▼
┌─────────────┐
│   REVIEWED  │ ← Manufacturing adds notes
└──────┬──────┘
       │ Manufacturing forwards
       ▼
┌─────────────────────────┐
│ FORWARDED_TO_INVENTORY  │ ← Sent to Inventory dept
└──────┬──────────────────┘
       │ Inventory checks stock
       ▼
┌─────────────────┐
│ STOCK_CHECKING  │ ← System checking inventory
└──────┬──────────┘
       │
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────────┐
│STOCK_AVAILABLE│ │PARTIAL_AVAIL│ │STOCK_UNAVAILABLE │
│ (All in stock)│ │(Some in stock)│ │(None in stock)  │
└──────┬────────┘ └──────┬──────┘ └────────┬─────────┘
       │                 │                  │
       └────────┬────────┘                  │
                │ Inventory reserves        │
                ▼                            │
       ┌──────────────────┐                 │
       │MATERIALS_RESERVED│                 │
       │(Ready for use)   │                 │
       └────────┬─────────┘                 │
                │ Manufacturing issues      │
                ▼                            │
       ┌──────────────────┐                 │
       │MATERIALS_ISSUED  │                 │
       │(Given to prod.)  │                 │
       └────────┬─────────┘                 │
                │ Project completes         │
                ▼                            │
       ┌──────────────────┐                 │
       │   COMPLETED      │                 │
       └──────────────────┘                 │
                                            │
                                            ▼
                                   ┌──────────────┐
                                   │  CANCELLED   │
                                   │(If needed)   │
                                   └──────────────┘
```

---

## 🎨 UI Component Hierarchy

```
Procurement Dashboard
│
├── Material Requests Tab
│   ├── Statistics Cards
│   │   ├── Total Requests
│   │   ├── Pending
│   │   ├── Reviewed
│   │   └── Reserved
│   │
│   └── [View All Material Requests] Button
│       │
│       └──> Material Requests Page
│           │
│           ├── Header
│           │   ├── Back Button
│           │   ├── Title
│           │   └── Refresh Button
│           │
│           ├── Stats Cards (6 cards)
│           │   ├── Total
│           │   ├── Pending
│           │   ├── Reviewed
│           │   ├── Forwarded
│           │   ├── Available
│           │   └── Reserved
│           │
│           ├── Filters Section
│           │   └── Status Dropdown
│           │
│           ├── Requests Table
│           │   ├── Table Header
│           │   └── Table Rows
│           │       └── [View] Button
│           │           │
│           │           └──> Request Details Modal
│           │               │
│           │               ├── Request Info Grid
│           │               ├── Materials Table
│           │               ├── Notes Sections
│           │               ├── Reserved Materials
│           │               ├── Timeline
│           │               └── [Close] Button
│           │
│           └── Empty State (if no requests)
│
└── Purchase Orders
    │
    └── PO Details Page
        │
        ├── Header
        ├── Quick Actions
        │   └── [Send Material Request] Button
        │       │
        │       └──> Material Request Modal
        │           │
        │           ├── Priority Dropdown
        │           ├── Required Date Picker
        │           ├── Notes Textarea
        │           ├── Materials Checklist
        │           └── [Send Request] Button
        │
        └── PO Details Tabs
```

---

## 📱 Responsive Layout

### Desktop View (1920x1080)
```
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar │ Material Requests Page                               │
│  (250px) │                                                       │
│          │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  ├─Sales │  │Total│ │Pend.│ │Revw.│ │Frwd.│ │Avail│ │Resv.│   │
│  ├─Proc. │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   │
│  │ ├─POs │                                                       │
│  │ ├─Mat.│  Filter: [All Requests ▼]                            │
│  │ │Req. │                                                       │
│  │ └─Vend│  ┌───────────────────────────────────────────────┐  │
│  ├─Inv.  │  │ Table with all requests                       │  │
│  └─Mfg.  │  │ (Full width, scrollable)                      │  │
│          │  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Tablet View (768x1024)
```
┌──────────────────────────────────────┐
│  ☰ Menu │ Material Requests          │
│                                       │
│  ┌────┐ ┌────┐ ┌────┐               │
│  │Tot.│ │Pnd.│ │Rsv.│               │
│  └────┘ └────┘ └────┘               │
│  ┌────┐ ┌────┐ ┌────┐               │
│  │Rev.│ │Fwd.│ │Avl.│               │
│  └────┘ └────┘ └────┘               │
│                                       │
│  Filter: [All ▼]                     │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ Requests Table                  │ │
│  │ (Scrollable)                    │ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Mobile View (375x667)
```
┌──────────────────────┐
│ ☰ │ Material Requests│
│                       │
│ ┌────┐ ┌────┐        │
│ │Tot.│ │Pnd.│        │
│ └────┘ └────┘        │
│ ┌────┐ ┌────┐        │
│ │Rev.│ │Rsv.│        │
│ └────┘ └────┘        │
│                       │
│ Filter: [All ▼]      │
│                       │
│ ┌───────────────────┐│
│ │ Request Card #1   ││
│ │ Project: ABC      ││
│ │ Status: Pending   ││
│ │ [View]            ││
│ └───────────────────┘│
│ ┌───────────────────┐│
│ │ Request Card #2   ││
│ └───────────────────┘│
└──────────────────────┘
```

---

## 🎨 Color Scheme

### Status Colors
```
PENDING              → 🟡 Yellow (#FEF3C7 bg, #92400E text)
REVIEWED             → 🔵 Blue   (#DBEAFE bg, #1E40AF text)
FORWARDED            → 🟣 Purple (#E9D5FF bg, #6B21A8 text)
STOCK_CHECKING       → 🟣 Indigo (#E0E7FF bg, #3730A3 text)
STOCK_AVAILABLE      → 🟢 Green  (#D1FAE5 bg, #065F46 text)
PARTIAL_AVAILABLE    → 🟠 Orange (#FED7AA bg, #9A3412 text)
STOCK_UNAVAILABLE    → 🔴 Red    (#FEE2E2 bg, #991B1B text)
MATERIALS_RESERVED   → 🟢 Emerald(#D1FAE5 bg, #047857 text)
MATERIALS_ISSUED     → 🟢 Teal   (#CCFBF1 bg, #115E59 text)
COMPLETED            → ⚪ Gray   (#F3F4F6 bg, #374151 text)
```

### Priority Colors
```
LOW     → ⚪ Gray   (#F3F4F6 bg, #6B7280 text)
MEDIUM  → 🔵 Blue   (#DBEAFE bg, #2563EB text)
HIGH    → 🟠 Orange (#FED7AA bg, #EA580C text)
URGENT  → 🔴 Red    (#FEE2E2 bg, #DC2626 text)
```

---

## 🔔 Notification Flow

```
Procurement Creates Request
         │
         ▼
    [Notification]
         │
         ├──> Manufacturing (Email + In-App)
         │    "New material request from Procurement"
         │
         └──> Procurement (Confirmation)
              "Request created successfully"

Manufacturing Reviews
         │
         ▼
    [Notification]
         │
         └──> Procurement (In-App)
              "Request reviewed by Manufacturing"

Manufacturing Forwards
         │
         ▼
    [Notification]
         │
         ├──> Inventory (Email + In-App)
         │    "Material request forwarded"
         │
         └──> Procurement (In-App)
              "Request forwarded to Inventory"

Inventory Checks Stock
         │
         ▼
    [Notification]
         │
         ├──> Manufacturing (In-App)
         │    "Stock availability: Available/Partial/Unavailable"
         │
         └──> Procurement (In-App)
              "Stock check completed"

Inventory Reserves Materials
         │
         ▼
    [Notification]
         │
         ├──> Manufacturing (Email + In-App)
         │    "Materials reserved for your request"
         │
         └──> Procurement (Email + In-App)
              "Materials reserved for Request #X"
```

---

## 📊 Data Flow

```
Frontend (React)
    │
    ├─> API Service Layer
    │   (projectMaterialRequestService.js)
    │   │
    │   ├─> GET /api/project-material-requests
    │   ├─> GET /api/project-material-requests/:id
    │   ├─> POST /api/project-material-requests/from-po/:poId
    │   ├─> POST /api/project-material-requests/:id/forward-to-inventory
    │   ├─> POST /api/project-material-requests/:id/check-stock
    │   ├─> POST /api/project-material-requests/:id/reserve-materials
    │   └─> PATCH /api/project-material-requests/:id/status
    │
    ▼
Backend (Express.js)
    │
    ├─> Routes
    │   (projectMaterialRequest.js)
    │   │
    │   ├─> Authentication Middleware
    │   ├─> Department Check Middleware
    │   └─> Route Handlers
    │
    ▼
Database (PostgreSQL)
    │
    ├─> project_material_requests table
    ├─> purchase_orders table
    ├─> inventory table
    ├─> notifications table
    └─> users table
```

---

**Last Updated:** January 2024  
**Version:** 1.0  
**Document Type:** Visual Flow Diagram