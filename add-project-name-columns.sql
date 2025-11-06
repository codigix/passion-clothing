-- ============================================================
-- Migration: Add project_name columns to production_orders and shipments
-- Date: 2025-01-15
-- Purpose: Add human-friendly project names for dashboard display
-- ============================================================

-- Add project_name to production_orders table
ALTER TABLE production_orders 
ADD COLUMN project_name VARCHAR(200) 
COMMENT 'Human-friendly project name for dashboards and reports'
AFTER team_notes;

-- Add project_name to shipments table
ALTER TABLE shipments 
ADD COLUMN project_name VARCHAR(200) 
COMMENT 'Human-friendly project name for dashboards and reports'
AFTER created_by;

-- Create indexes for better performance on project_name lookups
CREATE INDEX idx_production_orders_project_name ON production_orders(project_name);
CREATE INDEX idx_shipments_project_name ON shipments(project_name);

-- Optional: Populate project_name from sales_orders for existing records
-- For production_orders
UPDATE production_orders po
SET po.project_name = (
  SELECT so.project_name 
  FROM sales_orders so 
  WHERE so.id = po.sales_order_id 
  LIMIT 1
)
WHERE po.project_name IS NULL 
AND po.sales_order_id IS NOT NULL;

-- For shipments
UPDATE shipments s
SET s.project_name = (
  SELECT so.project_name 
  FROM sales_orders so 
  WHERE so.id = s.sales_order_id 
  LIMIT 1
)
WHERE s.project_name IS NULL 
AND s.sales_order_id IS NOT NULL;

-- Verification: Check updated records
SELECT 
  'Production Orders' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN project_name IS NOT NULL THEN 1 ELSE 0 END) as with_project_name
FROM production_orders
UNION ALL
SELECT 
  'Shipments' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN project_name IS NOT NULL THEN 1 ELSE 0 END) as with_project_name
FROM shipments;