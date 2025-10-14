-- ================================================================
-- COMPLETE DATABASE RESET - TRUNCATE ALL TABLES
-- ================================================================
-- ⚠️ WARNING: This will DELETE ALL DATA from ALL tables!
-- This action CANNOT be undone unless you have a backup!
-- ================================================================

-- Show current record counts before truncate
SELECT 'BEFORE TRUNCATE - Current Record Counts:' as '';
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL
SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL
SELECT 'production_requests', COUNT(*) FROM production_requests
UNION ALL
SELECT 'production_orders', COUNT(*) FROM production_orders
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'vendors', COUNT(*) FROM vendors;

-- ================================================================
-- PAUSE HERE: Review counts above. Press Ctrl+C to abort if needed
-- ================================================================

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all tables (in logical order)
-- ================================================================

-- Production & Manufacturing
TRUNCATE TABLE production_approvals;
TRUNCATE TABLE material_verifications;
TRUNCATE TABLE material_receipts;
TRUNCATE TABLE material_dispatches;
TRUNCATE TABLE production_stage_operations;
TRUNCATE TABLE production_stages;
TRUNCATE TABLE production_orders;
TRUNCATE TABLE production_requests;
TRUNCATE TABLE rejections;

-- Material Request Management
TRUNCATE TABLE material_request_materials;
TRUNCATE TABLE material_requests;

-- GRN & Procurement
TRUNCATE TABLE grn_verifications;
TRUNCATE TABLE grns;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE vendors;

-- Sales
TRUNCATE TABLE sales_order_items;
TRUNCATE TABLE sales_orders;
TRUNCATE TABLE customers;

-- Inventory & Products
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE project_materials;
TRUNCATE TABLE inventory;
TRUNCATE TABLE products;

-- Challans & Shipments
TRUNCATE TABLE challan_items;
TRUNCATE TABLE challans;
TRUNCATE TABLE shipments;

-- Outsourcing
TRUNCATE TABLE outsourcing_orders;

-- Store
TRUNCATE TABLE store_stock_movements;
TRUNCATE TABLE store_stock;

-- Finance
TRUNCATE TABLE payments;
TRUNCATE TABLE invoices;

-- Samples
TRUNCATE TABLE sample_order_items;
TRUNCATE TABLE sample_orders;

-- Notifications & Attendance
TRUNCATE TABLE notifications;
TRUNCATE TABLE attendance;

-- Users & Roles (BE CAREFUL - this deletes all user accounts!)
TRUNCATE TABLE user_roles;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- Show final counts (should all be 0)
-- ================================================================
SELECT 'AFTER TRUNCATE - All tables should show 0:' as '';
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL
SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL
SELECT 'production_requests', COUNT(*) FROM production_requests
UNION ALL
SELECT 'production_orders', COUNT(*) FROM production_orders
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'vendors', COUNT(*) FROM vendors;

SELECT '✅ DATABASE RESET COMPLETE - All tables truncated' as '';
SELECT '⚠️ Run seeders to create initial admin user and roles' as '';