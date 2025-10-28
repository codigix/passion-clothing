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
-- Table structure for table `sales_order_history`
--

DROP TABLE IF EXISTS `sales_order_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_order_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sales_order_id` int NOT NULL COMMENT 'Sales order associated with this lifecycle event',
  `status_from` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Previous status before transition',
  `status_to` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Status after transition',
  `approval_status_from` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Previous approval status before transition',
  `approval_status_to` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Approval status after transition',
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Additional context or remarks for the transition',
  `performed_by` int DEFAULT NULL COMMENT 'User who performed the action',
  `performed_at` datetime NOT NULL COMMENT 'Timestamp when the transition occurred',
  `metadata` json DEFAULT NULL COMMENT 'Serialized metadata describing the lifecycle event',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sales_order_history_sales_order_id_performed_at` (`sales_order_id`,`performed_at`),
  KEY `sales_order_history_performed_by` (`performed_by`),
  KEY `sales_order_history_order_performed_idx` (`sales_order_id`,`performed_at`),
  KEY `sales_order_history_performed_by_idx` (`performed_by`),
  CONSTRAINT `sales_order_history_ibfk_1` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sales_order_history_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_order_history`
--

LOCK TABLES `sales_order_history` WRITE;
/*!40000 ALTER TABLE `sales_order_history` DISABLE KEYS */;
INSERT INTO `sales_order_history` VALUES (1,2,'in_production','on_hold',NULL,NULL,'Status updated from in_production to on_hold',6,'2025-10-18 07:57:10',NULL,'2025-10-18 07:57:10','2025-10-18 07:57:10'),(2,2,'on_hold','on_hold',NULL,NULL,'Status updated from on_hold to on_hold',6,'2025-10-18 07:57:11',NULL,'2025-10-18 07:57:11','2025-10-18 07:57:11'),(3,3,'in_production','on_hold',NULL,NULL,'Status updated from in_production to on_hold',6,'2025-10-18 08:08:21',NULL,'2025-10-18 08:08:21','2025-10-18 08:08:21');
/*!40000 ALTER TABLE `sales_order_history` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28 11:44:48
