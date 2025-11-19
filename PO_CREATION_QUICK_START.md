# PO Creation - Quick Start Guide

## The 3-Step Process

### STEP 1️⃣: SELECT PROJECT
```
┌─────────────────────────────────────────┐
│  Create Purchase Order                  │
│  Step 1: Select Project                 │
├─────────────────────────────────────────┤
│                                         │
│  Select Project *                       │
│  [Dropdown ▼]                           │
│  -- Choose a Project --                 │
│  > Project A                            │
│  > Project B                            │
│  > Project C                            │
│                                         │
│  ✓ Selected: Project B                  │
│  Found 3 sales order(s) for this...     │
│                                         │
├─────────────────────────────────────────┤
│  [Cancel]           [Next ▶]            │
└─────────────────────────────────────────┘
```

**What happens:**
- Opens with all projects from database
- Shows count of available SOs for selected project
- "Next" button enables after project selection

---

### STEP 2️⃣: SELECT SALES ORDER
```
┌─────────────────────────────────────────┐
│  Create Purchase Order                  │
│  Step 2: Select Sales Order             │
├─────────────────────────────────────────┤
│                                         │
│  [Search field]                         │
│  [Status Filter ▼] [Clear]              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ SO-001                    Draft  │   │
│  │ Customer: ABC Corp              │   │
│  │ Quantity: 500    PO Count: 0    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ SO-002 (SELECTED)      Confirmed │  │
│  │ Customer: XYZ Ltd               │  │
│  │ Quantity: 1000   PO Count: 2    │  │
│  │ ℹ️ 2 PO(s) already created...  │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ SO-003                   Draft  │   │
│  │ Customer: DEF Inc               │   │
│  │ Quantity: 750    PO Count: 0    │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  [Back to Projects]    [Next ▶]        │
└─────────────────────────────────────────┘
```

**What happens:**
- Shows ONLY SOs for selected project
- Can search by order number or customer
- Can filter by status
- Click SO to select it (blue highlight)
- "Next" button enables after SO selection

---

### STEP 3️⃣: CONFIGURE PO DETAILS
```
┌─────────────────────────────────────────┐
│  Create Purchase Order                  │
│  Step 3: Configure PO Details           │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Project: Project B               │  │
│  │ Sales Order: SO-002              │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Project Name *                         │
│  [Project B]  (readonly)                │
│                                         │
│  Vendor *                               │
│  [Select vendor ▼]                      │
│  > Vendor A                             │
│  > Vendor B (SELECTED)                  │
│  > Vendor C                             │
│                                         │
│  Material Type                          │
│  ○ Fabric  ● Accessories               │
│                                         │
├─────────────────────────────────────────┤
│  [Back]              [Create PO ▶]     │
└─────────────────────────────────────────┘
```

**What happens:**
- Shows summary of selections
- Project name is read-only
- Select vendor from dropdown (required)
- Choose material type: Fabric or Accessories
- "Create PO" navigates to create form with pre-filled data

---

### STEP 4️⃣: REVIEW & SUBMIT
```
CREATE PURCHASE ORDER FORM

Vendor & Order Information:
- Vendor: [Vendor B] ✓ (pre-filled)
- Project Name: Project B ✓ (pre-filled)
- Customer: [Auto-filled from SO]
- PO Date: [Today's date]
- Expected Delivery: [Auto-filled from SO]

Order Items: (Advanced Builder)
- All items from SO auto-populated
- Type: Accessories ✓ (based on selection)
- Can add/edit/remove items

Financial Details:
- Payment terms, special instructions, etc.

[Save as Draft]  [Submit]
```

**What happens:**
- Form pre-filled with all selections
- SO items auto-loaded and mapped to material type
- User can review and edit any field
- Submit to create PO

---

## Feature Highlights

### 🎯 Project Selection
- ✓ All projects loaded from database
- ✓ Shows availability of SOs per project
- ✓ Clean dropdown interface

### 📋 Sales Order Selection
- ✓ Filtered by selected project
- ✓ Shows customer, quantity, PO count
- ✓ Search and status filter available
- ✓ Visual feedback (blue highlight on select)
- ✓ Indicates if POs already exist

### ⚙️ Configuration
- ✓ Vendor dropdown (all suppliers)
- ✓ Material type selection (Fabric/Accessories)
- ✓ Read-only project confirmation
- ✓ Shows summary of selections

### 📝 Form Pre-filling
- ✓ Vendor auto-selected in create form
- ✓ Project name auto-filled
- ✓ Material type determines item structure
- ✓ SO items auto-populated and mapped

---

## Common Workflows

### Creating Multiple POs from Same SO
1. Select Project → Select SO → Configure (Vendor A, Fabric) → Create
2. After successful creation, repeat:
   - Click "Create PO" again
   - Select same project
   - Select same SO (will show PO count = 1)
   - Select different vendor or material type
   - Create second PO

### Creating PO for Different Material
1. Select Project → Select SO → Configure
2. Choose different material type (Accessories instead of Fabric)
3. System automatically maps items correctly
4. Submit

### Reviewing Before Creation
1. Complete steps 1-3
2. Form opens with all pre-filled data
3. Review vendor, material type, items
4. Edit if needed
5. Submit

---

## Tips & Best Practices

### ✅ Do's
- Always verify project before selecting SO
- Double-check vendor selection
- Confirm material type matches SO items
- Review items before submitting
- Use search to find specific SOs quickly

### ❌ Don'ts
- Don't assume SO belongs to selected project
- Don't create PO with wrong vendor
- Don't forget material type affects item structure
- Don't submit without vendor selection

---

## Troubleshooting

### ❓ Don't see projects?
- Check sales orders exist in database
- Ensure SOs have `project_name` populated
- Refresh page and try again

### ❓ Don't see sales orders?
- Verify project is selected
- Check SO status is "Draft" or "Confirmed"
- Check SO has `ready_for_procurement = true`

### ❓ Form shows wrong material type?
- Go back to step 3
- Re-select correct material type
- Proceed to form again

### ❓ Items not auto-populating?
- Check SO has items in database
- Verify items are mapped correctly
- Check SO items have required fields

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Navigate between fields |
| Enter | Submit/Next (when enabled) |
| Esc | Close modal |

---

## Data Fields Reference

**From Project Selection:**
- Project Name → Used in form header

**From Sales Order Selection:**
- SO ID → Linked to PO
- SO Items → Auto-populate PO items
- SO Customer → Auto-fill customer info
- SO Delivery Date → Auto-fill expected delivery

**From Configuration:**
- Vendor ID → Assign vendor to PO
- Material Type → Structure items as Fabric or Accessories

---

## Next Steps After PO Creation

After creating PO, you can:
1. ✓ View PO in list
2. ✓ Send to vendor (if approved)
3. ✓ Track delivery
4. ✓ Receive goods
5. ✓ Create GRN

---

## Need Help?

**Still confused?**
- Review the 3-step diagram above
- Check "Troubleshooting" section
- Test with sample data first
- Contact admin for DB issues
