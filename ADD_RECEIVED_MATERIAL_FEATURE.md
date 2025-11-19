# Add Received Material Feature - Implementation Guide

## Overview
Added "Add Received Material" functionality to the Material Allocation Dashboard (`/inventory/allocation`) to allow inventory managers to allocate additional materials from warehouse stock to specific project allocations.

## Features Implemented

### Frontend (ProjectAllocationDashboard.jsx)

#### 1. **New State Variables**
```javascript
const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
const [selectedProjectForAdd, setSelectedProjectForAdd] = useState(null);
const [availableWarehouseItems, setAvailableWarehouseItems] = useState([]);
const [loadingWarehouseItems, setLoadingWarehouseItems] = useState(false);
const [selectedMaterial, setSelectedMaterial] = useState(null);
const [addMaterialQuantity, setAddMaterialQuantity] = useState('');
const [addMaterialNotes, setAddMaterialNotes] = useState('');
```

#### 2. **New Button in ProjectDetailsPanel**
- Location: Expanded project details row
- Label: "Add Received Material" 
- Icon: Plus icon (FaPlus)
- Styling: Blue primary button with hover effect
- Position: Top-right of the project details panel

#### 3. **AddMaterialModal Component**
New modal dialog with:
- **Header Section**: Shows project order number and customer name
- **Material Selection**: Displays available warehouse items in a table with:
  - Product Name
  - Category (badge)
  - Available Stock
  - Unit Cost
  - Radio button selection
- **Quantity Input**: 
  - Number input field
  - Shows maximum available quantity
  - Validates input is > 0
- **Notes Field**: Optional textarea for allocation notes
- **Action Buttons**:
  - Cancel: Close modal without saving
  - Add Material: Submit (disabled until material + quantity selected)

#### 4. **Key Functions**

**fetchAvailableWarehouseItems()**
- Fetches warehouse stock items available for allocation
- Called when modal opens
- Filters to show only items with available stock

**handleOpenAddMaterialModal(project)**
- Opens the modal for the selected project
- Resets form fields
- Loads available warehouse items

**handleAddMaterialToProject()**
- Validates material selection and quantity
- Calls backend API to create allocation
- Shows success/error toast notifications
- Refreshes project details and warehouse stock

### Backend (server/routes/inventory.js)

#### New Endpoint: POST `/inventory/allocations/add-material`

**Authentication & Authorization**
- Required: JWT token via `authenticateToken` middleware
- Allowed Departments: 'inventory', 'admin'

**Request Body**
```javascript
{
  sales_order_id: number,      // Project sales order ID
  inventory_id: number,         // Warehouse inventory item ID
  quantity: number,             // Quantity to allocate
  notes: string (optional)      // Optional allocation notes
}
```

**Validation**
- All required fields present
- Quantity > 0
- Source inventory item exists
- Sufficient stock available in warehouse

**Process**
1. Fetch source warehouse inventory item
2. Create new inventory record with `stock_type: 'project_specific'`
3. Reduce source warehouse stock
4. Create inventory movement records (for audit trail)
5. Return success response with allocation details

**Response (Success)**
```javascript
{
  success: true,
  message: "Material added to project allocation successfully",
  data: {
    inventory_id: number,
    product_name: string,
    quantity_allocated: number,
    warehouse_stock_remaining: number
  }
}
```

**Response (Error)**
- 400: Missing fields or invalid quantity
- 404: Source inventory not found
- 500: Server error

**Database Changes**
- Creates new Inventory record
- Updates source Inventory current_stock
- Creates 2 InventoryMovement records:
  1. From warehouse stock (shows reduction)
  2. To project allocation (shows receipt)

## How to Use

### For Users

1. **Navigate to Material Allocation Dashboard**
   - Go to `/inventory/allocation`
   - You'll see the "Project Allocations" tab

2. **Expand a Project**
   - Click the chevron icon on any project row to expand
   - View current materials allocated to that project

3. **Add New Material**
   - Click "Add Received Material" button
   - Select a material from the warehouse table
   - Enter the quantity to allocate
   - (Optional) Add notes explaining the allocation
   - Click "Add Material" button

4. **Verification**
   - Success toast appears
   - Project details refresh automatically
   - New material now appears in the project's materials list
   - Warehouse stock updated

### For Developers

**File Locations**
- Frontend: `client/src/pages/inventory/ProjectAllocationDashboard.jsx`
- Backend: `server/routes/inventory.js` (lines 2741-2836)
- API Endpoint: `POST /api/inventory/allocations/add-material`

**Testing the Endpoint with cURL**
```bash
curl -X POST http://localhost:5000/api/inventory/allocations/add-material \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "sales_order_id": 1,
    "inventory_id": 5,
    "quantity": 10,
    "notes": "Additional fabric for project"
  }'
```

**Testing the Endpoint with Postman**
1. Set request type to: POST
2. URL: `http://localhost:5000/api/inventory/allocations/add-material`
3. Headers: 
   - Content-Type: application/json
   - Authorization: Bearer [your_token]
4. Body (JSON):
   ```json
   {
     "sales_order_id": 1,
     "inventory_id": 5,
     "quantity": 10,
     "notes": "Test allocation"
   }
   ```

## Testing Scenarios

### Scenario 1: Successful Allocation
1. Go to Projects tab
2. Expand a project with status "active"
3. Click "Add Received Material"
4. Select a material with available stock > 0
5. Enter quantity less than available
6. Click "Add Material"
7. ✅ Success message appears
8. ✅ New material shown in project's materials list
9. ✅ Warehouse stock decreased
10. ✅ Project summary updated (allocated increased)

### Scenario 2: Insufficient Stock
1. Repeat steps 1-3
2. Select a material
3. Enter quantity greater than available
4. Click "Add Material"
5. ✅ Error message: "Available stock is only [amount]"

### Scenario 3: Invalid Quantity
1. Repeat steps 1-3
2. Select a material
3. Enter quantity 0 or negative
4. Click "Add Material"
5. ✅ Error message: "Quantity must be greater than 0"

### Scenario 4: No Material Selected
1. Repeat steps 1-3
2. Don't select a material
3. Try to click "Add Material"
4. ✅ Button remains disabled
5. ✅ No error (validation is on button state)

## Data Flow

```
User clicks "Add Received Material"
    ↓
Modal opens + fetches warehouse stock
    ↓
User selects material and enters quantity
    ↓
User clicks "Add Material"
    ↓
Frontend validates input
    ↓
API POST /inventory/allocations/add-material
    ↓
Backend validates and creates allocation
    ↓
Backend updates warehouse stock
    ↓
Backend creates audit trail (InventoryMovement)
    ↓
Success response with allocation details
    ↓
Frontend shows success toast
    ↓
Dashboard refreshes automatically
```

## Integration with Existing Features

### Inventory System Impact
- **Warehouse Stock**: Decreases when material allocated
- **Project Stock**: Increases with new allocation
- **Inventory Movements**: Audit trail created for all changes
- **Stock Alerts**: May trigger if warehouse falls below reorder level

### Dashboard Updates
- **Project Summary**: 
  - Total Allocated increases
  - Util % may increase
- **Materials Breakdown**: New row added for allocated material
- **Warehouse Stock Tab**: Shows decreased available stock

## Error Handling

### Frontend Error Cases
1. **No material selected**: "Please select material and enter quantity"
2. **Invalid quantity**: "Quantity must be greater than 0"
3. **Exceeds available stock**: "Available stock is only [amount]"
4. **API failure**: Uses error message from server response

### Backend Error Cases
1. **Missing fields**: 400 Bad Request
2. **Invalid quantity**: 400 Bad Request
3. **Item not found**: 404 Not Found
4. **Insufficient stock**: 400 Bad Request
5. **Server error**: 500 Internal Server Error

## Performance Considerations

1. **Warehouse Items Loading**: Fetches up to 100 items (can be increased via limit param)
2. **Modal Loading State**: Shows spinner while loading items
3. **Validation**: All validations done on frontend before API call
4. **Database Operations**: 
   - Creates 1 Inventory record
   - Updates 1 Inventory record
   - Creates 2 InventoryMovement records
   - Total ~4 database operations per allocation

## Security Considerations

1. **Authentication**: JWT token required
2. **Authorization**: Only 'inventory' and 'admin' departments allowed
3. **Input Validation**: All inputs validated on backend
4. **Audit Trail**: All changes recorded in InventoryMovement table with user ID

## Future Enhancements

1. **Bulk Allocation**: Add multiple materials in one operation
2. **Partial Allocation**: Allow splitting warehouse item across multiple projects
3. **Auto-reorder**: Trigger purchase order if warehouse stock falls too low
4. **Approval Workflow**: Optional approval step for allocations above threshold
5. **Material Recommendations**: Suggest materials based on project requirements
6. **Allocation History**: Show all allocations made to a project with timestamps

## Troubleshooting

### Modal not opening
- Check browser console for errors
- Verify user has 'inventory' or 'admin' department
- Check JWT token is valid

### Warehouse items not loading
- Check API endpoint `/inventory/allocations/warehouse-stock` is working
- Verify database connection
- Check for any network errors in browser DevTools

### Allocation fails with "Cannot read property 'available_stock'"
- Ensure wareHouse stock items are loaded with all required fields
- Check API response structure matches expected format

### Material not appearing in project after allocation
- Refresh the page
- Check project details are being refetched
- Verify database record was created

## Files Modified

### Frontend
- **client/src/pages/inventory/ProjectAllocationDashboard.jsx**
  - Added state management for modal
  - Added handler functions
  - Modified ProjectDetailsPanel to include button
  - Added AddMaterialModal component
  - Updated project details rendering to pass handler

### Backend
- **server/routes/inventory.js**
  - Added POST `/allocations/add-material` endpoint (lines 2741-2836)

## Related Endpoints

**GET Endpoints Used**
- `GET /inventory/allocations/projects-overview` - Fetch projects
- `GET /inventory/allocations/project/:salesOrderId` - Fetch project details
- `GET /inventory/allocations/warehouse-stock` - Fetch available materials

**POST Endpoint Added**
- `POST /inventory/allocations/add-material` - Add material to project

## Version Information
- Implemented: January 2025
- Status: Ready for Production
- Testing Status: Ready for QA testing