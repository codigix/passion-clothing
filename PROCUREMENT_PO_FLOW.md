# Procurement PO Approval & Send Flow Documentation

## Overview
This document describes the complete workflow for PO approval and sending to vendors via email and WhatsApp from the Procurement Department.

---

## Complete Workflow

### Step 1: PO in Pending Approval
- **Status**: `pending_approval`
- **User**: Admin
- **Action**: Reviews PO request
- **Button Available**: "Approve & Send to Vendor"

### Step 2: Admin Approves PO
- **Trigger**: Admin clicks "Approve & Send to Vendor" button
- **Backend Process**:
  - Backend endpoint: `PUT /api/procurement/pos/:id/status` (or via approve endpoint)
  - Status changes from `pending_approval` → `approved`
  - Sets: `approved_by`, `approved_date`, `approval_notes`
  - Notifications sent to:
    - Procurement Department: "PO Approved - Ready to Send to Vendor"
    - Inventory Department: Status update

### Step 3: Send PO Modal Opens (Automatically)
- **Timing**: 500ms after approval (gives user feedback of approval)
- **Modal Content**:
  - Header: "PROCUREMENT DEPARTMENT"
  - Title: "Send PO to Vendor"
  - Vendor details
  - Recipient info (Email & Phone)
  
- **Options Available**:
  1. **Send via Email** ✉️
     - Sends to: `order.vendor.email`
     - Status: Email sending logged (integration ready for nodemailer)
  
  2. **Send via WhatsApp** 💬
     - Sends to: `order.vendor.phone`
     - Status: WhatsApp sending logged (integration ready for Twilio)

- **PO Details Preview**:
  - PO Number
  - Total Amount (₹)
  - Number of Items
  - Expected Delivery Date
  - Status note: "Status will be updated to 'Sent' after sending"

### Step 4: Procurement Sends PO to Vendor
- **User**: Procurement Department Staff
- **Action**: Selects communication method(s) and clicks "Send Now"
- **Validation**: At least one method must be selected
- **Backend Process**:
  - Endpoint: `POST /api/procurement/pos/:id/send-to-vendor`
  - Parameters: `sendEmail` (boolean), `sendWhatsapp` (boolean)
  - Status changes from `approved` → `sent`
  - Sets: `sent_at` timestamp
  - Sends notifications to:
    - Procurement Department: "PO Sent to Vendor: [PO Number]"
    - Includes: Amount, Vendor Name, Delivery Channel

### Step 5: Status Updates
- **After Sending**:
  - Current Status Badge: "Sent to Vendor" (Blue)
  - Progress Timeline: Shows "Sent" stage completed
  - Available Next Actions: "Mark as Acknowledged" (when vendor confirms)

---

## Status Progression Flow

```
draft
  ↓
send for approval (Procurement)
  ↓
pending_approval
  ↓
Approve & Send to Vendor (Admin) → Status: approved
  ↓
[Send via Email/WhatsApp Modal] (Procurement)
  ↓
[Send Now Button]
  ↓
sent (after successful send)
  ↓
acknowledged (vendor confirms)
  ↓
received (goods received)
  ↓
completed
```

---

## Key Features Implemented

### 1. **One-Click Approval & Send Flow**
- Admin approves → Automatically opens send modal
- Procurement can immediately send without extra steps
- Smooth UX with 500ms delay for feedback

### 2. **Communication Channel Selection**
- Email and WhatsApp options available
- Procurement team can choose one or both
- Vendor receives notification via preferred channel

### 3. **Status Management**
- Clear status transitions visible in timeline
- Status badge shows current stage
- Audit trail of approval and sending

### 4. **Notifications**
- **To Procurement**: Approval confirmation and send confirmation
- **To Inventory**: Prepare for material receipt
- **To Vendor**: PO details (via email/WhatsApp - integration ready)

### 5. **PO Details Display**
- Enhanced modal showing PO summary
- 2-column grid layout for key information
- Clear visual indication of what will be sent

---

## Database/API Endpoints

### Approve PO
```
PUT /api/procurement/pos/:id/status
Body: { status: "approved" }
Response: Updated PO with new status
```

### Send to Vendor
```
POST /api/procurement/pos/:id/send-to-vendor
Body: {
  sendEmail: boolean,
  sendWhatsapp: boolean
}
Response: {
  success: true,
  message: "PO sent via Email & WhatsApp",
  sentVia: ["Email", "WhatsApp"],
  purchaseOrder: { id, po_number, status: "sent", sent_at }
}
```

---

## Future Integration Points

### Email Integration
- **Current**: Logging to console
- **TODO**: Integrate Nodemailer for actual email sending
- **Template**: PO details with items, amount, delivery date
- **Recipients**: Vendor email from database

### WhatsApp Integration
- **Current**: Logging to console
- **TODO**: Integrate Twilio for WhatsApp messaging
- **Template**: PO number, amount, items count, delivery date
- **Recipients**: Vendor phone number from database

---

## Validation & Error Handling

1. **PO Status Validation**
   - Can only approve PO in "pending_approval" status
   - Can only send approved POs ("approved" status)

2. **Vendor Contact Validation**
   - Email sending only if vendor has email
   - WhatsApp sending only if vendor has phone

3. **User Permissions**
   - Only Admin can approve POs
   - Procurement team can send to vendors

4. **Modal Validations**
   - At least one communication method must be selected
   - Send button disabled if no methods selected

---

## UI/UX Improvements

1. **Button Labels**
   - Clear action: "Approve & Send to Vendor"
   - Tooltip: "Approving will open the send to vendor dialog"

2. **Modal Header**
   - Department badge: "PROCUREMENT DEPARTMENT"
   - Clear title and purpose

3. **PO Details Grid**
   - 2-column layout on desktop
   - Quick overview of key information
   - Green confirmation: "Status will be updated to 'Sent' after sending"

4. **Status Transitions**
   - Visual feedback in timeline
   - Color-coded status badges
   - Clear next actions available

---

## Testing Checklist

- [ ] Admin can approve PO in pending_approval status
- [ ] Modal opens automatically after approval
- [ ] Procurement can select email and/or Whatsapp
- [ ] Send button disabled if no method selected
- [ ] Status changes to "sent" after sending
- [ ] Notifications sent to all departments
- [ ] PO details displayed correctly in modal
- [ ] Timeline updates to show "Sent" stage
- [ ] Error handling for missing contact info
- [ ] Only approved POs can be sent
