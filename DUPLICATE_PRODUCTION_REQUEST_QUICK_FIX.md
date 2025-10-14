# Quick Fix: Duplicate Production Requests

## 🚨 Problem
You're seeing multiple production requests for the same sales order in Manufacturing Dashboard:

```
PRQ-20251012-00001 → nitin kamble → Formal Shirt
PRQ-20251012-00002 → nitin kamble → Formal Shirt (DUPLICATE!)
PRQ-20251012-00003 → nitin kamble → Formal Shirt (DUPLICATE!)
```

## ✅ Solution (3 Steps)

### Step 1: Restart Backend Server (Apply Fix)

The code fix has already been applied to `server/routes/sales.js`.

```bash
# Navigate to server directory
cd d:\Projects\passion-clothing\server

# Restart the server
# If using nodemon, it should auto-restart
# If using PM2:
pm2 restart passion-erp

# Or manually restart:
# Ctrl+C to stop, then:
npm start
```

**Result:** New duplicates will be prevented from now on ✅

---

### Step 2: Clean Up Existing Duplicates

Run the cleanup SQL script to mark existing duplicates as cancelled:

```bash
# From project root
mysql -u root -p passion_erp < cleanup-duplicate-production-requests.sql
```

**Enter password when prompted:** `root` (or your MySQL password)

**What it does:**
- ✅ Creates backup table automatically
- ✅ Keeps the FIRST production request for each sales order
- ✅ Marks all others as "cancelled"
- ✅ Shows summary of what was cleaned

**Result:** Only one production request per sales order will be active ✅

---

### Step 3: Refresh Manufacturing Dashboard

1. Open your browser
2. Go to **Manufacturing Dashboard**
3. Click on **"Incoming Orders"** tab
4. Press **F5** to refresh

**Expected Result:**
- ✅ Only ONE production request per sales order
- ✅ No more duplicates like PRQ-20251012-00002, PRQ-20251012-00003
- ✅ Clean, organized list

---

## 🧪 Quick Test

Try creating a duplicate to verify the fix:

1. Go to **Sales Dashboard**
2. Click on a sales order that already has a production request
3. Click **"Request Production"** button again
4. You should see an error: ⚠️ **"Production request already exists for this sales order"**

**This is correct!** The fix is working ✅

---

## 📊 Verify Cleanup

Want to see what was cleaned? Run this query:

```sql
-- See which duplicates were cancelled
SELECT 
    request_number,
    sales_order_id,
    status,
    created_at
FROM production_requests
WHERE manufacturing_notes LIKE '%AUTO-CANCELLED%'
ORDER BY created_at;
```

---

## ⚠️ What If Something Goes Wrong?

### Restore from Backup

If the cleanup causes issues, restore from the automatic backup:

```sql
-- Emergency restore
DROP TABLE production_requests;
RENAME TABLE production_requests_backup_20250112 TO production_requests;
```

### Undo Code Fix

```bash
cd d:\Projects\passion-clothing
git checkout server/routes/sales.js
```

Then restart the server.

---

## 🎯 Summary

| Action | Command | Status |
|--------|---------|--------|
| **1. Restart Server** | `pm2 restart passion-erp` or `npm start` | Apply code fix |
| **2. Clean Database** | `mysql -u root -p passion_erp < cleanup-duplicate-production-requests.sql` | Remove duplicates |
| **3. Verify in UI** | Open Manufacturing Dashboard → Refresh | See results |

**Total Time:** ~2 minutes  
**Downtime:** None (server restart takes 5 seconds)

---

## 📞 Need Help?

**Check server logs:**
```bash
tail -f d:\Projects\passion-clothing\server\log
```

**Check database:**
```bash
mysql -u root -p passion_erp
```

```sql
-- See all active production requests
SELECT request_number, sales_order_id, status 
FROM production_requests 
WHERE status != 'cancelled';
```

---

## ✅ Success Checklist

- [ ] Backend server restarted with fix
- [ ] Cleanup SQL script executed successfully
- [ ] Manufacturing Dashboard refreshed
- [ ] Only one production request per sales order visible
- [ ] Attempting to create duplicate shows error message
- [ ] No more PRQ-20251012-00002, PRQ-20251012-00003 type duplicates

**Once all checked:** You're all set! 🎉

---

**Fixed:** January 12, 2025  
**Estimated Time:** 2-3 minutes  
**Difficulty:** Easy ⭐