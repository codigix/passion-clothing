# Recent Activities 500 Error - Quick Fix (5 Minutes)

## ⚡ What Happened?

Your backend is trying to query `project_name` from the database, but the columns weren't created yet. The migration script has now been **automatically executed**. ✅

---

## 🎯 What You Need to Do

### ONLY 1 STEP REQUIRED:

**🔴 RESTART YOUR BACKEND SERVER**

### How to Restart:

**Option 1: Using PM2** (Recommended)
```bash
pm2 restart all
```

**Option 2: If running with npm start**
1. Press `Ctrl+C` to stop the server
2. Run `npm start` to restart it

**Option 3: Using Windows Services**
1. Stop the service
2. Start the service

---

## ✅ What's Already Done

- ✅ Database migration executed
- ✅ `project_name` columns added to `shipments` table
- ✅ `project_name` columns added to `production_orders` table
- ✅ Columns indexed for performance
- ✅ Data populated from related sales orders

---

## 🧪 How to Verify It's Fixed

1. **Restart backend** (see above)
2. **Open browser and refresh page**: `Ctrl+Shift+R`
3. **Go to Sales Dashboard**: http://yourapp/sales/dashboard
4. **Look for "Recent Activities" section** - should load without error
5. **Check browser console** (F12) - should show NO red errors

---

## 🔍 How to Test

**Test 1: Browser Console**
1. Open browser DevTools: `F12`
2. Go to Console tab
3. Refresh page: `Ctrl+Shift+R`
4. **Expected**: No red errors about "recent-activities"

**Test 2: API Direct Test**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/sales/dashboard/recent-activities?limit=5
```
Should return JSON data with activities, no error.

---

## 🚨 If Still Getting Error?

**Check 1**: Is backend running?
```bash
pm2 status
# Should show "online" for passion-erp-backend
```

**Check 2**: Are columns in database?
```bash
mysql -u root -p passion_erp
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name='shipments' AND column_name='project_name';
# Should return: 1
```

**Check 3**: Check logs
```bash
pm2 logs passion-erp-backend --lines 50
# Look for errors about project_name or SQL
```

---

## 📋 What Was Fixed

| What | Status |
|------|--------|
| Add `project_name` to `shipments` | ✅ Done |
| Add `project_name` to `production_orders` | ✅ Done |
| Create database indexes | ✅ Done |
| Populate data | ✅ Done |
| **Restart backend** | ⏳ **You need to do this** |

---

## 🎉 After Restart

Once you restart, you should see:
- ✅ No 500 errors in browser console
- ✅ Recent Activities cards loading
- ✅ Project names visible in activities
- ✅ No errors in backend logs

---

## 📚 For More Details

See full documentation: `FIX_RECENT_ACTIVITIES_500_ERROR.md`

---

**Need help?** Check the full fix guide above! 👆