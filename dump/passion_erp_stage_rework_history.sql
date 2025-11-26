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
-- Table structure for table `stage_rework_history`
--

DROP TABLE IF EXISTS `stage_rework_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stage_rework_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_stage_id` int NOT NULL,
  `iteration_number` int NOT NULL COMMENT 'Which rework iteration (1=original, 2=first rework, etc.)',
  `failure_reason` text NOT NULL COMMENT 'Why this iteration failed QC',
  `failed_quantity` int DEFAULT '0' COMMENT 'Quantity that failed in this iteration',
  `rework_material_used` decimal(10,2) DEFAULT NULL COMMENT 'Additional material consumed for rework',
  `additional_cost` decimal(10,2) DEFAULT '0.00' COMMENT 'Cost incurred for rework',
  `status` enum('failed','in_progress','completed') DEFAULT 'failed',
  `failed_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'When this iteration failed',
  `failed_by` int DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `completed_by` int DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_stage_rework_failed_by` (`failed_by`),
  KEY `fk_stage_rework_completed_by` (`completed_by`),
  KEY `idx_production_stage_id` (`production_stage_id`),
  KEY `idx_iteration_number` (`iteration_number`),
  KEY `idx_status` (`status`),
  KEY `idx_failed_at` (`failed_at`),
  CONSTRAINT `fk_stage_rework_completed_by` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_stage_rework_failed_by` FOREIGN KEY (`failed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_stage_rework_production_stage` FOREIGN KEY (`production_stage_id`) REFERENCES `production_stages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stage_rework_history`
--

LOCK TABLES `stage_rework_history` WRITE;
/*!40000 ALTER TABLE `stage_rework_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `stage_rework_history` ENABLE KEYS */;
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
