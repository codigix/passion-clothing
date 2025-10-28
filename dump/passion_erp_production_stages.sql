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
-- Table structure for table `production_stages`
--

DROP TABLE IF EXISTS `production_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_order_id` int NOT NULL,
  `stage_order` int NOT NULL COMMENT 'Order of this stage in the production process',
  `status` enum('pending','in_progress','completed','on_hold','skipped') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `planned_start_time` datetime DEFAULT NULL,
  `planned_end_time` datetime DEFAULT NULL,
  `actual_start_time` datetime DEFAULT NULL,
  `actual_end_time` datetime DEFAULT NULL,
  `planned_duration_hours` decimal(6,2) DEFAULT NULL,
  `actual_duration_hours` decimal(6,2) DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `machine_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Machine or workstation identifier',
  `quantity_processed` int DEFAULT '0',
  `quantity_approved` int DEFAULT '0',
  `quantity_rejected` int DEFAULT '0',
  `rejection_reasons` json DEFAULT NULL COMMENT 'Array of rejection reasons with quantities',
  `efficiency_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Efficiency calculated as (actual_time / planned_time) * 100',
  `delay_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `quality_parameters` json DEFAULT NULL COMMENT 'Quality check results for this stage',
  `material_consumption` json DEFAULT NULL COMMENT 'Materials consumed in this stage',
  `cost` decimal(10,2) DEFAULT '0.00',
  `outsourced` tinyint(1) DEFAULT '0',
  `vendor_id` int DEFAULT NULL,
  `outsource_cost` decimal(10,2) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `stage_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_printing` tinyint(1) DEFAULT '0' COMMENT 'Whether this stage involves printing',
  `is_embroidery` tinyint(1) DEFAULT '0' COMMENT 'Whether this stage involves embroidery',
  `customization_type` enum('none','printing','embroidery','both') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'none' COMMENT 'Type of customization for this stage',
  `start_date` datetime DEFAULT NULL COMMENT 'Start date of the stage',
  `end_date` datetime DEFAULT NULL COMMENT 'End date of the stage',
  `operations` json DEFAULT NULL COMMENT 'Array of operations for this stage',
  `outsource_type` enum('none','printing','embroidery','both') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'none' COMMENT 'Type of outsourcing for this stage',
  `outsource_dispatch_date` datetime DEFAULT NULL COMMENT 'Date when materials were dispatched to vendor',
  `outsource_return_date` datetime DEFAULT NULL COMMENT 'Expected/actual return date from vendor',
  `challan_id` int DEFAULT NULL COMMENT 'Challan for outsourced work',
  PRIMARY KEY (`id`),
  KEY `production_stages_production_order_id` (`production_order_id`),
  KEY `production_stages_status` (`status`),
  KEY `production_stages_assigned_to` (`assigned_to`),
  KEY `production_stages_stage_order` (`stage_order`),
  KEY `production_stages_planned_start_time` (`planned_start_time`),
  KEY `production_stages_actual_start_time` (`actual_start_time`),
  KEY `production_stages_outsourced` (`outsourced`),
  KEY `production_stages_vendor_id` (`vendor_id`),
  KEY `idx_production_stages_stage_name` (`stage_name`),
  KEY `production_stages_is_printing` (`is_printing`),
  KEY `production_stages_is_embroidery` (`is_embroidery`),
  KEY `production_stages_customization_type` (`customization_type`),
  KEY `production_stages_stage_name` (`stage_name`),
  KEY `production_stages_start_date` (`start_date`),
  KEY `production_stages_end_date` (`end_date`),
  KEY `production_stages_outsource_type` (`outsource_type`),
  KEY `production_stages_challan_id` (`challan_id`),
  CONSTRAINT `production_stages_challan_id_foreign_idx` FOREIGN KEY (`challan_id`) REFERENCES `challans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `production_stages_ibfk_1` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `production_stages_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `production_stages_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_stages`
--

LOCK TABLES `production_stages` WRITE;
/*!40000 ALTER TABLE `production_stages` DISABLE KEYS */;
INSERT INTO `production_stages` VALUES (13,3,1,'completed',NULL,NULL,'2025-10-15 04:40:00','2025-10-14 17:44:51',NULL,-10.92,NULL,NULL,0,0,0,NULL,NULL,NULL,'',NULL,NULL,0.00,0,NULL,NULL,'2025-10-14 13:42:13','2025-10-14 17:44:51','Calculate Material Review',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,3,2,'completed',NULL,NULL,'2025-10-14 17:44:55','2025-10-14 17:44:57',NULL,0.00,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,NULL,'2025-10-14 13:42:13','2025-10-14 17:44:57','Cutting',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,3,3,'completed',NULL,NULL,'2025-10-14 17:45:07','2025-10-14 17:45:50',NULL,0.01,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-14 13:42:13','2025-10-14 17:45:50','Embroidery or Printing',0,1,'embroidery',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,3,4,'completed',NULL,NULL,'2025-10-14 17:45:54','2025-10-14 17:45:56',NULL,0.00,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,NULL,'2025-10-14 13:42:13','2025-10-14 17:45:56','Stitching',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,3,5,'completed',NULL,NULL,'2025-10-14 17:45:59','2025-10-14 17:46:00',NULL,0.00,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,NULL,'2025-10-14 13:42:13','2025-10-14 17:46:00','Finishing',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,3,6,'completed',NULL,NULL,'2025-10-14 17:46:00','2025-10-14 17:51:00',NULL,0.09,NULL,NULL,0,0,0,NULL,NULL,NULL,'',NULL,NULL,0.00,0,NULL,NULL,'2025-10-14 13:42:13','2025-10-15 04:32:13','Quality Check',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(115,23,1,'completed',NULL,NULL,'2025-10-15 12:46:40','2025-10-27 08:30:45',NULL,283.73,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-15 12:46:40','2025-10-27 08:30:45','Calculate Material Review',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(116,23,2,'completed',NULL,NULL,'2025-10-16 12:02:15','2025-10-27 08:30:47',NULL,260.48,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-15 12:46:40','2025-10-27 08:30:47','Cutting',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(117,23,3,'completed',NULL,NULL,NULL,'2025-10-27 08:30:56',NULL,0.00,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-15 12:46:40','2025-10-27 08:30:56','Embroidery or Printing',0,1,'embroidery',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(118,23,4,'completed',NULL,NULL,NULL,'2025-10-27 08:30:59',NULL,0.00,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-15 12:46:40','2025-10-27 08:30:59','Stitching',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(119,23,5,'completed',NULL,NULL,NULL,'2025-10-27 08:31:04',NULL,0.00,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-15 12:46:40','2025-10-27 08:31:04','Finishing',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(120,23,6,'completed',NULL,NULL,NULL,'2025-10-27 08:31:09',NULL,0.00,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-15 12:46:40','2025-10-27 08:31:09','Quality Check',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(121,24,1,'in_progress',NULL,NULL,'2025-10-18 07:23:23',NULL,NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-18 07:23:23','2025-10-18 07:25:46','Calculate Material Review',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(122,24,2,'in_progress',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-18 07:23:23','2025-10-18 07:25:46','Cutting',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(123,24,3,'in_progress',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-18 07:23:23','2025-10-18 07:25:46','Embroidery or Printing',1,0,'printing',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(124,24,4,'in_progress',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-18 07:23:23','2025-10-18 07:25:47','Stitching',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(125,24,5,'in_progress',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-18 07:23:23','2025-10-18 07:25:47','Finishing',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(126,24,6,'in_progress',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-18 07:23:23','2025-10-18 07:25:47','Quality Check',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(127,25,1,'completed',NULL,NULL,'2025-10-18 08:07:06','2025-10-18 08:10:49',NULL,0.06,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,NULL,'2025-10-18 08:07:06','2025-10-18 08:10:49','Calculate Material Review',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(128,25,2,'completed',NULL,NULL,'2025-10-18 08:10:55','2025-10-18 08:11:30',NULL,0.01,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,NULL,'2025-10-18 08:07:06','2025-10-18 08:11:30','Cutting',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(129,25,3,'completed',NULL,NULL,'2025-10-18 08:11:56','2025-10-20 10:19:07',NULL,50.12,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-18 08:07:06','2025-10-20 10:19:07','Embroidery or Printing',1,0,'printing',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(130,25,4,'completed',NULL,NULL,'2025-10-18 08:12:13','2025-10-18 08:12:18',NULL,0.00,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,NULL,'2025-10-18 08:07:06','2025-10-18 08:12:18','Stitching',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(131,25,5,'completed',NULL,NULL,'2025-10-18 08:12:27','2025-10-18 08:12:30',NULL,0.00,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,NULL,'2025-10-18 08:07:06','2025-10-18 08:12:30','Finishing',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(132,25,6,'completed',NULL,NULL,'2025-10-18 08:12:33','2025-10-18 08:13:05',NULL,0.01,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,NULL,'2025-10-18 08:07:06','2025-10-18 08:13:05','Quality Check',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(133,26,1,'completed',NULL,NULL,'2025-10-27 08:24:00','2025-10-27 08:25:07',NULL,0.02,NULL,NULL,0,0,0,NULL,NULL,NULL,'',NULL,NULL,0.00,0,NULL,NULL,'2025-10-27 08:24:06','2025-10-27 08:25:07','Calculate Material Review',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(134,26,2,'completed',NULL,NULL,'2025-10-28 08:25:00','2025-10-27 08:25:27',NULL,-23.99,NULL,NULL,0,0,0,NULL,NULL,NULL,'',NULL,NULL,0.00,1,1,NULL,'2025-10-27 08:24:06','2025-10-27 08:25:27','Cutting',1,0,'printing',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(135,26,3,'completed',NULL,NULL,NULL,'2025-10-27 08:27:38',NULL,0.00,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,1,1,NULL,'2025-10-27 08:24:06','2025-10-27 08:27:38','Embroidery or Printing',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(136,26,4,'completed',NULL,NULL,'2025-10-27 08:27:00','2025-10-27 08:28:03',NULL,0.02,NULL,NULL,0,0,0,NULL,NULL,NULL,'',NULL,NULL,0.00,0,NULL,NULL,'2025-10-27 08:24:06','2025-10-27 08:28:03','Stitching',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(137,26,5,'completed',NULL,NULL,'2025-11-01 08:28:00','2025-10-27 08:28:55',NULL,-119.98,NULL,NULL,0,0,0,NULL,NULL,NULL,'',NULL,NULL,0.00,0,NULL,NULL,'2025-10-27 08:24:06','2025-10-27 08:28:55','Finishing',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(138,26,6,'completed',NULL,NULL,'2025-10-27 08:28:58','2025-10-27 08:29:11',NULL,0.00,NULL,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,NULL,'2025-10-27 08:24:06','2025-10-27 08:29:11','Quality Check',0,0,'none',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `production_stages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28 11:44:24
