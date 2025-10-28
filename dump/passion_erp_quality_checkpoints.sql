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
-- Table structure for table `quality_checkpoints`
--

DROP TABLE IF EXISTS `quality_checkpoints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quality_checkpoints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_order_id` int NOT NULL,
  `production_stage_id` int DEFAULT NULL COMMENT 'Optional: Link checkpoint to specific stage',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Checkpoint name/title',
  `frequency` enum('per_batch','per_unit','per_stage','hourly','daily','final') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'per_batch',
  `acceptance_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'What makes this checkpoint pass',
  `checkpoint_order` int DEFAULT NULL COMMENT 'Order in which checkpoints should be performed',
  `status` enum('pending','in_progress','passed','failed','skipped') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `checked_at` datetime DEFAULT NULL,
  `checked_by` int DEFAULT NULL,
  `result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Actual results/observations',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `quality_checkpoints_production_order_id` (`production_order_id`),
  KEY `quality_checkpoints_production_stage_id` (`production_stage_id`),
  KEY `quality_checkpoints_status` (`status`),
  KEY `quality_checkpoints_frequency` (`frequency`),
  KEY `quality_checkpoints_checked_by` (`checked_by`),
  CONSTRAINT `quality_checkpoints_ibfk_1` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quality_checkpoints_ibfk_2` FOREIGN KEY (`production_stage_id`) REFERENCES `production_stages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `quality_checkpoints_ibfk_3` FOREIGN KEY (`checked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quality_checkpoints`
--

LOCK TABLES `quality_checkpoints` WRITE;
/*!40000 ALTER TABLE `quality_checkpoints` DISABLE KEYS */;
INSERT INTO `quality_checkpoints` VALUES (3,3,NULL,'sdfsf','per_batch','ferer',1,'pending',NULL,NULL,NULL,NULL,'2025-10-14 13:42:13','2025-10-14 13:42:13'),(22,23,NULL,'duhfduh','per_batch','erhfereru',1,'pending',NULL,NULL,NULL,NULL,'2025-10-15 12:46:40','2025-10-15 12:46:40'),(23,24,NULL,'sfdsdsdsd','per_batch','asdsd',1,'pending',NULL,NULL,NULL,NULL,'2025-10-18 07:23:23','2025-10-18 07:23:23'),(24,25,NULL,'ftytt','per_batch','sydgsydg',1,'pending',NULL,NULL,NULL,NULL,'2025-10-18 08:07:06','2025-10-18 08:07:06'),(25,26,NULL,'sdfsfs','per_batch','sdfsdf',1,'pending',NULL,NULL,NULL,NULL,'2025-10-27 08:24:06','2025-10-27 08:24:06');
/*!40000 ALTER TABLE `quality_checkpoints` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28 11:44:25
