# Material ID Auto-Generation - Visual Flow Diagram

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  PRODUCTION WIZARD PAGE                          │
│  client/src/pages/manufacturing/ProductionWizardPage.jsx         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─ Step 1: Select Project
                              │
                              └─ Step 4: Materials ←──────────────┐
                                       │                          │
                    ┌──────────────────┼──────────────────┐      │
                    │                  │                  │      │
                    ▼                  ▼                  ▼      │
            Load MRN Materials   Add Material      Manual Entry  │
            (Auto Fetch)        (Single Click)   (Optional)     │
                    │                  │                  │      │
                    ▼                  ▼                  ▼      │
            ┌──────────────────────────────────────────────┐    │
            │   Frontend Material Processing               │    │
            │  Lines 1806-1971 (ProductionWizardPage)     │    │
            └──────────────────────────────────────────────┘    │
                    │                  │                         │
     ┌──────────────┴──────────────┬───┴──────────────────┐    │
     │                             │                      │    │
     ▼                             ▼                      │    │
generateNextMaterialId()   Map MRN Materials        Manual Add  │
(M-001 for 1st,          (Generate M-001, M-002)   → M-00X      │
 M-002 for 2nd, etc.)    Line 819                              │
 Line 1807-1812                                                │
     │                             │                      │    │
     └──────────────┬──────────────┴──────────────────────┘    │
                    │                                           │
                    ▼                                           │
         Form Data with IDs:                                    │
         ┌─────────────────────┐                                │
         │ Material #1         │                                │
         │ ├─ materialId: M-001│◄─────────────────────────────┘
         │ ├─ description: ... │
         │ └─ quantity: ...    │
         │                     │
         │ Material #2         │
         │ ├─ materialId: M-002│
         │ ├─ description: ... │
         │ └─ quantity: ...    │
         └─────────────────────┘
                    │
                    ▼
         User submits form
                    │
                    ▼
    ┌───────────────────────────────────┐
    │   POST /api/manufacturing/orders  │
    │   With materials_required array   │
    └───────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────────────────────┐
    │      Backend Material Processing                      │
    │   server/routes/manufacturing.js                      │
    │   Lines 537-558                                       │
    └───────────────────────────────────────────────────────┘
                    │
            ┌───────┴───────┐
            │               │
            ▼               ▼
    Check if ID exists   If no ID:
                         └─► generateMaterialId(index)
                             Line 369
                             (M-001, M-002, etc.)
            │               │
            └───────┬───────┘
                    ▼
            ┌──────────────────────────────────────┐
            │  MaterialRequirement.create()        │
            │  {                                   │
            │    production_order_id: 1,          │
            │    material_id: 'M-001',  ◄─────┐  │
            │    description: 'Cotton',       │  │
            │    required_quantity: 5,       │  │
            │    unit: 'meter',              │  │
            │    status: 'available'         │  │
            │  }                             │  │
            └──────────────────────────────────────┘
                         │                    │
                         ▼                    │
                  Console Log:      ◄────────┘
                  ✅ Material M-001:
                     Cotton Fabric
                     (5 Meter)
                    │
                    ▼
    ┌─────────────────────────────────────┐
    │   Database Storage                  │
    │   material_requirements table       │
    │                                     │
    │   id  │  material_id  │ description│
    │   ───┼───────────────┼────────────│
    │   1   │    M-001      │  Cotton   │
    │   2   │    M-002      │  Thread   │
    └─────────────────────────────────────┘
                    │
                    ▼
        ✅ Production order created
           with materials and IDs
```

---

## Material ID Generation Flow

### Frontend (User Perspective)

```
SCENARIO 1: Load Materials from MRN
═══════════════════════════════════════

Step 1: Select Project
    │
    └─► Project has Material Request (MRN)
            │
            ▼
Step 4: Materials Tab
    │
    └─► System fetches MRN materials
            │
            ├─► Material 1: Cotton (5m)
            │   └─► Frontend: Assign M-001
            │
            ├─► Material 2: Thread (10 spool)
            │   └─► Frontend: Assign M-002
            │
            └─► Material 3: Dye (2kg)
                └─► Frontend: Assign M-003
                    │
                    ▼
                Display in Materials Tab:
                ┌──────────────────────────┐
                │ Material ID: M-001       │  ◄─ Read-Only
                │ Description: Cotton      │
                │ Qty: 5 Meter             │
                │ Status: Available        │
                └──────────────────────────┘
                
                ┌──────────────────────────┐
                │ Material ID: M-002       │  ◄─ Read-Only
                │ Description: Thread      │
                │ Qty: 10 Spool            │
                │ Status: Available        │
                └──────────────────────────┘
                
                ┌──────────────────────────┐
                │ Material ID: M-003       │  ◄─ Read-Only
                │ Description: Dye         │
                │ Qty: 2 KG                │
                │ Status: Available        │
                └──────────────────────────┘
                    │
                    ▼
            Submit Order
```

```
SCENARIO 2: Add Materials Manually
═══════════════════════════════════════

Step 4: Materials Tab
    │
    └─► Click "Add Material" Button
            │
            ▼
    generateNextMaterialId() is called
            │
            ├─► fields.length = 0
            │   └─► Return M-001
            │
            ▼
    Material appears with M-001 (read-only)
            │
            ├─► User fills in description
            ├─► User fills in quantity
            ├─► User selects unit
            ├─► User selects status
            │
            ▼
    Click "Add Additional Material"
            │
            ├─► fields.length = 1
            │   └─► Return M-002
            │
            ▼
    Material appears with M-002 (read-only)
            │
            ├─► User fills in details
            │
            ▼
    Submit Order
```

---

## Data Flow Diagram

```
FRONTEND                          BACKEND                        DATABASE
═════════                         ═══════                        ════════

User Action
    │
    ▼
FormData:                      POST /api/manufacturing/orders
{                           ◄──────────────────────────────────
  materials_required: [
    {
      materialId: 'M-001',
      description: 'Cotton',
      required_quantity: 5,
      unit: 'meter'
    },
    {
      materialId: 'M-002',
      description: 'Thread',
      required_quantity: 10,
      unit: 'spool'
    }
  ]
}
                                     │
                                     ▼
                              Loop through materials
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     ▼
                   Check materialId      Material exists?
                          │                     │
            ┌─────────────┴─────────┐          No
            │                       │          │
            Yes                     No         ▼
            │                       │    generateMaterialId(index)
            │                       └─────► M-001, M-002, etc.
            │                               │
            └─────────────┬─────────────────┘
                          │
                          ▼
                   Use Final ID
                          │
                          ▼
            MaterialRequirement.create({
              production_order_id: 1,
              material_id: 'M-001',  ◄── ✅ FINAL ID
              description: 'Cotton',
              required_quantity: 5,
              unit: 'meter'
            })
                          │
                          ▼
                    Sequelize Model
                    INSERT INTO material_requirements
                          │
                          ▼
                          ├──► material_requirements table
                          │    id: 1
                          │    production_order_id: 1
                          │    material_id: M-001
                          │    description: Cotton
                          │    required_quantity: 5
                          │    unit: meter
                          │
                          └──► material_requirements table
                               id: 2
                               production_order_id: 1
                               material_id: M-002
                               description: Thread
                               required_quantity: 10
                               unit: spool
                          │
                          ▼
                    Response to Frontend:
                    {
                      message: 'Production order created',
                      order: {
                        id: 1,
                        materials: [
                          { id: 1, material_id: 'M-001' },
                          { id: 2, material_id: 'M-002' }
                        ]
                      }
                    }
```

---

## State Changes During Material Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                  MATERIAL STATE LIFECYCLE                        │
└─────────────────────────────────────────────────────────────────┘

INITIAL STATE (No Materials):
┌────────────────────────────┐
│ fields: []                 │
│ materials: {}              │
└────────────────────────────┘
         │
         ▼
USER ADDS FIRST MATERIAL:
┌────────────────────────────────────────────┐
│ fields: [{                                 │
│   materialId: 'M-001',  ◄─ Generated      │
│   description: '',                         │
│   requiredQuantity: ''                     │
│ }]                                         │
└────────────────────────────────────────────┘
         │
         ▼
USER FILLS IN DETAILS:
┌─────────────────────────────────────────────────┐
│ fields: [{                                      │
│   materialId: 'M-001',     ◄─ Still Generated  │
│   description: 'Cotton',   ◄─ User Input       │
│   requiredQuantity: '5',   ◄─ User Input       │
│   unit: 'meter'            ◄─ User Selection   │
│ }]                                              │
└─────────────────────────────────────────────────┘
         │
         ▼
USER ADDS SECOND MATERIAL:
┌──────────────────────────────────────────────┐
│ fields: [                                    │
│   {                                          │
│     materialId: 'M-001',                     │
│     description: 'Cotton',                   │
│     requiredQuantity: '5',                   │
│     unit: 'meter'                            │
│   },                                         │
│   {                                          │
│     materialId: 'M-002',  ◄─ Auto-Generated  │
│     description: '',                         │
│     requiredQuantity: ''                     │
│   }                                          │
│ ]                                            │
└──────────────────────────────────────────────┘
         │
         ▼
USER SUBMITS:
┌────────────────────────────────────────────────────────┐
│ Backend processes:                                     │
│ - Validates material_id (required, not null)          │
│ - Double-checks IDs exist (M-001, M-002)              │
│ - Creates MaterialRequirement records                 │
│ - Saves to database with IDs                          │
└────────────────────────────────────────────────────────┘
         │
         ▼
DATABASE STORAGE:
┌────────────────────────────────────────────────────────┐
│ material_requirements table:                           │
│                                                        │
│ id │ prod_order_id │ material_id │ description        │
│ ──┼───────────────┼─────────────┼────────────        │
│ 1  │      1        │   M-001     │ Cotton             │
│ 2  │      1        │   M-002     │ Thread             │
└────────────────────────────────────────────────────────┘
```

---

## Code Execution Flow

### Frontend: When "Add Material" is Clicked

```javascript
Line 1967:
  <button onClick={() => append({ 
    materialId: generateNextMaterialId(),  ◄── EXECUTES
    description: '', 
    ...
  })}>

  Line 1807-1812: generateNextMaterialId() Function
  ┌─────────────────────────────────────────────────┐
  │ const maxIndex = fields.length > 0              │
  │   ? Math.max(...fields.map(...)) + 1            │
  │   : 0;                                          │
  │                                                 │
  │ return `M-${(maxIndex + 1).toString()...}`     │
  └─────────────────────────────────────────────────┘
         │
         ├─► First call: maxIndex=0 → Returns 'M-001'
         ├─► Second call: maxIndex=1 → Returns 'M-002'
         └─► Third call: maxIndex=2 → Returns 'M-003'
```

### Backend: When Order is Submitted

```javascript
Line 540:
  for (let materialIndex = 0; materialIndex < materials_required.length; materialIndex++)

  Line 541-543:
  const material = materials_required[materialIndex];
  const materialId = material.material_id || generateMaterialId(materialIndex);
         │
         ├─► IF material.material_id exists → Use it
         └─► IF NOT exists → Generate using function
         
  Line 369:
  const generateMaterialId = (index) => {
    return `M-${(index + 1).toString().padStart(3, '0')}`;
  };
         │
         ├─► First material (index=0): 'M-001'
         ├─► Second material (index=1): 'M-002'
         └─► Nth material (index=n): 'M-00X'
```

---

## Summary Visual

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   INPUT (From Frontend)                  PROCESS                 │
│   ═════════════════════                  ═══════                 │
│                                                                  │
│   Materials:                            Step 1: Check if ID exists
│   ├─ M-001 ✓ (has ID)           ─────────┤                      │
│   └─ (no ID) ✗                  ─────────┤ Step 2: If no ID,    │
│                                          │ generate M-00X        │
│                     OUTPUT                │                      │
│                     ══════                ▼                      │
│                                                                  │
│                      ┌─────────────────────────┐                 │
│                      │ M-001 ✓ (confirmed)    │                 │
│                      │ M-002 ✓ (generated)    │                 │
│                      └─────────────────────────┘                 │
│                                 │                                │
│                                 ▼                                │
│                          Store in Database
│                          ✅ All materials have IDs
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Points Visualization

```
🎯 GOAL ACHIEVEMENT

┌────────────────────────────────────────┐
│ ✅ COMPULSORY Material IDs             │
│    └─ allowNull: false in database    │
│    └─ Required in form validation      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ✅ AUTO-GENERATED Material IDs         │
│    └─ Format: M-001, M-002, M-003...  │
│    └─ Frontend + Backend generation   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ✅ FETCHED BY DEFAULT                  │
│    └─ Materials load in tab auto      │
│    └─ IDs visible immediately         │
│    └─ Read-only (user can't change)   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ✅ STORED PERMANENTLY                  │
│    └─ Database: material_id = M-001   │
│    └─ Indexed for fast queries         │
│    └─ Audit trail in logs              │
└────────────────────────────────────────┘
```

---

## End-to-End Journey

```
1️⃣  CREATE PRODUCTION ORDER
    ▼
2️⃣  SELECT PROJECT (with MRN)
    ▼
3️⃣  MATERIALS TAB
    ├─► MRN materials load
    ├─► Frontend generates IDs: M-001, M-002, M-003
    ├─► Display in form (read-only)
    └─► User can adjust quantity/status
    ▼
4️⃣  SUBMIT FORM
    ├─► Frontend sends data with M-001, M-002, M-003
    └─► Backend validates IDs exist
    ▼
5️⃣  BACKEND PROCESSING
    ├─► Loop through materials
    ├─► Check if ID exists → Use it
    ├─► If no ID → Generate using generateMaterialId()
    └─► Create MaterialRequirement with ID
    ▼
6️⃣  DATABASE STORAGE
    ├─► material_requirements table updated
    ├─► All material_id fields populated (M-001, M-002, etc.)
    └─► Indexed for queries
    ▼
7️⃣  ✅ SUCCESS
    ├─► Production order created with material IDs
    ├─► All materials have sequential IDs
    ├─► Console logs show: "✅ Material M-001: Description..."
    └─► Ready for tracking and auditing
```