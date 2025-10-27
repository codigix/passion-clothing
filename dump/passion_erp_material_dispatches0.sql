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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_dispatches`
--

LOCK TABLES `material_dispatches` WRITE;
/*!40000 ALTER TABLE `material_dispatches` DISABLE KEYS */;
INSERT INTO `material_dispatches` VALUES (1,'DSP-20251014-00001',1,'SO-SO-20251014-0001','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton plain \", \"quantity_requested\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Button\", \"quantity_requested\": 4, \"quantity_dispatched\": 4}]',2,'','[]',NULL,5,'2025-10-14 12:52:12','received','2025-10-14 12:52:12','2025-10-14 12:52:37',NULL,NULL),(2,'DSP-20251015-00001',2,'SO-SO-20251015-0001','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton plain fabric \", \"quantity_requested\": 200, \"quantity_dispatched\": 200}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Button\", \"quantity_requested\": 100, \"quantity_dispatched\": 100}]',2,'','[]',NULL,5,'2025-10-15 06:37:04','received','2025-10-15 06:37:04','2025-10-15 06:37:38',NULL,NULL),(3,'DSP-20251016-00001',3,'SO-SO-20251016-0001','[{\"uom\": \"PCS\", \"barcode\": \"INV-20251014-D6444B\", \"location\": \"Main Warehouse\", \"batch_number\": \"BATCH-PO202510140001-002\", \"inventory_ids\": [2, 4, 6], \"material_code\": \"\", \"material_name\": \"Button\", \"quantity_dispatched\": 680}]',1,'Materials not available in stock. Request cannot be fulfilled.',NULL,NULL,5,'2025-10-16 12:54:51','received','2025-10-16 12:54:51','2025-10-17 07:30:18',NULL,NULL),(4,'DSP-20251017-00001',3,'SO-SO-20251016-0001','[{\"uom\": \"PCS\", \"barcode\": \"INV-20251014-D6444B\", \"location\": \"Main Warehouse\", \"batch_number\": \"BATCH-PO202510140001-002\", \"inventory_ids\": [2, 4, 6, 8], \"material_code\": \"\", \"material_name\": \"Button\", \"quantity_dispatched\": 660}]',1,'Materials not available in stock. Request cannot be fulfilled.',NULL,NULL,5,'2025-10-17 05:45:10','received','2025-10-17 05:45:10','2025-10-17 07:00:03',NULL,NULL),(5,'DSP-20251027-00001',4,'SO-SO-20251027-0001','[{\"uom\": \"PCS\", \"barcode\": \"INV-20251014-B1C2E4\", \"location\": \"Main Warehouse\", \"batch_number\": \"BATCH-PO202510140001-001\", \"inventory_ids\": [1, 3, 5, 7, 9], \"material_code\": \"\", \"material_name\": \"cotton\", \"quantity_dispatched\": 600}, {\"uom\": \"PCS\", \"barcode\": \"INV-20251014-D6444B\", \"location\": \"Main Warehouse\", \"batch_number\": \"BATCH-PO202510140001-002\", \"inventory_ids\": [2, 4, 6, 8, 10], \"material_code\": \"\", \"material_name\": \"Button\", \"quantity_dispatched\": 10}, {\"uom\": \"PCS\", \"barcode\": \"INV-20251027-01EDE1\", \"location\": \"Main Warehouse\", \"batch_number\": \"BATCH-PO202510270001-003\", \"inventory_ids\": [11], \"material_code\": \"\", \"material_name\": \"Thread\", \"quantity_dispatched\": 10}]',3,'Approved and dispatched via integrated workflow',NULL,NULL,5,'2025-10-27 07:30:17','received','2025-10-27 07:30:17','2025-10-27 07:31:48',NULL,NULL),(6,'DSP-20251027-00002',4,'SO-SO-20251027-0001','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton\", \"quantity_requested\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Button\", \"quantity_requested\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Thread\", \"quantity_requested\": 10, \"quantity_dispatched\": 10}]',3,'','[]',NULL,5,'2025-10-27 07:35:59','received','2025-10-27 07:35:59','2025-10-27 07:37:11',NULL,NULL),(7,'DSP-20251027-00003',4,'SO-SO-20251027-0001','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton\", \"quantity_requested\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Button\", \"quantity_requested\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Thread\", \"quantity_requested\": 10, \"quantity_dispatched\": 10}]',3,'','[]',NULL,5,'2025-10-27 07:36:11','received','2025-10-27 07:36:11','2025-10-27 07:37:01',NULL,NULL),(8,'DSP-20251027-00004',3,'SO-SO-20251016-0001','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton plain\", \"quantity_requested\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Button\", \"quantity_requested\": 600, \"quantity_dispatched\": 600}]',2,'','[]',NULL,5,'2025-10-27 07:36:26','received','2025-10-27 07:36:26','2025-10-27 07:36:52',NULL,NULL);
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

-- Dump completed on 2025-10-27 17:16:53
