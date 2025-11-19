# PO Creation Flow - Visual Summary

## Quick Start

### Button Location
```
Procurement Dashboard Header
┌─────────────────────────────────────────────────────┐
│  🛍️ Procurement Dashboard                           │
│                                  [Vendors] [Create PO] ◀─ Click Here
└─────────────────────────────────────────────────────┘
```

---

## Modal Interface

### The Modal Window
```
╔═════════════════════════════════════════════════════╗
║ Create Purchase Order                          [×]   ║
║ Select a sales order to create PO                   ║
╠═════════════════════════════════════════════════════╣
║                                                     ║
║ 🔍 Search by order number, project name, customer. ║
║                                                     ║
║ [All Status ▼]  [Clear]                            ║
║                                                     ║
╠═════════════════════════════════════════════════════╣
║                                                     ║
║  SO-2024-001  [Confirmed]                          ║
║  Project: Summer Collection                         ║
║  Customer: ABC Fashions  │ Qty: 500 │ PO Count: 2  ║
║  ℹ️ 2 PO(s) already created. You can create more.  ║
║                                                     ║
║  SO-2024-002  [Draft]                              ║
║  Project: Winter Range                              ║
║  Customer: XYZ Retail    │ Qty: 300 │ PO Count: 0  ║
║                                                     ║
║  SO-2024-003  [Confirmed]     ◀ Selected (Blue)   ║
║  Project: New Arrivals                              ║
║  Customer: Fashion Hub   │ Qty: 1000 │ PO Count: 1 ║
║  ℹ️ 1 PO(s) already created. You can create more.  ║
║                                                     ║
╠═════════════════════════════════════════════════════╣
║  [Cancel]              [Create PO] (Enabled)        ║
╚═════════════════════════════════════════════════════╝
```

---

## Step-by-Step Interaction

### Step 1: Open Modal
```
User: Clicks "Create PO" button in header
System: 
  1. Fetches all sales orders
  2. Filters by ready_for_procurement = true
  3. Shows orders in draft or confirmed status
  4. Calculates PO count for each order
```

### Step 2: Search/Filter (Optional)
```
User: Types in search box "ABC"
System:
  1. Filters orders by:
     - Order number contains "ABC"
     - Project name contains "ABC"
     - Customer contains "ABC"
  2. Shows matching results in real-time

User: Selects status "Confirmed"
System:
  1. Shows only confirmed orders
  2. Combines with search filter
```

### Step 3: Select Order
```
User: Clicks on SO-2024-003 card
System:
  1. Highlights card in blue
  2. Stores selection in state
  3. Enables "Create PO" button

User: Can click same card to deselect
```

### Step 4: Create PO
```
User: Clicks "Create PO" button
System:
  1. Closes modal
  2. Navigates to: /procurement/purchase-orders/create?from_sales_order=3
  3. CreatePurchaseOrderPage receives SO ID
  4. Auto-fills form with SO data:
     - Project name
     - Customer details
     - Items and quantities
     - Delivery date
     - Priority
     - Special instructions
  5. User can now:
     - Select vendor
     - Adjust quantities/rates
     - Configure financial details
     - Save as draft or submit
```

---

## Data Flow

```
┌─────────────────────┐
│ Dashboard Opens     │
│ Fetches PO Counts   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ User Clicks "Create PO" Button       │
│                                     │
│ Action: handleOpenCreatePOModal()   │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Fetch Sales Orders                   │
│ GET /sales/orders?limit=100         │
│                                     │
│ Filter by:                          │
│ - ready_for_procurement = true      │
│ - status = "draft" | "confirmed"    │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Modal Displays                       │
│ - Filtered SO list                  │
│ - PO count from existing data       │
│ - Search/filter ready               │
└──────────┬──────────────────────────┘
           │
           ▼ (User searches/filters)
┌─────────────────────────────────────┐
│ User Selects Order                   │
│ State: selectedSOForPO = order      │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ User Clicks "Create PO"              │
│                                     │
│ Action: handleProceedToCreatePO()   │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Navigate to Create PO Page           │
│ /procurement/purchase-orders/       │
│ create?from_sales_order=123        │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ CreatePurchaseOrderPage Receives ID  │
│                                     │
│ Fetches SO data                     │
│ Auto-fills form                     │
│ Allows manual editing                │
└─────────────────────────────────────┘
```

---

## Multiple PO Support

```
Sales Order: SO-2024-001

First PO Creation:
┌──────────────────┐
│ PO created       │
│ Status: Draft    │
│ Vendor: ABC Co.  │
│ Amount: ₹50,000  │
└──────────────────┘

PO Count: 1 ◀────────┐
                     │
User wants to create  │
another PO from       │
same SO (different    │
vendor or partial)    │
                     │
Click "Create PO"    │
Select SO-2024-001   │
                     │
┌──────────────────┐ │
│ PO created       │ │
│ Status: Draft    │ │
│ Vendor: XYZ Ltd. │ │
│ Amount: ₹35,000  │ │
└──────────────────┘ │
                     │
          PO Count: 2 ◀─

Scenario: Multi-vendor procurement or partial shipment
Result: Multiple POs, single Sales Order
Badge Shows: "2 PO(s) already created. You can create more."
```

---

## State Diagram

```
Initial State:
┌────────────────────────────────────────┐
│ createPOModalOpen = false              │
│ salesOrdersForPO = []                  │
│ selectedSOForPO = null                 │
│ filterSOSearch = ""                    │
│ filterSOStatus = "all"                 │
└────────────────────────────────────────┘

After "Create PO" Click:
┌────────────────────────────────────────┐
│ createPOModalOpen = true               │
│ salesOrdersForPO = [SO1, SO2, SO3...]  │
│ selectedSOForPO = null                 │
│ filterSOSearch = ""                    │
│ filterSOStatus = "all"                 │
└────────────────────────────────────────┘

During Search:
┌────────────────────────────────────────┐
│ createPOModalOpen = true               │
│ salesOrdersForPO = [SO1, SO2, SO3...]  │
│ selectedSOForPO = null                 │
│ filterSOSearch = "ABC"                 │
│ filterSOStatus = "all"                 │
└────────────────────────────────────────┘

After SO Selection:
┌────────────────────────────────────────┐
│ createPOModalOpen = true               │
│ salesOrdersForPO = [SO1, SO2, SO3...]  │
│ selectedSOForPO = {id: 3, name: ...}   │
│ filterSOSearch = "ABC"                 │
│ filterSOStatus = "all"                 │
└────────────────────────────────────────┘

After "Create PO" Click:
┌────────────────────────────────────────┐
│ createPOModalOpen = false              │
│ Navigate to create page                │
│ selectedSOForPO passed via URL         │
│ State reset on modal close             │
└────────────────────────────────────────┘
```

---

## Key UI States

### Button States

**"Create PO" Button Header**
```
Default:  [Create PO] (Clickable, Dark Background)
Hover:    [Create PO] (Shadow increases)
Loading:  [Create PO] (May show spinner)
```

**"Create PO" Button Modal Footer**
```
No Selection: [Create PO] (Disabled, Gray Background)
Selection:    [Create PO] (Enabled, Dark Background)
Click:        [Create PO] (Navigates away)
```

### Order Card Selection

```
Unselected:
┌─────────────────────────────────────┐
│ SO-2024-001  [Confirmed]            │
│ Project: Summer Collection          │
│ (Gray border, hover effect)         │
└─────────────────────────────────────┘

Selected:
┌─────────────────────────────────────┐
│ SO-2024-001  [Confirmed]            │
│ Project: Summer Collection          │
│ (Blue border, light blue background)│
└─────────────────────────────────────┘

With PO Count:
┌─────────────────────────────────────┐
│ SO-2024-001  [Confirmed]            │
│ Project: Summer Collection          │
│ Customer: ABC  │ Qty: 500 │ PO: 2   │
│                                     │
│ ℹ️ 2 PO(s) already created.         │
│    You can create additional POs.   │
└─────────────────────────────────────┘
```

---

## Implementation Checklist

- ✅ Modal state variables added
- ✅ Modal handler functions created
- ✅ Modal UI component rendered
- ✅ "Create PO" button updated
- ✅ Search functionality implemented
- ✅ Filter functionality implemented
- ✅ Selection highlighting implemented
- ✅ PO count display implemented
- ✅ Navigation to create page implemented
- ✅ Build passes without errors
- ✅ Documentation created

---

## Quick Reference

| Component | File | Line |
|-----------|------|------|
| Modal State | ProcurementDashboard.jsx | 251-256 |
| Open Handler | ProcurementDashboard.jsx | 651-672 |
| Create Handler | ProcurementDashboard.jsx | 674-685 |
| Modal UI | ProcurementDashboard.jsx | 2040-2198 |
| Button | ProcurementDashboard.jsx | 811-817 |

---

## Common Scenarios

### Scenario 1: Create First PO for SO
```
1. Open Procurement Dashboard
2. Click "Create PO"
3. Search/find sales order
4. Click to select
5. Click "Create PO"
6. Select vendor in form
7. Submit PO
Result: First PO created ✓
```

### Scenario 2: Create Additional PO for Same SO
```
1. Open Procurement Dashboard
2. Click "Create PO"
3. Find same sales order (shows "PO Count: 1")
4. Click to select
5. Click "Create PO"
6. Select different vendor (or same)
7. Submit PO
Result: Second PO created for same SO ✓
```

### Scenario 3: Search for Specific Order
```
1. Open Procurement Dashboard
2. Click "Create PO"
3. Type "ABC" in search
4. Modal filters showing only ABC-related orders
5. Select desired order
6. Click "Create PO"
Result: Navigate to create page with SO pre-selected ✓
```

### Scenario 4: Filter by Status
```
1. Open Procurement Dashboard
2. Click "Create PO"
3. Select "Confirmed" in status dropdown
4. Shows only confirmed orders
5. Select order
6. Click "Create PO"
Result: Create PO from confirmed order ✓
```
