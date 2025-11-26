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
-- Table structure for table `product_lifecycle`
--

DROP TABLE IF EXISTS `product_lifecycle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_lifecycle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Product barcode for tracking',
  `batch_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Batch number for this product instance',
  `serial_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unique serial number for this product instance',
  `current_stage` enum('created','material_allocated','in_production','cutting','embroidery','printing','stitching','finishing','ironing','quality_check','packing','ready_for_dispatch','dispatched','in_transit','delivered','returned','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'created',
  `current_status` enum('active','on_hold','completed','cancelled','returned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `production_order_id` int DEFAULT NULL,
  `sales_order_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1' COMMENT 'Quantity of products in this lifecycle instance',
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Current physical location of the product',
  `estimated_completion_date` datetime DEFAULT NULL,
  `actual_completion_date` datetime DEFAULT NULL,
  `estimated_delivery_date` datetime DEFAULT NULL,
  `actual_delivery_date` datetime DEFAULT NULL,
  `quality_status` enum('pending','passed','failed','rework_required') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `quality_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `total_production_time_hours` decimal(8,2) DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT '0.00',
  `shipping_details` json DEFAULT NULL COMMENT 'Shipping information including tracking number, carrier, etc.',
  `delivery_address` json DEFAULT NULL COMMENT 'Delivery address details',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `qr_token` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unique token identifying the lifecycle QR',
  `qr_payload` json DEFAULT NULL COMMENT 'Cached payload embedded within the lifecycle QR',
  `qr_status` enum('pending','active','revoked','expired') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Status of the lifecycle QR token',
  `qr_generated_at` datetime DEFAULT NULL COMMENT 'Timestamp when the QR was last generated',
  `qr_last_scanned_at` datetime DEFAULT NULL COMMENT 'Timestamp when the QR was last scanned',
  `qr_scan_count` int NOT NULL DEFAULT '0' COMMENT 'Number of recorded scans for this lifecycle QR',
  `created_by` int NOT NULL,
  `last_updated_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_token` (`qr_token`),
  KEY `created_by` (`created_by`),
  KEY `last_updated_by` (`last_updated_by`),
  KEY `product_lifecycle_product_id` (`product_id`),
  KEY `product_lifecycle_barcode` (`barcode`),
  KEY `product_lifecycle_batch_number` (`batch_number`),
  KEY `product_lifecycle_serial_number` (`serial_number`),
  KEY `product_lifecycle_current_stage` (`current_stage`),
  KEY `product_lifecycle_current_status` (`current_status`),
  KEY `product_lifecycle_production_order_id` (`production_order_id`),
  KEY `product_lifecycle_sales_order_id` (`sales_order_id`),
  KEY `product_lifecycle_customer_id` (`customer_id`),
  KEY `product_lifecycle_quality_status` (`quality_status`),
  KEY `product_lifecycle_qr_token` (`qr_token`),
  KEY `product_lifecycle_qr_status` (`qr_status`),
  KEY `product_lifecycle_qr_generated_at` (`qr_generated_at`),
  KEY `product_lifecycle_qr_last_scanned_at` (`qr_last_scanned_at`),
  KEY `product_lifecycle_created_at` (`created_at`),
  KEY `product_lifecycle_estimated_delivery_date` (`estimated_delivery_date`),
  KEY `product_lifecycle_actual_delivery_date` (`actual_delivery_date`),
  CONSTRAINT `product_lifecycle_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_lifecycle_ibfk_2` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_lifecycle_ibfk_3` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_lifecycle_ibfk_4` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_lifecycle_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_lifecycle_ibfk_6` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_lifecycle`
--

LOCK TABLES `product_lifecycle` WRITE;
/*!40000 ALTER TABLE `product_lifecycle` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_lifecycle` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 17:04:16
