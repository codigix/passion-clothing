# Credit Note Functionality - Quick Start Guide

## Installation

### 1. Apply Database Migration

Run the migration to create the `credit_notes` table:

```bash
cd server
node scripts/runCreditNotesMigration.js
```

**Expected Output:**
```
🔄 Running Credit Notes migration...
✅ Credit Notes table created successfully!
✅ credit_notes table verified in database

📋 Table Columns:
  • id: int(11) (not null)
  • credit_note_number: varchar(50) (not null)
  • grn_id: int(11) (not null)
  • purchase_order_id: int(11) (not null)
  • vendor_id: int(11) (not null)
  ...
```

### 2. Verify Model Integration

Check that the CreditNote model is properly integrated:

```javascript
const db = require('./config/database');
console.log(db.models.CreditNote); // Should output the model
```

### 3. Verify API Routes

The credit notes routes are automatically registered when the server starts:
- Base URL: `http://localhost:5000/api/credit-notes`

## Basic Workflow

### Step 1: Detect Overage During GRN Verification

When GRN is verified with overage items, the system automatically:
1. Detects overage quantities
2. Marks items as discrepancies
3. Stores overage data in GRN items_received

### Step 2: Generate Credit Note

```bash
# Automatically generate from GRN
POST /api/credit-notes/generate-from-grn/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "tax_percentage": 18,
  "settlement_method": "cash_credit"
}
```

### Step 3: Issue Credit Note

```bash
# Move from draft to issued
POST /api/credit-notes/1/issue
Authorization: Bearer <token>
```

### Step 4: Vendor Acceptance

```bash
# Vendor accepts the credit note
POST /api/credit-notes/1/accept
Content-Type: application/json

{
  "vendor_response": "We accept this credit note and will process the adjustment"
}
```

### Step 5: Settlement

```bash
# Process settlement
POST /api/credit-notes/1/settle
Content-Type: application/json
Authorization: Bearer <token>

{
  "settlement_method": "adjust_invoice",
  "settlement_notes": "Applied credit to invoice INV-001"
}
```

## Common Operations

### View All Credit Notes

```bash
GET /api/credit-notes/?limit=50&offset=0
Authorization: Bearer <token>
```

### Filter by Vendor

```bash
GET /api/credit-notes/?vendor_id=5&status=issued
Authorization: Bearer <token>
```

### Get Vendor Credit Summary

```bash
GET /api/credit-notes/vendor/5/summary
Authorization: Bearer <token>
```

### View Credit Note Details

```bash
GET /api/credit-notes/1
Authorization: Bearer <token>
```

### Update Draft Credit Note

```bash
PUT /api/credit-notes/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "tax_percentage": 20,
  "settlement_method": "adjust_invoice",
  "remarks": "Updated tax calculation"
}
```

### Cancel Credit Note

```bash
POST /api/credit-notes/1/cancel
Content-Type: application/json
Authorization: Bearer <token>

{
  "remarks": "Cancelled due to vendor dispute"
}
```

## Features

✅ **Automatic Overage Detection** - Triggered during GRN verification
✅ **Multi-type Credit Notes** - Full return, partial credit, or adjustment
✅ **Flexible Settlement** - Cash credit, return material, invoice adjustment, or future deduction
✅ **Vendor Workflow** - Accept/reject capability for vendor portal
✅ **Tax Calculation** - Automatic tax computation based on percentage
✅ **Complete Audit Trail** - All actions tracked with user and timestamp
✅ **Status Management** - Clear workflow from draft to settled
✅ **Vendor Summaries** - Aggregate credit information by vendor

## API Response Example

### Create Credit Note Response
```json
{
  "message": "Credit note created successfully",
  "creditNote": {
    "id": 1,
    "credit_note_number": "CN-20251112-1234",
    "grn_id": 5,
    "purchase_order_id": 3,
    "vendor_id": 2,
    "credit_note_date": "2025-11-12T12:00:00.000Z",
    "credit_note_type": "partial_credit",
    "items": [
      {
        "material_name": "Cotton Fabric",
        "overage_quantity": 50,
        "rate": 100,
        "unit": "meter",
        "total_value": 5000,
        "uom": "meter"
      }
    ],
    "subtotal_credit_amount": "5000.00",
    "tax_percentage": "18.00",
    "tax_amount": "900.00",
    "total_credit_amount": "5900.00",
    "status": "draft",
    "settlement_method": "cash_credit",
    "settlement_status": "pending",
    "created_by": 1,
    "createdAt": "2025-11-12T12:00:00.000Z"
  },
  "creditNoteNumber": "CN-20251112-1234",
  "totalCredit": 5900.00
}
```

## Database Queries

### Get All Pending Credit Notes

```sql
SELECT cn.*, v.vendor_name, u.username
FROM credit_notes cn
JOIN vendors v ON cn.vendor_id = v.id
JOIN users u ON cn.created_by = u.id
WHERE cn.status = 'issued'
ORDER BY cn.created_at DESC;
```

### Calculate Total Credit by Vendor

```sql
SELECT v.vendor_name, COUNT(*) as count, SUM(cn.total_credit_amount) as total
FROM credit_notes cn
JOIN vendors v ON cn.vendor_id = v.id
WHERE cn.settlement_status = 'completed'
GROUP BY cn.vendor_id
ORDER BY total DESC;
```

### Track Settlement Methods

```sql
SELECT settlement_method, COUNT(*) as count, SUM(total_credit_amount) as total
FROM credit_notes
WHERE status = 'settled'
GROUP BY settlement_method;
```

## Permissions Required

| Operation | Permission Required |
|-----------|-------------------|
| Create | `admin`, `procurement`, `inventory` |
| Edit (draft only) | `admin`, `procurement` |
| Issue | `admin`, `procurement` |
| Accept | Any authenticated user |
| Reject | Any authenticated user |
| Settle | `admin`, `procurement`, `finance` |
| Cancel | `admin`, `procurement` |
| View | `admin`, `procurement`, `inventory`, `finance` |

## Troubleshooting

### "No overage items found in this GRN"

**Reason**: The GRN doesn't have any items with `overage_quantity > 0`

**Solution**:
- Verify the GRN was verified with discrepancy status
- Check that items have received_quantity > ordered_quantity
- View GRN details to confirm overage detection

### "Credit note already exists for this GRN"

**Reason**: A credit note has already been created for this GRN

**Solution**:
- Use GET to fetch the existing credit note
- Either use the existing one or cancel it first if needed

### Authorization errors (401/403)

**Reason**: User doesn't have required permissions

**Solution**:
- Verify user has correct role assigned
- Check department access for operation
- Use admin account for testing

## Next Steps

1. ✅ Run migration: `node scripts/runCreditNotesMigration.js`
2. ✅ Test API endpoints with Postman or curl
3. ✅ Verify credit notes appear in database
4. ✅ Create sample GRN with overage
5. ✅ Generate credit note from GRN
6. ✅ Test complete workflow

## Support Resources

- **Full Documentation**: See `CREDIT_NOTE_FUNCTIONALITY.md`
- **API Endpoints**: `/api/credit-notes` (with full CRUD operations)
- **Database**: `credit_notes` table with all audit fields
- **Models**: `server/models/CreditNote.js`
- **Routes**: `server/routes/creditNotes.js`

---

**Status**: ✅ Ready for Testing and Deployment
