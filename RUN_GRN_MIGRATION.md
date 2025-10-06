# 🚀 Run GRN Migration - Quick Start

## Prerequisites
✅ Database connection configured in `server/.env`  
✅ Sequelize installed in server  
✅ No pending uncommitted database changes

---

## Step 1: Navigate to Server Directory
```powershell
Set-Location "d:\Projects\passion-inventory\server"
```

---

## Step 2: Run the Migration
```powershell
npx sequelize-cli db:migrate
```

**Expected Output:**
```
Sequelize CLI [Node: 18.x.x, CLI: 6.x.x, ORM: 6.x.x]

Loaded configuration file "config/config.js".
Using environment "development".
== 20250301000001-make-grn-fields-optional: migrating =======
== 20250301000001-make-grn-fields-optional: migrated (0.XXXs)
```

---

## Step 3: Verify Migration
```powershell
npx sequelize-cli db:migrate:status
```

You should see:
```
up 20250301000001-make-grn-fields-optional.js
```

---

## Alternative: Manual Migration using Node
If Sequelize CLI doesn't work:

```powershell
node -e "
const { sequelize } = require('./config/database');
const migration = require('./migrations/20250301000001-make-grn-fields-optional');
migration.up(sequelize.getQueryInterface(), require('sequelize'));
"
```

---

## Step 4: Restart Server
```powershell
# Kill existing server if running
npm run dev
```

---

## Step 5: Test the Workflow

### Test 1: Create & Approve PO
1. Navigate to: http://localhost:3000/procurement/purchase-orders/create
2. Fill in PO details
3. Click "Send for Approval"
4. Go to: http://localhost:3000/procurement/pending-approvals
5. Approve the PO

### Test 2: Create GRN
1. Go to: http://localhost:3000/inventory/grn/create?po_id=1
2. Fill in received quantities
3. Submit GRN

### Test 3: Verify GRN
1. Auto-redirected to verification page
2. Review items
3. Click "Verify & Continue"

### Test 4: Add to Inventory
1. Select warehouse location
2. Click "Add to Inventory"
3. Verify inventory created

---

## Troubleshooting

### Error: "Sequelize CLI not found"
```powershell
npm install --save-dev sequelize-cli
```

### Error: "Migration already executed"
No action needed - migration was already run previously.

### Error: "Cannot connect to database"
Check your `server/.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=root
DB_PASSWORD=your_password
```

### Error: "Column already exists"
The migration is idempotent - safe to run even if some changes already exist. Sequelize will skip existing columns.

---

## Rollback (If Needed)
```powershell
npx sequelize-cli db:migrate:undo
```

This will revert the migration.

---

## ✅ Success Checklist

After migration, verify:
- [ ] `GoodsReceiptNotes` table has new columns:
  - `verification_status`
  - `verified_by`
  - `verification_date`
  - `verification_notes`
  - `discrepancy_details`
  - `discrepancy_approved_by`
  - `discrepancy_approval_date`
  - `discrepancy_approval_notes`
  - `inventory_added`
  - `inventory_added_date`
- [ ] `bill_of_materials_id` is nullable
- [ ] `sales_order_id` is nullable
- [ ] Server starts without errors
- [ ] GRN creation works
- [ ] GRN verification works
- [ ] Add to inventory works

---

## Next Steps

After successful migration:
1. Read: `GRN_WORKFLOW_COMPLETE_GUIDE.md`
2. Test complete workflow
3. Train users on new process
4. Monitor first few GRNs closely

---

**Need Help?**
Check the main guide: `GRN_WORKFLOW_COMPLETE_GUIDE.md`