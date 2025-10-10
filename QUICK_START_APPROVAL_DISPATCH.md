# Quick Start: Material Request Approval & Dispatch Workflow

## 🎯 What This Does

**ONE-CLICK WORKFLOW** that automatically:
1. ✅ Checks Material Request (MRN)
2. ✅ Verifies GRN received for project
3. ✅ Checks entire inventory stock
4. ✅ Approves if materials available
5. ✅ Dispatches materials to manufacturing
6. ✅ Deducts from inventory
7. ✅ Notifies manufacturing department

## 🚀 Quick Usage

### API Call
```bash
POST /api/project-material-requests/:id/approve-and-dispatch
Authorization: Bearer {token}
Content-Type: application/json

{
  "dispatch_notes": "Optional notes",
  "force_dispatch": false  // true = dispatch partial stock
}
```

### Response
```json
{
  "success": true,
  "message": "All materials available in stock. Request approved for dispatch.",
  "approval_status": "approved",  // approved | partial | rejected
  "materialRequest": { ... },
  "grn_check": {
    "exists": true,
    "grn_numbers": ["GRN-20250117-00001"],
    "materials_received": [ ... ]
  },
  "stock_check": [
    {
      "material_name": "Cotton Fabric",
      "requested_qty": 50,
      "available_qty": 100,
      "shortage_qty": 0,
      "status": "available",
      "grn_received": true
    }
  ],
  "dispatch": {
    "id": 456,
    "dispatch_number": "DSP-20250117-00001",
    "total_items": 5,
    "dispatched_at": "2025-01-17T10:30:00Z"
  }
}
```

## 📋 Workflow Steps

```
┌─────────────────────────┐
│  Material Request (MRN) │
│  Status: pending        │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│  Check GRN Exists       │
│  For this Project/PO    │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│  Check Inventory Stock  │
│  Across All Locations   │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    │               │
    ↓               ↓
┌─────────┐   ┌─────────┐   ┌─────────┐
│   ALL   │   │  SOME   │   │  NONE   │
│Available│   │Available│   │Available│
└────┬────┘   └────┬────┘   └────┬────┘
     │             │             │
     ↓             ↓             ↓
  APPROVED      PARTIAL      REJECTED
     │             │             │
     ↓             ↓             ↓
  Dispatch      No Dispatch  No Dispatch
     │           (unless        │
     │         force=true)       │
     ↓             ↓             ↓
 Stock           Stock        Notify
 Deducted       Deducted     Shortage
     │             │             │
     ↓             ↓             ↓
 materials_issued  partial    stock_unavailable
```

## 🎨 Frontend Button Example

```jsx
import { Button, Alert, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../utils/api';

function ApproveDispatchButton({ mrnId }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        `/project-material-requests/${mrnId}/approve-and-dispatch`,
        { dispatch_notes: 'Auto-approved via system' }
      );
      
      setResult(response.data);
      
      if (response.data.approval_status === 'approved') {
        alert(`✅ Dispatch Created: ${response.data.dispatch.dispatch_number}`);
      } else if (response.data.approval_status === 'partial') {
        alert('⚠️ Partial stock available. Use force_dispatch to proceed.');
      } else {
        alert('❌ Materials not available in stock.');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Approve & Dispatch'}
      </Button>
      
      {result && (
        <Alert severity={
          result.approval_status === 'approved' ? 'success' : 
          result.approval_status === 'partial' ? 'warning' : 'error'
        }>
          {result.message}
          {result.dispatch && ` | Dispatch: ${result.dispatch.dispatch_number}`}
        </Alert>
      )}
    </>
  );
}
```

## 📊 Response Examples

### ✅ Success - All Materials Available
```json
{
  "success": true,
  "message": "All materials available in stock. Request approved for dispatch.",
  "approval_status": "approved",
  "dispatch": {
    "dispatch_number": "DSP-20250117-00001",
    "total_items": 5
  },
  "grn_check": {
    "exists": true,
    "grn_numbers": ["GRN-20250117-00001"]
  },
  "stock_check": [
    {
      "material_name": "Cotton Fabric",
      "requested_qty": 50,
      "available_qty": 100,
      "status": "available",
      "grn_received": true
    }
  ]
}
```

### ⚠️ Partial - Some Materials Available
```json
{
  "success": true,
  "message": "Some materials available. Partial dispatch possible.",
  "approval_status": "partial",
  "dispatch": null,  // Use force_dispatch: true to create dispatch
  "stock_check": [
    {
      "material_name": "Cotton Fabric",
      "requested_qty": 100,
      "available_qty": 50,
      "shortage_qty": 50,
      "status": "partial"
    }
  ]
}
```

### ❌ Rejected - No Materials Available
```json
{
  "success": true,
  "message": "Materials not available in stock. Request cannot be fulfilled.",
  "approval_status": "rejected",
  "dispatch": null,
  "stock_check": [
    {
      "material_name": "Cotton Fabric",
      "requested_qty": 100,
      "available_qty": 0,
      "shortage_qty": 100,
      "status": "unavailable"
    }
  ]
}
```

## 🔑 Key Features

### 1. GRN Verification
```json
"grn_check": {
  "exists": true,  // ← Were materials received?
  "grn_numbers": ["GRN-20250117-00001"],  // ← Which GRNs?
  "materials_received": [...]  // ← What was received?
}
```

### 2. Complete Stock Check
```json
"stock_check": [
  {
    "material_name": "Cotton Fabric",
    "requested_qty": 50,
    "available_qty": 100,  // ← Total across all inventory
    "shortage_qty": 0,
    "status": "available",
    "inventory_items": [  // ← Where is it located?
      {
        "id": 123,
        "location": "Warehouse A - Rack 5",
        "batch_number": "BATCH-2025-001",
        "barcode": "BAR-123456",
        "available_stock": 50
      },
      {
        "id": 124,
        "location": "Warehouse B - Rack 3",
        "batch_number": "BATCH-2025-002",
        "barcode": "BAR-123457",
        "available_stock": 50
      }
    ],
    "grn_received": true  // ← Was this in a GRN?
  }
]
```

### 3. Auto Stock Deduction
```
Before Dispatch:
- current_stock: 100
- available_stock: 100
- consumed_quantity: 0

After Dispatch (50 units):
- current_stock: 50      ← Reduced
- available_stock: 50    ← Reduced
- consumed_quantity: 50  ← Increased
- last_issue_date: 2025-01-17
```

### 4. Material Dispatch Record
```json
{
  "dispatch_number": "DSP-20250117-00001",
  "mrn_request_id": 123,
  "project_name": "School Uniform Project",
  "dispatched_materials": [
    {
      "material_name": "Cotton Fabric",
      "quantity_dispatched": 50,
      "uom": "Meters",
      "batch_number": "BATCH-2025-001",
      "location": "Warehouse A - Rack 5",
      "inventory_ids": [123, 124]  // ← Traceability
    }
  ],
  "dispatched_by": 45,
  "dispatched_at": "2025-01-17T10:30:00Z",
  "received_status": "pending"
}
```

## 🧪 Testing

### Test 1: Full Approval
```bash
# Setup
curl -X POST http://localhost:5000/api/project-material-requests/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Test Project",
    "materials_requested": [
      {
        "material_name": "Cotton Fabric",
        "quantity_required": 50,
        "uom": "Meters"
      }
    ]
  }'

# Get MRN ID from response
MRN_ID=123

# Approve and Dispatch
curl -X POST http://localhost:5000/api/project-material-requests/$MRN_ID/approve-and-dispatch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "dispatch_notes": "Test dispatch" }'

# Expected: approval_status = 'approved', dispatch created
```

### Test 2: Force Partial Dispatch
```bash
# Approve with force_dispatch
curl -X POST http://localhost:5000/api/project-material-requests/$MRN_ID/approve-and-dispatch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dispatch_notes": "Partial dispatch",
    "force_dispatch": true
  }'

# Expected: Dispatch created with available quantity only
```

## ⚠️ Important Notes

1. **Requires Inventory/Admin Role** - Only inventory or admin users can call this endpoint

2. **Transaction Safety** - Everything runs in a transaction. If anything fails, all changes are rolled back

3. **Stock is Immediately Deducted** - Once dispatch is created, inventory is reduced

4. **GRN Link** - GRN check only works if MRN has a `purchase_order_id`

5. **Partial Dispatch** - Set `force_dispatch: true` to dispatch partial stock

6. **Manufacturing Notification** - Automatic notification sent to manufacturing department

## 📞 Support

For issues or questions:
- Check full documentation: `INTEGRATED_APPROVAL_DISPATCH_WORKFLOW.md`
- Review API logs in `server.log`
- Test endpoint with Postman/Thunder Client

---

**Quick Reference:** Approve & Dispatch in ONE API call!
**Endpoint:** `POST /api/project-material-requests/:id/approve-and-dispatch`
**Version:** 1.0
**Last Updated:** January 17, 2025