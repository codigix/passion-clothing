# 🔧 Production Duplicates Cleanup - Choose Your Method

You have **3 ways** to fix duplicate production orders. Pick the one that suits you best:

---

## 🚀 OPTION 1: Easiest - Use Node.js Script (RECOMMENDED)

**Best for:** Quick cleanup with detailed output and automatic rollback protection

### Steps:

1. **Open terminal/PowerShell**

2. **Navigate to project:**
   ```powershell
   cd d:\projects\passion-clothing
   ```

3. **Make sure backend is running:**
   ```powershell
   # Open another terminal and run:
   cd d:\projects\passion-clothing\server
   npm start
   ```

4. **In first terminal, run cleanup:**
   ```powershell
   node server/cleanup-production-duplicates.js
   ```

### What it does:
- ✅ Finds all duplicate production orders
- ✅ Shows you exactly what will be cancelled before doing it
- ✅ Updates any shipments automatically
- ✅ Marks duplicates as cancelled (preserves audit trail)
- ✅ Verifies cleanup was successful
- ✅ Can easily rollback if needed

### Example Output:
```
═══ PRODUCTION ORDERS DUPLICATE CLEANUP ═══

═══ STEP 1: IDENTIFYING DUPLICATES ═══
Found 5 sales orders with duplicate production orders:

1. Sales Order: SO-12345 (3 orders)
   Production Numbers: PRD-20250125-001,PRD-20250125-002,PRD-20250125-003
   IDs: 1,2,3

═══ STEP 2: DUPLICATES TO BE CANCELLED ═══
Will KEEP: 5 production orders
Will CANCEL: 8 duplicate production orders

  - PRD-20250125-002 (ID: 2)
  - PRD-20250125-003 (ID: 3)
  ... more items ...

✅ Cleanup complete!
```

---

## 🔧 OPTION 2: SQL-Based - Full Control

**Best for:** Maximum control and transparency

### Steps:

1. **Open MySQL terminal or client**

2. **First, see what duplicates you have:**
   ```bash
   mysql -u root -p passion_erp < diagnose-duplicate-production-orders.sql
   ```

3. **Review the output, then run cleanup:**
   ```bash
   mysql -u root -p passion_erp < cleanup-duplicate-production-orders.sql
   ```

### What it does:
- ✅ Shows detailed diagnostic information
- ✅ Creates backup before any changes
- ✅ Updates shipment references
- ✅ Marks duplicates as cancelled
- ✅ Comprehensive verification queries
- ✅ Shows exactly what changed

### Advantage:
- Direct SQL execution
- Easy to understand what's happening
- Full audit trail in output

---

## 🎯 OPTION 3: Manual - Step by Step

**Best for:** Understanding exactly what's happening (educational)

### Step 1: Check for duplicates

```sql
mysql -u root -p passion_erp

USE passion_erp;

SELECT 
    so.order_number,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(po.production_number) as production_numbers
FROM production_orders po
LEFT JOIN sales_orders so ON po.sales_order_id = so.id
WHERE po.sales_order_id IS NOT NULL
GROUP BY po.sales_order_id
HAVING COUNT(*) > 1;
```

### Step 2: If duplicates found, create backup

```sql
CREATE TABLE production_orders_backup_20250125 AS 
SELECT * FROM production_orders;
```

### Step 3: Find which orders to keep vs cancel

```sql
-- Show all duplicates with details
SELECT 
    so.order_number,
    po.production_number,
    po.id,
    po.status,
    po.created_at,
    ROW_NUMBER() OVER (PARTITION BY po.sales_order_id ORDER BY po.created_at) as row_num
FROM production_orders po
LEFT JOIN sales_orders so ON po.sales_order_id = so.id
WHERE po.sales_order_id IN (
    SELECT sales_order_id FROM production_orders 
    WHERE sales_order_id IS NOT NULL
    GROUP BY sales_order_id HAVING COUNT(*) > 1
)
ORDER BY so.order_number, po.created_at;
```

### Step 4: Cancel duplicates manually

```sql
UPDATE production_orders
SET status = 'cancelled',
    manufacturing_notes = CONCAT(
        manufacturing_notes,
        '\n[MANUALLY CANCELLED] Duplicate - kept first order only'
    ),
    updated_at = NOW()
WHERE id IN (
    -- List the IDs of duplicate orders (not the first one)
    SELECT id FROM production_orders po
    WHERE po.sales_order_id = 123  -- Use actual sales_order_id
    AND po.status != 'cancelled'
    AND po.id NOT IN (
        SELECT MIN(id) FROM production_orders 
        WHERE sales_order_id = 123
    )
);
```

### Step 5: Verify

```sql
-- Check remaining duplicates
SELECT 
    so.order_number,
    COUNT(*) as remaining_count
FROM production_orders po
LEFT JOIN sales_orders so ON po.sales_order_id = so.id
WHERE po.sales_order_id IS NOT NULL
    AND po.status NOT IN ('cancelled')
GROUP BY po.sales_order_id
HAVING COUNT(*) > 1;

-- Should be empty ✅
```

---

## 🎓 Comparison Table

| Aspect | Option 1 (Node.js) | Option 2 (SQL) | Option 3 (Manual) |
|--------|-------------------|----------------|------------------|
| **Difficulty** | Easy | Medium | Hard |
| **Speed** | Fast | Medium | Slow |
| **Control** | Good | Excellent | Maximum |
| **Error Recovery** | Automatic | Manual | Manual |
| **Learning Value** | Medium | High | Very High |
| **Recommended** | ✅ YES | ✅ Good | ⚠️ For learning |

---

## ✅ After Cleanup - Verify It Worked

### 1. Check Database

```sql
-- Should return EMPTY result
SELECT so.order_number, COUNT(*) 
FROM production_orders po
LEFT JOIN sales_orders so ON po.sales_order_id = so.id
WHERE po.status NOT IN ('cancelled')
GROUP BY po.sales_order_id
HAVING COUNT(*) > 1;
```

### 2. Refresh Dashboard

1. Open Manufacturing Dashboard
2. Press F5 (refresh)
3. Go to **Incoming Orders** tab
4. ✅ Each sales order should have **ONE** production order

### 3. Test Workflow

1. Try to move an order through stages
2. ✅ Should work smoothly (no conflicts)
3. ✅ Shipment should only show once

---

## 🆘 If Something Goes Wrong

### Quick Rollback (if you have backup)

```sql
DROP TABLE production_orders;
RENAME TABLE production_orders_backup_20250125 TO production_orders;
```

### Check What Happened

```sql
-- See all cancelled orders
SELECT * FROM production_orders 
WHERE status = 'cancelled'
AND manufacturing_notes LIKE '%AUTO-CANCELLED%'
LIMIT 10;
```

### Get Help

Run the diagnostic script again:
```bash
mysql -u root -p passion_erp < diagnose-duplicate-production-orders.sql
```

---

## 🛡️ Prevent Future Duplicates

After cleanup, add code validation to prevent this from happening again.

**File:** `server/routes/manufacturing.js` - POST endpoint to create production orders

**Should have:**
```javascript
// CHECK FOR DUPLICATE
const existingOrder = await ProductionOrder.findOne({
  where: {
    sales_order_id: salesOrderId,
    status: { [Op.notIn]: ['cancelled'] }
  }
});

if (existingOrder) {
  return res.status(409).json({
    message: 'Production order already exists for this sales order',
    existingOrderId: existingOrder.id,
    existingNumber: existingOrder.production_number
  });
}
```

If this code is **NOT present**, it needs to be added to prevent duplicates.

---

## 📊 What Gets Cancelled

✅ **Cancelled orders still in database** for audit/compliance

❌ **But they don't appear in:**
- Manufacturing Dashboard (active only)
- Active orders lists
- Workflow operations
- Shipment tracking

---

## 🎯 My Recommendation

### For most users: **Use Option 1 (Node.js Script)**
```bash
node server/cleanup-production-duplicates.js
```

**Why?**
- Easiest to run
- Most error checking
- Automatic rollback capability
- Clear, colorful output
- Safest approach

### Then verify in dashboard and you're done! ✅

---

## 📞 Questions?

- **Want to see duplicates first?** Run `diagnose-duplicate-production-orders.sql`
- **Want SQL control?** Run `cleanup-duplicate-production-orders.sql`
- **Want to learn?** Use Option 3 (Manual) with the SQL queries
- **Want automated?** Use Option 1 (Node.js)

---

**Pick your option and run it now!** You'll have this fixed in 5 minutes. ⏱️

*Status: ✅ Ready to Deploy*  
*Last Updated: January 25, 2025*