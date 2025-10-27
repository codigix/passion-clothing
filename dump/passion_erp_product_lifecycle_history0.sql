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
-- Table structure for table `product_lifecycle_history`
--

DROP TABLE IF EXISTS `product_lifecycle_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_lifecycle_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_lifecycle_id` int NOT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Product barcode for quick reference',
  `stage_from` enum('created','material_allocated','in_production','cutting','embroidery','printing','stitching','finishing','ironing','quality_check','packing','ready_for_dispatch','dispatched','in_transit','delivered','returned','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Previous stage (null for initial creation)',
  `stage_to` enum('created','material_allocated','in_production','cutting','embroidery','printing','stitching','finishing','ironing','quality_check','packing','ready_for_dispatch','dispatched','in_transit','delivered','returned','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'New stage',
  `status_from` enum('active','on_hold','completed','cancelled','returned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_to` enum('active','on_hold','completed','cancelled','returned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transition_time` datetime NOT NULL,
  `duration_in_previous_stage_hours` decimal(8,2) DEFAULT NULL COMMENT 'Time spent in the previous stage',
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Location where transition occurred',
  `machine_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Machine or workstation where transition occurred',
  `operator_id` int DEFAULT NULL COMMENT 'User who performed the operation',
  `quantity_processed` int DEFAULT NULL COMMENT 'Quantity processed in this transition',
  `quantity_approved` int DEFAULT NULL COMMENT 'Quantity approved in quality check',
  `quantity_rejected` int DEFAULT NULL COMMENT 'Quantity rejected in quality check',
  `rejection_reasons` json DEFAULT NULL COMMENT 'Reasons for rejection with details',
  `quality_parameters` json DEFAULT NULL COMMENT 'Quality check results',
  `cost_incurred` decimal(10,2) DEFAULT '0.00' COMMENT 'Cost incurred in this stage',
  `materials_consumed` json DEFAULT NULL COMMENT 'Materials consumed in this stage',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Additional notes for this transition',
  `images` json DEFAULT NULL COMMENT 'Images captured during this stage',
  `scan_data` json DEFAULT NULL COMMENT 'Barcode scan data and metadata',
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_lifecycle_history_product_lifecycle_id` (`product_lifecycle_id`),
  KEY `product_lifecycle_history_barcode` (`barcode`),
  KEY `product_lifecycle_history_stage_to` (`stage_to`),
  KEY `product_lifecycle_history_transition_time` (`transition_time`),
  KEY `product_lifecycle_history_operator_id` (`operator_id`),
  KEY `product_lifecycle_history_created_by` (`created_by`),
  KEY `product_lifecycle_history_location` (`location`),
  KEY `product_lifecycle_history_machine_id` (`machine_id`),
  CONSTRAINT `product_lifecycle_history_ibfk_1` FOREIGN KEY (`product_lifecycle_id`) REFERENCES `product_lifecycle` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_lifecycle_history_ibfk_2` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_lifecycle_history_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_lifecycle_history`
--

LOCK TABLES `product_lifecycle_history` WRITE;
/*!40000 ALTER TABLE `product_lifecycle_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_lifecycle_history` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-27 17:16:57
