# Production Wizard - Code Reference

## 🔍 All Code Changes - Line by Line

### **Change #1: Empty Materials Default (Lines 193-195)**

**File:** `ProductionWizardPage.jsx`

**BEFORE:**
```javascript
materials: {
  items: [
    {
      materialId: '',
      description: '',
      requiredQuantity: '',
      unit: '',
      status: 'available',
    },
  ],
},
```

**AFTER:**
```javascript
materials: {
  items: [],
},
```

**Reason:** No placeholder data before project selection
**Impact:** Clean form on initial load

---

### **Change #2: Form Reset on Project Change (Lines 868-900)**

**File:** `ProductionWizardPage.jsx`

**ADDED (NEW):**
```javascript
// Watch for sales order changes and reset form accordingly
useEffect(() => {
  const subscription = methods.watch((value, { name, type }) => {
    // When user changes the sales order selection, reset dependent fields
    if (name === 'orderSelection.salesOrderId' && type === 'change') {
      const newSalesOrderId = value.orderSelection.salesOrderId;
      const currentSalesOrderId = methods.getValues('orderDetails.salesOrderId');
      
      // If selection changed, reset the related fields
      if (newSalesOrderId !== currentSalesOrderId) {
        console.log('🔄 Sales order changed. Resetting dependent fields...');
        
        // Reset order details
        methods.setValue('orderDetails.productId', '');
        methods.setValue('orderDetails.quantity', '');
        methods.setValue('orderDetails.specialInstructions', '');
        
        // Reset scheduling
        methods.setValue('scheduling.plannedStartDate', '');
        methods.setValue('scheduling.plannedEndDate', '');
        methods.setValue('scheduling.shift', '');
        methods.setValue('scheduling.expectedHours', '');
        
        // Clear materials - important!
        methods.setValue('materials.items', []);
        
        // Reset autofilled flag
        methods.setValue('orderSelection.autoFilled', false);
      }
    }
  });
  return () => subscription.unsubscribe();
}, [methods]);
```

**Reason:** Clear old data when project changes
**Impact:** No more persistent old data

---

### **Change #3: OrderDetailsStep Conditional Rendering (Lines 1654-1713)**

**File:** `ProductionWizardPage.jsx`

**BEFORE:**
```javascript
const OrderDetailsStep = () => {
  const { watch } = useFormContextSafe();

  return (
    <SectionCard icon={ClipboardList} title="Production order basics" description="Capture the essential order metadata.">
      <StepHint>
        Product information is automatically loaded from the project selected in Step 1. Materials will be fetched from the project's material request in the Materials step.
      </StepHint>
      <Row>
        <SelectInput ... />
        <TextInput ... />
        <SelectInput ... />
      </Row>
      {/* More fields */}
    </SectionCard>
  );
};
```

**AFTER:**
```javascript
const OrderDetailsStep = () => {
  const { watch } = useFormContextSafe();
  const salesOrderId = watch('orderSelection.salesOrderId');

  return (
    <SectionCard icon={ClipboardList} title="Production order basics" description="Capture the essential order metadata.">
      {!salesOrderId ? (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-900">⚠️ Project Not Selected</p>
            <p className="text-xs text-amber-700 mt-1">
              Please go back to Step 1 and select a project/sales order first. 
              <br />Product information and quantity will be automatically loaded here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <StepHint>
            ✅ Product information is automatically loaded from the project selected in Step 1. 
            <br />Adjust production type and priority as needed. Materials will be fetched from the project's material request in Step 4.
          </StepHint>
          <Row>
            <SelectInput
              name="orderDetails.productionType"
              label="Production Type"
              required
              options={[
                { value: 'in_house', label: 'In-House' },
                { value: 'outsourced', label: 'Outsourced' },
                { value: 'mixed', label: 'Mixed' },
              ]}
            />
            <TextInput name="orderDetails.quantity" label="Quantity" type="number" required />
            <SelectInput
              name="orderDetails.priority"
              label="Priority"
              required
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </Row>
          <Row>
            <TextArea
              name="orderDetails.specialInstructions"
              label="Special Instructions"
              rows={3}
              placeholder="Note any production nuances, trims, or handling notes"
            />
          </Row>
        </>
      )}
    </SectionCard>
  );
};
```

**Reason:** Show warning when no project selected
**Impact:** Clear guidance for users

---

### **Change #4: SchedulingStep Conditional Rendering (Lines 1716-1755)**

**File:** `ProductionWizardPage.jsx`

**BEFORE:**
```javascript
const SchedulingStep = () => (
  <SectionCard icon={CalendarCheck} title="Plan the production timeline" description="Ensure scheduling aligns with capacity and promises.">
    <Row>
      <TextInput ... />
      {/* More fields */}
    </Row>
  </SectionCard>
);
```

**AFTER:**
```javascript
const SchedulingStep = () => {
  const { watch } = useFormContextSafe();
  const salesOrderId = watch('orderSelection.salesOrderId');

  return (
    <SectionCard icon={CalendarCheck} title="Plan the production timeline" description="Ensure scheduling aligns with capacity and promises.">
      {!salesOrderId ? (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-900">⚠️ Project Not Selected</p>
            <p className="text-xs text-amber-700 mt-1">
              Please go back to Step 1 and select a project/sales order first. 
              <br />Then you can plan the production timeline here.
            </p>
          </div>
        </div>
      ) : (
        <Row>
          <TextInput name="scheduling.plannedStartDate" label="Planned Start Date" type="date" required />
          <TextInput name="scheduling.plannedEndDate" label="Planned End Date" type="date" required />
          <SelectInput
            name="scheduling.shift"
            label="Shift"
            required
            options={[
              { value: 'day', label: 'Day Shift' },
              { value: 'morning', label: 'Morning Shift' },
              { value: 'afternoon', label: 'Afternoon Shift' },
              { value: 'evening', label: 'Evening Shift' },
              { value: 'night', label: 'Night Shift' },
              { value: 'flexible', label: 'Flexible' },
            ]}
          />
          <TextInput name="scheduling.expectedHours" label="Expected Hours" type="number" />
        </Row>
      )}
    </SectionCard>
  );
};
```

**Reason:** Consistent UX with Step 2
**Impact:** Better user guidance

---

### **Change #5: MaterialsStep Enhanced (Lines 1757-1905)**

**File:** `ProductionWizardPage.jsx`

**KEY ADDITIONS:**

#### **A. Add watch for salesOrderId:**
```javascript
const { control, formState: { errors }, watch } = useFormContextSafe();
const { fields, append, remove } = useFieldArray({ control, name: 'materials.items' });
const autoFilled = watch('orderSelection.autoFilled');
const salesOrderId = watch('orderSelection.salesOrderId');  // ← NEW
```

#### **B. Add 4 State Messages:**
```javascript
{/* STATE 1: No project selected */}
{!salesOrderId && (
  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-sm font-bold text-amber-900">⚠️ Project Not Selected</p>
      <p className="text-xs text-amber-700 mt-1">
        Please go back to Step 1 and select a project/sales order first. 
        <br />Materials will be automatically loaded from the project's Material Request.
      </p>
    </div>
  </div>
)}

{/* STATE 2: Project selected, loading */}
{salesOrderId && !autoFilled && (
  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-sm font-bold text-blue-900">🔄 Loading materials...</p>
      <p className="text-xs text-blue-700 mt-1">
        Fetching materials from the project's Material Request Number. Please wait...
      </p>
    </div>
  </div>
)}

{/* STATE 3: Materials loaded successfully */}
{autoFilled && fields.length > 0 && (
  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 flex items-start gap-3">
    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-sm font-bold text-blue-900">📦 Materials loaded from MRN</p>
      <p className="text-xs text-blue-700 mt-1">
        {fields.length} material(s) fetched from the Material Request Number for this project. 
        <br />✓ Read-only fields (ID, Description, Unit, Color, GSM, Width) are locked from MRN.
        <br />✓ Adjust Required Quantity and Status as needed before submission.
      </p>
    </div>
  </div>
)}

{/* STATE 4: No materials in MRN */}
{autoFilled && fields.length === 0 && (
  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-sm font-bold text-yellow-900">⚠️ No Materials Found in MRN</p>
      <p className="text-xs text-yellow-700 mt-1">
        No materials were found in the Material Request for this project. 
        <br />You can manually add materials below using the "Add Material" button.
      </p>
    </div>
  </div>
)}
```

#### **C. Update Add Material Button:**
```javascript
{/* BEFORE */}
<button
  type="button"
  onClick={() => append({ materialId: '', description: '', requiredQuantity: '', unit: '', status: 'available' })}
  className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 font-medium transition-colors"
>
  + Add Additional Material
</button>

{/* AFTER */}
{(fields.length === 0 || autoFilled) && (
  <button
    type="button"
    onClick={() => append({ 
      materialId: '', 
      description: '', 
      requiredQuantity: '', 
      unit: 'pieces', 
      status: 'available',
      barcode: '',
      location: '',
      color: '',
      gsm: '',
      width: '',
      condition: '',
      remarks: ''
    })}
    className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors text-sm"
  >
    {fields.length === 0 ? '➕ Add First Material' : '➕ Add Additional Material'}
  </button>
)}
```

**Reason:** Better UX with state-specific messaging and button text
**Impact:** Users understand what's happening at each step

---

## 📍 Quick Lookup Table

| What Changed | Lines | File | Purpose |
|-------------|-------|------|---------|
| materials.items default | 193-195 | ProductionWizardPage.jsx | Remove placeholder data |
| Form reset on project change | 868-900 | ProductionWizardPage.jsx | Clear old data |
| OrderDetailsStep warning | 1654-1713 | ProductionWizardPage.jsx | Conditional render |
| SchedulingStep warning | 1716-1755 | ProductionWizardPage.jsx | Conditional render |
| MaterialsStep messages | 1757-1905 | ProductionWizardPage.jsx | 4 state messages |

---

## 🔐 Key Code Patterns Used

### **Pattern 1: Conditional Rendering**
```javascript
{!condition ? (
  <WarningBox />
) : (
  <ContentBox />
)}
```

### **Pattern 2: Form Value Watching**
```javascript
const subscription = methods.watch((value, { name, type }) => {
  if (name === 'fieldName' && type === 'change') {
    // Do something when field changes
  }
});
```

### **Pattern 3: Form Field Clearing**
```javascript
methods.setValue('field.name', '');
methods.setValue('object.array', []);
```

### **Pattern 4: State Messages with Icons**
```javascript
<div className="bg-color-50 border-2 border-color-300 rounded-lg p-4 flex items-start gap-3">
  <Icon className="h-5 w-5 text-color-600 mt-0.5 flex-shrink-0" />
  <div>
    <p className="text-sm font-bold text-color-900">Title</p>
    <p className="text-xs text-color-700 mt-1">Message</p>
  </div>
</div>
```

---

## ✅ Verification Commands

### **Check that file was modified:**
```bash
# In PowerShell
Get-Content "d:\projects\passion-clothing\client\src\pages\manufacturing\ProductionWizardPage.jsx" | Select-String "materials: {" -A 2
```

### **Verify the empty materials default:**
```bash
# Should show: items: [],
grep -A 1 "materials: {" "d:\projects\passion-clothing\client\src\pages\manufacturing\ProductionWizardPage.jsx"
```

### **Check for useEffect hook:**
```bash
# Should show the new useEffect starting around line 869
grep -n "Watch for sales order changes" "d:\projects\passion-clothing\client\src\pages\manufacturing\ProductionWizardPage.jsx"
```

---

## 🚀 Copy-Paste Quick Fix

If you want to manually make changes:

**Change 1: Line ~194 - Replace with:**
```javascript
materials: {
  items: [],
},
```

**Change 2: Line ~869 - Add this entire block:**
```javascript
// Watch for sales order changes and reset form accordingly
useEffect(() => {
  const subscription = methods.watch((value, { name, type }) => {
    if (name === 'orderSelection.salesOrderId' && type === 'change') {
      const newSalesOrderId = value.orderSelection.salesOrderId;
      const currentSalesOrderId = methods.getValues('orderDetails.salesOrderId');
      if (newSalesOrderId !== currentSalesOrderId) {
        console.log('🔄 Sales order changed. Resetting dependent fields...');
        methods.setValue('orderDetails.productId', '');
        methods.setValue('orderDetails.quantity', '');
        methods.setValue('orderDetails.specialInstructions', '');
        methods.setValue('scheduling.plannedStartDate', '');
        methods.setValue('scheduling.plannedEndDate', '');
        methods.setValue('scheduling.shift', '');
        methods.setValue('scheduling.expectedHours', '');
        methods.setValue('materials.items', []);
        methods.setValue('orderSelection.autoFilled', false);
      }
    }
  });
  return () => subscription.unsubscribe();
}, [methods]);
```

---

**Status: ✅ Ready to deploy**
**All code snippets tested and verified**