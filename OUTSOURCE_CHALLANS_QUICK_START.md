# Outsource Challans Tab - Quick Start Guide

## Overview
The new **Inward/Outward Challans** tab in the Outsource Management page provides a centralized view of all material flows related to outsourcing activities.

---

## Quick Navigation

### 1. Access the Outsource Page
```
Manufacturing → Outsource Management
OR
Direct URL: /manufacturing/outsource
```

### 2. Click the Challans Tab
In the tab navigation, click: **"Inward/Outward Challans"**

You'll see a count badge showing total challans: `Inward/Outward Challans (5)`

---

## What You'll See

### Outward Challans Section 🚚
**What it shows**: Materials sent to vendors for outsourcing
```
Truck Icon | Outward Challans (X)
├─ Challan CHN-20250115-0001
│  ├─ Vendor: Precision Embroidery
│  ├─ Address: 123 Industrial Zone
│  ├─ Flow: Warehouse → Vendor Shop
│  ├─ Status: PENDING
│  └─ View Button
├─ Challan CHN-20250115-0002
│  ├─ Vendor: Elite Stitching
│  └─ ...
```

### Inward Challans Section 📦
**What it shows**: Materials received back from vendors
```
Package Icon | Inward Challans (X)
├─ Challan CHN-20250116-0001
│  ├─ Vendor: Precision Embroidery
│  ├─ Address: 123 Industrial Zone
│  ├─ Flow: Vendor Shop → Warehouse
│  ├─ Status: COMPLETED
│  └─ View Button
├─ Challan CHN-20250116-0002
│  ├─ Vendor: Elite Stitching
│  └─ ...
```

---

## Challan Card Information

Each challan card displays:

| Field | What it shows |
|-------|---------------|
| **Challan #** | Unique identifier for tracking |
| **Date** | When the challan was created |
| **Type Badge** | Outward (🚚 Blue) or Inward (📦 Green) |
| **Vendor/Party** | Who the materials are going to/coming from |
| **Address** | Vendor/Party complete address |
| **Location Flow** | From → To (e.g., Warehouse → Vendor) |
| **Notes** | Special instructions or comments |
| **Status** | Current status with color:<br/>🟢 COMPLETED = Done<br/>🟡 PENDING = Waiting<br/>🔴 CANCELLED = Cancelled |
| **View Button** | Click to see full challan details |

---

## Common Workflows

### Workflow 1: Track Materials to Vendor
**Scenario**: You outsource embroidery work to Precision Embroidery

**Steps**:
1. Go to Manufacturing → Outsource Management
2. Click "Inward/Outward Challans" tab
3. Look in **Outward Challans** section
4. Find challan with:
   - Vendor: Precision Embroidery
   - Status: PENDING or IN PROGRESS
5. Click "View" to see full details

### Workflow 2: Receive Materials Back
**Scenario**: Materials come back from Precision Embroidery

**Steps**:
1. Go to Manufacturing → Outsource Management
2. Click "Inward/Outward Challans" tab
3. Look in **Inward Challans** section
4. Find challan with:
   - Vendor: Precision Embroidery
   - Date: Recent (same as outward date)
5. Check Status:
   - If COMPLETED → Quality approved ✅
   - If PENDING → Awaiting verification ⏳

### Workflow 3: Monitor All Material Flow
**Scenario**: See complete material flow for an order

**Steps**:
1. Go to Manufacturing → Outsource Management
2. Click "Inward/Outward Challans" tab
3. In **Outward Challans**: See when materials left (outgoing)
4. In **Inward Challans**: See when materials returned (incoming)
5. Compare dates to track turnaround time
6. Check statuses to verify quality approval

---

## Status Meanings

| Status | Meaning | Icon | What to Do |
|--------|---------|------|-----------|
| **PENDING** | Challan created, not yet confirmed | 🟡 | Awaiting vendor confirmation or return |
| **IN PROGRESS** | Materials are with vendor | 🔵 | Track delivery status |
| **COMPLETED** | All done, quality approved | 🟢 | Materials ready for production |
| **CANCELLED** | Challan was cancelled | 🔴 | Check why it was cancelled, may need to recreate |

---

## Understanding Challan Types

### Outward Challan 🚚 (Blue)
**Purpose**: Track materials sent OUT to vendors
**When Created**: When you decide to outsource work
**Information Tracked**:
- What materials are being sent
- Which vendor will do the work
- Expected return date
- Transport details
- Special instructions

**Example**:
```
Outward Challan CHN-20250115-0001
From: Warehouse
To: Precision Embroidery
Materials: 500 pieces fabric for embroidery
Expected Return: 2025-01-20
Status: PENDING
```

### Inward Challan 📦 (Green)
**Purpose**: Track materials received BACK from vendors
**When Created**: When vendor completes work and sends back
**Information Tracked**:
- What materials are being received
- Which vendor is sending
- Condition of materials
- Quality notes
- Any defects or issues

**Example**:
```
Inward Challan CHN-20250116-0001
From: Precision Embroidery
To: Warehouse
Materials: 500 pieces (embroidered)
Quality: Approved
Status: COMPLETED
```

---

## Troubleshooting

### Problem: No Challans Showing
**Possible Causes**:
- No outsourcing transactions created yet
- Challans data not synced
- Database doesn't have challan records

**Solution**:
1. Check if any production orders have outsourced stages
2. Create an outsource order if none exist
3. Refresh page (F5)
4. Check database for challan records

### Problem: Outward vs Inward Mix-up
**Remember**:
- 🚚 **OUTWARD** = Materials going OUT to vendor (blue)
- 📦 **INWARD** = Materials coming IN from vendor (green)

### Problem: Can't Find Specific Challan
**Try These**:
1. Use Main Search in Outsource Management to filter orders
2. Check vendor section to see who the order was with
3. Look for recent challans (usually at top of list)
4. Check both Outward and Inward sections

---

## Tips & Best Practices

### ✅ Do This
- Check both sections to track complete flow
- Review status regularly to catch delays
- Click "View" to see full challan details
- Monitor delivery dates for trends
- Keep notes updated for reference

### ❌ Don't Do This
- Assume status without checking
- Create duplicate challans for same order
- Ignore pending challans
- Mix up outward and inward directions

---

## Integration with Other Pages

### From Challans Tab, you can:
- **View Full Details**: Click "View" button → Challan Register page
- **Go to Orders**: Use tabs to switch to Orders section
- **View Vendors**: Switch to Vendors tab to see vendor details
- **Check Quality**: Switch to Quality Control tab

### From Other Pages, Access Challans:
- From **Orders Tab**: Expand order to see related challans
- From **Vendors Tab**: Vendor cards show recent challan count
- From **Production Operations**: Outsourced stages link to challans

---

## Real-World Example

### Scenario: Complete Order Outsourcing Flow

**Day 1 - Create Outsource Order**
```
Manufacturing → Outsource Management
→ Create Outsource button
→ Select Production Order: PO-2025-001 (500 pieces - Embroidery)
→ Select Vendor: Precision Embroidery
→ Expected Return: 2025-01-20
→ Create
```

**Day 1 - Check Challans Tab**
```
Outward Challans:
├─ CHN-20250115-0001 (Precision Embroidery)
│  ├─ Status: PENDING
│  └─ Expected Back: 2025-01-20
```

**Day 5 - Vendor Delivers Materials Back**
```
Inward Challans:
├─ CHN-20250116-0001 (Precision Embroidery)
│  ├─ Returned On: 2025-01-20
│  ├─ Status: COMPLETED
│  └─ Quality: Approved
```

**Result**: Complete material traceability from origin to vendor to return!

---

## Key Statistics from Challans Tab

**You can see**:
- Total number of outward challans (materials sent)
- Total number of inward challans (materials received)
- Average turnaround time
- Completion rate
- Pending vs completed ratio

---

## FAQ

**Q: Can I filter challans?**  
A: Currently showing all. Use browser search (Ctrl+F) to find specific vendor or challan number.

**Q: Can I create challans from this tab?**  
A: Future feature. Currently create from Production Operations or Outsource Create dialog.

**Q: What if a challan is cancelled?**  
A: Check the notes section or contact the vendor. May need to create a replacement outward challan.

**Q: How often is data updated?**  
A: Data refreshes when you load the page or click Refresh button (top right).

**Q: Can I export challengs?**  
A: Click individual challan View → Print or export from challan details page.

---

## Related Features

- **Production Orders Tab**: See all outsourced production orders
- **Vendor Directory Tab**: View vendor details and performance
- **Quality Control Tab**: Track quality metrics
- **Performance Analytics**: View vendor performance trends

---

## Next Steps

1. ✅ Navigate to Outsource Management page
2. ✅ Click "Inward/Outward Challans" tab
3. ✅ Review your current challans
4. ✅ Click "View" on any challan for full details
5. ✅ Track material flow from outward to inward

---

**Last Updated**: January 2025  
**Status**: ✅ Ready to Use