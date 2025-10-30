-- ============================================================================
-- TRUNCATE ALL TABLES EXCEPT USERS
-- ============================================================================
-- This script safely truncates all business data tables while preserving:
-- - users (all user accounts)
-- - roles (system roles)
-- - permissions (system permissions)
-- - user_roles (user-role mappings)
-- - role_permissions (role-permission mappings)
-- - user_permissions (direct user permissions)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all tables in dependency order (children first, parents last)

-- Stage-level & Operation tables (deepest children)
TRUNCATE TABLE stage_operations;
TRUNCATE TABLE material_consumptions;
TRUNCATE TABLE quality_checkpoints;
TRUNCATE TABLE material_requirements;

-- Production & Manufacturing tables
TRUNCATE TABLE production_completions;
TRUNCATE TABLE production_approvals;
TRUNCATE TABLE production_stages;
TRUNCATE TABLE rejections;
TRUNCATE TABLE production_orders;
TRUNCATE TABLE production_requests;

-- Material & Inventory tables
TRUNCATE TABLE material_verification;
TRUNCATE TABLE material_receipt;
TRUNCATE TABLE material_dispatch;
TRUNCATE TABLE material_allocations;
TRUNCATE TABLE inventory_movements;
TRUNCATE TABLE project_material_requests;
TRUNCATE TABLE vendor_returns;
TRUNCATE TABLE inventory;
TRUNCATE TABLE bill_of_materials;

-- Goods Receipt & Quality
TRUNCATE TABLE goods_receipt_notes;

-- Shipment tables
TRUNCATE TABLE shipment_tracking;
TRUNCATE TABLE production_completions;

-- Sales & Procurement tables
TRUNCATE TABLE sales_order_history;
TRUNCATE TABLE challans;
TRUNCATE TABLE invoices;
TRUNCATE TABLE payments;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE sales_orders;

-- Master data tables
TRUNCATE TABLE samples;
TRUNCATE TABLE store_stocks;
TRUNCATE TABLE shipments;
TRUNCATE TABLE attendances;
TRUNCATE TABLE notifications;
TRUNCATE TABLE approvals;
TRUNCATE TABLE courier_agents;
TRUNCATE TABLE courier_partners;
TRUNCATE TABLE vendor_returns;
TRUNCATE TABLE customers;
TRUNCATE TABLE vendors;
TRUNCATE TABLE product_lifecycle_histories;
TRUNCATE TABLE product_lifecycles;
TRUNCATE TABLE products;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Display summary
SELECT 'Truncation Complete!' as Status;
SELECT 'All data has been cleared except:' as Info;
SELECT '✓ users' as PreservedTables;
SELECT '✓ roles' as PreservedTables;
SELECT '✓ permissions' as PreservedTables;
SELECT '✓ user_roles (user-role mappings)' as PreservedTables;
SELECT '✓ role_permissions (role-permission mappings)' as PreservedTables;
SELECT '✓ user_permissions (direct user permissions)' as PreservedTables;