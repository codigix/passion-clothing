# Production Wizard - Console Log Reference Guide

## 📖 How to Use This Guide

When you create a production order in the wizard, open your browser's **Developer Console** (Press **F12**) and watch for these logs. They'll help you understand:
- What data is being loaded
- Where materials are coming from
- If anything went wrong
- Exact timing of each step

---

## 🎯 Quick Reference: Log Message Meanings

| Icon | Message | Meaning | Good/Bad |
|------|---------|---------|----------|
| 📋 | Fetching sales order... | Starting to load order data | ✅ Normal |
| ✅ | Sales order loaded | Order data retrieved successfully | ✅ Good |
| ✅ | Purchase order linked | Found PO for this order | ✅ Good |
| ⚠️ | No PO found | Okay, will try MRN | ℹ️ Normal |
| 🔍 | Searching for MRN... | Looking for material request | ✅ Normal |
| ✅ | MRN Found | Material request exists | ✅ Good |
| ⚠️ | No MRN found | Will use PO/SO items | ℹ️ Normal |
| 📦 | MRN materials field | Shows materials in MRN | ✅ Good |
| ✅ | Using received materials | Best source! | ✅ Best |
| ✅ | Using MRN materials | Official request | ✅ Good |
| 📦 | Fallback 1: PO items | Using vendor order | ⚠️ Okay |
| 📦 | Fallback 2: SO items | Using customer order | ⚠️ Last resort |
| ℹ️ | No materials found | No auto-loading possible | ❌ Manual entry needed |
| ✅ | Successfully loaded | Materials populated! | ✅ Complete |

---

## 📊 Common Console Log Sequences

### Sequence 1: Perfect Scenario (MRN with Received Materials)

```
📋 Fetching sales order details for ID: 123

✅ Sales order loaded: {
  id: 123,
  project_name: "SO-123",
  items: [...],
  ...
}

✅ Purchase order linked: {
  id: 456,
  vendor_id: 789,
  items: [...],
  ...
}

🔍 Searching for MRN with project_name: "SO-123"

📨 MRN API Response: {
  requests: [
    {
      id: 999,
      request_number: "MRN-0045",
      materials_requested: [...],
      ...
    }
  ]
}

✅ MRN Found: MRN-0045, ID: 999

📦 MRN materials_requested field contains 3 items

Materials structure: [
  { material_name: "Fabric", quantity_required: 100, ... },
  { material_name: "Thread", quantity_required: 5, ... },
  { material_name: "Buttons", quantity_required: 200, ... }
]

✅ Found 4 received materials

✅ MRN Flow: 3 requested + 1 received = 4 to display

✅ Using received materials: 4 items

📦 Loading 4 material(s) from Material Receipt (MRN-0045)

🔍 Materials data: [
  { material_name: "Fabric", quantity_received: 100, status: "verified", ... },
  { material_name: "Thread", quantity_received: 5, status: "verified", ... },
  { material_name: "Buttons", quantity_received: 200, status: "verified", ... },
  { material_name: "Tags", quantity_received: 50, status: "verified", ... }
]

✅ Material M-001: Fabric
✅ Material M-002: Thread
✅ Material M-003: Buttons
✅ Material M-004: Tags

✅ Successfully loaded 4 materials from Material Receipt (MRN-0045)

🔍 Searching for product code: T-S-TSHI-1616

✅ Product resolved: T-Shirt
```

**What This Means**: 🎉 PERFECT! 4 materials auto-loaded from verified receipt!

---

### Sequence 2: MRN Found But No Received Materials

```
📋 Fetching sales order details for ID: 123

✅ Sales order loaded: {...}

✅ Purchase order linked: {...}

🔍 Searching for MRN with project_name: "SO-123"

✅ MRN Found: MRN-0045, ID: 999

📦 MRN materials_requested field contains 3 items

Materials structure: [
  { material_name: "Fabric", quantity_required: 100 },
  { material_name: "Thread", quantity_required: 5 },
  { material_name: "Buttons", quantity_required: 200 }
]

No verification found for MRN: [Error details...]

✅ MRN Flow: 3 requested + 0 received = 3 to display

✅ Using MRN requested materials: 3 items

📦 Loading 3 material(s) from MRN Request (MRN-0045)

✅ Material M-001: Fabric
✅ Material M-002: Thread
✅ Material M-003: Buttons

✅ Successfully loaded 3 materials from MRN Request (MRN-0045)
```

**What This Means**: ✅ Good! 3 materials loaded from MRN request

---

### Sequence 3: No MRN, Fallback to PO

```
📋 Fetching sales order details for ID: 123

✅ Sales order loaded: {...}

✅ Purchase order linked: {
  items: [
    { product_name: "Premium Fabric", quantity: 100, unit: "meters" },
    { product_name: "Quality Thread", quantity: 5, unit: "spools" }
  ]
}

🔍 Searching for MRN with project_name: "SO-123"

📨 MRN API Response: { requests: [] }

⚠️ No MRN found for project_name: "SO-123"

⚠️ MRN has no materials_requested field

❌ Error fetching MRN: [Error details...]

📦 Fallback 1: Found 2 items in Purchase Order

✅ Fallback: Created 2 materials from items

✅ MRN Flow: 0 requested + 0 received = 0 to display

✅ Using [source]: 2 items

📦 Loading 2 material(s) from Purchase Order Items

✅ Material M-001: Premium Fabric
✅ Material M-002: Quality Thread

✅ Successfully loaded 2 materials from Purchase Order Items
```

**What This Means**: ⚠️ MRN doesn't exist, but PO items used as materials (still good!)

---

### Sequence 4: No MRN, No PO Items, Fallback to SO

```
📋 Fetching sales order details for ID: 123

✅ Sales order loaded: {
  items: [
    { product_name: "T-Shirt", quantity: 100 },
    { product_name: "Accessories", quantity: 50 }
  ]
}

No PO found for this sales order yet: [Error...]

🔍 Searching for MRN with project_name: "SO-123"

⚠️ No MRN found for project_name: "SO-123"

📦 Fallback 1: PO has no items (PO doesn't exist)

📦 Fallback 2: Using Sales Order items instead (2 items)

✅ Fallback: Created 2 materials from items

📦 Loading 2 material(s) from Sales Order Items

✅ Material M-001: T-Shirt
✅ Material M-002: Accessories

✅ Successfully loaded 2 materials from Sales Order Items
```

**What This Means**: ℹ️ Last resort - SO items used as materials (consider creating PO/MRN for better data)

---

### Sequence 5: Nothing Available - Manual Entry Required

```
📋 Fetching sales order details for ID: 123

✅ Sales order loaded: {
  items: []  // <-- Empty!
}

No PO found for this sales order yet: [Error...]

🔍 Searching for MRN with project_name: "SO-123"

⚠️ No MRN found for project_name: "SO-123"

📦 Fallback 1: PO has no items (doesn't exist)

📦 Fallback 2: Using Sales Order items instead (0 items)  // <-- Empty!

✅ Fallback: SO also empty

ℹ️ No materials found in any source (MRN, PO, or SO)

ℹ️ You can add materials manually in the Materials section below

Project details loaded successfully!
```

**What This Means**: ❌ No materials found anywhere - you must add manually

---

## 🔍 Line-by-Line Explanation

### Sales Order Loading Phase

```
📋 Fetching sales order details for ID: 123
```
- **What**: System is requesting sales order data from server
- **Where**: `/sales/orders/123`
- **Expected**: Next line should show `✅ Sales order loaded`

```
✅ Sales order loaded: {...}
```
- **What**: Successfully retrieved sales order
- **Contains**: Project name, items, customer info
- **Next**: Will fetch PO if linked

### PO Loading Phase

```
✅ Purchase order linked: {...}
```
- **What**: Found PO linked to this SO
- **Contains**: Vendor info, items ordered
- **Next**: Will search for MRN

```
No PO found for this sales order (yet): [Error...]
```
- **What**: No PO exists for this SO yet
- **Normal**: Can still load from SO items
- **Next**: Will continue to MRN search

### MRN Loading Phase

```
🔍 Searching for MRN with project_name: "SO-123"
```
- **What**: Searching for Material Request Note
- **Using**: Project name from SO
- **Next**: Should find or not find MRN

```
✅ MRN Found: MRN-0045, ID: 999
```
- **What**: MRN exists for this project
- **Number**: MRN-0045
- **Next**: Will parse materials

```
⚠️ No MRN found for project_name: "SO-123"
```
- **What**: MRN doesn't exist yet
- **Normal**: Can fallback to PO/SO
- **Next**: Will use PO or SO items

### Material Parsing Phase

```
📦 MRN materials_requested field contains 3 items
```
- **What**: MRN has 3 materials specified
- **Next**: Will parse and display them

```
Materials structure: [...]
```
- **What**: Shows actual material data
- **Structure**: Lists all material details
- **Next**: Will resolve to display format

### Material Resolution Phase

```
✅ Using received materials: 4 items
```
- **Priority**: 🥇 BEST - from verified receipt

```
✅ Using MRN requested materials: 3 items
```
- **Priority**: 🥈 GOOD - from official request

```
📦 Fallback 1: Found N items in Purchase Order
```
- **Priority**: 🥉 OKAY - from vendor order

```
📦 Fallback 2: Using Sales Order items instead
```
- **Priority**: 4th - from customer order

### Material Loading Phase

```
📦 Loading 3 material(s) from MRN Request (MRN-0045)
```
- **What**: About to populate materials section
- **Source**: Which source is being used
- **Count**: Number of materials

```
✅ Material M-001: Fabric
✅ Material M-002: Thread
✅ Material M-003: Buttons
```
- **What**: Each material being added
- **Format**: M-### format with description
- **Normal**: One line per material

```
✅ Successfully loaded 3 materials from MRN Request (MRN-0045)
```
- **What**: Completion message
- **Count**: Total materials loaded
- **Source**: Where they came from

---

## ⚠️ Error Messages & What They Mean

### Error: No Materials Found

```
ℹ️ No materials found in MRN request
ℹ️ You can add materials manually in the Materials section below
```

**Means**: No auto-loading possible  
**Action**: Add materials manually or create MRN/PO/SO with items

### Error: Failed to Fetch

```
❌ Error fetching MRN: Network Error
Could not load MRN materials - you can add them manually
```

**Means**: Server connection issue  
**Action**: Check internet connection, try again

### Error: Product Not Found

```
Could not resolve product: 404 Not Found
```

**Means**: Product code doesn't exist  
**Action**: Create product or use generic product

### Error: Parse Failed

```
Failed to parse materials_requested: SyntaxError
Raw materials_requested: [invalid JSON]
```

**Means**: Material data is malformed  
**Action**: Check data in MRN/PO/SO, fix if needed

---

## 🎯 What to Look For (Quick Checklist)

### Success Indicators ✅
- [ ] `✅ Sales order loaded`
- [ ] `✅ MRN Found` OR `⚠️ No MRN found` (still okay)
- [ ] `✅ Using [source] materials: N items`
- [ ] `✅ Successfully loaded N materials`
- [ ] No error messages in red

### Warning Signs ⚠️
- [ ] `❌ Error fetching` (might be connection issue)
- [ ] `Failed to parse` (malformed data)
- [ ] Only 1 material loaded when expecting more
- [ ] `ℹ️ No materials found` (need manual entry)

### Critical Issues ❌
- [ ] Multiple network errors
- [ ] Cannot resolve product
- [ ] Form doesn't populate after logging
- [ ] Server 500 error

---

## 🔧 Debug Tips

### Tip 1: Copy Console Logs
- Right-click in console → "Save as..."
- Save logs to file for analysis
- Share with support if issues

### Tip 2: Filter Console Logs
- Type in console filter: `Material`
- Shows only material-related logs
- Easier to spot the issue

### Tip 3: Watch the Network Tab
- Click Network tab in DevTools
- Watch requests to `/sales/orders`
- Check `/procurement/pos`
- Monitor `/project-material-requests`

### Tip 4: Inspect the Form
- Open Elements tab
- Find `materials.items` field
- Check if it has values
- Verify field is populated correctly

### Tip 5: Monitor Timeline
- Open Performance tab
- Record during "Load Order"
- See timing of each API call
- Identify slow requests

---

## 📱 Mobile/Tablet Console Access

### Chrome/Edge
1. Hold Volume Up + Power
2. Select "Take screenshot"
3. Open DevTools (usually F12 or Ctrl+Shift+I)
4. Check console tab

### Safari (iPad)
1. Connect to Mac
2. Open Safari DevTools
3. Check console

### Firefox
1. Long-press page
2. Select "Inspect"
3. Click "Console" tab

---

## 💾 Saving Logs for Analysis

### Save Console Output
```javascript
// Paste this in console:
copy(console.log.toString())
// Then paste in text file
```

### Export Full Logs
```
Right-click console → Save as
Save entire console to file
```

---

## 🎓 Understanding Log Levels

| Level | Icon | Color | Meaning |
|-------|------|-------|---------|
| Info | ℹ️ | Blue | Informational message |
| Log | 📋 | Black | Standard logging |
| Success | ✅ | Green | Operation succeeded |
| Warning | ⚠️ | Yellow | Something unusual |
| Error | ❌ | Red | Operation failed |

---

## 🎉 Expected Success Sequence

When everything works perfectly, you should see:

```
📋 → ✅ → ✅ → ✅ → ✅ → ✅ → ✅
  |    |    |    |    |    |    |
  SO   PO   MRN  Mat  Src  Lod  Done!
```

If you see all ✅ checkmarks, everything is working perfectly!

---

**Reference**: Use this guide when debugging material loading issues  
**Console Access**: Press **F12** in browser to open console  
**Share When**: Encountering issues - share console logs with support team