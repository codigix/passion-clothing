# Manufacturing Material Request (MRN) - Quick Start Guide

## ✅ What Was Implemented

### **1. Backend Model & Database**
- ✅ Enhanced `ProjectMaterialRequest` model to support both flows (Procurement + Manufacturing)
- ✅ Added new fields: `requesting_department`, `required_by_date`, `triggered_procurement_ids`
- ✅ Extended status enum with MRN-specific statuses
- ✅ Created migration file

### **2. API Endpoints**
- ✅ `POST /api/project-material-request/MRN/create` - Manufacturing creates MRN
- ✅ `POST /api/project-material-request/:id/inventory-review` - Inventory reviews stock
- ✅ `POST /api/project-material-request/:id/issue-materials` - Issue materials from stock
- ✅ `POST /api/project-material-request/:id/trigger-procurement` - Auto-trigger procurement

### **3. Features**
- ✅ Unique MRN number generation (`MRN-PROJ2025-001`)
- ✅ Per-item material tracking (required/available/issued/balance)
- ✅ Auto-notifications to Inventory when MRN created
- ✅ Auto-notifications to Manufacturing when stock reviewed
- ✅ Auto-notifications to Procurement when materials unavailable
- ✅ Inventory deduction when materials issued

---

## 🚀 Next Steps

### **Step 1: Run Database Migration**

```powershell
cd d:\Projects\passion-inventory\server
node scripts/runMRNMigration.js
```

**Or manually:**
```powershell
cd d:\Projects\passion-inventory\server
node -e "require('./migrations/20250310000000-enhance-project-material-requests-for-MRN').up(require('./config/database').sequelize.getQueryInterface(), require('sequelize'))"
```

### **Step 2: Restart Your Server**

```powershell
# Stop current server (Ctrl+C)
npm run dev
```

### **Step 3: Test API Endpoints**

Use Postman or curl to test:

**Create MRN (Manufacturing user):**
```bash
POST http://localhost:5000/api/project-material-request/MRN/create
Authorization: Bearer YOUR_MANUFACTURING_USER_TOKEN

{
  "project_name": "Test Project 2025",
  "required_by_date": "2025-04-15",
  "priority": "high",
  "materials_requested": [
    {
      "material_name": "Test Material",
      "material_code": "MAT-001",
      "quantity_required": 100,
      "uom": "PCS",
      "purpose": "Testing"
    }
  ],
  "manufacturing_notes": "Test MRN creation"
}
```

### **Step 4: Build Frontend Pages**

Create these pages:

1. **Manufacturing:**
   - `client/src/pages/manufacturing/CreateMRMPage .jsx`
   - `client/src/pages/manufacturing/MRNListPage.jsx`

2. **Inventory:**
   - `client/src/pages/inventory/MRNReviewPage.jsx`
   - `client/src/pages/inventory/MRNDetailsPage.jsx`

3. **Add routes to App.jsx:**
```jsx
<Route path="/manufacturing/MRN/create" element={<CreateMRMPage  />} />
<Route path="/manufacturing/MRN" element={<MRNListPage />} />
<Route path="/inventory/MRN" element={<MRNReviewPage />} />
<Route path="/inventory/MRN/:id" element={<MRNDetailsPage />} />
```

---

## 📊 Workflow Overview

```
MANUFACTURING                INVENTORY                 PROCUREMENT
     │                           │                          │
     │ Create MRN                │                          │
     ├──────────────────────────>│                          │
     │                           │                          │
     │                           │ Check Stock              │
     │                           │ Available?               │
     │                           ├──────┐                   │
     │                           │      │                   │
     │<──── Stock Available ─────┤      │                   │
     │                           │      │                   │
     │                           │ Issue Materials          │
     │<──── Materials Issued ────┤      │                   │
     │                           │      │                   │
     │                           │      └─── Not Available  │
     │                           │                          │
     │                           ├─── Trigger Procurement ──>│
     │                           │                          │
     │<──── Pending Procurement ─┤<──── PO Created ─────────┤
     │                           │                          │
```

---

## 🧪 Test Scenarios

### **Scenario 1: Full Stock Available**
1. Manufacturing creates MRN for 100 units
2. Inventory checks stock: 100 units available
3. Inventory issues 100 units
4. Status: `issued` → `completed`

### **Scenario 2: Partial Stock**
1. Manufacturing creates MRN for 100 units
2. Inventory checks stock: Only 60 units available
3. Inventory issues 60 units
4. Status: `partially_issued`
5. Inventory triggers procurement for 40 units
6. Status: `pending_procurement`

### **Scenario 3: No Stock**
1. Manufacturing creates MRN for 100 units
2. Inventory checks stock: 0 units available
3. Inventory immediately triggers procurement
4. Status: `pending_procurement`

---

## 📝 Material Tracking Example

**After creation:**
```json
{
  "material_name": "Cotton Fabric",
  "quantity_required": 100,
  "available_qty": 0,
  "issued_qty": 0,
  "balance_qty": 100,
  "status": "pending"
}
```

**After inventory review:**
```json
{
  "material_name": "Cotton Fabric",
  "quantity_required": 100,
  "available_qty": 80,
  "issued_qty": 0,
  "balance_qty": 100,
  "status": "partial"
}
```

**After issuing:**
```json
{
  "material_name": "Cotton Fabric",
  "quantity_required": 100,
  "available_qty": 80,
  "issued_qty": 80,
  "balance_qty": 20,
  "status": "partial",
  "remarks": "20 units pending procurement"
}
```

---

## ⚠️ Important Notes

1. **Backward Compatibility:**  
   Existing Procurement-originated PMRs still work exactly as before. The system now supports BOTH flows.

2. **MRN vs PMR Numbering:**
   - PMR: `PMR-YYYYMMDD-XXXXX` (Procurement)
   - MRN: `MRN-PROJ2025-001` (Manufacturing)

3. **Stock Deduction:**  
   Stock is automatically deducted from inventory when materials are issued via `/issue-materials` endpoint.

4. **Notifications:**  
   Auto-notifications are sent at each stage to relevant departments.

5. **Future Enhancement:**  
   The `/trigger-procurement` endpoint currently just updates status. In the future, it should auto-create Purchase Orders.

---

## 📚 Documentation

See **`MRN_IMPLEMENTATION_GUIDE.md`** for comprehensive documentation including:
- Detailed API reference
- Complete workflow diagrams
- Frontend implementation guide
- Testing examples
- Status flow charts

---

## 🐛 First, Fix Production Requests!

**Remember:** You still need to restart your server to fix the Production Requests error we debugged earlier!

```powershell
# Stop server (Ctrl+C in server terminal)
npm run dev
```

Then refresh your Manufacturing Dashboard to verify Production Requests are loading correctly.

---

**Ready to implement MRN? Run the migration and restart your server!** 🚀