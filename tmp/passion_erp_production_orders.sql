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
-- Table structure for table `production_orders`
--

DROP TABLE IF EXISTS `production_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: PRD-YYYYMMDD-XXXX',
  `sales_order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `produced_quantity` int DEFAULT '0',
  `rejected_quantity` int DEFAULT '0',
  `approved_quantity` int DEFAULT '0',
  `status` enum('pending','in_progress','material_allocated','cutting','embroidery','stitching','finishing','quality_check','completed','on_hold','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `priority` enum('low','medium','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `production_type` enum('in_house','outsourced','mixed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'in_house',
  `planned_start_date` datetime NOT NULL,
  `planned_end_date` datetime NOT NULL,
  `actual_start_date` datetime DEFAULT NULL,
  `actual_end_date` datetime DEFAULT NULL,
  `estimated_hours` decimal(8,2) DEFAULT NULL,
  `actual_hours` decimal(8,2) DEFAULT '0.00',
  `material_cost` decimal(10,2) DEFAULT '0.00',
  `labor_cost` decimal(10,2) DEFAULT '0.00',
  `overhead_cost` decimal(10,2) DEFAULT '0.00',
  `total_cost` decimal(12,2) DEFAULT '0.00',
  `specifications` json DEFAULT NULL COMMENT 'Product specifications, measurements, colors, etc.',
  `materials_required` json DEFAULT NULL COMMENT 'List of materials and quantities required',
  `special_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `quality_parameters` json DEFAULT NULL COMMENT 'Quality check parameters and standards',
  `progress_percentage` decimal(5,2) DEFAULT '0.00',
  `created_by` int NOT NULL,
  `assigned_to` int DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `qa_lead_id` int DEFAULT NULL COMMENT 'QA Lead responsible for quality checks',
  `shift` enum('morning','afternoon','evening','night','day','flexible') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Production shift schedule',
  `team_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Notes about team assignments and responsibilities',
  `production_approval_id` int DEFAULT NULL COMMENT 'Link to the production approval that triggered this order',
  `project_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Project reference (usually sales_order_number) for grouping multiple production orders',
  PRIMARY KEY (`id`),
  UNIQUE KEY `production_number` (`production_number`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `production_orders_production_number` (`production_number`),
  KEY `production_orders_sales_order_id` (`sales_order_id`),
  KEY `production_orders_product_id` (`product_id`),
  KEY `production_orders_status` (`status`),
  KEY `production_orders_priority` (`priority`),
  KEY `production_orders_production_type` (`production_type`),
  KEY `production_orders_planned_start_date` (`planned_start_date`),
  KEY `production_orders_planned_end_date` (`planned_end_date`),
  KEY `production_orders_created_by` (`created_by`),
  KEY `production_orders_assigned_to` (`assigned_to`),
  KEY `production_orders_qa_lead_id_foreign_idx` (`qa_lead_id`),
  KEY `idx_production_orders_approval_id` (`production_approval_id`),
  KEY `idx_production_orders_project_reference` (`project_reference`),
  CONSTRAINT `production_orders_ibfk_1` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `production_orders_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `production_orders_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `production_orders_ibfk_4` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  CONSTRAINT `production_orders_ibfk_5` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `production_orders_production_approval_id_foreign_idx` FOREIGN KEY (`production_approval_id`) REFERENCES `production_approvals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `production_orders_qa_lead_id_foreign_idx` FOREIGN KEY (`qa_lead_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_orders`
--

LOCK TABLES `production_orders` WRITE;
/*!40000 ALTER TABLE `production_orders` DISABLE KEYS */;
INSERT INTO `production_orders` VALUES (3,'PRD-20251014-0001',1,1,100,0,0,0,'completed','medium','in_house','2025-10-15 00:00:00','2025-10-31 00:00:00','2025-10-14 17:44:42','2025-10-14 17:51:17',NULL,0.00,0.00,0.00,0.00,0.00,'{\"created_from\": \"approval\"}',NULL,'Materials needed for PRQ-20251014-00001 - Formal Shirt\nProduct: Formal Shirt (100 pcs)\nCustomer: nitin kamble\nQuantity: 100.000 pcs',NULL,100.00,6,NULL,NULL,'2025-10-14 13:42:13','2025-10-14 17:51:17',NULL,'day','fgdfgg',1,'SO-20251014-0001'),(23,'PRD-20251015-0001',2,3,200,0,0,0,'completed','medium','in_house','2025-10-16 00:00:00','2025-10-31 00:00:00','2025-10-15 12:46:40','2025-10-27 08:31:09',NULL,0.00,0.00,0.00,0.00,0.00,'{\"created_from\": \"approval\"}',NULL,'Materials needed for PRQ-20251015-00001 - T-shirt printing\nProduct: T-shirt printing (200 pcs)\nCustomer: Ashwini Khedekar\nQuantity: 200.000 pcs',NULL,100.00,6,NULL,NULL,'2025-10-15 12:46:40','2025-10-27 08:31:09',NULL,'flexible','uweuey',2,'SO-20251015-0001'),(24,'PRD-20251018-0001',2,NULL,200,0,0,0,'on_hold','medium','in_house','2025-10-18 00:00:00','2025-10-25 00:00:00','2025-10-18 07:23:23',NULL,NULL,0.00,0.00,0.00,0.00,0.00,'{\"created_from\": \"direct\", \"project_based\": true}',NULL,NULL,NULL,0.00,6,NULL,NULL,'2025-10-18 07:23:23','2025-10-18 07:57:09',NULL,'flexible',NULL,NULL,'SO-20251015-0001'),(25,'PRD-20251018-0002',3,NULL,100,0,0,0,'completed','medium','in_house','2025-10-19 00:00:00','2025-10-25 00:00:00','2025-10-18 08:07:06','2025-10-20 10:19:07',NULL,0.00,0.00,0.00,0.00,0.00,'{\"created_from\": \"direct\", \"project_based\": true}',NULL,NULL,NULL,100.00,6,NULL,NULL,'2025-10-18 08:07:06','2025-10-20 10:19:07',NULL,'flexible',NULL,NULL,'SO-20251016-0001'),(26,'PRD-20251027-0001',4,NULL,100,0,0,0,'completed','medium','mixed','2025-10-28 00:00:00','2025-11-30 00:00:00','2025-10-27 08:24:06','2025-10-27 08:29:11',NULL,0.00,0.00,0.00,0.00,0.00,'{\"created_from\": \"direct\", \"project_based\": true}',NULL,NULL,NULL,100.00,6,NULL,NULL,'2025-10-27 08:24:06','2025-10-27 08:29:11',NULL,'flexible',NULL,NULL,'SO-20251027-0001');
/*!40000 ALTER TABLE `production_orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-27 17:15:41
