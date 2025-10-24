# Material Prefilling - Visual Guide & Architecture Diagrams

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION WIZARD                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Step 1: Select Order                                        ││
│  │ Step 2: Order Details (Product + Sales Order)               ││
│  │         ↓ (Auto-fetch on sales order select)                ││
│  │ Step 3: MATERIALS ← Materials prefilled automatically! ✅   ││
│  │ Step 4: Scheduling                                          ││
│  │ Step 5: Quality                                             ││
│  │ Step 6: Team                                                ││
│  │ Step 7: Customization                                       ││
│  │ Step 8: Review & Submit                                     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
         ↑                              ↓
         │                              │
    [User selects]             [Calls API endpoint]
         │                              │
         │                              ↓
    Sales Order                  ┌──────────────────────┐
                                 │ Backend: Manufacturing│
                                 │ /project/:projectName/│
                                 │ mrn-materials        │
                                 └──────────────────────┘
                                         ↓
                                 [Query MRN + Inventory]
                                         ↓
                                  [Enrich Materials]
                                         ↓
                                 [Return to Frontend]
                                         ↓
                                  [Set Form Values]
                                         ↓
                                  [Re-render Step]
```

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│ Sales Order     │
│ • Project: ABC  │
│ • Order: SO-001 │
└────────┬────────┘
         │
         ↓ Extract project name
         │
    "Project ABC"
         │
         ↓ Auto-fetch hook triggered
         │
    fetchMRNMaterialsForProject()
         │
         ↓ API Call
         │
         ├─→ GET /manufacturing/project/Project%20ABC/mrn-materials
         │
         │   ┌──────────────────────────────────────┐
         │   │ Backend Processing                   │
         │   ├──────────────────────────────────────┤
         │   │ 1. Query ProjectMaterialRequest      │
         │   │    WHERE project_name LIKE 'ABC'     │
         │   │    AND status IN (approved,...)      │
         │   │                                       │
         │   │ 2. Get materials_requested array     │
         │   │    [{ material_name: "Cotton",       │
         │   │      quantity: 50, ... }]            │
         │   │                                       │
         │   │ 3. For each material:                │
         │   │    - Try lookup by inventory_id      │
         │   │    - Try search by name/code         │
         │   │    - Fetch batch, warehouse, etc.    │
         │   │                                       │
         │   │ 4. Enrich material object            │
         │   │    {                                  │
         │   │      ...original fields,             │
         │   │      batch_number: "BATCH-001",      │
         │   │      warehouse: "Wh A",              │
         │   │      quantity_available: 75,         │
         │   │      ...                             │
         │   │    }                                  │
         │   │                                       │
         │   │ 5. Return enriched array             │
         │   └──────────────────────────────────────┘
         │
         ↓ Response with enriched materials
         │
    [{ material_name: "Cotton", quantity: 50, ... }]
         │
         ↓ Transform for form
         │
    [{ materialId: 123, description: "Cotton",
      requiredQuantity: 50, batch_number: "B-001",
      warehouse_location: "Wh A", ... }]
         │
         ↓ Set form values
         │
    methods.setValue('materials.items', [...])
         │
         ↓ Re-render MaterialsStep
         │
    ┌──────────────────────────────┐
    │ ✅ 1 material(s) loaded      │
    │                              │
    │ ┌──────────────────────────┐ │
    │ │ Cotton Fabric            │ │
    │ │ Required: 50m            │ │
    │ │ Batch: BATCH-001         │ │
    │ │ Warehouse: Wh A          │ │
    │ │ Available: 75m ✅        │ │
    │ └──────────────────────────┘ │
    └──────────────────────────────┘
         │
         ↓ User can edit/add/remove
         │
    Submit Production Order with Materials
```

---

## 🎨 UI Component Structure

```
MaterialsStep Component
│
├─ Success Banner (if autoFilled)
│  └─ "✅ N material(s) loaded from project MRN"
│
├─ [if 0 materials] Empty State
│  ├─ 📦 Icon
│  ├─ "No materials added yet"
│  └─ "+ Add First Material" button
│
├─ [if 1-2 materials] Card View
│  └─ For each material:
│     ├─ Material Header (# + Name)
│     ├─ Key Details Grid (Qty, Available, Batch, Category)
│     ├─ Warehouse Location Section
│     └─ Update Quantity Input
│
├─ [if 3+ materials] Table View
│  └─ Table with columns:
│     ├─ # (row number)
│     ├─ Material (name + barcode)
│     ├─ Required Qty (input)
│     ├─ Unit (text)
│     ├─ Batch # (text)
│     ├─ Warehouse (location + rack)
│     ├─ Available (badge: green/orange)
│     └─ Action (Remove button)
│
├─ Error Messages (if validation fails)
│
└─ Action Buttons
   ├─ "+ Add Material"
   └─ "Remove" (per material)
```

---

## 🔄 State Management Flow

```
Form State (react-hook-form)
│
├─ orderSelection
│  └─ productionApprovalId: "123"
│  └─ autoFilled: true ← Set when details loaded
│
├─ orderDetails
│  └─ salesOrderId: "456" ← User selects
│     └─ Trigger: Watch for change
│        ↓
│
├─ scheduling
│  └─ [dates, shift, etc.]
│
├─ materials
│  └─ items: [
│       {
│         materialId: "789",
│         description: "Cotton",
│         requiredQuantity: 50,
│         unit: "meters",
│         status: "available",
│         batch_number: "B-001",      ← Prefilled
│         warehouse_location: "Wh A", ← Prefilled
│         rack_number: "R-5",         ← Prefilled
│         quantity_available: 75,     ← Prefilled
│         // ... more fields
│       },
│       // ... more materials
│     ]
│
├─ quality
│  └─ [checkpoints]
│
├─ team
│  └─ [supervisor, operators, QA]
│
└─ customization
   └─ [stages configuration]
```

---

## 📱 UI Rendering Decision Tree

```
                    Materials Step Rendered
                            │
                ┌───────────┴───────────┐
                ↓                       ↓
         Fields = 0              Fields > 0
                ↓                       ↓
         Empty State          Check Material Count
                │                      │
                │              ┌───────┴────────┐
                │              ↓                ↓
                │         1-2 Items         3+ Items
                │              ↓                ↓
                │          Card View        Table View
                │              │                │
                ├──────────────┼────────────────┤
                │              │                │
        [ No materials ]  [Material Cards]  [Data Table]
        [+ Add First]     [Edit, Remove]    [Edit inline]
                                           [Remove on row]
```

---

## 🔗 Component Integration

```
ProductionWizardPage (Main Component)
│
├─ useForm() - react-hook-form
├─ FormProvider - passes form context down
│
├─ useCallback: fetchMRNMaterialsForProject()
│  └─ Called by auto-fetch hooks
│  └─ Calls: GET /manufacturing/project/:projectName/mrn-materials
│  └─ Updates form via methods.setValue()
│
├─ useEffect: Auto-fetch when sales order selected
│  ├─ watches: orderDetails.salesOrderId
│  ├─ extracts: project name
│  └─ calls: fetchMRNMaterialsForProject()
│
├─ useState: Various UI states
│  ├─ activeTab
│  ├─ loading states
│  └─ modal/dialog states
│
└─ renderStepContent
   └─ [case 3] → MaterialsStep component
      │
      ├─ useFieldArray() - manage materials list
      │  ├─ fields - array of material objects
      │  ├─ append() - add material
      │  └─ remove() - remove material
      │
      ├─ watch() - monitor materials.items changes
      │
      └─ Conditional Rendering
         ├─ Success banner
         ├─ Empty state / Card view / Table view
         ├─ Error messages
         └─ Action buttons
```

---

## 📡 API Request/Response

### Request
```
GET /manufacturing/project/Project%20ABC/mrn-materials
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Response (Success - 200)
```json
{
  "success": true,
  "mrn": {
    "id": 42,
    "request_number": "MRN-20250123-00001",
    "project_name": "Project ABC",
    "status": "approved",
    "created_at": "2025-01-23T10:00:00Z"
  },
  "materials": [
    {
      "material_name": "Cotton Fabric",
      "quantity_required": 50,
      "unit": "meters",
      "color": "Navy Blue",
      "inventory_id": 123,
      "inventory_item_name": "100% Cotton Fabric",
      "batch_number": "BATCH-2025-001",
      "warehouse_location": "Warehouse A, Zone 1",
      "rack_number": "A1-R5",
      "category": "Fabrics",
      "material_type": "Natural",
      "quantity_available": 75,
      "stock_unit": "meters",
      "inventory_barcode": "INV-12345"
    }
    // ... more materials
  ],
  "count": 1
}
```

### Response (No MRN Found - 404)
```json
{
  "message": "No Material Request Note found for project: Project ABC",
  "materials": []
}
```

### Response (Error - 500)
```json
{
  "success": false,
  "message": "Failed to fetch MRN materials",
  "error": "Database connection error"
}
```

---

## 🎬 User Interaction Timeline

```
Timeline                  User Action              System Response
─────────────────────────────────────────────────────────────────────

T0                      Create New PO            Loading wizard
                        
T1         Select Product (Step 2)    → Product options loaded
                        
T2              Select Sales Order      
                        ↓
                 Auto-fetch triggered   → API call starts
                                        → Loading indicator shown
                        
T3                      ↓                → MRN query starts
                        ↓                → Materials enrichment
                        
T4                      ↓                → Response received
                                        → Form values set
                                        → Success toast shown
                        
T5              Materials Step          → Materials displayed
             (Navigating or scrolling)  → Card/Table view rendered
                                        → Batch numbers visible
                                        → Warehouse locations visible
                        
T6            User edits quantity      → Form value updates
                        ↓               → Real-time validation
                        
T7         User adds material           → New empty row appears
              (+ Add Material)          
                        
T8         User removes material       → Material deleted
              (Remove button)           
                        
T9         Continue to next steps      → Quantity preserved
                   (Next →)             → Batch info preserved
                        
T10            Submit Production        → API call with materials
               Order (Final Step)       → Order created successfully
```

---

## 🎨 Visual Mockups

### Card View (1-2 Materials)

```
╔════════════════════════════════════════════════════════════╗
║  ✅ 2 material(s) loaded from project MRN                  ║
║  These materials are from the Material Request Note for    ║
║  this project. Includes batch numbers, warehouse           ║
║  locations, and stock availability.                        ║
╚════════════════════════════════════════════════════════════╝

┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│ Material #1                     │  │ Material #2                     │
│                                 │  │                                 │
│ 100% Cotton Fabric              │  │ Polyester Blend                 │
│ Barcode: INV-12345              │  │ Barcode: INV-12346              │
│                                 │  │                                 │
│ Required Qty: 50 meters         │  │ Required Qty: 10 pieces         │
│ Available: 75 meters ✅         │  │ Available: 200 pieces ✅        │
│ Batch #: BATCH-2025-001         │  │ Batch #: BATCH-2025-002         │
│ Category: Fabrics               │  │ Category: Fabrics               │
│                                 │  │                                 │
│ 📍 Warehouse Location           │  │ 📍 Warehouse Location           │
│ Warehouse A, Zone 1             │  │ Warehouse B, Zone 2             │
│ Rack: A1-R5                     │  │ Rack: B2-R3                     │
│                                 │  │                                 │
│ ┌─────────────────────────────┐ │  │ ┌─────────────────────────────┐ │
│ │ Update Quantity             │ │  │ │ Update Quantity             │ │
│ │ [50________________]         │ │  │ │ [10________________]        │ │
│ └─────────────────────────────┘ │  │ └─────────────────────────────┘ │
└─────────────────────────────────┘  └─────────────────────────────────┘

[+ Add Material]
```

### Table View (3+ Materials)

```
╔════════════════════════════════════════════════════════════╗
║  ✅ 5 material(s) loaded from project MRN                  ║
║  These materials are from the Material Request Note for    ║
║  this project. Includes batch numbers, warehouse           ║
║  locations, and stock availability.                        ║
╚════════════════════════════════════════════════════════════╝

┌────┬──────────────────┬──────┬──────┬────────┬──────────────┬──────────┬────────┐
│ #  │ Material         │ Qty  │ Unit │ Batch# │ Warehouse    │ Avail    │ Action │
├────┼──────────────────┼──────┼──────┼────────┼──────────────┼──────────┼────────┤
│ 1  │ Cotton Fabric    │[50__]│  m   │ B-001  │ Warehouse A  │ 75 ✅    │ Remove │
│    │ INV-12345        │      │      │        │ Rack: A1-R5  │          │        │
├────┼──────────────────┼──────┼──────┼────────┼──────────────┼──────────┼────────┤
│ 2  │ Polyester        │[10__]│ pcs  │ B-002  │ Warehouse B  │ 200 ✅   │ Remove │
│    │ INV-12346        │      │      │        │ Rack: B2-R3  │          │        │
├────┼──────────────────┼──────┼──────┼────────┼──────────────┼──────────┼────────┤
│ 3  │ Buttons Set      │[5___]│ set  │ B-003  │ Warehouse C  │ 30 ✅    │ Remove │
│    │ INV-12347        │      │      │        │ Rack: C1-R2  │          │        │
├────┼──────────────────┼──────┼──────┼────────┼──────────────┼──────────┼────────┤
│ 4  │ Zipper           │[2___]│ pcs  │ B-004  │ Warehouse D  │ 15 ✅    │ Remove │
│    │ INV-12348        │      │      │        │ Rack: D1-R1  │          │        │
├────┼──────────────────┼──────┼──────┼────────┼──────────────┼──────────┼────────┤
│ 5  │ Label Roll       │[1___]│ set  │ B-005  │ Warehouse E  │ 100 ✅   │ Remove │
│    │ INV-12349        │      │      │        │ Rack: E1-R3  │          │        │
└────┴──────────────────┴──────┴──────┴────────┴──────────────┴──────────┴────────┘

[+ Add Material]
```

### Empty State (No Materials)

```
╔════════════════════════════════════════════════════════════╗
║              No materials added yet                        ║
║                                                            ║
║                       📦                                   ║
║                                                            ║
║              [+ Add First Material]                        ║
║                                                            ║
║  No Material Request Note found for this project.         ║
║  You can add materials manually or create an MRN first.   ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🔄 State Changes During Process

```
Initial State:
{
  materials: {
    items: [{ materialId: '', description: '', requiredQuantity: '', ... }]
  }
}

↓ User selects sales order

Auto-fetch triggered:
{
  materials: {
    items: [{ materialId: '', description: '', requiredQuantity: '', ... }]
  }
  // API call in progress...
}

↓ API response received

After prefill:
{
  materials: {
    items: [
      {
        materialId: '123',
        description: 'Cotton Fabric',
        requiredQuantity: 50,
        unit: 'meters',
        batch_number: 'BATCH-001',        ← Prefilled
        warehouse_location: 'Warehouse A', ← Prefilled
        rack_number: 'A1-R5',              ← Prefilled
        quantity_available: 75,            ← Prefilled
        // ... all enriched fields
      }
    ]
  }
}

↓ User edits quantity

After user edit:
{
  materials: {
    items: [
      {
        // ... same fields
        requiredQuantity: 60,  ← Updated by user
        // ... rest preserved
      }
    ]
  }
}

↓ User adds material

After add:
{
  materials: {
    items: [
      { /* first material */ },
      {
        materialId: '',
        description: '',
        requiredQuantity: '',
        unit: '',
        status: 'available'
        // ... empty defaults
      }
    ]
  }
}
```

---

## ✅ Validation Flow

```
Material Item Validation
│
├─ materialId (required for form)
│  ├─ Empty → Warning shown
│  └─ Non-empty → ✅ Valid
│
├─ description (required)
│  ├─ Empty → Error shown
│  └─ Non-empty → ✅ Valid
│
├─ requiredQuantity (required, positive)
│  ├─ Empty → Error shown
│  ├─ Zero → Error shown
│  ├─ Negative → Error shown
│  └─ Positive number → ✅ Valid
│
├─ unit (required)
│  ├─ Empty → Error shown
│  └─ Non-empty → ✅ Valid
│
└─ status (required, enum)
   ├─ Empty → Error shown
   ├─ Invalid value → Error shown
   └─ Valid enum → ✅ Valid

If ALL items valid → Can proceed to next step
```

---

This visual guide should help understand the complete flow from user interaction to data presentation! 🎉