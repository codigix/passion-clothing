-- Fix: Make product_id optional in production_orders
-- 
-- Since materials are now fetched directly from Material Request Numbers (MRN) 
-- and Sales Orders, the product_id field should be optional.
--
-- Run this SQL script directly in your MySQL client:
-- mysql -u root -p passion_erp < fix-product-id-nullable.sql

ALTER TABLE production_orders 
MODIFY COLUMN product_id INT NULL 
COMMENT 'Product ID (optional - materials fetched from MRN/Sales Order instead)';

-- Verify the change
SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'production_orders' AND COLUMN_NAME = 'product_id';