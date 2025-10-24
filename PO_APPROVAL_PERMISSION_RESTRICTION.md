# PO Approval Permission Restriction - Admin Only

## 📋 Overview
**Date**: January 2025  
**Change Type**: Security & Permission Enhancement  
**Impact**: Backend + Frontend  
**Status**: ✅ Complete

## 🎯 Objective
Restrict Purchase Order (PO) approval authority to **Admin department only**. Procurement department can create and submit POs for approval, but cannot approve them.

---

## 🔒 Changes Implemented

### 1. Backend Permission Update
**File**: `server/routes/procurement.js` (Line 1467)

**Before**:
```javascript
router.post('/pos/:id/approve', authenticateToken, checkDepartment(['procurement', 'admin']), ...
```

**After**:
```javascript
// PERMISSION: ADMIN ONLY - Procurement cannot approve POs
router.post('/pos/:id/approve', authenticateToken, checkDepartment(['admin']), ...
```

**Result**: 
- ✅ Only users from 'admin' department can call the approve endpoint
- ❌ Procurement users will receive 403 Forbidden if they attempt to approve
- ✅ Proper authorization enforcement at API level

---

### 2. Frontend UI Updates
**File**: `client/src/pages/procurement/PendingApprovalsPage.jsx`

#### Changes Made:

**A. Added Auth Context Import**
```javascript
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';
```

**B. Added Permission Check**
```javascript
const { user } = useAuth();
const isAdmin = user?.department === 'admin' || user?.role === 'admin';
```

**C. Added Warning Banner for Non-Admin Users**
```javascript
{!isAdmin && (
  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
    <ShieldAlert className="w-5 h-5 text-yellow-600" />
    <p className="text-sm font-medium text-yellow-800">View Only Access</p>
    <p className="text-xs text-yellow-700 mt-1">
      PO approval is restricted to Admin department only. You can view 
      pending approvals but cannot approve or reject them.
    </p>
  </div>
)}
```

**D. Conditional Button Rendering**
```javascript
{isAdmin ? (
  <>
    <button onClick={() => handleApprove(po)} className="...">
      <CheckCircle size={14} />
      Approve Order
    </button>
    <button onClick={() => handleReject(po.id)} className="...">
      <XCircle size={14} />
      Reject
    </button>
  </>
) : (
  <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 bg-gray-50 rounded-md">
    <ShieldAlert size={12} />
    <span>Admin approval required</span>
  </div>
)}
```

---

## 🔐 Permission Flow

### Current Workflow:

1. **Procurement Department**:
   - ✅ Create Purchase Orders
   - ✅ Submit POs for approval (status: `draft` → `pending_approval`)
   - ✅ View pending approvals (read-only)
   - ✅ View PO details
   - ❌ **Cannot approve POs**
   - ❌ **Cannot reject POs**

2. **Admin Department**:
   - ✅ View all pending approvals
   - ✅ **Approve POs** (status: `pending_approval` → `sent`)
   - ✅ **Reject POs** (with reason)
   - ✅ Full control over PO approval workflow

---

## 🎨 UI Behavior

### For Admin Users:
- See "Approve Order" (green) and "Reject" (red) buttons
- Full functionality on Pending Approvals page
- Can approve/reject with notes

### For Procurement Users:
- See warning banner: "View Only Access"
- Approve/Reject buttons replaced with badge: "Admin approval required"
- Can only view details, not approve
- Clear visual indication of restricted access

---

## 🧪 Testing

### Backend Testing:
```bash
# Test as Procurement user (should fail with 403)
POST /api/procurement/pos/123/approve
Headers: { Authorization: "Bearer <procurement_user_token>" }
Expected: 403 Forbidden

# Test as Admin user (should succeed)
POST /api/procurement/pos/123/approve
Headers: { Authorization: "Bearer <admin_user_token>" }
Expected: 200 OK
```

### Frontend Testing:
1. Login as **Procurement user**
2. Navigate to Pending Approvals page
3. Verify warning banner appears
4. Verify approve/reject buttons are hidden
5. Verify "Admin approval required" badge is shown

6. Login as **Admin user**
7. Navigate to Pending Approvals page
8. Verify no warning banner
9. Verify approve/reject buttons are visible
10. Test approval/rejection functionality

---

## 📊 Security Benefits

✅ **Separation of Duties**: Procurement creates, Admin approves  
✅ **Audit Trail**: Clear distinction between creator and approver  
✅ **Fraud Prevention**: No single department can create and approve  
✅ **Compliance**: Better internal controls for financial approval  
✅ **Accountability**: Admin-level authorization required for financial commitments  

---

## 🔄 Related Endpoints

The following procurement endpoints still allow both procurement and admin access:

- ✅ `GET /procurement/pos` - View all POs
- ✅ `POST /procurement/pos` - Create PO
- ✅ `GET /procurement/pos/:id` - View PO details
- ✅ `PATCH /procurement/pos/:id` - Update PO (status transitions)
- ❌ `POST /procurement/pos/:id/approve` - **Admin only** (CHANGED)

---

## 📝 Developer Notes

### Adding More Admin-Only Endpoints:
Use the same pattern:
```javascript
router.post('/some-endpoint', 
  authenticateToken, 
  checkDepartment(['admin']), // Only admin
  async (req, res) => { ... }
);
```

### Frontend Permission Checks:
```javascript
import { useAuth } from '../../contexts/AuthContext';

const { user } = useAuth();
const isAdmin = user?.department === 'admin' || user?.role === 'admin';

// Conditional rendering
{isAdmin && <AdminOnlyButton />}
```

---

## 🚀 Deployment Checklist

- [x] Backend endpoint updated
- [x] Frontend UI updated with permission checks
- [x] Warning banner added for non-admin users
- [x] Button visibility controlled by permission
- [x] Documentation created
- [ ] Test with procurement user account
- [ ] Test with admin user account
- [ ] Verify API returns 403 for non-admin approval attempts
- [ ] Deploy to production

---

## 📞 Support

If procurement users need approval authority:
1. Elevate their account to admin department
2. OR create a new permission role (requires additional development)
3. OR implement multi-level approval workflow (future enhancement)

---

## 📚 Related Documentation

- `ADMIN_PO_APPROVAL_WORKFLOW.md` - Complete PO approval workflow
- `PROCUREMENT_WORKFLOW_ROLE_BASED_ACCESS.md` - Role-based access control
- `PURCHASE_ORDER_APPROVAL_WORKFLOW.md` - Detailed approval process

---

**End of Document**