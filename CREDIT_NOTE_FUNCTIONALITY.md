# Credit Note Functionality for Overage Material

## Overview

The Credit Note Functionality provides a complete workflow for managing overage materials received during GRN (Goods Receipt Note) verification. When materials are received in excess of the ordered quantity, the system automatically detects the overage and allows generation of credit notes to manage vendor adjustments.

## Key Features

### 1. **Automatic Overage Detection**
- Detects when received quantity exceeds ordered quantity during GRN verification
- Calculates overage quantity and value for each item
- Marks items as discrepancies for review

### 2. **Credit Note Generation**
- Generate credit notes from GRNs with overage items
- Multiple credit note types: `full_return`, `partial_credit`, `adjustment`
- Automatic calculation of credit amounts including tax
- Flexible settlement methods: `cash_credit`, `return_material`, `adjust_invoice`, `future_deduction`

### 3. **Complete Workflow Management**
- Status progression: `draft` → `issued` → `accepted` → `settled`
- Vendor acceptance/rejection workflow
- Settlement tracking with completion dates
- Full audit trail of all actions

### 4. **Financial Integration**
- Tax percentage calculation
- Invoice adjustment linkage
- Vendor-specific credit summaries
- Settlement method tracking

## Database Schema

### credit_notes Table

```sql
CREATE TABLE credit_notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  credit_note_number VARCHAR(50) UNIQUE NOT NULL,
  grn_id INT NOT NULL,
  purchase_order_id INT NOT NULL,
  vendor_id INT NOT NULL,
  credit_note_date DATETIME NOT NULL,
  credit_note_type ENUM('full_return', 'partial_credit', 'adjustment'),
  items JSON NOT NULL,
  subtotal_credit_amount DECIMAL(12,2) NOT NULL,
  tax_percentage DECIMAL(5,2),
  tax_amount DECIMAL(10,2),
  total_credit_amount DECIMAL(12,2) NOT NULL,
  status ENUM('draft', 'issued', 'accepted', 'rejected', 'settled', 'cancelled'),
  settlement_method ENUM('cash_credit', 'return_material', 'adjust_invoice', 'future_deduction'),
  settlement_status ENUM('pending', 'in_progress', 'completed', 'failed'),
  settlement_date DATETIME,
  settlement_notes TEXT,
  vendor_response TEXT,
  vendor_response_date DATETIME,
  created_by INT NOT NULL,
  issued_by INT,
  issued_date DATETIME,
  approved_by INT,
  approved_date DATETIME,
  remarks TEXT,
  attachments JSON,
  pdf_path VARCHAR(500),
  invoice_adjustment_id INT,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (grn_id) REFERENCES goods_receipt_notes(id),
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (invoice_adjustment_id) REFERENCES invoices(id)
);
```

## API Endpoints

### 1. Create Credit Note

**POST** `/api/credit-notes/`

Creates a new credit note for GRN overage items.

```json
{
  "grn_id": 1,
  "credit_note_type": "partial_credit",
  "tax_percentage": 18,
  "settlement_method": "cash_credit",
  "remarks": "Overage materials from GRN"
}
```

**Response:**
```json
{
  "message": "Credit note created successfully",
  "creditNote": {...},
  "creditNoteNumber": "CN-20251112-1234",
  "totalCredit": 5400.00
}
```

### 2. Generate Credit Note from GRN

**POST** `/api/credit-notes/generate-from-grn/:grnId`

Automatically generates a credit note from a GRN with overage items.

```json
{
  "tax_percentage": 18,
  "settlement_method": "adjust_invoice",
  "remarks": "Auto-generated from GRN overage"
}
```

### 3. List Credit Notes

**GET** `/api/credit-notes/?vendor_id=1&status=draft&limit=50&offset=0`

Query Parameters:
- `vendor_id`: Filter by vendor
- `status`: Filter by status (draft, issued, accepted, settled, etc.)
- `settlement_status`: Filter by settlement status
- `po_id`: Filter by purchase order
- `limit`: Records per page (default: 50)
- `offset`: Pagination offset (default: 0)

### 4. Get Credit Note Details

**GET** `/api/credit-notes/:id`

Returns complete credit note details with all related entities.

### 5. Update Credit Note

**PUT** `/api/credit-notes/:id`

Update draft credit notes with new details.

```json
{
  "credit_note_type": "adjustment",
  "tax_percentage": 18,
  "settlement_method": "future_deduction",
  "remarks": "Updated settlement approach"
}
```

**Restrictions:** Can only edit credit notes in `draft` status.

### 6. Issue Credit Note

**POST** `/api/credit-notes/:id/issue`

Transition credit note from draft to issued status.

```json
{}
```

### 7. Accept Credit Note

**POST** `/api/credit-notes/:id/accept`

Vendor accepts the credit note (typically from vendor portal).

```json
{
  "vendor_response": "We accept this credit note"
}
```

### 8. Reject Credit Note

**POST** `/api/credit-notes/:id/reject`

Vendor rejects the credit note.

```json
{
  "vendor_response": "Quantity verification pending, will respond after internal review"
}
```

### 9. Settle Credit Note

**POST** `/api/credit-notes/:id/settle`

Mark credit note as settled after payment/adjustment is processed.

```json
{
  "settlement_method": "adjust_invoice",
  "settlement_notes": "Applied as credit against next invoice INV-001"
}
```

### 10. Cancel Credit Note

**POST** `/api/credit-notes/:id/cancel`

Cancel a credit note if needed.

```json
{
  "remarks": "Cancelled due to vendor dispute resolution"
}
```

### 11. Get Vendor Credit Summary

**GET** `/api/credit-notes/vendor/:vendorId/summary`

Get comprehensive credit note summary for a specific vendor.

**Response:**
```json
{
  "vendor_id": 1,
  "summary": {
    "total_credit_notes": 5,
    "total_credit_amount": 25000.00,
    "by_status": {
      "draft": 1,
      "issued": 2,
      "accepted": 1,
      "settled": 1
    },
    "by_settlement_status": {
      "pending": 3,
      "in_progress": 1,
      "completed": 1
    }
  },
  "creditNotes": [...]
}
```

## Status Workflow

```
draft
  ↓ (issue)
issued
  ├→ (reject) → rejected [TERMINAL]
  ├→ (accept) → accepted
  │              ↓ (settle)
  │              settled [TERMINAL]
  └→ (cancel) → cancelled [TERMINAL]
```

## Settlement Methods

1. **cash_credit**: Vendor provides cash credit/refund
2. **return_material**: Overage materials to be returned to vendor
3. **adjust_invoice**: Credit applied against future invoice
4. **future_deduction**: Amount deducted from next purchase order

## Integration Points

### 1. GRN Verification Flow

When GRN is verified with overage items:
1. System detects overage quantities
2. Creates inventory entry with `quarantine` status
3. Generates complaint notification
4. Credit note can be created from UI

### 2. Inventory Management

Overage items:
- Added to inventory with `quality_status = 'quarantine'`
- Tracked separately from regular stock
- Can be moved to approved stock once credit note is settled

### 3. Invoice Management

Credit notes can be linked to invoices:
- For `adjust_invoice` settlement method
- Automatic credit deduction from invoice amount
- Maintains financial reconciliation

### 4. Vendor Management

Vendor Portal Integration:
- Vendors can view issued credit notes
- Accept or reject credit notes
- Track settlement status
- Access credit note PDFs

## Business Rules

1. **Overage Detection**: Triggered automatically when received_quantity > ordered_quantity
2. **Credit Calculation**: Credit amount = overage_qty × unit_rate + tax
3. **Single GRN**: Only one credit note per GRN (enforced by unique constraint on grn_id)
4. **Status Transitions**: 
   - Draft notes can be edited or cancelled
   - Issued notes can be accepted/rejected or cancelled
   - Accepted notes can be settled or cancelled
   - Settled/rejected notes are terminal states
5. **Settlement Completion**: Date automatically recorded when status changes to settled

## Permissions

- **Create/Edit/Issue**: `admin`, `procurement`, `inventory`
- **Accept/Reject**: Any authenticated user (typically vendor)
- **Settle/Cancel**: `admin`, `procurement`, `finance`
- **View**: `admin`, `procurement`, `inventory`, `finance`

## Setup Instructions

### 1. Run Migration

```bash
cd server
node scripts/runCreditNotesMigration.js
```

Or manually run the migration:
```bash
npm run db:migrate
```

### 2. Verify Installation

```bash
# Check if credit_notes table exists
SELECT TABLE_NAME FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'passion_erp' AND TABLE_NAME = 'credit_notes';
```

### 3. Test Endpoints

```bash
# Create a credit note
curl -X POST http://localhost:5000/api/credit-notes/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "grn_id": 1,
    "credit_note_type": "partial_credit",
    "tax_percentage": 18
  }'

# List credit notes
curl -X GET http://localhost:5000/api/credit-notes/ \
  -H "Authorization: Bearer <token>"
```

## Example Workflow

### Scenario: Fabric Overage from Vendor

1. **GRN Creation & Verification**
   - Ordered: 1000 meters of fabric
   - Received: 1050 meters
   - System detects 50 meters overage
   - GRN verified with discrepancy

2. **Credit Note Generation**
   - Create credit note with 50 meters overage
   - Rate: ₹100/meter
   - Subtotal: ₹5,000
   - Tax (18%): ₹900
   - Total Credit: ₹5,900

3. **Workflow**
   - State: draft → review internally
   - State: issue → send to vendor
   - Vendor accepts credit note
   - State: accepted → ready for settlement
   - Settlement method: `adjust_invoice`
   - Applied credit to next invoice INV-002
   - State: settled ✓

## Reports & Analytics

### Credit Note Analytics

```javascript
// Total credit amount by vendor
SELECT vendor_id, SUM(total_credit_amount) 
FROM credit_notes 
WHERE status = 'settled' 
GROUP BY vendor_id;

// Settlement method breakdown
SELECT settlement_method, COUNT(*), SUM(total_credit_amount)
FROM credit_notes
WHERE settlement_status = 'completed'
GROUP BY settlement_method;

// Pending settlements by vendor
SELECT v.vendor_name, COUNT(cn.id) as pending_count, 
       SUM(cn.total_credit_amount) as total_pending
FROM credit_notes cn
JOIN vendors v ON cn.vendor_id = v.id
WHERE cn.status = 'issued'
GROUP BY v.id;
```

## Troubleshooting

### Issue: "No overage items found in this GRN"

**Cause**: GRN doesn't have any items with positive overage_quantity

**Solution**: 
- Verify GRN has received_quantity > ordered_quantity
- Check item-level quantities in GRN details

### Issue: "Credit note already exists for this GRN"

**Cause**: A credit note has already been created for this GRN

**Solution**:
- View existing credit note: GET `/api/credit-notes/?grn_id=X`
- Use existing credit note instead of creating duplicate

### Issue: Migration fails with foreign key error

**Cause**: Referenced tables don't exist

**Solution**:
- Ensure all referenced migrations have run first
- Check GoodsReceiptNote, PurchaseOrder, Vendor, User, Invoice tables exist

## Best Practices

1. **Generate Credit Notes Promptly**
   - Create credit notes as soon as overage is confirmed
   - Helps maintain vendor relationships

2. **Choose Appropriate Settlement Method**
   - `adjust_invoice`: Most common for regular overage
   - `return_material`: If vendor wants materials back
   - `future_deduction`: For long-term vendor relationships

3. **Maintain Audit Trail**
   - Add clear remarks for internal reference
   - Document vendor communications

4. **Monitor Vendor Patterns**
   - Track vendors with frequent overages
   - Use to negotiate better terms

5. **Reconcile Regularly**
   - Match settled credit notes with invoice adjustments
   - Monthly reconciliation recommended

## Future Enhancements

- [ ] Automatic credit note generation on GRN overage
- [ ] PDF generation for credit notes
- [ ] Email notifications to vendors
- [ ] Credit note bulk operations
- [ ] Integration with accounting system
- [ ] Mobile app for vendor acceptance
- [ ] Overage analytics dashboard
- [ ] Automatic settlement rules engine

## Support

For issues or questions regarding credit note functionality:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check database logs for errors
4. Contact development team
