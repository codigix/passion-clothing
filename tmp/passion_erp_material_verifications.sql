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
-- Table structure for table `material_verifications`
--

DROP TABLE IF EXISTS `material_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `verification_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: MRN-VRF-YYYYMMDD-XXXXX',
  `mrn_request_id` int NOT NULL COMMENT 'Reference to the MRN request',
  `receipt_id` int NOT NULL COMMENT 'Reference to the receipt record',
  `project_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Project name for this verification',
  `verification_checklist` json NOT NULL COMMENT 'Array of materials with QC checklist',
  `overall_result` enum('passed','failed','partial') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Overall verification result',
  `issues_found` json DEFAULT NULL COMMENT 'Array of issues',
  `verification_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Notes from QC inspector',
  `verification_photos` json DEFAULT NULL COMMENT 'Array of photo URLs for verification evidence',
  `verified_by` int NOT NULL COMMENT 'QC user who verified the materials',
  `verified_at` datetime NOT NULL COMMENT 'Date and time of verification',
  `approval_status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'Manager approval status',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `product_id` int DEFAULT NULL COMMENT 'Final product being manufactured',
  `product_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Product name for quick reference',
  PRIMARY KEY (`id`),
  UNIQUE KEY `verification_number` (`verification_number`),
  UNIQUE KEY `idx_material_verifications_verification_number` (`verification_number`),
  UNIQUE KEY `material_verifications_verification_number` (`verification_number`),
  KEY `idx_material_verifications_mrn_request_id` (`mrn_request_id`),
  KEY `idx_material_verifications_receipt_id` (`receipt_id`),
  KEY `idx_material_verifications_overall_result` (`overall_result`),
  KEY `idx_material_verifications_approval_status` (`approval_status`),
  KEY `idx_material_verifications_product_id` (`product_id`),
  KEY `material_verifications_mrn_request_id` (`mrn_request_id`),
  KEY `material_verifications_receipt_id` (`receipt_id`),
  KEY `material_verifications_product_id` (`product_id`),
  KEY `material_verifications_project_name` (`project_name`),
  KEY `material_verifications_overall_result` (`overall_result`),
  KEY `material_verifications_verified_by` (`verified_by`),
  KEY `material_verifications_verified_at` (`verified_at`),
  KEY `material_verifications_approval_status` (`approval_status`),
  CONSTRAINT `material_verifications_ibfk_1` FOREIGN KEY (`mrn_request_id`) REFERENCES `project_material_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `material_verifications_ibfk_2` FOREIGN KEY (`receipt_id`) REFERENCES `material_receipts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `material_verifications_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`),
  CONSTRAINT `material_verifications_product_id_foreign_idx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_verifications`
--

LOCK TABLES `material_verifications` WRITE;
/*!40000 ALTER TABLE `material_verifications` DISABLE KEYS */;
INSERT INTO `material_verifications` VALUES (1,'MRN-VRF-20251014-00001',1,1,'SO-SO-20251014-0001','[{\"remarks\": \"\", \"no_damage\": \"yes\", \"specs_match\": \"yes\", \"good_quality\": \"yes\", \"barcode_valid\": \"yes\", \"material_code\": \"N/A\", \"material_name\": \"cotton plain \", \"correct_quantity\": \"yes\", \"inspection_result\": \"pass\", \"quantity_received\": 100}, {\"remarks\": \"\", \"no_damage\": \"yes\", \"specs_match\": \"yes\", \"good_quality\": \"yes\", \"barcode_valid\": \"yes\", \"material_code\": \"N/A\", \"material_name\": \"Button\", \"correct_quantity\": \"yes\", \"inspection_result\": \"pass\", \"quantity_received\": 4}]','passed',NULL,'','[]',6,'2025-10-14 12:52:43','approved','2025-10-14 12:52:43','2025-10-14 12:52:50',NULL,NULL),(2,'MRN-VRF-20251015-00001',2,2,'SO-SO-20251015-0001','[{\"remarks\": \"\", \"no_damage\": \"yes\", \"specs_match\": \"yes\", \"good_quality\": \"yes\", \"barcode_valid\": \"yes\", \"material_code\": \"N/A\", \"material_name\": \"cotton plain fabric \", \"correct_quantity\": \"yes\", \"inspection_result\": \"pass\", \"quantity_received\": 200}, {\"remarks\": \"\", \"no_damage\": \"yes\", \"specs_match\": \"yes\", \"good_quality\": \"yes\", \"barcode_valid\": \"yes\", \"material_code\": \"N/A\", \"material_name\": \"Button\", \"correct_quantity\": \"yes\", \"inspection_result\": \"pass\", \"quantity_received\": 100}]','passed',NULL,'','[]',6,'2025-10-15 06:37:47','approved','2025-10-15 06:37:47','2025-10-15 06:37:53',NULL,NULL),(3,'MRN-VRF-20251017-00001',3,3,'SO-SO-20251016-0001','[{\"notes\": \"\", \"status\": \"verified\", \"item_number\": 1, \"material_name\": \"Button\"}]','passed',NULL,'Material verification completed','[]',6,'2025-10-17 07:00:07','approved','2025-10-17 07:00:07','2025-10-17 07:12:50',NULL,NULL),(4,'MRN-VRF-20251017-00002',3,4,'SO-SO-20251016-0001','[{\"notes\": \"\", \"status\": \"verified\", \"item_number\": 1, \"material_name\": \"Button\"}]','passed',NULL,'Material verification completed','[]',6,'2025-10-17 07:30:22','approved','2025-10-17 07:30:22','2025-10-17 07:30:26',NULL,NULL),(5,'MRN-VRF-20251027-00001',4,5,'SO-SO-20251027-0001','[{\"notes\": \"\", \"status\": \"verified\", \"item_number\": 1, \"material_name\": \"cotton\"}, {\"notes\": \"\", \"status\": \"verified\", \"item_number\": 2, \"material_name\": \"Button\"}, {\"notes\": \"\", \"status\": \"verified\", \"item_number\": 3, \"material_name\": \"Thread\"}]','passed',NULL,'Material verification completed','[]',6,'2025-10-27 07:31:51','approved','2025-10-27 07:31:51','2025-10-27 07:31:55',NULL,NULL),(6,'MRN-VRF-20251027-00002',3,6,'SO-SO-20251016-0001','[{\"notes\": \"\", \"status\": \"verified\", \"item_number\": 1, \"material_name\": \"cotton plain\"}, {\"notes\": \"\", \"status\": \"verified\", \"item_number\": 2, \"material_name\": \"Button\"}]','passed',NULL,'Material verification completed','[]',6,'2025-10-27 07:36:55','approved','2025-10-27 07:36:55','2025-10-27 07:36:57',NULL,NULL),(7,'MRN-VRF-20251027-00003',4,7,'SO-SO-20251027-0001','[{\"notes\": \"\", \"status\": \"verified\", \"item_number\": 1, \"material_name\": \"cotton\"}, {\"notes\": \"\", \"status\": \"verified\", \"item_number\": 2, \"material_name\": \"Button\"}, {\"notes\": \"\", \"status\": \"verified\", \"item_number\": 3, \"material_name\": \"Thread\"}]','passed',NULL,'Material verification completed','[]',6,'2025-10-27 07:37:03','approved','2025-10-27 07:37:03','2025-10-27 07:37:06',NULL,NULL),(8,'MRN-VRF-20251027-00004',4,8,'SO-SO-20251027-0001','[{\"notes\": \"\", \"status\": \"verified\", \"item_number\": 1, \"material_name\": \"cotton\"}, {\"notes\": \"\", \"status\": \"verified\", \"item_number\": 2, \"material_name\": \"Button\"}, {\"notes\": \"\", \"status\": \"verified\", \"item_number\": 3, \"material_name\": \"Thread\"}]','passed',NULL,'Material verification completed','[]',6,'2025-10-27 07:37:14','approved','2025-10-27 07:37:14','2025-10-27 07:37:17',NULL,NULL);
/*!40000 ALTER TABLE `material_verifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-27 17:15:42
