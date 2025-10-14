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
-- Table structure for table `approvals`
--

DROP TABLE IF EXISTS `approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approvals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of entity tied to this approval (sales_order, purchase_order, etc.)',
  `entity_id` int NOT NULL COMMENT 'Identifier of the entity requiring approval',
  `stage_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Stable key identifying the approval stage',
  `stage_label` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Human readable label for the stage',
  `sequence` int NOT NULL DEFAULT '1' COMMENT 'Ordering of the stage within the workflow',
  `status` enum('pending','in_progress','approved','rejected','skipped','canceled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Current status of this approval stage',
  `assigned_to_user_id` int DEFAULT NULL COMMENT 'Specific user responsible for this stage (if applicable)',
  `reviewer_id` int DEFAULT NULL COMMENT 'User who issued the decision for this stage',
  `decision_note` text COLLATE utf8mb4_unicode_ci COMMENT 'Reviewer notes captured at decision time',
  `decided_at` datetime DEFAULT NULL COMMENT 'Timestamp when the decision was recorded',
  `metadata` json DEFAULT NULL COMMENT 'Serialized data for workflow orchestration',
  `due_at` datetime DEFAULT NULL COMMENT 'Optional due date for this approval stage',
  `created_by` int DEFAULT NULL COMMENT 'User who created the approval record',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `assigned_to_role_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `created_by` (`created_by`),
  KEY `approvals_entity_type_entity_id_sequence` (`entity_type`,`entity_id`,`sequence`),
  KEY `approvals_status` (`status`),
  KEY `approvals_assigned_to_user_id` (`assigned_to_user_id`),
  KEY `approvals_entity_sequence_idx` (`entity_type`,`entity_id`,`sequence`),
  KEY `approvals_status_idx` (`status`),
  KEY `approvals_assigned_user_idx` (`assigned_to_user_id`),
  KEY `approvals_assigned_role_idx` (`assigned_to_role_id`),
  CONSTRAINT `approvals_assigned_to_role_fk` FOREIGN KEY (`assigned_to_role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `approvals_ibfk_1` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `approvals_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `approvals_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvals`
--

LOCK TABLES `approvals` WRITE;
/*!40000 ALTER TABLE `approvals` DISABLE KEYS */;
INSERT INTO `approvals` VALUES (1,'purchase_order',1,'admin_approval','Admin Approval Required',1,'pending',NULL,NULL,NULL,NULL,'{\"priority\": \"medium\", \"po_number\": \"PO-20251014-0001\", \"vendor_name\": \"abhijit\", \"project_name\": \"Insurance Management Platform\", \"total_amount\": \"52408.00\", \"customer_name\": \"nitin kamble\", \"expected_delivery\": \"2025-10-30T00:00:00.000Z\"}',NULL,3,'2025-10-14 12:46:39','2025-10-14 12:46:39',NULL),(2,'grn_creation',1,'grn_creation_request','GRN Creation Request - Materials Received',1,'pending',5,NULL,NULL,NULL,'{\"po_details\": {\"po_number\": \"PO-20251014-0001\", \"items_count\": 2, \"vendor_name\": \"abhijit\", \"project_name\": \"Insurance Management Platform\", \"customer_name\": \"nitin kamble\", \"expected_delivery_date\": \"2025-10-30T00:00:00.000Z\"}, \"received_at\": \"2025-10-14T12:47:19.635Z\", \"request_notes\": \"Materials received at warehouse - ready for GRN creation\"}',NULL,3,'2025-10-14 12:47:19','2025-10-14 12:47:19',NULL);
/*!40000 ALTER TABLE `approvals` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14 23:25:23
