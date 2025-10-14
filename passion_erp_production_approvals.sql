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
-- Table structure for table `production_approvals`
--

DROP TABLE IF EXISTS `production_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_approvals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `approval_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: PRD-APV-YYYYMMDD-XXXXX',
  `mrn_request_id` int NOT NULL COMMENT 'Reference to the MRN request',
  `verification_id` int NOT NULL COMMENT 'Reference to the verification record',
  `production_order_id` int DEFAULT NULL COMMENT 'Reference to production order if created',
  `project_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Project name for this approval',
  `approval_status` enum('approved','rejected','conditional') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Approval decision',
  `production_order_created` tinyint(1) DEFAULT '0',
  `production_start_date` datetime DEFAULT NULL COMMENT 'Planned production start date',
  `material_allocations` json DEFAULT NULL COMMENT 'Array of material allocations',
  `approval_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes from approver',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci COMMENT 'Reason if rejected',
  `conditions` text COLLATE utf8mb4_unicode_ci COMMENT 'Conditions if conditional approval',
  `approved_by` int NOT NULL COMMENT 'Manufacturing manager who approved',
  `approved_at` datetime NOT NULL COMMENT 'Date and time of approval',
  `production_started` tinyint(1) DEFAULT '0' COMMENT 'Whether production has started',
  `production_started_at` datetime DEFAULT NULL COMMENT 'Date when production started',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `product_id` int DEFAULT NULL COMMENT 'Final product being manufactured',
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Product name for quick reference',
  PRIMARY KEY (`id`),
  UNIQUE KEY `approval_number` (`approval_number`),
  UNIQUE KEY `idx_production_approvals_approval_number` (`approval_number`),
  UNIQUE KEY `production_approvals_approval_number` (`approval_number`),
  KEY `idx_production_approvals_mrn_request_id` (`mrn_request_id`),
  KEY `idx_production_approvals_verification_id` (`verification_id`),
  KEY `idx_production_approvals_approval_status` (`approval_status`),
  KEY `idx_production_approvals_production_started` (`production_started`),
  KEY `idx_production_approvals_product_id` (`product_id`),
  KEY `production_approvals_mrn_request_id` (`mrn_request_id`),
  KEY `production_approvals_verification_id` (`verification_id`),
  KEY `production_approvals_production_order_id` (`production_order_id`),
  KEY `production_approvals_product_id` (`product_id`),
  KEY `production_approvals_project_name` (`project_name`),
  KEY `production_approvals_approval_status` (`approval_status`),
  KEY `production_approvals_approved_by` (`approved_by`),
  KEY `production_approvals_approved_at` (`approved_at`),
  KEY `production_approvals_production_started` (`production_started`),
  CONSTRAINT `production_approvals_ibfk_1` FOREIGN KEY (`mrn_request_id`) REFERENCES `project_material_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `production_approvals_ibfk_2` FOREIGN KEY (`verification_id`) REFERENCES `material_verifications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `production_approvals_ibfk_3` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`),
  CONSTRAINT `production_approvals_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `production_approvals_product_id_foreign_idx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_approvals`
--

LOCK TABLES `production_approvals` WRITE;
/*!40000 ALTER TABLE `production_approvals` DISABLE KEYS */;
INSERT INTO `production_approvals` VALUES (1,'PRD-APV-20251014-00001',1,1,3,'SO-SO-20251014-0001','approved',0,'2025-10-14 00:00:00',NULL,'',NULL,NULL,6,'2025-10-14 12:52:50',1,'2025-10-14 13:42:13','2025-10-14 12:52:50','2025-10-14 13:42:13',NULL,NULL);
/*!40000 ALTER TABLE `production_approvals` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14 23:23:08
