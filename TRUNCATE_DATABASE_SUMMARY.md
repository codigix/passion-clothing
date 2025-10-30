# Database Truncation Summary

## 🎯 What You're Doing

You're **permanently deleting all business data** from your Passion ERP database while **preserving user accounts and system configuration**.

This is useful for:
- ✅ Cleaning up test/demo data
- ✅ Resetting database for QA testing
- ✅ Preparing for production cleanup
- ✅ Removing obsolete transaction history
- ✅ Creating a fresh environment for new data

---

## 📊 Data Impact

### Your Current Database Has (~estimated):
- Users: **5-50 accounts** ✅ KEPT
- Sales Orders: **100+ records** ❌ DELETED
- Purchase Orders: **50+ records** ❌ DELETED
- Production Orders: **50+ records** ❌ DELETED
- Inventory Items: **200+ records** ❌ DELETED
- Shipments: **100+ records** ❌ DELETED
- And many more...

### After Truncation:
```
Total tables: 63
Truncated: 57 tables (all data deleted)
Preserved: 6 tables (users, roles, permissions, mappings)
```

---

## 🔄 What Gets Deleted & Preserved

### ❌ PERMANENTLY DELETED (No Recovery Without Backup)

| Category | Tables | Examples |
|----------|--------|----------|
| **Sales** | sales_orders, sales_order_history | All customer orders cleared |
| **Procurement** | purchase_orders, vendors | All PO records cleared |
| **Manufacturing** | production_orders, production_stages, etc. | All production history cleared |
| **Shipping** | shipments, shipment_tracking | All shipment records cleared |
| **Inventory** | inventory, inventory_movements | All stock quantities reset to 0 |
| **Finance** | invoices, payments | All financial records cleared |
| **Quality** | quality_checkpoints, rejections | All QA records cleared |
| **Materials** | bill_of_materials, material_allocations | All material allocations cleared |

**Total: ~40 tables | ~10,000+ records**

### ✅ PRESERVED (100% Intact)

| Category | Tables | What's Kept |
|----------|--------|------------|
| **Users** | users | All user accounts with passwords |
| **Security** | roles, permissions | All role definitions & permissions |
| **Mappings** | user_roles, role_permissions, user_permissions | All user-to-role assignments |

**Total: 6 tables | 100% unchanged**

---

## 💡 Why Preserve Users?

After truncation:
- ✅ Users can still login with same password
- ✅ User roles still work normally
- ✅ Permissions still enforced
- ✅ No need to recreate accounts
- ✅ System is immediately usable

Without user preservation:
- ❌ No one can login
- ❌ Must recreate all accounts
- ❌ Must reassign all roles
- ❌ Must reconfigure permissions

---

## ⚡ Before You Execute

### 🚨 Critical Warnings

1. **THIS CANNOT BE UNDONE** without a backup
   - No undo button after execution
   - Deleted data is gone forever
   - Only recovery: restore from backup

2. **ALL BUSINESS DATA WILL BE LOST**
   - Every sales order deleted
   - Every purchase order deleted
   - Every shipment record deleted
   - All inventory quantities set to 0
   - All financial data deleted

3. **IRREVERSIBLE ACTION**
   - Once executed, data is permanently deleted
   - No transaction logs or audit trail
   - Cannot revert individual records

### ✅ Required Preparation

**BEFORE running truncation:**

1. **Create a backup:**
   ```bash
   mysqldump -h [host] -u admin -p passion_erp > backup.sql
   ```

2. **Notify stakeholders:**
   - Your manager
   - Database admin
   - Team members
   - Anyone using this database

3. **Document the reason:**
   - Why are you doing this?
   - When is it happening?
   - What's the expected downtime?

4. **Verify it's the right database:**
   - Check `.env` database name
   - Confirm host is correct
   - Make sure it's not production!

---

## 🔀 Execution Methods

### Method 1: Interactive Script (SAFEST ⭐ RECOMMENDED)

```bash
node truncate-database.js
```

**Pros:**
- Multiple confirmation prompts
- Can cancel at any time
- Progress feedback
- Error handling
- Recommended for safety

**What it does:**
1. Asks for confirmation (type "TRUNCATE ALL")
2. Double-checks with safety prompt (type "YES I AM SURE")
3. Disables foreign key checks
4. Truncates each table safely
5. Re-enables foreign key checks
6. Shows summary

### Method 2: Raw SQL Script

```bash
mysql -h [host] -u admin -p passion_erp < truncate-all-tables-except-users.sql
```

**Pros:**
- Fast execution
- No interactive prompts
- Good for automation

**Cons:**
- No confirmation prompts
- Executes immediately
- Less safe if not careful

### Method 3: MySQL Workbench GUI

1. Open MySQL Workbench
2. Connect to database
3. File → Open SQL Script → Select `truncate-all-tables-except-users.sql`
4. Click Execute (⚡)

---

## 📈 Expected Results

### Immediate After Truncation

```
Database Status:
├─ Users: 5 accounts ✅
├─ Roles: 3 roles ✅
├─ Permissions: 50+ permissions ✅
├─ Sales Orders: 0 (was 150) ❌
├─ Purchase Orders: 0 (was 75) ❌
├─ Inventory: 0 items (was 200) ❌
├─ Shipments: 0 (was 120) ❌
└─ Vendors: 0 (was 8) ❌
```

### Application State

**What Works:**
- ✅ Users can login
- ✅ Dashboard loads
- ✅ Navigation works
- ✅ Roles & permissions enforced
- ✅ Create new sales orders (but no products/customers)

**What's Broken (Expected):**
- ❌ No sales orders to view
- ❌ No inventory to work with
- ❌ No shipments to track
- ❌ No historical data
- ❌ Dashboards show empty/zero stats

**To Fix:**
```bash
# Option 1: Seed sample data
npm run seed

# Option 2: Import from backup
mysql -h [host] -u admin -p passion_erp < backup.sql

# Option 3: Create data manually
# Use UI to create sales orders, POs, etc.
```

---

## 🛡️ Recovery Procedures

### Scenario 1: You Created a Backup First ✅

```bash
# Restore from backup
mysql -h [host] -u admin -p passion_erp < backup.sql
```

**Time to recover:** 5-30 minutes (depending on backup size)

### Scenario 2: No Backup Created ❌

**Options:**
1. Check AWS RDS automated backups (if using RDS)
   - AWS keeps automated backups for up to 35 days
   - Can be restored through AWS Console
   - Time: 30-60 minutes

2. Contact Database Administrator
   - They may have backup copies
   - Ask them to restore

3. Contact Cloud Provider Support
   - If using managed database
   - They may be able to restore

**Time to recover:** 1-24 hours (depends on provider)

### Scenario 3: Accidental Truncation (No Time!)

**Immediate actions:**
1. Stop all applications using the database
2. Contact database admin immediately
3. Request emergency restore from backup
4. Document what happened
5. Prevent future incidents

---

## 📋 Checklist Before Execution

```
CRITICAL - Complete ALL before proceeding:

☐ Backup Created
  └─ Backup file location: _________________

☐ Stakeholders Notified
  └─ Notified people: _________________
  └─ Date/time of notification: _________________

☐ Database Verified
  └─ Database name: passion_erp ✓
  └─ Host: passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com ✓
  └─ This is NOT production? ✓ YES / NO

☐ Reason Documented
  └─ Reason for truncation: _________________
  └─ Expected impact: _________________
  └─ Expected downtime: _________________

☐ Read All Warnings
  └─ Understand data will be permanently deleted? ✓ YES
  └─ Understand cannot be undone? ✓ YES
  └─ Ready to proceed? ✓ YES

Date & Time: _________________
Performed by: _________________
Approved by: _________________
```

---

## 🎯 After Successful Truncation

### Verify It Worked
```bash
node verify-truncation.js
# Expected: ✅ VERIFICATION PASSED
```

### Test System Still Works
```bash
npm start
# Try to login
# Try to navigate to dashboard
# Check that stats show empty (0 orders, 0 inventory, etc.)
```

### Document Completion
1. Note the date/time
2. Record execution method used
3. Confirm no errors occurred
4. Update team on completion
5. Archive this message

### Next Steps
- **For Development:** Seed test data (`npm run seed`)
- **For QA Testing:** Manually create test scenarios
- **For Production:** Carefully plan next data load
- **For Demo:** Import fresh customer data

---

## 📊 Files Provided

| File | Purpose |
|------|---------|
| **truncate-database.js** | Safe interactive truncation script |
| **verify-truncation.js** | Verify truncation was successful |
| **truncate-all-tables-except-users.sql** | Raw SQL for manual execution |
| **TRUNCATE_DATABASE_GUIDE.md** | Complete detailed guide |
| **TRUNCATE_DATABASE_QUICK_START.md** | 3-step quick reference |
| **TRUNCATE_DATABASE_SUMMARY.md** | This file - overview |

---

## 🚨 Final Warnings

1. **BACKUP FIRST** - You cannot recover without a backup
2. **CONFIRM TWICE** - The script requires double confirmation
3. **NOTIFY TEAM** - Others may be using this database
4. **NO UNDO** - Deleted data is permanently gone
5. **VERIFY AFTER** - Run verification script to confirm success

---

## ❓ FAQ

**Q: Can I undo this?**
A: No. Only if you have a backup. Create one before executing.

**Q: Will users be able to login?**
A: Yes! User accounts are preserved completely.

**Q: How long does it take?**
A: 30 seconds to 2 minutes depending on database size.

**Q: Can I truncate specific tables?**
A: Yes, edit the SQL file to remove tables you want to keep.

**Q: Will this affect the application?**
A: Dashboard will show empty, but app will work normally.

**Q: What if I get an error?**
A: See "Troubleshooting" section in the full guide.

---

## 📞 Support

**Need help?**
1. Read full guide: `TRUNCATE_DATABASE_GUIDE.md`
2. Review troubleshooting section
3. Check database connection works
4. Contact Database Administrator
5. Check AWS RDS console if applicable

---

## ✅ Ready?

**If you:**
- ✅ Have a backup
- ✅ Notified your team
- ✅ Understand the consequences
- ✅ Confirmed correct database
- ✅ Read this entire document

**Then you're ready to execute:**
```bash
node truncate-database.js
```

**Good luck!** 🚀

---

**Last Updated:** January 14, 2025
**Status:** ✅ Ready for Use
**Risk Level:** 🔴 CRITICAL - Permanent Data Loss
