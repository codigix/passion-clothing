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
-- Table structure for table `stage_operations`
--

DROP TABLE IF EXISTS `stage_operations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stage_operations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_stage_id` int NOT NULL,
  `operation_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `operation_order` int NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','in_progress','completed','skipped','failed','outsourced','received') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `quantity_processed` int DEFAULT '0',
  `quantity_approved` int DEFAULT '0',
  `quantity_rejected` int DEFAULT '0',
  `is_outsourced` tinyint(1) DEFAULT '0',
  `vendor_id` int DEFAULT NULL,
  `outsource_cost` decimal(10,2) DEFAULT NULL,
  `challan_id` int DEFAULT NULL,
  `return_challan_id` int DEFAULT NULL,
  `outsourcing_cost` decimal(10,2) DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `photos` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `work_order_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unique work order number for vendor tracking',
  `expected_completion_date` datetime DEFAULT NULL COMMENT 'Expected date for vendor to complete work',
  `actual_completion_date` datetime DEFAULT NULL COMMENT 'Actual date when work was received from vendor',
  `design_files` json DEFAULT NULL COMMENT 'Array of design file URLs and metadata',
  `vendor_remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Communication notes with vendor',
  `outsourced_at` datetime DEFAULT NULL COMMENT 'Timestamp when sent to vendor',
  `received_at` datetime DEFAULT NULL COMMENT 'Timestamp when received from vendor',
  `machine_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Machine or equipment used',
  PRIMARY KEY (`id`),
  KEY `challan_id` (`challan_id`),
  KEY `return_challan_id` (`return_challan_id`),
  KEY `stage_operations_production_stage_id` (`production_stage_id`),
  KEY `stage_operations_status` (`status`),
  KEY `stage_operations_assigned_to` (`assigned_to`),
  KEY `stage_operations_operation_order` (`operation_order`),
  KEY `stage_operations_is_outsourced` (`is_outsourced`),
  KEY `stage_operations_vendor_id` (`vendor_id`),
  KEY `idx_work_order_number` (`work_order_number`),
  KEY `idx_expected_completion` (`expected_completion_date`),
  KEY `stage_operations_work_order_number` (`work_order_number`),
  CONSTRAINT `stage_operations_ibfk_1` FOREIGN KEY (`production_stage_id`) REFERENCES `production_stages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stage_operations_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  CONSTRAINT `stage_operations_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`),
  CONSTRAINT `stage_operations_ibfk_4` FOREIGN KEY (`challan_id`) REFERENCES `challans` (`id`),
  CONSTRAINT `stage_operations_ibfk_5` FOREIGN KEY (`return_challan_id`) REFERENCES `challans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stage_operations`
--

LOCK TABLES `stage_operations` WRITE;
/*!40000 ALTER TABLE `stage_operations` DISABLE KEYS */;
/*!40000 ALTER TABLE `stage_operations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 17:04:18
