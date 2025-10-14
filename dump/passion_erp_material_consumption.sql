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
-- Table structure for table `material_consumption`
--

DROP TABLE IF EXISTS `material_consumption`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_consumption` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_order_id` int NOT NULL,
  `production_stage_id` int DEFAULT NULL,
  `stage_operation_id` int DEFAULT NULL,
  `inventory_id` int DEFAULT NULL,
  `material_id` int NOT NULL,
  `material_barcode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Barcode of the material item',
  `quantity_allocated` decimal(10,2) DEFAULT '0.00',
  `quantity_used` decimal(10,2) DEFAULT '0.00',
  `quantity_returned` decimal(10,2) DEFAULT '0.00',
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pcs',
  `status` enum('allocated','consumed','partially_consumed','returned') COLLATE utf8mb4_unicode_ci DEFAULT 'allocated',
  `consumed_at` datetime DEFAULT NULL,
  `consumed_by` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `consumed_by` (`consumed_by`),
  KEY `material_consumption_stage_operation_id` (`stage_operation_id`),
  KEY `material_consumption_inventory_id` (`inventory_id`),
  KEY `material_consumption_production_order_id` (`production_order_id`),
  KEY `material_consumption_production_stage_id` (`production_stage_id`),
  KEY `material_consumption_material_id` (`material_id`),
  KEY `material_consumption_material_barcode` (`material_barcode`),
  KEY `material_consumption_status` (`status`),
  KEY `material_consumption_consumed_at` (`consumed_at`),
  CONSTRAINT `material_consumption_ibfk_1` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `material_consumption_ibfk_2` FOREIGN KEY (`production_stage_id`) REFERENCES `production_stages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `material_consumption_ibfk_3` FOREIGN KEY (`material_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `material_consumption_ibfk_4` FOREIGN KEY (`consumed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `material_consumption_inventory_id_foreign_idx` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `material_consumption_stage_operation_id_foreign_idx` FOREIGN KEY (`stage_operation_id`) REFERENCES `stage_operations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_consumption`
--

LOCK TABLES `material_consumption` WRITE;
/*!40000 ALTER TABLE `material_consumption` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_consumption` ENABLE KEYS */;
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
