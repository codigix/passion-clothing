# 🔧 Complete Reset - Recovery & Troubleshooting Guide

**How to recover from issues or restore data after reset**

---

## 📋 Quick Decision Tree

```
Something went wrong?
│
├─ "Reset didn't complete"
│  └─ See: Incomplete Reset Recovery
│
├─ "Still have data after reset"
│  └─ See: Data Still Exists Recovery
│
├─ "Connection failed"
│  └─ See: Connection Issues
│
├─ "Need to undo the reset"
│  └─ See: Full Restoration
│
├─ "Reset command won't run"
│  └─ See: Script Execution Issues
│
└─ "Database locked/frozen"
   └─ See: Locked Database Recovery
```

---

## 🔄 Incomplete Reset Recovery

### Symptom
Reset started but didn't complete:
```
✓ Connected to database
✓ Foreign key checks disabled
✓ Truncated: user_roles
✓ Truncated: role_permissions
... (stops here or shows error)
```

### Cause
- Network timeout
- Database connection dropped
- Out of memory
- Killed process

### Recovery Steps

**Step 1: Check current state**
```bash
npm run reset-verify
# Shows which tables are empty and which have data
```

**Step 2: If most tables are empty, continue with:**
```bash
# Create admin user
npm run seed

# Start server
npm start
```

**Step 3: If many tables still have data, retry reset**
```bash
# Try reset again (may succeed this time)
npm run reset-entire-db

# Answer prompts same as before
# Type: DELETE ALL DATA
# Type: YES I AM SURE

# Then verify
npm run reset-verify
```

**Step 4: If reset still fails after 2 attempts**
```bash
# Restore from backup
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 \
      passion_erp < backup-LATEST.sql

# Then retry reset
npm run reset-entire-db
```

---

## 🗑️ Data Still Exists Recovery

### Symptom
After running reset and seeing success message, verification shows:
```
✗ sales_order              : 500 records (expected 0)
✗ purchase_order           : 300 records (expected 0)
✗ production_order         : 200 records (expected 0)
```

### Cause
- Reset didn't actually execute
- Process hung before completing
- Confirmation input failed
- Foreign key constraints preventing truncation

### Recovery Steps

**Step 1: Check what's still there**
```bash
npm run reset-verify
# Shows exact count of remaining data
```

**Step 2: Try the SQL option instead**
```bash
# Using direct SQL (bypasses any Node.js issues)
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 \
      passion_erp < reset-entire-database.sql

# Verify
npm run reset-verify
```

**Step 3: If SQL also doesn't work, check foreign keys**
```bash
# Login to MySQL directly
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 \
      passion_erp

# Check foreign key status
SHOW VARIABLES LIKE 'foreign_key_checks';
# Should show: ON or OFF

# If you're stuck, disable and try manual truncate
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE sales_order;
TRUNCATE TABLE purchase_order;
TRUNCATE TABLE production_order;
TRUNCATE TABLE shipment;
TRUNCATE TABLE inventory;
# ... truncate all tables
SET FOREIGN_KEY_CHECKS=1;

# Exit
exit
```

---

## 🔌 Connection Issues

### Symptom
```
Error: connect ECONNREFUSED 127.0.0.1:3306
Error: ER_ACCESS_DENIED_FOR_USER 'admin'@'host' (using password: YES)
Error: ER_BAD_DB_ERROR - Unknown database 'passion_erp'
```

### Cause
- Wrong credentials in `.env`
- Database server down
- Network connectivity issue
- AWS RDS not accessible

### Recovery Steps

**Step 1: Verify credentials**

Check `server/.env`:
```env
DB_HOST=passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=admin
DB_PASSWORD=C0digix$309
```

**Step 2: Test connection manually**
```bash
# Test with mysql client
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 \
      -e "SELECT 1;"

# Should output: 1
```

**Step 3: If connection test fails**

- Check internet connection
  ```bash
  ping google.com
  # Should show responses
  ```

- Check if AWS RDS is running
  - Go to AWS console
  - Check RDS instances
  - Verify database is "Available"
  - Check security group allows access

- Check firewall
  ```bash
  # Windows PowerShell
  Test-NetConnection passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com -Port 3306
  
  # Mac/Linux
  nc -zv passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com 3306
  ```

**Step 4: Update credentials if needed**

Edit `server/.env` with correct values:
```env
DB_HOST=actual-host.rds.amazonaws.com
DB_PORT=3306
DB_NAME=correct_db_name
DB_USER=correct_username
DB_PASSWORD=correct_password
```

**Step 5: Try reset again**
```bash
npm run reset-entire-db
```

---

## 🔐 Locked Database Recovery

### Symptom
```
Error: Error: ER_LOCK_WAIT_TIMEOUT: Lock wait timeout exceeded
Error: Cannot truncate - table is locked
```

### Cause
- Other connections holding locks
- Long-running queries
- Another process resetting simultaneously

### Recovery Steps

**Step 1: Stop other processes**
```bash
# Kill any other Node.js processes
# Windows PowerShell:
Get-Process node | Stop-Process -Force

# Mac/Linux:
pkill -f node
```

**Step 2: Stop the server**
```bash
# In terminal where server runs:
Ctrl+C

# Or:
npm stop
```

**Step 3: Check for locks in MySQL**
```bash
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 \
      passion_erp

# Show current locks
SHOW OPEN TABLES WHERE In_use > 0;

# Show running processes
SHOW PROCESSLIST;

# Kill specific connection (if needed)
KILL 123;  # Replace 123 with process ID

# Exit
exit
```

**Step 4: Wait a moment, then retry**
```bash
# Wait 30 seconds for locks to clear

# Try reset again
npm run reset-entire-db
```

---

## ↩️ Full Restoration from Backup

### When to Use
- Reset was a mistake
- Need to go back to previous state
- Reset damaged data somehow

### Step-by-Step Restoration

**Step 1: Stop the server**
```bash
# Press Ctrl+C in server terminal
# Or:
npm stop
```

**Step 2: List available backups**
```bash
# Windows PowerShell:
Get-Item "backup-*.sql" | Select-Object Name, Length, LastWriteTime

# Mac/Linux:
ls -lh backup-*.sql
```

**Step 3: Restore from backup**

```bash
# Replace TIMESTAMP with actual backup date/time
# Example: backup-20250120-143000.sql

mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 \
      passion_erp < backup-TIMESTAMP.sql

# Wait for completion (shows: "Dump completed on...")
```

**Windows PowerShell:**
```powershell
# Get latest backup
$latestBackup = Get-Item "backup-*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# Restore it
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com `
      -u admin -pC0digix$309 `
      passion_erp < $latestBackup.FullName

Write-Host "Restoration started. Please wait..."
```

**Step 4: Verify restoration**
```bash
npm run reset-verify
# Should show tables with data again
```

**Step 5: Restart server**
```bash
npm start
```

**Step 6: Test login**
- Browser: http://localhost:3000
- Use original credentials
- Should login successfully

---

## 🖥️ Script Execution Issues

### Issue: "Command not found"

**Symptom:**
```
node: command not found
npm: command not found
```

**Solution:**

1. Install Node.js from https://nodejs.org
2. Verify installation:
   ```bash
   node --version
   npm --version
   ```
3. Restart terminal
4. Try reset again

### Issue: "Permission denied"

**Symptom:**
```
permission denied: reset-entire-database.js
```

**Solution (Mac/Linux):**
```bash
# Make script executable
chmod +x reset-entire-database.js

# Try again
node reset-entire-database.js
```

### Issue: "Module not found"

**Symptom:**
```
Error: Cannot find module 'mysql2/promise'
```

**Solution:**
```bash
# Install dependencies
npm install

# Or in server directory
cd server
npm install

# Try reset again
npm run reset-entire-db
```

### Issue: Script hangs/freezes

**Symptom:**
```
(no output for more than 2 minutes)
```

**Solution:**
1. Press `Ctrl+C` to cancel
2. Check if database is responsive:
   ```bash
   mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
         -u admin -pC0digix$309 \
         passion_erp -e "SELECT 1;"
   ```
3. If database doesn't respond, check AWS RDS console
4. Restart RDS if needed
5. Try reset again

---

## 🛠️ Manual Recovery

### Manual SQL Execution

If scripts won't work, execute SQL manually:

```bash
# Open MySQL client
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 \
      passion_erp

# Disable foreign keys
SET FOREIGN_KEY_CHECKS=0;

# Truncate tables manually
TRUNCATE TABLE user_roles;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE user_permissions;
TRUNCATE TABLE shipment_tracking;
TRUNCATE TABLE stage_operations;
... (continue for all tables)

# Re-enable foreign keys
SET FOREIGN_KEY_CHECKS=1;

# Verify
SELECT COUNT(*) as total_records FROM 
  (SELECT COUNT(*) as cnt FROM users
   UNION ALL SELECT COUNT(*) FROM sales_order
   UNION ALL SELECT COUNT(*) FROM purchase_order) x;
# Should show 0

# Exit
exit
```

### MySQL Workbench Method

1. Open MySQL Workbench
2. Connect to database
3. File → Open SQL Script → `reset-entire-database.sql`
4. Click Execute (lightning bolt)
5. Check Output tab for results

---

## 📊 Verification Checklist

After recovery attempt, verify:

- [ ] Run `npm run reset-verify` - all tables empty or restored
- [ ] Check record counts match expectations
- [ ] Admin user exists (if should)
- [ ] Database connection works
- [ ] Server starts without errors
- [ ] Can login to application
- [ ] UI shows correct data (empty or restored)

---

## 🆘 Emergency Contacts

If nothing works:

1. **Check AWS RDS Status**
   - Go to AWS Console
   - Check RDS instance status
   - Look at event logs
   - Check storage capacity

2. **Database Logs**
   - Check MySQL error logs
   - Look for storage space issues
   - Check for corruption messages

3. **Last Resort: AWS Support**
   - Contact AWS support
   - Provide RDS instance ID
   - Explain what happened
   - Request database recovery options

---

## 📝 Prevention Guide

To avoid needing recovery:

### Before Reset
- ✅ Create backup: `mysqldump ... > backup.sql`
- ✅ Verify backup: Check file size (1-5 MB)
- ✅ Test backup: Restore to test database
- ✅ Notify team: No one else should access DB
- ✅ Stop server: Avoid concurrent access

### During Reset
- ✅ Watch console output
- ✅ Don't interrupt process
- ✅ Don't close terminal
- ✅ Let it complete fully

### After Reset
- ✅ Run verify script immediately
- ✅ Check table counts
- ✅ Create admin user
- ✅ Test login
- ✅ Keep backup safe

### Regular Maintenance
- ✅ Backup weekly
- ✅ Test backup restoration monthly
- ✅ Keep multiple backup generations
- ✅ Store backups off-site
- ✅ Document process and credentials

---

## 📚 Related Documents

- `COMPLETE_RESET_QUICK_START.md` - Quick start guide
- `COMPLETE_RESET_DETAILED_GUIDE.md` - Detailed documentation
- `reset-entire-database.js` - Interactive reset script
- `reset-entire-database.sql` - SQL script
- `verify-all-tables-empty.js` - Verification script

---

**Status:** ✅ Complete  
**Last Updated:** 2025-01-21  
**Version:** 1.0