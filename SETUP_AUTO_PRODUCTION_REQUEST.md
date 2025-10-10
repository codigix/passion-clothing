# Setup Guide: Automatic Production Request Flow

## Quick Setup

### Prerequisites
- Server running on port 5000
- MySQL database connected
- All dependencies installed

### Step 1: Run Database Migration
Open terminal in project root and run:

```powershell
node server/scripts/runAddSalesOrderToProductionRequests.js
```

**Expected Output**:
```
Starting migration: Add Sales Order to Production Requests...
✅ Migration completed successfully!
Production Requests table now supports:
  - sales_order_id (link to Sales Orders)
  - sales_order_number (for reference)
  - sales_notes (notes from Sales department)
  - po_id is now nullable (can be from SO or PO)
```

### Step 2: Restart Server
```powershell
Set-Location "d:\Projects\passion-inventory\server"; npm start
```

### Step 3: Test the Feature

#### As Sales User:
1. Login with Sales department credentials
2. Navigate to Sales > Orders
3. Click "Create New Order"
4. Fill in order details:
   - Select customer
   - Add products
   - Set delivery date
   - Add any special instructions
5. Click "Save" (creates draft order)
6. Click "Send to Procurement" button
7. **Verify Success Message**:
   - Should see: "Sales order sent to procurement and production request created for manufacturing successfully"
   - Should show both order details and production request number

#### As Manufacturing User:
1. Login with Manufacturing department credentials
2. Navigate to Manufacturing > Production Requests
3. **Verify New Request Appears**:
   - Request number format: PRQ-YYYYMMDD-XXXXX
   - Shows "Sales Order: SO-..." in green
   - Has "View SO" button (green)
   - Has "Create MRN" button
4. Click "View SO" to see original Sales Order
5. Click "Create MRN" to start material planning

### Step 4: Verify Notifications

#### Check Procurement Notification:
- Login as Procurement user
- Check notifications (bell icon)
- Should see: "New Sales Order Request: SO-..."

#### Check Manufacturing Notification:
- Login as Manufacturing user
- Check notifications (bell icon)
- Should see: "New Production Request: PRQ-..."

## Troubleshooting

### Migration Failed
**Error**: Table 'production_requests' doesn't exist
**Solution**: Run the production requests migration first:
```powershell
node server/scripts/runMigration.js
```

### No Production Request Created
**Check**:
1. Sales Order has items with valid data
2. Server console for any errors
3. Database connection is active

**Debug**:
```powershell
# Check server logs
Get-Content "d:\Projects\passion-inventory\server.log" -Tail 50
```

### Frontend Not Showing Sales Order Link
**Check**:
1. Clear browser cache
2. Restart client dev server
3. Check browser console for errors

**Restart Client**:
```powershell
Set-Location "d:\Projects\passion-inventory\client"; npm start
```

## Rollback (If Needed)

If you need to rollback the migration:

```javascript
// In server/scripts folder, create rollback script:
const { sequelize } = require('../config/database');
const migration = require('../migrations/20250115000000-add-sales-order-to-production-requests');

async function rollback() {
  await migration.down(sequelize.getQueryInterface(), sequelize.constructor);
  console.log('Rollback completed');
  process.exit(0);
}
rollback();
```

## Files Modified

### Backend
- ✅ `server/models/ProductionRequest.js` - Added sales_order fields
- ✅ `server/routes/sales.js` - Auto-create production request
- ✅ `server/routes/productionRequest.js` - Include sales order data
- ✅ `server/config/database.js` - Added associations
- ✅ `server/migrations/20250115000000-add-sales-order-to-production-requests.js` - New migration

### Frontend
- ✅ `client/src/pages/manufacturing/ManufacturingProductionRequestsPage.jsx` - Show sales orders

### Documentation
- ✅ `SALES_TO_MANUFACTURING_AUTO_FLOW.md` - Complete guide
- ✅ `SETUP_AUTO_PRODUCTION_REQUEST.md` - This file

## Verification Checklist

- [ ] Migration ran successfully
- [ ] Server restarted without errors
- [ ] Can create Sales Order as Sales user
- [ ] "Send to Procurement" creates Production Request
- [ ] Production Request appears in Manufacturing dashboard
- [ ] Sales Order link works (green "View SO" button)
- [ ] Notifications sent to both Procurement and Manufacturing
- [ ] Can differentiate between Sales-originated and PO-originated requests

## Next Steps

After successful setup:
1. Train Sales team on new workflow
2. Train Manufacturing team on MRN creation
3. Monitor production requests for a few days
4. Gather feedback and optimize as needed

## Support

For issues or questions:
- Check server logs: `d:\Projects\passion-inventory\server.log`
- Check error logs: `d:\Projects\passion-inventory\server_error.log`
- Review documentation: `SALES_TO_MANUFACTURING_AUTO_FLOW.md`

---

**Setup Time**: ~5 minutes  
**Difficulty**: Easy  
**Impact**: High - Automates critical workflow