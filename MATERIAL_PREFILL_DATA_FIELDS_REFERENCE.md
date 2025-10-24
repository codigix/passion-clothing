# Material Prefill Data Fields Reference

## 📋 Complete List of Data Populated

When materials are fetched from MRN and prefilled in Production Order, the following fields are populated:

### Core Material Information

| Field | Source | Description | Example |
|-------|--------|-------------|---------|
| **Material ID** | inventory_id | Unique identifier in system | 12345 |
| **Description** | material_name | Display name of material | "Cotton Fabric" |
| **Quantity Required** | quantity_required | Amount needed | 50 |
| **Unit** | unit | Measurement unit | "meters", "pieces", "kg" |
| **Status** | (set to) | Availability status | "available", "shortage", "ordered" |

### Inventory Enrichment Fields

| Field | Source | Description | Example |
|-------|--------|-------------|---------|
| **Batch Number** | batch_number | Batch/lot identifier | "BATCH-2025-001" |
| **Warehouse Location** | warehouse_location | Storage location | "Warehouse A, Zone 1" |
| **Rack Number** | rack_number | Specific rack | "A1-R5" |
| **Category** | category | Material category | "Fabrics", "Trims", "Accessories" |
| **Material Type** | material_type | Type of material | "Natural", "Synthetic", "Blended" |
| **Color** | color | Material color | "Navy Blue", "White" |
| **Barcode** | barcode | Product barcode | "INV-12345-001" |
| **Quantity Available** | quantity_available | Current stock | 75 |
| **Stock Unit** | unit (from inventory) | Unit of available stock | "meters", "pieces" |

---

## 🔄 Data Flow & Transformation

### From MRN Material
```json
{
  "material_name": "Cotton Fabric",
  "material_code": "CF-001",
  "quantity_required": 50,
  "unit": "meters",
  "color": "Navy Blue",
  "hsn": "5208.1",
  "gsm": "200",
  "width": "54"
}
```

### After Inventory Enrichment
```json
{
  // Original fields preserved
  "material_name": "Cotton Fabric",
  "material_code": "CF-001",
  "quantity_required": 50,
  "unit": "meters",
  "color": "Navy Blue",
  
  // Enriched from Inventory
  "inventory_id": 12345,
  "inventory_item_name": "100% Cotton Fabric",
  "inventory_code": "INV-CF-001",
  "inventory_barcode": "INV-12345",
  "batch_number": "BATCH-2025-001",
  "warehouse_location": "Warehouse A, Zone 1",
  "rack_number": "A1-R5",
  "category": "Fabrics",
  "material_type": "Natural",
  "quantity_available": 75,
  "stock_unit": "meters"
}
```

### In Production Order Form
```javascript
{
  materialId: "12345",
  description: "100% Cotton Fabric",
  requiredQuantity: 50,
  unit: "meters",
  status: "available",
  batch_number: "BATCH-2025-001",
  warehouse_location: "Warehouse A, Zone 1",
  rack_number: "A1-R5",
  category: "Fabrics",
  material_type: "Natural",
  color: "Navy Blue",
  barcode: "INV-12345",
  inventory_barcode: "INV-12345",
  quantity_available: 75,
  stock_unit: "meters",
  mrn_request_number: "MRN-20250123-00001"
}
```

---

## 🎯 Field Mapping Reference

### What You See in UI vs. Form
| UI Display | Form Field | Data Type | Editable |
|-----------|-----------|-----------|----------|
| Material name | description | text | ❌ No |
| Required Qty | requiredQuantity | number | ✅ Yes |
| Unit (e.g., "meters") | unit | text | ❌ No |
| Batch # (e.g., "BATCH-001") | batch_number | text | ❌ No |
| Warehouse A, Zone 1 | warehouse_location | text | ❌ No |
| Rack: A1-R5 | rack_number | text | ❌ No |
| Available: 75 units | quantity_available | number | ❌ No |
| [status badge] | status | select | ✅ Yes |

### Card View Fields Displayed
```
Material #1
┌─────────────────────────────────────┐
│ 100% Cotton Fabric                  │
│ Barcode: INV-12345                  │
│                                     │
│ Required Qty: 50 meters             │
│ Available: 75 meters ✅             │
│ Batch #: BATCH-2025-001             │
│ Category: Fabrics                   │
│                                     │
│ 📍 Warehouse Location               │
│ Warehouse A, Zone 1                 │
│ Rack: A1-R5                         │
│                                     │
│ [Edit Quantity: _______]            │
└─────────────────────────────────────┘
```

### Table View Columns
| Column | Field | Shows |
|--------|-------|-------|
| # | index | 1, 2, 3... |
| Material | description, barcode | "Cotton Fabric" + barcode if exists |
| Required Qty | requiredQuantity | editable input field |
| Unit | unit | "meters", "pieces", etc. |
| Batch # | batch_number | "BATCH-2025-001" or "-" |
| Warehouse | warehouse_location, rack_number | "Warehouse A..." + "Rack: ..." |
| Available | quantity_available, stock_unit | "75 meters" with color badge |
| Action | - | "Remove" button |

---

## 🔍 Data Enrichment Process

### Step 1: Fetch from MRN
Backend retrieves materials_requested array from ProjectMaterialRequest:
```javascript
materials_requested: [
  { material_name: "Cotton", quantity_required: 50, ... },
  { material_name: "Thread", quantity_required: 10, ... }
]
```

### Step 2: Try Direct Lookup
For each material, attempt to find Inventory record by `inventory_id`:
```sql
SELECT * FROM inventory WHERE id = material.inventory_id
```

### Step 3: Try Name/Code Match
If not found, search by material name, code, or barcode:
```sql
SELECT * FROM inventory 
WHERE item_name LIKE '%material_name%' 
   OR item_code LIKE '%material_code%'
   OR barcode = 'barcode_scanned'
LIMIT 1
```

### Step 4: Build Enriched Object
Merge MRN material + Inventory details:
```javascript
return {
  ...mrnMaterial,           // Original fields
  inventory_id: inv?.id,    // New fields
  batch_number: inv?.batch_number,
  warehouse_location: inv?.warehouse_location,
  // ... all enriched fields
}
```

### Step 5: Transform for Form
Convert to form-friendly structure:
```javascript
{
  materialId: String(enriched.inventory_id || enriched.material_code),
  description: enriched.inventory_item_name || enriched.material_name,
  requiredQuantity: enriched.quantity_required || enriched.quantity,
  unit: enriched.stock_unit || enriched.unit,
  status: 'available',
  // Include enriched details for display
  batch_number: enriched.batch_number,
  warehouse_location: enriched.warehouse_location,
  // ... rest of enriched fields
}
```

---

## 🎨 Visual Display Examples

### Example 1: Complete Material Information

**Material Card:**
```
┌─────────────────────────────────────────────────────┐
│ Material #1                                         │
│                                                     │
│ 100% Premium Cotton Fabric                          │
│ Barcode: INV-12345-001                              │
│                                                     │
│ Required Qty: 50 meters      Available: 75 ✅       │
│ Batch: BATCH-2025-001        Category: Fabrics      │
│                                                     │
│ 📍 Warehouse Location                               │
│ Warehouse A, Zone 1, Rack: A1-R5                    │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Update Quantity: [50_______]                    │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Example 2: Table View with Multiple Materials

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✅ 3 material(s) loaded from project MRN                                     │
│ These materials are from the Material Request Note for this project.         │
│ Includes batch numbers, warehouse locations, and stock availability.        │
└─────────────────────────────────────────────────────────────────────────────┘

┌────┬─────────────────┬──────────┬──────┬──────────────┬─────────────────┬─────────────┬────────┐
│ #  │ Material        │ Req Qty  │ Unit │ Batch #      │ Warehouse       │ Available   │ Action │
├────┼─────────────────┼──────────┼──────┼──────────────┼─────────────────┼─────────────┼────────┤
│ 1  │ Cotton Fabric   │ [50____] │ m    │ BATCH-01     │ Warehouse A     │ 75 m ✅     │ Remove │
│    │ INV-12345-001   │          │      │              │ Rack: A1-R5     │             │        │
├────┼─────────────────┼──────────┼──────┼──────────────┼─────────────────┼─────────────┼────────┤
│ 2  │ Polyester       │ [10____] │ pcs  │ BATCH-02     │ Warehouse B     │ 200 ✅      │ Remove │
│    │ INV-12346-001   │          │      │              │ Rack: B2-R3     │             │        │
├────┼─────────────────┼──────────┼──────┼──────────────┼─────────────────┼─────────────┼────────┤
│ 3  │ Buttons Set     │ [5_____] │ set  │ BATCH-03     │ Warehouse C     │ 30 ✅       │ Remove │
│    │ INV-12347-001   │          │      │              │ Rack: C1-R2     │             │        │
└────┴─────────────────┴──────────┴──────┴──────────────┴─────────────────┴─────────────┴────────┘
```

---

## 🔐 Data Validation & Limits

| Aspect | Validation | Notes |
|--------|-----------|-------|
| Material Count | No limit | Can have 1 to 100+ materials |
| Quantity | Positive number | Must be > 0 |
| Batch Number | Text | Can be empty |
| Warehouse Location | Text | Can be empty |
| Barcode | Text/Alphanumeric | 13-15 chars typical |
| Availability Badge | Color-coded | Green (>0), Orange (0) |

---

## 📊 Sample Data Sets

### Minimum Fields (Material with no enrichment)
```javascript
{
  materialId: "",
  description: "Unknown Material",
  requiredQuantity: 0,
  unit: "pieces",
  status: "available"
}
```

### Standard Fields (Material with partial enrichment)
```javascript
{
  materialId: "123",
  description: "Cotton Fabric",
  requiredQuantity: 50,
  unit: "meters",
  status: "available",
  batch_number: "BATCH-001",
  warehouse_location: "Warehouse A",
  quantity_available: 75
}
```

### Complete Fields (Full enrichment)
```javascript
{
  materialId: "12345",
  description: "100% Premium Cotton Fabric",
  requiredQuantity: 50,
  unit: "meters",
  status: "available",
  batch_number: "BATCH-2025-001",
  warehouse_location: "Warehouse A, Zone 1",
  rack_number: "A1-R5",
  category: "Fabrics",
  material_type: "Natural",
  color: "Navy Blue",
  barcode: "INV-12345",
  inventory_barcode: "INV-12345-001",
  quantity_available: 75,
  stock_unit: "meters",
  mrn_request_number: "MRN-20250123-00001"
}
```

---

## 🎓 Understanding the Data

### What Each Field Tells You

- **materialId**: Unique reference for tracking and linking
- **description**: What the material is (for display)
- **requiredQuantity**: How much you need for this production
- **unit**: How it's measured (meters, pieces, kg, etc.)
- **batch_number**: Which batch/lot it came from (important for quality/recalls)
- **warehouse_location**: Where to find it physically
- **rack_number**: Specific storage location for efficiency
- **category**: Type of material (helps with organization)
- **material_type**: Natural/synthetic/blended (for specifications)
- **color**: Material color (important for visual identification)
- **quantity_available**: How much you have in stock (compare with required)

### Decision Points

Use this data to make decisions:

1. **Stock Sufficient?** Compare `quantity_available` vs `requiredQuantity`
   - If available ≥ required → ✅ Green badge
   - If available < required → ⚠️ Orange badge - may need to order more

2. **Batch Acceptable?** Check `batch_number`
   - May have quality notes or expiry dates in batch
   - Can track batch through production for quality control

3. **Location Efficient?** Check `warehouse_location` and `rack_number`
   - Can pick materials efficiently
   - Can plan logistics

---

**This reference ensures you understand exactly what data is being populated and where it comes from!**