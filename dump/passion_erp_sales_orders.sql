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
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: SO-YYYYMMDD-XXXX',
  `customer_id` int NOT NULL,
  `order_date` datetime NOT NULL,
  `delivery_date` datetime NOT NULL,
  `buyer_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Buyer Reference / Style Reference',
  `order_type` enum('Knitted','Woven','Embroidery','Printing') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Type of order: Knitted/Woven/Embroidery/Printing',
  `items` json NOT NULL COMMENT 'Array of items with item_code, product_type, style_no, fabric_type, color, size_breakdown, quantity, unit_price, remarks, etc.',
  `qr_code` text COLLATE utf8mb4_unicode_ci COMMENT 'QR code data containing comprehensive order information (large JSON)',
  `garment_specifications` json DEFAULT NULL COMMENT 'Garment-specific requirements: fabric_type, gsm, color, quality_specs, etc.',
  `total_quantity` int NOT NULL DEFAULT '0',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `tax_percentage` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `final_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','confirmed','bom_generated','procurement_created','materials_received','in_production','cutting_completed','printing_completed','stitching_completed','finishing_completed','qc_passed','ready_to_ship','shipped','delivered','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `payment_terms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_address` text COLLATE utf8mb4_unicode_ci,
  `billing_address` text COLLATE utf8mb4_unicode_ci,
  `special_instructions` text COLLATE utf8mb4_unicode_ci,
  `internal_notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approval_requested_by` int DEFAULT NULL COMMENT 'User who initiated the approval request',
  `approval_requested_at` datetime DEFAULT NULL COMMENT 'Timestamp when approval was requested',
  `approval_decision_note` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes captured during approval decision',
  `approval_decided_at` datetime DEFAULT NULL COMMENT 'Timestamp when approval decision was finalized',
  `ready_for_procurement` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Flag indicating the order is ready for procurement handoff',
  `ready_for_procurement_by` int DEFAULT NULL COMMENT 'User who marked the order procurement ready',
  `ready_for_procurement_at` datetime DEFAULT NULL COMMENT 'Timestamp when the order was marked procurement ready',
  `procurement_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes intended for procurement during PO creation',
  `production_started_at` datetime DEFAULT NULL,
  `production_completed_at` datetime DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `lifecycle_history` json DEFAULT NULL COMMENT 'Array of lifecycle events with timestamps, status changes, remarks, and responsible users',
  `has_lifecycle_qr` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Indicates if lifecycle QR tracking is enabled for the order',
  `lifecycle_qr_token` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token representing the linked lifecycle QR',
  `lifecycle_qr_status` enum('pending','active','revoked','expired') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lifecycle QR status at the order scope',
  `lifecycle_qr_generated_at` datetime DEFAULT NULL COMMENT 'Timestamp of the last lifecycle QR generation',
  `lifecycle_qr_last_scanned_at` datetime DEFAULT NULL COMMENT 'Last recorded scan timestamp for the order-level QR',
  `lifecycle_qr_scan_count` int NOT NULL DEFAULT '0' COMMENT 'Number of lifecycle QR scans aggregated for the order',
  `advance_paid` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Advance payment received from customer',
  `balance_amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Remaining balance to be paid',
  `invoice_status` enum('pending','generated','sent','paid','overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Invoice generation and payment status',
  `challan_status` enum('pending','created','dispatched','delivered') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Delivery challan status',
  `procurement_status` enum('not_requested','requested','po_created','materials_ordered','materials_received','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_requested' COMMENT 'Procurement workflow status',
  `design_files` json DEFAULT NULL COMMENT 'Array of uploaded design/logo/artwork files',
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Generated invoice number',
  `invoice_date` datetime DEFAULT NULL COMMENT 'Invoice generation date',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `approval_status` enum('not_requested','pending','in_review','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_requested' COMMENT 'Approval lifecycle status for the sales order',
  `product_id` int DEFAULT NULL COMMENT 'Final product being manufactured',
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Product name for quick reference',
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
  CONSTRAINT `sales_orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `sales_orders_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `sales_orders_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sales_orders_ibfk_4` FOREIGN KEY (`approval_requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sales_orders_ibfk_5` FOREIGN KEY (`ready_for_procurement_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sales_orders_product_id_foreign_idx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_orders`
--

LOCK TABLES `sales_orders` WRITE;
/*!40000 ALTER TABLE `sales_orders` DISABLE KEYS */;
INSERT INTO `sales_orders` VALUES (1,'SO-20251014-0001',1,'2025-10-14 12:42:21','2025-10-30 00:00:00','Insurance Management Platform',NULL,'[{\"color\": \"blue\", \"total\": 50000, \"remarks\": \"T-Shirt - cotton - blue - 220 GSM Cotton\", \"quantity\": 100, \"item_code\": \"T-S-FORM-0599\", \"product_id\": \"T-S-FORM-0599\", \"unit_price\": 500, \"description\": \"Formal Shirt\", \"fabric_type\": \"cotton\", \"product_type\": \"T-Shirt\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"s\", \"quantity\": \"100\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}]','{\"order_id\":\"SO-20251014-0001\",\"status\":\"completed\",\"customer\":\"nitin kamble\",\"delivery_date\":\"2025-10-30T00:00:00.000Z\",\"current_stage\":\"completed\",\"lifecycle_history\":[{\"user\":6,\"event\":\"materials_received\",\"details\":\"Materials received from inventory. Receipt #: MRN-RCV-20251014-00001\",\"timestamp\":\"2025-10-14T12:52:37.073Z\"}],\"production_progress\":{\"total_quantity\":100,\"produced_quantity\":0,\"approved_quantity\":0,\"rejected_quantity\":0,\"completed_stages\":6,\"total_stages\":6,\"stages\":[{\"name\":\"Quality Check\",\"status\":\"completed\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":\"2025-10-14T17:46:05.000Z\",\"end_time\":\"2025-10-14T17:51:17.000Z\"},{\"name\":\"Finishing\",\"status\":\"completed\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":\"2025-10-14T17:45:59.000Z\",\"end_time\":\"2025-10-14T17:46:00.000Z\"},{\"name\":\"Stitching\",\"status\":\"completed\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":\"2025-10-14T17:45:54.000Z\",\"end_time\":\"2025-10-14T17:45:56.000Z\"},{\"name\":\"Embroidery or Printing\",\"status\":\"completed\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":\"2025-10-14T17:45:07.000Z\",\"end_time\":\"2025-10-14T17:45:50.000Z\"},{\"name\":\"Cutting\",\"status\":\"completed\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":\"2025-10-14T17:44:55.000Z\",\"end_time\":\"2025-10-14T17:44:57.000Z\"},{\"name\":\"Calculate Material Review\",\"status\":\"completed\",\"quantity_processed\":0,\"quantity_approved\":0,\"quantity_rejected\":0,\"start_time\":\"2025-10-15T04:40:00.000Z\",\"end_time\":\"2025-10-14T17:44:51.000Z\"}]},\"materials\":[],\"garment_specifications\":{\"color\":\"blue\",\"design_file\":\"WhatsApp Image 2025-10-11 at 12.17.03 PM.jpeg\",\"fabric_type\":\"cotton\",\"size_option\":\"fixed\",\"product_code\":\"T-S-FORM-0599\",\"product_name\":\"Formal Shirt\",\"product_type\":\"T-Shirt\",\"size_details\":[{\"size\":\"s\",\"quantity\":\"100\"}],\"quality_specification\":\"220 GSM Cotton\"},\"total_quantity\":100,\"last_updated\":\"2025-10-14T17:51:17.905Z\"}','{\"color\": \"blue\", \"design_file\": \"WhatsApp Image 2025-10-11 at 12.17.03 PM.jpeg\", \"fabric_type\": \"cotton\", \"size_option\": \"fixed\", \"product_code\": \"T-S-FORM-0599\", \"product_name\": \"Formal Shirt\", \"product_type\": \"T-Shirt\", \"size_details\": [{\"size\": \"s\", \"quantity\": \"100\"}], \"quality_specification\": \"220 GSM Cotton\"}',100,50000.00,0.00,0.00,5.00,2500.00,52500.00,'in_production','medium',NULL,NULL,NULL,NULL,NULL,2,3,'2025-10-14 12:43:36',NULL,NULL,NULL,NULL,1,2,'2025-10-14 12:43:05',NULL,'2025-10-14 13:42:13',NULL,NULL,NULL,'[{\"user\": 6, \"event\": \"materials_received\", \"details\": \"Materials received from inventory. Receipt #: MRN-RCV-20251014-00001\", \"timestamp\": \"2025-10-14T12:52:37.073Z\"}]',0,NULL,NULL,NULL,NULL,0,0.00,52500.00,'pending','pending','po_created',NULL,NULL,NULL,'2025-10-14 12:42:21','2025-10-14 17:51:17','not_requested',NULL,NULL);
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

-- Dump completed on 2025-10-14 23:25:22
