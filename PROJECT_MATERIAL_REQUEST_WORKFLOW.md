# Project Material Request Workflow

## Overview

This document describes the **Project Material Request** workflow that enables seamless communication between Procurement, Manufacturing, and Inventory departments for project-based material management.

## Workflow Diagram

```
┌─────────────────┐
│   Procurement   │
│  Creates PO     │
│  with Project   │
└────────┬────────┘
         │
         │ Manual Trigger: "Send Request to Manufacturing"
         ▼
┌─────────────────────────────────────────┐
│  Project Material Request Created       │
│  Status: pending                        │
│  Notification → Manufacturing Dept      │
└────────┬────────────────────────────────┘
         │
         │ Manufacturing Reviews
         ▼
┌─────────────────────────────────────────┐
│  Manufacturing Reviews Request          │
│  Status: reviewed                       │
│  Action: Forward to Inventory           │
└────────┬────────────────────────────────┘
         │
         │ Forward to Inventory
         ▼
┌─────────────────────────────────────────┐
│  Request Forwarded to Inventory         │
│  Status: forwarded_to_inventory         │
│  Notification → Inventory Dept          │
└────────┬────────────────────────────────┘
         │
         │ Inventory Checks Stock
         ▼
┌─────────────────────────────────────────┐
│  Stock Availability Checked             │
│  Status: stock_available /              │
│          partial_available /            │
│          stock_unavailable              │
│  Notification → Manufacturing           │
└────────┬────────────────────────────────┘
         │
         │ If Stock Available
         ▼
┌─────────────────────────────────────────┐
│  Materials Reserved for Project         │
│  Status: materials_reserved             │
│  Inventory Status: reserved             │
│  Notification → Manufacturing           │
└────────┬────────────────────────────────┘
         │
         │ Materials Ready
         ▼
┌─────────────────────────────────────────┐
│  Materials Issued to Manufacturing      │
│  Status: materials_issued               │
│  Request Completed                      │
└─────────────────────────────────────────┘
```

## Database Schema

### Table: `project_material_requests`

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key |
| `request_number` | VARCHAR(50) | Format: PMR-YYYYMMDD-XXXXX |
| `purchase_order_id` | INT | Reference to PO |
| `sales_order_id` | INT | Reference to SO (optional) |
| `project_name` | VARCHAR(200) | Project name from PO |
| `request_date` | DATETIME | Request creation date |
| `expected_delivery_date` | DATETIME | Expected delivery from vendor |
| `materials_requested` | JSON | Array of material details |
| `total_items` | INT | Total number of materials |
| `total_value` | DECIMAL(12,2) | Total value of materials |
| `status` | ENUM | Current status (see below) |
| `priority` | ENUM | low, medium, high, urgent |
| `stock_availability` | JSON | Stock check results |
| `reserved_inventory_ids` | JSON | Reserved inventory IDs |
| `procurement_notes` | TEXT | Notes from procurement |
| `manufacturing_notes` | TEXT | Notes from manufacturing |
| `inventory_notes` | TEXT | Notes from inventory |
| `created_by` | INT | Procurement user |
| `reviewed_by` | INT | Manufacturing user |
| `forwarded_by` | INT | Manufacturing user |
| `processed_by` | INT | Inventory user |

### Status Values

1. **pending** - Request created, awaiting manufacturing review
2. **reviewed** - Manufacturing reviewed the request
3. **forwarded_to_inventory** - Manufacturing forwarded to inventory
4. **stock_checking** - Inventory checking stock availability
5. **stock_available** - All materials available in stock
6. **partial_available** - Some materials available
7. **stock_unavailable** - Materials not available
8. **materials_reserved** - Materials reserved for project
9. **materials_ready** - Materials ready for production
10. **materials_issued** - Materials issued to manufacturing
11. **completed** - Request fulfilled
12. **cancelled** - Request cancelled

## API Endpoints

### 1. Get All Requests
```
GET /api/project-material-requests
Query Params: page, limit, status, priority, project_name
Auth: procurement, manufacturing, inventory, admin
```

### 2. Get Single Request
```
GET /api/project-material-requests/:id
Auth: procurement, manufacturing, inventory, admin
```

### 3. Create Request from PO (Manual Trigger)
```
POST /api/project-material-requests/from-po/:poId
Body: {
  procurement_notes: string,
  priority: 'low' | 'medium' | 'high' | 'urgent'
}
Auth: procurement, admin
```

**Requirements:**
- PO must have a `project_name`
- PO must not already have a material request

**Actions:**
- Creates Project Material Request
- Sends notification to Manufacturing department

### 4. Forward to Inventory (Manufacturing)
```
POST /api/project-material-requests/:id/forward-to-inventory
Body: {
  manufacturing_notes: string
}
Auth: manufacturing, admin
```

**Requirements:**
- Status must be `pending` or `reviewed`

**Actions:**
- Updates status to `forwarded_to_inventory`
- Records reviewer and forwarder
- Sends notification to Inventory department

### 5. Check Stock Availability (Inventory)
```
POST /api/project-material-requests/:id/check-stock
Auth: inventory, admin
```

**Requirements:**
- Status must be `forwarded_to_inventory`

**Actions:**
- Searches inventory for matching materials
- Calculates availability for each material
- Updates status based on availability:
  - `stock_available` - All materials available
  - `partial_available` - Some materials available
  - `stock_unavailable` - No materials available
- Sends notification to Manufacturing with results

### 6. Reserve Materials (Inventory)
```
POST /api/project-material-requests/:id/reserve-materials
Body: {
  inventory_notes: string,
  inventory_ids: [1, 2, 3]
}
Auth: inventory, admin
```

**Requirements:**
- Status must be `stock_available` or `partial_available`

**Actions:**
- Updates inventory items status to `reserved`
- Links inventory items to project
- Updates request status to `materials_reserved`
- Sends notification to Manufacturing

### 7. Update Status
```
PATCH /api/project-material-requests/:id/status
Body: {
  status: string,
  notes: string
}
Auth: procurement, manufacturing, inventory, admin
```

## Frontend Implementation Guide

### 1. Procurement: Create Material Request

**Location:** Purchase Order Details Page

**UI Component:**
```jsx
// Add button in PO details page
{po.project_name && !po.materialRequests?.length && (
  <button 
    onClick={handleCreateMaterialRequest}
    className="btn btn-primary"
  >
    <FaPaperPlane /> Send Request to Manufacturing
  </button>
)}
```

**API Call:**
```javascript
const handleCreateMaterialRequest = async () => {
  try {
    const response = await fetch(
      `${API_URL}/project-material-requests/from-po/${poId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          procurement_notes: notes,
          priority: priority
        })
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      toast.success('Material request sent to manufacturing');
      // Refresh PO data
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error('Failed to create material request');
  }
};
```

### 2. Manufacturing: Review and Forward

**Location:** Manufacturing Dashboard / Material Requests Page

**UI Component:**
```jsx
// Material Request Card
<div className="material-request-card">
  <h3>{request.request_number}</h3>
  <p>Project: {request.project_name}</p>
  <p>Status: {request.status}</p>
  <p>Total Items: {request.total_items}</p>
  <p>Total Value: ₹{request.total_value}</p>
  
  {request.status === 'pending' && (
    <button onClick={handleForwardToInventory}>
      Forward to Inventory
    </button>
  )}
</div>
```

**API Call:**
```javascript
const handleForwardToInventory = async () => {
  try {
    const response = await fetch(
      `${API_URL}/project-material-requests/${requestId}/forward-to-inventory`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          manufacturing_notes: notes
        })
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      toast.success('Request forwarded to inventory');
      // Refresh requests
    }
  } catch (error) {
    toast.error('Failed to forward request');
  }
};
```

### 3. Inventory: Check Stock and Reserve

**Location:** Inventory Dashboard / Material Requests Page

**UI Component:**
```jsx
// Material Request Details
<div className="material-request-details">
  <h3>{request.request_number}</h3>
  
  {/* Materials List */}
  <table>
    <thead>
      <tr>
        <th>Material</th>
        <th>Requested Qty</th>
        <th>Available Qty</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {request.stock_availability?.map(item => (
        <tr key={item.material_name}>
          <td>{item.material_name}</td>
          <td>{item.requested_qty}</td>
          <td>{item.available_qty}</td>
          <td>
            <span className={`badge ${item.status}`}>
              {item.status}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  
  {/* Actions */}
  {request.status === 'forwarded_to_inventory' && (
    <button onClick={handleCheckStock}>
      Check Stock Availability
    </button>
  )}
  
  {(request.status === 'stock_available' || 
    request.status === 'partial_available') && (
    <button onClick={handleReserveMaterials}>
      Reserve Materials
    </button>
  )}
</div>
```

**API Calls:**
```javascript
// Check Stock
const handleCheckStock = async () => {
  try {
    const response = await fetch(
      `${API_URL}/project-material-requests/${requestId}/check-stock`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      toast.success('Stock availability checked');
      setStockAvailability(data.stockAvailability);
      // Refresh request
    }
  } catch (error) {
    toast.error('Failed to check stock');
  }
};

// Reserve Materials
const handleReserveMaterials = async () => {
  try {
    const response = await fetch(
      `${API_URL}/project-material-requests/${requestId}/reserve-materials`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          inventory_notes: notes,
          inventory_ids: selectedInventoryIds
        })
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      toast.success('Materials reserved successfully');
      // Refresh request
    }
  } catch (error) {
    toast.error('Failed to reserve materials');
  }
};
```

## Notifications

The system automatically creates notifications at each stage:

1. **Request Created** → Manufacturing Department
2. **Forwarded to Inventory** → Inventory Department
3. **Stock Check Complete** → Manufacturing Department
4. **Materials Reserved** → Manufacturing Department

## Testing Checklist

### Backend Testing

- [ ] Create Project Material Request from PO with project
- [ ] Verify error when PO has no project name
- [ ] Verify error when request already exists for PO
- [ ] Manufacturing can forward request to inventory
- [ ] Inventory can check stock availability
- [ ] Inventory can reserve materials
- [ ] Status updates correctly at each stage
- [ ] Notifications are created for each action
- [ ] All associations load correctly (PO, SO, Users)

### Frontend Testing

- [ ] Procurement can see "Send Request" button on PO page
- [ ] Button only shows when PO has project and no existing request
- [ ] Manufacturing receives notification
- [ ] Manufacturing can view request details
- [ ] Manufacturing can forward to inventory
- [ ] Inventory receives notification
- [ ] Inventory can check stock availability
- [ ] Stock availability displays correctly
- [ ] Inventory can reserve materials
- [ ] Status badges display correctly
- [ ] All department dashboards show relevant requests

## Future Enhancements

1. **Auto-trigger on PO Status Change**
   - Automatically create request when PO status changes to 'sent'
   
2. **Material Issuance Tracking**
   - Track when materials are physically issued to manufacturing
   
3. **Partial Fulfillment**
   - Allow partial material issuance for partial availability
   
4. **Return Tracking**
   - Track unused materials returned from manufacturing
   
5. **Analytics Dashboard**
   - Track request fulfillment times
   - Identify frequently unavailable materials
   - Monitor project material costs

6. **Email Notifications**
   - Send email alerts to department heads
   
7. **Mobile App Support**
   - Mobile interface for warehouse staff

## Related Documentation

- [GRN Implementation](./BARCODE_IMPLEMENTATION_SUMMARY.md)
- [Frontend Barcode Implementation](./FRONTEND_BARCODE_IMPLEMENTATION.md)
- [Inventory Management](./docs/inventory-management.md)

## Support

For issues or questions, contact the development team or create an issue in the project repository.