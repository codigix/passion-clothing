# Production Operations View - Quick Start Guide

## 🚀 Quick Access

**From Manufacturing Dashboard:**
1. Go to "Production Tracking" tab
2. Find production order in the list
3. Click the **eye icon** (👁️) in the Actions column
4. Operations View opens

## 📋 Basic Stage Management

### Start a Stage
```
1. Select stage from left sidebar
2. Click "Start Stage" button
3. Stage status changes to "In Progress"
4. Start time automatically recorded
```

### Edit Stage Dates
```
1. Click "Edit" button (top right)
2. Modify:
   - Start Date
   - Start Time
   - End Date
   - End Time
3. Add notes if needed
4. Click "Save Changes"
```

### Complete a Stage
```
1. Ensure stage is "In Progress"
2. Click "Complete Stage" button
3. Stage marked as completed
4. Progress bar updates
5. Move to next stage
```

## 🏭 Outsourcing (Embroidery/Printing)

### Quick Outsourcing Flow

**Step 1: Select Work Type**
```
Navigate to Embroidery/Printing stage
↓
Click "Outsourced" button
↓
Outsourcing options appear
```

**Step 2: Send to Vendor (Outward)**
```
Click "Create Outward Challan"
↓
Select Vendor
↓
Enter Quantity: 500
↓
Set Expected Return Date
↓
Add Transport Details (optional)
↓
Submit
↓
✓ Challan Created!
```

**Step 3: Receive from Vendor (Inward)**
```
[After vendor completes work]
↓
Click "Create Inward Challan"
↓
Select Outward Challan
↓
Enter Received Quantity: 490
↓
Add Quality Notes: "Good quality"
↓
Add Discrepancies: "10 pieces damaged"
↓
Submit
↓
✓ Work Received! Stage Updated!
```

### Challan Status Tracking
- **Pending**: Sent to vendor, awaiting return
- **Completed**: Received from vendor
- **Cancelled**: Order cancelled

## 📦 Material Reconciliation (Final Stage)

### When to Use
- ✅ You're at the **LAST stage** of production
- ✅ Stage status is "In Progress"
- ✅ Ready to calculate final material usage

### Quick Reconciliation Flow

```
Step 1: Open Dialog
↓
Click "Open Material Reconciliation"
↓
Material list loads

Step 2: Review & Update
↓
For each material:
  - See Allocated quantity
  - Update Consumed (actual usage)
  - Update Wasted (scraps/damage)
  - Leftover auto-calculates
↓
Example:
  Cotton Fabric
  Allocated: 100m
  Consumed: 85m ← Edit this
  Wasted: 5m ← Edit this
  Leftover: 10m ← Auto-calculated

Step 3: Submit
↓
Click "Complete Reconciliation"
↓
✓ Leftovers returned to inventory!
✓ All quantities updated!
```

### What Happens After Reconciliation?
1. ✅ Material allocations updated with actual usage
2. ✅ Leftover materials added back to inventory
3. ✅ Inventory movement records created
4. ✅ Material status changed to "consumed" or "partially_returned"

## 🎯 Common Scenarios

### Scenario 1: Regular In-House Production
```
Day 1: Start Cutting Stage
  → Click "Start Stage"
  → Work proceeds

Day 2: Complete Cutting
  → Click "Complete Stage"
  → Move to Stitching

Day 3: Start Stitching
  → Click "Start Stage"
  → Continue...
```

### Scenario 2: Outsourced Embroidery
```
Week 1, Monday:
  → Select "Outsourced" for Embroidery
  → Create Outward Challan
  → Send 1000 pieces to vendor

Week 2, Friday:
  → Create Inward Challan
  → Receive 980 pieces (20 rejected)
  → Add quality notes
  → Continue to next stage
```

### Scenario 3: Final Stage with Leftovers
```
Packaging Stage (Last Stage):
  → Stage in progress
  → Click "Open Material Reconciliation"
  → Review materials:
    - Fabric: Used 95m, 5m leftover
    - Thread: Used 48 spools, 2 leftover
    - Buttons: Used 990, 10 leftover
  → Click "Complete Reconciliation"
  → All leftovers returned to inventory
  → Complete Packaging stage
  → Production finished!
```

## ⚡ Keyboard Shortcuts & Tips

### Navigation
- **Previous Stage**: Bottom left button or use sidebar
- **Next Stage**: Bottom right button or use sidebar
- **Quick Edit**: Click "Edit" button or double-click date field

### Pro Tips
1. 💡 **Always add notes** - helps with audit trail
2. 💡 **Check leftover quantities** - before reconciliation
3. 💡 **Track challan numbers** - for vendor follow-up
4. 💡 **Update dates promptly** - for accurate timeline
5. 💡 **Review materials early** - don't wait till last stage

## 🚨 Troubleshooting

### "Cannot start stage"
- ✓ Previous stage must be completed
- ✓ Check if already in progress
- ✓ Verify permissions

### "Vendor list empty"
- ✓ Create vendors first in Vendors module
- ✓ Ensure vendors are active status

### "Material reconciliation not showing"
- ✓ Only appears in LAST stage
- ✓ Stage must be "In Progress"
- ✓ Check material allocations exist

### "Cannot create inward challan"
- ✓ Must have an outward challan first
- ✓ Outward challan must be "Pending" status
- ✓ Select correct challan from dropdown

## 📱 API Quick Reference

```javascript
// Get production order details
GET /api/manufacturing/orders/:id

// Start stage
POST /api/manufacturing/stages/:stageId/start

// Complete stage
POST /api/manufacturing/stages/:stageId/complete

// Update stage dates
PUT /api/manufacturing/stages/:stageId

// Create outward challan
POST /api/manufacturing/stages/:stageId/outsource/outward

// Create inward challan
POST /api/manufacturing/stages/:stageId/outsource/inward

// Get materials for reconciliation
GET /api/manufacturing/orders/:orderId/materials/reconciliation

// Submit reconciliation
POST /api/manufacturing/orders/:orderId/materials/reconcile
```

## 🎨 Visual Indicators

### Stage Status Colors
- 🟢 **Green** = Completed
- 🔵 **Blue** = In Progress
- 🟠 **Orange** = On Hold
- ⚪ **Gray** = Pending

### Badge Types
- 🟢 **Completed** = Stage finished
- 🔵 **In Progress** = Currently working
- 🟠 **On Hold** = Paused temporarily
- ⚪ **Pending** = Not started yet

### Challan Status
- 🟠 **Pending** = Awaiting return
- 🟢 **Completed** = Received back
- ⚪ **Draft** = Not sent yet

## ✅ Checklist

### Before Starting Production
- [ ] All stages defined
- [ ] Materials allocated
- [ ] Vendors added (if outsourcing)
- [ ] Team assigned

### During Production
- [ ] Update stage dates promptly
- [ ] Add notes for each stage
- [ ] Create challans for outsourcing
- [ ] Track vendor returns

### Final Stage
- [ ] Open material reconciliation
- [ ] Verify consumed quantities
- [ ] Calculate leftovers
- [ ] Submit reconciliation
- [ ] Complete final stage

## 🎓 Training Points

### For Production Managers
1. Monitor stage progress daily
2. Track outsourcing challans
3. Review material consumption
4. Handle discrepancies promptly

### For Line Workers
1. Start stages on time
2. Complete stages accurately
3. Add relevant notes
4. Report issues immediately

### For Inventory Staff
1. Ensure materials allocated before production
2. Monitor material consumption
3. Process returned leftovers
4. Update inventory records

---

## 📞 Quick Help

**Problem**: Can't find production order
**Solution**: Check Production Tracking tab, use search/filter

**Problem**: Edit button not working
**Solution**: Check permissions, ensure stage is active

**Problem**: Reconciliation not calculating correctly
**Solution**: Verify allocated quantities, check consumed + wasted + leftover = allocated

**Problem**: Challan creation fails
**Solution**: Check vendor exists, verify items list, ensure network connection

---

**Need More Help?**
- 📖 See full documentation: `PRODUCTION_OPERATIONS_SIMPLIFIED.md`
- 🎯 Check API reference in documentation
- 🔧 Contact system administrator

**Version**: 1.0.0 | **Last Updated**: January 31, 2025