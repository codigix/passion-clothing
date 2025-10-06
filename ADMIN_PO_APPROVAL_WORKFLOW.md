# Admin Dashboard - Purchase Order Approval Workflow

## 📋 Overview

The Admin Dashboard now includes a **Pending Approvals** section where admins can review and approve Purchase Orders submitted by the Procurement team. Once approved, the system automatically:
1. Sends the PO to the vendor
2. Notifies the Procurement team to track delivery
3. Notifies the Inventory team to prepare for GRN (Goods Receipt Note) creation

---

## 🎯 Key Features

### 1. **Pending Approvals Tab**
- **Location**: Admin Dashboard → First Tab
- **Badge**: Shows count of pending POs
- **Stats Cards**:
  - Pending Orders count
  - Total Value of pending orders
  - Urgent Priority count

### 2. **Purchase Order Display**
Each pending PO card shows:
- PO Number
- Priority Badge (Urgent/High/Medium/Low)
- Vendor Name
- Customer/Client Name
- Expected Delivery Date
- Number of Items
- Project Name (if applicable)
- Total Amount

### 3. **Action Buttons**
- **View Details** - Navigate to full PO details page
- **Approve Order** - Approve and auto-send to vendor
- **Reject** - Reject with reason

---

## 🔄 Approval Workflow

### **Step 1: Procurement Creates PO**
```
Procurement Team → Create PO → Status: "pending_approval"
```
- All new POs automatically go to `pending_approval` status
- PO appears in Admin Dashboard "Pending Approvals" tab
- PO count badge updates on the tab

### **Step 2: Admin Reviews PO**
```
Admin Dashboard → Pending Approvals Tab → Review PO Details
```
Admin can:
- View PO summary (vendor, customer, items, amount)
- Click "View Details" to see full PO information
- Check priority (urgent orders highlighted in red)
- Review project name, expected delivery date

### **Step 3: Admin Approves PO**
```
Admin → Click "Approve Order" → Confirm → System Auto-Sends to Vendor
```

**Backend Actions** (Automatic):
1. ✅ Update PO status: `pending_approval` → `sent`
2. ✅ Set `approval_status` = "approved"
3. ✅ Record `approved_by` and `approved_date`
4. ✅ Set `sent_to_vendor_at` timestamp

**Notifications Sent** (Automatic):
1. 📨 **To Procurement Department**:
   - Title: "✅ PO {po_number} Approved & Sent to Vendor"
   - Message: Track delivery and create GRN when materials arrive
   - Action URL: Direct link to PO details page
   - Priority: High (if PO priority is urgent/high)

2. 📨 **To Inventory Department**:
   - Title: "📦 Prepare for Material Receipt - PO {po_number}"
   - Message: Expected delivery date and preparation notice
   - Action URL: Direct link to PO details page

### **Step 4: Procurement Receives Notification**
```
Procurement Dashboard → Notifications → "PO Approved & Sent to Vendor"
```
Procurement team can now:
- Track vendor delivery status
- Update PO when materials arrive
- Create GRN (Goods Receipt Note) for quality verification

### **Step 5: Materials Arrive → Create GRN**
```
Procurement → PO Actions → "Create GRN" → Quality Verification → Add to Inventory
```

---

## 🎨 UI Components

### **Stats Card - Pending Approvals** (Dashboard Top)
```
┌──────────────────────────────────┐
│  Pending Approvals               │
│                                  │
│  📋  {count}                     │
│  ₹{total_value}                  │
└──────────────────────────────────┘
```

### **Pending Approvals Tab Content**
```
┌─────────────────────────────────────────────────────────┐
│  Purchase Orders - Pending Approval                     │
│  Review and approve purchase orders from Procurement    │
│                                          [View All POs]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ Pending: 5  │  │ Value: ₹50L │  │ Urgent: 2   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ PO-2025-001  [URGENT] [PENDING APPROVAL]        │  │
│  │                                                  │  │
│  │ 🏢 ABC Fabrics Ltd    👤 XYZ Customer           │  │
│  │ 📅 Expected: 15 Jan   📦 5 items                │  │
│  │ Project: Summer Collection                      │  │
│  │                               Total: ₹5,00,000  │  │
│  │                                                  │  │
│  │ [View Details] [Approve Order] [Reject]         │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### **GET /procurement/pos?status=pending_approval**
**Purpose**: Fetch pending POs for approval  
**Access**: Admin, Procurement  
**Response**:
```json
{
  "purchaseOrders": [
    {
      "id": 123,
      "po_number": "PO-2025-001",
      "status": "pending_approval",
      "priority": "urgent",
      "vendor": { "name": "ABC Fabrics Ltd" },
      "customer": { "name": "XYZ Customer" },
      "project_name": "Summer Collection",
      "expected_delivery_date": "2025-01-15",
      "items": [...],
      "final_amount": 500000
    }
  ]
}
```

### **POST /procurement/pos/:id/approve**
**Purpose**: Approve PO and auto-send to vendor  
**Access**: Admin, Procurement  
**Request Body**:
```json
{
  "notes": "Approved by Admin on 10 Jan 2025"
}
```

**Response**:
```json
{
  "message": "Purchase Order approved and sent to vendor successfully",
  "purchase_order": {...},
  "next_step": "await_delivery_then_create_grn",
  "workflow_info": "PO has been sent to vendor..."
}
```

**Backend Actions**:
1. ✅ Update PO status to `sent`
2. ✅ Set approval details (approved_by, approved_date, approval_notes)
3. ✅ Set sent_to_vendor_at timestamp
4. ✅ Send notification to Procurement department
5. ✅ Send notification to Inventory department

---

## 🔔 Notification System

### **Procurement Notification**
```json
{
  "type": "po_approved_sent_to_vendor",
  "title": "✅ PO PO-2025-001 Approved & Sent to Vendor",
  "message": "Purchase Order PO-2025-001 has been approved by admin and automatically sent to vendor ABC Fabrics Ltd. Track delivery and create GRN when materials arrive.",
  "priority": "high",
  "action_url": "/procurement/purchase-orders/123",
  "metadata": {
    "po_number": "PO-2025-001",
    "vendor_name": "ABC Fabrics Ltd",
    "customer_name": "XYZ Customer",
    "project_name": "Summer Collection",
    "total_amount": 500000,
    "expected_delivery": "2025-01-15",
    "approved_by": "Admin Name",
    "approved_at": "2025-01-10T10:30:00Z",
    "next_action": "Track delivery and create GRN when materials arrive"
  },
  "expires_at": "2025-01-17" // 7 days from approval
}
```

### **Inventory Notification**
```json
{
  "type": "po_approved_prepare_grn",
  "title": "📦 Prepare for Material Receipt - PO PO-2025-001",
  "message": "PO PO-2025-001 approved and sent to vendor ABC Fabrics Ltd. Expected delivery: 15 Jan 2025. Prepare for GRN creation.",
  "priority": "high",
  "action_url": "/procurement/purchase-orders/123",
  "metadata": {
    "po_number": "PO-2025-001",
    "vendor_name": "ABC Fabrics Ltd",
    "expected_delivery": "2025-01-15",
    "items_count": 5
  },
  "expires_at": "2025-01-17"
}
```

---

## 🎯 User Flow

### **Admin Perspective**
1. Login → Navigate to Admin Dashboard
2. See "Pending Approvals" tab with badge showing count
3. Click "Pending Approvals" tab
4. Review stats: 5 pending, ₹50L total value, 2 urgent
5. Review each PO card
6. Click "View Details" to see full PO (optional)
7. Click "Approve Order" on a PO
8. Confirm approval in dialog
9. System shows success: "✅ PO approved! Vendor notified and Procurement team alerted."
10. PO removed from pending list
11. Badge count decreases

### **Procurement Perspective**
1. Create PO → Status automatically set to "pending_approval"
2. Wait for admin approval
3. Receive notification: "✅ PO PO-2025-001 Approved & Sent to Vendor"
4. Click notification → Navigate to PO details page
5. Track vendor delivery
6. When materials arrive → Click "Create GRN"
7. Perform quality verification via GRN
8. Add verified materials to inventory

---

## 🚀 Status Transitions

```
[Draft]
   ↓ (Submit)
[Pending Approval]  ← Admin sees this in "Pending Approvals" tab
   ↓ (Admin Approves)
[Sent]  ← Automatically sent to vendor
   ↓ (Materials Arrive)
[Create GRN]  ← Quality verification
   ↓ (GRN Verified)
[Add to Inventory]  ← Materials ready for use
   ↓
[Completed]
```

---

## ✅ Testing Checklist

### **Admin Dashboard**
- [ ] Navigate to Admin Dashboard
- [ ] Verify "Pending Approvals" tab shows with badge (if pending POs exist)
- [ ] Click "Pending Approvals" tab
- [ ] Verify stats cards display correctly (Pending Orders, Total Value, Urgent Priority)
- [ ] Verify PO cards show all information (PO number, vendor, customer, etc.)
- [ ] Click "View Details" → Verify navigation to PO details page
- [ ] Click "Approve Order" → Verify confirmation dialog
- [ ] Confirm approval → Verify success toast message
- [ ] Verify PO removed from pending list
- [ ] Verify badge count decreases

### **Approval Functionality**
- [ ] Create a test PO in Procurement → Verify status is "pending_approval"
- [ ] Verify PO appears in Admin Dashboard "Pending Approvals"
- [ ] Approve the PO from Admin Dashboard
- [ ] Verify PO status changed to "sent"
- [ ] Verify `approved_by`, `approved_date`, and `sent_to_vendor_at` are set

### **Notifications**
- [ ] After approval, check Procurement Dashboard → Notifications
- [ ] Verify notification: "✅ PO {number} Approved & Sent to Vendor"
- [ ] Click notification → Verify navigation to PO details
- [ ] Check Inventory Dashboard → Notifications (if accessible)
- [ ] Verify notification: "📦 Prepare for Material Receipt - PO {number}"

### **Reject Functionality**
- [ ] Click "Reject" on a pending PO
- [ ] Enter rejection reason in prompt
- [ ] Verify PO status changed to "rejected"
- [ ] Verify PO removed from pending approvals list

---

## 📊 Key Metrics

### **Pending Approvals Dashboard**
- **Total Pending**: Count of all POs with status `pending_approval`
- **Total Value**: Sum of `final_amount` for all pending POs
- **Urgent Count**: Count of POs with priority `urgent` or `high`

### **Success Indicators**
- ✅ Badge count matches actual pending POs
- ✅ Stats update in real-time after approval/rejection
- ✅ Notifications delivered to correct departments
- ✅ PO status transitions correctly
- ✅ Timestamps recorded (approved_date, sent_to_vendor_at)

---

## 🔒 Access Control

### **Who Can Approve POs?**
- **Admin** - Full access to approve/reject
- **Superadmin** - Full access

### **Who Can View Pending Approvals?**
- **Admin** - Can view in Admin Dashboard
- **Procurement** - Can view in dedicated Pending Approvals page (`/procurement/pending-approvals`)

### **Who Can Create POs?**
- **Procurement** - Can create POs (status: pending_approval)
- **Admin** - Can create POs (status: pending_approval)

---

## 🎨 Visual Enhancements

### **Priority Badge Colors**
- **Urgent**: Red background, red border
- **High**: Orange background, orange border
- **Medium**: Yellow background, yellow border
- **Low**: Green background, green border

### **Status Badge**
- **Pending Approval**: Yellow background with "PENDING APPROVAL" text

### **Action Button Colors**
- **View Details**: Gray background (neutral)
- **Approve Order**: Green background (success action)
- **Reject**: Red background (destructive action)

---

## 📝 Future Enhancements

1. **Bulk Approval**: Allow admins to approve multiple POs at once
2. **Approval Comments**: Add comment field during approval (beyond just notes)
3. **Approval History**: Show who approved/rejected with timestamps
4. **Email Notifications**: Send email to procurement when PO is approved
5. **Mobile Push Notifications**: Real-time mobile alerts
6. **Approval Delegation**: Allow admins to delegate approval authority
7. **Conditional Approval Rules**: Auto-approve POs below certain threshold
8. **Approval Workflow**: Multi-stage approval (Manager → Director → CFO)

---

## 🛠️ Troubleshooting

### **Issue: Pending Approvals not showing**
**Solution**: 
- Check if there are any POs with status `pending_approval`
- Verify admin user has correct permissions
- Check browser console for API errors

### **Issue: Approve button not working**
**Solution**:
- Check if backend `/procurement/pos/:id/approve` endpoint is accessible
- Verify user has `admin` role
- Check network tab for API response errors

### **Issue: Notifications not received**
**Solution**:
- Verify NotificationService is working
- Check if user's department is set correctly in database
- Verify notification expiry date is in the future
- Check notifications table in database

### **Issue: Badge count incorrect**
**Solution**:
- Refresh Admin Dashboard page
- Check API response from `/procurement/pos?status=pending_approval`
- Verify pending PO count calculation logic

---

## 📄 Files Modified

### **Frontend**
1. **`client/src/pages/dashboards/AdminDashboard.jsx`**
   - Added `pendingPOs` and `pendingPOStats` state
   - Added fetching of pending POs on dashboard load
   - Added "Pending Approvals" stat card
   - Added "Pending Approvals" tab (first tab)
   - Added tab content with stats cards and PO list
   - Added `handleApprovePO()`, `handleRejectPO()`, `handleViewPODetails()` handlers
   - Added helper functions: `getPriorityBadge()`, `formatCurrency()`, `formatDate()`
   - Updated all other tab indices (shifted by 1)

### **Backend**
2. **`server/routes/procurement.js`**
   - Enhanced `/procurement/pos/:id/approve` endpoint
   - Replaced direct Notification.create() with NotificationService.sendToDepartment()
   - Added comprehensive metadata to notifications
   - Added notifications to both Procurement and Inventory departments
   - Added priority handling (high priority if PO is urgent/high)
   - Added 7-day expiry for notifications

---

## 🎓 Best Practices

1. **Always review PO details** before approval
2. **Check vendor information** for accuracy
3. **Verify expected delivery dates** are realistic
4. **Prioritize urgent orders** for faster approval
5. **Add approval notes** for record-keeping
6. **Monitor notifications** for approved POs
7. **Track GRN creation** after materials arrive

---

**Last Updated**: January 2025  
**Maintained By**: Zencoder Assistant  
**Version**: 1.0