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
-- Table structure for table `rejections`
--

DROP TABLE IF EXISTS `rejections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rejections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_order_id` int NOT NULL,
  `stage_name` enum('material_allocation','cutting','embroidery','printing','stitching','finishing','ironing','packing','quality_check') COLLATE utf8mb4_unicode_ci NOT NULL,
  `rejected_quantity` int NOT NULL,
  `rejection_reason` enum('material_defect','cutting_error','stitching_defect','size_mismatch','color_variation','embroidery_defect','printing_defect','finishing_issue','measurement_error','quality_standard_not_met','damage','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `detailed_reason` text COLLATE utf8mb4_unicode_ci,
  `severity` enum('minor','major','critical') COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_taken` enum('rework','scrap','downgrade','return_to_vendor','pending') COLLATE utf8mb4_unicode_ci NOT NULL,
  `rework_cost` decimal(10,2) DEFAULT '0.00',
  `scrap_value` decimal(10,2) DEFAULT '0.00',
  `loss_amount` decimal(10,2) DEFAULT '0.00',
  `responsible_party` enum('internal','vendor','material_supplier','customer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `responsible_person` int DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  `images` json DEFAULT NULL COMMENT 'Array of image URLs showing the defect',
  `corrective_action` text COLLATE utf8mb4_unicode_ci,
  `preventive_action` text COLLATE utf8mb4_unicode_ci,
  `status` enum('open','in_progress','resolved','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `resolution_date` datetime DEFAULT NULL,
  `reported_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `responsible_person` (`responsible_person`),
  KEY `vendor_id` (`vendor_id`),
  KEY `approved_by` (`approved_by`),
  KEY `rejections_production_order_id` (`production_order_id`),
  KEY `rejections_stage_name` (`stage_name`),
  KEY `rejections_rejection_reason` (`rejection_reason`),
  KEY `rejections_severity` (`severity`),
  KEY `rejections_action_taken` (`action_taken`),
  KEY `rejections_responsible_party` (`responsible_party`),
  KEY `rejections_status` (`status`),
  KEY `rejections_reported_by` (`reported_by`),
  KEY `rejections_created_at` (`created_at`),
  CONSTRAINT `rejections_ibfk_1` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rejections_ibfk_2` FOREIGN KEY (`responsible_person`) REFERENCES `users` (`id`),
  CONSTRAINT `rejections_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`),
  CONSTRAINT `rejections_ibfk_4` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `rejections_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rejections`
--

LOCK TABLES `rejections` WRITE;
/*!40000 ALTER TABLE `rejections` DISABLE KEYS */;
/*!40000 ALTER TABLE `rejections` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14 23:25:23
