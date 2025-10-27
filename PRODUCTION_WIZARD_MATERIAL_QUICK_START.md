# Production Wizard - Material Auto-Fetching Quick Start

## 🎯 What's Fixed?

Materials now **automatically populate** from multiple sources when creating a production order:
- ✅ Material Receipts (verified goods)
- ✅ MRN Requests (material purchase requests)
- ✅ Purchase Order Items
- ✅ Sales Order Items

## 📖 How to Use

### Step-by-Step

1. **Go to Manufacturing Dashboard**
   - Click `Production Orders` → `Create New`

2. **Select a Sales Order**
   - Choose a project from the dropdown
   - Click "Load Order Details"

3. **Materials Auto-Load**
   - Watch the console (F12) for status
   - Toast notification appears confirming materials loaded
   - Materials appear in the form automatically

4. **Review Materials**
   - Check if material descriptions are correct
   - Verify quantities match your needs
   - Adjust if necessary (still fully editable)

5. **Continue with Production Order**
   - Fill in other required fields
   - Submit as normal

## 🔍 Console Messages Explained

| Message | Meaning | Action |
|---------|---------|--------|
| `✅ Using received materials: N items` | Materials from verified receipts | ✅ Best source |
| `✅ Using MRN requested materials: N items` | Materials from material request | ✅ Good source |
| `📦 Fallback 1: Found N items in Purchase Order` | Using PO items as materials | ⚠️ May need review |
| `📦 Fallback 2: Using Sales Order items instead` | Using SO items as materials | ⚠️ May need review |
| `ℹ️ No materials found in any source` | No materials available | ❌ Add manually |

## ✅ Expected Toast Notifications

### Success Cases
- `✅ Loaded N materials from Material Receipt (MRN-001)!`
- `✅ Loaded N materials from MRN Request!`
- `✅ Loaded N materials from Purchase Order Items!`
- `✅ Loaded N materials from Sales Order Items!`

### Manual Entry Case
- `⚠️ No materials found - please add them manually in the Materials section`

## 🐛 Troubleshooting

### Materials Still Not Loading?

**Issue**: Toast shows "No materials found"

**Solution**:
1. Check if Purchase Order exists for the Sales Order
   - Go to Procurement → View PO
   - If no PO, you need to create one first

2. Check if Sales Order has items
   - Go to Sales → View Order
   - Ensure order has at least one item

3. Add materials manually
   - In Materials section, click "Add Material"
   - Enter description, quantity, unit
   - Save production order

### Wrong Materials Loading?

**Issue**: Materials are from Sales Order instead of MRN

**Reason**: MRN is empty or not found for this project

**Solution**:
1. If you need MRN materials:
   - Go to Manufacturing → Material Requests
   - Create MRN for this project
   - Return to Production Wizard and create order

2. If SO/PO materials are correct:
   - Continue with production
   - They'll work fine for tracking

### Incorrect Material Descriptions?

**Issue**: Material shows generic name instead of specific material

**Solution**:
1. Check the source (console shows which source)
2. Edit the material description:
   - Click on the material row
   - Update description field
   - Save
3. For next order:
   - Update the source (SO items, PO items, or MRN)
   - More accurate materials will auto-load

## 🎓 Understanding Material Sources

### Priority Order (Why?)

```
Received Materials
    ↓ (Most accurate - already verified by QC)
MRN Requested Materials
    ↓ (Official material request)
Purchase Order Items
    ↓ (What was ordered from vendor)
Sales Order Items
    ↓ (Last resort - what customer ordered)
Manual Entry
    ↓ (When nothing else available)
```

### Which Source Will I Get?

**Best Case Scenario:**
1. Create Sales Order (SO)
2. Create Material Request (MRN) with specific materials
3. Receive materials at warehouse (Material Receipt)
4. **Result**: Production Wizard loads verified received materials ✅

**Good Case Scenario:**
1. Create Sales Order (SO)
2. Create Material Request (MRN)
3. **Result**: Production Wizard loads MRN materials ✅

**Acceptable Case Scenario:**
1. Create Sales Order (SO)
2. Create Purchase Order (PO) with items
3. **Result**: Production Wizard loads PO items ⚠️

**Last Resort:**
1. Create Sales Order (SO) only
2. **Result**: Production Wizard loads SO items as materials ⚠️

## 🚀 Tips for Best Results

### Tip 1: Create Complete Data Flow
```
Sales Order → Purchase Order → Material Request → Material Receipt
```
This ensures high-quality material auto-population.

### Tip 2: Verify PO Items
- Ensure Purchase Order has correct items
- Add quantities, UOM, descriptions
- This helps even if MRN is empty

### Tip 3: Create Material Requests
- For each project, create corresponding MRN
- Include detailed material specifications
- Enables accurate production planning

### Tip 4: Receive Materials Properly
- Use Material Receipt workflow
- Verify quantities and quality
- Creates audit trail and improves auto-load accuracy

## 💡 Common Scenarios

### Scenario 1: "No materials found" but I have a PO

**Problem**: PO might not be linked to this Sales Order

**Solution**:
1. Go to Procurement → Purchase Orders
2. Check if PO's `linked_sales_order_id` matches your Sales Order ID
3. If not, edit PO and set it
4. Return to Production Wizard

### Scenario 2: Materials loaded but descriptions are wrong

**Problem**: Source data (SO items, PO items) has generic descriptions

**Solution**:
1. Edit the materials in the Production Wizard form
2. OR create/update Material Request with detailed material specs
3. For next order, more accurate materials will load

### Scenario 3: Different materials needed than what loaded

**Problem**: Fallback source used generic items

**Solution**:
1. Clear auto-loaded materials
   - Delete material rows
2. Create Material Request (MRN) with specific materials needed
3. Create new production order - MRN materials will load instead

## 📞 Need Help?

### Check Browser Console (F12)
- Shows detailed load sequence
- Indicates which source was used
- Shows any parsing errors

### Check Production Wizard Log
- Look for: `📦 Loading N material(s) from [Source]`
- This shows exactly which materials came from where

### Manual Fallback
- Materials section always allows manual entry
- If auto-load not perfect, you can edit/add
- Fully flexible system

---

**Key Takeaway**: Materials now auto-load intelligently from multiple sources, but you always have full control to edit or add manually! 🎉