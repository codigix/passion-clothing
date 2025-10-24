# Outsource Management - Architecture & Technical Guide

## System Architecture

### High-Level Data Flow

```
┌─────────────────┐
│  User Interface │ (OutsourceManagementPage.jsx)
│ - Create Dialog │
│ - Order Cards   │
│ - Stats Cards   │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Component State Management         │
│ - productionOrders[]                │
│ - vendors[]                         │
│ - selectedOrder                     │
│ - outsourceType (full/partial)      │
│ - selectedStages[]                  │
│ - stats                             │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  API Layer (api.js)                 │
│ - GET /manufacturing/orders         │
│ - GET /procurement/vendors          │
│ - POST /manufacturing/stages/*/     │
│        outsource/outward            │
│ - POST /manufacturing/stages/*/     │
│        outsource/inward             │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Backend API Routes                 │
│ (server/routes/manufacturing.js)    │
│ - GET /orders                       │
│ - POST /stages/:id/outsource/       │
│        outward                      │
│ - POST /stages/:id/outsource/inward │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Database Models                    │
│ - ProductionOrder                   │
│ - ProductionStage                   │
│ - Vendor                            │
│ - Challan                           │
│ - StageOperation                    │
│ - InventoryMovement                 │
└─────────────────────────────────────┘
```

## Component Structure

### OutsourceManagementPage.jsx
```
OutsourceManagementPage
├── State Management
│   ├── activeTab: 'active' | 'completed'
│   ├── productionOrders: Order[]
│   ├── vendors: Vendor[]
│   ├── loading: boolean
│   ├── searchTerm: string
│   ├── filterType: 'all' | 'full' | 'partial'
│   ├── expandedOrder: orderId | null
│   ├── showCreateDialog: boolean
│   ├── selectedOrder: Order | null
│   ├── outsourceType: 'full' | 'partial'
│   ├── selectedStages: stageId[]
│   ├── selectedVendor: vendorId
│   ├── expectedReturnDate: date
│   ├── notes: string
│   ├── transportDetails: string
│   ├── estimatedCost: number
│   └── stats: Stats
│
├── Effects
│   ├── useEffect (fetchProductionOrders + fetchVendors)
│   └── useEffect (calculateStats)
│
├── Event Handlers
│   ├── fetchProductionOrders()
│   ├── fetchVendors()
│   ├── calculateStats(orders)
│   ├── handleCreateOutsource()
│   ├── resetCreateForm()
│   ├── toggleStageSelection(stageId)
│   └── getStatusColor(status)
│
├── UI Sections
│   ├── Header (back button + title + create button)
│   ├── Stats Cards (4 cards: active, completed, delayed, total cost)
│   ├── Search & Filter Bar
│   ├── Tab Navigation (Active | Completed)
│   ├── Orders List
│   │   └── OrderCard (expandable)
│   │       ├── Summary (collapsed)
│   │       └── Details (expanded)
│   ├── Empty State
│   └── Create Dialog
│       ├── Production Order Selection
│       ├── Outsource Type Selection
│       ├── Stage Selection (partial)
│       ├── Vendor Selection
│       ├── Date Picker
│       ├── Transport Details
│       ├── Cost Input
│       ├── Notes Textarea
│       └── Submit Button
│
└── Helpers
    ├── filteredOrders (computed)
    ├── getOrdersByTab() (computed)
    ├── getStatusColor() (color mapping)
    └── getVendorInfo() (vendor lookup)
```

## Data Models

### ProductionOrder
```javascript
{
  id: number,
  order_number: string,        // "SO-2024-001"
  quantity: number,
  status: string,              // "pending", "in_production", "completed"
  delivery_date: date,
  product: Product,
  salesOrder: SalesOrder,
  stages: ProductionStage[],   // Key relationship
  supervisor: User,
  assignedUser: User,
  created_at: timestamp,
  updated_at: timestamp
}
```

### ProductionStage
```javascript
{
  id: number,
  production_order_id: number,
  stage_name: string,          // "Embroidery", "Printing", "Washing"
  stage_order: number,
  status: string,              // "pending", "in_progress", "completed"
  quantity_processed: number,
  quantity_approved: number,
  quantity_rejected: number,
  
  // Outsourcing Fields
  outsourced: boolean,         // NEW: Marks as outsourced
  outsource_type: string,      // NEW: "full" or "partial"
  vendor_id: number,           // NEW: FK to Vendor
  outsource_cost: decimal,     // NEW: Cost incurred
  
  // Dates
  planned_start_time: date,
  planned_end_time: date,
  actual_start_time: date,
  actual_end_time: date,
  
  vendor: Vendor,              // Association
  assignedUser: User,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Vendor
```javascript
{
  id: number,
  name: string,                // "ABC Textiles Ltd"
  contact_person: string,
  phone: string,
  mobile: string,
  email: string,
  city: string,
  address: string,
  status: string,              // "active", "inactive"
  created_at: timestamp,
  updated_at: timestamp
}
```

### Challan (for outsourcing)
```javascript
{
  id: number,
  challan_number: string,      // "CHN-20250115-0001"
  type: string,                // "outward", "inward"
  sub_type: string,            // "outsourcing"
  department: string,          // "manufacturing"
  vendor_id: number,
  
  // Items being outsourced
  items: JSON,                 // [{stage_name, quantity, stage_id}]
  
  // Outsourcing specific
  expected_return_date: date,
  transport_details: JSON,     // {carrier, estimated_cost}
  
  // Returns
  received_quantity: number,
  quality_notes: string,
  discrepancies: string,
  
  status: string,              // "pending", "completed"
  created_by: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

### StageOperation
```javascript
{
  id: number,
  production_stage_id: number,
  operation_name: string,      // "Outsourced to ABC Textiles"
  operation_type: string,      // "outsourcing"
  status: string,              // "in_progress", "completed"
  challan_id: number,          // Outward challan
  return_challan_id: number,   // Inward challan
  started_at: timestamp,
  completed_at: timestamp,
  created_at: timestamp,
  updated_at: timestamp
}
```

## API Endpoints

### 1. Fetch Production Orders
```
GET /manufacturing/orders
Authorization: Bearer {token}

Response:
{
  "productionOrders": [
    {
      id, order_number, quantity, status, delivery_date,
      product, salesOrder, stages: [{...}], ...
    }
  ]
}

Error Responses:
- 401: Unauthorized
- 500: Server error
```

### 2. Fetch Vendors
```
GET /procurement/vendors
Authorization: Bearer {token}

Response:
{
  "vendors": [
    {
      id, name, contact_person, phone, mobile, email, 
      city, address, status, ...
    }
  ]
}
```

### 3. Create Outward Challan (Outsource)
```
POST /manufacturing/stages/{stageId}/outsource/outward
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "vendor_id": 123,
  "items": [
    {
      "stage_name": "Embroidery",
      "quantity": 100,
      "stage_id": 456
    }
  ],
  "expected_return_date": "2025-02-15",
  "notes": "Special requirements...",
  "transport_details": {
    "carrier": "XYZ Transport",
    "estimated_cost": 5000
  }
}

Response:
{
  "message": "Outward challan created successfully",
  "challan": {
    id, challan_number, vendor_id, items,
    expected_return_date, status, created_at, ...
  }
}

Error Responses:
- 404: Stage not found
- 400: Invalid data
- 500: Server error
```

### 4. Create Inward Challan (Return)
```
POST /manufacturing/stages/{stageId}/outsource/inward
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "outward_challan_id": 789,
  "items": [...],
  "received_quantity": 98,
  "quality_notes": "Minor color variation in 2 units",
  "discrepancies": "2 units have color issue"
}

Response:
{
  "message": "Inward challan created successfully",
  "challan": {...},
  "stage_updated": true
}

Error Responses:
- 404: Stage or outward challan not found
- 500: Server error
```

## State Management Flow

### Initial State Load
```javascript
useEffect(() => {
  fetchProductionOrders();    // Load all production orders
  fetchVendors();             // Load all vendors
}, []);

// In fetchProductionOrders:
async fetchProductionOrders() {
  const response = await api.get('/manufacturing/orders');
  setProductionOrders(response.data.productionOrders);
  calculateStats(response.data.productionOrders);
}

// In fetchVendors:
async fetchVendors() {
  const response = await api.get('/procurement/vendors');
  setVendors(response.data.vendors);
}
```

### Creating Outsource
```javascript
async handleCreateOutsource() {
  // 1. Validate
  if (!selectedOrder || !selectedVendor) {
    toast.error('Required fields missing');
    return;
  }

  // 2. Prepare payload
  const stages = outsourceType === 'full'
    ? selectedOrder.stages
    : selectedOrder.stages.filter(s => selectedStages.includes(s.id));

  // 3. Create outward challan for each stage
  for (const stage of stages) {
    const response = await api.post(
      `/manufacturing/stages/${stage.id}/outsource/outward`,
      {
        vendor_id: selectedVendor,
        items: [{...}],
        expected_return_date,
        notes,
        transport_details
      }
    );
  }

  // 4. Update local state
  toast.success('Outsource created!');
  resetCreateForm();
  setShowCreateDialog(false);
  fetchProductionOrders(); // Refresh data
}
```

## Computed Properties

### filteredOrders
```javascript
const filteredOrders = productionOrders.filter(order => {
  // Search filter
  const matchesSearch = order.order_number.includes(searchTerm) || ...;
  
  // Type filter
  const hasOutsourced = order.stages?.some(s => s.outsourced);
  const isFull = order.stages?.every(s => s.outsourced);
  const isPartial = hasOutsourced && !isFull;
  
  // Apply filters based on selection
  if (filterType === 'full') return matchesSearch && isFull;
  if (filterType === 'partial') return matchesSearch && isPartial;
  return matchesSearch && hasOutsourced;
});
```

### getOrdersByTab()
```javascript
getOrdersByTab() {
  if (activeTab === 'active') {
    return filteredOrders.filter(order => 
      order.stages?.some(s => s.outsourced && s.status === 'in_progress')
    );
  }
  if (activeTab === 'completed') {
    return filteredOrders.filter(order => 
      order.stages?.every(s => !s.outsourced || s.status === 'completed')
    );
  }
  return filteredOrders;
}
```

## Performance Optimizations

### 1. Memoization Opportunities
```javascript
// Could use useMemo for expensive calculations
const filteredOrders = useMemo(() => {
  // Filter logic
}, [productionOrders, searchTerm, filterType]);

const stats = useMemo(() => {
  // Stats calculation
}, [productionOrders]);
```

### 2. Lazy Loading
```javascript
// Current: Loads all orders at once
// Future: Implement pagination
const ITEMS_PER_PAGE = 20;
const [page, setPage] = useState(1);
const startIdx = (page - 1) * ITEMS_PER_PAGE;
const endIdx = startIdx + ITEMS_PER_PAGE;
```

### 3. Debounced Search
```javascript
// Current: Real-time filtering
// Future: Debounce search input
import { useDebouncedValue } from '@/hooks';
const debouncedSearch = useDebouncedValue(searchTerm, 300);
```

## Integration Points

### With Manufacturing Routes
```javascript
// Production Operations View integration
navigate(`/manufacturing/operations/${order.id}`)
// Opens ProductionOperationsViewPage with stage details
```

### With Backend Database
```javascript
// Database relationships
ProductionOrder → has many → ProductionStage
  ↓
ProductionStage → belongs to → Vendor
  ↓
Challan (outward/inward)
  ↓
StageOperation (links everything)
```

### With Notification System
```javascript
// After creating outsource
NotificationService.notify({
  type: 'outsource_created',
  recipient: 'manufacturing_team',
  data: { orderNumber, vendorName, stages }
});
```

## Error Handling Strategy

### Client-Side
```javascript
try {
  const response = await api.post('/endpoint', data);
  // Success
} catch (error) {
  if (error.response?.status === 404) {
    toast.error('Resource not found');
  } else if (error.response?.status === 400) {
    toast.error('Invalid data');
  } else {
    toast.error('Operation failed');
  }
  console.error('Error details:', error);
}
```

### Server-Side (Backend)
```javascript
router.post('/stages/:id/outsource/outward', async (req, res) => {
  try {
    // Validate inputs
    if (!req.body.vendor_id) {
      return res.status(400).json({ message: 'Vendor ID required' });
    }

    // Find stage
    const stage = await ProductionStage.findByPk(req.params.id);
    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    // Create challan
    const challan = await Challan.create({...});

    // Return success
    res.json({ message: 'Success', challan });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Operation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
```

## Testing Strategy

### Unit Tests
```javascript
describe('OutsourceManagementPage', () => {
  test('should filter orders by search term', () => {
    const orders = [
      { order_number: 'SO-001' },
      { order_number: 'SO-002' }
    ];
    const filtered = orders.filter(o => 
      o.order_number.includes('001')
    );
    expect(filtered).toHaveLength(1);
  });

  test('should calculate stats correctly', () => {
    const orders = [...];
    const stats = calculateStats(orders);
    expect(stats.active).toBe(5);
  });
});
```

### Integration Tests
```javascript
describe('Create Outsource', () => {
  test('should create outward challan', async () => {
    const result = await api.post(
      '/manufacturing/stages/123/outsource/outward',
      mockData
    );
    expect(result.data.challan).toBeDefined();
  });
});
```

## Security Considerations

### Authentication
```javascript
// All API calls include JWT token via api.js interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Authorization
```javascript
// Backend checks user department
checkDepartment(['manufacturing', 'admin'])
// Only manufacturing and admin users can create outsources
```

### Data Validation
```javascript
// Frontend validation
if (!selectedVendor || !expectedReturnDate) {
  return toast.error('Fill required fields');
}

// Backend validation
if (!req.body.vendor_id) {
  return res.status(400).json({ message: 'Invalid vendor' });
}
```

## Deployment Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API routes registered
- [ ] Frontend routes added
- [ ] Sidebar menu updated
- [ ] Permissions configured
- [ ] Error handling verified
- [ ] Performance tested
- [ ] Security audited
- [ ] Documentation complete
- [ ] User training completed

## Monitoring & Logging

### Frontend Logging
```javascript
console.log('🚀 Outsource created:', response.data);
console.error('❌ Error:', error);
```

### Backend Logging
```javascript
console.log('[DEBUG] Fetching production order ID:', req.params.id);
console.error('[ERROR] Outsource creation failed:', error);
```

### Metrics to Monitor
- API response times
- Error rates
- Outsource creation frequency
- Average outsource cost
- Vendor performance

## Future Scalability

### Anticipated Changes
1. **Bulk Operations**: Create multiple outsources at once
2. **Automation**: Auto-assign vendors based on stage type
3. **Analytics**: Advanced reporting and forecasting
4. **Integration**: Connect to vendor portals
5. **Mobile**: Native app for on-the-go management

### Architecture Readiness
- Component-based design supports modularity
- API layer supports additional endpoints
- Database supports scaling
- State management can handle more data

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Maintained By**: Manufacturing IT Team