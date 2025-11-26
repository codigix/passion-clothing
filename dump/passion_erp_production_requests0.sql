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
-- Table structure for table `production_requests`
--

DROP TABLE IF EXISTS `production_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: PR-YYYYMMDD-XXXXX',
  `po_id` int DEFAULT NULL,
  `po_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'PO Number for reference',
  `project_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `product_specifications` json DEFAULT NULL COMMENT 'Technical specifications, dimensions, materials, etc.',
  `quantity` decimal(15,3) NOT NULL,
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('low','medium','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `required_date` datetime NOT NULL,
  `status` enum('pending','reviewed','in_planning','materials_checking','ready_to_produce','in_production','quality_check','completed','on_hold','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `procurement_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `manufacturing_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `production_order_id` int DEFAULT NULL,
  `requested_by` int NOT NULL,
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sales_order_id` int DEFAULT NULL COMMENT 'Reference to Sales Order (if created from SO)',
  `sales_order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sales Order Number for reference',
  `sales_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Notes from Sales department',
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_number` (`request_number`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `production_requests_po_id` (`po_id`),
  KEY `production_requests_status` (`status`),
  KEY `production_requests_priority` (`priority`),
  KEY `production_requests_project_name` (`project_name`),
  KEY `production_requests_requested_by` (`requested_by`),
  KEY `production_requests_production_order_id` (`production_order_id`),
  KEY `production_requests_sales_order_id_idx` (`sales_order_id`),
  KEY `production_requests_request_number` (`request_number`),
  KEY `production_requests_required_date` (`required_date`),
  CONSTRAINT `production_requests_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `production_requests_ibfk_2` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `production_requests_ibfk_3` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `production_requests_ibfk_4` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `production_requests_ibfk_5` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`),
  CONSTRAINT `production_requests_ibfk_6` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`),
  CONSTRAINT `production_requests_ibfk_7` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`),
  CONSTRAINT `production_requests_sales_order_id_foreign_idx` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_requests`
--

LOCK TABLES `production_requests` WRITE;
/*!40000 ALTER TABLE `production_requests` DISABLE KEYS */;
INSERT INTO `production_requests` VALUES (1,'PRQ-20251114-00001',NULL,NULL,'Prodigy public school','uniform','uniform (200 pcs)','{\"items\": [{\"color\": \"blue\", \"total\": 400000, \"remarks\": \"Uniform - cotton - blue - 220 GSM\", \"quantity\": 200, \"item_code\": \"UNI-UNIF-1848\", \"product_id\": \"UNI-UNIF-1848\", \"unit_price\": 2000, \"description\": \"uniform\", \"fabric_type\": \"cotton\", \"product_type\": \"Uniform\", \"style_number\": null, \"size_breakdown\": [], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}], \"customer_name\": \"Ashwini Khedekar\", \"garment_specifications\": {\"color\": \"blue\", \"department\": null, \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"design_files\": [\"Codigix-Logo-crop-e1726383845499.png\", \"WhatsApp Image 2025-10-29 at 10.29.04 AM.jpeg\"], \"product_code\": \"UNI-UNIF-1848\", \"product_name\": \"uniform\", \"product_type\": \"Uniform\", \"size_details\": [], \"special_instructions\": null, \"quality_specification\": \"220 GSM\"}}',200.000,'pcs','medium','2025-12-07 00:00:00','pending',NULL,NULL,NULL,2,NULL,NULL,NULL,'2025-11-14 08:23:24','2025-11-14 08:23:24',1,'SO-20251114-0001','Production request for Sales Order SO-20251114-0001. Customer: Ashwini Khedekar'),(2,'PRQ-20251114-00002',NULL,NULL,'Prodigy public school','uniform','uniform (200 pcs)','{\"items\": [{\"color\": \"blue\", \"total\": 400000, \"remarks\": \"Uniform - cotton - blue - 220 GSM\", \"quantity\": 200, \"item_code\": \"UNI-UNIF-1848\", \"product_id\": \"UNI-UNIF-1848\", \"unit_price\": 2000, \"description\": \"uniform\", \"fabric_type\": \"cotton\", \"product_type\": \"Uniform\", \"style_number\": null, \"size_breakdown\": [], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}], \"customer_name\": \"Ashwini Khedekar\", \"garment_specifications\": {\"color\": \"blue\", \"department\": null, \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"design_files\": [\"Codigix-Logo-crop-e1726383845499.png\", \"WhatsApp Image 2025-10-29 at 10.29.04 AM.jpeg\"], \"product_code\": \"UNI-UNIF-1848\", \"product_name\": \"uniform\", \"product_type\": \"Uniform\", \"size_details\": [], \"special_instructions\": null, \"quality_specification\": \"220 GSM\"}}',200.000,'pcs','medium','2025-12-07 00:00:00','reviewed',NULL,'Order reviewed and approved. Ready for MRN request.',NULL,2,1,'2025-11-15 07:09:16',NULL,'2025-11-14 08:23:39','2025-11-15 07:09:16',1,'SO-20251114-0001','Production request for Sales Order SO-20251114-0001. Customer: Ashwini Khedekar'),(3,'PRQ-20251117-00001',NULL,NULL,'Moze college of engineering','uniform','uniform (200 pcs)','{\"items\": [{\"color\": \"sky blue shirt and nevy blue pant \", \"total\": 700000, \"remarks\": \"Uniform - cotton - sky blue shirt and nevy blue pant  - 220 GSM\", \"quantity\": 200, \"item_code\": \"UNI-UNIF-9982\", \"product_id\": \"UNI-UNIF-9982\", \"unit_price\": 3500, \"description\": \"uniform\", \"fabric_type\": \"cotton\", \"product_type\": \"Uniform\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"S\", \"quantity\": \"100\"}, {\"size\": \"M\", \"quantity\": \"100\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}], \"customer_name\": \"Ashwini Khedekar\", \"garment_specifications\": {\"color\": \"sky blue shirt and nevy blue pant \", \"department\": null, \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"design_files\": [\"Codigix-Logo-crop-e1726383845499.png\", \"WhatsApp Image 2025-10-29 at 10.29.04 AM.jpeg\"], \"product_code\": \"UNI-UNIF-9982\", \"product_name\": \"uniform\", \"product_type\": \"Uniform\", \"size_details\": [{\"size\": \"S\", \"quantity\": \"100\"}, {\"size\": \"M\", \"quantity\": \"100\"}], \"special_instructions\": null, \"quality_specification\": \"220 GSM\"}}',200.000,'pcs','medium','2025-12-10 00:00:00','pending',NULL,NULL,NULL,2,NULL,NULL,NULL,'2025-11-17 06:46:59','2025-11-17 06:46:59',2,'SO-20251117-0001','Production request for Sales Order SO-20251117-0001. Customer: Ashwini Khedekar'),(4,'PRQ-20251117-00002',NULL,NULL,'Moze college of engineering','uniform','uniform (200 pcs)','{\"items\": [{\"color\": \"sky blue shirt and nevy blue pant \", \"total\": 700000, \"remarks\": \"Uniform - cotton - sky blue shirt and nevy blue pant  - 220 GSM\", \"quantity\": 200, \"item_code\": \"UNI-UNIF-9982\", \"product_id\": \"UNI-UNIF-9982\", \"unit_price\": 3500, \"description\": \"uniform\", \"fabric_type\": \"cotton\", \"product_type\": \"Uniform\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"S\", \"quantity\": \"100\"}, {\"size\": \"M\", \"quantity\": \"100\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}], \"customer_name\": \"Ashwini Khedekar\", \"garment_specifications\": {\"color\": \"sky blue shirt and nevy blue pant \", \"department\": null, \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"design_files\": [\"Codigix-Logo-crop-e1726383845499.png\", \"WhatsApp Image 2025-10-29 at 10.29.04 AM.jpeg\"], \"product_code\": \"UNI-UNIF-9982\", \"product_name\": \"uniform\", \"product_type\": \"Uniform\", \"size_details\": [{\"size\": \"S\", \"quantity\": \"100\"}, {\"size\": \"M\", \"quantity\": \"100\"}], \"special_instructions\": null, \"quality_specification\": \"220 GSM\"}}',200.000,'pcs','medium','2025-12-10 00:00:00','pending',NULL,NULL,NULL,2,NULL,NULL,NULL,'2025-11-17 06:47:10','2025-11-17 06:47:10',2,'SO-20251117-0001','Production request for Sales Order SO-20251117-0001. Customer: Ashwini Khedekar');
/*!40000 ALTER TABLE `production_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 17:04:12
