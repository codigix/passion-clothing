-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: passion_erp
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `purchase_order_id` int DEFAULT NULL,
  `po_item_index` int DEFAULT NULL COMMENT 'Index of item in PO items array',
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Warehouse, rack, bin location',
  `batch_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_stock` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Current stock quantity (can be decimal for fabrics)',
  `initial_quantity` decimal(10,2) DEFAULT '0.00' COMMENT 'Initial quantity from PO',
  `consumed_quantity` decimal(10,2) DEFAULT '0.00' COMMENT 'Quantity consumed/used',
  `reserved_stock` decimal(10,2) DEFAULT '0.00' COMMENT 'Stock reserved for orders',
  `available_stock` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'current_stock - reserved_stock',
  `minimum_level` decimal(10,2) DEFAULT '0.00',
  `maximum_level` decimal(10,2) DEFAULT '0.00',
  `reorder_level` decimal(10,2) DEFAULT '0.00',
  `unit_cost` decimal(10,2) DEFAULT '0.00',
  `total_value` decimal(12,2) DEFAULT '0.00' COMMENT 'current_stock * unit_cost',
  `last_purchase_date` datetime DEFAULT NULL,
  `last_issue_date` datetime DEFAULT NULL,
  `expiry_date` datetime DEFAULT NULL,
  `manufacturing_date` datetime DEFAULT NULL,
  `quality_status` enum('approved','pending','rejected','quarantine') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'approved',
  `condition` enum('new','good','fair','damaged','obsolete') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'new',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `barcode` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_code` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `last_audit_date` datetime DEFAULT NULL,
  `audit_variance` decimal(10,2) DEFAULT '0.00' COMMENT 'Difference found during last audit',
  `movement_type` enum('inward','outward','transfer','adjustment') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Last movement type',
  `last_movement_date` datetime DEFAULT NULL,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `project_id` int DEFAULT NULL COMMENT 'Project this stock belongs to (null means general/extra stock)',
  `stock_type` enum('project_specific','general_extra','consignment','returned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general_extra' COMMENT 'Type of stock for better categorization and tracking',
  `product_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unique product code',
  `product_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Unnamed Product',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `category` enum('fabric','thread','button','zipper','elastic','lace','uniform','shirt','trouser','skirt','blazer','tie','belt','shoes','socks','accessories','raw_material','finished_goods') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'raw_material',
  `sub_category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_type` enum('raw_material','semi_finished','finished_goods','accessory') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'raw_material',
  `unit_of_measurement` enum('piece','meter','yard','kg','gram','liter','dozen','set') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'piece',
  `hsn_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specifications` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT '0.00',
  `selling_price` decimal(10,2) DEFAULT '0.00',
  `mrp` decimal(10,2) DEFAULT '0.00',
  `tax_percentage` decimal(5,2) DEFAULT '0.00',
  `weight` decimal(8,3) DEFAULT NULL,
  `dimensions` json DEFAULT NULL,
  `is_serialized` tinyint(1) DEFAULT '0',
  `is_batch_tracked` tinyint(1) DEFAULT '0',
  `quality_parameters` json DEFAULT NULL,
  `sales_order_id` int DEFAULT NULL COMMENT 'Link to Sales Order (project)',
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `inventory_product_id` (`product_id`),
  KEY `inventory_location` (`location`),
  KEY `inventory_batch_number` (`batch_number`),
  KEY `inventory_serial_number` (`serial_number`),
  KEY `inventory_current_stock` (`current_stock`),
  KEY `inventory_available_stock` (`available_stock`),
  KEY `inventory_quality_status` (`quality_status`),
  KEY `inventory_condition` (`condition`),
  KEY `inventory_expiry_date` (`expiry_date`),
  KEY `inventory_is_active` (`is_active`),
  KEY `inventory_barcode` (`barcode`),
  KEY `inventory_product_id_location` (`product_id`,`location`),
  KEY `inventory_project_id` (`project_id`),
  KEY `inventory_stock_type` (`stock_type`),
  KEY `inventory_project_id_stock_type` (`project_id`,`stock_type`),
  KEY `inventory_product_code_idx` (`product_code`),
  KEY `inventory_product_name_idx` (`product_name`),
  KEY `inventory_category_idx` (`category`),
  KEY `inventory_sales_order_id_idx` (`sales_order_id`),
  KEY `inventory_purchase_order_id` (`purchase_order_id`),
  KEY `inventory_product_code` (`product_code`),
  KEY `inventory_product_name` (`product_name`),
  KEY `inventory_category` (`category`),
  KEY `inventory_sales_order_id` (`sales_order_id`),
  KEY `inventory_sales_order_id_stock_type` (`sales_order_id`,`stock_type`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inventory_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `inventory_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `inventory_project_id_foreign_idx` FOREIGN KEY (`project_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `inventory_sales_order_id_foreign_idx` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,1,1,0,'Main Warehouse','BATCH-PO202511140001-001',NULL,0.00,200.00,200.00,0.00,0.00,0.00,400.00,40.00,30.00,6000.00,'2025-11-14 10:39:46','2025-11-17 05:43:09',NULL,NULL,'approved','new','Received from GRN: GRN-20251114-00001, PO: PO-20251114-0001','INV-20251114-6D354D','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251114-6D354D\",\"product_id\":null,\"location\":\"Main Warehouse\",\"quantity\":200,\"po_number\":\"PO-20251114-0001\",\"batch_number\":\"BATCH-PO202511140001-001\",\"generated_at\":\"2025-11-14T10:39:46.622Z\"}',1,NULL,0.00,'outward','2025-11-17 05:43:09',6,6,'2025-11-14 10:39:46','2025-11-17 05:43:09',1,'project_specific','PRD-1763116786616-767','cotton','cotton','fabric',NULL,'raw_material','meter','5208',NULL,'blue',NULL,NULL,'{\"gsm\": \"200\", \"uom\": \"Meters\", \"width\": \"60\", \"source\": \"grn_received\", \"grn_number\": \"GRN-20251114-00001\"}',NULL,30.00,36.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(2,1,1,1,'Main Warehouse','BATCH-PO202511140001-002',NULL,0.00,200.00,200.00,0.00,0.00,0.00,400.00,40.00,30.00,6000.00,'2025-11-14 10:39:46','2025-11-17 05:43:09',NULL,NULL,'approved','new','Received from GRN: GRN-20251114-00001, PO: PO-20251114-0001','INV-20251114-C3FCFD','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251114-C3FCFD\",\"product_id\":null,\"location\":\"Main Warehouse\",\"quantity\":200,\"po_number\":\"PO-20251114-0001\",\"batch_number\":\"BATCH-PO202511140001-002\",\"generated_at\":\"2025-11-14T10:39:46.640Z\"}',1,NULL,0.00,'outward','2025-11-17 05:43:09',6,6,'2025-11-14 10:39:46','2025-11-17 05:43:09',1,'project_specific','PRD-1763116786616-767','cotton','cotton','fabric',NULL,'raw_material','meter','5208',NULL,'white ',NULL,NULL,'{\"gsm\": \"200\", \"uom\": \"Meters\", \"width\": \"60\", \"source\": \"grn_received\", \"grn_number\": \"GRN-20251114-00001\"}',NULL,30.00,36.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(3,2,3,0,'Main Warehouse','BATCH-PO202511170002-001',NULL,13.00,13.00,0.00,0.00,13.00,0.00,26.00,2.60,100.00,1300.00,'2025-11-19 12:17:30',NULL,NULL,NULL,'approved','new','Received from GRN: GRN-20251119-00001, PO: PO-20251117-0002','INV-20251119-A5B2B4','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251119-A5B2B4\",\"product_id\":null,\"location\":\"Main Warehouse\",\"quantity\":13,\"po_number\":\"PO-20251117-0002\",\"batch_number\":\"BATCH-PO202511170002-001\",\"generated_at\":\"2025-11-19T12:17:30.664Z\"}',1,NULL,0.00,'inward','2025-11-19 12:17:30',6,6,'2025-11-19 12:17:30','2025-11-19 12:17:30',1,'project_specific','PRD-1763554650653-575','button','button','raw_material',NULL,'raw_material','piece','5208',NULL,NULL,NULL,NULL,'{\"gsm\": null, \"uom\": \"Boxes\", \"width\": null, \"source\": \"grn_received\", \"grn_number\": \"GRN-20251119-00001\"}',NULL,100.00,120.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(4,2,3,0,'Main Warehouse','BATCH-PO202511170002-001',NULL,13.00,13.00,0.00,0.00,13.00,0.00,26.00,2.60,100.00,1300.00,'2025-11-19 12:17:42',NULL,NULL,NULL,'approved','new','Received from GRN: GRN-20251119-00001, PO: PO-20251117-0002','INV-20251119-C15A00','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251119-C15A00\",\"product_id\":2,\"location\":\"Main Warehouse\",\"quantity\":13,\"po_number\":\"PO-20251117-0002\",\"batch_number\":\"BATCH-PO202511170002-001\",\"generated_at\":\"2025-11-19T12:17:42.396Z\"}',1,NULL,0.00,'inward','2025-11-19 12:17:42',6,6,'2025-11-19 12:17:42','2025-11-19 12:17:42',1,'project_specific','PRD-1763554650653-575','button','button','raw_material',NULL,'raw_material','piece','5208',NULL,NULL,NULL,NULL,'{\"gsm\": null, \"uom\": \"Boxes\", \"width\": null, \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251119-00001\"}',NULL,100.00,120.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL);
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 17:04:11
