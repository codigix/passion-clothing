# Enhanced PO Creation Flow - 3-Step Process

## Overview
Completely restructured the PO creation workflow to be more intuitive and database-driven, with a 3-step process:
1. **Select Project** from database
2. **Select Sales Order** for that project
3. **Configure PO Details** (Vendor & Material Type)

## New User Journey

### Step 1: Project Selection
- User clicks "Create PO" button in Procurement Dashboard
- Modal opens showing project dropdown (fetched from database)
- Shows all projects from available sales orders
- Projects are automatically extracted from sales order data
- User selects one project
- Shows count of available sales orders for that project

### Step 2: Sales Order Selection
- After selecting project, "Next" button transitions to SO list
- Shows only sales orders for the selected project
- Filters available (Search & Status)
- Each card shows:
  - Order number
  - Customer name
  - Total quantity
  - PO count (if any already exist)
- User selects one sales order
- Click "Next" to proceed

### Step 3: Configure PO Details
- Shows selected project and sales order
- User selects vendor from dropdown (populated from `/procurement/vendors`)
- User selects material type: Fabric or Accessories
- Click "Create PO" to navigate to create form
- Form is pre-filled with all selected values

### Step 4: Create PO Form (Existing)
- Navigates to CreatePurchaseOrderPage with query parameters
- Form pre-filled with:
  - Vendor ID
  - Project Name
  - Material Type (determines item structure)
- Sales order items auto-populated and mapped to correct type
- User can edit any field
- Submit to create PO

## Technical Architecture

### State Management (ProcurementDashboard)
```javascript
// New states added:
const [showProjectStep, setShowProjectStep] = useState(true);
const [showPOFormStep, setShowPOFormStep] = useState(false);
const [vendorOptionsForPO, setVendorOptionsForPO] = useState([]);
const [projectNamesForPO, setProjectNamesForPO] = useState([]);
const [allSOForProjecting, setAllSOForProjecting] = useState([]);
const [selectedProjectForPO, setSelectedProjectForPO] = useState("");
const [poFormData, setPoFormData] = useState({
  projectName: "",
  vendor: "",
  materialType: "fabric",
});
```

### API Calls
**handleOpenCreatePOModal():**
```javascript
const [ordersRes, vendorsRes] = await Promise.all([
  api.get("/sales/orders?limit=200"),
  api.get("/procurement/vendors?limit=100"),
]);
```

**Data Processing:**
```javascript
// Extract unique project names from available orders
const projectNames = [
  ...new Set(availableOrders.map((o) => o.project_name || "Unassigned"))
].sort();

// Store all orders for filtering by project
setAllSOForProjecting(availableOrders);
setProjectNamesForPO(projectNames);
setVendorOptionsForPO(vendorOptions);
```

### Modal UI Structure

**Header (Dynamic):**
```
Step 1: Select Project       (showProjectStep = true)
Step 2: Select Sales Order   (showProjectStep = false, showPOFormStep = false)
Step 3: Configure PO Details (showPOFormStep = true)
```

**Content Sections:**
1. **Project Selection** - Dropdown with all available projects
   - Shows count of SOs for selected project
   - Green confirmation box

2. **Search & Filters** - Only shown during SO selection
   - Search by order number or customer
   - Filter by status (Draft/Confirmed)

3. **Sales Orders List** - Filtered by selected project
   - Only shows orders matching project
   - Ternary rendering: empty state OR list of orders

4. **PO Form** - Vendor & Material Type selection
   - Read-only project name display
   - Vendor dropdown (required)
   - Material type radio buttons

### Navigation Flow

```
Modal Opens (showProjectStep = true)
    ↓
User selects project → Click "Next"
    ↓
showProjectStep = false (shows SO list)
    ↓
User selects SO → Click "Next"
    ↓
showPOFormStep = true (shows vendor/material form)
    ↓
User selects vendor & material → Click "Create PO"
    ↓
Navigate with query params:
  - from_sales_order={soId}
  - project_name={projectName}
  - vendor_id={vendorId}
  - material_type={materialType}
    ↓
CreatePurchaseOrderPage pre-fills form
```

### Button Logic

**Back/Cancel Button:**
- On form step → "Back" (resets form data)
- On SO list → "Back to Projects" (returns to project selection)
- On project step → "Cancel" (closes modal)

**Next/Create Button:**
- On project step → "Next" (disabled until project selected)
- On SO list → "Next" (disabled until SO selected)
- On form step → "Create PO" (disabled until vendor selected)

### Sales Order Filtering

```javascript
salesOrdersForPO.filter((order) => {
  const matchesProject = order.project_name === selectedProjectForPO;
  
  const matchesSearch = !filterSOSearch || 
    order.order_number?.toLowerCase().includes(filterSOSearch) ||
    order.customer?.name?.toLowerCase().includes(filterSOSearch) ||
    order.customer_name?.toLowerCase().includes(filterSOSearch);

  const matchesStatus = filterSOStatus === "all" || 
    order.status === filterSOStatus;

  return matchesProject && matchesSearch && matchesStatus;
})
```

## CreatePurchaseOrderPage Integration

**Query Parameters:**
```javascript
const preselectedProjectName = searchParams.get("project_name");
const preselectedVendorId = searchParams.get("vendor_id");
const preselectedMaterialType = searchParams.get("material_type") || "fabric";
```

**Form Pre-filling:**
```javascript
setOrderData((prev) => ({
  ...prev,
  project_name: preselectedProjectName || so.buyer_reference || "",
  vendor_id: preselectedVendorId || "",
  // ... other fields
}));
```

**Item Type Mapping:**
- If `materialType = "accessories"` → all items mapped to accessories
- If `materialType = "fabric"` → normal type detection from SO items

## UI Components

### Project Selection Card
- Dropdown with projects
- Selection confirmation (green box)
- Shows count of available SOs

### Sales Order Cards
- Order number + status badge
- Customer name
- Total quantity
- PO count with purple info box
- Click to select (blue highlight)

### Configuration Form
- Blue info banner showing selections
- Vendor dropdown (required)
- Material type radios
- Disabled project name field

## Data Flow Diagram

```
Procurement Dashboard
    ↓
Click "Create PO"
    ↓
Fetch: Sales Orders + Vendors
    ↓
Extract: Unique project names
    ↓
Initialize Modal (showProjectStep = true)
    ↓
User selects project
    ↓
Click "Next" → showProjectStep = false
    ↓
Display: Filtered SOs for project
    ↓
User selects SO
    ↓
Click "Next" → showPOFormStep = true
    ↓
Display: Vendor + Material Type form
    ↓
User selects vendor & type
    ↓
Click "Create PO"
    ↓
Build query params with all selections
    ↓
Navigate to CreatePurchaseOrderPage?from_sales_order={soId}&project_name={name}&vendor_id={id}&material_type={type}
    ↓
CreatePO page pre-fills form
    ↓
User reviews/edits
    ↓
Submit to create PO
```

## Benefits

1. **Database-Driven**: Projects extracted from actual data
2. **Reduced Errors**: Pre-selection reduces manual entry mistakes
3. **Better UX**: Clear 3-step process is easier to follow
4. **Flexible**: Supports fabric and accessories workflows
5. **Scalable**: Automatically includes all projects in database
6. **Backward Compatible**: Works with existing SO data structure

## Error Handling

- Shows "No sales orders found" if project has no available SOs
- Toast notifications for missing selections
- Read-only project field prevents user confusion
- Clear button text ("Back to Projects" vs "Back" vs "Cancel")

## Testing Checklist

- [ ] Modal opens and loads projects from database
- [ ] Project dropdown shows all available projects
- [ ] Selecting project shows SO count
- [ ] "Next" button disabled until project selected
- [ ] SO list filters by selected project
- [ ] Search/filter work on SO list
- [ ] Clicking SO selects it (blue highlight)
- [ ] "Next" button advances to form step
- [ ] Form shows selected project and SO
- [ ] Vendor dropdown populated correctly
- [ ] Material type selection works
- [ ] "Create PO" button navigates with query params
- [ ] CreatePO form receives and pre-fills values
- [ ] Back button returns to previous step
- [ ] Can navigate back to project step
- [ ] Cancel closes modal from any step
- [ ] Form pre-fill validates correctly

## Known Limitations

- Projects must have `project_name` field populated in sales orders
- Requires at least 1 project to show in dropdown
- All features depend on vendor list API

## Future Enhancements

- Add bulk PO creation for multiple items
- Filter vendors by material type specialization
- Show project descriptions in dropdown
- Add recent projects list
- Support for more material types
- PO templates per project
