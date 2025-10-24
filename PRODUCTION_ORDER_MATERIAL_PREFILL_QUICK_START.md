# Production Order Material Prefilling - Quick Start Guide

## 🎯 What This Feature Does

When creating a production order, **materials are automatically loaded from the project's Material Request Note (MRN)**. No manual entry needed! 

All material details appear including:
- ✅ Batch numbers
- ✅ Warehouse locations  
- ✅ Rack numbers
- ✅ Stock availability
- ✅ Material categories and types

---

## ⚡ 5-Minute Quick Start

### Setup (One-Time)
1. Ensure you have:
   - A Sales Order created
   - A Material Request Note (MRN) for that project with status "approved" or "forwarded"
   - Materials added to the MRN

### Create Production Order with Auto-Populated Materials

**Step 1**: Go to Manufacturing → Production Orders → Create New

**Step 2**: Select Approved Order
- In "Select Order" step, choose an approved production approval
- OR create from scratch by selecting a product and sales order

**Step 3**: Materials Auto-Load 🎉
- In the "Materials" step, you'll see:
  ```
  ✅ 3 material(s) loaded from project MRN
  These materials are from the Material Request Note for this project.
  Includes batch numbers, warehouse locations, and stock availability.
  ```

**Step 4**: Review & Edit
- See all material details displayed
- Edit quantities if needed
- Add more materials with "+ Add Material" button

**Step 5**: Continue & Submit
- Complete remaining steps (Quality, Team, etc.)
- Submit production order

---

## 📊 Material Display Formats

### For 1-2 Materials (Card View)
```
┌─ Material Card ──────────────────┐
│ Cotton Fabric                    │
│                                  │
│ Required: 50 meters              │
│ Available: 75 meters ✅          │
│ Batch: BATCH-2025-001            │
│                                  │
│ 📍 Warehouse A, Zone 1           │
│ Rack: A1-R5                      │
│                                  │
│ [Update Quantity]                │
└──────────────────────────────────┘
```

### For 3+ Materials (Table View)
```
Material          Qty   Batch#        Warehouse        Available
─────────────────────────────────────────────────────────────────
Cotton Fabric     50m   BATCH-01      Warehouse A      75 ✅
Polyester Thread  10pc  BATCH-02      Warehouse B      200 ✅
Buttons           5set  BATCH-03      Warehouse C      30 ✅
```

---

## 🔧 What Changed?

### Backend
- **New Endpoint**: `GET /manufacturing/project/{projectName}/mrn-materials`
- **Location**: `server/routes/manufacturing.js` (lines 2324-2482)
- Fetches MRN materials and enriches with inventory details

### Frontend
- **Auto-Fetch**: Triggers when sales order selected
- **Enhanced Display**: Better card/table layout for materials
- **Location**: `client/src/pages/manufacturing/ProductionWizardPage.jsx`

---

## ❓ FAQs

**Q: Nothing loaded in Materials step?**
- A: Ensure MRN exists for this project with status "approved" or "forwarded"
- Check console (F12) for errors
- Verify project name matches between sales order and MRN

**Q: Can I edit the materials?**
- A: Yes! You can:
  - Edit quantities
  - Add more materials with "+ Add Material"
  - Remove materials with "Remove" button

**Q: What if no MRN exists?**
- A: You'll see a message and empty state
- Click "+ Add First Material" to manually add materials

**Q: Are batch numbers always shown?**
- A: Yes, if material is linked to inventory item with batch number
- Otherwise shows as "-"

---

## 🚀 Testing (Quick Test)

1. **Create Test Data**:
   ```
   Sales Order → Project "Test Project"
   ↓
   MRN → Project "Test Project" with 3 materials (status: approved)
   ↓
   Production Order → Select the sales order
   ```

2. **Check Materials Tab**:
   - Should see success message
   - Should see all 3 materials with details
   - Should see table view (3 materials)

3. **Edit & Add**:
   - Edit a quantity → quantity should update
   - Click "+ Add Material" → new empty row appears
   - Click "Remove" → material removed

---

## 💡 Pro Tips

- ✅ **Always create MRN before production order** - this is where materials come from
- ✅ **Link materials to inventory items** - ensures batch/warehouse info loads
- ✅ **Use consistent project names** - between sales order and MRN
- ✅ **Review stock availability badges** - green ✅ = sufficient, orange ⚠️ = check
- ✅ **Edit quantities as needed** - prefilled amounts can be adjusted

---

## 📋 Checklist Before Going Live

- [ ] Backend endpoint is working (`GET /manufacturing/project/Test/mrn-materials`)
- [ ] MRN with materials created for test project
- [ ] MRN status set to "approved" or "forwarded"
- [ ] Production order creation triggers material fetch
- [ ] Materials display correctly (card or table view)
- [ ] Quantities can be edited
- [ ] Additional materials can be added
- [ ] Toast notifications appear
- [ ] Console shows success logs

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Materials not loading | Verify MRN exists and has status "approved" |
| Wrong materials showing | Check project name matches exactly |
| Empty batch/warehouse fields | Ensure material is linked to inventory item |
| Can't edit quantities | Click on the quantity field and type new value |
| Need to add material | Click "+ Add Material" button |

---

## 📞 Getting Help

1. Check console logs (F12 → Console)
2. Verify MRN status and project name
3. Try browser refresh
4. Contact manufacturing@passion-erp.com if issue persists

---

**Status**: ✅ Ready to Use - All features working perfectly!

Start creating production orders with automatic material prefilling now! 🎉