# Approved Productions - Quick Guide

## 🎯 Where to Find It

**Location:** Production Orders Page  
**Navigation:** Sidebar → Manufacturing → **Production Orders**

## 📍 Page Layout

```
Production Orders Page
│
├── 🟢 Approved Productions Section (Top)
│   ├── Shows materials ready to start production
│   ├── Green gradient background
│   └── Action buttons: [Start Production] [View]
│
└── 📦 Existing Production Orders (Below)
    ├── Shows all created production orders
    └── Standard table with filters
```

## ✨ Features

### Approved Productions Section

| Feature | Description |
|---------|-------------|
| **Visual Style** | Green gradient background with green border |
| **Count Badge** | Shows number of ready approvals (e.g., "5 Ready") |
| **Table Columns** | Approval #, Project, MRN, Materials, Approved By, Date, Actions |
| **Material Preview** | Shows first 2 materials + count (e.g., "+3 more") |
| **Empty State** | Friendly message when no approvals exist |

### Action Buttons

| Button | Color | Action |
|--------|-------|--------|
| **Start Production** | 🟢 Green | Opens Production Wizard with pre-filled data |
| **View** | ⚪ Gray | Opens approval details page |

## 🔄 Workflow

```
1. Materials Dispatched → Received → Verified → Approved
                                                    ↓
2. Appears in "Approved Productions" section
                                                    ↓
3. Click "Start Production" button
                                                    ↓
4. Production Wizard opens with auto-filled data
                                                    ↓
5. Create production order
                                                    ↓
6. Order appears in "Existing Production Orders" section below
```

## 📊 What You See

### Approved Productions Table

```
┌──────────────┬──────────────┬────────────┬──────────────┬──────────┬───────────┬──────────┐
│ Approval #   │ Project Name │ MRN Request│ Materials    │Approved By│ Date/Time │ Actions  │
├──────────────┼──────────────┼────────────┼──────────────┼──────────┼───────────┼──────────┤
│ PRD-APV-     │ Summer       │ MRN-       │ 5 items      │ John Doe │ 01/15/2025│ [Start]  │
│ 20250115-001 │ Collection   │ 20250115-  │ • Fabric     │          │ 2:30 PM   │ [View]   │
│ ✓ Approved   │ SO: SO-001   │ 00001      │ • Thread     │          │           │          │
│              │              │            │ +3 more      │          │           │          │
└──────────────┴──────────────┴────────────┴──────────────┴──────────┴───────────┴──────────┘
```

## 🚀 Quick Actions

### To Start Production:
1. Go to **Production Orders** page
2. Find approval in top section (green background)
3. Click **"Start Production"** button
4. Production Wizard opens with data pre-filled
5. Review and submit

### To View Details:
1. Click **"View"** button on any approval
2. See complete material and verification details
3. Review before starting production

## 📱 What Changed?

### Before:
- Approved productions were in **Manufacturing Dashboard** tab
- Had to navigate through 9 tabs
- Mixed with dashboard monitoring data

### After:
- Approved productions are on **Production Orders** page
- Dedicated section at the top
- Logical placement with order creation
- Dashboard is cleaner (8 tabs now)

## 🔍 Empty State

When no approved productions exist:

```
┌─────────────────────────────────┐
│    ✓ (Large checkmark icon)     │
│                                 │
│  No Approved Productions        │
│                                 │
│  Approved materials will        │
│  appear here, ready to          │
│  start production               │
└─────────────────────────────────┘
```

## 📋 Data Shown

Each approval row displays:

1. **Approval Number** - Unique identifier (e.g., PRD-APV-20250115-00001)
2. **Status Badge** - Green "✓ Approved" badge
3. **Project Name** - From material request
4. **Sales Order** - Link to originating sales order
5. **MRN Request** - Material request number
6. **Materials** - First 2 items + total count
7. **Approved By** - Name of approving manager
8. **Date & Time** - When approval was given

## 🎨 Visual Indicators

| Element | Style | Meaning |
|---------|-------|---------|
| Green background | Gradient from green-50 to emerald-50 | Ready for action |
| Green badge | "✓ Approved" | Approval status confirmed |
| Count badge | White text on green | Number of ready items |
| Material list | Truncated with "+X more" | Shows sample items |

## 💡 Tips

1. **Check regularly** - New approvals appear automatically after verification
2. **Start promptly** - Approved materials are waiting in manufacturing
3. **Review before starting** - Use "View" button to check details
4. **Track progress** - Started orders move to "Existing Orders" section below
5. **Use filters** - Search existing orders by number or product

## 🔗 Related Pages

- **Production Wizard** - Create new production orders (auto-filled from approvals)
- **Material Receipt** - Receive materials from inventory
- **Material Verification** - Verify material quality
- **Production Approval** - Approve materials for production (manager only)

## ❓ Common Questions

**Q: Where did the approved productions go?**  
A: They moved from Manufacturing Dashboard to Production Orders page (top section).

**Q: How do I start production?**  
A: Click green "Start Production" button, wizard opens with pre-filled data.

**Q: What happens after I start production?**  
A: Approval is marked as "production started" and order appears below in Existing Orders.

**Q: Can I see approval details before starting?**  
A: Yes, click gray "View" button to review all details.

**Q: Why the change?**  
A: Better organization - Production Orders page is for order management, Dashboard is for monitoring.

---
**Updated:** January 2025  
**Page:** `/manufacturing/orders`  
**Status:** ✅ Active