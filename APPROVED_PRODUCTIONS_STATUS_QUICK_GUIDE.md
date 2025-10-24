# Approved Productions - Status Tracking Quick Guide

## 🎯 What's New?

Approved productions now show their **current production status** so you know:
- ✅ If production already started
- ⚠️ Why "Start Production" button is disabled
- 🔍 Where to find the linked production order
- 📊 Overall project progress

---

## 📊 Status Meanings

### 🟢 **Ready to Start** (Green)
```
Status: No production order exists yet
Action: Click "Start Production" to create a new order
Button: Enabled & Clickable
```

### 🟡 **Pending Start** (Yellow)
```
Status: Production order created but not started
Action: Order exists but hasn't begun
Button: Disabled (waiting for manual start)
```

### 🟠 **In Production** (Orange)
```
Status: Production order is actively running
Action: Click "View Production" to see progress
Button: Shows current stages and status
```

### 🔵 **Completed** (Blue)
```
Status: All production orders for this project are done
Action: Review finished order results
Button: Disabled (project complete)
```

---

## 👀 Where to See Status

### Location 1: Project Header (Collapsed View)
```
┌────────────────────────────────────────┐
│ ✓ Approved Productions Ready  [3] ▼   │  ← Click to expand
│   3 projects with 5 approvals          │
└────────────────────────────────────────┘
                ↓ Expand ↓
┌────────────────────────────────────────┐
│ 🔵 Project A (SO-001)  [3] 🟢 Ready    │
│                        [Start Production]
└────────────────────────────────────────┘
```

The **colored badge** (🟢 🟡 🟠 🔵) shows project status

### Location 2: Individual Approvals (Expanded View)
```
┌─────────────────────────────────────┐
│ #1  APP-001  ✓ Approved  🟠 In Prod │
│ By John Doe • 1/15/2024             │
│ → Order: PO-2024-001  [View Order]  │
│                                      │
│ #2  APP-002  ✓ Approved             │
│ By Jane Smith • 1/16/2024  [View]   │
└─────────────────────────────────────┘
```

Each approval may have its own status badge if linked to an order.

---

## 🎬 Common Scenarios

### Scenario 1: Fresh Approval (Just Approved)

**What You See:**
```
✓ Project A (SO-001) 🟢 Ready to Start [3 approvals]
#1 APP-001 ✓ Approved
#2 APP-002 ✓ Approved
[Start Production Button]
```

**What To Do:**
1. Click "Start Production"
2. Follow the wizard to create production order
3. Status changes to 🟡 Pending Start

---

### Scenario 2: Production Already Running

**What You See:**
```
✓ Project A (SO-001) 🟠 In Production [3 approvals]
#1 APP-001 ✓ Approved 🟠 In Production
   By User • Date → Order: PO-2024-001
#2 APP-002 ✓ Approved
[View Production Button]
```

**What To Do:**
1. Click "View Production" to see current status
2. Check production stages and progress
3. If you need to process another approval, create new order

---

### Scenario 3: Multiple Approvals, Mixed Status

**What You See:**
```
✓ Project A (SO-001) 🟠 In Production [3 approvals]

#1 APP-001 ✓ Approved 🟠 In Production
   → Order: PO-2024-001  [View Order]

#2 APP-002 ✓ Approved 🔵 Completed
   → Order: PO-2024-002  [View Order]

#3 APP-003 ✓ Approved
   [View]
```

**What To Do:**
- Each approval processed as separate order
- Click "View Order" to check specific approval's order
- Create new order for APP-003 if needed

---

### Scenario 4: Production Complete

**What You See:**
```
✓ Project A (SO-001) 🔵 Completed [3 approvals]
#1 APP-001 ✓ Approved 🔵 Completed
   → Order: PO-2024-001
#2 APP-002 ✓ Approved 🔵 Completed
   → Order: PO-2024-002
#3 APP-003 ✓ Approved 🔵 Completed
   → Order: PO-2024-003
[Completed Button - Disabled]
```

**What To Do:**
- Project is finished
- Review completed orders
- Archive or close project

---

## 🔘 Button Behavior

### Project-Level Button

```
Status: 🟢 Ready
┌─────────────────────────┐
│ ▶ Start Production      │  ← ENABLED (Blue)
│ (Click to create order) │
└─────────────────────────┘

Status: 🟠 In Production
┌─────────────────────────┐
│ 👁 View Production      │  ← ENABLED (Orange)
│ (Click to see order)    │
└─────────────────────────┘

Status: 🟡 Pending / 🔵 Complete
┌─────────────────────────┐
│ ⏱ Pending Start         │  ← DISABLED (Gray)
│ or ✓ Completed         │
└─────────────────────────┘
```

### Per-Approval Button

```
No Order Yet:
[View] ← Check approval details

Linked to Order:
[View Order] ← Jump directly to production order
```

---

## ✨ Key Features

### 1️⃣ **Quick Status Check**
- Colored badges show status instantly
- No need to open each order separately

### 2️⃣ **Prevent Duplicates**
- Can't create order if one already exists
- Button disabled for projects "In Production"
- Clear visual indication

### 3️⃣ **Direct Navigation**
- "View Production" jumps to existing order
- "View Order" links from approval to order
- Single-click access

### 4️⃣ **Mixed Status Support**
- Handle multiple approvals
- Each can be in different stage
- Clear visibility of each approval's progress

---

## ❓ FAQ

### Q: Why is "Start Production" disabled?
**A:** Production order already exists for this project. Click "View Production" to check it.

### Q: I see both "Start Production" and "View Production" - which do I click?
**A:** 
- **"Start Production"** = Create a NEW order (for fresh approvals)
- **"View Production"** = Check EXISTING order (already in production)

### Q: Can I create multiple orders for one approval?
**A:** Yes, but each approval should have one order. If you need more, contact admin.

### Q: What does the arrow → Order: PO-2024-001 mean?
**A:** This approval is linked to production order PO-2024-001. Click "View Order" to see it.

### Q: Why are some approvals missing the status badge?
**A:** They haven't been used to create an order yet. Still ready to start!

### Q: How do I know when production finished?
**A:** Status changes to 🔵 Completed (blue). All buttons become disabled.

---

## 🎨 Color Reference

| Color | Icon | Meaning | Action |
|-------|------|---------|--------|
| 🟢 Green | ▶ Play | Ready to start | Click to create order |
| 🟡 Yellow | ⏱ Clock | Pending | Waiting to begin |
| 🟠 Orange | ⚙ Cog | In Progress | Click to view |
| 🔵 Blue | ✓ Check | Completed | View results |

---

## 🚀 Workflow Example

```
1. Material Approved
   Status: 🟢 Ready to Start
   
   ↓ Click "Start Production"
   
2. Order Created
   Status: 🟡 Pending Start
   
   ↓ Start production (manual trigger)
   
3. Production Running
   Status: 🟠 In Production
   Click "View Production" to see stages
   
   ↓ Stages complete
   
4. Production Done
   Status: 🔵 Completed
   Review finished order
```

---

## 💡 Pro Tips

✅ **Always check status first** before creating new orders  
✅ **Use "View Production"** to track progress without leaving page  
✅ **Check order number** (PO-XXXX) if you need to reference it  
✅ **Click individual "View Order"** for approval-specific details  
✅ **Expand section** to see full approval details and status  

---

## 🆘 Troubleshooting

### Status shows "Ready" but I remember creating an order

**Solution:** Refresh the page - status data updates from backend. If still wrong, contact admin.

### Button is grayed out and I need to start production

**Solution:** Status is "Pending Start" (order exists but not started). Click "View Production" to manually start it.

### Can't find the linked order after clicking "View Order"

**Solution:** The order details should open. If not, try:
1. Refresh page
2. Check the order number shown (PO-XXXX)
3. Find it in "Existing Production Orders" section

### Status incorrect for completed orders

**Solution:** Status updates when orders are marked complete. If outdated, refresh page or contact admin.

---

## 📞 Need Help?

- **Status seems wrong?** → Refresh page
- **Button not responding?** → Check status color (may be disabled)
- **Can't find order?** → Check order number reference
- **Other issues?** → Contact Manufacturing Admin

---

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** ✅ Active
