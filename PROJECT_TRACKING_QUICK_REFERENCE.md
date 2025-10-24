# Project-Based Tracking - Quick Reference Guide

## What Changed?

### 🎯 Core Changes

| Area | Before | After |
|------|--------|-------|
| **Production Wizard** | Required product selection | Uses project name only |
| **Materials Selection** | Manual product picking | Auto-loads from project |
| **Data Key** | Multiple identifiers | Project name (SO-001, etc.) |
| **Dashboard View** | Cards only | Cards + Table view |
| **Stage Tracking** | View only | Full CRUD with buttons |

---

## 🚀 How to Use

### Production Wizard (Creating Production Orders)

**Old Way:**
```
1. Select Order
2. Select Primary Product ← REQUIRED
3. Select Associated Products ← REQUIRED  
4. Verify Materials
5. Continue...
```

**New Way:**
```
1. Select Approved Order (by project name)
   ↓ All materials auto-load ✨
2. Verify Materials (quantities, units)
3. Continue...
```

**What Users Should Do:**
- Go to Production Wizard
- In "Select Order" step, pick the approved order
- Move to "Materials" step
- ✅ Materials already loaded from project!
- No product selection boxes to fill
- Just verify the quantities match
- Submit order

---

### Production Dashboard (Viewing & Managing)

**New Feature: Stage Tracking Table**

**View Options:**
```
Top right of "Active Production Orders" section:
┌─────────────────────────┐
│ Cards View │ Table View │ ← NEW!
└─────────────────────────┘
```

**Table View Shows:**
| Column | What You See |
|--------|-------------|
| Project | Production ID + Sales Order # |
| Stage | Current production stage (Cutting, Stitching, etc.) |
| Status | pending, in_progress, on_hold, completed |
| Progress | Visual bar showing progress |
| Quantities | Processed, Approved, Rejected counts |
| Start Time | When stage started |
| End Time | When stage will/did end |
| Actions | Start, Pause, Complete buttons |

**Stage Control Buttons:**
```
Pending Stage:        [START]
In Progress Stage:    [PAUSE]  [COMPLETE]
On Hold Stage:        [RESUME] [COMPLETE]
```

---

## 📊 Data Fetching Pattern

### Before (Multiple Keys)
```
Sales Order #: SO-001
Product ID: 123
Material Codes: FABRIC-001, THREAD-002
```

### After (Single Project Key)
```
Project Name: SO-001
(All related data auto-fetched)
```

---

## ✅ Testing Checklist

### Wizard Testing
- [ ] Open Production Wizard
- [ ] No product selection boxes visible
- [ ] Select an approved order
- [ ] Materials automatically appear
- [ ] Can complete without selecting products
- [ ] Production order created successfully

### Dashboard Testing
- [ ] Open Production Dashboard
- [ ] See "Table View" button (top right of Active Orders)
- [ ] Click "Table View"
- [ ] See all active orders in table format
- [ ] See current stage for each order
- [ ] Click "Start" on a pending stage
- [ ] Button shows loading state
- [ ] Stage status updates to "in_progress"
- [ ] Can click "Pause" on in-progress stage
- [ ] Can click "Complete" to finish stage

---

## 🔍 Data Flow

```
1. User Creates Sales Order
   └─ Adds: Project/Order Title

2. User Creates Production Approval
   └─ References: Sales Order
   └─ Materials auto-gathered

3. User Creates Production Order (via Wizard)
   ├─ Step 1: Select Approved Order (by project)
   ├─ Step 2: Materials auto-load ✨
   ├─ Step 3-7: Fill other details
   └─ Result: Production Order created with project_reference

4. Production Dashboard Shows
   ├─ All orders for this project
   ├─ Current stage of each
   └─ Real-time status tracking

5. User Can Manage Stages
   ├─ Click Start/Pause/Complete
   └─ Status updates instantly
```

---

## 📱 Mobile vs Desktop

### Desktop
- **Cards View:** Good overview of all orders
- **Table View:** Full stage details and quick actions
- **Modal:** Click "View" for detailed breakdown

### Mobile
- **Cards View:** Recommended (easier to scroll)
- **Table View:** Available with horizontal scroll
- **Modal:** Adapt to mobile screen size

---

## 🎨 Visual Indicators

### Status Colors
```
🔵 Pending       → Gray
🟢 In Progress   → Green
🟡 On Hold       → Yellow  
🟢 Completed     → Green
🔴 Cancelled     → Red
```

### Progress Bar
```
Not Started:  [░░░░░░░░░░]
In Progress:  [██░░░░░░░░]
Completed:    [██████████]
```

---

## ❓ Common Questions

### Q: Why don't I see product selection in the wizard?
**A:** Product selection was removed because the project (sales order) already contains all materials needed. Materials auto-load based on the project.

### Q: How do I know which materials are for my project?
**A:** Select the approved order in Step 1, and all its materials auto-populate in the Materials step.

### Q: Can I use Table View on mobile?
**A:** Yes, it scrolls horizontally on smaller screens. Cards View is more mobile-friendly.

### Q: What happens when I click "Start"?
**A:** The stage status changes to "in_progress" and the button changes to "Pause" and "Complete" options.

### Q: Can I undo a stage action?
**A:** Yes, you can use "Pause" to put a stage on hold, or select a different status if needed.

### Q: Where is my production order data stored?
**A:** It's linked to the project name (sales order number) which you select in Step 1 of the wizard.

---

## 🔗 Related Pages

- **Production Wizard:** `/manufacturing/wizard`
- **Production Dashboard:** `/manufacturing`
- **Production Tracking:** `/manufacturing/tracking`
- **Production Operations:** `/manufacturing/operations/{id}`

---

## 🐛 Troubleshooting

### Materials not showing in wizard?
1. Check if you selected an approved order in Step 1
2. Verify the order has materials attached
3. Clear cache and reload if needed

### Table View not working?
1. Check if there are active production orders
2. Try switching to Cards View then back
3. Refresh the page

### Stage buttons not responding?
1. Check your permissions
2. Verify the stage status (buttons only show for specific statuses)
3. Check browser console for errors

---

## 📞 Need Help?

- **Documentation:** See `PROJECT_BASED_TRACKING_IMPLEMENTATION.md`
- **API Issues:** Check backend endpoints
- **UI Issues:** Clear browser cache, try incognito mode
- **Data Issues:** Verify production approval has materials

---

**Last Updated:** January 2025  
**Version:** 1.0 - Quick Reference