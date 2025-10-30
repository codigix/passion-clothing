-- ============================================================
-- DIAGNOSE DUPLICATE PRODUCTION ORDERS
-- ============================================================
-- Find all duplicate production orders grouped by sales_order_id

USE passion_erp;

-- Step 1: Find Production Orders with Duplicates (grouped by sales_order)
SELECT 
    '=== DUPLICATE PRODUCTION ORDERS BY SALES ORDER ===' as info;

SELECT 
    so.order_number as sales_order,
    COUNT(DISTINCT po.id) as order_count,
    GROUP_CONCAT(DISTINCT po.production_number ORDER BY po.production_number) as production_numbers,
    GROUP_CONCAT(DISTINCT po.id ORDER BY po.id) as production_ids,
    MIN(po.created_at) as first_created,
    MAX(po.created_at) as last_created,
    GROUP_CONCAT(DISTINCT po.status) as statuses
FROM production_orders po
LEFT JOIN sales_orders so ON po.sales_order_id = so.id
WHERE po.sales_order_id IS NOT NULL
GROUP BY po.sales_order_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, so.order_number;

-- Step 2: Show Detailed View (Each Duplicate)
SELECT 
    '=== DETAILED DUPLICATE PRODUCTION ORDERS ===' as info;

SELECT 
    so.order_number as sales_order,
    po.production_number,
    po.id as order_id,
    po.status,
    po.created_at,
    po.updated_at,
    COUNT(*) OVER (PARTITION BY so.order_number) as total_for_sales_order
FROM production_orders po
LEFT JOIN sales_orders so ON po.sales_order_id = so.id
WHERE po.sales_order_id IN (
    SELECT sales_order_id 
    FROM production_orders 
    WHERE sales_order_id IS NOT NULL
    GROUP BY sales_order_id 
    HAVING COUNT(*) > 1
)
ORDER BY so.order_number, po.created_at;

-- Step 3: Summary Statistics
SELECT 
    '=== SUMMARY ===' as info;

SELECT 
    COUNT(DISTINCT po.sales_order_id) as sales_orders_with_duplicates,
    COUNT(*) - COUNT(DISTINCT po.sales_order_id) as total_extra_orders,
    MIN(CASE WHEN po.status = 'in_progress' THEN 1 ELSE 0 END) as have_in_progress,
    SUM(CASE WHEN po.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN po.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
FROM production_orders po
WHERE po.id IN (
    SELECT id FROM production_orders 
    WHERE sales_order_id IN (
        SELECT sales_order_id 
        FROM production_orders 
        WHERE sales_order_id IS NOT NULL
        GROUP BY sales_order_id 
        HAVING COUNT(*) > 1
    )
);

-- Step 4: Check if duplicates are blocking workflow
SELECT 
    '=== DUPLICATES BLOCKING WORKFLOW ===' as info;

SELECT 
    so.order_number,
    COUNT(*) as total_orders_for_sales_order,
    SUM(CASE WHEN po.status IN ('pending', 'in_progress') THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN po.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
    MAX(po.status) as last_status
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
HAVING active_count > 1
ORDER BY so.order_number;