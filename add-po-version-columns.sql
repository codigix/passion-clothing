-- Add missing columns to purchase_orders table
-- Note: MySQL doesn't support ADD COLUMN IF NOT EXISTS in ALTER TABLE directly
-- So we check each column individually

-- Check and add version_number
SELECT IF (
  EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'passion_erp' 
    AND TABLE_NAME = 'purchase_orders' 
    AND COLUMN_NAME = 'version_number'
  ),
  'Column version_number already exists',
  'Need to add version_number'
) AS status;

-- Add columns using raw ALTER statements (will fail silently if they exist)
ALTER TABLE purchase_orders ADD COLUMN version_number INT DEFAULT 1 COMMENT 'Current version number of the PO';
ALTER TABLE purchase_orders ADD COLUMN change_history JSON COMMENT 'Array of all changes made to the PO';
ALTER TABLE purchase_orders ADD COLUMN last_edited_by INT COMMENT 'User ID of person who last edited the PO';
ALTER TABLE purchase_orders ADD COLUMN last_edited_at DATETIME COMMENT 'Timestamp of last edit';
ALTER TABLE purchase_orders ADD COLUMN requires_reapproval BOOLEAN DEFAULT FALSE COMMENT 'Flag to indicate if PO requires re-approval';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_version_number ON purchase_orders (version_number);
CREATE INDEX IF NOT EXISTS idx_last_edited_at ON purchase_orders (last_edited_at);
CREATE INDEX IF NOT EXISTS idx_requires_reapproval ON purchase_orders (requires_reapproval);

SELECT 'All columns processed' as status;