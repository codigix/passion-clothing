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
-- Table structure for table `inventory_movements`
--

DROP TABLE IF EXISTS `inventory_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_movements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inventory_id` int NOT NULL,
  `purchase_order_id` int DEFAULT NULL,
  `sales_order_id` int DEFAULT NULL,
  `production_order_id` int DEFAULT NULL,
  `movement_type` enum('inward','outward','transfer','adjustment','return','consume') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of inventory movement',
  `quantity` decimal(10,2) NOT NULL COMMENT 'Quantity moved (positive for inward, negative for outward)',
  `previous_quantity` decimal(10,2) NOT NULL COMMENT 'Stock level before movement',
  `new_quantity` decimal(10,2) NOT NULL COMMENT 'Stock level after movement',
  `unit_cost` decimal(10,2) DEFAULT NULL COMMENT 'Cost per unit at time of movement',
  `total_cost` decimal(12,2) DEFAULT NULL COMMENT 'Total cost of movement',
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'External reference (GRN, invoice, etc.)',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `location_from` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Source location for transfers',
  `location_to` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Destination location',
  `performed_by` int NOT NULL,
  `movement_date` datetime NOT NULL,
  `metadata` json DEFAULT NULL COMMENT 'Additional movement data',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_movements_inventory_id` (`inventory_id`),
  KEY `inventory_movements_purchase_order_id` (`purchase_order_id`),
  KEY `inventory_movements_sales_order_id` (`sales_order_id`),
  KEY `inventory_movements_production_order_id` (`production_order_id`),
  KEY `inventory_movements_movement_type` (`movement_type`),
  KEY `inventory_movements_movement_date` (`movement_date`),
  KEY `inventory_movements_performed_by` (`performed_by`),
  CONSTRAINT `inventory_movements_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inventory_movements_ibfk_2` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inventory_movements_ibfk_3` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inventory_movements_ibfk_4` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inventory_movements_ibfk_5` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_movements`
--

LOCK TABLES `inventory_movements` WRITE;
/*!40000 ALTER TABLE `inventory_movements` DISABLE KEYS */;
INSERT INTO `inventory_movements` VALUES (1,1,1,1,NULL,'inward',100.00,0.00,100.00,500.00,50000.00,'GRN-20251014-00001','Auto-added from verified GRN GRN-20251014-00001',NULL,'Main Warehouse',5,'2025-10-14 12:48:33',NULL,'2025-10-14 12:48:33','2025-10-14 12:48:33'),(2,2,1,1,NULL,'inward',10.00,0.00,10.00,100.00,1000.00,'GRN-20251014-00001','Auto-added from verified GRN GRN-20251014-00001',NULL,'Main Warehouse',5,'2025-10-14 12:48:33',NULL,'2025-10-14 12:48:33','2025-10-14 12:48:33');
/*!40000 ALTER TABLE `inventory_movements` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14 23:23:10
