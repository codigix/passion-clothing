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
-- Table structure for table `production_completion`
--

DROP TABLE IF EXISTS `production_completion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_completion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_order_id` int NOT NULL,
  `required_quantity` int NOT NULL COMMENT 'Total quantity required',
  `produced_quantity` int NOT NULL COMMENT 'Total quantity produced',
  `approved_quantity` int NOT NULL COMMENT 'Quantity approved in QC',
  `rejected_quantity` int DEFAULT '0' COMMENT 'Quantity rejected in QC',
  `all_quantity_received` tinyint(1) DEFAULT '0' COMMENT 'Whether all required quantity was produced',
  `quantity_shortage_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Reason if quantity is short',
  `all_materials_used` tinyint(1) DEFAULT '0' COMMENT 'Whether all allocated materials were used',
  `material_return_summary` json DEFAULT NULL COMMENT 'Summary of materials returned to inventory',
  `material_return_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `completion_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_by` int NOT NULL,
  `shipment_id` int DEFAULT NULL,
  `sent_to_shipment` tinyint(1) DEFAULT '0',
  `shipment_date` datetime DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `production_order_id` (`production_order_id`),
  KEY `completed_by` (`completed_by`),
  KEY `production_completion_production_order_id` (`production_order_id`),
  KEY `production_completion_shipment_id` (`shipment_id`),
  KEY `production_completion_sent_to_shipment` (`sent_to_shipment`),
  KEY `production_completion_completion_date` (`completion_date`),
  CONSTRAINT `production_completion_ibfk_1` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `production_completion_ibfk_2` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `production_completion_ibfk_3` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_completion`
--

LOCK TABLES `production_completion` WRITE;
/*!40000 ALTER TABLE `production_completion` DISABLE KEYS */;
/*!40000 ALTER TABLE `production_completion` ENABLE KEYS */;
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
