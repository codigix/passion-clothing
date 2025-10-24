# MRN Material Loading - Quick Start Guide

## What Changed?

✅ **Before**: Materials fetched from Inventory API ❌ **Now**: Materials loaded from MRN records ✅

## How It Works in 3 Steps

```
1. Open Production Wizard
   └─ Select a Sales Order (Project)
   
2. System automatically:
   └─ Finds Material Request Number (MRN) for that project
   └─ Extracts all materials from MRN
   
3. Materials Tab pre-fills with:
   └─ All material details from MRN
   └─ Color, GSM, Width, Barcode, Location
```

## Using the Materials Tab

### What You'll See

```
📦 Materials loaded from MRN
These materials were fetched from the Material Request Number (MRN) 
for this project. Verify quantities, adjust required amounts if needed, 
and add any additional materials.

┌────────────────────────────────────────────┐
│ Material #1                            [×] │
├────────────────────────────────────────────┤
│ Material ID / Code:  FABRIC-COTTON-001    │
│ Description:        Cotton Fabric         │
│ Required Quantity:  50          [EDITABLE]│
│                                            │
│ 📋 MRN Details                             │
│ ├─ Barcode:        BC123456789 [read-only]│
│ ├─ Location:       Warehouse A [read-only]│
│ ├─ Unit:           Meters     [read-only]│
│ ├─ Color:          Navy Blue  [read-only]│
│ ├─ GSM:            150        [read-only]│
│ └─ Width:          45"        [read-only]│
│                                            │
│ Status: Available ▼ [EDITABLE]            │
│ Remarks: From MRN MRN-20250115-00001     │
└────────────────────────────────────────────┘
```

### What's Editable ✏️

You can **edit** these fields:
- ✅ **Required Quantity** - Adjust based on actual needs
- ✅ **Status** - Change to "Shortage" or "Ordered" if needed

### What's Read-Only 🔒

These fields are **locked** (can't edit):
- 🔒 Material ID / Code - Set by MRN
- 🔒 Description - Set by MRN
- 🔒 Barcode - Set by MRN
- 🔒 Location - Set by MRN
- 🔒 Unit - Set by MRN
- 🔒 Color - Set by MRN
- 🔒 GSM - Set by MRN
- 🔒 Width - Set by MRN

**Why locked?** To keep all materials sourced from a single, reliable place (MRN). If you need to change these details, update the MRN first.

## What's Required Before Materials Load

For materials to auto-populate, you need:

1. ✅ A **Sales Order** (SO-123)
2. ✅ A **Material Request Number (MRN)** created for that SO
3. ✅ **Materials listed in the MRN**

### If Materials Don't Load

**Problem**: Materials tab is empty when you select a project

**Solution**: 
1. Check if an MRN exists for this project
2. If not, create one in the Procurement → MRN section
3. Add materials to the MRN
4. Go back to Production Wizard
5. Re-select the project

## Common Actions

### ✏️ Adjust Material Quantity
1. Find the "Required Quantity" field
2. Click on the number box
3. Change to your actual requirement
4. Continue with the wizard

### ❌ Remove a Material
1. Click the "Remove" button (top-right of material card)
2. Confirm removal
3. Material is deleted from this production order

### ➕ Add Additional Material
1. Scroll to bottom of Materials section
2. Click "Add Material" button
3. Fill in Material ID, Description, Quantity
4. Set Status (Available/Shortage/Ordered)
5. Continue

### 📌 Change Material Status
1. Find the "Status" dropdown
2. Options:
   - **Available** - Material is in stock and ready
   - **Shortage** - Not enough in stock
   - **Ordered** - Not yet received, on order
3. Select appropriate status

## Example Workflow

```
┌─────────────────────────────────────────────────────┐
│ Step 1: Select Project                              │
├─────────────────────────────────────────────────────┤
│ Choose: SO-123 (Navy Blue T-Shirt)                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ System Action:                                      │
│ Finds MRN-20250115-00001 for SO-123               │
│ Extracts 3 materials:                              │
│ ├─ Cotton Fabric (50 meters)                       │
│ ├─ Thread Black (20 rolls)                         │
│ └─ Zipper Silver (150 pieces)                      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Step 4: Verify Materials                            │
├─────────────────────────────────────────────────────┤
│ ✅ Cotton Fabric - 50 meters [OK]                  │
│ ⚠️  Thread Black - 20 rolls [Adjust to 25]         │
│ ✅ Zipper Silver - 150 pieces [OK]                 │
│                                                     │
│ User changes Thread quantity: 20 → 25              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Continue to Next Steps:                             │
│ Quality → Team → Customization → Review → Submit   │
└─────────────────────────────────────────────────────┘
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Materials not loading** | Verify MRN exists for the project |
| **Fields showing empty** | Some MRN fields are optional (color, GSM) |
| **Can't edit Material ID** | These are MRN-locked to prevent errors |
| **Need to change material details** | Update the MRN first, then reload the wizard |
| **Want to add material not in MRN** | Use "Add Material" button to add manually |

## Key Differences from Before

| Feature | Before | After |
|---------|--------|-------|
| Material source | Inventory API | MRN records |
| Load speed | Slower (per-material API calls) | Faster (batch MRN load) |
| Material attributes | Limited (6 fields) | Rich (10+ fields) |
| Source tracking | No reference | Shows MRN number |
| Reliability | Dependency on inventory system | Uses manufacturing MRN |

## Need More Info?

Check these docs:
- `MRN_MATERIAL_LOADING_SYSTEM.md` - Full technical details
- `PRODUCTION_APPROVAL_TO_ORDER_COMPLETE_FLOW.md` - Complete workflow
- Contact your manufacturing lead for MRN creation help

---

**This feature is now LIVE** ✅

Materials loaded from MRN provide single-source-of-truth tracking and complete audit trails!