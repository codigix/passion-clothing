# Purchase Order Action Buttons Implementation

## 📋 Overview
Enhanced Purchase Order page with comprehensive action buttons similar to Sales Orders, providing quick access to all PO-related operations.

## ✅ Implemented Actions

### 1. **View / Edit** 📝
- **Icon**: Eye icon
- **Availability**: Always visible for all POs
- **Action**: Opens the Purchase Order details page
- **Navigation**: `/procurement/purchase-orders/{id}`

### 2. **Approve PO** ✅
- **Icon**: Check circle icon (green)
- **Availability**: Only for `pending_approval` status
- **Action**: Approves the PO and automatically sends it to vendor
- **API**: `POST /api/procurement/pos/:id/approve`
- **Success Message**: "Purchase order approved and sent to vendor!"
- **Note**: Uses the automated workflow implementation

### 3. **Send to Vendor** 🚚
- **Icon**: Truck icon (blue)
- **Availability**: For `approved` or `draft` status
- **Action**: Sends PO to vendor
- **API**: `PATCH /api/procurement/pos/:id` with status `sent`
- **Success Message**: "Purchase order sent to vendor successfully!"
- **Confirmation**: Asks for user confirmation before sending

### 4. **Create GRN** 📦
- **Icon**: Box icon (indigo)
- **Availability**: For `sent`, `acknowledged`, `received`, `partial_received` status
- **Action**: Navigate to GRN (Goods Receipt Note) creation page
- **Navigation**: `/inventory/grn/create?po_id={order.id}`
- **Purpose**: Initiate the receiving process when materials arrive

### 5. **Generate Invoice** 🧾
- **Icon**: File invoice icon
- **Availability**: Always visible
- **Action**: Generate vendor invoice for the PO
- **API**: `POST /api/procurement/pos/:id/generate-invoice`
- **Success Message**: "Vendor invoice generated successfully!"
- **Confirmation**: Asks for user confirmation before generating

### 6. **View GRN Status** 📊
- **Icon**: Clipboard list icon
- **Availability**: For `sent`, `acknowledged`, `received`, `partial_received`, `completed` status
- **Action**: Navigate to PO details with GRN tab active
- **Navigation**: `/procurement/purchase-orders/{id}?tab=grn`
- **Purpose**: Check status of Goods Receipt Notes for this PO

### 7. **Generate QR Code** 🔲
- **Icon**: QR code icon
- **Availability**: Always visible
- **Action**: Opens modal with QR code for PO tracking
- **QR Data**:
  - PO Number
  - Vendor Name
  - Status
  - Amount
  - Tracking URL
- **Purpose**: Quick scanning for mobile tracking

### 8. **Print PO** 🖨️
- **Icon**: Print icon
- **Availability**: Always visible
- **Action**: Opens browser print dialog
- **Purpose**: Print physical copy of PO for vendor

### 9. **Mark as Received** ✔️
- **Icon**: Check icon (green)
- **Availability**: For `sent`, `acknowledged`, `partial_received` status
- **Action**: Quick action to mark PO as received
- **API**: `PATCH /api/procurement/pos/:id` with status `received`
- **Success Message**: "Purchase order marked as received!"
- **Confirmation**: Asks for user confirmation
- **Note**: This is a quick shortcut; proper workflow should use GRN

### 10. **Delete Order** 🗑️
- **Icon**: Trash icon (red)
- **Availability**: Always visible (separated at bottom)
- **Action**: Delete the purchase order
- **API**: `DELETE /api/procurement/pos/:id`
- **Success Message**: "Purchase order deleted successfully"
- **Confirmation**: Asks for user confirmation before deletion
- **Style**: Red text with red hover background (danger action)

---

## 🎨 UI/UX Features

### Action Menu Design
- **Dropdown Style**: Modern rounded dropdown with shadow
- **Positioning**: Smart positioning that adapts to viewport
- **Icons**: 16px size with appropriate colors
- **Spacing**: Generous padding (py-2.5) for easy clicking
- **Hover Effects**: Smooth background color transitions
- **Color Coding**:
  - Green: Approve, Mark as Received
  - Blue: Send to Vendor
  - Indigo: Create GRN
  - Gray: Standard actions
  - Red: Delete (danger action)

### Sticky Actions Column
- **Position**: Sticky to the right of the table
- **Shadow**: Left shadow for depth perception
- **Background**: Matches row hover state
- **Always Visible**: Scrolls with horizontal table scroll

### Smart Visibility
Actions appear based on PO status:
- Draft → Send to Vendor
- Pending Approval → Approve PO
- Approved → Send to Vendor
- Sent → Create GRN, Mark as Received
- Acknowledged → Create GRN, Mark as Received, View GRN Status
- Received → Create GRN, View GRN Status
- Partial Received → Create GRN, Mark as Received, View GRN Status

---

## 🔄 Workflow Integration

### Automated Approval Workflow
When admin clicks **"Approve PO"**:
1. ✅ PO status changes from `pending_approval` → `sent`
2. 📧 Notifications sent to procurement & inventory teams
3. ⏰ Timestamp `sent_to_vendor_at` recorded
4. 🔄 Table refreshes automatically

### GRN Workflow Integration
When user clicks **"Create GRN"**:
1. 🔀 Redirects to GRN creation page
2. 📝 PO details pre-filled automatically
3. ✅ Quality verification required before inventory addition
4. 📊 Can track GRN status via "View GRN Status"

---

## 📝 API Endpoints Used

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| View/Edit | GET | `/api/procurement/pos/:id` | Get PO details |
| Approve PO | POST | `/api/procurement/pos/:id/approve` | Approve and send to vendor |
| Send to Vendor | PATCH | `/api/procurement/pos/:id` | Update status to `sent` |
| Mark as Received | PATCH | `/api/procurement/pos/:id` | Update status to `received` |
| Generate Invoice | POST | `/api/procurement/pos/:id/generate-invoice` | Create vendor invoice |
| Delete | DELETE | `/api/procurement/pos/:id` | Delete purchase order |

---

## 🎯 Status-Based Actions Matrix

| PO Status | Available Actions |
|-----------|-------------------|
| **draft** | View/Edit, Send to Vendor, Generate Invoice, Generate QR, Print, Delete |
| **pending_approval** | View/Edit, **Approve PO**, Generate Invoice, Generate QR, Print, Delete |
| **approved** | View/Edit, **Send to Vendor**, Generate Invoice, Generate QR, Print, Delete |
| **sent** | View/Edit, **Create GRN**, **Mark as Received**, Generate Invoice, View GRN Status, Generate QR, Print, Delete |
| **acknowledged** | View/Edit, **Create GRN**, **Mark as Received**, Generate Invoice, View GRN Status, Generate QR, Print, Delete |
| **received** | View/Edit, **Create GRN**, Generate Invoice, View GRN Status, Generate QR, Print, Delete |
| **partial_received** | View/Edit, **Create GRN**, **Mark as Received**, Generate Invoice, View GRN Status, Generate QR, Print, Delete |
| **completed** | View/Edit, Generate Invoice, View GRN Status, Generate QR, Print, Delete |
| **cancelled** | View/Edit, Generate QR, Print, Delete |

---

## 🧪 Testing Checklist

### Basic Actions
- [ ] Click "View / Edit" - Opens PO details page
- [ ] Click "Generate QR Code" - Shows QR modal with correct data
- [ ] Click "Print PO" - Opens print dialog
- [ ] Click "Generate Invoice" - Shows confirmation and generates invoice

### Workflow Actions
- [ ] Create PO → Status should be `pending_approval`
- [ ] Click "Approve PO" → Status changes to `sent`, notifications sent
- [ ] Click "Create GRN" → Redirects to GRN creation with PO pre-filled
- [ ] Click "View GRN Status" → Opens PO details with GRN tab
- [ ] Click "Mark as Received" → Status changes to `received`

### UI/UX Tests
- [ ] Dropdown opens on click
- [ ] Dropdown closes when clicking outside
- [ ] Dropdown repositions near viewport edges
- [ ] Actions column stays sticky on horizontal scroll
- [ ] Hover effects work smoothly
- [ ] Icons display correctly with proper colors
- [ ] Confirmations appear for destructive actions

### Status-Based Visibility
- [ ] "Approve PO" only shows for `pending_approval`
- [ ] "Send to Vendor" only shows for `draft` or `approved`
- [ ] "Create GRN" only shows for applicable statuses
- [ ] "Mark as Received" only shows for applicable statuses
- [ ] "View GRN Status" only shows after PO is sent

---

## 📂 Files Modified

### 1. `client/src/pages/procurement/PurchaseOrdersPage.jsx`
**Changes**:
- Added new action handler functions (lines 261-329)
- Enhanced action menu dropdown (lines 845-996)
- Added `FaClipboardList` import (line 22)
- Made actions column sticky with shadow (line 757, 846)

**New Functions**:
- `handleSendToVendor()` - Send PO to vendor
- `handleCreateGRN()` - Navigate to GRN creation
- `handleViewGRNStatus()` - View GRN status
- `handleApprovePO()` - Approve purchase order
- `handleMarkAsReceived()` - Quick mark as received
- `handleGenerateInvoice()` - Generate vendor invoice

---

## 🚀 Benefits

1. **Faster Operations**: All actions accessible from one dropdown
2. **Consistency**: Matches Sales Order action pattern
3. **Smart UI**: Context-aware actions based on PO status
4. **Better UX**: Clear icons, colors, and labels
5. **Workflow Integration**: Seamless connection to GRN workflow
6. **Mobile-Friendly**: QR code generation for mobile tracking
7. **Safety**: Confirmations for critical actions

---

## 🔮 Future Enhancements

### Potential Additions
1. **Duplicate PO** - Clone existing PO for similar orders
2. **Email to Vendor** - Send PO via email directly
3. **Attach Files** - Add supporting documents
4. **Add Comments** - Internal notes/communication
5. **Export to PDF** - Download PO as PDF
6. **Vendor Portal Link** - Share tracking link with vendor
7. **Payment Status** - Track vendor payment status
8. **Receive Partial** - Option for partial deliveries

### API Endpoints to Implement
- `POST /api/procurement/pos/:id/duplicate` - Clone PO
- `POST /api/procurement/pos/:id/email` - Email to vendor
- `POST /api/procurement/pos/:id/attachments` - Add files
- `GET /api/procurement/pos/:id/export-pdf` - Export PDF

---

## 📚 Related Documentation

- **Automated PO Workflow**: See `AUTOMATED_PO_WORKFLOW.md`
- **GRN Workflow**: See `GRN_WORKFLOW_COMPLETE_GUIDE.md`
- **Sales Order Actions**: See `client/src/pages/sales/SalesOrdersPage.jsx` (lines 813-894)
- **Repository Overview**: See `.zencoder/rules/repo.md`

---

## ✅ Implementation Status

**Status**: ✅ **COMPLETE**

All action buttons have been successfully implemented and are ready for testing.

**Date**: January 2025
**Developer**: Zencoder AI Assistant

---

*This implementation provides a comprehensive action menu for Purchase Orders, matching the functionality and user experience of the Sales Orders page while being tailored to the procurement workflow.*