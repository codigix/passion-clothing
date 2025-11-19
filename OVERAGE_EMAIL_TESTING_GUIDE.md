# Material Overage Email - Testing Guide

## Overview
This guide will help you test the material overage email notification system end-to-end.

---

## Prerequisites

1. **Server Running**
   ```bash
   npm run dev
   ```

2. **.env Configuration**
   Ensure these are set:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   COMPANY_NAME=Passion Clothing Factory
   COMPANY_PHONE=+91-1234567890
   COMPANY_EMAIL=info@passionclothing.com
   ```

3. **Postman or cURL** installed
4. **Authentication Token** from login

---

## Test Scenario: Basic Email Sending

### Step 1: Create Test Data

**Create a Vendor with Email:**
```bash
POST http://localhost:5000/api/vendors
Authorization: Bearer [YOUR_TOKEN]

{
  "name": "Test Vendor",
  "email": "test-vendor@gmail.com",
  "phone": "+919876543210",
  "contact_person": "John Test",
  "address": "123 Test Street"
}
```

**Expected Response:**
```json
{
  "id": "vendor-uuid",
  "name": "Test Vendor",
  "email": "test-vendor@gmail.com"
}
```

**Note:** Copy the `vendor-uuid` for next steps.

---

### Step 2: Create a Purchase Order

```bash
POST http://localhost:5000/api/purchase-orders
Authorization: Bearer [YOUR_TOKEN]

{
  "po_number": "PO-TEST-001",
  "vendor_id": "vendor-uuid",
  "po_date": "2025-11-13",
  "expected_delivery_date": "2025-11-20",
  "items": [
    {
      "item_code": "MAT-001",
      "description": "Fabric A",
      "quantity": 100,
      "uom": "pcs",
      "price": 50.00
    }
  ]
}
```

**Note:** Copy the `po_id` for next steps.

---

### Step 3: Approve and Send PO

**Approve PO (if needed):**
```bash
POST http://localhost:5000/api/approvals/approve
Authorization: Bearer [YOUR_TOKEN]

{
  "approval_id": "approval-uuid",
  "status": "approved"
}
```

---

### Step 4: Create GRN with Overage

**Create GRN:**
```bash
POST http://localhost:5000/api/grn
Authorization: Bearer [YOUR_TOKEN]

{
  "purchase_order_id": "po-uuid",
  "grn_date": "2025-11-13",
  "items": [
    {
      "po_item_id": "po-item-uuid",
      "quantity_received": 120,
      "batch_number": "BATCH-001",
      "expiry_date": "2026-11-13"
    }
  ]
}
```

**Note:** 
- Ordered: 100 pcs (from PO)
- Received: 120 pcs (in GRN)
- Overage: 20 pcs (detected automatically)

**Expected Response:**
```json
{
  "id": "grn-uuid",
  "grn_number": "GRN-20251113-00001",
  "purchase_order_id": "po-uuid",
  "items": [
    {
      "quantity_received": 120,
      "overage_quantity": 20
    }
  ]
}
```

**Note:** Copy the `grn-uuid` for next steps.

---

### Step 5: Send Overage Notification (THE TEST!)

**Trigger Email + WhatsApp:**
```bash
POST http://localhost:5000/api/grn/grn-uuid/send-overage-notification
Authorization: Bearer [YOUR_TOKEN]
Content-Type: application/json
```

**Expected Response (Success):**
```json
{
  "message": "Overage material notification sent successfully",
  "grn": {
    "id": "grn-uuid",
    "grn_number": "GRN-20251113-00001",
    "overage_items_count": 1,
    "total_overage_value": 1000
  },
  "communication": {
    "email": {
      "success": true,
      "messageId": "CAQvVHW8..."
    },
    "whatsapp": {
      "success": false,
      "message": "Twilio credentials not configured."
    }
  }
}
```

---

## Test Scenarios

### Scenario 1: Email Only (No WhatsApp)
**When:** Vendor has email but no phone
**Expected:** Email sent successfully, WhatsApp skipped

**Check:**
- Email arrives in vendor inbox within 2 minutes
- Contains all overage items with quantities
- Total value calculation is correct

---

### Scenario 2: Both Email + WhatsApp
**When:** Vendor has both email and phone

**Prerequisites:**
1. Set Twilio credentials in `.env`
2. Join Twilio sandbox (send "join [code]" to WhatsApp)

**Expected:**
- Email sent successfully
- WhatsApp sent successfully
- Both contain consistent information

**Check:**
- Email has full details
- WhatsApp has summary with link to email
- Timestamps match

---

### Scenario 3: No Contact Info
**When:** Vendor has no email or phone

**Request:**
```bash
POST http://localhost:5000/api/grn/grn-uuid/send-overage-notification
```

**Expected Response (Error 400):**
```json
{
  "message": "Failed to send overage notification",
  "error": "Vendor has no email or phone number configured"
}
```

---

### Scenario 4: No Overage Items
**When:** GRN has no overage (all received = ordered)

**Request:**
```bash
POST http://localhost:5000/api/grn/grn-uuid/send-overage-notification
```

**Expected Response (Error 400):**
```json
{
  "message": "Failed to send overage notification",
  "error": "No overage items found in this GRN"
}
```

---

### Scenario 5: GRN Not Found
**When:** Invalid GRN ID

**Request:**
```bash
POST http://localhost:5000/api/grn/invalid-id/send-overage-notification
```

**Expected Response (Error 404):**
```json
{
  "message": "GRN not found"
}
```

---

## Verification Checklist

### Email Verification

- [ ] Email received in vendor inbox
- [ ] Subject line correct: "📦 Material Overage Alert - GRN [NUMBER] - Action Required"
- [ ] Company header displays correctly
- [ ] Orange alert banner visible
- [ ] GRN Number, PO Number, Dates visible
- [ ] Vendor Information section correct
- [ ] Materials table shows:
  - [ ] Ordered Quantity = 100
  - [ ] Received Quantity = 120
  - [ ] Overage Quantity = 20
  - [ ] Unit Rate = ₹50.00
  - [ ] Total Value = ₹1,000.00
- [ ] Summary statistics visible:
  - [ ] Total Items: 1
  - [ ] Total Qty: 20 units
  - [ ] Total Value: ₹1,000.00
- [ ] Action box present with three options
- [ ] 5-day response deadline mentioned
- [ ] Next Steps section with 4 steps
- [ ] Footer with company contact info
- [ ] Email footer indicates automated notification

### WhatsApp Verification (if configured)

- [ ] Message received on WhatsApp
- [ ] Company name in header
- [ ] Material name and quantities shown
- [ ] Summary statistics visible
- [ ] Call-to-action present
- [ ] Link to email mentioned
- [ ] Contact information included
- [ ] Message within 1000 character limit

### Server Log Verification

Check server console for:
```
✓ Overage material email sent successfully: CAQvVHW...
✓ Overage material WhatsApp sent successfully: SMe1a7...
```

---

## Multiple Items Test

### Create GRN with Multiple Overages

```bash
POST http://localhost:5000/api/grn
Authorization: Bearer [YOUR_TOKEN]

{
  "purchase_order_id": "po-uuid",
  "items": [
    {
      "po_item_id": "po-item-1",
      "quantity_received": 120
    },
    {
      "po_item_id": "po-item-2",
      "quantity_received": 75
    },
    {
      "po_item_id": "po-item-3",
      "quantity_received": 100
    }
  ]
}
```

**Assuming ordered quantities:**
- Item 1: 100 → Received 120 → Overage 20
- Item 2: 50 → Received 75 → Overage 25
- Item 3: 100 → Received 100 → Overage 0 (not included)

**Send Notification:**
```bash
POST http://localhost:5000/api/grn/grn-uuid/send-overage-notification
```

**Email Should Show:**
- [ ] 2 items in overage table (Item 1 and 2)
- [ ] Summary: Total Items: 2, Total Qty: 45
- [ ] Summary: Total Value: (20×rate1) + (25×rate2)

---

## Rate/Value Calculation Test

### Test Case: Verify Calculations

**Setup:**
- Item A: Ordered 100, Received 120, Rate ₹50
  - Expected Overage Value: 20 × 50 = ₹1,000
  
- Item B: Ordered 50, Received 75, Rate ₹200
  - Expected Overage Value: 25 × 200 = ₹5,000

**Total Expected:** ₹6,000

**Verify in Email:**
- [ ] Item A shows ₹1,000.00
- [ ] Item B shows ₹5,000.00
- [ ] Total row shows ₹6,000.00
- [ ] All calculations correct

---

## Error Handling Test

### Test SMTP Error

**Change SMTP password to invalid:**
```env
SMTP_PASS=invalid-password
```

**Send notification:**
```bash
POST http://localhost:5000/api/grn/grn-uuid/send-overage-notification
```

**Expected:**
- [ ] Response shows error in email.error
- [ ] WhatsApp still attempted (if enabled)
- [ ] Server log shows error details
- [ ] No crash

**Revert:**
```env
SMTP_PASS=your-correct-password
```

---

## API Response Validation

### Check Response Structure
```json
{
  "message": "string",
  "grn": {
    "id": "uuid",
    "grn_number": "string",
    "overage_items_count": "number",
    "total_overage_value": "number"
  },
  "communication": {
    "email": {
      "success": "boolean",
      "messageId": "string",
      "error": "string (if failed)"
    },
    "whatsapp": {
      "success": "boolean",
      "messageId": "string",
      "status": "string",
      "to": "string",
      "error": "string (if failed)"
    }
  }
}
```

---

## Performance Test

### Bulk Sending

**Create 10 GRNs with overage items**

**Send notifications to all:**
```bash
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/grn/grn-id-$i/send-overage-notification \
    -H "Authorization: Bearer [TOKEN]"
done
```

**Monitor:**
- [ ] All requests succeed
- [ ] Response times < 5 seconds each
- [ ] All emails arrive within 5 minutes
- [ ] No rate limiting errors

---

## Troubleshooting During Testing

| Issue | Solution |
|-------|----------|
| Email not sent | Check SMTP credentials in .env |
| SMTP timeout | Restart server, check firewall |
| WhatsApp shows "not configured" | Set TWILIO_ACCOUNT_SID and AUTH_TOKEN |
| Email in spam folder | Mark as "not spam", check SPF |
| GRN not found error | Use correct GRN UUID from response |
| Vendor email format invalid | Update vendor with valid email |

---

## Success Indicators

✅ **All tests pass when:**
- Email arrives within 2 minutes
- Email contains correct vendor name
- All materials listed with correct quantities
- All calculations correct
- WhatsApp sends (if configured)
- No server errors in console
- API returns 200 status with success: true
- Vendor can identify action items clearly

---

## Production Readiness Checklist

- [ ] Tested with actual vendor email
- [ ] Tested with actual vendor phone (if using WhatsApp)
- [ ] Verified all overage calculations
- [ ] Email formatting looks professional
- [ ] WhatsApp message concise yet informative
- [ ] Company branding correct
- [ ] Contact information accurate
- [ ] 5-day response deadline mentioned
- [ ] Action items clear
- [ ] Error handling tested
- [ ] SMTP credentials secured
- [ ] Twilio credentials secured (if using)
- [ ] Logging configured correctly

---

## Support & Issues

**If tests fail:**
1. Check server logs for detailed error messages
2. Verify `.env` file has correct credentials
3. Test SMTP separately if needed
4. Review error handling section in OVERAGE_MATERIAL_EMAIL_FLOW.md

**For production:**
- See OVERAGE_MATERIAL_EMAIL_FLOW.md - Production Deployment section
- Consider using SendGrid or AWS SES for email
- Set up Twilio WhatsApp Business account
