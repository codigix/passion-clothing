# 🚨 Production Orders Duplicate Fix - Quick Start Guide

## The Problem

You have **multiple production orders** for the **same sales order** in "Active Production", which:
- ❌ Blocks workflow progression (duplicate orders conflict)
- ❌ Creates confusion about which order to work on
- ❌ Prevents shipment tracking (multiple orders instead of one)
- ❌ Breaks reporting and analytics

**Example:**
```
Sales Order: SO-12345
├── Production Order 1: PRD-20250125-001 ✅ (KEEP - First one)
├── Production Order 2: PRD-20250125-002 ❌ (DUPLICATE - Cancel)
└── Production Order 3: PRD-20250125-003 ❌ (DUPLICATE - Cancel)
```

---

## 🔍 Step 1: Diagnose the Issue

**First, let's see what duplicates you have:**

```bash
# Run diagnostic query to see all duplicates
mysql -u root -p passion_erp < diagnose-duplicate-production-orders.sql
```

**This will show you:**
- How many sales orders have duplicate production orders
- Which production numbers are duplicates
- Whether duplicates are blocking active production

---

## 🧹 Step 2: Clean Up Duplicates

### Option A: Automatic (PowerShell - RECOMMENDED)

```powershell
# Run this automated script (handles everything)
# It will backup, clean, and verify

cd d:\projects\passion-clothing
node server/cleanup-duplicate-production-order.js
```

### Option B: Manual SQL Cleanup

**Run the cleanup SQL script:**

```bash
mysql -u root -p passion_erp < cleanup-duplicate-production-orders.sql
```

**This script will:**
1. ✅ Show you all duplicates before cleanup
2. ✅ Create automatic backup (`production_orders_backup_20250125`)
3. ✅ Keep the **first (oldest)** production order for each sales order
4. ✅ Mark **other duplicates as cancelled** (preserves audit trail)
5. ✅ Update any shipments referencing duplicate orders
6. ✅ Verify cleanup was successful
7. ✅ Show you what was cleaned

---

## ✅ Step 3: Verify Cleanup

### Check Results

After running cleanup, verify there are no more duplicates:

```sql
USE passion_erp;

-- Check for remaining duplicates
SELECT 
    so.order_number,
    COUNT(*) as total_orders,
    GROUP_CONCAT(po.production_number) as production_numbers
FROM production_orders po
LEFT JOIN sales_orders so ON po.sales_order_id = so.id
WHERE po.sales_order_id IS NOT NULL
    AND po.status NOT IN ('cancelled')
GROUP BY po.sales_order_id
HAVING COUNT(*) > 1;

-- Expected result: EMPTY (no rows) ✅
```

### Check Dashboard

1. Open **Manufacturing Dashboard**
2. Click **Incoming Orders** tab
3. **Refresh** (F5)
4. ✅ Each sales order should now show **only ONE** production order

---

## 🛑 Step 4: Prevent Future Duplicates

### Option 1: Code-Level Fix (Already Applied)

The backend `/manufacturing/orders` endpoint should have validation to prevent creating duplicate orders. Verify it's in place:

**File:** `server/routes/manufacturing.js`

Look for duplicate check:
```javascript
// CHECK FOR DUPLICATE: Prevent multiple production orders for same sales order
const existingOrder = await ProductionOrder.findOne({
  where: { sales_order_id, status: { [Op.notIn]: ['cancelled'] } }
});

if (existingOrder) {
  return res.status(409).json({ message: 'Production order already exists' });
}
```

If **NOT present**, the code needs this fix applied.

### Option 2: Database-Level Protection (Optional)

Add a UNIQUE constraint to prevent duplicates at the database level:

```sql
ALTER TABLE production_orders 
ADD CONSTRAINT unique_sales_order_production UNIQUE (sales_order_id)
WHERE sales_order_id IS NOT NULL;
```

---

## 🔄 What Happens to Cancelled Duplicates?

✅ **Cancelled duplicates remain in the database** for:
- Audit trail
- Historical tracking
- Compliance records

❌ **They no longer appear in:**
- Manufacturing Dashboard (filtered to active status)
- Active production lists
- Workflow operations

You can view them with:
```sql
SELECT * FROM production_orders 
WHERE status = 'cancelled' 
AND manufacturing_notes LIKE '%AUTO-CANCELLED%';
```

---

## 🚨 Troubleshooting

### Issue: "Still seeing duplicates after cleanup"

**Solution:**

1. **Refresh browser** (Ctrl+Shift+Delete to clear cache)
2. **Check backend is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```
3. **Verify cleanup script ran:**
   ```sql
   SELECT * FROM production_orders_backup_20250125 LIMIT 5;
   ```
4. **Check actual database state:**
   ```sql
   SELECT COUNT(*) FROM production_orders WHERE status != 'cancelled';
   ```

### Issue: "Shipments missing after cleanup"

The cleanup script **automatically updates** shipments to reference the kept production order. If shipments are missing:

```sql
-- Check shipment references
SELECT s.id, s.production_order_id, po.production_number
FROM shipments s
LEFT JOIN production_orders po ON s.production_order_id = po.id
WHERE s.production_order_id IS NOT NULL
ORDER BY s.id;
```

### Issue: "Can't run Node.js script"

Make sure you're in the right directory:
```bash
cd d:\projects\passion-clothing
node server/cleanup-duplicate-production-order.js
```

Or use SQL directly:
```bash
mysql -u root -p passion_erp < cleanup-duplicate-production-orders.sql
```

---

## 📊 Before & After

### BEFORE ❌
```
Manufacturing Dashboard - Incoming Orders (3 duplicate items)
┌─────────────────────────────────────────────┐
│ SO-12345 (nitin kamble - Formal Shirt)     │
├─────────────────────────────────────────────┤
│ PRD-20250125-001 │ in_progress │ 1000 pcs  │
│ PRD-20250125-002 │ in_progress │ 1000 pcs  │ ← DUPLICATE
│ PRD-20250125-003 │ pending     │ 1000 pcs  │ ← DUPLICATE
└─────────────────────────────────────────────┘
```

### AFTER ✅
```
Manufacturing Dashboard - Incoming Orders (1 clean item)
┌─────────────────────────────────────────────┐
│ SO-12345 (nitin kamble - Formal Shirt)     │
├─────────────────────────────────────────────┤
│ PRD-20250125-001 │ in_progress │ 1000 pcs  │ ✅
└─────────────────────────────────────────────┘
```

---

## 🔒 Backup & Rollback

### Automatic Backup Created

After running cleanup, you have a full backup:
- **Table:** `production_orders_backup_20250125`
- **Contains:** All data before cleanup

### Restore If Needed

```sql
-- Drop current table
DROP TABLE production_orders;

-- Restore from backup
RENAME TABLE production_orders_backup_20250125 TO production_orders;
```

---

## ✅ Success Checklist

After running the fix:

- [ ] Ran diagnostic script and saw duplicates
- [ ] Ran cleanup script (SQL or Node)
- [ ] Verified no remaining duplicates in SQL
- [ ] Refreshed Manufacturing Dashboard
- [ ] See only ONE production order per sales order
- [ ] Workflow moving forward without duplicates
- [ ] (Optional) Added database constraint for protection

---

## 📞 Support

If cleanup fails or you have issues:

1. **Check error message** carefully for hints
2. **Verify MySQL credentials** in scripts (user: root, password: root)
3. **Check database is running:**
   ```bash
   mysql -u root -p -e "SELECT 1;"
   ```
4. **Review full cleanup script output** for details
5. **Contact support** with error details and script output

---

## 🎯 Next Steps

### Immediate
1. ✅ Run diagnostic script
2. ✅ Run cleanup script
3. ✅ Verify in dashboard

### Short-term
- Monitor Manufacturing Dashboard for any new duplicates
- Test creating production orders (shouldn't allow duplicates now)

### Long-term
- Consider adding code-level duplicate prevention if not present
- Optional: Add database UNIQUE constraint for extra protection
- Document this fix for team knowledge

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `diagnose-duplicate-production-orders.sql` | See all duplicates |
| `cleanup-duplicate-production-orders.sql` | Clean up ALL duplicates |
| `server/cleanup-duplicate-production-order.js` | Automated Node.js cleanup (legacy) |

---

**Ready to fix this?** Run the cleanup script now! ✅

**Questions?** Check the diagnostics output for clues about what happened.

---

*Status: ✅ Production Ready*  
*Last Updated: January 25, 2025*