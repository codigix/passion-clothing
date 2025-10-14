-- ============================================================
-- CHECK FOR DUPLICATE PRODUCTION REQUESTS
-- ============================================================
-- Run this script to see if you have duplicate production
-- requests for the same sales order
-- ============================================================

-- Check 1: Find sales orders with multiple production requests
SELECT 
    '=== DUPLICATES FOUND ===' as status;

SELECT 
    pr.sales_order_id,
    so.order_number as sales_order_number,
    c.name as customer_name,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(pr.request_number ORDER BY pr.created_at) as all_request_numbers,
    GROUP_CONCAT(pr.status ORDER BY pr.created_at) as statuses,
    MIN(pr.created_at) as first_created,
    MAX(pr.created_at) as last_created
FROM production_requests pr
LEFT JOIN sales_orders so ON pr.sales_order_id = so.id
LEFT JOIN customers c ON so.customer_id = c.id
WHERE pr.sales_order_id IS NOT NULL
    AND pr.status NOT IN ('cancelled')
GROUP BY pr.sales_order_id, so.order_number, c.name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, pr.sales_order_id;

-- Check 2: Detailed view of duplicate requests
SELECT 
    '=== DETAILED VIEW ===' as status;

SELECT 
    pr.id,
    pr.request_number,
    pr.sales_order_id,
    so.order_number as sales_order,
    c.name as customer,
    pr.product_name,
    pr.quantity,
    pr.status,
    pr.created_at,
    u.name as requested_by
FROM production_requests pr
LEFT JOIN sales_orders so ON pr.sales_order_id = so.id
LEFT JOIN customers c ON so.customer_id = c.id
LEFT JOIN users u ON pr.requested_by = u.id
WHERE pr.sales_order_id IN (
    SELECT sales_order_id 
    FROM production_requests 
    WHERE sales_order_id IS NOT NULL
        AND status NOT IN ('cancelled')
    GROUP BY sales_order_id 
    HAVING COUNT(*) > 1
)
ORDER BY pr.sales_order_id, pr.created_at;

-- Check 3: Summary statistics
SELECT 
    '=== SUMMARY ===' as status;

SELECT 
    'Total Active Production Requests' as metric,
    COUNT(*) as count
FROM production_requests
WHERE status NOT IN ('cancelled')
UNION ALL
SELECT 
    'Production Requests with Duplicates' as metric,
    COUNT(DISTINCT sales_order_id) as count
FROM production_requests
WHERE sales_order_id IN (
    SELECT sales_order_id 
    FROM production_requests 
    WHERE sales_order_id IS NOT NULL
        AND status NOT IN ('cancelled')
    GROUP BY sales_order_id 
    HAVING COUNT(*) > 1
)
UNION ALL
SELECT 
    'Total Duplicate Requests to Clean' as metric,
    COUNT(*) - COUNT(DISTINCT sales_order_id) as count
FROM production_requests
WHERE sales_order_id IN (
    SELECT sales_order_id 
    FROM production_requests 
    WHERE sales_order_id IS NOT NULL
        AND status NOT IN ('cancelled')
    GROUP BY sales_order_id 
    HAVING COUNT(*) > 1
);

-- Check 4: If no duplicates found
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ NO DUPLICATES FOUND - Database is clean!'
        ELSE '⚠️  DUPLICATES FOUND - Run cleanup script'
    END as result
FROM (
    SELECT sales_order_id 
    FROM production_requests 
    WHERE sales_order_id IS NOT NULL
        AND status NOT IN ('cancelled')
    GROUP BY sales_order_id 
    HAVING COUNT(*) > 1
) as duplicates;