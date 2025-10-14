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
-- Table structure for table `challans`
--

DROP TABLE IF EXISTS `challans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `challans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `challan_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: CHN-YYYYMMDD-XXXX',
  `type` enum('inward','outward','internal_transfer','sample_outward','sample_inward','return','dispatch','receipt') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sub_type` enum('purchase','sales','production','outsourcing','store_issue','store_return','sample','waste','adjustment') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` int DEFAULT NULL COMMENT 'Reference to sales_orders, purchase_orders, or production_orders',
  `order_type` enum('sales_order','purchase_order','production_order','sample_order') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `sample_id` int DEFAULT NULL,
  `inventory_id` int DEFAULT NULL,
  `store_stock_id` int DEFAULT NULL,
  `items` json NOT NULL COMMENT 'Array of items with product_id, quantity, rate, etc.',
  `total_quantity` int NOT NULL DEFAULT '0',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','pending','approved','rejected','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `internal_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Internal notes not visible on printed challan',
  `barcode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expected_date` datetime DEFAULT NULL,
  `actual_date` datetime DEFAULT NULL,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `department` enum('sales','procurement','manufacturing','outsourcing','inventory','shipment','store','finance','samples') COLLATE utf8mb4_unicode_ci NOT NULL,
  `location_from` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_to` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transport_details` json DEFAULT NULL COMMENT 'Transport mode, vehicle number, driver details, etc.',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `challan_number` (`challan_number`),
  KEY `order_id` (`order_id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `customer_id` (`customer_id`),
  KEY `sample_id` (`sample_id`),
  KEY `inventory_id` (`inventory_id`),
  KEY `store_stock_id` (`store_stock_id`),
  KEY `created_by` (`created_by`),
  KEY `approved_by` (`approved_by`),
  KEY `challans_status` (`status`),
  KEY `challans_type` (`type`),
  KEY `challans_department` (`department`),
  CONSTRAINT `challans_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `sales_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `challans_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `challans_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `challans_ibfk_4` FOREIGN KEY (`sample_id`) REFERENCES `samples` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `challans_ibfk_5` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `challans_ibfk_6` FOREIGN KEY (`store_stock_id`) REFERENCES `store_stock` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `challans_ibfk_7` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `challans_ibfk_8` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `challans`
--

LOCK TABLES `challans` WRITE;
/*!40000 ALTER TABLE `challans` DISABLE KEYS */;
INSERT INTO `challans` VALUES (1,'CHN-20251014-0449','outward','outsourcing',NULL,NULL,1,NULL,NULL,NULL,NULL,'\"[{\\\"product_name\\\":\\\"cotton\\\",\\\"quantity\\\":100,\\\"rate\\\":0,\\\"description\\\":\\\"dfdf\\\"}]\"',0,0.00,'completed','medium','dfdf',NULL,NULL,NULL,NULL,NULL,NULL,6,NULL,NULL,NULL,'manufacturing',NULL,NULL,'\"{\\\"mode\\\":\\\"sdd\\\",\\\"vehicle_number\\\":\\\"dfdf\\\"}\"','2025-10-14 17:45:26','2025-10-14 17:45:45'),(2,'CHN-20251014-0000','inward','outsourcing',NULL,NULL,1,NULL,NULL,NULL,NULL,'\"\\\"[{\\\\\\\"product_name\\\\\\\":\\\\\\\"cotton\\\\\\\",\\\\\\\"quantity\\\\\\\":100,\\\\\\\"rate\\\\\\\":0,\\\\\\\"description\\\\\\\":\\\\\\\"dfdf\\\\\\\"}]\\\"\"',0,0.00,'completed','medium',NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,NULL,NULL,NULL,'manufacturing',NULL,NULL,NULL,'2025-10-14 17:45:45','2025-10-14 17:45:45');
/*!40000 ALTER TABLE `challans` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14 23:25:25
