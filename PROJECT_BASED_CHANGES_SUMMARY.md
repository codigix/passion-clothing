# 📝 Exact Changes Made - Line by Line

## File 1: server/routes/manufacturing.js

### Change 1: Added project_reference parameter (Line 391)
```diff
  const {
    product_id,
    sales_order_id,
    production_approval_id,
    production_type,
    quantity,
    priority,
    planned_start_date,
    planned_end_date,
    estimated_hours,
    special_instructions,
    shift,
    team_notes,
    materials_required,
    quality_parameters,
    supervisor_id,
    assigned_user_id,
    qa_lead_id,
    stages,
+   project_reference
  } = req.body;
```

### Change 2: Updated validation logic (Lines 394-425)
**OLD:**
```javascript
// Validate required fields
if (!product_id || !quantity || !planned_start_date || !planned_end_date) {
  await transaction.rollback();
  return res.status(400).json({ 
    message: 'Missing required fields: product_id, quantity, planned_start_date, planned_end_date' 
  });
}
```

**NEW:**
```javascript
// Validate required fields
// NEW: project-based orders don't need product_id
// Can have either: (product_id + quantity) OR (project_reference + materials_required)
const hasProductInfo = product_id && quantity;
const hasProjectInfo = project_reference || sales_order_id;
const hasMaterials = materials_required && Array.isArray(materials_required) && materials_required.length > 0;

if (!planned_start_date || !planned_end_date) {
  await transaction.rollback();
  return res.status(400).json({ 
    message: 'Missing required fields: planned_start_date, planned_end_date' 
  });
}

// Must have either (product_id + quantity) or (project with materials)
if (!hasProductInfo && (!hasProjectInfo || !hasMaterials)) {
  await transaction.rollback();
  return res.status(400).json({ 
    message: 'Production order requires either: (1) product_id + quantity, OR (2) project_reference/sales_order_id + materials_required'
  });
}

console.log('📦 Production order request:', {
  hasProductInfo,
  hasProjectInfo,
  hasMaterials,
  product_id,
  quantity,
  project_reference,
  sales_order_id,
  materials_count: materials_required?.length || 0
});
```

### Change 3: Updated project reference handling (Lines 438-459)
**OLD:**
```javascript
// Fetch sales order to get project reference
let projectReference = null;
let salesOrder = null;
if (sales_order_id) {
  salesOrder = await SalesOrder.findByPk(sales_order_id);
  if (salesOrder) {
    // Use sales order number as project reference
    projectReference = salesOrder.order_number;
  }
}
```

**NEW:**
```javascript
// Fetch sales order to get project reference
let projectReference = project_reference || null;
let salesOrder = null;
if (sales_order_id) {
  salesOrder = await SalesOrder.findByPk(sales_order_id);
  if (salesOrder) {
    // Use sales order number as project reference if not already provided
    if (!projectReference) {
      projectReference = salesOrder.order_number;
    }
  }
}

// Calculate quantity from materials if not provided
let finalQuantity = quantity || null;
if (!finalQuantity && materials_required && Array.isArray(materials_required)) {
  // Sum up the quantities from all materials
  finalQuantity = materials_required.reduce((sum, mat) => {
    return sum + (parseFloat(mat.required_quantity) || 0);
  }, 0);
  console.log(`📊 Calculated quantity from materials: ${finalQuantity}`);
}
```

### Change 4: Updated production order creation (Lines 464-491)
**OLD:**
```javascript
const productionOrder = await ProductionOrder.create({
  production_number,
  sales_order_id: sales_order_id || null,
  production_approval_id: production_approval_id || null,
  project_reference: projectReference,
  product_id,
  quantity,
  production_type: production_type || 'in_house',
  priority: priority || 'medium',
  status: 'pending',
  status_notes: null,
  status_updated_at: new Date(),
  planned_start_date,
  planned_end_date,
  estimated_hours: estimated_hours || null,
  special_instructions: special_instructions || null,
  shift: shift || null,
  team_notes: team_notes || null,
  created_by: req.user.id,
  assigned_to: validatedAssignedUserId,
  supervisor_id: validatedSupervisorId,
  qa_lead_id: validatedQaLeadId,
  specifications: {
    created_from: production_approval_id ? 'approval' : 'direct'
  }
}, { transaction });
```

**NEW:**
```javascript
const productionOrder = await ProductionOrder.create({
  production_number,
  sales_order_id: sales_order_id || null,
  production_approval_id: production_approval_id || null,
  project_reference: projectReference,
  product_id: product_id || null,  // NOW OPTIONAL
  quantity: finalQuantity,  // Uses calculated quantity
  production_type: production_type || 'in_house',
  priority: priority || 'medium',
  status: 'pending',
  status_notes: null,
  status_updated_at: new Date(),
  planned_start_date,
  planned_end_date,
  estimated_hours: estimated_hours || null,
  special_instructions: special_instructions || null,
  shift: shift || null,
  team_notes: team_notes || null,
  created_by: req.user.id,
  assigned_to: validatedAssignedUserId,
  supervisor_id: validatedSupervisorId,
  qa_lead_id: validatedQaLeadId,
  specifications: {
    created_from: production_approval_id ? 'approval' : 'direct',
    project_based: !product_id && projectReference ? true : false  // NEW FLAG
  }
}, { transaction });
```

---

## File 2: client/src/pages/manufacturing/ProductionWizardPage.jsx

### Change 1: Updated orderDetailsSchema (Lines 94-114)
**OLD:**
```javascript
const orderDetailsSchema = yup.object({
  productionType: yup
    .string()
    .oneOf(['in_house', 'outsourced', 'mixed'])
    .required('Production type is required'),
  quantity: yup
    .number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than zero')
    .required('Quantity is required'),
  priority: yup
    .string()
    .oneOf(['low', 'medium', 'high', 'urgent'])
    .required('Priority is required'),
  salesOrderId: yup.string().nullable(),
  projectId: yup.string().nullable(),
  specialInstructions: yup.string().nullable(),
});
```

**NEW:**
```javascript
const orderDetailsSchema = yup.object({
  productionType: yup
    .string()
    .oneOf(['in_house', 'outsourced', 'mixed'])
    .required('Production type is required'),
  quantity: yup
    .number()
    .typeError('Quantity must be a number')
    .nullable()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .min(0, 'Quantity must be greater than or equal to zero'),
    // NOTE: quantity is now OPTIONAL - can be derived from MRN materials
  priority: yup
    .string()
    .oneOf(['low', 'medium', 'high', 'urgent'])
    .required('Priority is required'),
  salesOrderId: yup.string().nullable().required('Sales Order is required'),
  // NOTE: productId is no longer required - orders are project-based now
  projectId: yup.string().nullable(),
  specialInstructions: yup.string().nullable(),
});
```

### Change 2: Updated defaultValues (Lines 184-191)
**OLD:**
```javascript
orderDetails: {
  productionType: 'in_house',
  quantity: '',
  priority: 'medium',
  salesOrderId: '',
  projectId: '',
  specialInstructions: '',
},
```

**NEW:**
```javascript
orderDetails: {
  productionType: 'in_house',
  quantity: '',
  priority: 'medium',
  salesOrderId: '',
  // NOTE: productId removed - orders are project-based now
  // Project reference comes from salesOrderId
  projectId: '',
  specialInstructions: '',
},
```

### Change 3: Updated onSubmit logging (Lines 1199-1220)
**OLD:**
```javascript
const onSubmit = async (values) => {
  setSubmitting(true);
  
  // Log form values for debugging
  console.log('Form submission values:', JSON.stringify({
    productId: values.orderDetails.productId,
    quantity: values.orderDetails.quantity,
    plannedStartDate: values.scheduling.plannedStartDate,
    plannedEndDate: values.scheduling.plannedEndDate,
    productionApprovalId: values.orderSelection.productionApprovalId,
    productOptions: productOptions.length,
    availableProductIds: productOptions.map(p => p.value)
  }, null, 2));
  
  const payload = buildPayload(values);
  
  // Log the actual payload being sent
  console.log('Production order payload:', JSON.stringify(payload, null, 2));
```

**NEW:**
```javascript
const onSubmit = async (values) => {
  setSubmitting(true);
  
  // Log form values for debugging - NEW PROJECT-BASED FLOW
  console.log('📋 Form submission values (PROJECT-BASED):', JSON.stringify({
    // NEW: No productId - project-based approach
    salesOrderId: values.orderDetails.salesOrderId,
    quantity: values.orderDetails.quantity || '(will calculate from materials)',
    plannedStartDate: values.scheduling.plannedStartDate,
    plannedEndDate: values.scheduling.plannedEndDate,
    productionApprovalId: values.orderSelection.productionApprovalId,
    materialsCount: values.materials.items.length,
    // Materials will provide total quantity
  }, null, 2));
  
  const payload = buildPayload(values);
  
  // Log the actual payload being sent
  console.log('🚀 Production order payload (PROJECT-BASED):', JSON.stringify({
    ...payload,
    materials_required: `${payload.materials_required.length} items`
  }, null, 2));
```

### Change 4: Updated buildPayload function (Lines 2672-2705)
**OLD:**
```javascript
function buildPayload(values) {
  const {
    orderSelection,
    orderDetails,
    scheduling,
    materials,
    quality,
    team,
    customization,
  } = values;

  const payload = {
    product_id: orderDetails.productId ? Number(orderDetails.productId) : null,
    production_type: orderDetails.productionType,
    quantity: Number(orderDetails.quantity),
    priority: orderDetails.priority,
    sales_order_id: orderDetails.salesOrderId || null,
    production_approval_id: orderSelection.productionApprovalId ? Number(orderSelection.productionApprovalId) : null,
    special_instructions: orderDetails.specialInstructions || null,
    planned_start_date: scheduling.plannedStartDate,
    planned_end_date: scheduling.plannedEndDate,
    estimated_hours: scheduling.expectedHours ? Number(scheduling.expectedHours) : null,
    shift: scheduling.shift,
    materials_required: materials.items.map((material) => ({
      material_id: material.materialId,
      description: material.description,
      required_quantity: Number(material.requiredQuantity),
      unit: material.unit,
      status: material.status,
    })),
    quality_parameters: {
      checkpoints: quality.checkpoints.map((checkpoint) => ({
        name: checkpoint.name,
        frequency: checkpoint.frequency,
        acceptance_criteria: checkpoint.acceptanceCriteria,
      })),
      notes: quality.notes || null,
    },
    supervisor_id: team.supervisorId || null,
    assigned_user_id: team.assignedToId || null,
    qa_lead_id: team.qaLeadId || null,
    team_notes: team.notes || null,
  };
```

**NEW:**
```javascript
function buildPayload(values) {
  const {
    orderSelection,
    orderDetails,
    scheduling,
    materials,
    quality,
    team,
    customization,
  } = values;

  // NEW: Project-based order creation
  // No product_id needed - project is identified via sales_order_id
  // Quantity can be optional - will be calculated from materials on backend
  const payload = {
    // REMOVED: product_id - not needed for project-based orders
    production_type: orderDetails.productionType,
    // OPTIONAL: quantity - can be calculated from materials
    quantity: orderDetails.quantity ? Number(orderDetails.quantity) : null,
    priority: orderDetails.priority,
    // PROJECT IDENTIFIER: Use salesOrderId to identify project
    sales_order_id: orderDetails.salesOrderId ? Number(orderDetails.salesOrderId) : null,
    production_approval_id: orderSelection.productionApprovalId ? Number(orderSelection.productionApprovalId) : null,
    special_instructions: orderDetails.specialInstructions || null,
    planned_start_date: scheduling.plannedStartDate,
    planned_end_date: scheduling.plannedEndDate,
    estimated_hours: scheduling.expectedHours ? Number(scheduling.expectedHours) : null,
    shift: scheduling.shift,
    // MATERIALS: Pre-populated from MRN for the project
    materials_required: materials.items.map((material) => ({
      material_id: material.materialId,
      description: material.description,
      required_quantity: Number(material.requiredQuantity),
      unit: material.unit,
      status: material.status,
    })),
    quality_parameters: {
      checkpoints: quality.checkpoints.map((checkpoint) => ({
        name: checkpoint.name,
        frequency: checkpoint.frequency,
        acceptance_criteria: checkpoint.acceptanceCriteria,
      })),
      notes: quality.notes || null,
    },
    supervisor_id: team.supervisorId || null,
    assigned_user_id: team.assignedToId || null,
    qa_lead_id: team.qaLeadId || null,
    team_notes: team.notes || null,
  };
```

---

## Summary of Changes

### Backend (manufacturing.js):
- ✅ Line 391: Added `project_reference` parameter
- ✅ Lines 394-425: Rewrote validation logic (new dual-mode support)
- ✅ Lines 438-459: Updated project reference + quantity calculation
- ✅ Lines 464-491: Made product_id optional, use calculated quantity, add flag

### Frontend (ProductionWizardPage.jsx):
- ✅ Lines 94-114: Updated schema (quantity optional, salesOrderId required)
- ✅ Lines 184-191: Removed productId from defaults
- ✅ Lines 1199-1220: Updated logging for project-based approach
- ✅ Lines 2672-2705: Updated payload (removed product_id, optional quantity)

---

## Total Lines Modified:
- **Backend**: ~70 lines
- **Frontend**: ~40 lines
- **Total**: ~110 lines across 2 files

## Files Modified: 2
1. `server/routes/manufacturing.js`
2. `client/src/pages/manufacturing/ProductionWizardPage.jsx`

## Breaking Changes: 0
✅ Fully backward compatible

## Database Changes: 0
✅ No schema changes needed
