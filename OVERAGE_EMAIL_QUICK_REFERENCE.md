# Material Overage Email - Quick Reference Guide

## What Is It?
Automated email and WhatsApp system to notify vendors when excess materials are detected in their deliveries.

## How to Use?

### Send Overage Notification to Vendor

**From API:**
```bash
POST /api/grn/:id/send-overage-notification
```

**Required:**
- GRN must have overage items detected
- Vendor must have email OR phone number
- User must be Procurement or Admin

**Response:**
```json
{
  "message": "Overage material notification sent successfully",
  "communication": {
    "email": { "success": true, "messageId": "..." },
    "whatsapp": { "success": true, "status": "sent" }
  }
}
```

### From UI (When Implemented)
1. Go to GRN Dashboard
2. Find GRN with overage
3. Click "Send Overage Notification"
4. System sends email + WhatsApp

---

## What Vendor Receives

### Email Includes:
- ✅ GRN Number, PO Number, Dates
- ✅ Full material list (ordered, received, overage qty)
- ✅ Unit rate and total value for each item
- ✅ Total overage value
- ✅ Three resolution options:
  - Return arrangement
  - Credit note adjustment
  - Retain at listed rate
- ✅ 5-day response deadline

### WhatsApp Includes:
- ✅ Quick summary of overage
- ✅ Total items/qty/value
- ✅ Call to check email for details
- ✅ Contact info for queries

---

## Setup Required

### 1. Email Setup (SMTP)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. WhatsApp Setup (Optional)
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 3. Company Info
```env
COMPANY_NAME=Passion Clothing Factory
COMPANY_PHONE=+91-1234567890
COMPANY_EMAIL=info@passionclothing.com
```

---

## Functions Available

### In Code (emailService.js)

```javascript
// Send Email
const result = await sendOverageMaterialToVendor(grn, vendor, overageItems, totalValue);
// Returns: { success: true, messageId: "..." }

// Send WhatsApp
const result = await sendOverageMaterialWhatsApp(grn, vendor, overageItems, totalValue);
// Returns: { success: true, messageId: "...", status: "sent", to: "+919876543210" }
```

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| Email not sent | Vendor has email? SMTP credentials set? |
| WhatsApp not sent | Vendor has phone? Twilio configured? |
| Invalid phone format | Use: +919876543210 or 9876543210 |
| Twilio sandbox error | Send "join [code]" to Twilio WhatsApp |
| SMTP timeout | Firewall allows port 587? |

---

## Email Template Preview

```
HEADER: Company Logo & Name
ALERT: 📦 MATERIAL OVERAGE DETECTED - ACTION REQUIRED

GRN Details:
- GRN Number: GRN-20251113-00001
- PO Number: PO-20251101-00123
- Receipt Date: 13-Nov-2025

Materials Table:
[All materials with ordered/received/overage/rate/value]

Summary Box:
- Total Items: 3
- Total Qty: 45 units
- Total Value: ₹1,500.00

Action Required:
⚠️ Please advise within 5 business days:
✓ Return of excess materials
✓ Credit note adjustment
✓ Retention at listed rate

Next Steps: 4-step resolution process
```

---

## Data Fields Needed

**GRN Object:**
```javascript
{
  grn_number: "GRN-20251113-00001",
  po_number: "PO-20251101-00123",
  grn_date: Date
}
```

**Vendor Object:**
```javascript
{
  name: "Vendor Name",
  email: "vendor@company.com",
  phone: "+919876543210",
  contact_person: "John Doe",
  address: "123 Street"
}
```

**Overage Items:**
```javascript
[
  {
    material_name: "Fabric A",
    ordered_qty: 100,
    received_qty: 120,
    overage_qty: 20,
    uom: "pcs",
    rate: 50.00
  }
]
```

---

## API Response Examples

### Success
```json
{
  "message": "Overage material notification sent successfully",
  "grn": {
    "id": "abc123",
    "grn_number": "GRN-20251113-00001",
    "overage_items_count": 3,
    "total_overage_value": 15000.50
  },
  "communication": {
    "email": {
      "success": true,
      "messageId": "CAQvVHW8a1234..."
    },
    "whatsapp": {
      "success": true,
      "messageId": "SMe1a7c1234...",
      "status": "sent",
      "to": "+919876543210"
    }
  }
}
```

### Error - No Overage Items
```json
{
  "message": "Failed to send overage notification",
  "error": "No overage items found in this GRN"
}
```

### Error - Missing Contact Info
```json
{
  "message": "Failed to send overage notification",
  "error": "Vendor has no email or phone number configured"
}
```

---

## Related Features

- **Shortage Emails**: For shortage items (uses similar system)
- **Credit Notes**: Create credit note for overage value
- **Vendor Requests**: Track vendor responses
- **GRN Status**: Track overage through workflow

---

## Key Statistics Included in Email

- Ordered Quantity (per item)
- Received Quantity (per item)
- Overage Quantity (difference)
- Unit Rate (cost per unit)
- Total Value (overage qty × rate)
- Total Overage Value (sum of all items)
- Number of Overage Items

---

## Timeline

**Email Trigger:** When GRN overage is detected or manually triggered
**Response Deadline:** 5 business days (mentioned in email)
**Follow-up:** Procurement team monitors vendor response
**Resolution:** Credit note, return arrangement, or retention

---

## Production Checklist

- [ ] SMTP credentials configured
- [ ] Company name/contact info set in .env
- [ ] Vendor email addresses verified
- [ ] Vendor phone numbers in +919876543210 format
- [ ] Test email sent to internal email
- [ ] Test WhatsApp to test number
- [ ] Monitor first batch of notifications
- [ ] Vendor responses processed

---

**For full documentation, see: OVERAGE_MATERIAL_EMAIL_FLOW.md**
