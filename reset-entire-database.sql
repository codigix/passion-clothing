-- ⚠️  COMPLETE DATABASE RESET SCRIPT
-- 
-- THIS SCRIPT WILL DELETE ALL DATA FROM ALL TABLES
-- - Users: DELETED ✗
-- - All business data: DELETED ✗
-- - All configurations: DELETED ✗
-- - Everything is erased
-- 
-- ONLY USE IF YOU WANT A COMPLETELY FRESH DATABASE
-- 
-- Usage in MySQL Workbench:
--   1. Open this file
--   2. Review the warnings above
--   3. Create a backup first: mysqldump
--   4. Execute the script
--   5. Verify: Check admin user is gone
--
-- Usage via command line:
--   mysql -h host -u user -p password database < reset-entire-database.sql
-- 
-- Example:
--   mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
--         -u admin -p passion_erp < reset-entire-database.sql
-- 

SET FOREIGN_KEY_CHECKS=0;

-- Truncate all tables in order (child tables first, parent tables last)

-- Join tables
TRUNCATE TABLE `user_roles`;
TRUNCATE TABLE `role_permissions`;
TRUNCATE TABLE `user_permissions`;

-- Child tables (most dependent on others)
TRUNCATE TABLE `shipment_tracking`;
TRUNCATE TABLE `stage_operations`;
TRUNCATE TABLE `material_consumption`;
TRUNCATE TABLE `production_completion`;
TRUNCATE TABLE `quality_checkpoint`;
TRUNCATE TABLE `material_verification`;
TRUNCATE TABLE `material_receipt`;
TRUNCATE TABLE `material_dispatch`;
TRUNCATE TABLE `product_lifecycle_history`;
TRUNCATE TABLE `goods_receipt_note`;
TRUNCATE TABLE `inventory_movement`;
TRUNCATE TABLE `material_allocation`;
TRUNCATE TABLE `vendor_return`;
TRUNCATE TABLE `sales_order_history`;
TRUNCATE TABLE `production_request`;
TRUNCATE TABLE `material_requirement`;
TRUNCATE TABLE `project_material_request`;

-- Main transactional tables
TRUNCATE TABLE `rejection`;
TRUNCATE TABLE `production_stage`;
TRUNCATE TABLE `production_order`;
TRUNCATE TABLE `production_approval`;
TRUNCATE TABLE `approval`;
TRUNCATE TABLE `invoice`;
TRUNCATE TABLE `payment`;
TRUNCATE TABLE `purchase_order`;
TRUNCATE TABLE `sales_order`;
TRUNCATE TABLE `challan`;
TRUNCATE TABLE `shipment`;
TRUNCATE TABLE `store_stock`;
TRUNCATE TABLE `inventory`;
TRUNCATE TABLE `bill_of_materials`;
TRUNCATE TABLE `notification`;

-- Master data
TRUNCATE TABLE `sample`;
TRUNCATE TABLE `course_partner`;
TRUNCATE TABLE `courier_agent`;
TRUNCATE TABLE `product_lifecycle`;
TRUNCATE TABLE `product`;
TRUNCATE TABLE `attendance`;
TRUNCATE TABLE `customer`;
TRUNCATE TABLE `vendor`;

-- Core system tables (INCLUDING USERS!)
TRUNCATE TABLE `permission`;
TRUNCATE TABLE `role`;
TRUNCATE TABLE `user`;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Verification message
SELECT 'Complete database reset successful!' AS 'Status';
SELECT 'All tables have been truncated.' AS 'Result';
SELECT 'NEXT: Create admin user with: npm run seed' AS 'Next Steps';