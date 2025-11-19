-- ============================================================================
-- DATABASE FULL TRUNCATION SCRIPT
-- Truncates ALL tables and resets auto-increment values to 1
-- ============================================================================
-- WARNING: This will DELETE ALL DATA from the database
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all transactional tables first (no dependencies)
TRUNCATE TABLE shipment_trackings;
TRUNCATE TABLE stage_rework_histories;
TRUNCATE TABLE product_lifecycle_histories;
TRUNCATE TABLE sales_order_histories;
TRUNCATE TABLE stage_operations;
TRUNCATE TABLE quality_checkpoints;
TRUNCATE TABLE production_stages;
TRUNCATE TABLE material_consumptions;
TRUNCATE TABLE material_verifications;
TRUNCATE TABLE material_returns;
TRUNCATE TABLE material_dispatches;
TRUNCATE TABLE material_receipts;
TRUNCATE TABLE material_allocations;
TRUNCATE TABLE material_requirements;
TRUNCATE TABLE project_material_requests;
TRUNCATE TABLE inventory_movements;
TRUNCATE TABLE approvals;
TRUNCATE TABLE rejections;
TRUNCATE TABLE shipments;
TRUNCATE TABLE invoices;
TRUNCATE TABLE payments;
TRUNCATE TABLE attendances;
TRUNCATE TABLE notifications;

-- Truncate production & order related tables
TRUNCATE TABLE production_completions;
TRUNCATE TABLE production_approvals;
TRUNCATE TABLE production_requests;
TRUNCATE TABLE production_orders;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE sales_orders;
TRUNCATE TABLE bills_of_materials;
TRUNCATE TABLE product_lifecycles;

-- Truncate master data tables
TRUNCATE TABLE samples;
TRUNCATE TABLE store_stocks;
TRUNCATE TABLE inventory;
TRUNCATE TABLE products;
TRUNCATE TABLE vendor_returns;
TRUNCATE TABLE vendor_agents;
TRUNCATE TABLE courier_agents;
TRUNCATE TABLE vendors;
TRUNCATE TABLE customers;
TRUNCATE TABLE challans;
TRUNCATE TABLE goods_receipt_notes;

-- Truncate auth/system tables
TRUNCATE TABLE users;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;

-- Reset AUTO_INCREMENT for all tables
ALTER TABLE roles AUTO_INCREMENT = 1;
ALTER TABLE permissions AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE customers AUTO_INCREMENT = 1;
ALTER TABLE vendors AUTO_INCREMENT = 1;
ALTER TABLE courier_agents AUTO_INCREMENT = 1;
ALTER TABLE vendor_agents AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE inventory AUTO_INCREMENT = 1;
ALTER TABLE store_stocks AUTO_INCREMENT = 1;
ALTER TABLE challans AUTO_INCREMENT = 1;
ALTER TABLE sales_orders AUTO_INCREMENT = 1;
ALTER TABLE purchase_orders AUTO_INCREMENT = 1;
ALTER TABLE production_requests AUTO_INCREMENT = 1;
ALTER TABLE production_orders AUTO_INCREMENT = 1;
ALTER TABLE production_stages AUTO_INCREMENT = 1;
ALTER TABLE rejections AUTO_INCREMENT = 1;
ALTER TABLE shipments AUTO_INCREMENT = 1;
ALTER TABLE shipment_trackings AUTO_INCREMENT = 1;
ALTER TABLE invoices AUTO_INCREMENT = 1;
ALTER TABLE payments AUTO_INCREMENT = 1;
ALTER TABLE samples AUTO_INCREMENT = 1;
ALTER TABLE attendances AUTO_INCREMENT = 1;
ALTER TABLE material_receipts AUTO_INCREMENT = 1;
ALTER TABLE material_verifications AUTO_INCREMENT = 1;
ALTER TABLE material_dispatches AUTO_INCREMENT = 1;
ALTER TABLE material_allocations AUTO_INCREMENT = 1;
ALTER TABLE material_consumptions AUTO_INCREMENT = 1;
ALTER TABLE production_approvals AUTO_INCREMENT = 1;
ALTER TABLE approvals AUTO_INCREMENT = 1;
ALTER TABLE quality_checkpoints AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE stage_operations AUTO_INCREMENT = 1;
ALTER TABLE product_lifecycles AUTO_INCREMENT = 1;
ALTER TABLE material_returns AUTO_INCREMENT = 1;
ALTER TABLE material_requirements AUTO_INCREMENT = 1;
ALTER TABLE production_completions AUTO_INCREMENT = 1;
ALTER TABLE project_material_requests AUTO_INCREMENT = 1;
ALTER TABLE stage_rework_histories AUTO_INCREMENT = 1;
ALTER TABLE product_lifecycle_histories AUTO_INCREMENT = 1;
ALTER TABLE sales_order_histories AUTO_INCREMENT = 1;
ALTER TABLE vendor_returns AUTO_INCREMENT = 1;
ALTER TABLE bills_of_materials AUTO_INCREMENT = 1;
ALTER TABLE goods_receipt_notes AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- TRUNCATION COMPLETE
-- All tables have been emptied and auto-increments reset to 1
-- You can now add fresh data to the system
-- ============================================================================