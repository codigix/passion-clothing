# Production Wizard: Visual Flow Diagrams

## 🎬 Complete User Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION WIZARD FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌──────────────────────────────────────────┐
│ STEP 1: SELECT PROJECT (Order Selection) │
│                                          │
│  User: Select sales order from dropdown  │
│         ▼                                │
│  System: fetchOrderDetails()             │
│         ├─ GET /manufacturing/mrn       │
│         ├─ Parse MRN materials          │
│         └─ Auto-fill forms              │
│         ▼                                │
│  Result: ✅ Blue banner shows materials  │
└──────────────────────────────────────────┘
         │
         ▼ Click "Next"
         
┌──────────────────────────────────────────┐
│ STEP 2: ORDER DETAILS                    │
│                                          │
│  ✓ Production Type (select)              │
│  ✓ Quantity (auto-filled, editable)      │
│  ✓ Priority (select)                     │
│  ✓ Special Instructions (optional)       │
└──────────────────────────────────────────┘
         │
         ▼ Click "Next"
         
┌──────────────────────────────────────────┐
│ STEP 3: SCHEDULING                       │
│                                          │
│  ✓ Start Date                            │
│  ✓ End Date (>= Start Date)              │
│  ✓ Shift Selection                       │
│  ✓ Expected Hours (optional)             │
└──────────────────────────────────────────┘
         │
         ▼ Click "Next"
         
┌──────────────────────────────────────────┐
│ STEP 4: MATERIALS ⭐                     │
│                                          │
│  📦 Materials loaded from MRN            │
│     (3 material(s) shown)                │
│                                          │
│  Material #1                             │
│  ├─ ID: FABRIC-COTTON (disabled)         │
│  ├─ Desc: Cotton Fabric (disabled)       │
│  ├─ Required Qty: 100 ⚡ (editable)      │
│  ├─ 📋 Sourced from MRN:                 │
│  │  ├─ Unit: Meters (disabled)           │
│  │  ├─ 🏷️ Barcode: BC123 (disabled)     │
│  │  ├─ 📍 Location: WH-A (disabled)      │
│  │  ├─ 🎨 Color: Navy (disabled)         │
│  │  ├─ ⚖️ GSM: 150 (disabled)            │
│  │  └─ 📏 Width: 45" (disabled)          │
│  └─ Status: Available ✓ (editable)       │
│                                          │
│  [+ Add Additional Material] (optional)  │
└──────────────────────────────────────────┘
         │
         ▼ Click "Next"
         
┌──────────────────────────────────────────┐
│ STEP 5: QUALITY CHECKPOINTS              │
│                                          │
│  Checkpoint 1:                           │
│  ├─ Name: Color Accuracy                 │
│  ├─ Frequency: Per Batch                 │
│  └─ Criteria: Within ±2 shades           │
│                                          │
│  Checkpoint 2:                           │
│  ├─ Name: Stitch Quality                 │
│  ├─ Frequency: Per Hour                  │
│  └─ Criteria: Even tension, no dropped   │
│                                          │
│  [+ Add Checkpoint] (min 1 required)    │
└──────────────────────────────────────────┘
         │
         ▼ Click "Next"
         
┌──────────────────────────────────────────┐
│ STEP 6: TEAM ASSIGNMENT                  │
│                                          │
│  ✓ Supervisor: (select from users)       │
│  ✓ Assigned To: (select from users)      │
│  ✓ QA Lead: (select from users)          │
│  ✓ Team Notes: (optional)                │
└──────────────────────────────────────────┘
         │
         ▼ Click "Next"
         
┌──────────────────────────────────────────┐
│ STEP 7: CUSTOMIZATION (Stages)           │
│                                          │
│  Option A (Default):                     │
│  ☐ Use Custom Stages (unchecked)         │
│  → Uses 6 default stages                 │
│                                          │
│  Option B (Custom):                      │
│  ☑ Use Custom Stages (checked)           │
│  ├─ Stage 1: Cutting (4 hours)           │
│  ├─ Stage 2: Embroidery (outsourced)     │
│  └─ Stage 3: Assembly (8 hours)          │
└──────────────────────────────────────────┘
         │
         ▼ Click "Next"
         
┌──────────────────────────────────────────┐
│ STEP 8: REVIEW & SUBMIT                  │
│                                          │
│  [Read-only summary of all fields]       │
│                                          │
│  ☐ I confirm all details are correct     │
│                                          │
│  [Create Production Order] (on check)    │
└──────────────────────────────────────────┘
         │
         ▼ Click Submit
         
┌──────────────────────────────────────────┐
│ SUBMISSION PROCESSING                    │
│                                          │
│ 1. POST /manufacturing/orders            │
│    → Production order created ✅         │
│                                          │
│ 2. PUT /sales/orders/.../status          │
│    → Status updated to in_production ✅  │
│                                          │
│ 3. POST /manufacturing/stages/.../ops    │
│    → Operations created per stage ✅     │
│                                          │
│ 4. POST /manufacturing/challans          │
│    → Challans created for outsourced ✅  │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ SUCCESS                                  │
│                                          │
│ ✅ Production order created              │
│ ✅ Show success toast                    │
│ ✅ Navigate to /manufacturing/orders     │
│ ✅ See new order in list                 │
└──────────────────────────────────────────┘
```

---

## 🔄 Material Loading Flow (Enhanced)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MATERIAL LOADING FLOW                         │
└─────────────────────────────────────────────────────────────────┘

STEP 1: User Selects Sales Order
        ▼
        salesOrderId: "123"
        ▼
fetchOrderDetails("123")
        ▼
┌────────────────────────────────┐
│ API Call: GET /manufacturing/  │
│ mrn-requests?sales_order_id=123│
└────────────────────────────────┘
        ▼
        Response: MRN Record
        {
          id: 1,
          request_number: "MRN-20250115-00001",
          materials_requested: [
            {
              inventory_id: "INV-001",
              material_name: "Cotton Fabric",
              quantity_required: 100,
              uom: "meters",
              barcode_scanned: "BC123",
              location: "WH-A",
              color: "Navy Blue",
              gsm: "150",
              width: "45"
            },
            ...
          ]
        }
        ▼
┌────────────────────────────────────────────┐
│  Transform Materials (Intelligent Fallback)│
├────────────────────────────────────────────┤
│ For each material in MRN:                  │
│                                            │
│ materialId:                                │
│   = inventory_id ("INV-001")               │
│   OR material_code                         │
│   OR id                                    │
│   OR "" (default)                          │
│                                            │
│ description:                               │
│   = material_name ("Cotton Fabric")        │
│   OR name                                  │
│   OR description                           │
│   OR product_name                          │
│   OR "" (default)                          │
│                                            │
│ requiredQuantity:                          │
│   = quantity_received (100)                │
│   OR quantity_required                     │
│   OR quantity                              │
│   OR quantity_needed                       │
│   OR "" (default)                          │
│                                            │
│ unit:                                      │
│   = uom ("meters")                         │
│   OR unit                                  │
│   OR "pieces" (default)                    │
│                                            │
│ barcode:                                   │
│   = barcode_scanned ("BC123")              │
│   OR barcode                               │
│   OR "" (default)                          │
│                                            │
│ location:                                  │
│   = location ("WH-A")                      │
│   OR warehouse_location                    │
│   OR "" (default)                          │
│                                            │
│ color: "Navy Blue" (optional)              │
│ gsm: "150" (optional)                      │
│ width: "45" (optional)                     │
│ condition: (optional)                      │
│ remarks: "From MRN MRN-20250115-00001"     │
│                                            │
│ status: "available" (default)              │
└────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────┐
│ Form State Update               │
│                                 │
│ materials.items = [             │
│   {                             │
│     materialId: "INV-001",       │
│     description: "Cotton...",    │
│     requiredQuantity: 100,       │
│     unit: "meters",              │
│     barcode: "BC123",            │
│     location: "WH-A",            │
│     color: "Navy Blue",          │
│     gsm: "150",                  │
│     width: "45",                 │
│     remarks: "From MRN...",      │
│     status: "available"          │
│   },                             │
│   ...                            │
│ ]                               │
└─────────────────────────────────┘
        ▼
┌─────────────────────────────────┐
│ Update UI                       │
│                                 │
│ ✓ Show success banner           │
│ ✓ Display material count        │
│ ✓ Render material cards         │
│ ✓ Mark MRN fields as disabled   │
│ ✓ Keep editable fields white    │
│ ✓ Show MRN details section      │
└─────────────────────────────────┘
        ▼
┌─────────────────────────────────┐
│ Display in Materials Step       │
│                                 │
│ 📦 Materials loaded from MRN    │
│    (3 material(s) shown)        │
│                                 │
│ [Material Cards Rendered]       │
└─────────────────────────────────┘
        ▼
        Ready for Step 4 completion
```

---

## 🎨 Material Card Rendering Structure

```
┌────────────────────────────────────────────────────────────┐
│                    MATERIAL CARD                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Header Row (gray background, border-bottom)             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 📌 Material #1                   [✕ Remove]         │ │
│  │ 🔗 From MRN MRN-20250115-00001                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Core Information Section                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ CORE INFORMATION                                     │ │
│  │                                                      │ │
│  │ ┌─────────────────┬─────────────────┬─────────────┐ │ │
│  │ │ Material ID     │ Description     │ Required    │ │ │
│  │ │ (disabled)      │ (disabled)      │ Qty ⚡      │ │ │
│  │ │ FABRIC-COTTON   │ Cotton Fabric   │ 100         │ │ │
│  │ │ [gray bg]       │ [gray bg]       │ [white bg]  │ │ │
│  │ └─────────────────┴─────────────────┴─────────────┘ │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  MRN Details Section (purple gradient)                    │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 📋 SOURCED FROM MRN                                  │ │
│  │                                                      │ │
│  │ ┌─────────┬──────────────┬─────────────────────────┐ │ │
│  │ │ Unit    │ 🏷️ Barcode  │ 📍 Location            │ │ │
│  │ │(disabled)│ (disabled)  │ (disabled)              │ │ │
│  │ │ meters  │ BC123456789  │ Warehouse A, Shelf 3   │ │ │
│  │ └─────────┴──────────────┴─────────────────────────┘ │ │
│  │                                                      │ │
│  │ ────────────────────────────────────────────────────│ │
│  │ FABRIC ATTRIBUTES (shown only if present)          │ │
│  │                                                      │ │
│  │ ┌──────────────┬────────────┬──────────────────────┐ │ │
│  │ │ 🎨 Color     │ ⚖️ GSM     │ 📏 Width            │ │ │
│  │ │ (disabled)   │ (disabled) │ (disabled)           │ │ │
│  │ │ Navy Blue    │ 150        │ 45 inches            │ │ │
│  │ └──────────────┴────────────┴──────────────────────┘ │ │
│  │                                                      │ │
│  │ [If condition exists]                              │ │
│  │ ────────────────────────────────────────────────────│ │
│  │ Condition: New (disabled)                          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Status & Adjustments Section                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ STATUS & ADJUSTMENTS                                │ │
│  │                                                      │ │
│  │ Availability Status *                              │ │
│  │ ┌────────────────────────────────────────────────┐  │ │
│  │ │ ✓ Available ▼                                  │  │ │
│  │ │ ├─ ✓ Available                                 │  │ │
│  │ │ ├─ ⚠️ Shortage                                 │  │ │
│  │ │ └─ 📦 Ordered                                  │  │ │
│  │ │[white bg, editable]                            │  │ │
│  │ └────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘

COLOR SCHEME:
├─ Header: White/Gray border-bottom
├─ Core Info: White background
├─ MRN Section: Purple gradient (from-purple-50 to-purple-100)
├─ Borders: Gray-200 (1px), Purple-300 (2px)
├─ Text: Gray-900 (header), Gray-700 (labels), Gray-600 (disabled)
├─ Backgrounds: White (editable), Gray-100 (disabled)
└─ Icons: Emoji indicators (📌, 🔗, 📋, 🏷️, 📍, 🎨, ⚖️, 📏)
```

---

## 📊 Form State Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              PRODUCTION WIZARD FORM STATE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ {                                                              │
│   orderSelection: {                                           │
│     salesOrderId: "123",         ← User selects, auto-fill   │
│     autoFilled: true              ← Indicates prefilled      │
│   },                                                          │
│                                                                 │
│   orderDetails: {                                             │
│     productId: "45",              ← Auto-filled from SO      │
│     productionType: "in_house",   ← User selects            │
│     quantity: 100,                ← Auto-filled, editable   │
│     priority: "high",             ← User selects            │
│     salesOrderId: "123",          ← Auto-filled from SO      │
│     specialInstructions: "..."    ← User enters (optional)   │
│   },                                                          │
│                                                                 │
│   scheduling: {                                               │
│     plannedStartDate: "2025-01-15",  ← User enters         │
│     plannedEndDate: "2025-01-22",    ← User enters         │
│     shift: "morning",                ← User selects        │
│     expectedHours: 40                ← User enters (opt)   │
│   },                                                          │
│                                                                 │
│   materials: {                                                │
│     items: [                                                 │
│       {                                                       │
│         materialId: "INV-001",       ← Auto-filled MRN     │
│         description: "Cotton...",    ← Auto-filled MRN     │
│         requiredQuantity: 100,       ← User edits (MRN)    │
│         unit: "meters",              ← Auto-filled MRN     │
│         status: "available",         ← User selects        │
│         barcode: "BC123",            ← Auto-filled MRN     │
│         location: "WH-A",            ← Auto-filled MRN     │
│         color: "Navy Blue",          ← Auto-filled MRN     │
│         gsm: "150",                  ← Auto-filled MRN     │
│         width: "45",                 ← Auto-filled MRN     │
│         condition: "New",            ← Auto-filled MRN     │
│         remarks: "From MRN MRN-..."  ← Auto-filled MRN     │
│       },                                                      │
│       ...                                                      │
│     ]                                                         │
│   },                                                          │
│                                                                 │
│   quality: {                                                  │
│     checkpoints: [                                           │
│       {                                                       │
│         name: "Color Accuracy",   ← User enters           │
│         frequency: "per_batch",   ← User selects          │
│         acceptanceCriteria: "..." ← User enters           │
│       },                                                      │
│       ...                                                      │
│     ],                                                        │
│     notes: "..."                  ← User enters (optional)  │
│   },                                                          │
│                                                                 │
│   team: {                                                     │
│     supervisorId: "5",            ← User selects (opt)     │
│     assignedToId: "8",            ← User selects (opt)     │
│     qaLeadId: "12",               ← User selects (opt)     │
│     notes: "..."                  ← User enters (opt)      │
│   },                                                          │
│                                                                 │
│   customization: {                                            │
│     useCustomStages: false,       ← User toggles          │
│     stages: []                    ← Empty if not custom    │
│   },                                                          │
│                                                                 │
│   review: {                                                   │
│     acknowledge: true             ← User confirms in Step 8 │
│   }                                                          │
│ }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

LEGEND:
├─ Auto-filled from MRN  ← [MRN source]
├─ Auto-filled from SO   ← [Sales Order source]
├─ User selects          ← [Dropdown/Radio]
├─ User enters           ← [Text input]
└─ (opt) = Optional field
```

---

## 🔀 Validation Flow

```
┌─────────────────────────────────────────────────────────────┐
│           STEP VALIDATION & ERROR TRACKING                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ User clicks "Next" button                                 │
│      │                                                     │
│      ▼                                                     │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Validate current step against schema               │   │
│ │ (using Yup validation)                             │   │
│ └─────────────────────────────────────────────────────┘   │
│      │                                                     │
│      ├──→ Validation PASSES                              │
│      │        │                                           │
│      │        ▼                                           │
│      │   ┌─────────────────────────────────────────┐     │
│      │   │ Add current step to completedSteps     │     │
│      │   │ Remove from invalidSteps (if there)    │     │
│      │   │ Move to next step                      │     │
│      │   │ Show green "Step Complete" banner      │     │
│      │   └─────────────────────────────────────────┘     │
│      │        │                                           │
│      │        ▼ STEP INDICATOR                           │
│      │   ┌─────────┐                                      │
│      │   │ ✅ Step │ (green checkmark)                    │
│      │   └─────────┘                                      │
│      │                                                     │
│      ├──→ Validation FAILS                               │
│           │                                               │
│           ▼                                               │
│       ┌─────────────────────────────────────────┐         │
│       │ Add current step to invalidSteps        │         │
│       │ Keep user on current step               │         │
│       │ Show red "Validation Required" banner   │         │
│       │ Highlight fields with errors:          │         │
│       │  - Red border on field                 │         │
│       │  - Error message below field           │         │
│       │  - Field scrolled into view            │         │
│       │                                         │         │
│       │ Error count shown in banner             │         │
│       └─────────────────────────────────────────┘         │
│       │                                                   │
│       ▼ STEP INDICATOR                                   │
│   ┌──────────┐                                           │
│   │ ⚠️ Step  │ (red alert icon)                          │
│   └──────────┘                                           │
│                                                           │
│ STEPPER (Progress Indicator)                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  1    2    3    4    5    6    7    8               │ │
│ │ 🟢   🟡   ⚪   ⚪   ⚪   ⚪   ⚪   ⚪    ← States   │ │
│ │ ✅   ◀●   □    □    □    □    □    □              │ │
│ │      ▲                                             │ │
│ │   Current step with icon                          │ │
│ │                                                   │ │
│ │ Legend:                                           │ │
│ │  🟢 ✅ Completed (green, checkmark)              │ │
│ │  🟡 ◀● Current (blue, active icon)               │ │
│ │  ⚪ □  Pending (gray, number)                     │ │
│ │  🔴 ⚠️  Error (red, alert icon)                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📤 API Submission Flow

```
┌─────────────────────────────────────────────────────────────┐
│            PRODUCTION ORDER SUBMISSION FLOW                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Step 8: User clicks "Create Production Order"             │
│         (acknowledge checkbox must be checked)             │
│      │                                                     │
│      ▼                                                     │
│ ┌──────────────────────────────────────┐                  │
│ │ 1. VALIDATE FORM DATA                │                  │
│ │                                      │                  │
│ │ ✓ Check product_id is numeric        │                  │
│ │ ✓ If invalid: Show error & stay      │                  │
│ └──────────────────────────────────────┘                  │
│      │                                                     │
│      ▼ (setSubmitting = true)                             │
│ ┌──────────────────────────────────────┐                  │
│ │ 2. BUILD PAYLOAD                     │                  │
│ │                                      │                  │
│ │ payload = buildPayload(formValues)   │                  │
│ │                                      │                  │
│ │ Includes:                            │                  │
│ │ ├─ Order metadata                    │                  │
│ │ ├─ Materials required                │                  │
│ │ ├─ Quality parameters                │                  │
│ │ ├─ Team assignments                  │                  │
│ │ └─ Stages (if custom)                │                  │
│ └──────────────────────────────────────┘                  │
│      │                                                     │
│      ▼                                                     │
│ ┌──────────────────────────────────────┐                  │
│ │ 3. CREATE PRODUCTION ORDER           │                  │
│ │                                      │                  │
│ │ POST /manufacturing/orders           │                  │
│ │ with full payload                    │                  │
│ │                                      │                  │
│ │ Response: {                          │                  │
│ │   id: 1,                             │                  │
│ │   production_number: "PO-2025-001",  │                  │
│ │   stages: [{...}, {...}],            │                  │
│ │   ...                                │                  │
│ │ }                                    │                  │
│ └──────────────────────────────────────┘                  │
│      │                                                     │
│      ├─→ SUCCESS ✅                                        │
│      │        │                                           │
│      │        ▼                                           │
│      │  ┌──────────────────────────────────────┐          │
│      │  │ 4. UPDATE SALES ORDER STATUS        │          │
│      │  │    (Non-blocking side effect)       │          │
│      │  │                                    │          │
│      │  │ PUT /sales/orders/{id}/status      │          │
│      │  │ { status: 'in_production',         │          │
│      │  │   production_order_id: 1 }        │          │
│      │  │                                    │          │
│      │  │ If fails: Log, continue ⚠️         │          │
│      │  └──────────────────────────────────────┘          │
│      │        │                                           │
│      │        ▼                                           │
│      │  ┌──────────────────────────────────────┐          │
│      │  │ 5. CREATE STAGE OPERATIONS          │          │
│      │  │    (Non-blocking side effect)       │          │
│      │  │                                    │          │
│      │  │ For each stage in response:        │          │
│      │  │ POST /manufacturing/stages/{id}/   │          │
│      │  │ operations                         │          │
│      │  │ { operations: [...] }              │          │
│      │  │                                    │          │
│      │  │ If fails: Log, continue per stage  │          │
│      │  └──────────────────────────────────────┘          │
│      │        │                                           │
│      │        ▼                                           │
│      │  ┌──────────────────────────────────────┐          │
│      │  │ 6. CREATE AUTO-CHALLANS              │          │
│      │  │    (Non-blocking side effect)       │          │
│      │  │                                    │          │
│      │  │ For outsourced embroidery/print:   │          │
│      │  │ POST /manufacturing/challans       │          │
│      │  │ { stage_id, vendor_id,            │          │
│      │  │   status: 'draft', ... }          │          │
│      │  │                                    │          │
│      │  │ If fails: Log, continue           │          │
│      │  └──────────────────────────────────────┘          │
│      │        │                                           │
│      │        ▼                                           │
│      │  ┌──────────────────────────────────────┐          │
│      │  │ 7. SUCCESS COMPLETION               │          │
│      │  │                                    │          │
│      │  │ ✅ Show success toast              │          │
│      │  │ ✅ (setSubmitting = false)         │          │
│      │  │ ✅ Navigate to                     │          │
│      │  │    /manufacturing/orders           │          │
│      │  │ ✅ Redirect happens                │          │
│      │  │ ✅ New order visible in list       │          │
│      │  └──────────────────────────────────────┘          │
│      │                                                    │
│      └─→ FAILURE ❌                                        │
│               │                                           │
│               ▼                                           │
│       ┌────────────────────────────────────────┐          │
│       │ ERROR HANDLING                         │          │
│       │                                        │          │
│       │ ❌ Show error toast                    │          │
│       │ ❌ Extract error message from API      │          │
│       │ ❌ Log full error to console           │          │
│       │ ❌ (setSubmitting = false)             │          │
│       │ ❌ Stay on Review step                 │          │
│       │ ❌ User can fix and retry              │          │
│       └────────────────────────────────────────┘          │
│                                                           │
└─────────────────────────────────────────────────────────────┘

KEY POINTS:
├─ Main order creation MUST succeed
├─ Side effects are non-blocking (marked as try-catch)
├─ Order still created even if side effects fail
├─ User gets feedback of outcome
└─ Complete audit trail maintained throughout
```

---

## 🎛️ Component State Management

```
┌──────────────────────────────────────────────────────────┐
│        PRODUCTION WIZARD STATE MANAGEMENT                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ useState Hooks (Local Component State):                │
│ ├─ currentStep: 0-7         (which step shown)         │
│ ├─ completedSteps: Set()    (steps with no errors)     │
│ ├─ invalidSteps: Set()      (steps with errors)        │
│ ├─ submitting: boolean      (form being submitted)     │
│ ├─ loadingProducts: boolean (fetching products)        │
│ ├─ loadingSalesOrders: boolean                         │
│ ├─ loadingProductDetails: boolean (fetching SO details)│
│ ├─ loadingVendors: boolean                             │
│ ├─ loadingOrders: boolean                              │
│ ├─ productOptions: []       (dropdown options)         │
│ ├─ salesOrderOptions: []    (dropdown options)         │
│ ├─ filters: {}              (search filters)           │
│ ├─ searchInputs: {}         (search text)              │
│ ├─ productDetails: null     (selected product)         │
│ ├─ salesOrders: []          (all SO for dropdown)      │
│ ├─ selectedOrderDetails: {} (auto-fill data)          │
│ ├─ vendors: []              (all vendors)              │
│ ├─ uploadedFiles: {}        (document uploads)         │
│ └─ refs: useRef()           (debounce timers)          │
│                                                          │
│ useForm (React Hook Form):                              │
│ ├─ methods.register()       (register inputs)          │
│ ├─ methods.watch()          (observe changes)          │
│ ├─ methods.setValue()       (programmatic set)         │
│ ├─ methods.handleSubmit()   (handle submission)        │
│ ├─ methods.formState.errors (validation errors)        │
│ └─ methods.reset()          (clear form)               │
│                                                          │
│ Form Schema (Yup Validation):                           │
│ ├─ orderSelectionSchema                                │
│ ├─ orderDetailsSchema                                  │
│ ├─ schedulingSchema                                    │
│ ├─ materialsSchema        ← validates items array     │
│ ├─ qualitySchema          ← validates checkpoints     │
│ ├─ teamSchema                                          │
│ ├─ customizationSchema    ← validates stages          │
│ ├─ reviewSchema           ← validates acknowledge     │
│ └─ formSchema             ← combines all              │
│                                                          │
│ useFieldArray (React Hook Form):                        │
│ ├─ Used for: materials.items                          │
│ ├─ Used for: quality.checkpoints                      │
│ ├─ Used for: customization.stages                     │
│ │                                                      │
│ │ Methods:                                            │
│ │ ├─ append()    (add new item)                       │
│ │ ├─ remove()    (delete item)                        │
│ │ ├─ insert()    (add at position)                    │
│ │ ├─ swap()      (reorder items)                      │
│ │ └─ fields[]    (current items)                      │
│ │                                                      │
│ └─ Each field in array has auto-generated ID:        │
│    field.id = unique key for React rendering         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Summary of Diagrams

This visual guide covers:

✅ **Complete User Flow** - All 8 steps from start to finish
✅ **Material Loading** - MRN data transformation and prefilling
✅ **Material Card Structure** - Visual layout with all sections
✅ **Form State** - All data fields and their sources
✅ **Validation Flow** - Step validation and error handling
✅ **API Submission** - Complete submission process with side effects
✅ **State Management** - All React hooks and data structures

These diagrams provide a complete picture of how the Production Wizard works from the user perspective and the technical implementation.
