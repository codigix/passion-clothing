# Production Order - PROJECT-BASED RESTRUCTURE

## PROBLEM IDENTIFIED 🚨

**Current (WRONG) Architecture**:
- Production orders created PER PRODUCT
- Requires: product_id, quantity, dates
- MRN materials are secondary (just prefill)
- Creates 400 error when product_id is null

```
User Flow: Product → Quantity → Dates → Order Created
Result: ❌ Creates multiple small orders instead of batches per project
```

**User's Requirement (CORRECT)**:
- Production orders created PER PROJECT
- Project identifies all materials via MRN
- No product selection needed
- MRN is PRIMARY source for material details

```
User Flow: Project → MRN Materials → Dates → Order Created
Result: ✅ Creates one order per project with all materials from MRN
```

---

## SOLUTION ARCHITECTURE 🏗️

### NEW PRODUCTION ORDER CREATION FLOW:

```
1. Select PROJECT (instead of product)
   ↓
2. System fetches MRN received for that project
   ↓
3. Materials auto-populate from MRN
   ↓
4. Schedule production dates
   ↓
5. Create ONE production order for entire project
   (with all materials from MRN, no product_id needed)
```

---

## CHANGES REQUIRED

### FRONTEND CHANGES (ProductionWizardPage.jsx)

**1. Remove Product Selection (ENTIRE Order Details Step)**
   - Line 99-110: Remove `productId` from schema
   - Line 180-186: Remove `productId` from defaultValues
   - Line 1293-1294: OrderDetailsStep - remove product dropdown

**2. Make Quantity Optional (comes from MRN)**
   - Line 99-103: Change `quantity` from required to optional
   - Line 2670: Allow `quantity` to be null in buildPayload

**3. Change Primary Key to PROJECT**
   - Update orderSelection to use PROJECT instead of approval order
   - OR keep approval order but don't extract product from it
   - Use `project_reference` / `project_name` as primary identifier

**4. Auto-Fetch MRN on Project Selection**
   - When project selected → fetch MRN for that project
   - Line 617-674: `fetchMRNMaterialsForProject()` already does this
   - Integrate this into project selection flow

**5. Update buildPayload Function (Line 2656-2737)**
   - Remove `product_id` requirement
   - Add `project_reference` / `project_name`
   - Allow `quantity` to be null or come from MRN

### BACKEND CHANGES (manufacturing.js)

**1. Modify POST /orders Endpoint (Line 367-399)**
   - Accept `project_reference` or `project_name` instead of product_id
   - Make `product_id` optional
   - Make `quantity` optional (can come from MRN total)
   - Line 394: Change validation from:
     ```javascript
     if (!product_id || !quantity || !planned_start_date || !planned_end_date)
     ```
     To:
     ```javascript
     if (!project_reference && !product_id) {
       // Must have either project or product
     }
     if (!quantity && !project_reference) {
       // quantity required only if no project
     }
     ```

**2. Auto-Fetch Materials from MRN**
   - If `project_reference` provided, fetch MRN for that project
   - Use MRN materials as production order materials
   - Calculate total quantity from MRN

**3. Create Auto-Staged Production with MRN Materials**
   - Initialize stages using production operation templates
   - Link to MRN for material tracking

---

## DATABASE IMPACT

**No schema changes needed** - Just use existing fields differently:
- `product_id` becomes OPTIONAL
- Add `project_reference` field (already exists in some models)
- Use `materials_required` for MRN materials

---

## STEP-BY-STEP IMPLEMENTATION

### STEP 1: Backend Changes (manufacturing.js)
- [ ] Modify validation to accept project-based orders
- [ ] Add project reference handling
- [ ] Auto-fetch MRN materials if project provided

### STEP 2: Frontend Schema Changes (ProductionWizardPage.jsx)
- [ ] Remove productId from orderDetailsSchema
- [ ] Make quantity optional
- [ ] Update defaultValues

### STEP 3: Frontend Step Updates
- [ ] Modify OrderSelectionStep to show projects instead of approvals
- [ ] Remove OrderDetailsStep product selection
- [ ] OR: Skip approval/product selection entirely, ask for project directly
- [ ] Auto-fetch MRN materials on project selection

### STEP 4: Update buildPayload
- [ ] Remove product_id from payload
- [ ] Add project_reference to payload
- [ ] Allow null quantity

### STEP 5: Testing
- [ ] Create production order without selecting product
- [ ] Verify MRN materials load correctly
- [ ] Verify order created with project reference

---

## IMPLEMENTATION DETAIL

### Option A: Minimal Change (RECOMMENDED)
Keep the approval order selection, but:
1. Get project_name from approval/sales_order
2. Use project_name to fetch MRN
3. Don't require product selection
4. Send project_name + MRN materials to backend

### Option B: Complete Overhaul
Remove approval order selection entirely:
1. New first step: Select PROJECT directly
2. Auto-load sales orders for that project
3. Auto-fetch MRN for that project
4. Create production order for project

**Recommendation: Use Option A (minimal change)**

---

## KEY FILES TO MODIFY

1. **d:\projects\passion-clothing\server\routes\manufacturing.js**
   - Lines 367-450 (POST /orders endpoint)

2. **d:\projects\passion-clothing\client\src\pages\manufacturing\ProductionWizardPage.jsx**
   - Lines 94-110 (schemas)
   - Lines 175-187 (defaultValues)
   - Lines 2656-2737 (buildPayload)
   - Step components (OrderDetailsStep especially)

---

## EXPECTED OUTCOMES

✅ After implementation:
- Production orders created per PROJECT (not product)
- Quantity comes from MRN received
- No product selection needed
- Materials auto-populated from MRN
- Multiple items in single production order
- 400 error FIXED (no missing product_id)

---

## DATABASE QUERIES FOR VERIFICATION

```sql
-- Check production orders created via project
SELECT id, production_number, project_reference, product_id, quantity 
FROM production_orders 
WHERE project_reference IS NOT NULL 
ORDER BY created_at DESC;

-- Check MRN linkage
SELECT po.id, po.production_number, po.project_reference, 
       m.materials_required
FROM production_orders po
WHERE po.project_reference IS NOT NULL;
```
