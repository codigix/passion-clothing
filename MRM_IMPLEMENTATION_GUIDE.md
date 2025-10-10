# Manufacturing Material Request (MRN) System - Implementation Guide

## 📋 Overview

The MRN system enables **Manufacturing** to request materials for production, **Inventory** to review and issue materials, and automatically triggers **Procurement** when materials are unavailable.

---

## 🏗️ Architecture

### **Model: ProjectMaterialRequest (Enhanced)**

- **Supports TWO flows:**
  1. **Procurement-originated** (`requesting_department='procurement'`): Existing flow
  2. **Manufacturing-originated** (`requesting_department='manufacturing'`): New MRN flow

### **Key Fields Added:**
- `requesting_department` - ENUM('manufacturing', 'procurement')
- `required_by_date` - When manufacturing needs the materials
- `triggered_procurement_ids` - Auto-generated procurement requests
- Enhanced `status` enum with MRN-specific statuses

### **Material Tracking Structure (JSON):**
```json
{
  "material_name": "Cotton Fabric",
  "material_code": "FAB-001",
  "description": "White cotton fabric for shirts",
  "quantity_required": 100,
  "uom": "Meters",
  "purpose": "Production batch #123",
  "available_qty": 80,
  "issued_qty": 80,
  "balance_qty": 20,
  "status": "partial",
  "remarks": "20 meters pending procurement"
}
```

---

## 🔄 MRN Workflow

### **Step 1: Manufacturing Creates MRN**

**Endpoint:** `POST /api/project-material-request/MRN/create`

**Request Body:**
```json
{
  "project_name": "Project Sigma 2025",
  "sales_order_id": 123,
  "required_by_date": "2025-04-15",
  "priority": "high",
  "materials_requested": [
    {
      "material_name": "Cotton Fabric",
      "material_code": "FAB-001",
      "description": "White cotton fabric",
      "quantity_required": 100,
      "uom": "Meters",
      "purpose": "Shirt production",
      "remarks": "Urgent requirement"
    }
  ],
  "manufacturing_notes": "Required for urgent order",
  "attachments": []
}
```

**Response:**
- ✅ MRN created with status: `pending_inventory_review`
- ✅ Unique MRN number generated: `MRN-PROJ2025-001`
- ✅ Notifications sent to all Inventory users

---

### **Step 2: Inventory Reviews & Checks Stock**

**Endpoint:** `POST /api/project-material-request/:id/inventory-review`

**Request Body:**
```json
{
  "materials_reviewed": [
    {
      "material_name": "Cotton Fabric",
      "available_qty": 80,
      "issued_qty": 0,
      "balance_qty": 100,
      "status": "partial",
      "remarks": "80 meters available, 20 meters short"
    }
  ],
  "inventory_notes": "Stock checked, partial availability"
}
```

**Response:**
- ✅ MRN status updated based on availability
- ✅ Manufacturing notified of stock status

**Possible Statuses:**
- `stock_available` - All materials available
- `partial_available` - Some materials available
- `partially_issued` - Some materials already issued

---

### **Step 3: Inventory Issues Materials**

**Endpoint:** `POST /api/project-material-request/:id/issue-materials`

**Request Body:**
```json
{
  "items_to_issue": [
    {
      "material_name": "Cotton Fabric",
      "issue_qty": 80,
      "inventory_ids": [45, 46],
      "remarks": "Issued from warehouse A"
    }
  ],
  "remarks": "Partial issue completed"
}
```

**Response:**
- ✅ Inventory quantities deducted
- ✅ MRN materials updated with issued quantities
- ✅ Status updated to `partially_issued` or `issued`
- ✅ Manufacturing notified

---

### **Step 4: Trigger Procurement (If Needed)**

**Endpoint:** `POST /api/project-material-request/:id/trigger-procurement`

**Request Body:**
```json
{
  "unavailable_materials": [
    {
      "material_name": "Cotton Fabric",
      "shortage_qty": 20,
      "remarks": "Not in stock"
    }
  ],
  "procurement_notes": "Urgent procurement required"
}
```

**Response:**
- ✅ Status updated to `pending_procurement`
- ✅ Procurement department notified
- ✅ (TODO: Auto-create Purchase Orders)

---

## 🗄️ Database Migration

### **Run Migration:**

```powershell
cd d:\Projects\passion-inventory\server
node -e "require('./migrations/20250310000000-enhance-project-material-requests-for-MRN.js').up(require('./config/database').sequelize.getQueryInterface(), require('sequelize'))"
```

### **Or using migration script:**

```powershell
cd d:\Projects\passion-inventory\server
node scripts/runMigration.js 20250310000000-enhance-project-material-requests-for-MRN
```

### **Migration Changes:**
1. ✅ Makes `purchase_order_id` nullable
2. ✅ Adds `requesting_department` field
3. ✅ Adds `required_by_date` field
4. ✅ Adds `triggered_procurement_ids` field
5. ✅ Updates `status` enum with MRN-specific statuses

---

## 📊 Status Flow Chart

```
Manufacturing Creates MRN
         ↓
  [pending_inventory_review]
         ↓
  Inventory Reviews
         ↓
    ┌────────┴────────┐
    ↓                 ↓
[stock_available]  [partial_available]
    ↓                 ↓
Issue Materials   Issue Partial + Trigger Procurement
    ↓                 ↓
  [issued]      [partially_issued] → [pending_procurement]
    ↓                 ↓
[completed]    Wait for Procurement → Issue Remaining → [completed]
```

---

## 🎯 API Endpoints Summary

| Method | Endpoint | Department | Description |
|--------|----------|------------|-------------|
| `POST` | `/api/project-material-request/MRN/create` | Manufacturing | Create MRN |
| `POST` | `/api/project-material-request/:id/inventory-review` | Inventory | Review stock availability |
| `POST` | `/api/project-material-request/:id/issue-materials` | Inventory | Issue materials from stock |
| `POST` | `/api/project-material-request/:id/trigger-procurement` | Inventory | Trigger procurement for unavailable items |
| `GET` | `/api/project-material-request?status=pending_inventory_review` | All | List MRNs by status |
| `GET` | `/api/project-material-request/:id` | All | Get MRN details |

---

## 🧪 Testing Examples

### **1. Create MRN (Manufacturing User)**

```bash
curl -X POST http://localhost:5000/api/project-material-request/MRN/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Project Alpha 2025",
    "required_by_date": "2025-04-15",
    "priority": "high",
    "materials_requested": [
      {
        "material_name": "Cotton Fabric",
        "material_code": "FAB-001",
        "quantity_required": 100,
        "uom": "Meters",
        "purpose": "Production"
      }
    ]
  }'
```

### **2. Review Stock (Inventory User)**

```bash
curl -X POST http://localhost:5000/api/project-material-request/1/inventory-review \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "materials_reviewed": [
      {
        "material_name": "Cotton Fabric",
        "available_qty": 100,
        "issued_qty": 0,
        "status": "available"
      }
    ]
  }'
```

### **3. Issue Materials (Inventory User)**

```bash
curl -X POST http://localhost:5000/api/project-material-request/1/issue-materials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items_to_issue": [
      {
        "material_name": "Cotton Fabric",
        "issue_qty": 100,
        "inventory_ids": [45, 46]
      }
    ]
  }'
```

---

## 🎨 Frontend Implementation (Next Steps)

### **Pages Needed:**

1. **`client/src/pages/manufacturing/CreateMRMPage .jsx`**
   - Form to create MRN
   - Project selection
   - Materials list builder
   - Attachments upload

2. **`client/src/pages/manufacturing/MRNListPage.jsx`**
   - View all MRNs created by manufacturing
   - Filter by status, project, priority
   - Track issued/pending materials

3. **`client/src/pages/inventory/MRNReviewPage.jsx`**
   - List pending MRNs
   - Stock availability checker
   - Issue materials interface
   - Trigger procurement button

4. **`client/src/pages/inventory/MRNDetailsPage.jsx`**
   - Detailed view of MRN
   - Material-wise tracking
   - History/timeline
   - Issue/reject actions

### **Components Needed:**

- `MaterialRequestForm.jsx` - Form component for creating MRNs
- `MaterialTrackingTable.jsx` - Table showing material status
- `StockAvailabilityChecker.jsx` - Real-time stock check component
- `MRNStatusBadge.jsx` - Status indicator component

---

## 📝 Notes

### **Key Differences: PMR vs MRN**

| Feature | PMR (Procurement) | MRN (Manufacturing) |
|---------|-------------------|---------------------|
| **Origin** | Procurement | Manufacturing |
| **Trigger** | Purchase Order | Production need |
| **Number Format** | `PMR-YYYYMMDD-XXXXX` | `MRN-PROJ2025-001` |
| **PO Link** | Required | Optional |
| **Stock Issue** | Not tracked | Per-item tracking |
| **Auto-Procurement** | No | Yes |

### **Future Enhancements:**

- [ ] Auto-create Purchase Orders when procurement triggered
- [ ] Material reservation system
- [ ] Batch/lot tracking for issued materials
- [ ] Mobile app for warehouse floor
- [ ] Barcode scanning integration
- [ ] Material return workflow
- [ ] MRN analytics dashboard

---

## ✅ Implementation Checklist

- [x] Model enhanced with MRN fields
- [x] Migration created
- [x] API endpoints implemented
- [x] Notification system integrated
- [x] Status workflow defined
- [ ] Run database migration
- [ ] Test API endpoints
- [ ] Create frontend pages
- [ ] Update user documentation
- [ ] Train users on new workflow

---

**Last Updated:** March 10, 2025  
**Implemented by:** Zencoder AI Assistant