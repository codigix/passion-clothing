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
  `po_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'PO Number for reference',
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_requests`
--

LOCK TABLES `production_requests` WRITE;
/*!40000 ALTER TABLE `production_requests` DISABLE KEYS */;
INSERT INTO `production_requests` VALUES (1,'PRQ-20251014-00001',NULL,NULL,'SO-SO-20251014-0001','Formal Shirt','Formal Shirt (100 pcs)','{\"items\": [{\"color\": \"blue\", \"total\": 50000, \"remarks\": \"T-Shirt - cotton - blue - 220 GSM Cotton\", \"quantity\": 100, \"item_code\": \"T-S-FORM-0599\", \"product_id\": \"T-S-FORM-0599\", \"unit_price\": 500, \"description\": \"Formal Shirt\", \"fabric_type\": \"cotton\", \"product_type\": \"T-Shirt\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"s\", \"quantity\": \"100\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}], \"customer_name\": \"nitin kamble\", \"garment_specifications\": {\"color\": \"blue\", \"design_file\": \"WhatsApp Image 2025-10-11 at 12.17.03 PM.jpeg\", \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"product_code\": \"T-S-FORM-0599\", \"product_name\": \"Formal Shirt\", \"product_type\": \"T-Shirt\", \"size_details\": [{\"size\": \"s\", \"quantity\": \"100\"}], \"quality_specification\": \"220 GSM Cotton\"}}',100.000,'pcs','medium','2025-10-30 00:00:00','reviewed',NULL,'Order reviewed and approved. Ready for MRN request.',NULL,2,6,'2025-10-14 12:50:25',NULL,'2025-10-14 12:43:05','2025-10-14 12:50:25',1,'SO-20251014-0001','Production request for Sales Order SO-20251014-0001. Customer: nitin kamble'),(2,'PRQ-20251015-00001',NULL,NULL,'SO-SO-20251015-0001','T-shirt printing','T-shirt printing (200 pcs)','{\"items\": [{\"color\": \"nevy blue\", \"total\": 100000, \"remarks\": \"T-Shirt - cotton - nevy blue - 220 GSM Cotton\", \"quantity\": 200, \"item_code\": \"T-S-TSHI-2475\", \"product_id\": \"T-S-TSHI-2475\", \"unit_price\": 500, \"description\": \"T-shirt printing\", \"fabric_type\": \"cotton\", \"product_type\": \"T-Shirt\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"s\", \"quantity\": \"100\"}, {\"size\": \"m\", \"quantity\": \"100\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}], \"customer_name\": \"Ashwini Khedekar\", \"garment_specifications\": {\"color\": \"nevy blue\", \"design_file\": \"\", \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"product_code\": \"T-S-TSHI-2475\", \"product_name\": \"T-shirt printing\", \"product_type\": \"T-Shirt\", \"size_details\": [{\"size\": \"s\", \"quantity\": \"100\"}, {\"size\": \"m\", \"quantity\": \"100\"}], \"quality_specification\": \"220 GSM Cotton\"}}',200.000,'pcs','medium','2025-10-30 00:00:00','reviewed',NULL,'Order reviewed and approved. Ready for MRN request.',NULL,2,6,'2025-10-15 06:33:59',NULL,'2025-10-15 06:14:40','2025-10-15 06:33:59',2,'SO-20251015-0001','Production request for Sales Order SO-20251015-0001. Customer: Ashwini Khedekar'),(3,'PRQ-20251016-00001',NULL,NULL,'SO-SO-20251016-0001','T-shirt printing','T-shirt printing (100 pcs)','{\"items\": [{\"color\": \"yellow\", \"total\": 30000, \"remarks\": \"T-Shirt - cotton - yellow - 220 GSM Cotton\", \"quantity\": 100, \"item_code\": \"T-S-TSHI-2512\", \"product_id\": \"T-S-TSHI-2512\", \"unit_price\": 300, \"description\": \"T-shirt printing\", \"fabric_type\": \"cotton\", \"product_type\": \"T-Shirt\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"s\", \"quantity\": \"100\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}], \"customer_name\": \"sanika mote\", \"garment_specifications\": {\"color\": \"yellow\", \"design_file\": \"\", \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"product_code\": \"T-S-TSHI-2512\", \"product_name\": \"T-shirt printing\", \"product_type\": \"T-Shirt\", \"size_details\": [{\"size\": \"s\", \"quantity\": \"100\"}], \"quality_specification\": \"220 GSM Cotton\"}}',100.000,'pcs','medium','2025-10-24 00:00:00','reviewed',NULL,'Order reviewed and approved. Ready for MRN request.',NULL,2,6,'2025-10-16 12:50:19',NULL,'2025-10-16 12:44:24','2025-10-16 12:50:19',3,'SO-20251016-0001','Production request for Sales Order SO-20251016-0001. Customer: sanika mote'),(4,'PRQ-20251027-00001',NULL,NULL,'SO-SO-20251027-0001','T-shirt printing','T-shirt printing (100 pcs)','{\"items\": [{\"color\": \"yellow\", \"total\": 49997, \"remarks\": \"T-Shirt - cotton - yellow - 220 GSM Cotton\", \"quantity\": 100, \"item_code\": \"T-S-TSHI-1616\", \"product_id\": \"T-S-TSHI-1616\", \"unit_price\": 499.97, \"description\": \"T-shirt printing\", \"fabric_type\": \"cotton\", \"product_type\": \"T-Shirt\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"s\", \"quantity\": \"20\"}, {\"size\": \"M\", \"quantity\": \"20\"}, {\"size\": \"L\", \"quantity\": \"20\"}, {\"size\": \"XL\", \"quantity\": \"20\"}, {\"size\": \"XXL\", \"quantity\": \"20\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}], \"customer_name\": \"Ashwini Khedekar\", \"garment_specifications\": {\"color\": \"yellow\", \"design_file\": \"femaledoc-CoRP0Ngx.png\", \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"product_code\": \"T-S-TSHI-1616\", \"product_name\": \"T-shirt printing\", \"product_type\": \"T-Shirt\", \"size_details\": [{\"size\": \"s\", \"quantity\": \"20\"}, {\"size\": \"M\", \"quantity\": \"20\"}, {\"size\": \"L\", \"quantity\": \"20\"}, {\"size\": \"XL\", \"quantity\": \"20\"}, {\"size\": \"XXL\", \"quantity\": \"20\"}], \"quality_specification\": \"220 GSM Cotton\"}}',100.000,'pcs','medium','2025-10-31 00:00:00','reviewed',NULL,'Order reviewed and approved. Ready for MRN request.',NULL,2,6,'2025-10-27 07:27:25',NULL,'2025-10-27 06:44:47','2025-10-27 07:27:25',4,'SO-20251027-0001','Production request for Sales Order SO-20251027-0001. Customer: Ashwini Khedekar'),(5,'PRQ-20251027-00002',NULL,NULL,'SO-SO-20251027-0001','T-shirt printing','T-shirt printing (100 pcs)','{\"items\": [{\"color\": \"yellow\", \"total\": 49997, \"remarks\": \"T-Shirt - cotton - yellow - 220 GSM Cotton\", \"quantity\": 100, \"item_code\": \"T-S-TSHI-1616\", \"product_id\": \"T-S-TSHI-1616\", \"unit_price\": 499.97, \"description\": \"T-shirt printing\", \"fabric_type\": \"cotton\", \"product_type\": \"T-Shirt\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"s\", \"quantity\": \"20\"}, {\"size\": \"M\", \"quantity\": \"20\"}, {\"size\": \"L\", \"quantity\": \"20\"}, {\"size\": \"XL\", \"quantity\": \"20\"}, {\"size\": \"XXL\", \"quantity\": \"20\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}], \"customer_name\": \"Ashwini Khedekar\", \"garment_specifications\": {\"color\": \"yellow\", \"design_file\": \"femaledoc-CoRP0Ngx.png\", \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"product_code\": \"T-S-TSHI-1616\", \"product_name\": \"T-shirt printing\", \"product_type\": \"T-Shirt\", \"size_details\": [{\"size\": \"s\", \"quantity\": \"20\"}, {\"size\": \"M\", \"quantity\": \"20\"}, {\"size\": \"L\", \"quantity\": \"20\"}, {\"size\": \"XL\", \"quantity\": \"20\"}, {\"size\": \"XXL\", \"quantity\": \"20\"}], \"quality_specification\": \"220 GSM Cotton\"}}',100.000,'pcs','medium','2025-10-31 00:00:00','reviewed',NULL,'Order reviewed and approved. Ready for MRN request.',NULL,2,6,'2025-10-27 07:33:50',NULL,'2025-10-27 06:45:03','2025-10-27 07:33:50',4,'SO-20251027-0001','Production request for Sales Order SO-20251027-0001. Customer: Ashwini Khedekar'),(6,'PRQ-20251027-00003',NULL,NULL,'SO-SO-20251027-0001','T-shirt printing','T-shirt printing (100 pcs)','{\"items\": [{\"color\": \"yellow\", \"total\": 49997, \"remarks\": \"T-Shirt - cotton - yellow - 220 GSM Cotton\", \"quantity\": 100, \"item_code\": \"T-S-TSHI-1616\", \"product_id\": \"T-S-TSHI-1616\", \"unit_price\": 499.97, \"description\": \"T-shirt printing\", \"fabric_type\": \"cotton\", \"product_type\": \"T-Shirt\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"s\", \"quantity\": \"20\"}, {\"size\": \"M\", \"quantity\": \"20\"}, {\"size\": \"L\", \"quantity\": \"20\"}, {\"size\": \"XL\", \"quantity\": \"20\"}, {\"size\": \"XXL\", \"quantity\": \"20\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}], \"customer_name\": \"Ashwini Khedekar\", \"garment_specifications\": {\"color\": \"yellow\", \"design_file\": \"femaledoc-CoRP0Ngx.png\", \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"product_code\": \"T-S-TSHI-1616\", \"product_name\": \"T-shirt printing\", \"product_type\": \"T-Shirt\", \"size_details\": [{\"size\": \"s\", \"quantity\": \"20\"}, {\"size\": \"M\", \"quantity\": \"20\"}, {\"size\": \"L\", \"quantity\": \"20\"}, {\"size\": \"XL\", \"quantity\": \"20\"}, {\"size\": \"XXL\", \"quantity\": \"20\"}], \"quality_specification\": \"220 GSM Cotton\"}}',100.000,'pcs','medium','2025-10-31 00:00:00','reviewed',NULL,'Order reviewed and approved. Ready for MRN request.',NULL,2,6,'2025-10-27 07:33:51',NULL,'2025-10-27 06:45:14','2025-10-27 07:33:51',4,'SO-20251027-0001','Production request for Sales Order SO-20251027-0001. Customer: Ashwini Khedekar');
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

-- Dump completed on 2025-10-28 11:44:27
