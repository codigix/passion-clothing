# MRN-Based Material Loading System
## Production Wizard Enhancement (Jan 2025)

### Overview
The Production Wizard now loads materials directly from **Material Request Numbers (MRN)** instead of attempting to fetch from the inventory system. This simplification ensures materials come from a reliable, manufacturing-managed source that's already part of the production workflow.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Production Wizard Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Select Project (Sales Order)                      │
│          ↓                                                   │
│  Step 2: Load Sales Order Details                          │
│          ↓                                                   │
│  Step 3: Fetch MRN (Material Request Number)               │
│          ├─ GET /material-requests?project_name=SO-{id}    │
│          └─ Returns materials_requested (JSON array)       │
│          ↓                                                   │
│  Step 4: Parse MRN Materials                               │
│          ├─ Extract material_name, quantity_required       │
│          ├─ Extract color, GSM, width, etc.               │
│          └─ Extract barcode, location, unit                │
│          ↓                                                   │
│  Step 5: Pre-populate Materials Tab                        │
│          └─ Display with MRN source indicator              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Material Loading Process

#### 1. Fetch MRN by Project Name
```javascript
// Fetch from Material Request Number table
const projectName = salesOrder.project_name || `SO-${salesOrderId}`;
const mrnResponse = await api.get('/material-requests', {
  params: { 
    project_name: projectName,
    limit: 1
  }
});

// Extract materials array
const materialsRequested = JSON.parse(mrnRequest.materials_requested);
```

#### 2. Material Object Structure from MRN
```javascript
{
  // Core identification
  material_name: "Cotton Fabric",
  material_code: "FABRIC-COTTON-001",
  id: "123",
  
  // Quantity & Unit
  quantity_required: 50,
  quantity_received: 48,
  quantity_needed: 50,
  quantity: 50,
  uom: "meters",
  unit: "meters",
  
  // Quality attributes
  color: "Navy Blue",
  gsm: "150",
  width: "45 inches",
  
  // Tracking
  barcode: "BC123456789",
  barcode_scanned: "BC123456789",
  location: "Warehouse A - Shelf 3",
  warehouse_location: "Warehouse A - Shelf 3",
  
  // Status
  condition: "Good",
  inventory_id: "INV-789"
}
```

#### 3. Form Data Mapping
The system intelligently maps MRN fields to form fields with fallback chains:

```javascript
const loadedMaterials = materials.map((m) => ({
  materialId: m.inventory_id || m.material_code || m.id || '',
  description: m.material_name || m.name || m.description || m.product_name || '',
  requiredQuantity: m.quantity_received || m.quantity_required || m.quantity || m.quantity_needed || '',
  unit: m.uom || m.unit || 'pieces',
  status: 'available', // Default for MRN materials
  condition: m.condition || '',
  barcode: m.barcode_scanned || m.barcode || '',
  remarks: `From MRN ${mrnRequest.request_number || 'N/A'}`,
  location: m.location || m.warehouse_location || '',
  color: m.color || '',
  gsm: m.gsm || '',
  width: m.width || ''
}));
```

### UI Components

#### Materials Tab Header
```
📦 Materials loaded from MRN
These materials were fetched from the Material Request Number (MRN) 
for this project. Verify quantities, adjust required amounts if needed, 
and add any additional materials.
```

#### Material Card Display
Each material shows:
1. **Core Fields (Read-only)**
   - Material ID / Code
   - Description
   
2. **Editable Fields**
   - Required Quantity (user can adjust)
   - Status (Available, Shortage, Ordered)
   
3. **MRN Details Section (Read-only)**
   - Barcode
   - Location/Warehouse
   - Unit of Measure
   - Color (if available)
   - GSM (if available)
   - Width (if available)

### Key Features

#### ✅ Single Source of Truth
- Materials come exclusively from MRN records
- No conflicting data sources
- Complete audit trail via MRN request number

#### ✅ Field-Level Flexibility
- Supports multiple naming conventions
- Gracefully handles missing fields
- Fallback chains for robustness

#### ✅ Metadata Preservation
- Maintains material attributes from MRN
- Preserves color, GSM, width information
- Keeps barcode and location for tracking

#### ✅ User Control
- Users can adjust required quantities
- Can change material status if needed
- Can add additional materials beyond MRN

#### ✅ Clear Source Attribution
- Every material tagged with MRN reference number
- Remarks field shows "From MRN {request_number}"
- Header banner indicates MRN source

### API Endpoints Used

#### 1. Fetch MRN by Project
```
GET /material-requests?project_name={project_name}&limit=1
```

**Response:**
```json
{
  "requests": [
    {
      "id": 1,
      "request_number": "MRN-20250115-00001",
      "project_name": "SO-123",
      "materials_requested": "[{\"material_name\": \"...\"}]",
      "status": "pending_inventory_review",
      "priority": "medium"
    }
  ]
}
```

#### 2. Fetch Material Receipt (Optional)
```
GET /material-requests/{mrn_id}/verification
```

Returns received materials if MRN has been fulfilled.

### Console Logging

The system provides detailed console output for debugging:

```javascript
// Loading phase
📦 Loading 5 material(s) from MRN request

// Success
✅ Loaded 5 materials from MRN MRN-20250115-00001!

// Fallback (if no MRN exists)
⚠️ No MRN found for this project: Error details

// Auto-fill completion
✅ Project details loaded successfully!
```

### Error Handling

#### Graceful Degradation
```javascript
try {
  // Fetch MRN
  const mrnResponse = await api.get('/material-requests', {...});
  materialsRequested = mrnRequest.materials_requested;
} catch (e) {
  // Log warning but continue
  console.warn('No MRN found for this project:', e);
  // Form proceeds without pre-populated materials
}
```

#### Missing Field Handling
If a specific field is missing from MRN:
- System tries multiple field name variations
- Falls back to empty string if all options unavailable
- Form validation still works for required fields

### Workflow Dependencies

1. **MRN Must Exist**
   - For materials to auto-populate, MRN must be created for the project
   - Without MRN: Materials tab loads empty, user can add manually

2. **Project Name Match**
   - MRN is fetched by matching `project_name`
   - Sales Order `project_name` field must match MRN `project_name`

3. **JSON Parsing**
   - MRN stores materials in `materials_requested` JSON field
   - System handles both string and object formats

### Material Status Rules

From MRN, materials default to:
- **Status**: `available` (indicates materials are available as per MRN)
- Users can override to `shortage` or `ordered` as needed

### Field Read-Only Policy

All MRN-sourced fields are **read-only (disabled)**:
- ✅ Users CAN edit: Required Quantity, Status
- ❌ Users CANNOT edit: Material ID, Description, Barcode, Location, Unit, Color, GSM, Width

**Rationale**: Single source of truth - modifications must happen in MRN, not in the wizard.

### Compared to Previous System

| Aspect | Previous | Current |
|--------|----------|---------|
| **Source** | Inventory API calls | MRN database records |
| **API Calls** | Per material inventory fetch | Single MRN fetch |
| **Field Count** | 6-8 fields | 10+ fields with attributes |
| **Reliability** | Dependent on inventory endpoint | Uses manufacturing MRN system |
| **Audit Trail** | No MRN reference | Complete MRN reference |
| **Performance** | Parallel API calls | Single batch fetch |

### Future Enhancements

1. **Received Materials Priority**
   - If Material Receipt exists for MRN, use received quantities
   - Fall back to requested quantities if no receipt

2. **Real-time Stock Check**
   - After MRN, optionally enrich with current inventory levels
   - Display availability indicator alongside MRN data

3. **MRN Status Filtering**
   - Only use "issued" or "partially_issued" MRNs
   - Ignore "pending" MRNs for production orders

4. **Material History**
   - Link to previous productions using same MRN
   - Show actual vs. planned quantities

### Testing Checklist

- [ ] Create Sales Order (SO-123)
- [ ] Create Production Request for SO-123
- [ ] Create Material Request (MRN) for SO-123 with materials
- [ ] Navigate to Production Wizard
- [ ] Select SO-123 as project
- [ ] Verify Materials tab auto-populates with MRN materials
- [ ] Verify all fields display correctly (color, GSM, etc.)
- [ ] Verify material-sourced fields are disabled
- [ ] Edit required quantity and verify not locked
- [ ] Change status and verify it saves
- [ ] Add new material and verify it works
- [ ] Submit production order and verify materials saved correctly

### Troubleshooting

#### Q: Materials not loading
**A**: Check MRN exists with matching project_name
```javascript
// Check in console
console.log('Fetching MRN for project:', projectName);
// Verify response has materials_requested field
```

#### Q: MRN fields showing as undefined
**A**: Check JSON parsing of materials_requested
```javascript
// MRN stores as JSON string, needs parsing
const materials = JSON.parse(mrnRequest.materials_requested);
```

#### Q: Color/GSM/Width fields empty
**A**: These are optional MRN fields
- Only display if data exists in MRN
- Conditionally render in UI

### Key Files Modified

- `client/src/pages/manufacturing/ProductionWizardPage.jsx`
  - Lines 797-822: MRN material loading logic
  - Lines 1691-1701: MRN header banner
  - Lines 1724-1749: MRN details section UI

### Related Documentation

- `PRODUCTION_APPROVAL_TO_ORDER_COMPLETE_FLOW.md` - Full wizard flow
- `PRODUCTION_ORDER_FLOW_RESTRUCTURE.md` - Production order creation
- `MRN_REJECTION_QUICK_FIX.md` - MRN validation

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Production Ready ✅