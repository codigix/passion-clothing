# Credit Note Feature - Quick Test Guide

## Prerequisites

- Backend server running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`
- Database with sample data including GRN with overage

## Step-by-Step Testing

### Step 1: Verify Server is Running

```bash
# Check if backend is running
curl http://localhost:5000/procurement/dashboard/stats

# Should return 200 OK with stats data
```

### Step 2: Access Procurement Dashboard

1. Navigate to `http://localhost:3000/procurement/dashboard`
2. Login with procurement user credentials
3. Scroll to "Pending Requests" section

### Step 3: Find Overage Request

Look for "📦 Material Overage" card in the Pending Requests section
- Shows GRN number
- Vendor name
- Total overage value
- Affected items table

### Step 4: Click "Request Credit Note" Button

- Located in the overage request card
- Opens CreditNoteModal

### Step 5: Review Pre-populated Data

**Modal should display:**
- GRN Number (from overage request)
- Vendor Name
- PO Number
- Total Overage Value
- Items table with pre-filled items from overage

### Step 6: Fill Credit Note Form

1. **Credit Note Type** - Select from dropdown:
   - Partial Credit (default)
   - Full Return
   - Adjustment

2. **Settlement Method** - Select from dropdown:
   - Cash Credit
   - Return Material
   - Adjust Invoice
   - Future Deduction

3. **Tax Percentage** - Enter tax % (e.g., 18):
   - Verify totals update automatically

4. **Items** - Optional adjustments:
   - Edit quantities
   - Edit unit prices
   - Remove items with X button
   - Totals recalculate

5. **Remarks** - Add optional notes:
   - Internal notes about the credit

### Step 7: Create Credit Note

1. Click **"Create Credit Note"** button
2. Wait for success notification
3. Modal closes automatically
4. Dashboard refreshes

### Step 8: Verify Credit Note Created

Check in browser console for API response:
```
POST /api/credit-notes/
Response: {
  id: <credit_note_id>,
  credit_note_number: "CN-YYYYMMDD-XXXX",
  status: "draft",
  total_amount: <calculated>,
  ...
}
```

### Step 9: Navigate to Credit Notes Page

1. Go to `http://localhost:3000/procurement/credit-notes`
2. Should see newly created credit note in the list
3. Status should be "DRAFT"
4. Amount should match modal calculation

### Step 10: Test Credit Note Detail View

1. Click **"View"** button on the credit note
2. Should display:
   - Credit note number and status
   - GRN and vendor info
   - Financial summary (subtotal, tax, total)
   - Items table
   - Status timeline
   - Action buttons

### Step 11: Test Status Transitions

**From Draft Status:**

1. Click **"Issue to Vendor"** button
   - Status changes to "ISSUED"
   - Timeline updates

2. Go back, view again
   - Now shows **"Accept"** and **"Reject"** buttons

**From Issued Status:**

3. Click **"Accept"** button
   - Status changes to "ACCEPTED"
   - Timeline updates with new entry

4. Click **"Settle"** button
   - Opens settlement modal
   - Select settlement method
   - Add settlement notes
   - Confirm settlement
   - Status changes to "SETTLED"

### Step 12: Test Search and Filter

1. On Credit Notes page
2. **Search:**
   - Type credit note number → filters results
   - Type vendor name → filters results
   - Type GRN number → filters results

3. **Filter by Status:**
   - Select "Draft" → shows only draft notes
   - Select "Issued" → shows only issued notes
   - Select "Settled" → shows only settled notes

### Step 13: Test Pagination

1. If multiple credit notes exist
2. Use pagination buttons at bottom
3. Navigate through pages
4. Display count should update

## Expected Behaviors

### Successful Credit Note Creation
- ✅ Modal opens without errors
- ✅ Items pre-populated from GRN
- ✅ Totals calculate correctly
- ✅ Success notification shows
- ✅ Modal closes
- ✅ Credit note appears in list

### Status Transitions
- ✅ Each transition updates status
- ✅ Timeline records each change
- ✅ Correct buttons appear for each status
- ✅ Modal prompts for required info

### Data Validation
- ✅ Cannot create without settlement method
- ✅ Cannot create with 0 items
- ✅ Tax calculation accurate
- ✅ Totals always correct

## Troubleshooting

### Issue: Modal doesn't open
**Check:**
- Overage request exists in pending tab
- "Request Credit Note" button is visible
- Browser console for JavaScript errors

### Issue: Items not pre-populated
**Check:**
- GRN has overage items (received_qty > ordered_qty)
- Overage request metadata includes items_affected
- Check API response in network tab

### Issue: Totals don't update
**Check:**
- Tax percentage is entered as number
- Items have valid quantity and unit_price
- Browser console for calculation errors

### Issue: Credit note not appearing in list
**Check:**
- API response successful (check network tab)
- Page refreshed after creation
- Correct filter status selected

### Issue: Status transition fails
**Check:**
- Required field is filled (e.g., settlement method for settle)
- Credit note in correct status for transition
- API endpoint responding correctly
- Check error message in toast

## Performance Testing

### Test 1: Create Multiple Credit Notes
- Create 5 credit notes in sequence
- Verify all appear in list
- Check list performance

### Test 2: Large Items Table
- Create credit note with 20+ items
- Verify table displays properly
- Check scroll performance

### Test 3: Search Performance
- Search with complex criteria
- Verify search completes quickly
- Check table refiltering speed

## API Response Examples

### Create Credit Note Success
```json
{
  "id": 1,
  "credit_note_number": "CN-20251112-1234",
  "status": "draft",
  "grn_id": 5,
  "purchase_order_id": 10,
  "vendor_id": 2,
  "credit_note_type": "partial_credit",
  "subtotal_amount": 5000,
  "tax_percentage": 18,
  "tax_amount": 900,
  "total_amount": 5900,
  "settlement_method": "cash_credit",
  "items": [...],
  "created_at": "2025-11-12T12:00:00Z"
}
```

### Create Credit Note Error
```json
{
  "message": "Settlement method is required",
  "code": "VALIDATION_ERROR"
}
```

## Success Criteria

✅ All tests pass if:
- Credit notes can be created from overage requests
- Items pre-populate correctly
- Totals calculate with tax
- All status transitions work
- Search and filtering work
- Pagination works
- UI displays properly on all screen sizes
- No console errors
- All API calls succeed

## Log Out & Test as Different User

If available, test with different user roles:
- Procurement user (default)
- Admin user (full permissions)
- Finance user (settlement approval)

Verify each role sees appropriate buttons and can perform allowed actions.

## Report Issues

If any issues found, note:
1. Step that failed
2. Expected behavior
3. Actual behavior
4. Browser console errors
5. Network tab API response
6. Screenshots if helpful
