# Purchase Order Edit Feature - Complete Implementation Guide

## 📋 Overview

This feature allows procurement managers to **edit unapproved Purchase Orders** with full version history tracking and automatic re-approval workflow.

## ✨ Features Implemented

### 1. **Edit Draft Purchase Orders**
- ✅ Procurement managers can edit POs in **draft status only**
- ✅ Add new items to the purchase order
- ✅ Modify quantities and prices of existing items
- ✅ Remove items from the PO
- ✅ Update delivery dates, payment terms, and special instructions

### 2. **Version History Tracking**
- ✅ Every edit is tracked with version numbers
- ✅ Full change history stored with timestamps
- ✅ User information recorded (who made the change)
- ✅ Detailed change records showing before/after values
- ✅ Change reason/notes optional field

### 3. **Automatic Re-approval Workflow**
- ✅ If items are modified in draft status → PO stays in draft
- ✅ If items are modified in pending_approval status → Auto-resets to draft + resets approval
- ✅ Requires new approval submission after modifications
- ✅ Notification sent to procurement team about modifications
- ✅ Version number incremented with each change

### 4. **Database Schema**

**New Fields Added to `purchase_orders` table:**

```sql
ALTER TABLE purchase_orders ADD COLUMN version_number INT DEFAULT 1;
ALTER TABLE purchase_orders ADD COLUMN change_history JSON;
ALTER TABLE purchase_orders ADD COLUMN last_edited_by INT REFERENCES users(id);
ALTER TABLE purchase_orders ADD COLUMN last_edited_at DATETIME;
ALTER TABLE purchase_orders ADD COLUMN requires_reapproval BOOLEAN DEFAULT FALSE;
```

## 🔧 Backend API Endpoints

### 1. **Update Purchase Order**
```
PATCH /api/procurement/pos/:id
Content-Type: application/json

{
  "editMode": true,
  "items": [
    {
      "id": 1,
      "material_name": "Cotton Fabric",
      "description": "Premium quality",
      "quantity": 100,
      "unit_price": 150,
      "total_price": 15000,
      "unit": "meters"
    },
    {
      "material_name": "New Material",
      "quantity": 50,
      "unit_price": 200,
      "total_price": 10000,
      "unit": "kg"
    }
  ],
  "discount_percentage": 5,
  "tax_percentage": 18,
  "payment_terms": "Net 30",
  "special_instructions": "Urgent delivery required",
  "edit_reason": "Customer requested additional materials"
}

Response:
{
  "message": "Purchase order updated successfully",
  "purchaseOrder": { ... },
  "versionHistory": {
    "currentVersion": 2,
    "requiresReapproval": true,
    "lastEditedAt": "2025-01-15T10:30:00Z",
    "changeRecord": {
      "timestamp": "2025-01-15T10:30:00Z",
      "changed_by": 5,
      "changed_by_name": "John Procurement",
      "version_before": 1,
      "version_after": 2,
      "changes": {
        "items": {
          "old_count": 2,
          "new_count": 3,
          "items_added": 1
        },
        "discount_percentage": { "from": 0, "to": 5 },
        "special_instructions": { "from": "...", "to": "..." }
      }
    }
  }
}
```

### 2. **Get Purchase Order Change History**
```
GET /api/procurement/pos/:id/history

Response:
{
  "po_number": "PO-20250115-0001",
  "current_version": 2,
  "created_at": "2025-01-14T09:00:00Z",
  "created_by": { "id": 5, "name": "John Procurement", "employee_id": "EMP001" },
  "last_edited_at": "2025-01-15T10:30:00Z",
  "last_edited_by": { "id": 5, "name": "John Procurement", "employee_id": "EMP001" },
  "change_history": [
    {
      "timestamp": "2025-01-15T10:30:00Z",
      "changed_by": 5,
      "changed_by_name": "John Procurement",
      "version_before": 1,
      "version_after": 2,
      "changes": { ... },
      "reason": "Customer requested additional materials"
    }
  ],
  "total_changes": 1
}
```

## 🎯 Frontend Components

### 1. **Edit Button in PO Details**
- Shows only when PO status is **draft**
- Shows warning badge if PO requires re-approval
- Click opens edit modal

### 2. **Edit Modal**
- Pre-filled with current PO data
- Allow adding new items
- Edit quantities and prices
- Remove items
- Update dates and terms
- Change reason text field (optional)
- Save/Cancel buttons

### 3. **Version History Tab/Modal**
- Shows all previous versions
- Displays change details
- Shows who made changes
- Timestamp of each change
- Change reason

### 4. **Status Indicators**
- **Version Badge**: Shows current version
- **Requires Re-approval Badge**: Red warning if true
- **Last Edited**: Shows who and when

## 📊 Implementation Steps

### Backend Setup:
1. ✅ Run migration: `npm run migrate -- --name add-po-version-history`
2. ✅ Model updated with new fields
3. ✅ Route endpoints created and enhanced
4. ✅ Version history logic implemented
5. ✅ Re-approval workflow implemented

### Frontend Setup:
1. Add edit button to PurchaseOrderDetailsPage
2. Create EditPurchaseOrderModal component
3. Create VersionHistoryModal component
4. Add version/re-approval indicators
5. Integrate with existing UI

## 🔄 Workflow Diagrams

### Edit Workflow:
```
Draft PO
  ↓
Click Edit Button
  ↓
EditPurchaseOrderModal Opens
  ↓
Modify Items/Terms
  ↓
Save Changes
  ↓
Version +1
  ↓
Version History Updated
  ↓
Status Remains Draft
  ↓
Submit for Approval (by manager)
  ↓
Approval Required (manual)
  ↓
Approved → Send to Vendor
```

### Re-approval After Modifications:
```
Pending Approval PO
  ↓
Click Edit Button
  ↓
Modify Items
  ↓
Save Changes
  ↓
Status Auto-Reset to Draft
  ↓
Version +1
  ↓
Approval Status Reset
  ↓
Requires New Approval Submission
```

## 🔐 Permissions

- **Only Procurement Managers** can edit POs
- **Department check**: `['procurement', 'admin']`
- **Edit mode check**: `editMode === true` (prevents accidental edits during status changes)
- **Status check**: Only draft POs can be edited in edit mode

## 📝 Change History Record Structure

```javascript
{
  timestamp: Date,           // When change was made
  changed_by: Number,        // User ID
  changed_by_name: String,   // User name
  version_before: Number,    // Previous version
  version_after: Number,     // New version
  changes: {
    items: {                  // If items changed
      old_count: Number,
      new_count: Number,
      items_added: Number,
      item_details: Array
    },
    discount_percentage: {    // If discount changed
      from: Number,
      to: Number
    },
    // ... other field changes
    approval_reset: {         // If approval was reset
      reason: String
    }
  },
  reason: String            // Why edit was made
}
```

## 🔔 Notifications

**PO Modified Notification (sent to procurement dept):**
- Title: `Purchase Order Modified: PO-20250115-0001`
- Type: `po_modified`
- Priority: `medium`
- Duration: 3 days
- Includes version number and change summary

## ✅ Testing Checklist

- [ ] Create a draft PO
- [ ] Click Edit button
- [ ] Add new item to PO
- [ ] Verify version number increased
- [ ] Check change history shows the item addition
- [ ] Submit for approval
- [ ] Edit PO in pending_approval status
- [ ] Verify status resets to draft
- [ ] Verify approval status resets to not_requested
- [ ] Check notification sent to procurement team
- [ ] Verify version history shows all changes with timestamps
- [ ] Test cannot edit PO in approved/sent/completed status
- [ ] Test discount/tax percentage updates recalculate totals

## 📁 Files Modified/Created

### Backend:
- ✅ `server/migrations/add-po-version-history.js` - Migration file
- ✅ `server/models/PurchaseOrder.js` - Model updated with new fields
- ✅ `server/routes/procurement.js` - Routes enhanced with version tracking

### Frontend (to be created):
- `client/src/components/dialogs/EditPurchaseOrderModal.jsx`
- `client/src/components/dialogs/POVersionHistoryModal.jsx`
- `client/src/pages/procurement/PurchaseOrderDetailsPage.jsx` - Enhanced

## 🚀 Deployment Checklist

1. Run database migration on production
2. Deploy backend changes
3. Deploy frontend changes
4. Test edit workflow end-to-end
5. Monitor notifications
6. Verify version history tracking

## 📞 Support Notes

- Version history is immutable (cannot be deleted)
- Only editable in draft status (as per requirement)
- Re-approval workflow automatic for approved POs
- All changes logged for audit trail
- Supports bulk item additions

---

**Created**: January 2025  
**Status**: Ready for Frontend Implementation  
**Dependencies**: Existing PO workflow, NotificationService