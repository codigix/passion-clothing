# 🚀 Truncate Database - Quick Start

## **TL;DR - Execute in 3 Steps**

### ✅ Step 1: Create Backup (Optional but Recommended)
```bash
mysqldump -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
          -u admin -p passion_erp > backup.sql
# Enter password when prompted
```

### ✅ Step 2: Run Truncation
```bash
# Navigate to project root
cd d:\projects\passion-clothing

# Run the truncation script
node truncate-database.js
```

### ✅ Step 3: Respond to Prompts
When asked:
1. Type: `TRUNCATE ALL`
2. Type: `YES I AM SURE`

✨ **Done!** All data cleared except users table.

---

## **What Happens**

### ❌ DELETED (All cleared):
- All sales orders
- All purchase orders
- All production orders
- All shipments
- All inventory
- All customers, vendors
- All financial data
- All manufacturing records
- ... (40+ business tables)

### ✅ PRESERVED (Stays intact):
- Users (all accounts)
- Roles
- Permissions
- User-role mappings

---

## **Verify It Worked**

```bash
# Check if truncation was successful
node verify-truncation.js

# Expected output:
# ✅ VERIFICATION PASSED - All tables correctly truncated!
```

---

## **Using npm (Easier)**

If you prefer npm commands:

```bash
# From server directory
cd server

# Run truncation
npm run truncate-db

# Verify success
npm run truncate-verify
```

---

## **Using SQL Directly**

If you have MySQL client:

```bash
# Import and execute SQL file
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -p passion_erp < truncate-all-tables-except-users.sql
```

Or in MySQL Workbench:
1. Open file: `truncate-all-tables-except-users.sql`
2. Click Execute (⚡)
3. Done!

---

## **Common Issues**

### Error: "Command not found"
```bash
# Install Node.js: https://nodejs.org
# Then try again
node truncate-database.js
```

### Error: "Cannot connect to database"
1. Check `.env` file has correct credentials
2. Verify database is running
3. Test connection:
   ```bash
   mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com -u admin -p
   ```

### Error: "Access denied for user"
1. Check password in `.env` is correct
2. Verify user 'admin' exists in database
3. Check user has TRUNCATE privilege

### If Something Goes Wrong
1. **Restore from backup:**
   ```bash
   mysql -h [host] -u admin -p passion_erp < backup.sql
   ```
2. **Contact Database Admin**
3. **Check AWS RDS automated backups**

---

## **After Truncation**

### ✅ What Works:
- Users can still login
- User roles work normally
- All permissions intact
- Application boots normally

### ❌ What's Empty:
- No sales orders
- No inventory
- No production records
- No shipments
- No vendors/customers

### Ready for:
- Testing fresh workflows
- Demo environments
- Data cleanup
- QA testing

---

## **Safety Checklist**

Before you execute:
- [ ] Read the "TRUNCATE DATABASE GUIDE" for full details
- [ ] Created a backup (or notified backup admin)
- [ ] This is the correct database (not production!)
- [ ] Notified your team
- [ ] Understand what will be deleted

---

## **Files Included**

1. **truncate-database.js** - Safe interactive script with confirmations
2. **verify-truncation.js** - Check if truncation was successful
3. **truncate-all-tables-except-users.sql** - Raw SQL if needed
4. **TRUNCATE_DATABASE_GUIDE.md** - Complete documentation
5. **TRUNCATE_DATABASE_QUICK_START.md** - This file

---

## **Next Steps**

After truncation:

1. **Verify success:**
   ```bash
   node verify-truncation.js
   ```

2. **Test system still works:**
   ```bash
   npm start
   # Try to login with existing user account
   ```

3. **Refresh test data (optional):**
   ```bash
   npm run seed
   ```

4. **Document the action:**
   - Note when/why truncation occurred
   - Update team on data status

---

## **Questions?**

See the full guide: `TRUNCATE_DATABASE_GUIDE.md`

Key sections:
- Detailed instructions for each method
- Troubleshooting guide
- Recovery procedures
- Best practices

---

**Last Updated:** January 14, 2025
**Status:** ✅ Ready to Use
**Risk Level:** 🔴 High (Data Loss) - Use with caution!
