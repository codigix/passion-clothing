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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,1,1,0,'Main Warehouse','BATCH-PO202510140001-001',NULL,0.00,100.00,600.00,0.00,0.00,0.00,200.00,20.00,500.00,50000.00,'2025-10-14 12:48:33','2025-10-27 07:30:17',NULL,NULL,'approved','new','Received from GRN: GRN-20251014-00001, PO: PO-20251014-0001','INV-20251014-B1C2E4','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251014-B1C2E4\",\"product_id\":1,\"location\":\"Main Warehouse\",\"quantity\":100,\"po_number\":\"PO-20251014-0001\",\"batch_number\":\"BATCH-PO202510140001-001\",\"generated_at\":\"2025-10-14T12:48:33.394Z\"}',1,NULL,0.00,'outward','2025-10-27 07:30:17',5,5,'2025-10-14 12:48:33','2025-10-27 07:30:17',1,'project_specific','PRD-1760446113384-337','cotton','Formal Shirt','fabric',NULL,'raw_material','meter','100',NULL,'blue',NULL,NULL,'{\"gsm\": \"180\", \"uom\": \"Meters\", \"width\": \"100\", \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251014-00001\"}',NULL,500.00,600.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(2,2,1,1,'Main Warehouse','BATCH-PO202510140001-002',NULL,0.00,10.00,1350.00,0.00,0.00,0.00,20.00,2.00,100.00,1000.00,'2025-10-14 12:48:33','2025-10-27 07:30:17',NULL,NULL,'approved','new','Received from GRN: GRN-20251014-00001, PO: PO-20251014-0001','INV-20251014-D6444B','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251014-D6444B\",\"product_id\":2,\"location\":\"Main Warehouse\",\"quantity\":10,\"po_number\":\"PO-20251014-0001\",\"batch_number\":\"BATCH-PO202510140001-002\",\"generated_at\":\"2025-10-14T12:48:33.422Z\"}',1,NULL,0.00,'outward','2025-10-27 07:30:17',5,5,'2025-10-14 12:48:33','2025-10-27 07:30:17',1,'project_specific','PRD-1760446113417-86','buttons','green color ','raw_material',NULL,'raw_material','piece',NULL,NULL,NULL,NULL,NULL,'{\"gsm\": null, \"uom\": \"Boxes\", \"width\": null, \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251014-00001\"}',NULL,100.00,120.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(3,1,2,0,'Main Warehouse','BATCH-PO202510150001-001',NULL,0.00,200.00,600.00,0.00,0.00,0.00,400.00,40.00,500.00,100000.00,'2025-10-15 06:31:00','2025-10-27 07:30:17',NULL,NULL,'approved','new','Received from GRN: GRN-20251015-00001, PO: PO-20251015-0001','INV-20251015-0636D8','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251015-0636D8\",\"product_id\":1,\"location\":\"Main Warehouse\",\"quantity\":200,\"po_number\":\"PO-20251015-0001\",\"batch_number\":\"BATCH-PO202510150001-001\",\"generated_at\":\"2025-10-15T06:31:00.777Z\"}',1,NULL,0.00,'outward','2025-10-27 07:30:17',5,5,'2025-10-15 06:31:00','2025-10-27 07:30:17',2,'project_specific','PRD-1760446113384-337','cotton','T-shirt printing','fabric',NULL,'raw_material','meter','100',NULL,'nevy blue',NULL,NULL,'{\"gsm\": \"180\", \"uom\": \"Meters\", \"width\": \"200\", \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251015-00001\"}',NULL,500.00,600.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(4,3,2,1,'Main Warehouse','BATCH-PO202510150001-002',NULL,0.00,10.00,1350.00,0.00,0.00,0.00,20.00,2.00,10.00,100.00,'2025-10-15 06:31:00','2025-10-27 07:30:17',NULL,NULL,'approved','new','Received from GRN: GRN-20251015-00001, PO: PO-20251015-0001','INV-20251015-FBE9EC','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251015-FBE9EC\",\"product_id\":3,\"location\":\"Main Warehouse\",\"quantity\":10,\"po_number\":\"PO-20251015-0001\",\"batch_number\":\"BATCH-PO202510150001-002\",\"generated_at\":\"2025-10-15T06:31:00.792Z\"}',1,NULL,0.00,'outward','2025-10-27 07:30:17',5,5,'2025-10-15 06:31:00','2025-10-27 07:30:17',2,'project_specific','PRD-1760509860788-286','button','nevy blue color buttons','raw_material',NULL,'raw_material','yard',NULL,NULL,NULL,NULL,NULL,'{\"gsm\": null, \"uom\": \"Yards\", \"width\": null, \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251015-00001\"}',NULL,10.00,12.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(5,1,3,0,'Main Warehouse','BATCH-PO202510160001-001',NULL,0.00,100.00,600.00,0.00,0.00,0.00,200.00,20.00,300.00,30000.00,'2025-10-16 12:53:40','2025-10-27 07:30:17',NULL,NULL,'approved','new','Received from GRN: GRN-20251016-00001, PO: PO-20251016-0001','INV-20251016-21D876','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251016-21D876\",\"product_id\":1,\"location\":\"Main Warehouse\",\"quantity\":100,\"po_number\":\"PO-20251016-0001\",\"batch_number\":\"BATCH-PO202510160001-001\",\"generated_at\":\"2025-10-16T12:53:40.045Z\"}',1,NULL,0.00,'outward','2025-10-27 07:30:17',5,5,'2025-10-16 12:53:40','2025-10-27 07:30:17',3,'project_specific','PRD-1760446113384-337','cotton','T-shirt printing','fabric',NULL,'raw_material','meter','100',NULL,'yellow',NULL,NULL,'{\"gsm\": \"180\", \"uom\": \"Meters\", \"width\": \"110\", \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251016-00001\"}',NULL,300.00,360.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(6,2,3,1,'Main Warehouse','BATCH-PO202510160001-002',NULL,0.00,660.00,1350.00,0.00,0.00,0.00,1320.00,132.00,2.00,1320.00,'2025-10-16 12:53:40','2025-10-27 07:30:17',NULL,NULL,'approved','new','Received from GRN: GRN-20251016-00001, PO: PO-20251016-0001','INV-20251016-AE2CAF','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251016-AE2CAF\",\"product_id\":2,\"location\":\"Main Warehouse\",\"quantity\":660,\"po_number\":\"PO-20251016-0001\",\"batch_number\":\"BATCH-PO202510160001-002\",\"generated_at\":\"2025-10-16T12:53:40.055Z\"}',1,NULL,0.00,'outward','2025-10-27 07:30:17',5,5,'2025-10-16 12:53:40','2025-10-27 07:30:17',3,'project_specific','PRD-1760446113417-86','buttons','detail buttons wit hdark yellow color ','raw_material',NULL,'raw_material','piece',NULL,NULL,NULL,NULL,NULL,'{\"gsm\": null, \"uom\": \"Pieces\", \"width\": null, \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251016-00001\"}',NULL,2.00,2.40,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(7,1,3,0,'Main Warehouse','BATCH-PO202510160001-001',NULL,0.00,100.00,600.00,0.00,0.00,0.00,200.00,20.00,300.00,30000.00,'2025-10-17 05:05:28','2025-10-27 07:30:17',NULL,NULL,'approved','new','Received from GRN: GRN-20251017-00001, PO: PO-20251016-0001','INV-20251017-D52B42','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251017-D52B42\",\"product_id\":1,\"location\":\"Main Warehouse\",\"quantity\":100,\"po_number\":\"PO-20251016-0001\",\"batch_number\":\"BATCH-PO202510160001-001\",\"generated_at\":\"2025-10-17T05:05:28.345Z\"}',1,NULL,0.00,'outward','2025-10-27 07:30:17',5,5,'2025-10-17 05:05:28','2025-10-27 07:30:17',3,'project_specific','PRD-1760446113384-337','cotton','T-shirt printing','fabric',NULL,'raw_material','meter','100',NULL,'yellow',NULL,NULL,'{\"gsm\": \"180\", \"uom\": \"Meters\", \"width\": \"110\", \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251017-00001\"}',NULL,300.00,360.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(8,2,3,1,'Main Warehouse','BATCH-PO202510160001-002',NULL,0.00,660.00,670.00,0.00,0.00,0.00,1320.00,132.00,2.00,1320.00,'2025-10-17 05:05:28','2025-10-27 07:30:17',NULL,NULL,'approved','new','Received from GRN: GRN-20251017-00001, PO: PO-20251016-0001','INV-20251017-FC353A','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251017-FC353A\",\"product_id\":2,\"location\":\"Main Warehouse\",\"quantity\":660,\"po_number\":\"PO-20251016-0001\",\"batch_number\":\"BATCH-PO202510160001-002\",\"generated_at\":\"2025-10-17T05:05:28.353Z\"}',1,NULL,0.00,'outward','2025-10-27 07:30:17',5,5,'2025-10-17 05:05:28','2025-10-27 07:30:17',3,'project_specific','PRD-1760446113417-86','buttons','detail buttons wit hdark yellow color ','raw_material',NULL,'raw_material','piece',NULL,NULL,NULL,NULL,NULL,'{\"gsm\": null, \"uom\": \"Pieces\", \"width\": null, \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251017-00001\"}',NULL,2.00,2.40,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(9,1,4,0,'Main Warehouse','BATCH-PO202510270001-001',NULL,0.00,100.00,600.00,0.00,0.00,0.00,200.00,20.00,499.97,49997.00,'2025-10-27 07:25:48','2025-10-27 07:30:17',NULL,NULL,'approved','new','Received from GRN: GRN-20251027-00001, PO: PO-20251027-0001','INV-20251027-EB7D62','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251027-EB7D62\",\"product_id\":1,\"location\":\"Main Warehouse\",\"quantity\":100,\"po_number\":\"PO-20251027-0001\",\"batch_number\":\"BATCH-PO202510270001-001\",\"generated_at\":\"2025-10-27T07:25:48.787Z\"}',1,NULL,0.00,'outward','2025-10-27 07:30:17',5,5,'2025-10-27 07:25:48','2025-10-27 07:30:17',2,'project_specific','PRD-1760446113384-337','cotton','T-shirt printing','fabric',NULL,'raw_material','meter','100',NULL,'yellow',NULL,NULL,'{\"gsm\": \"180\", \"uom\": \"Meters\", \"width\": \"110\", \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251027-00001\"}',NULL,499.97,599.96,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(10,3,4,1,'Main Warehouse','BATCH-PO202510270001-002',NULL,0.00,10.00,10.00,0.00,0.00,0.00,20.00,2.00,1000.00,10000.00,'2025-10-27 07:25:48','2025-10-27 07:30:17',NULL,NULL,'approved','new','Received from GRN: GRN-20251027-00001, PO: PO-20251027-0001','INV-20251027-141121','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251027-141121\",\"product_id\":3,\"location\":\"Main Warehouse\",\"quantity\":10,\"po_number\":\"PO-20251027-0001\",\"batch_number\":\"BATCH-PO202510270001-002\",\"generated_at\":\"2025-10-27T07:25:48.805Z\"}',1,NULL,0.00,'outward','2025-10-27 07:30:17',5,5,'2025-10-27 07:25:48','2025-10-27 07:30:17',2,'project_specific','PRD-1760509860788-286','button','sdhjdg sdsjdhg sjdsjdgsj','raw_material',NULL,'raw_material','piece',NULL,NULL,NULL,NULL,NULL,'{\"gsm\": null, \"uom\": \"Boxes\", \"width\": null, \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251027-00001\"}',NULL,1000.00,1200.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL),(11,4,4,2,'Main Warehouse','BATCH-PO202510270001-003',NULL,0.00,10.00,10.00,0.00,0.00,0.00,20.00,2.00,10.00,100.00,'2025-10-27 07:25:48','2025-10-27 07:30:17',NULL,NULL,'approved','new','Received from GRN: GRN-20251027-00001, PO: PO-20251027-0001','INV-20251027-01EDE1','{\"type\":\"INVENTORY\",\"id\":null,\"barcode\":\"INV-20251027-01EDE1\",\"product_id\":4,\"location\":\"Main Warehouse\",\"quantity\":10,\"po_number\":\"PO-20251027-0001\",\"batch_number\":\"BATCH-PO202510270001-003\",\"generated_at\":\"2025-10-27T07:25:48.816Z\"}',1,NULL,0.00,'outward','2025-10-27 07:30:17',5,5,'2025-10-27 07:25:48','2025-10-27 07:30:17',2,'project_specific','PRD-1761549948811-423','thread','sdsfes','raw_material',NULL,'raw_material','yard',NULL,NULL,NULL,NULL,NULL,'{\"gsm\": null, \"uom\": \"Yards\", \"width\": null, \"source\": \"grn_auto_verified\", \"grn_number\": \"GRN-20251027-00001\"}',NULL,10.00,12.00,0.00,0.00,NULL,NULL,0,0,NULL,NULL);
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

-- Dump completed on 2025-10-27 17:15:45
