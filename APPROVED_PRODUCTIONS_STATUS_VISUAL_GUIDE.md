# Approved Productions - Status Tracking Visual Guide

## 🎨 UI Overview

### Main Section (Collapsed)

```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ Approved Productions Ready    [3] Ready  ▼                  │
│  3 projects with 5 approvals                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Main Section (Expanded)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ✓ Approved Productions Ready    [3] Ready  ▲                           │
│  3 projects with 5 approvals                                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  [Project 1 Card]  [Project 2 Card]  [Project 3 Card]                   │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Status States & Visual Indicators

### State 1: Ready to Start 🟢

```
┌─────────────────────────────────────────────────────────────┐
│ 🟢 Project Alpha (SO-001)  [3] 🟢 Ready to Start            │
│ 👤 Customer: ABC Corp                                        │
├─────────────────────────────────────────────────────────────┤
│ Approvals:                                                   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ #1  APP-001  ✓ Approved                                │  │
│ │ By John Doe • 1/15/2024                      [View]    │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ #2  APP-002  ✓ Approved                                │  │
│ │ By Jane Smith • 1/16/2024                    [View]    │  │
│ └────────────────────────────────────────────────────────┘  │
│ 📦 Materials (4 total)                                       │
│ • Fabric - Cotton (50 m)                                     │
│ • Thread - Blue (100 spools)                                 │
│ • Buttons - White (500 pcs)                                  │
│ +1 more material                                             │
│                                                               │
│              [▶ Start Production]                           │
│              ↑ ENABLED - Click to create new order          │
└─────────────────────────────────────────────────────────────┘
```

---

### State 2: Pending Start 🟡

```
┌─────────────────────────────────────────────────────────────┐
│ 🟡 Project Beta (SO-002)  [2] 🟡 Pending Start              │
│ 👤 Customer: XYZ Inc                                         │
├─────────────────────────────────────────────────────────────┤
│ Approvals:                                                   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ #1  APP-003  ✓ Approved  🟡 Pending                   │  │
│ │ By Admin User • 1/17/2024                              │  │
│ │ → Order: PO-2024-001                     [View Order]  │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ #2  APP-004  ✓ Approved                                │  │
│ │ By Manager • 1/18/2024                     [View]      │  │
│ └────────────────────────────────────────────────────────┘  │
│ 📦 Materials (3 total)                                       │
│ • Polyester Blend                                            │
│ • Zippers                                                    │
│ +1 more material                                             │
│                                                               │
│              [⏱ Pending Start]                              │
│              ↑ DISABLED - Order created, awaiting start      │
└─────────────────────────────────────────────────────────────┘
```

---

### State 3: In Production 🟠

```
┌──────────────────────────────────────────────────────────────┐
│ 🟠 Project Gamma (SO-003)  [1] 🟠 In Production             │
│ 👤 Customer: DEF Ltd                                         │
├──────────────────────────────────────────────────────────────┤
│ Approvals:                                                   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ #1  APP-005  ✓ Approved  🟠 In Production             │  │
│ │ By Production Lead • 1/19/2024                         │  │
│ │ → Order: PO-2024-002                    [View Order]   │  │
│ │                                                         │  │
│ │   Status: Currently at "Cutting" stage                 │  │
│ │   Progress: 40% complete                               │  │
│ └────────────────────────────────────────────────────────┘  │
│ 📦 Materials (5 total)                                       │
│ • Premium Cotton (75 m)                                      │
│ • Quality Thread (150 spools)                                │
│ • Premium Buttons (750 pcs)                                  │
│ • Labels                                                     │
│ +1 more material                                             │
│                                                               │
│              [👁 View Production]                            │
│              ↑ ENABLED - Shows existing order details        │
└──────────────────────────────────────────────────────────────┘
```

---

### State 4: Completed 🔵

```
┌─────────────────────────────────────────────────────────────┐
│ 🔵 Project Delta (SO-004)  [2] 🔵 Completed                │
│ 👤 Customer: GHI Corp                                        │
├─────────────────────────────────────────────────────────────┤
│ Approvals:                                                   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ #1  APP-006  ✓ Approved  🔵 Completed                 │  │
│ │ By Quality Team • 1/20/2024                            │  │
│ │ → Order: PO-2024-003                     [View Order]  │  │
│ │                                                         │  │
│ │   Completed: 1/22/2024                                 │  │
│ │   100% Done ✓                                          │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ #2  APP-007  ✓ Approved  🔵 Completed                 │  │
│ │ By Quality Team • 1/20/2024                            │  │
│ │ → Order: PO-2024-004                     [View Order]  │  │
│ └────────────────────────────────────────────────────────┘  │
│ 📦 Materials (6 total)                                       │
│ • Standard Cotton (100 m)                                    │
│ • Standard Thread (200 spools)                               │
│ • Standard Buttons (1000 pcs)                                │
│ • Packing Labels                                             │
│ • Tissue Paper                                               │
│ +1 more material                                             │
│                                                               │
│              [✓ Completed]                                  │
│              ↑ DISABLED - Project finished                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Layout

### Desktop View (1200px+)

```
┌────────────────────────────────────────────────────────────────────┐
│ ✓ Project A      ┌─ Status Badge     ┌─ [Start Production]        │
│ SO-001  [3]      │  (🟢 Ready)      │                            │
│ 👤 Customer      └─────────────────  └─────────────────────────  │
│                                                                     │
│  Approvals (3) | Materials (4 total) | Actions                    │
│  #1 APP-001 ✓  | • Fabric           | [View]                     │
│  #2 APP-002 ✓  | • Thread           | [View]                     │
│  #3 APP-003 ✓  | +2 more            | [View]                     │
└────────────────────────────────────────────────────────────────────┘
```

### Tablet View (768-1024px)

```
┌──────────────────────────────────┐
│ ✓ Project A (SO-001) 🟢 Ready    │
│ 👤 ABC Corp  [3 approvals]       │
├──────────────────────────────────┤
│ Approvals:                       │
│ #1 APP-001 ✓ Approved  [View]   │
│ #2 APP-002 ✓ Approved  [View]   │
│ #3 APP-003 ✓ Approved  [View]   │
├──────────────────────────────────┤
│ Materials (4 total):             │
│ • Fabric - Cotton (50 m)         │
│ • Thread - Blue (100 spools)     │
│ +2 more materials                │
│                                  │
│ [▶ Start Production]            │
└──────────────────────────────────┘
```

### Mobile View (320-640px)

```
┌──────────────────────────┐
│ ✓ Project A              │
│ (SO-001)                 │
│ 🟢 Ready                 │
│ 👤 ABC Corp              │
│                          │
│ 3 approvals              │
│ 4 materials              │
├──────────────────────────┤
│ Approvals:               │
│ #1 APP-001               │
│ ✓ Approved               │
│ By: User                 │
│ Date: 1/15               │
│          [View]          │
├──────────────────────────┤
│ Materials:               │
│ • Fabric (50 m)          │
│ • Thread (100 s)         │
│ +2 more                  │
│                          │
│ [▶ Start Prod]          │
└──────────────────────────┘
```

---

## 🎯 Status Badge Styles

### Color Codes

```
Ready to Start (Green):
┌─────────────────────────────────────────┐
│ Background: #dcfce7 (bg-green-100)     │
│ Text: #15803d (text-green-800)         │
│ Border: None                            │
│ Padding: 0.625rem 2.5rem               │
│ Border-radius: 0.375rem                │
│ Icon: FaPlay                            │
│ Label: Ready to Start                   │
└─────────────────────────────────────────┘

Pending Start (Yellow):
┌─────────────────────────────────────────┐
│ Background: #fef08a (bg-yellow-100)    │
│ Text: #854d0e (text-yellow-800)        │
│ Icon: FaClock                           │
│ Label: Pending Start                    │
└─────────────────────────────────────────┘

In Production (Orange):
┌─────────────────────────────────────────┐
│ Background: #fed7aa (bg-orange-100)    │
│ Text: #92400e (text-orange-800)        │
│ Icon: FaCog                             │
│ Label: In Production                    │
└─────────────────────────────────────────┘

Completed (Blue):
┌─────────────────────────────────────────┐
│ Background: #dbeafe (bg-blue-100)      │
│ Text: #1e40af (text-blue-800)          │
│ Icon: FaCheckCircle                     │
│ Label: Completed                        │
└─────────────────────────────────────────┘
```

---

## 🔘 Button States & Colors

### "Start Production" Button States

```
ENABLED (Ready to Start):
┌────────────────────────────────────┐
│ Background: White                  │
│ Text: #2563eb (Blue)              │
│ Border: None                       │
│ Shadow: sm                         │
│ Hover: bg-blue-50                 │
│ Icon: FaPlay                       │
│ Cursor: pointer                    │
│ Text: "Start Production"           │
│ Action: Create new order           │
└────────────────────────────────────┘

DISABLED (Pending/Complete):
┌────────────────────────────────────┐
│ Background: #e5e7eb (Gray)        │
│ Text: #9ca3af (Gray)              │
│ Cursor: not-allowed               │
│ Opacity: 0.6                      │
│ Hover: No change                  │
│ Text: "Pending Start" or           │
│       "Completed"                  │
│ Action: None                       │
└────────────────────────────────────┘
```

### "View Production" Button State

```
ENABLED (In Production):
┌────────────────────────────────────┐
│ Background: #fed7aa (Orange-100)  │
│ Text: #b45309 (Orange-700)        │
│ Border: None                       │
│ Shadow: sm                         │
│ Hover: bg-orange-200              │
│ Icon: FaEye                        │
│ Cursor: pointer                    │
│ Text: "View Production"            │
│ Action: Show existing order        │
└────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
API Response (Backend)
    ↓
    ├─ approvedProductions Array
    │   └─ Each approval with:
    │       ├─ id
    │       ├─ approval_number
    │       ├─ mrnRequest.salesOrder
    │       └─ status
    │
    └─ orders Array
        └─ Each order with:
            ├─ id
            ├─ sales_order_id
            ├─ production_approval_id
            ├─ status
            └─ orderNumber
                    ↓
            groupApprovalsByProject()
                    ↓
            getProjectProductionStatus()
            getApprovalProductionStatus()
                    ↓
        Status Objects Created
                    ↓
        UI Rendering with Badges & Buttons
```

---

## 🎨 Typography Hierarchy

```
Project Title (Base Font):
├─ Size: 1rem (16px)
├─ Weight: 600 (semibold)
├─ Color: text-gray-900
└─ Example: "Project A (SO-001)"

Status Badge Label:
├─ Size: 0.75rem (12px)
├─ Weight: 700 (bold)
├─ Color: Varies by status
└─ Example: "Ready to Start"

Approval Number:
├─ Size: 0.75rem (12px)
├─ Weight: 600 (semibold)
├─ Color: text-gray-900
└─ Example: "APP-001"

Approval Date/Author:
├─ Size: 0.75rem (12px)
├─ Weight: 400 (normal)
├─ Color: text-gray-500
└─ Example: "By John Doe • 1/15/2024"

Order Reference:
├─ Size: 0.75rem (12px)
├─ Weight: 500 (medium)
├─ Color: text-blue-600
└─ Example: "→ Order: PO-2024-001"
```

---

## 🔄 User Interaction Flow

```
User Opens Production Orders Page
        ↓
    [Expanded] Approved Productions Section
        ↓
  User sees Projects with Status Badges
        ↓
  ┌─ Project is 🟢 Ready to Start
  │      ↓
  │  User clicks [▶ Start Production]
  │      ↓
  │  → Navigate to Wizard
  │  → Create new production order
  │  → Status updates to 🟡 Pending
  │
  ├─ Project is 🟠 In Production
  │      ↓
  │  User clicks [👁 View Production]
  │      ↓
  │  → Show production order details
  │  → View stages, materials, progress
  │
  ├─ Project is 🟡 Pending / 🔵 Complete
  │      ↓
  │  Buttons disabled (grayed out)
  │      ↓
  │  User waits or reviews completed order
  │
  └─ User clicks approval-level [View Order]
        ↓
    → Jump to specific order details
    → See linked order reference
```

---

## 📈 Status Transition Timeline

```
Timeline for Single Approval:

Time →

T0: Material Approved
    Status: 🟢 Ready to Start
    ├─ No production order
    ├─ Button: [▶ Start Production] ✓
    └─ Action Available: Create order

    ↓ User creates order

T1: Order Created
    Status: 🟡 Pending Start
    ├─ Order exists but not started
    ├─ Button: [⏱ Pending Start] ✗
    └─ Action: Wait for manual trigger

    ↓ User manually starts production

T2: Production Underway
    Status: 🟠 In Production
    ├─ Order running
    ├─ Button: [👁 View Production] ✓
    └─ Action Available: View progress

    ↓ All stages complete

T3: Order Complete
    Status: 🔵 Completed
    ├─ All work finished
    ├─ Button: [✓ Completed] ✗
    └─ Action: Review results
```

---

## 🎯 Notification & Status Changes

```
Status Change Events:

Event: Order Created
├─ From: 🟢 Ready to Start
├─ To: 🟡 Pending Start
└─ UI Update: Badge color changes, button disables

Event: Production Started
├─ From: 🟡 Pending Start
├─ To: 🟠 In Production
└─ UI Update: Badge color changes, button changes to "View"

Event: Production Complete
├─ From: 🟠 In Production
├─ To: 🔵 Completed
└─ UI Update: Badge color changes, button disables

Event: Page Refresh
├─ Fetches latest order status from API
├─ Updates all status badges
└─ Reflects current production state
```

---

## ✅ Visual Checklist

- ✅ Status badges display correctly for all 4 states
- ✅ Colors match design specification
- ✅ Icons appear next to labels
- ✅ Buttons change appearance based on status
- ✅ Button text updates appropriately
- ✅ Order references (PO-XXXX) display when linked
- ✅ Mobile layout adapts properly
- ✅ Hover states work on interactive elements
- ✅ Disabled buttons appear grayed out
- ✅ Animations smooth and consistent

---

**Version:** 1.0  
**Last Updated:** January 2025  
**Design System:** Tailwind CSS 3.x
