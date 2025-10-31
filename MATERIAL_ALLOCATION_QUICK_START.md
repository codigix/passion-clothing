# Material Allocation Dashboard - Quick Start Guide

## Accessing the Dashboard

### Method 1: From Sidebar
1. Go to Inventory department
2. Click **"Material Allocation"** in the left menu
3. URL: `http://localhost:3000/inventory/allocation`

### Method 2: Direct Link
- Copy and paste: `http://localhost:3000/inventory/allocation`

## What You'll See

### 1. Projects Overview (Default View)
You'll see a grid of projects showing:
- **Order Number** (e.g., SO-2025-001)
- **Customer Name**
- **Order Date**
- **Material Count**
- **Total Value (₹)**
- **Status Indicator** (🟢 Normal / 🟠 High Usage / 🔴 Over Consumed)

### 2. Material Summary Cards
For each project, you see four key numbers:
| Label | Meaning |
|-------|---------|
| **Budget** | Total materials planned for this project |
| **Consumed** | Materials already used in production |
| **Remaining** | Materials still available |
| **Utilization %** | How much of budget is consumed |

### 3. Status Colors in Progress Bar
- **Green**: Safe zone (under 90% consumed)
- **Orange**: Warning zone (90-110% consumed)
- **Red**: Over-consumed (above 110%)

## Common Tasks

### Task 1: Find Materials for a Specific Project
**Steps:**
1. Use the search box at top to find project by:
   - Order number (e.g., "SO-2025")
   - Customer name (e.g., "ABC Company")
2. Click on the project card
3. See detailed material list with quantities

**Result**: A table showing all materials allocated to that project with quantities and usage status

---

### Task 2: Identify Projects with Material Issues
**Steps:**
1. Look for projects with 🔴 **Red Status** (Over Consumed)
2. These projects have consumed more materials than allocated
3. Click to see which materials are causing the issue

**Action**: Review production reports or request additional materials

---

### Task 3: Compare Material Usage Across Projects
**Steps:**
1. Click the **"Comparison"** tab at top
2. View materials grouped by project and category
3. See consumption rates for each material type

**Insights**: Identify which projects/materials use resources most efficiently

---

### Task 4: Check Which Materials Are Running Low
**Steps:**
1. Look at the progress bars - wider green sections = more remaining
2. Click project → scroll to materials with low "Remaining" values
3. Sort by utilization to see high-usage materials first

**Next Step**: Request new purchase orders for low-stock items

---

### Task 5: Export Data for Analysis
**Steps:**
1. Go to Comparison tab
2. Take screenshots or use browser's print function
3. Save as PDF for reporting

**Note**: Full export feature coming soon

---

## Understanding the Numbers

### Example Project: SO-2025-001

| Metric | Value | What It Means |
|--------|-------|--------------|
| Budget Quantity | 100.5 | We planned to use 100.5 units |
| Consumed Quantity | 45.8 | We've already used 45.8 units |
| Remaining Quantity | 54.7 | We have 54.7 units left to use |
| Utilization % | 45.6% | We've used about 46% of our budget |
| Variance | +54.9 | We're 54.9 units UNDER budget (good!) |

### Status Interpretation

| Utilization % | Status | Meaning | Action |
|---|---|---|---|
| 0-80% | 🟢 Normal | Low consumption | Continue monitoring |
| 80-95% | 🟢 Normal | Moderate consumption | Monitor for spikes |
| 95-110% | 🟠 High Usage | Rapid consumption | Review production efficiency |
| >110% | 🔴 Over-consumed | Excess usage | Investigate waste/damage |

---

## Material Categories (Fabric, Thread, etc.)

In the Comparison view, materials are organized by:
- **fabric** - Cloth materials
- **thread** - Sewing threads
- **button** - Buttons, zippers, elastic
- **accessories** - Other small items
- **raw_material** - Primary materials
- **finished_goods** - Completed items

---

## Tips & Tricks

### 💡 Tip 1: Quick Filter
- Use the search box to instantly filter projects
- Search is case-insensitive

### 💡 Tip 2: Sort Options
- **Latest First** - See newest projects first
- **High Usage** - See risky projects first
- **High Value** - See most expensive projects first

### 💡 Tip 3: Project Details
- Click on any project card to "drill down"
- Click "Back to Projects" to return
- Each click loads fresh data

### 💡 Tip 4: Mobile Friendly
- Dashboard is optimized for mobile viewing
- All features work on phones/tablets
- Touch-friendly buttons and cards

---

## Frequently Asked Questions

### Q: Why can't I see a project?
**A:** Projects only appear if they have materials in stock (received via GRN). Draft materials won't show.

### Q: What's the difference between "Allocated" and "Consumed"?
**A:**
- **Allocated** = Materials sent from warehouse to production
- **Consumed** = Materials actually used in production

### Q: Can I modify allocations from here?
**A:** No, this is a read-only view. Allocations are created during production order creation.

### Q: How often does data refresh?
**A:** Click "Refresh" button to get latest data. Auto-refresh available if you keep the page open.

### Q: What if quantities go negative?
**A:** Negative means over-consumption (used more than allocated). This triggers a 🔴 Red status.

---

## Related Pages

| Page | Purpose |
|------|---------|
| **Dashboard** | Overall warehouse stock view |
| **Stock Management** | Add/manage individual items |
| **GRN** | Receive goods from vendors |
| **Goods Receipt** | Verify received materials |
| **Reports** | Generate inventory reports |

---

## Next Steps

1. **For Inventory Team**: Monitor projects nearing 100% utilization
2. **For Production Team**: Use allocation data to plan production stages
3. **For Management**: Use comparison data for cost analysis and reporting

---

**Need Help?** 
- Check the detailed documentation: `MATERIAL_ALLOCATION_DASHBOARD.md`
- Contact Inventory Department
- Review production logs for allocation details

**Last Updated**: February 2025