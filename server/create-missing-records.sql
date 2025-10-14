-- ============================================================================
-- Create Missing Records for Material Flow NULL Fields Fix
-- ============================================================================
-- This script creates the missing Product and Sales Order records
-- After running this, execute: node fix-all-material-flow-nulls.js
-- ============================================================================

USE passion_erp;

-- Step 1: Create the Product "Formal Shirt"
-- ============================================================================
INSERT INTO products (
  product_code,
  name,
  description,
  category,              -- ENUM: shirt (matches the product type)
  product_type,          -- ENUM: finished_goods
  unit_of_measurement,   -- ENUM: piece
  status,
  created_by,
  created_at,
  updated_at
) VALUES (
  'PRD-FORMAL-SHIRT-001',
  'Formal Shirt',
  'Formal Shirt - Men\'s wear',
  'shirt',              -- Valid ENUM value for shirt category
  'finished_goods',     -- Valid ENUM value for finished product
  'piece',              -- Valid ENUM value for unit
  'active',
  1,                    -- System user
  NOW(),
  NOW()
);

-- Verify product was created
SELECT 
  id, 
  product_code, 
  name, 
  category, 
  product_type, 
  unit_of_measurement, 
  status 
FROM products 
WHERE name = 'Formal Shirt';

-- Step 2: Get customer ID for "nitin kamble"
-- ============================================================================
SELECT 
  id, 
  name, 
  email,
  customer_type,
  status
FROM customers 
WHERE name LIKE '%nitin kamble%';

-- Note: If no customer found, create one:
-- INSERT INTO customers (customer_code, name, customer_type, status, payment_terms, created_by, created_at, updated_at)
-- VALUES ('CUST-NITIN-001', 'nitin kamble', 'regular', 'active', 'Net 30', 1, NOW(), NOW());

-- Step 3: Create Sales Order "SO-SO-20251012-0001"
-- ============================================================================
-- NOTE: Replace <CUSTOMER_ID> with the ID from Step 2 above
-- If customer doesn't exist, create it first using the INSERT above

SET @customer_id = (SELECT id FROM customers WHERE name LIKE '%nitin kamble%' LIMIT 1);
SET @product_id = (SELECT id FROM products WHERE name = 'Formal Shirt' LIMIT 1);

INSERT INTO sales_orders (
  order_number,
  customer_id,
  product_id,
  product_name,
  order_date,
  delivery_date,
  order_type,            -- ENUM: Woven (common for formal shirts)
  items,                 -- JSON array (required field)
  total_quantity,
  total_amount,
  discount_percentage,
  discount_amount,
  tax_percentage,
  tax_amount,
  final_amount,
  status,
  priority,
  approval_status,
  invoice_status,
  challan_status,
  procurement_status,
  created_by,
  created_at,
  updated_at
) VALUES (
  'SO-SO-20251012-0001',
  @customer_id,
  @product_id,
  'Formal Shirt',
  '2025-10-12',
  '2025-11-12',
  'Woven',               -- Valid ENUM: Knitted, Woven, Embroidery, Printing
  JSON_ARRAY(
    JSON_OBJECT(
      'product_id', @product_id,
      'product_name', 'Formal Shirt',
      'quantity', 1000,
      'unit', 'pieces',
      'unit_price', 0,
      'total_price', 0
    )
  ),
  1000,                  -- total_quantity
  0,                     -- total_amount
  0,                     -- discount_percentage
  0,                     -- discount_amount
  0,                     -- tax_percentage
  0,                     -- tax_amount
  0,                     -- final_amount
  'confirmed',           -- status
  'medium',              -- priority
  'not_requested',       -- approval_status
  'pending',             -- invoice_status
  'pending',             -- challan_status
  'not_requested',       -- procurement_status
  1,                     -- created_by (system)
  NOW(),
  NOW()
);

-- Verify sales order was created
SELECT 
  id,
  order_number,
  customer_id,
  product_id,
  product_name,
  order_type,
  total_quantity,
  status,
  priority
FROM sales_orders 
WHERE order_number = 'SO-SO-20251012-0001';

-- ============================================================================
-- NEXT STEPS:
-- ============================================================================
-- 1. Run this SQL script in your MySQL client or via command line:
--    mysql -u root -p passion_erp < create-missing-records.sql
--
-- 2. Then run the migration script to link all material flow records:
--    cd server
--    node fix-all-material-flow-nulls.js
--
-- 3. Verify the results:
--    node verify-material-flow-data.js
--
-- Expected Result:
-- ✅ All material flow records will have:
--    - product_id: (ID from products table)
--    - product_name: "Formal Shirt"
--    - sales_order_id: (ID from sales_orders table - for MRN only)
-- ============================================================================

-- ============================================================================
-- VERIFICATION QUERIES:
-- ============================================================================

-- Check all material flow records before migration
SELECT 'MRN' as table_name, request_number as number, project_name, product_id, product_name, sales_order_id
FROM project_material_requests
WHERE project_name = 'SO-SO-20251012-0001'
UNION ALL
SELECT 'Dispatch', dispatch_number, project_name, product_id, product_name, NULL
FROM material_dispatches
WHERE project_name = 'SO-SO-20251012-0001'
UNION ALL
SELECT 'Receipt', receipt_number, project_name, product_id, product_name, NULL
FROM material_receipts
WHERE project_name = 'SO-SO-20251012-0001'
UNION ALL
SELECT 'Verification', verification_number, project_name, product_id, product_name, NULL
FROM material_verifications
WHERE project_name = 'SO-SO-20251012-0001'
UNION ALL
SELECT 'Approval', approval_number, project_name, product_id, product_name, NULL
FROM production_approvals
WHERE project_name = 'SO-SO-20251012-0001';

-- ============================================================================
-- CLEANUP (if needed):
-- ============================================================================
-- If you need to remove the test records and try again:
--
-- DELETE FROM sales_orders WHERE order_number = 'SO-SO-20251012-0001';
-- DELETE FROM products WHERE product_code = 'PRD-FORMAL-SHIRT-001';
-- ============================================================================