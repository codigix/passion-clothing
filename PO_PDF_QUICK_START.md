# PO PDF & Invoice - Quick Start Guide (15 Minutes)

## 🚀 5-Minute Backend Setup

### 1. Install NPM Packages
```bash
cd server
npm install pdfkit nodemailer
npm install  # in case needed
```

### 2. Configure Email (.env)
```bash
# Open server/.env and add:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ACCOUNTING_DEPT_EMAIL=accounting@passion-clothing.com
```

### 3. Run Database Migration
```bash
npm run migrate --prefix server
```

### 4. Create Directory & Set Permissions
```bash
mkdir -p uploads/pdfs
chmod 755 uploads/pdfs
```

### 5. Update Express (server/index.js)
Add after other middleware:
```javascript
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

✅ **Backend Ready in 5 minutes!**

---

## 🎨 5-Minute Frontend Setup

### 1. Create POPdfActions.jsx
Create file: `client/src/components/procurement/POPdfActions.jsx`
Copy entire content from `FRONTEND_PO_PDF_INTEGRATION.md` → "POPdfActions Component"

### 2. Create SendToAccountingModal.jsx
Create file: `client/src/components/procurement/SendToAccountingModal.jsx`
Copy entire content from `FRONTEND_PO_PDF_INTEGRATION.md` → "SendToAccountingModal Component"

### 3. Update ProcurementDashboard.jsx
Find the PO table actions column and add:
```jsx
import POPdfActions from '../../components/procurement/POPdfActions';

// In the table row's action column:
<div className="flex gap-2">
  {/* existing actions... */}
  <POPdfActions poId={order.id} poNumber={order.po_number} />
</div>
```

### 4. Update CreatePurchaseOrderPage.jsx
Find the success screen and add:
```jsx
import POPdfActions from '../../components/procurement/POPdfActions';

// After "Purchase Order Created Successfully":
<POPdfActions 
  poId={createdOrder.id} 
  poNumber={createdOrder.po_number}
  createdOrder={createdOrder}
/>
```

✅ **Frontend Ready in 5 minutes!**

---

## ✅ 5-Minute Testing

### Test 1: PDF Generation
1. Open app → Procurement → Create PO
2. Fill form and submit
3. Click "Generate Docs" button
4. Status should show "✓ completed"
5. ✅ PDF generation works!

### Test 2: Download PDFs
1. Click "Download PO" button
2. Save `PO_[NUMBER].pdf`
3. Open PDF and verify content
4. ✅ Downloads work!

### Test 3: Send to Accounting
1. Click "Send to Accounting" button
2. Enter email (use your test email)
3. Click "Send PDFs"
4. ✅ Email sent!

---

## 📋 Complete File Checklist

### Files Created (Unchanged Existing Files - Just Reference)
- ✅ `server/migrations/add_pdf_tracking_to_purchase_orders.js` (NEW)
- ✅ `server/utils/pdfGenerationService.js` (NEW)
- ✅ `server/utils/emailService.js` (NEW)
- ✅ `server/routes/poPdfRoutes.js` (NEW - optional, already in procurement.js)

### Files Modified
- ✅ `server/models/PurchaseOrder.js` (9 fields added)
- ✅ `server/routes/procurement.js` (6 endpoints added)
- ✅ `server/index.js` (add static file middleware)
- ✅ `client/src/pages/dashboards/ProcurementDashboard.jsx` (import + use POPdfActions)
- ✅ `client/src/pages/procurement/CreatePurchaseOrderPage.jsx` (import + use POPdfActions)

### Files Created (Frontend Components)
- ✅ `client/src/components/procurement/POPdfActions.jsx` (NEW)
- ✅ `client/src/components/procurement/SendToAccountingModal.jsx` (NEW)

### Configuration Files
- ✅ `server/.env` (update email settings)

---

## 🔄 Complete Workflow

```
1. User Creates PO
   ↓
2. POPdfActions Component Detects New PO
   ↓
3. (Optional) Auto-Generate PDFs
   - Shows generating status
   - Creates PO PDF
   - Creates Invoice PDF
   ↓
4. User Sees Success Screen with PDF Actions
   - Download PO button
   - Download Invoice button
   - Send to Accounting button
   ↓
5. User Clicks "Send to Accounting"
   - Modal opens
   - Enter email address
   - Click Send
   ↓
6. System Sends Email with PDFs to Accounting Department
   - Beautiful HTML email
   - Attached PDFs
   - Notification in system
   ↓
7. Database Records
   - PDF paths
   - Generation timestamps
   - Accounting notification sent
   - User who sent it
```

---

## 🎯 Key API Endpoints

| Action | Endpoint | Method |
|--------|----------|--------|
| Generate | `/api/procurement/pos/:id/generate-pdfs` | POST |
| Send Accounting | `/api/procurement/pos/:id/send-to-accounting` | POST |
| Download PO | `/api/procurement/pos/:id/download-pdf` | GET |
| Download Invoice | `/api/procurement/pos/:id/download-invoice` | GET |
| Check Status | `/api/procurement/pos/:id/pdf-status` | GET |

---

## 🐛 Quick Fixes

### PDFs Not Generating?
```bash
# Check if directory exists
ls -la uploads/pdfs/

# Check if pdfkit installed
npm list pdfkit

# Restart server
npm run dev --prefix server
```

### Emails Not Sending?
```bash
# Check .env has EMAIL_HOST and EMAIL_USER
grep EMAIL server/.env

# Test connection
node -e "require('./server/utils/emailService').testConnection();"
```

### Database Error?
```bash
# Check migration ran
npm run migrate --prefix server

# Verify columns exist
mysql -u root -proot passion_erp -e "DESC purchase_orders;" | grep pdf
```

---

## ✅ Deployment Verification

Run this checklist before going live:

- [ ] `npm install pdfkit nodemailer` completed
- [ ] Environment variables configured in `.env`
- [ ] Database migration ran successfully
- [ ] `/uploads/pdfs` directory created
- [ ] Express static middleware added
- [ ] Both React components created
- [ ] ProcurementDashboard.jsx updated
- [ ] CreatePurchaseOrderPage.jsx updated
- [ ] Tested PDF generation (local)
- [ ] Tested PDF download (local)
- [ ] Tested email sending (local)
- [ ] All components imported correctly
- [ ] No TypeScript/syntax errors
- [ ] Server runs without errors
- [ ] React app compiles without errors
- [ ] **READY TO DEPLOY!** ✅

---

## 📞 Support

### Common Questions

**Q: Do PDFs auto-generate?**
A: Yes, if you pass `createdOrder={createdOrder}` prop to POPdfActions

**Q: Can I customize PDF templates?**
A: Yes, edit `pdfGenerationService.js` methods

**Q: How do I change the accounting email?**
A: Set `ACCOUNTING_DEPT_EMAIL` in `.env` or pass via API

**Q: What if SMTP fails?**
A: In dev mode, emails log to console. In prod, verify SMTP credentials.

**Q: Can I regenerate PDFs?**
A: Yes, click the regenerate button (circular arrow icon)

---

## 🎉 You're Done!

That's it! 15 minutes and you have:
- ✅ Professional PDF generation
- ✅ Beautiful email templates
- ✅ Automatic accounting notifications
- ✅ Download functionality
- ✅ Complete audit trail
- ✅ Production-ready system

**Happy coding!** 🚀

---

**Reference**: See `PO_PDF_INVOICE_COMPLETE_FLOW.md` and `FRONTEND_PO_PDF_INTEGRATION.md` for detailed documentation.