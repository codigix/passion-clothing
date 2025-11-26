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
-- Table structure for table `sales_orders`
--

DROP TABLE IF EXISTS `sales_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: SO-YYYYMMDD-XXXX',
  `customer_id` int NOT NULL,
  `order_date` datetime NOT NULL,
  `delivery_date` datetime NOT NULL,
  `buyer_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Buyer Reference / Style Reference',
  `order_type` enum('Knitted','Woven','Embroidery','Printing') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Type of order: Knitted/Woven/Embroidery/Printing',
  `items` json NOT NULL COMMENT 'Array of items with item_code, product_type, style_no, fabric_type, color, size_breakdown, quantity, unit_price, remarks, etc.',
  `qr_code` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'QR code data containing comprehensive order information (large JSON)',
  `garment_specifications` json DEFAULT NULL COMMENT 'Garment-specific requirements: fabric_type, gsm, color, quality_specs, etc.',
  `total_quantity` int NOT NULL DEFAULT '0',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `tax_percentage` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `final_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','confirmed','bom_generated','procurement_created','materials_received','in_production','on_hold','cutting_completed','printing_completed','stitching_completed','finishing_completed','qc_passed','ready_to_ship','shipped','delivered','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `priority` enum('low','medium','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `payment_terms` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `billing_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `special_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `internal_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approval_requested_by` int DEFAULT NULL COMMENT 'User who initiated the approval request',
  `approval_requested_at` datetime DEFAULT NULL COMMENT 'Timestamp when approval was requested',
  `approval_decision_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Notes captured during approval decision',
  `approval_decided_at` datetime DEFAULT NULL COMMENT 'Timestamp when approval decision was finalized',
  `ready_for_procurement` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Flag indicating the order is ready for procurement handoff',
  `ready_for_procurement_by` int DEFAULT NULL COMMENT 'User who marked the order procurement ready',
  `ready_for_procurement_at` datetime DEFAULT NULL COMMENT 'Timestamp when the order was marked procurement ready',
  `procurement_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Notes intended for procurement during PO creation',
  `production_started_at` datetime DEFAULT NULL,
  `production_completed_at` datetime DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `lifecycle_history` json DEFAULT NULL COMMENT 'Array of lifecycle events with timestamps, status changes, remarks, and responsible users',
  `has_lifecycle_qr` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Indicates if lifecycle QR tracking is enabled for the order',
  `lifecycle_qr_token` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token representing the linked lifecycle QR',
  `lifecycle_qr_status` enum('pending','active','revoked','expired') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lifecycle QR status at the order scope',
  `lifecycle_qr_generated_at` datetime DEFAULT NULL COMMENT 'Timestamp of the last lifecycle QR generation',
  `lifecycle_qr_last_scanned_at` datetime DEFAULT NULL COMMENT 'Last recorded scan timestamp for the order-level QR',
  `lifecycle_qr_scan_count` int NOT NULL DEFAULT '0' COMMENT 'Number of lifecycle QR scans aggregated for the order',
  `advance_paid` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Advance payment received from customer',
  `balance_amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Remaining balance to be paid',
  `invoice_status` enum('pending','generated','sent','paid','overdue') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Invoice generation and payment status',
  `challan_status` enum('pending','created','dispatched','delivered') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Delivery challan status',
  `procurement_status` enum('not_requested','requested','po_created','materials_ordered','materials_received','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_requested' COMMENT 'Procurement workflow status',
  `design_files` json DEFAULT NULL COMMENT 'Array of uploaded design/logo/artwork files',
  `invoice_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Generated invoice number',
  `invoice_date` datetime DEFAULT NULL COMMENT 'Invoice generation date',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `approval_status` enum('not_requested','pending','in_review','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_requested' COMMENT 'Approval lifecycle status for the sales order',
  `product_id` int DEFAULT NULL COMMENT 'Final product being manufactured',
  `product_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Product name for quick reference',
  `project_reference` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Project reference code used to link manufacturing orders',
  `project_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Human-friendly project name for dashboards and reports',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  UNIQUE KEY `lifecycle_qr_token` (`lifecycle_qr_token`),
  KEY `approved_by` (`approved_by`),
  KEY `approval_requested_by` (`approval_requested_by`),
  KEY `ready_for_procurement_by` (`ready_for_procurement_by`),
  KEY `sales_orders_order_number` (`order_number`),
  KEY `sales_orders_customer_id` (`customer_id`),
  KEY `sales_orders_status` (`status`),
  KEY `sales_orders_priority` (`priority`),
  KEY `sales_orders_order_date` (`order_date`),
  KEY `sales_orders_delivery_date` (`delivery_date`),
  KEY `sales_orders_created_by` (`created_by`),
  KEY `sales_orders_ready_for_procurement` (`ready_for_procurement`),
  KEY `sales_orders_lifecycle_qr_token` (`lifecycle_qr_token`),
  KEY `sales_orders_lifecycle_qr_status` (`lifecycle_qr_status`),
  KEY `sales_orders_lifecycle_qr_generated_at` (`lifecycle_qr_generated_at`),
  KEY `sales_orders_lifecycle_qr_last_scanned_at` (`lifecycle_qr_last_scanned_at`),
  KEY `sales_orders_invoice_status` (`invoice_status`),
  KEY `sales_orders_challan_status` (`challan_status`),
  KEY `sales_orders_procurement_status` (`procurement_status`),
  KEY `sales_orders_ready_for_procurement_idx` (`ready_for_procurement`),
  KEY `sales_orders_approval_status_idx` (`approval_status`),
  KEY `idx_sales_orders_product_id` (`product_id`),
  KEY `sales_orders_product_id` (`product_id`),
  KEY `sales_orders_approval_status` (`approval_status`),
  KEY `idx_sales_orders_project_reference` (`project_reference`),
  CONSTRAINT `sales_orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `sales_orders_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `sales_orders_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sales_orders_ibfk_4` FOREIGN KEY (`approval_requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sales_orders_ibfk_5` FOREIGN KEY (`ready_for_procurement_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sales_orders_product_id_foreign_idx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_orders`
--

LOCK TABLES `sales_orders` WRITE;
/*!40000 ALTER TABLE `sales_orders` DISABLE KEYS */;
INSERT INTO `sales_orders` VALUES (1,'SO-20251114-0001',1,'2025-11-14 08:23:22','2025-12-07 00:00:00','Prodigy public school',NULL,'[{\"color\": \"blue\", \"total\": 400000, \"remarks\": \"Uniform - cotton - blue - 220 GSM\", \"quantity\": 200, \"item_code\": \"UNI-UNIF-1848\", \"product_id\": \"UNI-UNIF-1848\", \"unit_price\": 2000, \"description\": \"uniform\", \"fabric_type\": \"cotton\", \"product_type\": \"Uniform\", \"style_number\": null, \"size_breakdown\": [], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}]','{\"order_id\":\"SO-20251114-0001\",\"status\":\"cutting\",\"customer\":\"Ashwini Khedekar\",\"delivery_date\":\"2025-12-07T00:00:00.000Z\",\"current_stage\":\"cutting\",\"lifecycle_history\":[{\"user\":1,\"event\":\"materials_received\",\"details\":\"Materials received from inventory. Receipt #: MRN-RCV-20251115-00001\",\"timestamp\":\"2025-11-15T07:24:19.538Z\"}],\"production_progress\":{\"total_quantity\":200,\"produced_quantity\":0,\"approved_quantity\":0,\"rejected_quantity\":0,\"completed_stages\":1,\"total_stages\":6,\"stages\":[{\"name\":\"Quality Check\",\"status\":\"pending\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":null,\"end_time\":null},{\"name\":\"Finishing\",\"status\":\"pending\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":null,\"end_time\":null},{\"name\":\"Stitching\",\"status\":\"pending\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":null,\"end_time\":null},{\"name\":\"Embroidery or Printing\",\"status\":\"pending\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":null,\"end_time\":null},{\"name\":\"Cutting\",\"status\":\"in_progress\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":\"2025-11-17T05:02:15.000Z\",\"end_time\":null},{\"name\":\"Calculate Material Review\",\"status\":\"completed\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":\"2025-11-15T07:29:00.000Z\",\"end_time\":\"2025-11-15T07:30:09.000Z\"}]},\"materials\":[],\"garment_specifications\":{\"color\":\"blue\",\"department\":null,\"fabric_type\":\"cotton\",\"size_option\":\"fixed\",\"design_files\":[\"Codigix-Logo-crop-e1726383845499.png\",\"WhatsApp Image 2025-10-29 at 10.29.04 AM.jpeg\"],\"product_code\":\"UNI-UNIF-1848\",\"product_name\":\"uniform\",\"product_type\":\"Uniform\",\"size_details\":[],\"special_instructions\":null,\"quality_specification\":\"220 GSM\"},\"total_quantity\":200,\"last_updated\":\"2025-11-17T05:02:15.935Z\"}','{\"color\": \"blue\", \"department\": null, \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"design_files\": [\"Codigix-Logo-crop-e1726383845499.png\", \"WhatsApp Image 2025-10-29 at 10.29.04 AM.jpeg\"], \"product_code\": \"UNI-UNIF-1848\", \"product_name\": \"uniform\", \"product_type\": \"Uniform\", \"size_details\": [], \"special_instructions\": null, \"quality_specification\": \"220 GSM\"}',200,400000.00,0.00,0.00,5.00,20000.00,420000.00,'in_production','medium',NULL,NULL,NULL,NULL,NULL,2,3,'2025-11-14 08:24:24',NULL,NULL,NULL,NULL,1,2,'2025-11-14 08:23:39',NULL,'2025-11-15 07:29:03',NULL,NULL,NULL,'[{\"user\": 1, \"event\": \"materials_received\", \"details\": \"Materials received from inventory. Receipt #: MRN-RCV-20251115-00001\", \"timestamp\": \"2025-11-15T07:24:19.538Z\"}]',0,NULL,NULL,NULL,NULL,0,0.00,420000.00,'pending','pending','po_created',NULL,NULL,NULL,'2025-11-14 08:23:22','2025-11-17 05:02:15','not_requested',NULL,NULL,NULL,'Prodigy public school'),(2,'SO-20251117-0001',1,'2025-11-17 06:46:36','2025-12-10 00:00:00','Moze college of engineering',NULL,'[{\"color\": \"sky blue shirt and nevy blue pant \", \"total\": 700000, \"remarks\": \"Uniform - cotton - sky blue shirt and nevy blue pant  - 220 GSM\", \"quantity\": 200, \"item_code\": \"UNI-UNIF-9982\", \"product_id\": \"UNI-UNIF-9982\", \"unit_price\": 3500, \"description\": \"uniform\", \"fabric_type\": \"cotton\", \"product_type\": \"Uniform\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"S\", \"quantity\": \"100\"}, {\"size\": \"M\", \"quantity\": \"100\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}]','{\"order_number\":\"SO-20251117-0001\",\"customer_id\":1,\"total_quantity\":200,\"final_amount\":735000,\"delivery_date\":\"2025-12-10\",\"status\":\"draft\",\"created_at\":\"2025-11-17T06:46:36.039Z\"}','{\"color\": \"sky blue shirt and nevy blue pant \", \"department\": null, \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"design_files\": [\"Codigix-Logo-crop-e1726383845499.png\", \"WhatsApp Image 2025-10-29 at 10.29.04 AM.jpeg\"], \"product_code\": \"UNI-UNIF-9982\", \"product_name\": \"uniform\", \"product_type\": \"Uniform\", \"size_details\": [{\"size\": \"S\", \"quantity\": \"100\"}, {\"size\": \"M\", \"quantity\": \"100\"}], \"special_instructions\": null, \"quality_specification\": \"220 GSM\"}',200,700000.00,0.00,0.00,5.00,35000.00,735000.00,'procurement_created','medium',NULL,NULL,NULL,NULL,NULL,2,3,'2025-11-17 10:45:10',NULL,NULL,NULL,NULL,1,2,'2025-11-17 06:47:10',NULL,NULL,NULL,NULL,NULL,'[]',0,NULL,NULL,NULL,NULL,0,0.00,735000.00,'generated','pending','po_created',NULL,'INV-20251117-0002','2025-11-17 06:46:38','2025-11-17 06:46:36','2025-11-17 10:59:18','not_requested',NULL,NULL,NULL,'Moze college of engineering');
/*!40000 ALTER TABLE `sales_orders` ENABLE KEYS */;
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
