-- ============================================================
-- CLEANUP DUPLICATE PRODUCTION REQUESTS
-- ============================================================
-- This script removes duplicate production requests that were
-- created for the same sales order due to missing validation
-- ============================================================

-- Step 1: First, let's see what duplicates we have
SELECT 
    pr.sales_order_id,
    so.order_number as sales_order_number,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(pr.request_number ORDER BY pr.created_at) as request_numbers,
    GROUP_CONCAT(pr.id ORDER BY pr.created_at) as request_ids,
    MIN(pr.created_at) as first_created,
    MAX(pr.created_at) as last_created
FROM production_requests pr
LEFT JOIN sales_orders so ON pr.sales_order_id = so.id
WHERE pr.sales_order_id IS NOT NULL
    AND pr.status NOT IN ('cancelled')
GROUP BY pr.sales_order_id
HAVING COUNT(*) > 1;

-- Step 2: For each sales_order_id with duplicates, keep the FIRST request (oldest)
-- and mark the others as cancelled

-- Backup: Create a temporary backup table first
CREATE TABLE IF NOT EXISTS production_requests_backup_20250112 AS 
SELECT * FROM production_requests;

-- Step 3: Mark duplicate requests as cancelled (keeping only the first one)
UPDATE production_requests pr1
SET 
    status = 'cancelled',
    manufacturing_notes = CONCAT(
        COALESCE(manufacturing_notes, ''), 
        '\n[AUTO-CANCELLED] Duplicate request - ',
        NOW()
    )
WHERE pr1.sales_order_id IS NOT NULL
    AND pr1.status NOT IN ('cancelled')
    AND pr1.id NOT IN (
        -- Keep only the FIRST (oldest) request for each sales_order_id
        SELECT MIN(id) 
        FROM production_requests 
        WHERE sales_order_id IS NOT NULL 
            AND status NOT IN ('cancelled')
        GROUP BY sales_order_id
    );

-- Step 4: Verify the cleanup
SELECT 
    pr.sales_order_id,
    so.order_number as sales_order_number,
    pr.request_number,
    pr.status,
    pr.created_at
FROM production_requests pr
LEFT JOIN sales_orders so ON pr.sales_order_id = so.id
WHERE pr.sales_order_id IN (
    SELECT sales_order_id 
    FROM production_requests 
    WHERE sales_order_id IS NOT NULL
    GROUP BY sales_order_id 
    HAVING COUNT(*) > 1
)
ORDER BY pr.sales_order_id, pr.created_at;

-- Step 5: Show summary of what was cleaned
SELECT 
    'Duplicate production requests marked as cancelled' as action,
    COUNT(*) as count
FROM production_requests
WHERE manufacturing_notes LIKE '%AUTO-CANCELLED%';

-- ============================================================
-- OPTIONAL: If you want to PERMANENTLY DELETE duplicates instead
-- of marking them as cancelled, uncomment the following:
-- ============================================================

/*
DELETE FROM production_requests
WHERE id IN (
    SELECT id FROM (
        SELECT pr.id
        FROM production_requests pr
        WHERE pr.sales_order_id IS NOT NULL
            AND pr.status NOT IN ('cancelled')
            AND pr.id NOT IN (
                SELECT MIN(id) 
                FROM production_requests 
                WHERE sales_order_id IS NOT NULL 
                GROUP BY sales_order_id
            )
    ) as duplicates
);
*/

-- ============================================================
-- To restore from backup if something goes wrong:
-- ============================================================
/*
DROP TABLE production_requests;
RENAME TABLE production_requests_backup_20250112 TO production_requests;
*/