# Integrated Material Request Approval & Dispatch Workflow

## Overview
This document describes the comprehensive **MRN → GRN Check → Stock Check → Approval → Dispatch** workflow that automatically processes material requests from manufacturing and dispatches materials if available.

## 🎯 Workflow Features

### What It Does:
1. **Checks Material Request (MRN)** - Retrieves the material request details
2. **Verifies GRN Receipt** - Checks if materials from PO have been received via GRN
3. **Checks Entire Inventory Stock** - Scans all inventory for requested materials
4. **Auto-Approves if Available** - Automatically approves if all materials are in stock
5. **Creates Dispatch** - Generates dispatch slip and deducts from inventory
6. **Notifies Manufacturing** - Sends notification with dispatch details

## 🔗 API Endpoint

### **POST** `/api/project-material-requests/:id/approve-and-dispatch`

**Authorization:** Requires `inventory` or `admin` role

**Request Body:**
```json
{
  "dispatch_notes": "Optional notes for dispatch",
  "force_dispatch": false  // Set to true to force partial dispatch
}
```

## 📋 Workflow Steps

### Step 1: Get Material Request (MRN)
- Retrieves MRN with ID from request parameters
- Includes related Purchase Order, Sales Order, and User data
- Returns 404 if MRN not found

### Step 2: Check GRN Status
Verifies if GRN exists for the project's Purchase Order:
```json
{
  "grn_check": {
    "exists": true,
    "grn_numbers": ["GRN-20250117-00001", "GRN-20250117-00002"],
    "materials_received": [
      {
        "material_name": "Cotton Fabric",
        "received_quantity": 100,
        "unit": "Meters"
      }
    ]
  }
}
```

**Conditions:**
- Only checks if `purchase_order_id` exists on MRN
- GRN must have `verification_status = 'approved'`
- GRN must have `inventory_added = true`

### Step 3: Check Stock Availability
Scans entire inventory for each requested material:

**Search Criteria:**
- Product name matches material name (fuzzy matching)
- Product description matches material name
- Product code matches material name
- Quality status = 'approved'
- is_active = true

**Stock Calculation:**
```javascript
// For each material:
totalAvailable = Sum of all matching inventory items' available_stock
isAvailable = totalAvailable >= requestedQty
shortage = requestedQty - totalAvailable
```

**Result Structure:**
```json
{
  "stock_check": [
    {
      "material_name": "Cotton Fabric",
      "material_code": "FAB-001",
      "requested_qty": 50,
      "available_qty": 100,
      "shortage_qty": 0,
      "uom": "Meters",
      "status": "available",  // available | partial | unavailable
      "inventory_items": [
        {
          "id": 123,
          "product_name": "Cotton Fabric Blue",
          "product_code": "FAB-001-BL",
          "available_stock": 50,
          "batch_number": "BATCH-2025-001",
          "location": "Warehouse A - Rack 5",
          "barcode": "BAR-123456",
          "unit_cost": 25.50
        }
      ],
      "grn_received": true  // Was this material received via GRN?
    }
  ]
}
```

### Step 4: Determine Approval Status

**Logic:**
```javascript
if (allMaterialsAvailable || force_dispatch) {
  approvalStatus = 'approved'
  message = 'All materials available in stock. Request approved for dispatch.'
} else if (partiallyAvailable) {
  approvalStatus = 'partial'
  message = 'Some materials available. Partial dispatch possible.'
} else {
  approvalStatus = 'rejected'
  message = 'Materials not available in stock. Request cannot be fulfilled.'
}
```

**Status Mapping:**
- `approved` → MRN status = `stock_available`
- `partial` → MRN status = `partial_available`
- `rejected` → MRN status = `stock_unavailable`

### Step 5: Update Material Request
Updates MRN with:
- New status (stock_available / partial_available / stock_unavailable)
- Stock availability results (stored in JSON)
- Inventory notes (approval message)
- Processed by user ID
- Processed timestamp

### Step 6: Create Material Dispatch (If Approved)

**Conditions for Dispatch Creation:**
- `approvalStatus === 'approved'`, OR
- `approvalStatus === 'partial' AND force_dispatch === true`

**Dispatch Number Generation:**
```
Format: DSP-YYYYMMDD-XXXXX
Example: DSP-20250117-00001
```

**Materials Dispatched:**
- Only includes materials with status = 'available'
- If `force_dispatch = true`, includes partial quantities
- Stores inventory IDs for traceability

**Dispatch Record:**
```json
{
  "dispatch_number": "DSP-20250117-00001",
  "mrn_request_id": 123,
  "project_name": "School Uniform Project 2025",
  "dispatched_materials": [
    {
      "material_name": "Cotton Fabric",
      "material_code": "FAB-001",
      "quantity_dispatched": 50,
      "uom": "Meters",
      "barcode": "BAR-123456",
      "batch_number": "BATCH-2025-001",
      "location": "Warehouse A - Rack 5",
      "inventory_ids": [123, 124, 125]
    }
  ],
  "total_items": 3,
  "dispatch_notes": "All materials dispatched",
  "dispatched_by": 45,
  "dispatched_at": "2025-01-17T10:30:00Z",
  "received_status": "pending"
}
```

### Step 7: Deduct from Inventory

For each dispatched material:
```javascript
newCurrentStock = currentStock - quantityDispatched
newAvailableStock = availableStock - quantityDispatched
consumedQuantity += quantityDispatched
```

**Updates:**
- `current_stock` decreased
- `available_stock` decreased
- `consumed_quantity` increased
- `last_issue_date` updated to now
- `movement_type` set to 'outward'
- `last_movement_date` updated to now

**Status Update:**
- MRN status changed to `materials_issued`
- MRN `completed_at` timestamp set

### Step 8: Notification

**Notification Details:**
```json
{
  "type": "success",  // success | warning | error
  "title": "Material Request Approved & Dispatched",
  "message": "Material request MRN-20250117-00001 approved. Dispatch #DSP-20250117-00001 created for project 'School Uniform Project 2025'.",
  "priority": "medium",
  "status": "sent",
  "recipient_department": "manufacturing",
  "related_entity_id": 123,
  "related_entity_type": "material_request",
  "action_url": "/manufacturing/dispatches/456",
  "metadata": {
    "request_number": "MRN-20250117-00001",
    "dispatch_number": "DSP-20250117-00001",
    "project_name": "School Uniform Project 2025",
    "approval_status": "approved",
    "grn_exists": true,
    "grn_numbers": ["GRN-20250117-00001"],
    "total_items_requested": 5,
    "total_items_dispatched": 5,
    "stock_check_results": [...]
  },
  "trigger_event": "material_dispatched"
}
```

## 📤 Response Format

### Success Response (Material Dispatched)
```json
{
  "success": true,
  "message": "All materials available in stock. Request approved for dispatch.",
  "approval_status": "approved",
  "materialRequest": {
    "id": 123,
    "request_number": "MRN-20250117-00001",
    "project_name": "School Uniform Project 2025",
    "status": "materials_issued",
    "materials_requested": [...],
    "stock_availability": [...],
    "purchaseOrder": {...},
    "salesOrder": {...},
    "creator": {...},
    "processor": {...}
  },
  "grn_check": {
    "exists": true,
    "grn_numbers": ["GRN-20250117-00001"],
    "materials_received": [...]
  },
  "stock_check": [
    {
      "material_name": "Cotton Fabric",
      "requested_qty": 50,
      "available_qty": 100,
      "shortage_qty": 0,
      "status": "available",
      "inventory_items": [...]
    }
  ],
  "dispatch": {
    "id": 456,
    "dispatch_number": "DSP-20250117-00001",
    "total_items": 5,
    "dispatched_at": "2025-01-17T10:30:00Z",
    "materials": [...]
  }
}
```

### Partial Availability Response
```json
{
  "success": true,
  "message": "Some materials available. Partial dispatch possible.",
  "approval_status": "partial",
  "materialRequest": {...},
  "grn_check": {...},
  "stock_check": [
    {
      "material_name": "Cotton Fabric",
      "requested_qty": 100,
      "available_qty": 50,
      "shortage_qty": 50,
      "status": "partial",
      "inventory_items": [...]
    }
  ],
  "dispatch": null  // No dispatch created (use force_dispatch: true to create partial dispatch)
}
```

### Materials Unavailable Response
```json
{
  "success": true,
  "message": "Materials not available in stock. Request cannot be fulfilled.",
  "approval_status": "rejected",
  "materialRequest": {...},
  "grn_check": {...},
  "stock_check": [
    {
      "material_name": "Cotton Fabric",
      "requested_qty": 100,
      "available_qty": 0,
      "shortage_qty": 100,
      "status": "unavailable",
      "inventory_items": []
    }
  ],
  "dispatch": null
}
```

## 🔧 Usage Examples

### Example 1: Standard Approval & Dispatch
```javascript
// POST /api/project-material-requests/123/approve-and-dispatch
const response = await fetch('/api/project-material-requests/123/approve-and-dispatch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    dispatch_notes: 'Urgent dispatch for school uniform project'
  })
});

const result = await response.json();
console.log(result.approval_status); // 'approved' | 'partial' | 'rejected'
console.log(result.dispatch?.dispatch_number); // 'DSP-20250117-00001'
```

### Example 2: Force Partial Dispatch
```javascript
// Force dispatch even with partial availability
const response = await fetch('/api/project-material-requests/123/approve-and-dispatch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    dispatch_notes: 'Partial dispatch - remaining materials on backorder',
    force_dispatch: true  // Forces dispatch of available materials
  })
});
```

## 🎨 Frontend Integration

### Button Implementation
```jsx
import { useState } from 'react';
import { Button, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function ApproveAndDispatchButton({ mrnId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleApproveAndDispatch = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        `/project-material-requests/${mrnId}/approve-and-dispatch`,
        { dispatch_notes: 'Auto-dispatch via inventory system' }
      );
      
      setResult(response.data);
      
      if (response.data.approval_status === 'approved') {
        onSuccess(response.data.dispatch);
      }
    } catch (error) {
      console.error('Approval failed:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
        onClick={handleApproveAndDispatch}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Approve & Dispatch'}
      </Button>
      
      {result && (
        <Alert 
          severity={
            result.approval_status === 'approved' ? 'success' : 
            result.approval_status === 'partial' ? 'warning' : 
            'error'
          }
          sx={{ mt: 2 }}
        >
          {result.message}
          {result.dispatch && (
            <div>Dispatch Number: {result.dispatch.dispatch_number}</div>
          )}
        </Alert>
      )}
    </div>
  );
}
```

### Dashboard Display
```jsx
function MaterialRequestCard({ request }) {
  const hasGRN = request.stock_check?.some(item => item.grn_received);
  const allAvailable = request.stock_check?.every(item => item.status === 'available');
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{request.request_number}</Typography>
        <Typography>{request.project_name}</Typography>
        
        <Chip 
          label={hasGRN ? '✓ GRN Received' : '⚠ No GRN'} 
          color={hasGRN ? 'success' : 'warning'}
          size="small"
        />
        
        <Chip 
          label={allAvailable ? '✓ Stock Available' : '⚠ Stock Shortage'} 
          color={allAvailable ? 'success' : 'error'}
          size="small"
          sx={{ ml: 1 }}
        />
        
        <ApproveAndDispatchButton 
          mrnId={request.id}
          onSuccess={(dispatch) => {
            console.log('Dispatch created:', dispatch.dispatch_number);
          }}
        />
      </CardContent>
    </Card>
  );
}
```

## 🔒 Access Control

**Who Can Use This Endpoint:**
- ✅ Inventory Department users
- ✅ Admin users
- ❌ Manufacturing users (can only view results)
- ❌ Procurement users (can only view results)

## ⚠️ Important Notes

1. **Transaction Safety:** Entire workflow runs in a database transaction. If any step fails, everything is rolled back.

2. **Inventory Deduction:** Stock is immediately deducted upon dispatch creation. Ensure this is acceptable for your workflow.

3. **GRN Dependency:** GRN check only works if MRN has a `purchase_order_id`. Manufacturing-originated MRNs without POs will show `grn_exists: false`.

4. **Partial Dispatch:** By default, partial materials will NOT be dispatched. Set `force_dispatch: true` to allow partial dispatch.

5. **Notification:** Manufacturing department receives automatic notification with dispatch details.

6. **Stock Matching:** Uses fuzzy matching on product name, description, and code. Ensure proper naming conventions.

## 🧪 Testing

### Test Scenario 1: Full Stock Available
```bash
# Create MRN
POST /api/project-material-requests/create
{
  "project_name": "Test Project",
  "materials_requested": [
    { "material_name": "Cotton Fabric", "quantity_required": 50, "uom": "Meters" }
  ]
}

# Ensure inventory has sufficient stock (>= 50 meters)

# Approve and dispatch
POST /api/project-material-requests/{id}/approve-and-dispatch

# Expected: approval_status = 'approved', dispatch created, stock deducted
```

### Test Scenario 2: Partial Stock
```bash
# Ensure inventory has less than requested (e.g., 30 meters when 50 requested)

# Try without force
POST /api/project-material-requests/{id}/approve-and-dispatch
# Expected: approval_status = 'partial', NO dispatch created

# Try with force
POST /api/project-material-requests/{id}/approve-and-dispatch
{ "force_dispatch": true }
# Expected: approval_status = 'partial', dispatch created with 30 meters, stock deducted
```

### Test Scenario 3: No Stock
```bash
# Ensure inventory has 0 stock

# Approve and dispatch
POST /api/project-material-requests/{id}/approve-and-dispatch
# Expected: approval_status = 'rejected', NO dispatch created
```

## 📊 Status Flow

```
MRN Created (pending_inventory_review)
        ↓
   [Call API]
        ↓
Check GRN Exists ← ← ← [Purchase Order]
        ↓
Check Inventory Stock ← ← ← [Entire Inventory]
        ↓
┌───────┴───────┐
│               │
All Available   Some Available   None Available
│               │                │
↓               ↓                ↓
stock_available partial_available stock_unavailable
↓               ↓ (force)        ↓
Create Dispatch Create Dispatch  NO DISPATCH
↓               ↓                ↓
Deduct Stock    Deduct Stock     Notify Shortage
↓               ↓                ↓
materials_issued partially_issued stock_unavailable
↓               ↓                ↓
Notify Mfg      Notify Mfg       Notify Mfg
```

## 🚀 Future Enhancements

1. **Auto-Reserve on Approval:** Reserve stock before dispatch instead of immediate deduction
2. **Email Notifications:** Send email alerts for dispatch creation
3. **PDF Generation:** Auto-generate dispatch slip PDF
4. **Barcode Scanning:** Support barcode-based material picking
5. **Batch Selection:** Allow selection of specific batches for dispatch
6. **Delivery Tracking:** Add courier tracking integration
7. **Return Handling:** Support for material returns and re-stock

---

**Last Updated:** January 17, 2025
**Version:** 1.0
**Maintained by:** Zencoder Assistant