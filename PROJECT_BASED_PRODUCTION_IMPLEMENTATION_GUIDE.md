# Project-Based Production Order Implementation Guide

## ✅ CHANGES COMPLETED

### Backend Changes (manufacturing.js) - COMPLETED ✓

**File**: `server/routes/manufacturing.js`
**Lines Modified**: 367-491

#### What Changed:
1. **Validation Logic (Lines 394-425)**
   - ❌ OLD: Required `product_id`, `quantity`, `planned_start_date`, `planned_end_date`
   - ✅ NEW: Only requires `planned_start_date`, `planned_end_date`
   - ✅ NEW: Accepts EITHER (product_id + quantity) OR (project_reference/sales_order_id + materials)

2. **Request Parameters (Lines 391)**
   - ✅ ADDED: `project_reference` parameter support

3. **Quantity Calculation (Lines 451-459)**
   - ✅ NEW: If quantity not provided, calculates from `materials_required` sum
   - Example: 3 materials with qty [100, 50, 50] → final quantity = 200

4. **Production Order Creation (Lines 464-491)**
   - ✅ CHANGED: `product_id` now optional (nullable)
   - ✅ ADDED: Stores `project_based` flag in specifications
   - ✅ ADDED: Uses calculated quantity

#### Error Messages:
Old error (400):
```
"Missing required fields: product_id, quantity, planned_start_date, planned_end_date"
```

New error (400):
```
"Production order requires either: 
  (1) product_id + quantity, OR 
  (2) project_reference/sales_order_id + materials_required"
```

---

### Frontend Changes (ProductionWizardPage.jsx) - COMPLETED ✓

**File**: `client/src/pages/manufacturing/ProductionWizardPage.jsx`

#### 1. Schema Changes (Lines 94-114)
```javascript
// BEFORE:
quantity: yup.number().positive().required('Quantity is required'),
// Must select: productId, salesOrderId, etc.

// AFTER:
quantity: yup.number().nullable()
  .transform(value => Number.isNaN(value) ? null : value)
  .min(0, 'Quantity must be greater than or equal to zero'),
// quantity is now OPTIONAL - derived from materials

salesOrderId: yup.string().nullable().required('Sales Order is required'),
// projectId removed as unnecessary
```

#### 2. Default Values (Lines 184-191)
```javascript
// REMOVED: productId field
// Project comes from salesOrderId now
orderDetails: {
  productionType: 'in_house',
  quantity: '', // OPTIONAL
  priority: 'medium',
  salesOrderId: '', // This is the PROJECT identifier
  specialInstructions: '',
},
```

#### 3. Build Payload (Lines 2672-2705)
```javascript
// BEFORE:
product_id: orderDetails.productId ? Number(orderDetails.productId) : null,
quantity: Number(orderDetails.quantity),

// AFTER:
// REMOVED: product_id (not needed for project-based orders)
quantity: orderDetails.quantity ? Number(orderDetails.quantity) : null,
// quantity is OPTIONAL - backend will calculate from materials
sales_order_id: orderDetails.salesOrderId ? Number(orderDetails.salesOrderId) : null,
// sales_order_id identifies the PROJECT
materials_required: materials.items.map(material => ({...}))
// materials are pre-populated from MRN
```

#### 4. Console Logging (Lines 1202-1220)
- ✅ Updated to show PROJECT-BASED flow
- ✅ Shows material counts
- ✅ Clarifies quantity will be calculated

---

## 🎯 NEW PRODUCTION ORDER FLOW

### Step-by-Step User Journey:

```
1. ORDER SELECTION STEP
   └─ Select Production Approval (contains project/sales order reference)

2. ORDER DETAILS STEP
   └─ Select Sales Order (THIS IDENTIFIES THE PROJECT)
   └─ NO product selection needed
   └─ Quantity is OPTIONAL (will be calculated from materials)
   └─ When Sales Order selected → Auto-fetch MRN materials

3. SCHEDULING STEP
   └─ Set production start date
   └─ Set production end date

4. MATERIALS STEP
   └─ Materials AUTO-POPULATED from MRN for the project
   └─ Shows all materials received for that project
   └─ Can manually add/remove if needed

5. QUALITY, TEAM, CUSTOMIZATION STEPS
   └─ Same as before

6. REVIEW & SUBMIT
   └─ Creates ONE production order per PROJECT
   └─ Includes all MRN materials
   └─ Quantity calculated from materials (or use manual quantity if provided)
```

---

## 📝 FORM REQUIREMENTS

### What's Now REQUIRED:
✅ Production Type (In-House, Outsourced, Mixed)
✅ Priority (Low, Medium, High, Urgent)
✅ Sales Order ID (identifies the PROJECT)
✅ Planned Start Date
✅ Planned End Date
✅ At least 1 Material (auto-populated from MRN)

### What's NOW OPTIONAL:
✅ Quantity (will be calculated from materials)
❌ Product ID (completely removed - not needed)
✅ Estimated Hours
✅ Special Instructions
✅ Quality Checkpoints (minimum 1 required)

---

## 🧪 TESTING THE NEW FLOW

### Test Case 1: Create Order with MRN Materials
```
1. Navigate to: /manufacturing/wizard
2. Select Production Approval with sales order reference
3. Go to Order Details
4. Select a Sales Order (e.g., SO-2025-001)
5. Materials auto-populate from MRN
6. Set dates and priority
7. Submit
8. ✅ Expected: Order created with project_based=true, no product_id
```

### Test Case 2: Quantity Calculation
```
1. Create order with 3 materials:
   - Material A: 100 units
   - Material B: 50 units
   - Material C: 50 units
2. Leave Quantity field BLANK
3. Submit
4. ✅ Expected: Backend calculates quantity = 200
5. Check database: production_orders.quantity = 200
```

### Test Case 3: Manual Quantity
```
1. Create order with materials
2. Enter Quantity = 500 (manually override)
3. Submit
4. ✅ Expected: Uses your quantity (500), not calculated
```

### Test Case 4: Error Handling
```
1. Try to create order WITHOUT:
   - Sales Order: ❌ Error
   - Materials: ❌ Error
   - Start/End Dates: ❌ Error
2. ✅ Expected: Clear error messages
```

---

## 🔍 DATABASE VERIFICATION

### Query to Check Project-Based Orders:
```sql
-- Find orders created with new project-based flow
SELECT 
  id,
  production_number,
  project_reference,
  product_id,
  quantity,
  JSON_EXTRACT(specifications, '$.project_based') as is_project_based,
  created_at
FROM production_orders
WHERE JSON_EXTRACT(specifications, '$.project_based') = true
  OR (project_reference IS NOT NULL AND product_id IS NULL)
ORDER BY created_at DESC;
```

### Query to Check Calculated Quantities:
```sql
-- Orders with calculated quantities (from materials)
SELECT 
  po.id,
  po.production_number,
  po.quantity,
  COUNT(mr.id) as material_count,
  SUM(mr.required_quantity) as total_material_qty,
  po.project_reference
FROM production_orders po
LEFT JOIN material_requirements mr ON po.id = mr.production_order_id
WHERE po.product_id IS NULL
GROUP BY po.id
ORDER BY po.created_at DESC;
```

---

## 🚀 KEY IMPROVEMENTS

### BEFORE (Product-Centric):
```
❌ Requires selecting specific product
❌ One order per product
❌ Quantity must be manually entered
❌ Materials secondary, not primary
❌ Multiple small orders for same project
❌ 400 error if product_id missing
```

### AFTER (Project-Centric):
```
✅ Requires selecting PROJECT (via Sales Order)
✅ One order per PROJECT with all materials
✅ Quantity auto-calculated from MRN
✅ Materials PRIMARY source (from MRN)
✅ Single order groups all project materials
✅ No 400 error - flexible validation
```

---

## 📊 PRODUCTION ORDER CREATION MODES

### Mode 1: Classic (Product-Based) - Still Supported
```json
{
  "product_id": 5,
  "quantity": 100,
  "sales_order_id": null,
  "materials_required": [...],
  "planned_start_date": "2025-02-01",
  "planned_end_date": "2025-02-10"
}
```
✅ Still works - backward compatible

### Mode 2: Project-Based (NEW) - Recommended
```json
{
  "product_id": null,
  "quantity": null,
  "sales_order_id": 10,
  "materials_required": [
    { "description": "Fabric", "required_quantity": 100, "unit": "meters" },
    { "description": "Thread", "required_quantity": 50, "unit": "spools" },
    { "description": "Buttons", "required_quantity": 200, "unit": "pieces" }
  ],
  "planned_start_date": "2025-02-01",
  "planned_end_date": "2025-02-10"
}
```
✅ NEW - Recommended approach
✅ Quantity will be calculated: 100 + 50 + 200 = 350

---

## ⚠️ MIGRATION NOTES

### For Existing Orders:
- ✅ All existing orders still work (product_id based)
- ✅ New orders use project-based approach
- ✅ No database migration needed
- ✅ Fully backward compatible

### For Users:
- 📝 UI no longer shows product selection
- 📝 Quantity is optional
- 📝 Materials must come from MRN
- 📝 Sales Order is PRIMARY key

---

## 🔧 TROUBLESHOOTING

### Issue: "Sales Order is required"
**Solution**: Make sure to select a Sales Order in Order Details step

### Issue: "No materials found in MRN"
**Solution**: 
1. Check if MRN exists for the project
2. Verify MRN has received materials
3. Manually add materials to order

### Issue: "Quantity is 0"
**Solution**: Verify materials have requiredQuantity > 0

### Issue: Order created but quantity is wrong
**Solution**: Check the sum of all material quantities

---

## 📞 SUPPORT COMMANDS

### To View Recent Project-Based Orders:
```sql
SELECT * FROM production_orders 
WHERE JSON_EXTRACT(specifications, '$.project_based') = true 
ORDER BY created_at DESC 
LIMIT 10;
```

### To Fix Quantity for Existing Order:
```sql
UPDATE production_orders
SET quantity = (
  SELECT SUM(required_quantity) 
  FROM material_requirements 
  WHERE production_order_id = production_orders.id
)
WHERE product_id IS NULL 
AND project_reference IS NOT NULL;
```

---

## ✨ NEXT STEPS

1. ✅ Backend validation updated
2. ✅ Frontend schemas updated
3. ✅ Payload construction updated
4. 🔜 Test the new flow with real data
5. 🔜 Monitor for any issues
6. 🔜 Update documentation

---

## 📚 RELATED FILES

- Backend: `server/routes/manufacturing.js` (lines 367-491)
- Frontend: `client/src/pages/manufacturing/ProductionWizardPage.jsx` (lines 94-114, 184-191, 2672-2705)
- Order Dashboard: `client/src/pages/dashboards/ManufacturingDashboard.jsx`
- Database: Check `production_orders` and `material_requirements` tables
