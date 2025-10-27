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
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `category` enum('fabric','thread','button','zipper','elastic','lace','uniform','shirt','trouser','skirt','blazer','tie','belt','shoes','socks','accessories','raw_material','finished_goods') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sub_category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_type` enum('raw_material','semi_finished','finished_goods','accessory') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_of_measurement` enum('piece','meter','yard','kg','gram','liter','dozen','set') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hsn_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specifications` json DEFAULT NULL COMMENT 'Detailed specifications like dimensions, weight, etc.',
  `images` json DEFAULT NULL COMMENT 'Array of image URLs',
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT '0.00',
  `selling_price` decimal(10,2) DEFAULT '0.00',
  `mrp` decimal(10,2) DEFAULT '0.00',
  `tax_percentage` decimal(5,2) DEFAULT '0.00',
  `minimum_stock_level` int DEFAULT '0',
  `maximum_stock_level` int DEFAULT '0',
  `reorder_level` int DEFAULT '0',
  `lead_time_days` int DEFAULT '0',
  `shelf_life_days` int DEFAULT NULL,
  `weight` decimal(8,3) DEFAULT NULL COMMENT 'Weight in kg',
  `dimensions` json DEFAULT NULL COMMENT 'Length, width, height in cm',
  `status` enum('active','inactive','discontinued') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `is_serialized` tinyint(1) DEFAULT '0',
  `is_batch_tracked` tinyint(1) DEFAULT '0',
  `quality_parameters` json DEFAULT NULL COMMENT 'Quality check parameters for this product',
  `production_time_hours` decimal(6,2) DEFAULT NULL COMMENT 'Standard production time in hours',
  `materials_required` json DEFAULT NULL COMMENT 'Bill of materials - list of raw materials required',
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_code` (`product_code`),
  UNIQUE KEY `barcode` (`barcode`),
  UNIQUE KEY `qr_code` (`qr_code`),
  KEY `created_by` (`created_by`),
  KEY `products_product_code` (`product_code`),
  KEY `products_name` (`name`),
  KEY `products_category` (`category`),
  KEY `products_product_type` (`product_type`),
  KEY `products_status` (`status`),
  KEY `products_barcode` (`barcode`),
  KEY `products_brand` (`brand`),
  KEY `products_color` (`color`),
  KEY `products_size` (`size`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'PRD-1760446113384-337','cotton','Formal Shirt','fabric',NULL,'raw_material','meter','100',NULL,'blue',NULL,NULL,'{\"gsm\": \"180\", \"width\": \"100\", \"source\": \"grn_auto_created\"}',NULL,NULL,NULL,500.00,600.00,0.00,0.00,10,0,20,0,NULL,NULL,NULL,'active',0,1,NULL,NULL,NULL,5,'2025-10-14 12:48:33','2025-10-14 12:48:33'),(2,'PRD-1760446113417-86','buttons','green color ','accessories',NULL,'accessory','meter',NULL,NULL,NULL,NULL,NULL,'{\"gsm\": null, \"width\": null, \"source\": \"grn_auto_created\"}',NULL,NULL,NULL,100.00,120.00,0.00,0.00,10,0,20,0,NULL,NULL,NULL,'active',0,1,NULL,NULL,NULL,5,'2025-10-14 12:48:33','2025-10-14 12:48:33'),(3,'PRD-1760509860788-286','button','nevy blue color buttons','accessories',NULL,'accessory','yard',NULL,NULL,NULL,NULL,NULL,'{\"gsm\": null, \"width\": null, \"source\": \"grn_auto_created\"}',NULL,NULL,NULL,10.00,12.00,0.00,0.00,10,0,20,0,NULL,NULL,NULL,'active',0,1,NULL,NULL,NULL,5,'2025-10-15 06:31:00','2025-10-15 06:31:00'),(4,'PRD-1761549948811-423','thread','sdsfes','accessories',NULL,'accessory','yard',NULL,NULL,NULL,NULL,NULL,'{\"gsm\": null, \"width\": null, \"source\": \"grn_auto_created\"}',NULL,NULL,NULL,10.00,12.00,0.00,0.00,10,0,20,0,NULL,NULL,NULL,'active',0,1,NULL,NULL,NULL,5,'2025-10-27 07:25:48','2025-10-27 07:25:48');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-27 17:16:57
