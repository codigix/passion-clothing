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
-- Table structure for table `material_dispatches`
--

DROP TABLE IF EXISTS `material_dispatches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_dispatches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dispatch_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: DSP-YYYYMMDD-XXXXX',
  `mrn_request_id` int NOT NULL COMMENT 'Reference to the MRN request',
  `project_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Project name for this dispatch',
  `dispatched_materials` json NOT NULL COMMENT 'Array of materials dispatched',
  `total_items` int NOT NULL DEFAULT '0' COMMENT 'Total number of material items dispatched',
  `dispatch_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Notes about the dispatch',
  `dispatch_photos` json DEFAULT NULL COMMENT 'Array of photo URLs for dispatch evidence',
  `dispatch_slip_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL of generated dispatch slip PDF',
  `dispatched_by` int NOT NULL COMMENT 'Inventory user who dispatched the materials',
  `dispatched_at` datetime NOT NULL COMMENT 'Date and time of dispatch',
  `received_status` enum('pending','received','partial','discrepancy') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'Whether materials have been received by manufacturing',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `product_id` int DEFAULT NULL COMMENT 'Final product being manufactured',
  `product_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Product name for quick reference',
  PRIMARY KEY (`id`),
  UNIQUE KEY `dispatch_number` (`dispatch_number`),
  UNIQUE KEY `idx_material_dispatches_dispatch_number` (`dispatch_number`),
  UNIQUE KEY `material_dispatches_dispatch_number` (`dispatch_number`),
  KEY `idx_material_dispatches_mrn_request_id` (`mrn_request_id`),
  KEY `idx_material_dispatches_dispatched_by` (`dispatched_by`),
  KEY `idx_material_dispatches_received_status` (`received_status`),
  KEY `idx_material_dispatches_product_id` (`product_id`),
  KEY `material_dispatches_mrn_request_id` (`mrn_request_id`),
  KEY `material_dispatches_product_id` (`product_id`),
  KEY `material_dispatches_project_name` (`project_name`),
  KEY `material_dispatches_dispatched_by` (`dispatched_by`),
  KEY `material_dispatches_dispatched_at` (`dispatched_at`),
  KEY `material_dispatches_received_status` (`received_status`),
  CONSTRAINT `material_dispatches_ibfk_1` FOREIGN KEY (`mrn_request_id`) REFERENCES `project_material_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `material_dispatches_ibfk_2` FOREIGN KEY (`dispatched_by`) REFERENCES `users` (`id`),
  CONSTRAINT `material_dispatches_product_id_foreign_idx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_dispatches`
--

LOCK TABLES `material_dispatches` WRITE;
/*!40000 ALTER TABLE `material_dispatches` DISABLE KEYS */;
INSERT INTO `material_dispatches` VALUES (1,'DSP-20251115-00001',1,'Prodigy public school','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton\", \"quantity_requested\": 200, \"quantity_dispatched\": 200}]',1,'','[]',NULL,6,'2025-11-15 07:24:03','received','2025-11-15 07:24:03','2025-11-15 07:24:19',NULL,NULL),(2,'DSP-20251117-00001',1,'Prodigy public school','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton\", \"quantity_requested\": 200, \"quantity_dispatched\": 200}]',1,'','[]',NULL,6,'2025-11-17 05:42:49','pending','2025-11-17 05:42:49','2025-11-17 05:42:49',NULL,NULL),(3,'DSP-20251117-00002',1,'Prodigy public school','[{\"uom\": \"PCS\", \"barcode\": \"INV-20251114-6D354D\", \"location\": \"Main Warehouse\", \"batch_number\": \"BATCH-PO202511140001-001\", \"inventory_ids\": [1, 2], \"material_code\": \"\", \"material_name\": \"cotton\", \"quantity_dispatched\": 200}]',1,'Approved and dispatched via integrated workflow',NULL,NULL,6,'2025-11-17 05:43:09','pending','2025-11-17 05:43:09','2025-11-17 05:43:09',NULL,NULL),(4,'DSP-20251117-00003',1,'Prodigy public school','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton\", \"quantity_requested\": 200, \"quantity_dispatched\": 200}]',1,'','[]',NULL,6,'2025-11-17 05:46:04','pending','2025-11-17 05:46:04','2025-11-17 05:46:04',NULL,NULL),(5,'DSP-20251117-00004',1,'Prodigy public school','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton\", \"quantity_requested\": 200, \"quantity_dispatched\": 200}]',1,'','[]',NULL,6,'2025-11-17 05:46:24','pending','2025-11-17 05:46:24','2025-11-17 05:46:24',NULL,NULL);
/*!40000 ALTER TABLE `material_dispatches` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 17:04:09
