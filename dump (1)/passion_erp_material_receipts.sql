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
-- Table structure for table `material_receipts`
--

DROP TABLE IF EXISTS `material_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `receipt_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: MRN-RCV-YYYYMMDD-XXXXX',
  `mrn_request_id` int NOT NULL COMMENT 'Reference to the MRN request',
  `dispatch_id` int NOT NULL COMMENT 'Reference to the dispatch record',
  `project_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Project name for this receipt',
  `received_materials` json NOT NULL COMMENT 'Array of materials received',
  `total_items_received` int NOT NULL DEFAULT '0' COMMENT 'Total number of material items received',
  `has_discrepancy` tinyint(1) DEFAULT '0' COMMENT 'Whether there are any discrepancies',
  `discrepancy_details` json DEFAULT NULL COMMENT 'Array of discrepancies',
  `receipt_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Notes about the receipt',
  `receipt_photos` json DEFAULT NULL COMMENT 'Array of photo URLs for receipt evidence',
  `received_by` int NOT NULL COMMENT 'Manufacturing user who received the materials',
  `received_at` datetime NOT NULL COMMENT 'Date and time of receipt',
  `verification_status` enum('pending','verified','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'QC verification status',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `product_id` int DEFAULT NULL COMMENT 'Final product being manufactured',
  `product_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Product name for quick reference',
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  UNIQUE KEY `idx_material_receipts_receipt_number` (`receipt_number`),
  UNIQUE KEY `material_receipts_receipt_number` (`receipt_number`),
  KEY `idx_material_receipts_mrn_request_id` (`mrn_request_id`),
  KEY `idx_material_receipts_dispatch_id` (`dispatch_id`),
  KEY `idx_material_receipts_received_by` (`received_by`),
  KEY `idx_material_receipts_verification_status` (`verification_status`),
  KEY `idx_material_receipts_product_id` (`product_id`),
  KEY `material_receipts_mrn_request_id` (`mrn_request_id`),
  KEY `material_receipts_dispatch_id` (`dispatch_id`),
  KEY `material_receipts_product_id` (`product_id`),
  KEY `material_receipts_project_name` (`project_name`),
  KEY `material_receipts_received_by` (`received_by`),
  KEY `material_receipts_received_at` (`received_at`),
  KEY `material_receipts_has_discrepancy` (`has_discrepancy`),
  KEY `material_receipts_verification_status` (`verification_status`),
  CONSTRAINT `material_receipts_ibfk_1` FOREIGN KEY (`mrn_request_id`) REFERENCES `project_material_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `material_receipts_ibfk_2` FOREIGN KEY (`dispatch_id`) REFERENCES `material_dispatches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `material_receipts_ibfk_3` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`),
  CONSTRAINT `material_receipts_product_id_foreign_idx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_receipts`
--

LOCK TABLES `material_receipts` WRITE;
/*!40000 ALTER TABLE `material_receipts` DISABLE KEYS */;
INSERT INTO `material_receipts` VALUES (1,'MRN-RCV-20251014-00001',1,1,'SO-SO-20251014-0001','[{\"uom\": \"PCS\", \"remarks\": \"\", \"condition\": \"good\", \"material_code\": \"N/A\", \"material_name\": \"cotton plain \", \"barcode_scanned\": \"\", \"quantity_received\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"remarks\": \"\", \"condition\": \"good\", \"material_code\": \"N/A\", \"material_name\": \"Button\", \"barcode_scanned\": \"\", \"quantity_received\": 4, \"quantity_dispatched\": 4}]',2,0,NULL,'','[]',6,'2025-10-14 12:52:37','verified','2025-10-14 12:52:37','2025-10-14 12:52:43',NULL,NULL),(2,'MRN-RCV-20251015-00001',2,2,'SO-SO-20251015-0001','[{\"uom\": \"PCS\", \"remarks\": \"\", \"condition\": \"good\", \"material_code\": \"N/A\", \"material_name\": \"cotton plain fabric \", \"barcode_scanned\": \"\", \"quantity_received\": 200, \"quantity_dispatched\": 200}, {\"uom\": \"PCS\", \"remarks\": \"\", \"condition\": \"good\", \"material_code\": \"N/A\", \"material_name\": \"Button\", \"barcode_scanned\": \"\", \"quantity_received\": 100, \"quantity_dispatched\": 100}]',2,0,NULL,'','[]',6,'2025-10-15 06:37:38','verified','2025-10-15 06:37:38','2025-10-15 06:37:47',NULL,NULL),(3,'MRN-RCV-20251017-00001',3,4,'SO-SO-20251016-0001','[{\"uom\": \"PCS\", \"barcode\": \"INV-20251014-D6444B\", \"location\": \"Main Warehouse\", \"batch_number\": \"BATCH-PO202510140001-002\", \"inventory_ids\": [2, 4, 6, 8], \"material_code\": \"\", \"material_name\": \"Button\", \"quantity_dispatched\": 660}]',1,0,NULL,'Material received at manufacturing','[]',6,'2025-10-17 07:00:03','verified','2025-10-17 07:00:03','2025-10-17 07:00:07',NULL,NULL),(4,'MRN-RCV-20251017-00002',3,3,'SO-SO-20251016-0001','[{\"uom\": \"PCS\", \"barcode\": \"INV-20251014-D6444B\", \"location\": \"Main Warehouse\", \"batch_number\": \"BATCH-PO202510140001-002\", \"inventory_ids\": [2, 4, 6], \"material_code\": \"\", \"material_name\": \"Button\", \"quantity_dispatched\": 680}]',1,0,NULL,'Material received at manufacturing','[]',6,'2025-10-17 07:30:18','verified','2025-10-17 07:30:18','2025-10-17 07:30:22',NULL,NULL),(5,'MRN-RCV-20251027-00001',4,5,'SO-SO-20251027-0001','[{\"uom\": \"PCS\", \"barcode\": \"INV-20251014-B1C2E4\", \"location\": \"Main Warehouse\", \"batch_number\": \"BATCH-PO202510140001-001\", \"inventory_ids\": [1, 3, 5, 7, 9], \"material_code\": \"\", \"material_name\": \"cotton\", \"quantity_dispatched\": 600}, {\"uom\": \"PCS\", \"barcode\": \"INV-20251014-D6444B\", \"location\": \"Main Warehouse\", \"batch_number\": \"BATCH-PO202510140001-002\", \"inventory_ids\": [2, 4, 6, 8, 10], \"material_code\": \"\", \"material_name\": \"Button\", \"quantity_dispatched\": 10}, {\"uom\": \"PCS\", \"barcode\": \"INV-20251027-01EDE1\", \"location\": \"Main Warehouse\", \"batch_number\": \"BATCH-PO202510270001-003\", \"inventory_ids\": [11], \"material_code\": \"\", \"material_name\": \"Thread\", \"quantity_dispatched\": 10}]',3,0,NULL,'fsesdfse','[]',6,'2025-10-27 07:31:48','verified','2025-10-27 07:31:48','2025-10-27 07:31:51',NULL,NULL),(6,'MRN-RCV-20251027-00002',3,8,'SO-SO-20251016-0001','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton plain\", \"quantity_requested\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Button\", \"quantity_requested\": 600, \"quantity_dispatched\": 600}]',2,0,NULL,'Material received at manufacturing','[]',6,'2025-10-27 07:36:52','verified','2025-10-27 07:36:52','2025-10-27 07:36:55',NULL,NULL),(7,'MRN-RCV-20251027-00003',4,7,'SO-SO-20251027-0001','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton\", \"quantity_requested\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Button\", \"quantity_requested\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Thread\", \"quantity_requested\": 10, \"quantity_dispatched\": 10}]',3,0,NULL,'Material received at manufacturing','[]',6,'2025-10-27 07:37:01','verified','2025-10-27 07:37:01','2025-10-27 07:37:03',NULL,NULL),(8,'MRN-RCV-20251027-00004',4,6,'SO-SO-20251027-0001','[{\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"cotton\", \"quantity_requested\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Button\", \"quantity_requested\": 100, \"quantity_dispatched\": 100}, {\"uom\": \"PCS\", \"barcode\": \"\", \"location\": \"\", \"batch_number\": \"\", \"inventory_id\": null, \"material_code\": \"N/A\", \"material_name\": \"Thread\", \"quantity_requested\": 10, \"quantity_dispatched\": 10}]',3,0,NULL,'Material received at manufacturing','[]',6,'2025-10-27 07:37:11','verified','2025-10-27 07:37:11','2025-10-27 07:37:14',NULL,NULL);
/*!40000 ALTER TABLE `material_receipts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28 11:44:45
