# PO Creation Flow Enhancement - Summary

## Overview
Enhanced the Purchase Order (PO) creation flow to include a pre-selection step where users can specify **Project Name**, **Vendor**, and **Material Type (Fabric/Accessories)** before navigating to the create PO form.

## Flow Architecture

### Step 1: Open Modal
User clicks "Create PO" button in Procurement Dashboard

### Step 2: Select Sales Order
Modal displays list of available sales orders:
- Search by order number, project name, or customer
- Filter by status (Draft/Confirmed)
- Shows customer, quantity, and PO count for each order
- Click to select an order

### Step 3: Configure PO Details (NEW)
After selecting a sales order, user fills:
1. **Project Name** - dropdown with autocomplete from database
2. **Vendor** - dropdown with all available vendors
3. **Material Type** - radio buttons (Fabric / Accessories)

### Step 4: Navigate to Create Form
System passes selected values as query parameters to the Create PO page, which pre-fills the form.

## Technical Changes

### 1. ProcurementDashboard.jsx
**New State Variables:**
```javascript
const [showPOFormStep, setShowPOFormStep] = useState(false);
const [vendorOptionsForPO, setVendorOptionsForPO] = useState([]);
const [projectNamesForPO, setProjectNamesForPO] = useState([]);
const [poFormData, setPoFormData] = useState({
  projectName: "",
  vendor: "",
  materialType: "fabric",
});
```

**Updated handleOpenCreatePOModal():**
- Fetches vendors from `/procurement/vendors` endpoint
- Extracts unique project names from all sales orders
- Initializes form data and shows first step

**Updated handleProceedToCreatePO():**
- Checks if user is on form step
- Validates project name and vendor selection
- Passes values as URL query parameters:
  - `project_name`
  - `vendor_id`
  - `material_type`

**Enhanced Modal UI:**
- Conditional rendering based on `showPOFormStep`
- Form section shows when user clicks "Next" after selecting SO
- Displays selected SO info in blue banner
- Input field for project name with autocomplete (datalist)
- Dropdown for vendor selection
- Radio buttons for material type

**Updated Footer Buttons:**
- "Back" button when on form step, "Cancel" when on SO list
- "Next" when on SO list, "Create PO" when on form step

### 2. CreatePurchaseOrderPage.jsx
**New Query Parameters:**
```javascript
const preselectedProjectName = searchParams.get("project_name");
const preselectedVendorId = searchParams.get("vendor_id");
const preselectedMaterialType = searchParams.get("material_type") || "fabric";
```

**Updated Sales Order Fetch:**
- Pre-fills `project_name` from query parameter (fallback to SO's `buyer_reference`)
- Pre-fills `vendor_id` from query parameter
- Maps items to correct material type based on `preselectedMaterialType`
- Maintains backward compatibility (works without query params)

## User Journey

### Scenario: Create PO from Sales Order with Pre-selection
1. **Dashboard**: Click "Create PO" button
2. **Modal - Step 1**: 
   - View list of available sales orders
   - Search/filter as needed
   - Select one order (highlighted in blue)
   - Click "Next"
3. **Modal - Step 2**:
   - See selected SO info
   - Type or select project name (autocomplete available)
   - Select vendor from dropdown
   - Choose material type (Fabric or Accessories)
   - Click "Create PO"
4. **Create Form**:
   - Pre-filled with selected vendor and project name
   - Material type determines item structure
   - Items from SO automatically mapped
   - User can still edit/adjust all fields
   - Submit to create PO

## Data Flow

```
Procurement Dashboard
    ↓
Open Modal (fetch vendors + projects)
    ↓
Sales Order Selection
    ↓
Next → Form Step
    ↓
Project Name + Vendor + Material Type Selection
    ↓
Create PO → Navigate with Query Params
    ↓
CreatePurchaseOrderPage
    ↓
Pre-fill Fields from Query Params
    ↓
Display Form (ready to submit)
```

## API Endpoints Used
- `GET /sales/orders?limit=100` - Fetch available sales orders
- `GET /procurement/vendors?limit=100` - Fetch vendor list
- `GET /sales/orders/{id}` - Fetch SO details (existing)

## Backward Compatibility
✅ All changes are backward compatible:
- Query parameters are optional
- Form works without pre-selected values
- Existing "Create PO" buttons in SO list still work
- All previous workflows remain functional

## Benefits

1. **Improved User Experience**: Guided workflow reduces form complexity
2. **Data Consistency**: Pre-filling reduces errors from manual entry
3. **Time Saving**: Users don't need to manually select vendor/project from large dropdowns
4. **Flexibility**: Support for both fabric and accessories procurement workflows
5. **Scalability**: Project list automatically updated from database

## Testing Checklist

- [ ] Modal opens with vendor and project lists
- [ ] Search and filter work in SO list
- [ ] "Next" button advances to form step
- [ ] Project name autocomplete works
- [ ] Vendor dropdown populated correctly
- [ ] Material type selection functional
- [ ] Form step shows selected SO info
- [ ] "Back" button returns to SO list
- [ ] "Create PO" button navigates with correct query params
- [ ] CreatePO form pre-fills vendor and project
- [ ] Items mapped to correct type (fabric/accessories)
- [ ] Form can be edited after pre-fill
- [ ] Cancel button closes modal from any step
- [ ] Works without query params (backward compat)

## Notes for Future Enhancement

- Could add vendor filtering based on material type specialization
- Could add project description/details in autocomplete
- Could add bulk PO creation for multiple items in one SO
- Could store user's preferred vendor for future use
