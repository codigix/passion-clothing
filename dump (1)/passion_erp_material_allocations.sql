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
-- Table structure for table `material_allocations`
--

DROP TABLE IF EXISTS `material_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_allocations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_order_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `barcode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Barcode of the inventory item being allocated',
  `quantity_allocated` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Total quantity allocated from inventory',
  `quantity_consumed` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Quantity consumed in production',
  `quantity_returned` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Unused quantity returned to inventory',
  `quantity_wasted` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Quantity wasted/damaged during production',
  `allocation_date` datetime NOT NULL COMMENT 'When material was allocated to production',
  `allocated_by` int DEFAULT NULL COMMENT 'User who allocated the material',
  `current_stage_id` int DEFAULT NULL COMMENT 'Current production stage using this material',
  `consumption_log` json DEFAULT NULL COMMENT 'Array of consumption records: [{stage_id, stage_name, quantity, consumed_at, consumed_by, barcode_scan}]',
  `return_barcode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'New barcode generated for returned unused materials (INV-RET-YYYYMMDD-XXXXX)',
  `return_date` datetime DEFAULT NULL COMMENT 'When unused material was returned to inventory',
  `returned_by` int DEFAULT NULL COMMENT 'User who returned the material',
  `status` enum('allocated','in_use','consumed','partially_returned','fully_returned','wasted') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'allocated' COMMENT 'Current status of allocated material',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Additional notes about material usage',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `allocated_by` (`allocated_by`),
  KEY `returned_by` (`returned_by`),
  KEY `material_allocations_production_order_id` (`production_order_id`),
  KEY `material_allocations_inventory_id` (`inventory_id`),
  KEY `material_allocations_barcode` (`barcode`),
  KEY `material_allocations_current_stage_id` (`current_stage_id`),
  KEY `material_allocations_status` (`status`),
  KEY `material_allocations_return_barcode` (`return_barcode`),
  CONSTRAINT `material_allocations_ibfk_1` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `material_allocations_ibfk_2` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `material_allocations_ibfk_3` FOREIGN KEY (`allocated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `material_allocations_ibfk_4` FOREIGN KEY (`current_stage_id`) REFERENCES `production_stages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `material_allocations_ibfk_5` FOREIGN KEY (`returned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_allocations`
--

LOCK TABLES `material_allocations` WRITE;
/*!40000 ALTER TABLE `material_allocations` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_allocations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28 11:44:46
