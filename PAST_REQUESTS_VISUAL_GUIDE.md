# Past Orders/Requests - Visual Guide

## Page Layout Overview

### Initial Page Load (Default State)

```
╔════════════════════════════════════════════════════════════╗
║  🏭 Material Requirements (MRN)                           ║
║  View material requests needed for production from Inventory║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  📊 STATISTICS CARDS                                       ║
║  ┌─────────────┬─────────────┬─────────────┬────────────┐ ║
║  │ Total: 8    │ Pending: 2  │ Approved: 3 │ Fulfilled: 2│ ║
║  └─────────────┴─────────────┴─────────────┴────────────┘ ║
║                                                            ║
║  🔍 SEARCH & CONTROLS                                      ║
║  ┌─────────────────────┬──────┬──────┬──────┬──────────┐  ║
║  │ Search... [⌕]       │ 🎛️ F │ 📊 T │ 📇 C │ Columns │  ║
║  └─────────────────────┴──────┴──────┴──────┴──────────┘  ║
║                                                            ║
║  ═════════════════════════════════════════════════════════ ║
║  📋 ACTIVE REQUESTS (5)                                    ║
║  ═════════════════════════════════════════════════════════ ║
║                                                            ║
║  📊 TABLE VIEW (Default)                                   ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ Req #  │ Material │ Project │ Qty │ Status  │ Action│  ║
║  ├─────────────────────────────────────────────────────┤  ║
║  │ MRN001 │ Cotton   │ Proj-A  │ 100 │ Pending │ View  │  ║
║  │ MRN002 │ Silk     │ Proj-B  │  50 │ Approved│ View  │  ║
║  │ MRN003 │ Poly     │ Proj-A  │  75 │ In Prog │ View  │  ║
║  │ MRN004 │ Rayon    │ Proj-C  │  25 │ Pending │ View  │  ║
║  │ MRN005 │ Canvas   │ Proj-B  │ 200 │ In Prog │ View  │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                            ║
║  ═════════════════════════════════════════════════════════ ║
║  🏭 PAST ORDERS/REQUESTS (3)  ▶ SHOW                      ║
║  Completed, Fulfilled, Rejected, or Cancelled              ║
║  ═════════════════════════════════════════════════════════ ║
║                                                            ║
║  [Hidden until user clicks ▶ SHOW]                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### After Clicking "▶ SHOW Past Requests"

```
╔════════════════════════════════════════════════════════════╗
║  ═════════════════════════════════════════════════════════ ║
║  🏭 PAST ORDERS/REQUESTS (3)  ▼ HIDE                      ║
║  Completed, Fulfilled, Rejected, or Cancelled              ║
║  ═════════════════════════════════════════════════════════ ║
║                                                            ║
║  📊 TABLE VIEW (Gray Background)                           ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ Req #  │ Material │ Project │ Qty │ Status  │ Action│  ║
║  ├─────────────────────────────────────────────────────┤  ║
║  │ MRN101 │ Linen    │ Proj-D  │ 150 │ ✓Fulfilled   │ View│  ║
║  │ MRN102 │ Denim    │ Proj-E  │ 100 │ ✗Rejected    │ View│  ║
║  │ MRN103 │ Twill    │ Proj-F  │  80 │ ✗Cancelled   │ View│  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                            ║
║  [All rows have gray background to distinguish from active]║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## View Mode Comparison

### Table View

#### Active Requests
```
┌─────────────────────────────────────────────────────┐
│ WHITE BACKGROUND (Active)                           │
│                                                     │
│ Request # │ Material    │ Status │ Priority │ Date  │
├─────────────────────────────────────────────────────┤
│ MRN-001   │ Cotton      │ ✓Approved  │ High │ 1/15 │
│ MRN-002   │ Polyester   │ ⏱ Pending  │ Med  │ 1/14 │
└─────────────────────────────────────────────────────┘
```

#### Past Requests
```
┌─────────────────────────────────────────────────────┐
│ GRAY BACKGROUND (Past/Archived)                    │
│                                                     │
│ Request # │ Material    │ Status │ Priority │ Date  │
├─────────────────────────────────────────────────────┤
│ MRN-101   │ Silk        │ ✓Fulfilled │ High │ 1/10 │
│ MRN-102   │ Rayon       │ ✗Rejected  │ Med  │ 1/08 │
└─────────────────────────────────────────────────────┘
```

### Card View

#### Active Request Card
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🟢 MRN-001                       ┃  ← Green Icon (Active)
┃ Created: Jan 15, 2025            ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Status: ✓ APPROVED   │ Priority: HIGH
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Cotton Fabric                    ┃
┃ 📋 Project: ProjectA             ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Qty: 100 meters │ Issued: 50    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ [━━━━━━━ View Details ━━━━━━━━]  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

#### Past Request Card (Archived)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ← Slightly faded
┃ ✓ MRN-101                        ┃  (opacity: 85%)
┃ Created: Jan 10, 2025            ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Status: ✓ FULFILLED │ Priority: HIGH
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Silk Fabric                      ┃
┃ 📋 Project: ProjectD             ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Qty: 150 meters │ Issued: 150    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ [━━━━━━━ View Details ━━━━━━━━]  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ← Increases to 100% on hover
```

## Status Badge Color Coding

### All Status Types

```
ACTIVE REQUESTS:
┌──────────────────────────────────────────────────────┐
│ Status Name          │ Color  │ Icon │ Meaning      │
├──────────────────────────────────────────────────────┤
│ Pending              │ 🟡 Yel │ ⏱   │ Awaiting     │
│ Approved             │ 🟢 Grn │ ✓   │ Ready        │
│ In Progress          │ 🟢 Grn │ ▶   │ Processing   │
│ Pending Inv Review   │ 🟡 Yel │ ⏱   │ Awaiting     │
│ Partially Fulfilled  │ 🟠 Org │ ▶   │ Partial      │
└──────────────────────────────────────────────────────┘

PAST REQUESTS:
┌──────────────────────────────────────────────────────┐
│ Status Name          │ Color  │ Icon │ Meaning      │
├──────────────────────────────────────────────────────┤
│ Fulfilled            │ 🟢 Grn │ ✓   │ Complete ✓   │
│ Completed            │ 🟢 Grn │ ✓   │ Complete ✓   │
│ Rejected             │ 🔴 Red │ ✗   │ Denied ✗     │
│ Cancelled            │ 🔴 Red │ ✗   │ Cancelled ✗  │
└──────────────────────────────────────────────────────┘
```

## User Interaction Flow

### Scenario 1: Finding an Active Request

```
START: Page Loads
   ↓
┌─────────────────────────────────┐
│ User sees Active Requests       │
│ (Always visible by default)     │
└─────────────────────────────────┘
   ↓
┌─ Search for "MRN-001" ─────────┐
│ OR                              │
│ Filter by Status: "Pending"     │
│ OR                              │
│ Filter by Project: "ProjectA"   │
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│ Results shown in table/cards    │
│ Click "View Details" to see more│
└─────────────────────────────────┘
   ↓
END: Request details displayed
```

### Scenario 2: Viewing Past Orders

```
START: Page Loads
   ↓
┌─────────────────────────────────┐
│ Past Requests section hidden    │
│ Shows "▶ SHOW" button           │
└─────────────────────────────────┘
   ↓
┌─ Click "▶ SHOW Past Requests" ─┐
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│ Section expands                 │
│ Shows "▼ HIDE" button           │
│ Displays past requests          │
│ (Table or Card view)            │
└─────────────────────────────────┘
   ↓
┌─ Optional: Search/Filter ───────┐
│ OR                              │
│ Click View to see full details  │
└─────────────────────────────────┘
   ↓
END: Request details displayed
```

## Toggle Button States

### Button State 1: Past Requests Hidden
```
┌──────────────────────────────────────────┐
│ 🏭 PAST ORDERS/REQUESTS (3)  ▶ SHOW      │
│    <-- Gray background                   │
│    <-- Arrow points RIGHT                │
└──────────────────────────────────────────┘
          Click to toggle
                 ↓
    Content becomes visible
```

### Button State 2: Past Requests Visible
```
┌──────────────────────────────────────────┐
│ 🏭 PAST ORDERS/REQUESTS (3)  ▼ HIDE      │
│    <-- Dark gray background              │
│    <-- Arrow points DOWN                 │
└──────────────────────────────────────────┘
          Click to toggle
                 ↓
    Content becomes hidden
```

## Mobile vs Desktop Layout

### Desktop (1024px+)
```
┌──────────────────────────────────────────┐
│ Active Requests                          │
│ ┌────────────────┐ ┌────────────────┐   │
│ │ Card 1         │ │ Card 2         │   │
│ │ (2 columns)    │ │ (2 columns)    │   │
│ └────────────────┘ └────────────────┘   │
│                                          │
│ Past Orders/Requests (Hidden)            │
│ [Click to expand]                        │
└──────────────────────────────────────────┘
```

### Tablet (768px-1023px)
```
┌──────────────────────┐
│ Active Requests      │
│ ┌────────────────┐   │
│ │ Card 1         │   │
│ │ (2 columns)    │   │
│ └────────────────┘   │
│ ┌────────────────┐   │
│ │ Card 2         │   │
│ └────────────────┘   │
│                      │
│ Past Orders/Requests │
│ [Click to expand]    │
└──────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────────┐
│ Active Requests    │
│ ┌────────────────┐ │
│ │ Card 1         │ │
│ │ (1 column)     │ │
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │ Card 2         │ │
│ └────────────────┘ │
│                    │
│ Past Orders        │
│ [Click ▶ SHOW]     │
└────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────┐
│ API: Fetch Material Requests                │
└──────────────────┬──────────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  All Requests Array  │
        │  [8 total requests]  │
        └──────────────┬───────┘
                       ↓
         ┌─────────────────────────────┐
         │ Apply Filters & Search      │
         │ (Status, Priority, Project) │
         └──────────────┬──────────────┘
                        ↓
         ┌──────────────────────────┐
         │ Filtered Requests Array  │
         │ [8 total after filters]  │
         └────────┬──────────┬──────┘
                  ↓          ↓
         ┌────────────────────────────┐
         │ Separate by Status         │
         └────────┬───────────────────┘
                  ↓
        ┌─────────────────────────────────────┐
        │          Active Requests (5)        │
        │  - Pending (2)                      │
        │  - Approved (2)                     │
        │  - In Progress (1)                  │
        │                                     │
        │  ✓ ALWAYS VISIBLE                   │
        │  ✓ Shown in table/cards by default  │
        └─────────────────────────────────────┘
        
        ┌─────────────────────────────────────┐
        │      Past Requests (3)              │
        │  - Fulfilled (1)                    │
        │  - Rejected (1)                     │
        │  - Cancelled (1)                    │
        │                                     │
        │  ✓ HIDDEN by default                │
        │  ✓ Click ▶ SHOW to view             │
        │  ✓ Shown in gray styling            │
        └─────────────────────────────────────┘
```

## Filter Impact Visualization

### No Filters Applied
```
Active Requests (5)
├─ Pending (2)
├─ Approved (2)
└─ In Progress (1)

Past Requests (3)
├─ Fulfilled (1)
├─ Rejected (1)
└─ Cancelled (1)
```

### Filter: Status = "Fulfilled"
```
Active Requests (0)
└─ [No active fulfilled requests]

Past Requests (1)
└─ Fulfilled (1) ✓
```

### Filter: Priority = "High"
```
Active Requests (2)
├─ Pending (1)
└─ Approved (1)

Past Requests (1)
└─ Rejected (1)
```

### Filter: Project = "ProjectA"
```
Active Requests (3)
├─ Pending (1)
├─ Approved (1)
└─ In Progress (1)

Past Requests (1)
└─ Fulfilled (1)
```

## Search Results Highlighting

### Active Search: "Cotton"
```
Active Requests Section:
┌─────────────────────┐
│ MRN-001             │
│ Cotton Fabric    ← MATCH (highlighted in results)
│ Status: Pending     │
└─────────────────────┘

Past Requests Section (if expanded):
┌─────────────────────┐
│ MRN-051             │
│ Cotton Blend     ← MATCH (highlighted in results)
│ Status: Fulfilled   │
└─────────────────────┘
```

## Statistics Update Flow

```
Initial Statistics:
Total: 8 | Pending: 2 | Approved: 3 | Fulfilled: 2 | Active: 5 | Past: 3

After Filtering by Status="Pending":
Total: 2 | Pending: 2 | Approved: 0 | Fulfilled: 0 | Active: 2 | Past: 0

After Filtering by Status="Fulfilled":
Total: 1 | Pending: 0 | Approved: 0 | Fulfilled: 1 | Active: 0 | Past: 1
```

## Color Reference Guide

```
Active Section Colors:
┌───────────────────────────────────────┐
│ Icon: 📋 FaClipboardList (Blue)       │
│ Header Text: Dark Gray                │
│ Card Header: Purple Gradient          │
│ Card Border: Purple Left (4px)        │
│ Card Body: White                      │
│ Table Body: White                     │
└───────────────────────────────────────┘

Past Section Colors:
┌───────────────────────────────────────┐
│ Icon: 🏭 FaWarehouse (Gray)           │
│ Header Text: Dark Gray                │
│ Card Header: Gray Gradient            │
│ Card Border: Gray Left (4px)          │
│ Card Body: White                      │
│ Table Body: Gray-50                   │
│ Opacity: 85% (normal), 100% (hover)   │
└───────────────────────────────────────┘

Status Badges:
┌───────────────────────────────────────┐
│ Fulfilled ✓        → 🟢 Green (#10b981)
│ Pending ⏱          → 🟡 Yellow (#f59e0b)
│ Rejected ✗         → 🔴 Red (#ef4444)
│ Cancelled ✗        → 🔴 Red (#ef4444)
│ Approved ✓         → 🟢 Green (#10b981)
│ In Progress ▶      → 🔵 Blue (#3b82f6)
└───────────────────────────────────────┘
```

---

**Visual Guide Version**: 1.0  
**Last Updated**: January 2025  

This guide provides visual representations of all UI elements, layouts, and user interactions in the Past Orders/Requests feature.