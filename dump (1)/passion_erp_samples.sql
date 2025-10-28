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
-- Table structure for table `samples`
--

DROP TABLE IF EXISTS `samples`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `samples` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sample_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: SMP-YYYYMMDD-XXXX',
  `customer_id` int NOT NULL,
  `product_id` int NOT NULL,
  `sample_type` enum('free','paid','development','approval') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `specifications` json DEFAULT NULL COMMENT 'Detailed specifications for the sample',
  `cost_per_unit` decimal(10,2) DEFAULT '0.00',
  `total_cost` decimal(10,2) DEFAULT '0.00',
  `selling_price` decimal(10,2) DEFAULT '0.00',
  `status` enum('requested','approved','in_production','ready','dispatched','delivered','approved_by_customer','rejected_by_customer','converted_to_order','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'requested',
  `priority` enum('low','medium','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `requested_date` datetime NOT NULL,
  `expected_completion_date` datetime DEFAULT NULL,
  `actual_completion_date` datetime DEFAULT NULL,
  `dispatch_date` datetime DEFAULT NULL,
  `delivery_date` datetime DEFAULT NULL,
  `customer_feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `customer_rating` int DEFAULT NULL,
  `feedback_date` datetime DEFAULT NULL,
  `converted_to_order` tinyint(1) DEFAULT '0',
  `sales_order_id` int DEFAULT NULL,
  `conversion_date` datetime DEFAULT NULL,
  `conversion_quantity` int DEFAULT NULL,
  `conversion_value` decimal(12,2) DEFAULT NULL,
  `materials_used` json DEFAULT NULL COMMENT 'Materials and quantities used for sample',
  `production_time_hours` decimal(6,2) DEFAULT NULL,
  `images` json DEFAULT NULL COMMENT 'Array of sample image URLs',
  `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `courier_details` json DEFAULT NULL COMMENT 'Courier company, tracking number, etc.',
  `special_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `internal_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `return_required` tinyint(1) DEFAULT '0',
  `return_date` datetime DEFAULT NULL,
  `return_condition` enum('good','damaged','not_returned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sample_number` (`sample_number`),
  KEY `sales_order_id` (`sales_order_id`),
  KEY `approved_by` (`approved_by`),
  KEY `samples_sample_number` (`sample_number`),
  KEY `samples_customer_id` (`customer_id`),
  KEY `samples_product_id` (`product_id`),
  KEY `samples_sample_type` (`sample_type`),
  KEY `samples_status` (`status`),
  KEY `samples_priority` (`priority`),
  KEY `samples_requested_date` (`requested_date`),
  KEY `samples_converted_to_order` (`converted_to_order`),
  KEY `samples_created_by` (`created_by`),
  KEY `samples_assigned_to` (`assigned_to`),
  CONSTRAINT `samples_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `samples_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `samples_ibfk_3` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`),
  CONSTRAINT `samples_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `samples_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `samples_ibfk_6` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `samples`
--

LOCK TABLES `samples` WRITE;
/*!40000 ALTER TABLE `samples` DISABLE KEYS */;
/*!40000 ALTER TABLE `samples` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28 11:44:46
