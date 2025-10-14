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
-- Table structure for table `store_stock`
--

DROP TABLE IF EXISTS `store_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `store_location` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'School store location or branch',
  `issued_quantity` int DEFAULT '0' COMMENT 'Quantity issued to store from main inventory',
  `sold_quantity` int DEFAULT '0' COMMENT 'Quantity sold by the store',
  `returned_quantity` int DEFAULT '0' COMMENT 'Quantity returned to main inventory',
  `current_stock` int DEFAULT '0' COMMENT 'issued_quantity - sold_quantity - returned_quantity',
  `damaged_quantity` int DEFAULT '0' COMMENT 'Quantity damaged at store',
  `lost_quantity` int DEFAULT '0' COMMENT 'Quantity lost/stolen at store',
  `unit_cost` decimal(10,2) DEFAULT '0.00',
  `selling_price` decimal(10,2) DEFAULT '0.00',
  `total_cost_value` decimal(12,2) DEFAULT '0.00' COMMENT 'current_stock * unit_cost',
  `total_selling_value` decimal(12,2) DEFAULT '0.00' COMMENT 'current_stock * selling_price',
  `sales_revenue` decimal(12,2) DEFAULT '0.00' COMMENT 'sold_quantity * selling_price',
  `profit_amount` decimal(12,2) DEFAULT '0.00' COMMENT 'sales_revenue - (sold_quantity * unit_cost)',
  `minimum_level` int DEFAULT '0',
  `maximum_level` int DEFAULT '0',
  `reorder_level` int DEFAULT '0',
  `last_issue_date` datetime DEFAULT NULL,
  `last_sale_date` datetime DEFAULT NULL,
  `last_return_date` datetime DEFAULT NULL,
  `expiry_date` datetime DEFAULT NULL,
  `season` enum('summer','winter','monsoon','all_season') COLLATE utf8mb4_unicode_ci DEFAULT 'all_season',
  `size_breakdown` json DEFAULT NULL COMMENT 'Size-wise stock breakdown',
  `color_breakdown` json DEFAULT NULL COMMENT 'Color-wise stock breakdown',
  `status` enum('active','inactive','discontinued') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `store_manager_id` int DEFAULT NULL,
  `last_audit_date` datetime DEFAULT NULL,
  `audit_variance` int DEFAULT '0' COMMENT 'Difference found during last audit',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `store_stock_product_id` (`product_id`),
  KEY `store_stock_store_location` (`store_location`),
  KEY `store_stock_current_stock` (`current_stock`),
  KEY `store_stock_status` (`status`),
  KEY `store_stock_season` (`season`),
  KEY `store_stock_store_manager_id` (`store_manager_id`),
  KEY `store_stock_last_sale_date` (`last_sale_date`),
  KEY `store_stock_product_id_store_location` (`product_id`,`store_location`),
  CONSTRAINT `store_stock_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `store_stock_ibfk_2` FOREIGN KEY (`store_manager_id`) REFERENCES `users` (`id`),
  CONSTRAINT `store_stock_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `store_stock_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_stock`
--

LOCK TABLES `store_stock` WRITE;
/*!40000 ALTER TABLE `store_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `store_stock` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14 23:25:27
