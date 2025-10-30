# Database Truncation - Detailed Execution Steps

## 🎯 Choose Your Method

Choose **ONE** of the three methods below based on your preference:

---

## Method 1: Interactive Node.js Script (RECOMMENDED ⭐)

**Best for:** Safety, confirmation prompts, error handling

### Step 1: Open PowerShell
```powershell
# Navigate to project directory
Set-Location "d:\projects\passion-clothing"

# Verify you're in the right location
Get-ChildItem | Select-Object -First 5
```

### Step 2: Create Backup (Optional but Recommended)
```powershell
# Download mysqldump tool if not installed
# Or manually backup using MySQL Workbench

# Command to backup:
mysqldump -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com `
          -u admin -p passion_erp > backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql

# When prompted, enter password: C0digix$309
```

### Step 3: Run Truncation Script
```powershell
node truncate-database.js
```

### Step 4: Monitor the Script

**You will see:**
```
======================================================================
⚠️  DATABASE TRUNCATION CONFIRMATION
======================================================================

📊 Database Configuration:
   Host: passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
   Database: passion_erp
   User: admin

📋 Tables to be TRUNCATED (63):
   sales_orders | purchase_orders | production_orders | ... 

✅ Tables to be PRESERVED (6):
   ✓ users
   ✓ roles
   ✓ permissions
   ✓ user_roles
   ✓ role_permissions
   ✓ user_permissions

======================================================================

Type "TRUNCATE ALL" to confirm: █
```

### Step 5: First Confirmation
**Type exactly:** `TRUNCATE ALL`

Then press **Enter**

### Step 6: Second Confirmation
```
⚠️  This action CANNOT be undone. 
Type "YES I AM SURE" to proceed: █
```

**Type exactly:** `YES I AM SURE`

Then press **Enter**

### Step 7: Watch Progress
```
🚀 Starting truncation...

🔒 Disabling foreign key checks...
   Done!

   ✅ sales_orders                    - TRUNCATED
   ✅ purchase_orders                 - TRUNCATED
   ✅ production_orders               - TRUNCATED
   ... (more tables)

🔓 Re-enabling foreign key checks...
   Done!

📊 TRUNCATION SUMMARY
======================================================================
✅ Successfully truncated: 63 tables
❌ Errors: 0 tables
✓  Preserved: 6 tables (users, roles, permissions, etc.)
======================================================================

🎉 Database truncation complete!
```

### Step 8: Verify Success
```powershell
node verify-truncation.js
```

**Expected output:**
```
🔍 DATABASE TRUNCATION VERIFICATION
✅ VERIFICATION PASSED - All tables correctly truncated!
```

**Done! ✅**

---

## Method 2: Using npm Scripts (Easiest)

**Best for:** Simple execution, project-aware paths

### Step 1: Navigate to Server Directory
```powershell
Set-Location "d:\projects\passion-clothing\server"
```

### Step 2: Create Backup
```powershell
mysqldump -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com `
          -u admin -p passion_erp > backup.sql
```

### Step 3: Run Truncation
```powershell
npm run truncate-db
```

### Step 4: Respond to Prompts
- Type: `TRUNCATE ALL`
- Type: `YES I AM SURE`

### Step 5: Verify
```powershell
npm run truncate-verify
```

**Done! ✅**

---

## Method 3: Direct SQL Execution (Fastest)

**Best for:** Automation, scripts, no user interaction needed

### Option 3A: Command Line MySQL
```powershell
# Connect and execute SQL
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com `
      -u admin `
      -pC0digix$309 `
      passion_erp < truncate-all-tables-except-users.sql
```

**Expected output:**
```
Truncation Complete!
All data has been cleared except:
✓ users
✓ roles
✓ permissions
...
```

### Option 3B: MySQL Workbench GUI

1. **Open MySQL Workbench**
2. **Connect to database:**
   - Host: `passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com`
   - User: `admin`
   - Password: `C0digix$309`
   - Database: `passion_erp`
   - Click **Connect**

3. **Open SQL script:**
   - File → Open SQL Script
   - Select: `truncate-all-tables-except-users.sql`

4. **Execute:**
   - Review the SQL queries (they're safe)
   - Click **Execute** (⚡ icon)

5. **Verify:**
   - Check output panel
   - Should see "Truncation Complete!"

**Done! ✅**

### Option 3C: Copy-Paste into Any SQL Client
Copy the contents of `truncate-all-tables-except-users.sql` and paste into your SQL client's query editor, then execute.

---

## ⏱️ Expected Timeline

| Step | Time | Notes |
|------|------|-------|
| Backup creation | 2-5 min | Optional, depends on DB size |
| Run truncation script | 30 sec - 2 min | Depends on DB size |
| Respond to confirmations | 10 sec | Just typing 2 strings |
| Verify truncation | 20 sec | Quick check |
| **Total** | **3-8 min** | From start to finish |

---

## 🔍 Verification Checklist

After execution, verify success:

### Option 1: Use Verification Script
```powershell
node verify-truncation.js
```

### Option 2: Manual SQL Query
```sql
-- Check that data tables are empty
SELECT COUNT(*) as sales_orders FROM sales_orders;  -- Should be 0
SELECT COUNT(*) as shipments FROM shipments;        -- Should be 0
SELECT COUNT(*) as inventory FROM inventory;        -- Should be 0

-- Check that user tables have data
SELECT COUNT(*) as users FROM users;                -- Should be > 0
SELECT COUNT(*) as roles FROM roles;                -- Should be > 0
```

### Option 3: Dashboard Check
1. Start the application: `npm start`
2. Login with existing user account
3. Check dashboard stats
4. All should show "0" or "No data"
5. But user can still login! ✅

---

## 🚨 If Something Goes Wrong

### Problem: Script Hangs or Freezes
**Solution:**
1. Press `Ctrl+C` to cancel
2. Check if MySQL is responsive
3. Try again with smaller batch
4. Contact database admin

### Problem: "Connection Denied"
**Solution:**
1. Verify `.env` has correct password
2. Test connection manually: `mysql -h [host] -u admin -p`
3. Check database is running
4. Check user has TRUNCATE privilege

### Problem: "Table doesn't exist"
**Solution:**
1. This is non-critical - table was already deleted
2. Script will continue with other tables
3. At the end, verify all tables in summary

### Problem: "Foreign Key Constraint"
**Solution:**
1. Script automatically handles this
2. If manual: run `SET FOREIGN_KEY_CHECKS = 0;` first
3. Then run truncation
4. Then run `SET FOREIGN_KEY_CHECKS = 1;`

### Problem: Accidental Truncation of Wrong Table
**Solution:**
1. Stop the script immediately (Ctrl+C)
2. Restore from backup
3. Adjust SQL file to exclude that table
4. Try again with corrected script

---

## ✅ Post-Execution Checklist

```
After successful truncation:

☐ Verification script passed
☐ All data tables empty (0 rows)
☐ User tables preserved (> 0 rows)
☐ Login still works
☐ Dashboard shows empty (no errors)
☐ No connection issues in logs
☐ Team notified of completion

Optional next steps:
☐ Seed sample data: npm run seed
☐ Create manual test data
☐ Document completion in ticket
☐ Update team on status
```

---

## 🎯 Quick Command Reference

| What to Do | Command |
|-----------|---------|
| **Create backup** | `mysqldump -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com -u admin -p passion_erp > backup.sql` |
| **Run truncation (interactive)** | `node truncate-database.js` |
| **Run truncation (npm)** | `npm run truncate-db` |
| **Run truncation (SQL)** | `mysql -h [host] -u admin -p passion_erp < truncate-all-tables-except-users.sql` |
| **Verify truncation** | `node verify-truncation.js` |
| **Verify truncation (npm)** | `npm run truncate-verify` |
| **Test system still works** | `npm start` (then login) |
| **Seed fresh data** | `npm run seed` |
| **Restore from backup** | `mysql -h [host] -u admin -p passion_erp < backup.sql` |

---

## 📞 Troubleshooting Resources

1. **Full Guide:** `TRUNCATE_DATABASE_GUIDE.md`
2. **Quick Start:** `TRUNCATE_DATABASE_QUICK_START.md`
3. **Summary:** `TRUNCATE_DATABASE_SUMMARY.md`
4. **This File:** `TRUNCATE_DATABASE_EXECUTION_STEPS.md`

---

## 🚀 You're Ready!

**Choose your method above and follow the steps.**

Remember:
- ✅ Create a backup first
- ✅ Respond carefully to prompts
- ✅ Monitor the progress
- ✅ Verify when done
- ✅ Document completion

**Happy truncating! 🎉**

---

**Last Updated:** January 14, 2025
**Status:** ✅ Ready for Use
