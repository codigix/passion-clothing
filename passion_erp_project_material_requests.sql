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
-- Table structure for table `project_material_requests`
--

DROP TABLE IF EXISTS `project_material_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_material_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: PMR-YYYYMMDD-XXXXX',
  `purchase_order_id` int DEFAULT NULL,
  `sales_order_id` int DEFAULT NULL,
  `project_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Project name from the PO',
  `requesting_department` enum('manufacturing','procurement') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manufacturing' COMMENT 'Department that originated the request',
  `request_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date when the request was created',
  `required_by_date` datetime DEFAULT NULL COMMENT 'Date by when materials are required (for manufacturing requests)',
  `expected_delivery_date` datetime DEFAULT NULL COMMENT 'Expected delivery date from vendor',
  `materials_requested` json NOT NULL COMMENT 'Array of materials: material_name, color, hsn, gsm, width, uom, quantity, rate, total, description',
  `total_items` int NOT NULL DEFAULT '0' COMMENT 'Total number of material items',
  `total_value` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Total value of all materials',
  `status` enum('pending','pending_inventory_review','reviewed','forwarded_to_inventory','stock_checking','stock_available','partial_available','partially_issued','issued','stock_unavailable','pending_procurement','materials_reserved','materials_ready','materials_issued','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'Current status of the material request',
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium' COMMENT 'Priority level of the request',
  `stock_availability` json DEFAULT NULL COMMENT 'Stock availability details: material_name, requested_qty, available_qty, shortage_qty, status',
  `reserved_inventory_ids` json DEFAULT NULL COMMENT 'Array of inventory IDs reserved for this project',
  `triggered_procurement_ids` json DEFAULT NULL COMMENT 'Array of auto-generated procurement request IDs for unavailable materials',
  `procurement_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes from procurement team',
  `manufacturing_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes from manufacturing team',
  `inventory_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes from inventory team',
  `attachments` json DEFAULT NULL COMMENT 'Array of attachment files: filename, url, uploaded_at',
  `created_by` int NOT NULL,
  `reviewed_by` int DEFAULT NULL COMMENT 'Manufacturing user who reviewed the request',
  `reviewed_at` datetime DEFAULT NULL COMMENT 'Date when manufacturing reviewed the request',
  `forwarded_by` int DEFAULT NULL COMMENT 'Manufacturing user who forwarded to inventory',
  `forwarded_at` datetime DEFAULT NULL COMMENT 'Date when forwarded to inventory',
  `processed_by` int DEFAULT NULL COMMENT 'Inventory user who processed the request',
  `processed_at` datetime DEFAULT NULL COMMENT 'Date when inventory processed the request',
  `completed_at` datetime DEFAULT NULL COMMENT 'Date when request was completed',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `product_id` int DEFAULT NULL COMMENT 'Final product being manufactured',
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Product name for quick reference',
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_number` (`request_number`),
  KEY `idx_request_number` (`request_number`),
  KEY `idx_purchase_order_id` (`purchase_order_id`),
  KEY `idx_sales_order_id` (`sales_order_id`),
  KEY `idx_project_name` (`project_name`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_request_date` (`request_date`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_reviewed_by` (`reviewed_by`),
  KEY `idx_forwarded_by` (`forwarded_by`),
  KEY `idx_processed_by` (`processed_by`),
  KEY `idx_project_material_requests_product_id` (`product_id`),
  KEY `project_material_requests_request_number` (`request_number`),
  KEY `project_material_requests_purchase_order_id` (`purchase_order_id`),
  KEY `project_material_requests_sales_order_id` (`sales_order_id`),
  KEY `project_material_requests_product_id` (`product_id`),
  KEY `project_material_requests_project_name` (`project_name`),
  KEY `project_material_requests_status` (`status`),
  KEY `project_material_requests_priority` (`priority`),
  KEY `project_material_requests_request_date` (`request_date`),
  KEY `project_material_requests_created_by` (`created_by`),
  KEY `project_material_requests_reviewed_by` (`reviewed_by`),
  KEY `project_material_requests_forwarded_by` (`forwarded_by`),
  KEY `project_material_requests_processed_by` (`processed_by`),
  CONSTRAINT `project_material_requests_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_material_requests_ibfk_2` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `project_material_requests_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `project_material_requests_ibfk_4` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `project_material_requests_ibfk_5` FOREIGN KEY (`forwarded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `project_material_requests_ibfk_6` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `project_material_requests_ibfk_7` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`),
  CONSTRAINT `project_material_requests_product_id_foreign_idx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_material_requests`
--

LOCK TABLES `project_material_requests` WRITE;
/*!40000 ALTER TABLE `project_material_requests` DISABLE KEYS */;
INSERT INTO `project_material_requests` VALUES (1,'MRN-SOS2025-001',NULL,1,'SO-SO-20251014-0001','manufacturing','2025-10-14 12:51:42','2025-10-30 00:00:00',NULL,'[{\"uom\": \"PCS\", \"status\": \"pending\", \"purpose\": \"\", \"remarks\": \"\", \"issued_qty\": 0, \"balance_qty\": 100, \"description\": \"Formal Shirt\", \"available_qty\": 0, \"material_code\": \"\", \"material_name\": \"cotton plain \", \"quantity_required\": 100}, {\"uom\": \"PCS\", \"status\": \"pending\", \"purpose\": \"\", \"remarks\": \"\", \"issued_qty\": 0, \"balance_qty\": 4, \"description\": \"\", \"available_qty\": 0, \"material_code\": \"\", \"material_name\": \"Button\", \"quantity_required\": 4}]',2,0.00,'completed','medium',NULL,NULL,NULL,NULL,'Materials needed for PRQ-20251014-00001 - Formal Shirt\nProduct: Formal Shirt (100 pcs)\nCustomer: nitin kamble\nQuantity: 100.000 pcs',NULL,'[]',6,NULL,NULL,NULL,NULL,5,'2025-10-14 12:52:12','2025-10-14 12:52:50','2025-10-14 12:51:42','2025-10-14 13:42:13',NULL,NULL);
/*!40000 ALTER TABLE `project_material_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14 23:23:12
