# Production Wizard Frontend Enhancement - Implementation Guide

## Overview
This guide details the frontend changes needed to implement the Production Wizard enhancement with order selection, auto-fill, and outsourcing capabilities.

## Key Changes Summary

### 1. New Step 0: Order Selection
- **Purpose**: Select an approved production approval (from MRN flow)
- **API Endpoint**: `GET /api/production-approval/list/approved`
- **Features**:
  - Dropdown/searchable list of approved orders
  - Display: Order number, customer/vendor, product, quantity, status
  - Auto-fill button to fetch complete order details

### 2. Auto-Fill Functionality
- **API Endpoint**: `GET /api/production-approval/:id/details`
- **Auto-populated Fields**:
  - Product ID, name, specifications
  - Quantity from sales/purchase order
  - Customer/vendor information
  - Project name and reference
  - Material requirements
  - Special instructions from order notes

### 3. Enhanced Customization Step
- **For Printing & Embroidery Stages**:
  - Toggle: In-house vs. Outsourced
  - If outsourced:
    - Vendor selection dropdown
    - Work order number field
    - Expected completion date picker
    - Design file upload (multiple files)
    - Vendor remarks textarea

## File Changes Required

### `ProductionWizardPage.jsx`

#### A. Update Step Configuration
```javascript
const stepConfig = [
  {
    title: 'Select Order',
    description: 'Choose an approved order to begin production.',
    icon: FileSearch, // New import needed
    key: 'orderSelection',
  },
  // ... existing 7 steps
];
```

#### B. Update Default Values
```javascript
const defaultValues = {
  orderSelection: {
    productionApprovalId: '',
    autoFilled: false,
  },
  // ... existing fields
};
```

#### C. Update Schema
```javascript
const orderSelectionSchema = yup.object({
  productionApprovalId: yup.string().required('Please select an approved order'),
  autoFilled: yup.boolean(),
});

const formSchema = yup.object({
  orderSelection: orderSelectionSchema,
  // ... existing schemas
});
```

#### D. Add State Variables
```javascript
const [approvedOrders, setApprovedOrders] = useState([]);
const [loadingOrders, setLoadingOrders] = useState(false);
const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
const [vendors, setVendors] = useState([]);
const [loadingVendors, setLoadingVendors] = useState(false);
```

#### E. Add API Functions
```javascript
// Fetch approved production approvals
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

// Fetch order details for auto-fill
const fetchOrderDetails = useCallback(async (approvalId) => {
  if (!approvalId) return;
  
  setLoadingProductDetails(true);
  try {
    const response = await api.get(`/production-approval/${approvalId}/details`);
    const data = response.data;
    setSelectedOrderDetails(data);
    
    // Auto-fill form fields
    methods.setValue('orderDetails.productId', String(data.product_id || ''));
    methods.setValue('orderDetails.quantity', data.quantity || '');
    methods.setValue('orderDetails.salesOrderId', data.sales_order_id ? String(data.sales_order_id) : '');
    methods.setValue('orderDetails.specialInstructions', data.special_instructions || '');
    
    // Auto-fill materials if available
    if (data.materials && Array.isArray(data.materials)) {
      methods.setValue('materials.items', data.materials.map(m => ({
        materialId: String(m.inventory_id || m.id),
        description: m.name || m.material_name || '',
        requiredQuantity: m.quantity_used || m.required_quantity || '',
        unit: m.unit || 'pieces',
        status: 'available',
      })));
    }
    
    methods.setValue('orderSelection.autoFilled', true);
    toast.success('Order details loaded successfully!');
  } catch (error) {
    console.error('fetch order details error', error);
    toast.error('Unable to load order details');
  } finally {
    setLoadingProductDetails(false);
  }
}, [methods]);

// Fetch vendors for outsourcing
const fetchVendors = useCallback(async () => {
  setLoadingVendors(true);
  try {
    const response = await api.get('/procurement/vendors', {
      params: { limit: 200 }
    });
    setVendors(response.data?.vendors || []);
  } catch (error) {
    console.error('fetch vendors error', error);
    toast.error('Unable to load vendors');
  } finally {
    setLoadingVendors(false);
  }
}, []);
```

#### F. Update useEffect
```javascript
useEffect(() => {
  fetchApprovedOrders();
  fetchVendors();
}, [fetchApprovedOrders, fetchVendors]);
```

### G. Create Step 0 Component: OrderSelectionStep
```javascript
const OrderSelectionStep = () => {
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
          className={`w-full px-4 py-2 border rounded-lg ${errors.orderSelection?.productionApprovalId ? 'border-red-500' : 'border-gray-300'}`}
          disabled={loadingOrders}
        >
          <option value="">-- Select an approved order --</option>
          {approvedOrders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.MaterialReceipt?.mrn_number || `Approval #${order.id}`}
              {' • '}
              {order.SalesOrder?.order_number || order.PurchaseOrder?.po_number || 'N/A'}
              {' • '}
              {order.SalesOrder?.Customer?.name || order.PurchaseOrder?.Vendor?.name || 'Unknown'}
              {' • '}
              Qty: {order.MaterialReceipt?.received_quantity || 0}
            </option>
          ))}
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
          className="w-full md:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Order Summary</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Customer/Vendor:</strong> {selectedOrderDetails.customer_name || selectedOrderDetails.vendor_name || 'N/A'}</p>
            <p><strong>Product:</strong> {selectedOrderDetails.product_name || 'N/A'}</p>
            <p><strong>Quantity:</strong> {selectedOrderDetails.quantity || 'N/A'}</p>
            <p><strong>Project:</strong> {selectedOrderDetails.project_name || 'N/A'}</p>
          </div>
        </div>
      )}

      <StepHint>
        💡 Select an approved order to automatically populate product details, quantities, and material requirements.
      </StepHint>
    </SectionCard>
  );
};
```

### H. Enhance CustomizationStep with Outsourcing

Update the stage fields to include outsourcing options:

```javascript
// In CustomizationStep component, for each stage field array item:

{/* Add these fields after stage name and duration */}

{/* Check if stage is printing or embroidery */}
{(field.stageName?.toLowerCase().includes('print') || 
  field.stageName?.toLowerCase().includes('embroid')) && (
  <>
    {/* In-house vs Outsourced Toggle */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Production Type
      </label>
      <select
        {...register(`customization.stages.${index}.isOutsourced`)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      >
        <option value="false">In-house</option>
        <option value="true">Outsourced to Vendor</option>
      </select>
    </div>

    {/* Show vendor fields only if outsourced */}
    {watch(`customization.stages.${index}.isOutsourced`) === 'true' && (
      <>
        {/* Vendor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Vendor <span className="text-red-500">*</span>
          </label>
          <select
            {...register(`customization.stages.${index}.vendorId`)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">-- Select Vendor --</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name} {vendor.company && `(${vendor.company})`}
              </option>
            ))}
          </select>
        </div>

        {/* Work Order Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Order Number
          </label>
          <input
            type="text"
            {...register(`customization.stages.${index}.workOrderNumber`)}
            placeholder="e.g., WO-2025-001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Expected Completion Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Completion Date
          </label>
          <input
            type="date"
            {...register(`customization.stages.${index}.expectedCompletionDate`)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Design Files Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Design Files
          </label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.ai,.cdr"
            onChange={(e) => handleFileUpload(e, index)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload design files (images, PDF, AI, CDR). Multiple files allowed.
          </p>
        </div>

        {/* Vendor Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vendor Instructions/Remarks
          </label>
          <textarea
            {...register(`customization.stages.${index}.vendorRemarks`)}
            rows={3}
            placeholder="Special instructions for the vendor..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Outsourcing Cost (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Cost (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            {...register(`customization.stages.${index}.outsourcingCost`)}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </>
    )}
  </>
)}
```

### I. Add File Upload Handler
```javascript
const [uploadedFiles, setUploadedFiles] = useState({});

const handleFileUpload = async (event, stageIndex) => {
  const files = Array.from(event.target.files);
  
  if (files.length === 0) return;
  
  try {
    // Option 1: Convert to base64 and store in form
    const filePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result, // base64
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    
    const fileData = await Promise.all(filePromises);
    
    // Store in form
    methods.setValue(
      `customization.stages.${stageIndex}.designFiles`,
      fileData
    );
    
    // Update local state for display
    setUploadedFiles(prev => ({
      ...prev,
      [stageIndex]: fileData
    }));
    
    toast.success(`${files.length} file(s) uploaded successfully`);
  } catch (error) {
    console.error('file upload error', error);
    toast.error('Failed to upload files');
  }
};
```

### J. Update Submission Payload

In the `buildSubmissionPayload` function, enhance the stage data:

```javascript
if (customization.useCustomStages) {
  payload.stages = customization.stages.map((stage, index) => {
    const stageData = {
      stage_name: stage.stageName,
      stage_order: index + 1,
      planned_duration_hours:
        stage.plannedDurationHours === '' || stage.plannedDurationHours === null
          ? null
          : Number(stage.plannedDurationHours),
      is_printing: stage.isPrinting || false,
      is_embroidery: stage.isEmbroidery || false,
    };

    // ... existing customization_type logic ...

    // Enhanced outsourcing info
    if (stage.isPrinting || stage.isEmbroidery) {
      const isOutsourced = stage.isOutsourced === 'true' || stage.isOutsourced === true;
      stageData.outsourced = isOutsourced;
      
      if (isOutsourced) {
        stageData.vendor_id = stage.vendorId ? Number(stage.vendorId) : null;
        stageData.work_order_number = stage.workOrderNumber || null;
        stageData.expected_completion_date = stage.expectedCompletionDate || null;
        stageData.design_files = stage.designFiles || null;
        stageData.vendor_remarks = stage.vendorRemarks || null;
        stageData.outsourcing_cost = stage.outsourcingCost ? Number(stage.outsourcingCost) : null;
        stageData.outsourced_at = new Date().toISOString();
      }
    }

    return stageData;
  });
}
```

### K. Update Main Render - Add Step 0

In the main render function where steps are rendered:

```javascript
const renderStep = () => {
  switch (currentStep) {
    case 0:
      return <OrderSelectionStep />;
    case 1:
      return <OrderDetailsStep />;
    case 2:
      return <SchedulingStep />;
    case 3:
      return <MaterialsStep />;
    case 4:
      return <QualityStep />;
    case 5:
      return <TeamStep />;
    case 6:
      return <CustomizationStep />;
    case 7:
      return <ReviewStep />;
    default:
      return null;
  }
};
```

## Import Additions

Add these imports at the top of the file:

```javascript
import { FileSearch } from 'lucide-react';
```

## API Backend Requirements

Ensure these endpoints exist and return proper data:

1. `GET /api/production-approval/list/approved` - List of approved orders
2. `GET /api/production-approval/:id/details` - Complete order details for auto-fill
3. `GET /api/procurement/vendors` - List of vendors for outsourcing

## Testing Checklist

- [ ] Step 0 displays approved orders correctly
- [ ] Auto-fill button populates all fields
- [ ] Outsourcing toggle shows/hides vendor fields
- [ ] Vendor dropdown loads correctly
- [ ] File upload works and displays uploaded files
- [ ] Date picker for expected completion works
- [ ] Form validation includes new fields
- [ ] Submission payload includes all outsourcing data
- [ ] Backend receives and processes outsourcing data correctly

## Notes

- File uploads use base64 encoding for simplicity
- Consider implementing a separate file upload API for large files
- Vendor selection should filter vendors capable of printing/embroidery services
- Add visual indicators for outsourced stages in the review step
- Consider adding notifications to vendors when orders are outsourced to them