# Material Overage Email Notification System

## Overview

This document describes the complete email notification flow for sending material overage details to vendors. When excess materials are detected in a Goods Receipt Note (GRN), the system automatically sends professional email and WhatsApp notifications to the vendor with all relevant details.

---

## Features

### Email Notification
- **Professional HTML template** with company branding
- **Detailed overage summary** with all item quantities and values
- **Action-oriented message** clearly stating next steps
- **Vendor contact information** section
- **Summary statistics** for quick reference
- **Customizable content** based on company environment variables

### WhatsApp Notification
- **Concise yet detailed message** formatted for WhatsApp
- **Quick reference** for busy vendor contacts
- **Links to full email** for complete details
- **Clear call-to-action** with response deadline
- **Automatic phone number formatting** (supports multiple formats)

---

## System Components

### 1. Email Service Functions (emailService.js)

#### `sendOverageMaterialToVendor(grn, vendor, overageItems, totalOverageValue)`
Sends professional HTML email notification for overage materials.

**Parameters:**
- `grn`: GRN object with `grn_number`, `po_number`, `grn_date`
- `vendor`: Vendor object with `name`, `email`, `contact_person`, `phone`, `address`
- `overageItems`: Array of overage items with `material_name`, `ordered_qty`, `received_qty`, `overage_qty`, `uom`, `rate`
- `totalOverageValue`: Total monetary value of overage

**Returns:**
```javascript
{
  success: true,
  messageId: "email-message-id"
}
```

**Email Template Sections:**
1. Header with company name and title
2. Alert banner (orange background)
3. Overage summary with GRN, PO, and dates
4. Vendor information section
5. Detailed materials table with ordered/received/overage quantities
6. Summary statistics box
7. Action box with required options (return, credit note, retention)
8. Next steps with detailed instructions
9. Footer with company contact details

#### `sendOverageMaterialWhatsApp(grn, vendor, overageItems, totalOverageValue)`
Sends concise WhatsApp message notification.

**Parameters:** Same as email function

**Returns:**
```javascript
{
  success: true,
  messageId: "twilio-message-sid",
  status: "queued|sent|delivered",
  to: "+919876543210"
}
```

---

## API Endpoint

### Send Overage Notification
**Endpoint:** `POST /api/grn/:id/send-overage-notification`

**Authentication:** Required (Procurement or Admin)

**URL Parameters:**
- `id`: GRN ID

**Request Body:** None required

**Response:**
```javascript
{
  "message": "Overage material notification sent successfully",
  "grn": {
    "id": "grn-uuid",
    "grn_number": "GRN-20251113-00001",
    "overage_items_count": 3,
    "total_overage_value": 15000.50
  },
  "communication": {
    "email": {
      "success": true,
      "messageId": "CAQvVHW..."
    },
    "whatsapp": {
      "success": true,
      "messageId": "SMe1a7...",
      "status": "sent",
      "to": "+919876543210"
    }
  }
}
```

**Error Responses:**
- `404` - GRN not found
- `400` - No overage items found, vendor missing contact info
- `500` - Email/WhatsApp sending failed

---

## Usage Workflow

### Step 1: GRN Creation with Overage Detection
1. Create a GRN in the system
2. System detects overage automatically:
   - Received quantity > Ordered quantity
   - Creates complaint with type "overage"
   - Notifications are created in the dashboard

### Step 2: Manual Notification Trigger (from GRN Dashboard)
1. Navigate to GRN Dashboard
2. Find the GRN with overage items
3. Click "Send Overage Notification" button (or use the endpoint directly)
4. System sends email + WhatsApp to vendor

### Step 3: Vendor Response
Vendor receives:
- **Email:** Full details with all material information
- **WhatsApp:** Quick alert to check email
- Clear instructions on resolution options

### Step 4: Follow-up
1. Vendor replies to email with chosen option
2. Procurement team creates credit note if applicable
3. Vendor request can be created if needed

---

## Email Template Details

### Visual Design
- **Header**: Dark navy background (#0f172a) with white text
- **Alert Banner**: Orange background (#ea580c) for attention
- **Content Boxes**: White cards with subtle borders
- **Summary Box**: Light blue background for quick scan
- **Action Box**: Yellow background with left orange border
- **Footer**: Gray text with company info

### Content Sections

#### Overage Summary
```
GRN Number: GRN-20251113-00001
PO Number: PO-20251101-00123
Receipt Date: 13-Nov-2025
Notification Date: 13-Nov-2025
```

#### Materials Table
| # | Material Name | Ordered | Received | Overage | UOM | Rate | Amount |
|---|---|---|---|---|---|---|---|
| 1 | Fabric A | 100 | 120 | 20 | pcs | 50.00 | 1,000.00 |
| 2 | Thread B | 50 | 75 | 25 | roll | 20.00 | 500.00 |
| | **Total Overage Value** | | | | | | **1,500.00** |

#### Summary Statistics
- Total Overage Items: 2
- Total Overage Quantity: 45 units
- Total Overage Value: ₹1,500.00

#### Action Box
```
📌 IMMEDIATE ACTION REQUIRED:

Please review the excess materials received and provide your instructions 
within 5 business days on:

• Return arrangement: How would you like to handle the return?
• Credit note option: Prefer credit adjustment?
• Retention option: Retain materials at listed rate?

Please reply to this email with your preferred resolution method.
```

---

## WhatsApp Message Template

```
*Passion Clothing Factory*
📦 *MATERIAL OVERAGE NOTIFICATION*

Dear [Vendor Name],

We have identified excess materials in your delivery against GRN *[GRN_NUMBER]*.

*OVERAGE ITEMS:*
1. *Material A*
   Ordered: 100, Received: 120
   Overage: 20 pcs @ ₹50/unit

2. *Material B*
   Ordered: 50, Received: 75
   Overage: 25 roll @ ₹20/unit

*OVERAGE SUMMARY:*
📊 Total Items: 2
📦 Total Qty: 45 units
💰 Total Value: ₹1,500.00

⚠️ *ACTION REQUIRED:*
Please advise within 5 business days on:
✓ Return of excess materials
✓ Credit note adjustment
✓ Retention at listed rate

📧 Full details sent via email.

For urgent queries:
📞 [PHONE]
✉️ [EMAIL]

Thank you!
```

---

## Configuration

### Environment Variables Required

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WhatsApp Configuration (Optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Company Information
COMPANY_NAME=Passion Clothing Factory
COMPANY_ADDRESS=123 Factory Street, Industrial Area, City - 123456
COMPANY_PHONE=+91-1234567890
COMPANY_EMAIL=info@passionclothing.com
```

---

## Implementation Details

### Email Service (emailService.js)

```javascript
// Import at top of route file
const { sendOverageMaterialToVendor, sendOverageMaterialWhatsApp } = 
  require("../utils/emailService");

// Usage in endpoint
try {
  const emailRes = await sendOverageMaterialToVendor(
    {
      grn_number: grn.grn_number,
      po_number: po.po_number,
      grn_date: grn.grn_date,
    },
    vendor,
    overageItems, // Array of overage items
    totalOverageValue // Numeric value
  );
  
  console.log('Email sent:', emailRes.messageId);
} catch (error) {
  console.error('Email failed:', error);
}
```

### Data Structure for Items

```javascript
const overageItems = [
  {
    material_name: "Fabric A",
    ordered_qty: 100,
    received_qty: 120,
    overage_qty: 20,
    uom: "pcs",
    rate: 50.00
  },
  {
    material_name: "Thread B",
    ordered_qty: 50,
    received_qty: 75,
    overage_qty: 25,
    uom: "roll",
    rate: 20.00
  }
];
```

---

## Error Handling

### Email Errors
| Error | Cause | Resolution |
|-------|-------|-----------|
| "Vendor email not configured" | No email on vendor record | Update vendor email in system |
| "Connection timeout" | SMTP server unreachable | Check firewall, verify SMTP settings |
| "Invalid login" | Wrong email/password | Verify Gmail app password, not regular password |

### WhatsApp Errors
| Error | Cause | Resolution |
|-------|-------|-----------|
| "Vendor phone not configured" | No phone on vendor record | Update vendor phone number |
| "Invalid phone number format" | Wrong format | Use +919876543210 format |
| "Twilio not configured" | Missing credentials | Set TWILIO_ACCOUNT_SID and AUTH_TOKEN |
| "WhatsApp number not registered" | Sandbox not joined | Send "join [code]" to Twilio WhatsApp |

---

## Testing the System

### 1. Test Email Sending
```bash
# In your Node.js environment
const { sendOverageMaterialToVendor } = require('./utils/emailService');

const testGRN = {
  grn_number: "GRN-TEST-001",
  po_number: "PO-TEST-001",
  grn_date: new Date()
};

const testVendor = {
  name: "Test Vendor",
  email: "vendor@example.com",
  contact_person: "John Doe",
  phone: "+919876543210",
  address: "123 Test St"
};

const testItems = [{
  material_name: "Test Material",
  ordered_qty: 100,
  received_qty: 120,
  overage_qty: 20,
  uom: "pcs",
  rate: 100.00
}];

await sendOverageMaterialToVendor(testGRN, testVendor, testItems, 2000);
```

### 2. Test API Endpoint
```bash
# Using curl
curl -X POST http://localhost:5000/api/grn/[GRN_ID]/send-overage-notification \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json"
```

### 3. Test WhatsApp Sending
Verify Twilio sandbox is joined:
1. Send "join happy-tiger" (or your code) to Twilio WhatsApp number
2. Wait for confirmation
3. Then test WhatsApp message sending

---

## Monitoring & Logging

### Console Logs
- ✅ `✓ Overage material email sent successfully: CAQvVHW...`
- ✅ `✓ Overage material WhatsApp sent successfully: SMe1a7...`
- ⚠️ `⚠️ Twilio not configured. WhatsApp message prepared but not sent.`
- ❌ `❌ Error sending overage material email: [error message]`

### Server Logs Location
All errors and successes are logged to server console with timestamps.

---

## Security Considerations

1. **Vendor Contact Validation**
   - Email format validation before sending
   - Phone number format normalization
   - Both email and phone optional (at least one required)

2. **Sensitive Data Handling**
   - No passwords logged
   - Twilio credentials protected via environment variables
   - Email credentials never exposed

3. **Rate Limiting**
   - No built-in rate limiting (consider adding for production)
   - Twilio sandbox has message limits
   - Gmail has daily send limits

---

## Production Deployment

### For Email (Production)
1. **Use SendGrid** (Recommended)
   - Better deliverability
   - Built-in analytics
   - Higher limits

2. **Configuration:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-key
```

### For WhatsApp (Production)
1. **Apply for Twilio WhatsApp Business**
   - Get dedicated WhatsApp number
   - Remove sandbox restrictions
   - Professional messaging setup

2. **Configuration:**
```env
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890  # Your business number
```

---

## Troubleshooting Guide

### Email Not Sending
1. Check `.env` file has correct SMTP credentials
2. Verify Gmail app password (not regular password)
3. Check firewall allows SMTP port 587
4. Test SMTP connection with telnet/curl
5. Check email doesn't have spaces/typos

### WhatsApp Not Sending
1. Verify Twilio credentials in `.env`
2. Confirm sandbox is joined (send join message)
3. Verify phone format (use +919876543210)
4. Check Twilio account has credits
5. Review Twilio dashboard for message status

### Email Going to Spam
1. Verify SPF/DKIM records for your domain
2. Use professional email service (SendGrid/AWS SES)
3. Ensure "From" address matches configured domain
4. Test with spam checkers

---

## Future Enhancements

1. **Automatic Retry Logic**
   - Retry failed emails after 1 hour
   - Exponential backoff for repeated failures

2. **Email Templates Management**
   - Admin interface to customize templates
   - Multi-language support

3. **Delivery Tracking**
   - Track email open rates
   - Track link clicks
   - Delivery confirmation

4. **Batch Notifications**
   - Send multiple overage notifications in batch
   - Scheduled batch sending at specific times

5. **Vendor Portal Integration**
   - Vendors can respond via portal
   - Track resolution status
   - Auto-create credit notes

---

## Summary

The Material Overage Email Notification System provides:
- ✅ Automated professional notifications
- ✅ Dual-channel communication (email + WhatsApp)
- ✅ Detailed material information
- ✅ Clear action items for vendors
- ✅ Production-ready with error handling
- ✅ Flexible configuration via environment variables

All overage material details (shortage, quantities, values) are clearly presented to enable quick vendor response and smooth resolution.
