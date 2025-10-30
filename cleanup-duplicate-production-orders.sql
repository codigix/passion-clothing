-- ============================================================
-- CLEANUP DUPLICATE PRODUCTION ORDERS
-- ============================================================
-- This script removes ALL duplicate production orders across
-- the database, keeping only the first (oldest) for each sales order
-- ============================================================

USE passion_erp;

-- ============================================================
-- STEP 1: SHOW WHAT WILL BE CLEANED
-- ============================================================
SELECT '=== STEP 1: DUPLICATES FOUND ===' as step_info;

SELECT 
    so.order_number as sales_order,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(po.production_number ORDER BY po.created_at) as production_numbers,
    GROUP_CONCAT(po.id ORDER BY po.created_at) as ids_to_cancel,
    MIN(po.created_at) as first_created
FROM production_orders po
LEFT JOIN sales_orders so ON po.sales_order_id = so.id
WHERE po.sales_order_id IS NOT NULL
GROUP BY po.sales_order_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- ============================================================
-- STEP 2: CREATE BACKUP
-- ============================================================
SELECT '=== STEP 2: CREATING BACKUP ===' as step_info;

SET @backup_table = CONCAT('production_orders_backup_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s'));

-- Create backup table with all columns
CREATE TABLE production_orders_backup_20250125 AS 
SELECT * FROM production_orders;

SELECT CONCAT('✅ Backup created: production_orders_backup_20250125') as backup_status;

-- ============================================================
-- STEP 3: UPDATE SHIPMENTS THAT REFERENCE DUPLICATE ORDERS
-- ============================================================
SELECT '=== STEP 3: UPDATING SHIPMENT REFERENCES ===' as step_info;

-- If shipments reference these orders, update them to use the kept order
UPDATE shipments s
JOIN (
    SELECT po.sales_order_id, MIN(po.id) as kept_id
    FROM production_orders po
    WHERE po.sales_order_id IS NOT NULL
    GROUP BY po.sales_order_id
    HAVING COUNT(*) > 1
) duplicates ON s.production_order_id IN (
    SELECT id FROM production_orders 
    WHERE sales_order_id = duplicates.sales_order_id 
    AND id != duplicates.kept_id
)
SET s.production_order_id = duplicates.kept_id;

SELECT CONCAT('✅ Shipment references updated') as shipment_update;

-- ============================================================
-- STEP 4: MARK DUPLICATES AS CANCELLED
-- ============================================================
SELECT '=== STEP 4: MARKING DUPLICATES AS CANCELLED ===' as step_info;

UPDATE production_orders po1
SET 
    po1.status = 'cancelled',
    po1.manufacturing_notes = CONCAT(
        COALESCE(po1.manufacturing_notes, ''),
        IF(COALESCE(po1.manufacturing_notes, '') = '', '', '\n'),
        '[AUTO-CANCELLED on ', DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), '] Duplicate production order - ',
        'consolidated to production_order_id: ',
        (SELECT MIN(id) FROM production_orders po2 
         WHERE po2.sales_order_id = po1.sales_order_id AND po2.status != 'cancelled')
    ),
    po1.updated_at = NOW()
WHERE po1.sales_order_id IS NOT NULL
    AND po1.status NOT IN ('cancelled')
    AND po1.id NOT IN (
        -- Keep only the FIRST (oldest) for each sales_order_id
        SELECT MIN(id) 
        FROM production_orders 
        WHERE sales_order_id IS NOT NULL 
        GROUP BY sales_order_id
    );

SELECT CONCAT('✅ Marked ', ROW_COUNT(), ' duplicate orders as cancelled') as cancellation_status;

-- ============================================================
-- STEP 5: VERIFY CLEANUP
-- ============================================================
SELECT '=== STEP 5: VERIFICATION ===' as step_info;

SELECT 
    so.order_number,
    COUNT(*) as remaining_orders,
    GROUP_CONCAT(po.production_number ORDER BY po.created_at) as production_numbers,
    GROUP_CONCAT(po.status ORDER BY po.created_at) as statuses
FROM production_orders po
LEFT JOIN sales_orders so ON po.sales_order_id = so.id
WHERE po.sales_order_id IN (
    SELECT sales_order_id 
    FROM production_orders 
    WHERE sales_order_id IS NOT NULL
    GROUP BY sales_order_id 
    HAVING COUNT(*) > 1
)
GROUP BY po.sales_order_id
ORDER BY so.order_number;

-- ============================================================
-- STEP 6: SHOW SUMMARY
-- ============================================================
SELECT '=== STEP 6: CLEANUP SUMMARY ===' as step_info;

SELECT 
    'Production Orders' as entity_type,
    COUNT(*) as total_records,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
    SUM(CASE WHEN manufacturing_notes LIKE '%AUTO-CANCELLED%' THEN 1 ELSE 0 END) as auto_cancelled_count
FROM production_orders;

-- ============================================================
-- STEP 7: CHECK FOR REMAINING DUPLICATES
-- ============================================================
SELECT '=== STEP 7: CHECK FOR REMAINING DUPLICATES ===' as step_info;

SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ NO DUPLICATES FOUND - Cleanup successful!'
        ELSE CONCAT('❌ ', COUNT(*), ' sales orders still have duplicates')
    END as final_status
FROM (
    SELECT sales_order_id
    FROM production_orders
    WHERE sales_order_id IS NOT NULL
        AND status NOT IN ('cancelled')
    GROUP BY sales_order_id
    HAVING COUNT(*) > 1
) remaining_duplicates;

-- ============================================================
-- OPTIONAL: VIEW ALL CANCELLED DUPLICATES
-- ============================================================
SELECT '=== OPTIONAL: CANCELLED DUPLICATES (for audit) ===' as step_info;

SELECT 
    so.order_number,
    po.production_number,
    po.status,
    po.created_at,
    po.manufacturing_notes
FROM production_orders po
LEFT JOIN sales_orders so ON po.sales_order_id = so.id
WHERE po.manufacturing_notes LIKE '%AUTO-CANCELLED%'
ORDER BY so.order_number, po.created_at;

-- ============================================================
-- CLEANUP COMPLETE
-- ============================================================
SELECT '✅ CLEANUP COMPLETE' as final_message;
SELECT 'If you need to restore from backup, run:' as restore_info;
SELECT 'DROP TABLE production_orders;' as restore_step1;
SELECT 'RENAME TABLE production_orders_backup_20250125 TO production_orders;' as restore_step2;