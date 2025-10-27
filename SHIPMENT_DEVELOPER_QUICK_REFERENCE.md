# Shipment Dashboard - Developer Quick Reference

Quick guide for developers to understand and work with the shipment system.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Shipment Dashboard                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Tabs:                                                       │
│  1. Incoming Orders (ProductionOrders → Ready for shipment)  │
│  2. Active Shipments (All shipments with filters)            │
│  3. Delivery Tracking (In-transit shipments)                │
│  4. Courier Partners (Courier management)                   │
│  5. Performance Analytics (KPIs and reports)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Frontend │  │ Backend  │  │ Database │
   │ React    │→ │ Node.js  │→ │ MySQL    │
   │ Components │  │ API      │  │ Tables   │
   └──────────┘  └──────────┘  └──────────┘
```

---

## Key Components

### 1. ShipmentDashboard.jsx
**Location**: `client/src/pages/dashboards/ShipmentDashboard.jsx`

**Main Responsibilities**:
- Fetch and display dashboard statistics
- Manage incoming orders from manufacturing
- Display active shipments with filters
- Show delivery tracking information
- Manage courier partners
- Provide export functionality

**Key State**:
```javascript
const [tabValue, setTabValue] = useState(0);           // Current tab
const [shipments, setShipments] = useState([]);        // All shipments
const [incomingOrders, setIncomingOrders] = useState([]); // Production orders
const [stats, setStats] = useState({...});             // KPI stats
const [selectedShipment, setSelectedShipment] = useState(null); // For modal
```

**Key Methods**:
```javascript
fetchDashboardData()      // Get stats from /shipments/dashboard/stats
fetchShipments()          // Get shipments from /shipments
fetchIncomingOrders()     // Get orders from /shipments/orders/incoming
handleCreateShipment()    // Navigate to create shipment page
handleViewDetails()       // Open details modal
handleExport()            // Export shipments as CSV
```

### 2. ShipmentDetailsDialog.jsx
**Location**: `client/src/components/dialogs/ShipmentDetailsDialog.jsx`

**Main Responsibilities**:
- Display detailed information for shipments or production orders
- Show customer, product, shipping, and delivery information
- Support both production orders and actual shipments

**Key Props**:
```javascript
{
  isOpen: boolean,        // Modal visibility
  onClose: function,      // Close handler
  shipment: object        // Order or shipment data
}
```

**Data Structure Handling**:
```javascript
// Detects type and adapts layout
const isProductionOrder = shipment.production_number && !shipment.shipment_number;

// Handles both field names
const orderNumber = shipment.sales_order_number || 
                   shipment.salesOrder?.order_number || 
                   'N/A';
```

---

## API Endpoints

### GET /shipments/orders/incoming
**Purpose**: Fetch production orders ready for shipment

**Request**:
```javascript
GET /api/shipments/orders/incoming?status=completed&limit=20

Query Parameters:
- status: 'completed' (default) | 'quality_check' | 'ready_for_shipment'
- limit: number (default: 20)
```

**Response**:
```javascript
{
  orders: [
    {
      // Production Order ID
      id: number,
      production_number: "PRD-20250115-0001",
      production_status: "completed",
      status: "completed",  // For compatibility
      production_type: "in_house",
      priority: "high",
      quantity: 500,
      
      // Sales Order Linkage
      sales_order_id: number,
      sales_order_number: "SO-2025-001",
      order_number: "SO-2025-001",  // Alias
      sales_order_status: "in_production",
      
      // Customer Information
      customer_name: "Acme Corp",
      customer_phone: "+91-98765-43210",
      customer_email: "contact@acmecorp.com",
      
      // Product Information
      product_id: number,
      product_name: "Cotton T-Shirt",
      product_code: "CSH-001",
      product_status: "active",
      product_barcode: "8901234567890",
      product_description: "Premium cotton shirt",
      
      // Delivery Information
      shipping_address: "123 Business Park, Delhi, India",
      
      // Dates
      planned_completion: "2025-01-15",
      actual_completion: "2025-01-14",
      last_updated: "2025-01-14T10:30:00Z",
      updated_at: "2025-01-14T10:30:00Z",  // Alias
      
      // Additional
      items: [],
      specifications: {}
    }
  ],
  total: 5
}
```

### GET /shipments
**Purpose**: Fetch all shipments with filtering

**Response**:
```javascript
{
  shipments: [
    {
      id: number,
      shipment_number: "SHP-20250115-0001",
      tracking_number: "TRK-2025-001",
      status: "in_transit",
      
      // Sales Order Link
      sales_order_id: number,
      salesOrder: {
        id: number,
        order_number: "SO-2025-001",
        customer: {
          id: number,
          name: "Acme Corp",
          email: "contact@acmecorp.com",
          phone: "+91-98765-43210"
        }
      },
      
      // Recipient Info
      recipient_name: "John Doe",
      recipient_phone: "+91-98765-43210",
      
      // Shipping Info
      courier_partner_id: number,
      courierPartner: {
        id: number,
        name: "Express Delivery"
      },
      courier_company: "Express Delivery",
      shipping_method: "standard",
      shipping_address: "123 Main St, Bangalore",
      
      // Dates
      shipment_date: "2025-01-15",
      expected_delivery_date: "2025-01-20",
      actual_delivery_date: null,
      
      // Package Details
      total_quantity: 500,
      total_weight: "100.5 kg",
      shipping_cost: 500,
      
      // Tracking
      trackingUpdates: [
        {
          id: number,
          shipment_id: number,
          status: "in_transit",
          location: "Delhi Hub",
          description: "Package in transit",
          timestamp: "2025-01-15T14:30:00Z"
        }
      ],
      
      // Metadata
      last_status_update: "2025-01-15T14:30:00Z",
      created_at: "2025-01-15T10:00:00Z"
    }
  ],
  pagination: {
    total: 20,
    page: 1,
    limit: 10,
    totalPages: 2
  }
}
```

---

## Data Field Mapping

### Frontend → Backend Mapping

| Frontend Field | Backend Field(s) | Fallback | Type |
|----------------|-----------------|----------|------|
| order_number | sales_order_number, order_number | 'N/A' | string |
| customer_name | customer_name, salesOrder?.customer?.name | 'N/A' | string |
| customer_phone | customer_phone, salesOrder?.customer?.phone | 'N/A' | string |
| product_name | product_name, garment_specs?.product_type | 'N/A' | string |
| product_code | product_code | 'N/A' | string |
| quantity | quantity | 0 | number |
| updated_at | last_updated, updated_at | now | date |
| status | status, production_status | 'unknown' | string |
| shipment_date | shipment_date | null | date |
| delivery_date | expected_delivery_date | null | date |
| address | shipping_address | 'N/A' | string |
| tracking_no | tracking_number | 'Not assigned' | string |

---

## Code Patterns

### Null-Safe Field Access Pattern

**Pattern**:
```javascript
const value = object.field || object.alternateField || 'defaultValue';
```

**Example**:
```javascript
// Instead of:
{shipment.status}

// Do this:
{(shipment.status || 'unknown').replace('_', ' ').toUpperCase()}

// For nested properties:
const customerName = shipment.customer_name || 
                     shipment.salesOrder?.customer?.name || 
                     'N/A';
{customerName}
```

### Date Handling Pattern

**Pattern**:
```javascript
{dateValue ? new Date(dateValue).toLocaleDateString() : 'N/A'}
```

**Example**:
```javascript
// Instead of:
{new Date(shipment.expected_delivery_date).toLocaleDateString()}

// Do this:
{shipment.expected_delivery_date 
  ? new Date(shipment.expected_delivery_date).toLocaleDateString() 
  : 'N/A'
}
```

### Status Badge Pattern

**Pattern**:
```javascript
<span className={`badge ${getStatusColor(status)}`}>
  {(status || 'unknown').replace('_', ' ').toUpperCase()}
</span>
```

**Status Color Map**:
```javascript
const colors = {
  preparing: 'bg-amber-100 text-amber-700',
  packed: 'bg-blue-100 text-blue-700',
  ready_to_ship: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-sky-100 text-sky-700',
  in_transit: 'bg-blue-100 text-blue-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  failed_delivery: 'bg-rose-100 text-rose-700',
  returned: 'bg-rose-100 text-rose-700',
  cancelled: 'bg-gray-100 text-gray-700'
};
```

---

## Common Issues & Solutions

### Issue: "Cannot read properties of undefined"

**Cause**: Direct property access without null check
```javascript
// ❌ WRONG
{shipment.status.replace('_', ' ')}

// ✅ RIGHT
{(shipment.status || 'unknown').replace('_', ' ')}
```

### Issue: "Invalid Date"

**Cause**: Parsing null/undefined date
```javascript
// ❌ WRONG
{new Date(shipment.date).toLocaleDateString()}

// ✅ RIGHT
{shipment.date ? new Date(shipment.date).toLocaleDateString() : 'N/A'}
```

### Issue: Incoming orders showing "N/A"

**Cause**: Using wrong field names
```javascript
// ❌ WRONG
{order.order_number}      // API returns sales_order_number
{order.customer?.name}    // API returns customer_name

// ✅ RIGHT
{order.sales_order_number || order.order_number || 'N/A'}
{order.customer_name || order.customer?.name || 'N/A'}
```

### Issue: Modal not updating with new data

**Cause**: Modal not re-rendering when shipment changes
```javascript
// ✅ Ensure dependency array is correct
useEffect(() => {
  // Update logic
}, [shipment, isOpen]); // Include shipment in dependencies
```

---

## Testing Data Structures

### Sample Production Order
```javascript
{
  id: 1,
  production_number: "PRD-20250115-0001",
  production_status: "completed",
  status: "completed",
  production_type: "in_house",
  priority: "high",
  quantity: 500,
  sales_order_id: 1,
  sales_order_number: "SO-2025-001",
  order_number: "SO-2025-001",
  customer_name: "Acme Corp",
  customer_phone: "+91-98765-43210",
  customer_email: "contact@acmecorp.com",
  product_name: "Cotton T-Shirt",
  product_code: "CSH-001",
  shipping_address: "123 Business Park, Delhi",
  last_updated: "2025-01-14T10:30:00Z",
  updated_at: "2025-01-14T10:30:00Z"
}
```

### Sample Shipment
```javascript
{
  id: 1,
  shipment_number: "SHP-20250115-0001",
  tracking_number: "TRK-2025-001",
  status: "in_transit",
  sales_order_id: 1,
  shipment_date: "2025-01-15",
  expected_delivery_date: "2025-01-20",
  recipient_name: "John Doe",
  recipient_phone: "+91-98765-43210",
  courier_company: "Express Delivery",
  shipping_address: "123 Main St, Bangalore",
  total_quantity: 500,
  total_weight: "100.5",
  shipping_cost: 500,
  last_status_update: "2025-01-15T14:30:00Z"
}
```

---

## Useful Debug Commands

### Check Incoming Orders Data
```javascript
// In browser console
async function checkIncomingOrders() {
  const res = await fetch('/api/shipments/orders/incoming');
  const data = await res.json();
  console.table(data.orders.map(o => ({
    order_number: o.sales_order_number,
    customer: o.customer_name,
    product: o.product_name,
    qty: o.quantity
  })));
}
checkIncomingOrders();
```

### Check Active Shipments
```javascript
async function checkShipments() {
  const res = await fetch('/api/shipments?limit=5');
  const data = await res.json();
  console.table(data.shipments.map(s => ({
    shipment_no: s.shipment_number,
    order_no: s.salesOrder?.order_number,
    status: s.status,
    tracking: s.tracking_number
  })));
}
checkShipments();
```

### Check Component State
```javascript
// Add to component
console.log('Incoming Orders:', incomingOrders);
console.log('Shipments:', shipments);
console.log('Stats:', stats);
```

---

## Component Props Reference

### ShipmentDetailsDialog Props
```typescript
interface ShipmentDetailsDialogProps {
  isOpen: boolean;                    // Is modal visible
  onClose: () => void;                // Close callback
  shipment: {
    // Basic Info
    shipment_number?: string;
    production_number?: string;
    status?: string;
    production_status?: string;
    
    // Order Linkage
    sales_order_number?: string;
    salesOrder?: {
      order_number: string;
      customer?: {
        name: string;
        email: string;
        phone: string;
      };
    };
    
    // Customer
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    recipient_name?: string;
    recipient_phone?: string;
    
    // Product
    product_name?: string;
    product_code?: string;
    quantity?: number;
    priority?: string;
    
    // Shipping
    shipping_address?: string;
    courier_partner_id?: number;
    courierPartner?: { name: string };
    courier_company?: string;
    tracking_number?: string;
    
    // Dates
    shipment_date?: string;
    expected_delivery_date?: string;
    last_updated?: string;
    updated_at?: string;
    
    // Package
    total_quantity?: number;
    total_weight?: string;
    shipping_cost?: number;
  };
}
```

---

## Environment Variables

Add to `.env` if needed:
```
REACT_APP_SHIPMENT_DEBUG=true       # Enable debug logging
REACT_APP_SHIPMENT_PAGE_SIZE=20     # Items per page
REACT_APP_SHIPMENT_REFRESH_TIME=30  # Refresh interval (seconds)
```

---

## Performance Tips

1. **Pagination**: Load 20-50 items at a time
2. **Caching**: Cache dashboard stats for 5 minutes
3. **Lazy Loading**: Load details modal data on-demand
4. **Debouncing**: Debounce search/filter inputs (300ms)
5. **Memoization**: Memoize status color function

```javascript
// Memoize expensive computations
const getStatusColor = useCallback((status) => {
  // color mapping logic
}, []);
```

---

## Further Reading

- `SHIPMENT_FLOW_COMPLETE_TEST_GUIDE.md` - Complete testing guide
- `SHIPMENT_NULL_VALUES_FIX_SUMMARY.md` - Fix details
- `API_ENDPOINTS_REFERENCE.md` - All API endpoints
- `SHIPMENT_TEST_SCENARIOS.md` - Scenario-based testing

---
