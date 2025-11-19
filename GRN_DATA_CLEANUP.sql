-- GRN Hierarchy Data Cleanup Script
-- Use this script to fix test data or reset workflow for a specific PO

-- Before running any DELETE commands, backup your database!
-- This script assumes you have identified the PO that needs cleanup

-- ===== DIAGNOSTIC QUERIES =====

-- 1. Find POs with GRN hierarchy issues
SELECT po.id, po.po_number, po.status, COUNT(grn.id) as grn_count,
       MIN(grn.is_first_grn) as min_is_first,
       MAX(grn.is_first_grn) as max_is_first
FROM purchase_orders po
LEFT JOIN goods_receipt_notes grn ON po.id = grn.purchase_order_id
GROUP BY po.id
HAVING COUNT(grn.id) > 1 AND (MIN(grn.is_first_grn) = MAX(grn.is_first_grn) AND MAX(grn.is_first_grn) = 1);

-- 2. Show GRN sequence issues for a specific PO
SELECT id, grn_number, grn_sequence, is_first_grn, created_at
FROM goods_receipt_notes
WHERE purchase_order_id = ? -- Replace ? with PO ID
ORDER BY created_at ASC;

-- 3. Check pending approvals for a PO
SELECT id, stage_key, status, created_at
FROM approvals
WHERE entity_id = ? -- Replace ? with PO ID
AND entity_type = 'purchase_order'
ORDER BY created_at DESC;

-- 4. Check vendor requests for a PO
SELECT id, request_number, request_type, status, created_at
FROM vendor_requests
WHERE purchase_order_id = ? -- Replace ? with PO ID
ORDER BY created_at DESC;

-- ===== CLEANUP OPERATIONS =====

-- OPTION 1: Fix GRN hierarchy flags (recommended if data is otherwise good)
-- This updates grn_sequence and is_first_grn based on creation order
UPDATE goods_receipt_notes
SET grn_sequence = 1, is_first_grn = true
WHERE purchase_order_id = ? -- Replace ? with PO ID
AND created_at = (
  SELECT MIN(created_at) 
  FROM goods_receipt_notes 
  WHERE purchase_order_id = ?
);

-- For all subsequent GRNs, set correct sequence
UPDATE goods_receipt_notes grn
SET grn_sequence = (
  SELECT COUNT(*) + 1
  FROM goods_receipt_notes grn2
  WHERE grn2.purchase_order_id = grn.purchase_order_id
  AND grn2.created_at < grn.created_at
),
is_first_grn = false
WHERE purchase_order_id = ?
AND created_at > (
  SELECT MIN(created_at)
  FROM goods_receipt_notes
  WHERE purchase_order_id = ?
);

-- OPTION 2: Complete reset - Delete all GRNs for a PO (use with caution!)
-- This completely clears out test data for a fresh start

-- Step 1: Identify GRNs to delete
SELECT id, grn_number FROM goods_receipt_notes WHERE purchase_order_id = ?;

-- Step 2: Delete vendor requests linked to these GRNs (with backup)
DELETE FROM vendor_requests
WHERE grn_id IN (
  SELECT id FROM goods_receipt_notes WHERE purchase_order_id = ?
);

-- Step 3: Delete GRNs
DELETE FROM goods_receipt_notes WHERE purchase_order_id = ?;

-- Step 4: Reset PO status
UPDATE purchase_orders
SET status = 'grn_requested', received_date = NULL
WHERE id = ?;

-- Step 5: Clean up approvals (optional - keeps audit trail if not deleted)
-- DELETE FROM approvals WHERE entity_id = ? AND entity_type = 'purchase_order';

-- ===== VERIFICATION QUERIES =====

-- After cleanup, verify the changes
SELECT 'PO Status' as check_type, status as value
FROM purchase_orders
WHERE id = ?
UNION ALL
SELECT 'GRN Count', CAST(COUNT(*) as CHAR)
FROM goods_receipt_notes
WHERE purchase_order_id = ?
UNION ALL
SELECT 'Pending Complaints', CAST(COUNT(*) as CHAR)
FROM approvals
WHERE entity_id = ? AND entity_type = 'purchase_order' AND status = 'pending'
UNION ALL
SELECT 'Vendor Requests', CAST(COUNT(*) as CHAR)
FROM vendor_requests
WHERE purchase_order_id = ?;

-- ===== WORKFLOW RESET =====

-- To completely reset a PO workflow back to initial state:
-- 1. Clear old GRN data:
DELETE FROM goods_receipt_notes 
WHERE purchase_order_id = ?;

-- 2. Clear old approvals/complaints (optional):
DELETE FROM approvals 
WHERE entity_id = ? 
AND entity_type = 'purchase_order' 
AND stage_key IN ('grn_shortage_complaint', 'grn_overage_complaint');

-- 3. Clear vendor requests:
DELETE FROM vendor_requests 
WHERE purchase_order_id = ?;

-- 4. Reset PO to initial GRN state:
UPDATE purchase_orders 
SET status = 'grn_requested', 
    received_date = NULL 
WHERE id = ?;

-- 5. Clear vendor returns if any:
DELETE FROM vendor_returns 
WHERE purchase_order_id = ?;

-- ===== NOTES =====
-- - Always backup your database before running DELETE statements
-- - Replace all ? placeholders with actual PO ID values
-- - The grn_sequence and is_first_grn auto-correction preserves existing data
-- - The complete reset clears all related records and restarts the workflow
-- - For production environments, test on a copy first!
