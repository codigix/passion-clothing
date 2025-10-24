# Production Wizard: Quick Start Guide

## 🚀 Creating a Production Order in 5 Minutes

### The 8 Steps

```
STEP 1 ──→ STEP 2 ──→ STEP 3 ──→ STEP 4 ──→ STEP 5 ──→ STEP 6 ──→ STEP 7 ──→ STEP 8
Select   Order    Schedule  Materials Quality  Team   Custom   Review &
Project  Details  Timeline  (MRN)    Checks   Members Stages  Submit
```

---

## Step-by-Step Instructions

### ✅ STEP 1: Select Project

**What to do**:
1. Scroll down to the **Project / Sales Order** dropdown
2. Select your sales order (shows: Order# • Customer • Product • Qty)
3. Wait for "Loading project details..." message
4. See green success banner with:
   - Customer name
   - Product name
   - Quantity
   - Delivery date
   - **Materials: X item(s) loaded** ← Materials are auto-loaded here!

**What gets auto-filled**:
- ✅ Customer information
- ✅ Product details
- ✅ Order quantity
- ✅ Delivery date
- ✅ All materials from the Material Request Number (MRN)

**Click Next →**

---

### ✅ STEP 2: Order Details

**What to do**:
1. **Production Type**: Select how you'll produce:
   - In-House (we do it)
   - Outsourced (vendor does it)
   - Mixed (both)
2. **Quantity**: Already filled from project, edit if needed
3. **Priority**: Select urgency level:
   - Low / Medium / High / Urgent
4. **Special Instructions**: Any notes for production team (optional)

**Example**:
```
Production Type: In-House
Quantity: 100 (already filled)
Priority: High
Special Instructions: "Strict color matching required"
```

**Click Next →**

---

### ✅ STEP 3: Schedule Timeline

**What to do**:
1. **Planned Start Date**: When production should start
2. **Planned End Date**: When production should complete
   - Must be on or after start date
3. **Shift**: Select work shift:
   - Morning / Afternoon / Evening / Night / Flexible
4. **Expected Hours**: Total production hours (optional)

**Example**:
```
Start: Jan 15, 2025
End: Jan 22, 2025
Shift: Morning Shift
Hours: 40
```

**Click Next →**

---

### ✅ STEP 4: Materials ⭐ NEW ENHANCEMENTS

**What to do**:
1. **Review auto-loaded materials** from MRN
   - See blue banner showing count of loaded materials
   - Each material shows where it came from (e.g., "From MRN MRN-20250115-00001")

2. **Edit what you can**:
   - 🎯 **Required Quantity**: Adjust if needed (only EDITABLE field)
   - 📊 **Status**: Select availability:
     - ✓ Available
     - ⚠️ Shortage
     - 📦 Ordered

3. **View read-only details** (locked from MRN):
   - Material ID / Code (gray background)
   - Description (gray background)
   - Unit (gray background)
   - Barcode 🏷️ (if available)
   - Warehouse Location 📍 (if available)
   - **Fabric Attributes** (if available):
     - 🎨 Color
     - ⚖️ GSM (weight)
     - 📏 Width

4. **Add extra materials** (optional):
   - Click "+ Add Additional Material" button
   - Fill in: ID, Description, Qty, Unit, Status
   - Click Remove if you change your mind

**Visual Guide**:
```
📦 Materials loaded from MRN
├─ 3 material(s) fetched from the Material Request Number for this project
├─ ✓ Read-only fields (ID, Description, Unit, Color, GSM, Width) are locked from MRN
└─ ✓ Adjust Required Quantity and Status as needed before submission

Material #1    [From MRN MRN-20250115-00001]  [✕ Remove]
├─ Core Information
│  ├─ Material ID: FABRIC-COTTON-001 (gray)
│  ├─ Description: Cotton Fabric (gray)
│  └─ Required Qty: 100  ← EDITABLE
│
├─ 📋 Sourced from MRN (purple section)
│  ├─ Unit: Meters (gray)
│  ├─ 🏷️ Barcode: BC123456789 (gray)
│  └─ 📍 Location: Warehouse A, Shelf 3 (gray)
│
│  Fabric Attributes
│  ├─ 🎨 Color: Navy Blue (gray)
│  ├─ ⚖️ GSM: 150 (gray)
│  └─ 📏 Width: 45" (gray)
│
└─ Status & Adjustments
   └─ Availability Status: ✓ Available ▼  ← EDITABLE
```

**Click Next →**

---

### ✅ STEP 5: Quality Checks

**What to do**:
1. Click "+ Add Checkpoint" to define inspection gates
2. For each checkpoint, enter:
   - **Checkpoint Name**: What are you checking? (e.g., "Color Match")
   - **Frequency**: How often? (Per Batch / Per Hour / Per Day / Random)
   - **Acceptance Criteria**: What passes? (e.g., "Color deviation ≤ 2 shades")

3. (Optional) **Quality Notes**: Overall quality strategy

**Example**:
```
Checkpoint #1
├─ Name: Color Accuracy
├─ Frequency: Per Batch
└─ Criteria: Color matches Pantone reference ±2 shades

Checkpoint #2
├─ Name: Stitch Quality
├─ Frequency: Per Hour
└─ Criteria: No dropped stitches, even tension
```

**Need at least 1 checkpoint to continue**

**Click Next →**

---

### ✅ STEP 6: Team Assignment

**What to do**:
1. **Supervisor**: Select who oversees production
2. **Assigned To**: Select who executes production
3. **QA Lead**: Select who verifies quality
4. **Team Notes**: Any coordination notes (optional)

**Note**: All fields are optional. Leave blank if not assigning.

**Click Next →**

---

### ✅ STEP 7: Customization

**What to do**:

**Option A: Use Default Stages** (Most common)
- ✓ Leave checkbox unchecked
- Default stages will be used:
  1. Calculate Material Review
  2. Cutting
  3. Embroidery or Printing
  4. Stitching
  5. Finishing
  6. Quality Check

**Option B: Use Custom Stages** (Advanced)
- ✓ Check the "Use Custom Stages" checkbox
- Click "+ Add Stage" for each stage
- For each stage:
  - **Stage Name**: Name it (e.g., "Dyeing")
  - **Duration**: Expected hours (optional)
  - **Is Printing**: Check if printing stage
  - **Is Embroidery**: Check if embroidery stage
  - **Is Outsourced**: Check if sending to vendor
  - **Vendor**: Select vendor if outsourced

**When to use custom**:
- Non-standard production workflow
- Unique stages (e.g., special dyeing process)
- Different order than default

**Click Next →**

---

### ✅ STEP 8: Review & Submit

**What to do**:
1. **Review all entered data** (all fields read-only)
   - Scroll through to verify everything correct
2. **Check the acknowledgement box**:
   - "I confirm all details are correct"
3. **Click "Create Production Order"**

**What happens next**:
- ✅ Production order created with all stages
- ✅ Sales order status updated to "in_production"
- ✅ Operations auto-created for each stage
- ✅ Challans auto-created for outsourced stages
- ✅ Redirected to Production Orders list
- ✅ See your new order in the list

---

## 🎯 Key Features Explained

### ⚡ Auto-Filled Data (Step 1)

When you select a project, the system automatically loads:

**From Sales Order**:
- Customer name
- Product details
- Order quantity
- Delivery date

**From Material Request (MRN)**:
- All required materials
- Material codes/IDs
- Required quantities
- Unit of measure
- Warehouse locations
- Barcodes (for tracking)
- Fabric attributes (color, GSM, width)

**From Purchase Order** (if linked):
- Supplier information
- Estimated delivery dates

### 🔒 Read-Only vs Editable Fields

**Read-Only Fields** (Gray background, locked):
- Material ID / Code
- Description
- Unit of Measure
- Barcode
- Location/Warehouse
- Color, GSM, Width (fabric attributes)
- Condition (if available)

Why locked? These come from the MRN and are the "source of truth"

**Editable Fields** (White background):
- Required Quantity ⚡
- Material Status (Available/Shortage/Ordered)
- Any additional materials you add manually

### 📋 Material Audit Trail

Each material shows where it came from:
```
🔗 From MRN MRN-20250115-00001
```

This helps you trace materials back to the original material request.

### 🔄 Navigation

**Ways to move between steps**:

1. **Sequential**: Use Previous/Next buttons
2. **Jump Forward**: Click on next step number (up to 1 step ahead)
3. **Go Back**: Click on any completed step number
4. **Cannot Skip**: Must complete validation before moving forward

**Progress Indicator** (Stepper):
- 🔵 Current step (blue circle, shows icon)
- ✓ Completed step (green checkmark)
- ⚠️ Has errors (red alert icon)
- ○ Pending step (gray circle with number)

---

## ⚠️ Common Issues & Solutions

### Issue: "No Sales Orders Found"
- **Solution**: Make sure sales orders are in "confirmed" status
- Admin can check: Settings → Sales Orders

### Issue: "No Materials Loaded"
- **Solution 1**: MRN not created yet for this project. Click "+ Add Material" to add manually.
- **Solution 2**: MRN exists but materials not properly saved. Go back and check MRN.

### Issue: "Invalid Product Selected"
- **Solution**: Don't manually type product ID. Always select from dropdown. Go to Step 1 and reselect project.

### Issue: "End Date Before Start Date"
- **Solution**: Make sure End Date >= Start Date

### Issue: "At Least One Material Required"
- **Solution**: Step 4 requires minimum 1 material. Add or load materials.

### Issue: "At Least One Quality Checkpoint"
- **Solution**: Step 5 requires minimum 1 quality checkpoint. Click "+ Add Checkpoint"

### Issue: "No Vendors Available"
- **Solution**: Go to Procurement → Vendors and create vendor first.

### Issue: "Acknowledgement Required"
- **Solution**: In Step 8, check the box "I confirm all details are correct" before submitting.

---

## 💡 Tips & Best Practices

### ✅ DO:
- ✓ Select project from dropdown (don't type order number)
- ✓ Review auto-loaded materials carefully
- ✓ Adjust quantities only if you need different amounts
- ✓ Add quality checkpoints specific to your product
- ✓ Assign team members for better tracking
- ✓ Use custom stages only if your workflow is different
- ✓ Review all details before clicking submit

### ❌ DON'T:
- ✗ Try to edit Material ID or Description (they're locked for a reason)
- ✗ Skip quality checkpoints (at least 1 is required)
- ✗ Manually type values that have dropdowns available
- ✗ Create production order without reviewing first
- ✗ Use custom stages unless your workflow is truly different
- ✗ Assign non-existent team members

---

## 🎬 Workflow Examples

### Example 1: Simple In-House Production

```
STEP 1: Select Project "SO-1234 • Acme Corp • T-Shirts • 100 units"
        ↓ Auto-loads: Customer, Product, Materials (10 fabric types)

STEP 2: Order Details
        - Production Type: In-House
        - Quantity: 100 (already filled)
        - Priority: Medium
        - Instructions: (leave blank)

STEP 3: Scheduling
        - Start: Jan 15, 2025
        - End: Jan 20, 2025
        - Shift: Morning Shift
        - Hours: 40

STEP 4: Materials
        - Review 10 materials loaded from MRN
        - All quantities look good, no changes needed
        - All statuses: Available

STEP 5: Quality
        - Checkpoint: Color Accuracy | Per Batch | Match Pantone ±2
        - Checkpoint: Stitch Quality | Per Hour | Even tension, no dropped

STEP 6: Team
        - Supervisor: Rajesh Kumar
        - Assigned To: Priya Singh
        - QA Lead: Amit Verma

STEP 7: Customization
        - Use default stages (leave unchecked)

STEP 8: Review & Submit
        - Verify all details
        - Check acknowledgement
        - Click "Create Production Order"
        
✅ DONE! Order created, redirect to orders list
```

### Example 2: Outsourced Embroidery

```
STEP 1: Select Project with embroidery in MRN
STEP 2: Production Type: Outsourced
STEP 3: Scheduling (3-5 day turnaround)
STEP 4: Materials (includes embroidery supplies from MRN)
STEP 5: Quality checkpoints for embroidery
STEP 6: Assign external vendor team
STEP 7: Customization
        - Use custom stages: ✓ checked
        - Add Stage 1: Cutting | 4 hours
        - Add Stage 2: Embroidery | Embroidery ✓ | Outsourced ✓ | Vendor: Elite Embroidery
        - Add Stage 3: QC | 2 hours
STEP 8: Submit

✅ Auto-creates challan for embroidery stage + sets status as draft
```

---

## 📊 Understanding the Materials Section

### What Does "From MRN" Mean?

MRN = Material Request Number
- Auto-created when a sales order is processed
- Contains all materials needed for this project
- Locked because it's the "source of truth"

### Why Are Some Fields Disabled?

**Locked fields** come directly from the MRN and prevent errors:
- Prevents accidental changes to critical data
- Ensures consistency across project
- If you need to change them, edit the MRN instead

### What Can I Edit?

**Two fields are editable**:
1. **Required Quantity**: You can adjust if you need more/less than planned
2. **Status**: Mark if materials are available, shortage, or on order

---

## 🔧 Advanced Options

### Using Custom Stages

When to use:
- [ ] If using default 6 stages, leave unchecked ✓
- [ ] If you have custom process, check this

Custom stage example:
```
Stage 1: Pre-Production (Cutting, Checking)    4 hours
Stage 2: Embroidery (Send to vendor)           Outsourced to "Elite Embroidery"
Stage 3: Assembly & Stitching (In-house)       8 hours
Stage 4: Final QC                              2 hours
Stage 5: Packaging                             1 hour
```

### Assigning Vendors

When creating custom stages with outsourcing:
1. Check "Is Embroidery" or "Is Printing"
2. Check "Is Outsourced"
3. Select vendor from dropdown
4. System auto-creates draft challan for vendor

---

## ✅ Pre-Submission Checklist

Before clicking "Create Production Order", verify:

**Project Details**:
- [ ] Correct sales order selected
- [ ] Correct customer
- [ ] Correct product

**Order Config**:
- [ ] Production type selected
- [ ] Correct quantity
- [ ] Appropriate priority set

**Timeline**:
- [ ] Start date is realistic
- [ ] End date is >= start date
- [ ] Shift selected

**Materials**:
- [ ] All auto-loaded materials present
- [ ] Quantities are correct
- [ ] Statuses set correctly
- [ ] Min 1 material (if not: add materials)

**Quality**:
- [ ] Min 1 quality checkpoint (if not: add)
- [ ] Checkpoints are specific and measurable

**Team**:
- [ ] Supervisor assigned (if required)
- [ ] Team member assigned (if required)
- [ ] QA lead assigned (if required)

**Stages**:
- [ ] Using default OR custom stages correctly
- [ ] Custom vendors assigned if outsourcing

**Review**:
- [ ] All data reviewed and correct
- [ ] Acknowledgement checkbox checked
- [ ] No required fields missing

---

## 📞 Need Help?

- **Materials not loading?** → Check MRN was created for this project
- **Can't find sales order?** → Make sure order status is "confirmed"
- **Form won't submit?** → Check for red error messages on current step
- **Need custom workflow?** → Use custom stages in Step 7
- **Lost track of progress?** → Look at stepper (progress indicator at top)

---

**You're ready! Start creating production orders now! 🚀**
