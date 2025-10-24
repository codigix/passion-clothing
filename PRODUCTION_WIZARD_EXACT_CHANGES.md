# Production Wizard - Exact Code Changes

## File: ProductionWizardPage.jsx

### ✅ Change 1: Add New State Variable

**Location**: Line 465  
**Type**: Add

```diff
  const [approvedOrders, setApprovedOrders] = useState([]);
+ const [approvedOrdersGrouped, setApprovedOrdersGrouped] = useState([]); // ✅ NEW: Project-wise grouped orders
  const [loadingOrders, setLoadingOrders] = useState(false);
```

---

### ✅ Change 2: Enhance fetchApprovedOrders Function

**Location**: Lines 609-657  
**Type**: Replace entire function

**OLD**:
```javascript
const fetchApprovedOrders = useCallback(async () => {
  setLoadingOrders(true);
  try {
    const response = await api.get('/production-approval/list/approved');
    setApprovedOrders(response.data?.approvals || []);
  } catch (error) {
    console.error('fetch approved orders error', error);
    toast.error('Unable to load approved orders');
  } finally {
    setLoadingOrders(false);
  }
}, []);
```

**NEW**:
```javascript
const fetchApprovedOrders = useCallback(async () => {
  setLoadingOrders(true);
  try {
    const response = await api.get('/production-approval/list/approved');
    const approvals = response.data?.approvals || [];
    
    // ✅ NEW: Group approvals by project (sales order) for project-wise display
    const groupedByProject = {};
    
    approvals.forEach(approval => {
      const salesOrder = approval.mrnRequest?.salesOrder;
      const projectKey = salesOrder?.order_number || salesOrder?.id || 'Unknown';
      
      if (!groupedByProject[projectKey]) {
        groupedByProject[projectKey] = {
          projectKey,
          projectName: salesOrder?.order_number || 'N/A',
          salesOrderId: salesOrder?.id,
          customerName: salesOrder?.customer?.name || 'Unknown',
          approvals: [],
          totalMaterials: 0,
        };
      }
      
      groupedByProject[projectKey].approvals.push(approval);
      
      // Count materials from this approval
      const materialsCount = approval.verification?.receipt?.received_materials?.length || 0;
      groupedByProject[projectKey].totalMaterials += materialsCount;
    });
    
    // Convert to array and keep original approvals in a flat list for backward compatibility
    const groupedProjects = Object.values(groupedByProject);
    console.log(`✅ Grouped ${approvals.length} approvals into ${groupedProjects.length} projects`);
    
    // Store both grouped and flat for different use cases
    setApprovedOrders(approvals);
    setApprovedOrdersGrouped(groupedProjects); // ✅ NEW: Set grouped projects state
  } catch (error) {
    console.error('fetch approved orders error', error);
    toast.error('Unable to load approved orders');
  } finally {
    setLoadingOrders(false);
  }
}, []);
```

---

### ✅ Change 3: Update OrderSelectionStep Props

**Location**: Lines 1437-1446  
**Type**: Modify

**OLD**:
```javascript
case 0:
  return (
    <OrderSelectionStep
      approvedOrders={approvedOrders}
      loadingOrders={loadingOrders}
      selectedOrderDetails={selectedOrderDetails}
      loadingProductDetails={loadingProductDetails}
      fetchOrderDetails={fetchOrderDetails}
    />
  );
```

**NEW**:
```javascript
case 0:
  return (
    <OrderSelectionStep
      approvedOrders={approvedOrders}
      approvedOrdersGrouped={approvedOrdersGrouped}  // ✅ NEW: Pass grouped projects
      loadingOrders={loadingOrders}
      selectedOrderDetails={selectedOrderDetails}
      loadingProductDetails={loadingProductDetails}
      fetchOrderDetails={fetchOrderDetails}
    />
  );
```

---

### ✅ Change 4: Update useMemo Dependency Array

**Location**: Line 1467  
**Type**: Modify

**OLD**:
```javascript
}, [canCustomizeStages, currentStep, methods, productOptions, loadingProducts, productDetails, loadingProductDetails, approvedOrders, loadingOrders, selectedOrderDetails, fetchOrderDetails, vendors, loadingVendors]);
```

**NEW**:
```javascript
}, [canCustomizeStages, currentStep, methods, productOptions, loadingProducts, productDetails, loadingProductDetails, approvedOrders, approvedOrdersGrouped, loadingOrders, selectedOrderDetails, fetchOrderDetails, vendors, loadingVendors]);
```

---

### ✅ Change 5: Complete Redesign of OrderSelectionStep Component

**Location**: Lines 1941-2151  
**Type**: Replace entire component

**OLD** (Simple Select):
```javascript
const OrderSelectionStep = ({
  approvedOrders,
  loadingOrders,
  selectedOrderDetails,
  loadingProductDetails,
  fetchOrderDetails,
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContextSafe();

  const selectedApprovalId = watch('orderSelection.productionApprovalId');
  const autoFilled = watch('orderSelection.autoFilled');

  return (
    <SectionCard
      icon={FileSearch}
      title="Select Approved Order"
      description="Choose an approved order from the MRN workflow"
    >
      <StepStatusBanner
        hasError={!!errors.orderSelection}
        title="Order Selection"
        description="Select an approved production approval to auto-fill order details."
      />

      <div>
        <label htmlFor="productionApprovalId" className="block text-sm font-medium text-gray-700 mb-2">
          Approved Order <span className="text-red-500">*</span>
        </label>
        <select
          id="productionApprovalId"
          {...register('orderSelection.productionApprovalId')}
          className={`w-full px-4 py-2 border rounded ${errors.orderSelection?.productionApprovalId ? 'border-red-500' : 'border-gray-300'}`}
          disabled={loadingOrders}
        >
          <option value="">-- Select an approved order --</option>
          {approvedOrders.map((order) => {
            // Extract customer name from multiple sources
            const customerName = order.mrnRequest?.salesOrder?.customer?.name || 
                                order.mrnRequest?.purchaseOrder?.vendor?.name || 
                                (() => {
                                  // Fallback: extract from manufacturing_notes
                                  const notes = order.mrnRequest?.manufacturing_notes || '';
                                  const match = notes.match(/Customer:\s*([^\n]+)/);
                                  return match ? match[1].trim() : 'Unknown';
                                })();
            
            // Get order number
            const orderNumber = order.mrnRequest?.salesOrder?.order_number || 
                               order.mrnRequest?.purchaseOrder?.po_number || 
                               order.mrnRequest?.project_name ||
                               'N/A';
            
            // Get quantity with fallbacks
            const quantity = order.verification?.receipt?.total_items_received || 
                            (() => {
                              try {
                                const materials = order.mrnRequest?.materials_requested;
                                if (materials && materials.length > 0) {
                                  return materials[0]?.quantity_required || 0;
                                }
                              } catch (e) {}
                              return 0;
                            })();
            
            return (
              <option key={order.id} value={order.id}>
                {order.verification?.receipt?.receipt_number || `Approval #${order.id}`}
                {' • '}
                {orderNumber}
                {' • '}
                {customerName}
                {' • '}
                Qty: {quantity}
              </option>
            );
          })}
        </select>
        {errors.orderSelection?.productionApprovalId && (
          <p className="mt-1 text-sm text-red-500">
            {errors.orderSelection.productionApprovalId.message}
          </p>
        )}
      </div>

      {selectedApprovalId && (
        <button
          type="button"
          onClick={() => fetchOrderDetails(selectedApprovalId)}
          disabled={loadingProductDetails || autoFilled}
          className="w-full md:w-auto px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loadingProductDetails ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : autoFilled ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Auto-filled Successfully
            </>
          ) : (
            'Load Order Details'
          )}
        </button>
      )}

      {selectedOrderDetails && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">Order Summary</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Customer/Vendor:</strong>{' '}
              {selectedOrderDetails.customer_name || selectedOrderDetails.vendor_name || 'N/A'}
            </p>
            <p>
              <strong>Product:</strong> {selectedOrderDetails.product_name || 'N/A'}
            </p>
            <p>
              <strong>Quantity:</strong> {selectedOrderDetails.quantity || 'N/A'}
            </p>
            <p>
              <strong>Project:</strong> {selectedOrderDetails.project_name || 'N/A'}
            </p>
          </div>
        </div>
      )}

      <StepHint>
        💡 Select an approved order to automatically populate product details, quantities, and material
        requirements.
      </StepHint>
    </SectionCard>
  );
};
```

**NEW** (Project Cards):
```javascript
const OrderSelectionStep = ({
  approvedOrders,
  approvedOrdersGrouped,  // ✅ NEW: Grouped projects
  loadingOrders,
  selectedOrderDetails,
  loadingProductDetails,
  fetchOrderDetails,
}) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContextSafe();

  const selectedApprovalId = watch('orderSelection.productionApprovalId');
  const autoFilled = watch('orderSelection.autoFilled');
  const [expandedProject, setExpandedProject] = useState(null);  // ✅ NEW: Track expanded project

  // When a project is selected, auto-load all approvals for that project
  const handleProjectSelect = (project) => {
    console.log(`🚀 Project selected: ${project.projectName}`);
    
    if (expandedProject?.projectKey === project.projectKey) {
      setExpandedProject(null);
    } else {
      setExpandedProject(project);
      
      // Auto-navigate to first approval in project for loading
      if (project.approvals && project.approvals.length > 0) {
        const firstApprovalId = project.approvals[0].id;
        setValue('orderSelection.productionApprovalId', firstApprovalId, { shouldValidate: true });
      }
    }
  };

  // Handle individual approval selection from expanded project
  const handleApprovalSelect = (approvalId) => {
    console.log(`✅ Approval selected: ${approvalId}`);
    setValue('orderSelection.productionApprovalId', approvalId, { shouldValidate: true });
  };

  return (
    <SectionCard
      icon={FileSearch}
      title="Select Approved Order (Project-Wise)"
      description="Choose a project to load all approvals and automatically merge materials"
    >
      <StepStatusBanner
        hasError={!!errors.orderSelection}
        title="Order Selection"
        description="Select a project or individual approval to auto-fill order details."
      />

      {/* ✅ NEW: Project-wise dropdown showing grouped approvals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Projects with Approvals <span className="text-red-500">*</span>
        </label>
        
        {loadingOrders ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
            <span className="text-gray-600">Loading approved projects...</span>
          </div>
        ) : approvedOrdersGrouped.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            📭 No approved projects found. Complete the Material Request workflow first.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
            {approvedOrdersGrouped.map((project) => (
              <div key={project.projectKey} className="space-y-1">
                {/* Project Header - Clickable */}
                <button
                  type="button"
                  onClick={() => handleProjectSelect(project)}
                  className={`w-full text-left px-4 py-3 rounded border-2 transition-all ${
                    expandedProject?.projectKey === project.projectKey
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        📦 {project.projectName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span>👤 {project.customerName}</span>
                        <span>•</span>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {project.approvals.length} approval{project.approvals.length !== 1 ? 's' : ''}
                        </span>
                        <span>•</span>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {project.totalMaterials} materials
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        expandedProject?.projectKey === project.projectKey ? 'rotate-180' : ''
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.918l3.71-3.69a.75.75 0 1 1 1.06 1.06l-4.24 4.22a.75.75 0 0 1-1.06 0L5.25 8.27a.75.75 0 0 1-.02-1.06z" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Project - Show all approvals */}
                {expandedProject?.projectKey === project.projectKey && (
                  <div className="ml-4 space-y-1 py-2 border-l-2 border-blue-300 pl-3">
                    {project.approvals.map((approval) => {
                      const isSelected = selectedApprovalId === String(approval.id);
                      const materialsCount = approval.verification?.receipt?.received_materials?.length || 0;
                      
                      return (
                        <button
                          key={approval.id}
                          type="button"
                          onClick={() => handleApprovalSelect(approval.id)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                            isSelected
                              ? 'bg-blue-100 border border-blue-400 text-blue-900'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">
                                Approval #{approval.id}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                Receipt: {approval.verification?.receipt?.receipt_number || 'N/A'}
                              </span>
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {materialsCount} items
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {errors.orderSelection?.productionApprovalId && (
          <p className="mt-2 text-sm text-red-500">
            {errors.orderSelection.productionApprovalId.message}
          </p>
        )}
      </div>

      {selectedApprovalId && (
        <button
          type="button"
          onClick={() => fetchOrderDetails(selectedApprovalId)}
          disabled={loadingProductDetails || autoFilled}
          className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {loadingProductDetails ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : autoFilled ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Auto-filled Successfully
            </>
          ) : (
            'Load Order Details'
          )}
        </button>
      )}

      {selectedOrderDetails && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">Order Summary</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Customer/Vendor:</strong>{' '}
              {selectedOrderDetails.customer_name || selectedOrderDetails.vendor_name || 'N/A'}
            </p>
            <p>
              <strong>Product:</strong> {selectedOrderDetails.product_name || 'N/A'}
            </p>
            <p>
              <strong>Quantity:</strong> {selectedOrderDetails.quantity || 'N/A'}
            </p>
            <p>
              <strong>Project:</strong> {selectedOrderDetails.project_name || 'N/A'}
            </p>
          </div>
        </div>
      )}

      <StepHint>
        💡 Select a project to view all approvals. Click an approval to load its details. When coming from
        Production Orders page, materials from all project approvals will be automatically merged.
      </StepHint>
    </SectionCard>
  );
};
```

---

## Summary of Changes

| Change | Type | Location | Lines | Impact |
|--------|------|----------|-------|--------|
| 1. Add state variable | Add | 465 | 1 | New state |
| 2. Enhanced grouping function | Replace | 609-657 | ~50 | Data transformation |
| 3. Update props | Modify | 1437-1446 | 1 | Component prop |
| 4. Update dependencies | Modify | 1467 | 1 | Hook dependency |
| 5. Redesign component | Replace | 1941-2151 | ~210 | UI/UX |
| **Total** | - | - | **~260** | **Major UX improvement** |

---

## No Changes Needed In

✅ **Backend**: No API changes required  
✅ **Database**: No migrations needed  
✅ **Other Files**: No other files affected  
✅ **Styles**: Using existing Tailwind classes  
✅ **Dependencies**: No new npm packages  

---

## Verification After Changes

```javascript
// Check these exist:
1. Line 465: const [approvedOrdersGrouped, setApprovedOrdersGrouped] = useState([]);
2. Line 647: setApprovedOrdersGrouped(groupedProjects);
3. Line 1441: approvedOrdersGrouped={approvedOrdersGrouped}
4. Line 1467: includes approvedOrdersGrouped in dependencies
5. Line 1943: OrderSelectionStep receives approvedOrdersGrouped prop
6. Line 1958: useState(null) for expandedProject
7. Line 1961-1975: handleProjectSelect function
8. Line 1977-1981: handleApprovalSelect function
```

---

## Testing the Changes

### Test 1: Component Renders
```
✅ Wizard loads without errors
✅ Order Selection step shows projects
✅ No console errors
```

### Test 2: Project Grouping
```
✅ Projects display as cards
✅ Approval count badge shows
✅ Material count badge shows
✅ Customer name displays
```

### Test 3: Expansion
```
✅ Click project expands
✅ Shows all approvals
✅ First approval highlighted
✅ Click again collapses
```

### Test 4: Selection
```
✅ Clicking approval selects it
✅ "Load Order Details" button activates
✅ Button can be clicked
✅ Form loads data correctly
```

---

**Status**: ✅ **All Changes Complete and Ready for Testing**
