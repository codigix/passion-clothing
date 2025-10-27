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
-- Table structure for table `vendor_returns`
--

DROP TABLE IF EXISTS `vendor_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_returns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_order_id` int NOT NULL,
  `grn_id` int DEFAULT NULL,
  `vendor_id` int NOT NULL,
  `return_type` enum('shortage','quality_issue','wrong_item','damaged','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `return_date` datetime NOT NULL,
  `items` json NOT NULL,
  `total_shortage_value` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('pending','acknowledged','resolved','disputed','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `vendor_response` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `vendor_response_date` datetime DEFAULT NULL,
  `resolution_type` enum('credit_note','replacement','refund','adjustment','none') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolution_amount` decimal(10,2) DEFAULT NULL,
  `resolution_date` datetime DEFAULT NULL,
  `resolution_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approval_date` datetime DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `attachments` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `return_number` (`return_number`),
  KEY `created_by` (`created_by`),
  KEY `approved_by` (`approved_by`),
  KEY `vendor_returns_purchase_order_id` (`purchase_order_id`),
  KEY `vendor_returns_grn_id` (`grn_id`),
  KEY `vendor_returns_vendor_id` (`vendor_id`),
  KEY `vendor_returns_status` (`status`),
  KEY `vendor_returns_return_number` (`return_number`),
  KEY `vendor_returns_return_type` (`return_type`),
  CONSTRAINT `vendor_returns_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`),
  CONSTRAINT `vendor_returns_ibfk_2` FOREIGN KEY (`grn_id`) REFERENCES `goods_receipt_notes` (`id`),
  CONSTRAINT `vendor_returns_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`),
  CONSTRAINT `vendor_returns_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `vendor_returns_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_returns`
--

LOCK TABLES `vendor_returns` WRITE;
/*!40000 ALTER TABLE `vendor_returns` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_returns` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-27 17:15:44
