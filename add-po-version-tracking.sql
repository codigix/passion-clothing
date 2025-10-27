-- ================================================
-- PO Version History & Edit Tracking
-- Migration: Add version tracking to purchase_orders table
-- Created: January 2025
-- ================================================

-- Step 1: Add version tracking columns
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS version_number INT DEFAULT 1 COMMENT 'Current version number of the PO';

ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS change_history JSON COMMENT 'Array of all changes made to the PO with timestamps and user details';

ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS last_edited_by INT COMMENT 'User ID of the person who last edited the PO';

ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS last_edited_at DATETIME COMMENT 'Timestamp of last edit';

ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS requires_reapproval BOOLEAN DEFAULT FALSE COMMENT 'Flag to indicate if PO requires re-approval after edits';

-- Step 2: Add foreign key for last_edited_by
ALTER TABLE purchase_orders 
ADD CONSTRAINT fk_po_last_edited_by 
FOREIGN KEY (last_edited_by) REFERENCES users(id) ON DELETE SET NULL;

-- Step 3: Create indexes for performance
CREATE INDEX idx_po_version_number ON purchase_orders(version_number);
CREATE INDEX idx_po_last_edited_at ON purchase_orders(last_edited_at);
CREATE INDEX idx_po_requires_reapproval ON purchase_orders(requires_reapproval);
CREATE INDEX idx_po_last_edited_by ON purchase_orders(last_edited_by);

-- Step 4: Update existing records to have version 1
UPDATE purchase_orders SET version_number = 1 WHERE version_number IS NULL;

-- Step 5: Initialize empty change_history for existing records
UPDATE purchase_orders SET change_history = JSON_ARRAY() WHERE change_history IS NULL;

-- Step 6: Verify the changes
SELECT 
    id,
    po_number,
    version_number,
    last_edited_by,
    last_edited_at,
    requires_reapproval,
    JSON_LENGTH(change_history) AS change_count
FROM purchase_orders
LIMIT 5;

-- ================================================
-- Rollback Script (if needed)
-- ================================================

-- -- Drop foreign key
-- ALTER TABLE purchase_orders DROP FOREIGN KEY fk_po_last_edited_by;

-- -- Drop indexes
-- DROP INDEX IF EXISTS idx_po_version_number ON purchase_orders;
-- DROP INDEX IF EXISTS idx_po_last_edited_at ON purchase_orders;
-- DROP INDEX IF EXISTS idx_po_requires_reapproval ON purchase_orders;
-- DROP INDEX IF EXISTS idx_po_last_edited_by ON purchase_orders;

-- -- Drop columns
-- ALTER TABLE purchase_orders DROP COLUMN version_number;
-- ALTER TABLE purchase_orders DROP COLUMN change_history;
-- ALTER TABLE purchase_orders DROP COLUMN last_edited_by;
-- ALTER TABLE purchase_orders DROP COLUMN last_edited_at;
-- ALTER TABLE purchase_orders DROP COLUMN requires_reapproval;

-- ================================================
-- Sample Data for Testing
-- ================================================

-- -- Insert sample change history for testing (optional)
-- UPDATE purchase_orders 
-- SET change_history = JSON_ARRAY(
--   JSON_OBJECT(
--     'timestamp', NOW(),
--     'changed_by', 1,
--     'changed_by_name', 'Test User',
--     'version_before', 0,
--     'version_after', 1,
--     'changes', JSON_OBJECT(
--       'items', JSON_OBJECT(
--         'old_count', 0,
--         'new_count', 3,
--         'items_added', 3
--       )
--     ),
--     'reason', 'Initial PO creation'
--   )
-- )
-- WHERE id = 1;

-- ================================================
-- Verification Queries
-- ================================================

-- Check if columns exist
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'purchase_orders'
AND COLUMN_NAME IN ('version_number', 'change_history', 'last_edited_by', 'last_edited_at', 'requires_reapproval');

-- Check indexes
SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_NAME = 'purchase_orders'
AND INDEX_NAME LIKE 'idx_po_%'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- Check for any POs requiring re-approval
SELECT 
    id,
    po_number,
    status,
    version_number,
    requires_reapproval,
    last_edited_at,
    last_edited_by
FROM purchase_orders
WHERE requires_reapproval = TRUE
ORDER BY last_edited_at DESC;

-- Check version distribution
SELECT 
    version_number,
    COUNT(*) as count,
    MAX(last_edited_at) as last_edited
FROM purchase_orders
GROUP BY version_number
ORDER BY version_number;

-- ================================================
-- Notes
-- ================================================
-- 1. Run this script once on production database
-- 2. All changes are backward compatible
-- 3. Existing POs will have version_number = 1
-- 4. New edits will increment version_number
-- 5. Change history is stored in JSON format for flexibility
-- 6. Indexes ensure good query performance for version tracking
-- 7. To verify: Run the verification queries at the end