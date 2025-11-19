# 🧪 PO PDF System - Complete Testing Guide

## Prerequisites

✅ Server is running (database migration complete)  
✅ Browser is logged in with Procurement user  
✅ Finance department users exist in system  
✅ PDFs directory created: `/server/uploads/pdfs/`  

---

## Test 1: Create Purchase Order

### Steps
1. Navigate to **Procurement → Purchase Orders**
2. Click **"Create PO"** button
3. Fill in the form:
   - **Vendor**: Select a vendor
   - **Items**: Add at least one item
   - **Amount**: Should auto-calculate
4. Click **"Create"**

### Expected Results
- ✅ PO created successfully
- ✅ Redirected to Procurement dashboard
- ✅ New PO appears in "Recent Purchase Orders" section
- ✅ Status shows: **Draft**

---

## Test 2: Generate PDFs

### Steps
1. In Procurement dashboard, find your newly created PO
2. Click the **eye icon** (View) or find the **Actions** button
3. Click **"Generate Documents"**

### Expected Results
- ✅ Modal opens: "Generate PO and Invoice PDFs"
- ✅ Show loading indicator
- ✅ After completion, see: ✓ **PDFs Generated Successfully**
- ✅ Two download buttons appear:
  - **Download PO PDF**
  - **Download Invoice PDF**

### File System Verification
Open PowerShell and check:
```powershell
Get-ChildItem "d:\projects\passion-clothing\server\uploads\pdfs\"
```

Should see 2 files:
```
PO-20250106-0001.pdf       (PO document)
INV-20250106-0001.pdf      (Invoice document)
```

### Database Verification
```sql
SELECT 
  po_number,
  pdf_generation_status,
  po_pdf_path,
  invoice_pdf_path,
  po_pdf_generated_at
FROM purchase_orders
WHERE po_number = 'PO-20250106-0001'
LIMIT 1;
```

Expected values:
- `pdf_generation_status` = `'completed'` ✓
- `po_pdf_path` = `/uploads/pdfs/PO-20250106-0001.pdf`
- `invoice_pdf_path` = `/uploads/pdfs/INV-20250106-0001.pdf`
- `po_pdf_generated_at` = Not NULL

---

## Test 3: Send to Finance Department

### Steps
1. In the same PO modal, click **"Send to Finance"** button
2. Confirm in the popup: "Send to Finance Department?"
3. Click **"Yes"**

### Expected Results
- ✅ Loading indicator appears
- ✅ Success message: **"✓ Notification sent to X Finance Department user(s)"**
- ✅ Modal shows confirmation section with PDF preview

### Database Verification - Purchase Orders
```sql
SELECT 
  po_number,
  accounting_notification_sent,
  accounting_notification_sent_at,
  accounting_sent_by
FROM purchase_orders
WHERE po_number = 'PO-20250106-0001'
LIMIT 1;
```

Expected values:
- `accounting_notification_sent` = `true` ✓
- `accounting_notification_sent_at` = Current timestamp
- `accounting_sent_by` = Your user ID

### Database Verification - Notifications
```sql
SELECT 
  id,
  type,
  title,
  recipient_department,
  trigger_event,
  created_at,
  read_at
FROM notifications
WHERE related_entity_type = 'purchase_order'
  AND trigger_event = 'po_documents_ready_for_accounting'
ORDER BY created_at DESC
LIMIT 5;
```

Expected results:
- Multiple rows (one per Finance user)
- `recipient_department` = `'finance'`
- `trigger_event` = `'po_documents_ready_for_accounting'`
- `read_at` = NULL (not read yet)

---

## Test 4: Finance User Receives Notification

### Steps (Switch to Finance User)
1. **Log Out** from Procurement account
2. **Log In** with a Finance department user account
3. Navigate to **Notifications** dashboard

### Expected Results
- ✅ See new notification: **"📄 PO Documents Ready for Processing: PO-20250106-0001"**
- ✅ Notification shows **"Just now"** timestamp
- ✅ Badge shows notification count

### Example Notification Content
```
Title: 📄 PO Documents Ready for Processing: PO-20250106-0001

Message: 
PO and Invoice documents are ready for accounting review.

📋 PO Details:
- Vendor: ABC Textiles
- Amount: ₹45,000
- Status: Pending Approval
- Materials: Fabric, Dyes, Accessories

🧾 Invoice Details:
- Total: ₹45,000
- Tax: ₹8,100
- Final Amount: ₹53,100

⏰ Sent by: [Procurement User Name]
```

---

## Test 5: Download PDFs from Notification

### Steps
1. Finance user clicks the notification
2. Modal opens showing PO details
3. Click **"Download PO PDF"**

### Expected Results
- ✅ File downloads successfully
- ✅ PDF opens and shows PO details
- ✅ Contains Vendor name, Items, Amount, Terms
- ✅ Professional formatting

### Steps (Continue)
4. Click **"Download Invoice PDF"**

### Expected Results
- ✅ File downloads successfully
- ✅ PDF opens and shows Invoice details
- ✅ Contains breakdown of amounts, taxes, freight
- ✅ Professional formatting

### Database Verification - Read Status
```sql
SELECT 
  id,
  title,
  read_at,
  read_by
FROM notifications
WHERE id = ?  -- Use notification ID from above
LIMIT 1;
```

When Finance user opens notification:
- `read_at` = Should update to current timestamp

---

## Test 6: Verify Notifications Table

### Check Notification Metadata
```sql
SELECT 
  id,
  type,
  title,
  message,
  recipient_department,
  metadata,
  action_url
FROM notifications
WHERE trigger_event = 'po_documents_ready_for_accounting'
ORDER BY created_at DESC
LIMIT 1;
```

Expected metadata structure:
```json
{
  "po_number": "PO-20250106-0001",
  "po_id": 123,
  "vendor": {
    "name": "ABC Textiles",
    "vendor_code": "V-001"
  },
  "amount": 45000,
  "currency": "INR",
  "pdf_info": {
    "po_pdf": {
      "filename": "PO-20250106-0001.pdf",
      "download_url": "/api/procurement/pos/123/download-pdf"
    },
    "invoice_pdf": {
      "filename": "INV-20250106-0001.pdf",
      "download_url": "/api/procurement/pos/123/download-invoice"
    }
  },
  "financial_breakdown": {
    "subtotal": 45000,
    "tax_amount": 8100,
    "discount": 0,
    "freight": 0,
    "final_amount": 53100
  }
}
```

---

## Test 7: Verify Procurement Confirmation

### Steps
1. Switch back to Procurement user
2. Check Notifications dashboard

### Expected Results
- ✅ See notification: **"✓ PO Documents Transmitted to Finance"**
- ✅ Shows timestamp of transmission
- ✅ Shows count of Finance users notified
- ✅ Provides confidence that notification was sent

---

## Test 8: Access Control Verification

### Test as Admin
1. Create another Purchase Order
2. Generate PDFs and send to Finance
3. Try downloading PO PDF
- ✅ Should **allow** (Admin can access all)

### Test as Finance User
1. View Finance user notifications
2. Click notification
3. Click "Download PO PDF"
- ✅ Should **allow** (Finance has access)

### Test as Sales User (No Access)
1. Log in as Sales user
2. Try direct URL: `/api/procurement/pos/123/download-pdf`
- ✅ Should **reject** with 403 Forbidden error

---

## Test 9: Multiple Finance Users

### Setup
```sql
-- Verify multiple Finance users exist
SELECT id, name, email, department FROM users 
WHERE department = 'finance' AND status = 'active';
```

### Steps
1. Procurement user sends PO to Finance
2. Check notifications for each Finance user

### Expected Results
```sql
SELECT COUNT(*) as notification_count FROM notifications
WHERE trigger_event = 'po_documents_ready_for_accounting'
  AND related_entity_id = [PO_ID];
```

- ✅ Count should equal number of active Finance users
- ✅ Each user receives identical notification
- ✅ Each tracks independent read status

### Example
- Finance User 1: Reads notification at 10:30 AM
- Finance User 2: Still unread at 10:45 AM
- Finance User 3: Reads notification at 11:00 AM

---

## Test 10: Error Handling

### Test Missing PDF File
```sql
UPDATE purchase_orders 
SET po_pdf_path = '/nonexistent/path.pdf'
WHERE po_number = 'PO-20250106-0001';
```

### Steps
1. Finance user tries to download deleted PDF
2. Click "Download PO PDF"

### Expected Results
- ✅ Error message: "File not found"
- ✅ Clear error displayed, not silent failure
- ✅ Suggestion to contact Procurement

---

## Troubleshooting Guide

### Issue: No notifications appear for Finance user

**Check 1: Finance user exists and active**
```sql
SELECT * FROM users WHERE id = [USER_ID];
```
- ✅ `department = 'finance'`
- ✅ `status = 'active'`

**Check 2: Notification was sent**
```sql
SELECT COUNT(*) FROM notifications 
WHERE recipient_department = 'finance' 
  AND trigger_event = 'po_documents_ready_for_accounting';
```
- ✅ Should have records

**Fix: Create/Update Finance user**
```sql
UPDATE users 
SET department = 'finance', status = 'active'
WHERE id = [USER_ID];
```

---

### Issue: PDF download returns 403 Forbidden

**Check 1: User department is correct**
```sql
SELECT department FROM users WHERE id = [USER_ID];
```
- ✅ Should be 'finance', 'procurement', or 'admin'

**Check 2: PO exists and has PDF path**
```sql
SELECT po_number, po_pdf_path FROM purchase_orders 
WHERE id = [PO_ID];
```
- ✅ `po_pdf_path` should not be NULL

**Fix: Update user department**
```sql
UPDATE users SET department = 'finance' WHERE id = [USER_ID];
```

---

### Issue: PDFs not generating

**Check 1: Uploads directory exists**
```powershell
Test-Path "d:\projects\passion-clothing\server\uploads\pdfs"
```
- ✅ Should return True

**Fix: Create directory**
```powershell
New-Item -ItemType Directory -Path "d:\projects\passion-clothing\server\uploads\pdfs" -Force
```

**Check 2: PDF service is working**
- Check server logs for PDF generation errors
- Verify PDF template files exist
- Try generating again

---

### Issue: Notification not showing read status

**Check: Database permissions**
```sql
SELECT * FROM notifications 
WHERE id = [NOTIFICATION_ID];
```

**Fix: Manually update read status**
```sql
UPDATE notifications 
SET read_at = NOW(), read_by = [USER_ID]
WHERE id = [NOTIFICATION_ID];
```

---

## Performance Tests

### Test Large PO
1. Create PO with 100+ line items
2. Generate PDFs
- ✅ Should complete within 10 seconds
- ✅ PDF should contain all items

### Test Multiple Notifications
1. Send 5 different POs to Finance
2. Check notification count
- ✅ All 5 should appear
- ✅ No duplicates
- ✅ Search/filter should work

---

## Success Criteria

### ✅ Complete Success
- [ ] PO created and displays correctly
- [ ] PDFs generate in 2-5 seconds
- [ ] Finance receives notification immediately
- [ ] PDF downloads work for all Finance users
- [ ] Read status tracks correctly
- [ ] Database records are accurate
- [ ] No errors in server logs
- [ ] Access control works (non-Finance users blocked)

### ✅ Minimum Requirements Met
- [ ] At least 3 of the above working
- [ ] No critical errors
- [ ] System doesn't crash

---

## Test Results Template

```markdown
## Test Run: [DATE]

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Create PO | ✅/❌ | |
| 2 | Generate PDFs | ✅/❌ | |
| 3 | Send to Finance | ✅/❌ | |
| 4 | Finance Receives | ✅/❌ | |
| 5 | Download PDF | ✅/❌ | |
| 6 | Verify DB | ✅/❌ | |
| 7 | Confirm Notif | ✅/❌ | |
| 8 | Access Control | ✅/❌ | |
| 9 | Multiple Users | ✅/❌ | |
| 10 | Error Handling | ✅/❌ | |

**Overall Result:** ✅ PASS / ❌ NEEDS WORK

**Issues Found:** 
- [List any issues]

**Next Steps:**
- [List next actions]
```

---

**Ready to Test!** 🚀

Follow these tests in order and note any issues. All tests should pass for production readiness.
