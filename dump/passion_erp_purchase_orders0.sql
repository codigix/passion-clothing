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
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: PO-YYYYMMDD-XXXX',
  `vendor_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL COMMENT 'Customer for independent purchase orders',
  `project_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Project name for the purchase order',
  `linked_sales_order_id` int DEFAULT NULL,
  `po_date` datetime NOT NULL,
  `expected_delivery_date` datetime DEFAULT NULL,
  `items` json NOT NULL COMMENT 'Array of items with material requirements: item_code, material_type, spec, color, size, uom, quantity, price, remarks',
  `fabric_requirements` json DEFAULT NULL COMMENT 'Detailed fabric requirements: fabric_type, color, hsn_code, gsm_quality, uom, required_quantity, rate_per_unit, total, supplier_name, expected_delivery_date, remarks',
  `accessories` json DEFAULT NULL COMMENT 'Accessories requirements: accessory_item, description, hsn_code, uom, required_quantity, rate_per_unit, total, supplier_name, expected_delivery_date, remarks',
  `cost_summary` json DEFAULT NULL COMMENT 'Cost breakdown: fabric_total, accessories_total, sub_total, gst_percentage, gst_amount, freight, grand_total',
  `attachments` json DEFAULT NULL COMMENT 'Array of attachment files: filename, url, uploaded_at',
  `total_quantity` int NOT NULL DEFAULT '0',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `tax_percentage` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `final_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','pending_approval','approved','sent','acknowledged','dispatched','in_transit','grn_requested','partial_received','received','grn_shortage','grn_overage','reopened','excess_received','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `priority` enum('low','medium','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `payment_terms` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `advance_payment_percentage` decimal(5,2) DEFAULT NULL,
  `delivery_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `terms_conditions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `materials_source` enum('sales_order','bill_of_materials','manual') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `special_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `internal_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `bom_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approval_status` enum('not_requested','pending','in_review','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_requested' COMMENT 'Approval lifecycle status for the purchase order',
  `approval_decision_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Notes captured during procurement approval',
  `generated_from_sales_order` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Indicates if this PO originated from a sales order workflow',
  `sent_at` datetime DEFAULT NULL,
  `acknowledged_at` datetime DEFAULT NULL,
  `received_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `barcode` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unique barcode for the purchase order',
  `qr_code` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'QR code data containing PO details',
  `product_id` int DEFAULT NULL COMMENT 'Final product being manufactured',
  `product_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Product name for quick reference',
  `version_number` int DEFAULT '1' COMMENT 'Current version number of the PO',
  `change_history` json DEFAULT NULL COMMENT 'Array of all changes made to the PO',
  `last_edited_by` int DEFAULT NULL COMMENT 'User ID of person who last edited the PO',
  `last_edited_at` datetime DEFAULT NULL COMMENT 'Timestamp of last edit',
  `requires_reapproval` tinyint(1) DEFAULT '0' COMMENT 'Flag to indicate if PO requires re-approval',
  `po_pdf_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path to generated PO PDF file',
  `invoice_pdf_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path to generated Invoice PDF file',
  `po_pdf_generated_at` datetime DEFAULT NULL COMMENT 'Timestamp when PO PDF was generated',
  `invoice_pdf_generated_at` datetime DEFAULT NULL COMMENT 'Timestamp when Invoice PDF was generated',
  `accounting_notification_sent` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Flag to track if accounting department was notified with PDFs',
  `accounting_notification_sent_at` datetime DEFAULT NULL COMMENT 'Timestamp when accounting department notification was sent',
  `accounting_sent_by` int DEFAULT NULL COMMENT 'User ID who sent notification to accounting',
  `pdf_generation_status` enum('pending','generating','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'Current status of PDF generation',
  `pdf_error_message` text COLLATE utf8mb4_unicode_ci COMMENT 'Error message if PDF generation fails',
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_number` (`po_number`),
  KEY `bom_id` (`bom_id`),
  KEY `approved_by` (`approved_by`),
  KEY `purchase_orders_po_number` (`po_number`),
  KEY `purchase_orders_vendor_id` (`vendor_id`),
  KEY `purchase_orders_status` (`status`),
  KEY `purchase_orders_priority` (`priority`),
  KEY `purchase_orders_po_date` (`po_date`),
  KEY `purchase_orders_expected_delivery_date` (`expected_delivery_date`),
  KEY `purchase_orders_created_by` (`created_by`),
  KEY `purchase_orders_linked_sales_order_id` (`linked_sales_order_id`),
  KEY `purchase_orders_approval_status` (`approval_status`),
  KEY `purchase_orders_generated_from_sales_order` (`generated_from_sales_order`),
  KEY `purchase_orders_approval_status_idx` (`approval_status`),
  KEY `purchase_orders_generated_from_sales_order_idx` (`generated_from_sales_order`),
  KEY `idx_purchase_orders_customer_id` (`customer_id`),
  KEY `idx_purchase_orders_product_id` (`product_id`),
  KEY `purchase_orders_product_id` (`product_id`),
  KEY `idx_version_number` (`version_number`),
  KEY `idx_last_edited_at` (`last_edited_at`),
  KEY `idx_requires_reapproval` (`requires_reapproval`),
  KEY `purchase_orders_version_number` (`version_number`),
  KEY `purchase_orders_last_edited_at` (`last_edited_at`),
  KEY `purchase_orders_requires_reapproval` (`requires_reapproval`),
  KEY `purchase_orders_last_edited_by` (`last_edited_by`),
  KEY `purchase_orders_accounting_notification_sent` (`accounting_notification_sent`),
  KEY `purchase_orders_pdf_generation_status` (`pdf_generation_status`),
  CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_3` FOREIGN KEY (`linked_sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_4` FOREIGN KEY (`bom_id`) REFERENCES `bill_of_materials` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_6` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_product_id_foreign_idx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
INSERT INTO `purchase_orders` VALUES (1,'PO-20251114-0001',1,1,'Prodigy public school',1,'2025-11-14 10:29:06','2025-12-07 00:00:00','[{\"gsm\": \"200\", \"hsn\": \"5208\", \"uom\": \"Meters\", \"rate\": \"30\", \"type\": \"fabric\", \"color\": \"blue\", \"total\": 15000, \"width\": \"60\", \"remarks\": \"\", \"quantity\": \"200\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"\", \"description\": \"\", \"fabric_name\": \"cotton\", \"material_needed\": \"2.5\"}, {\"gsm\": \"200\", \"hsn\": \"5208\", \"uom\": \"Meters\", \"rate\": \"30\", \"type\": \"fabric\", \"color\": \"white \", \"total\": 15000, \"width\": \"60\", \"remarks\": \"\", \"material\": \"\", \"quantity\": \"200\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"\", \"product_id\": null, \"description\": \"\", \"fabric_name\": \"cotton\", \"specifications\": \"\", \"material_needed\": \"2.5\", \"available_quantity\": 0, \"warehouse_location\": \"\"}]',NULL,NULL,NULL,NULL,400,30000.00,5.00,1500.00,5.00,1425.00,30925.00,'received','medium','{\"selected\":[\"50% Advance • 50% Before Delivery\"],\"custom_value\":\"\"}',NULL,'bhoari pune ','{\"selected\":[\"I accept the delivery timeline and schedule.\"],\"optional_notes\":\"\"}',NULL,'{\"selected\":[\"Separate packaging required per item\"],\"additional_notes\":\"\"}','Linked to Sales Order: SO-20251114-0001\n\n[2025-11-14T10:38:38.308Z] Materials received - confirmed by Procurement manager',NULL,3,4,NULL,'approved',NULL,0,'2025-11-14 10:30:35',NULL,'2025-11-14 10:38:38','2025-11-14 10:29:06','2025-11-14 10:39:46','PO-20251114-E3BFCE',NULL,NULL,NULL,1,'[]',NULL,NULL,0,NULL,NULL,NULL,NULL,0,NULL,NULL,'pending',NULL),(2,'PO-20251117-0001',1,1,'Moze college of engineering',2,'2025-11-17 10:59:17','2025-12-10 00:00:00','[{\"gsm\": \"200\", \"hsn\": \"5208\", \"uom\": \"Kilograms\", \"rate\": \"30.00\", \"type\": \"fabric\", \"color\": \"sky blue\", \"total\": 15000, \"width\": \"60\", \"remarks\": \"\", \"category\": \"fabric\", \"material\": \"cotton\", \"quantity\": \"200\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"cotton\", \"product_id\": 1, \"description\": \"cotton\", \"fabric_name\": \"cotton\", \"product_type\": \"raw_material\", \"material_needed\": \"2.5\", \"available_quantity\": 0, \"warehouse_location\": \"\"}, {\"gsm\": \"200\", \"hsn\": \"5208\", \"uom\": \"Kilograms\", \"rate\": \"30\", \"type\": \"fabric\", \"color\": \"navy blue\", \"total\": 15000, \"width\": \"60\", \"remarks\": \"\", \"material\": \"\", \"quantity\": \"200\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"\", \"product_id\": null, \"description\": \"\", \"fabric_name\": \"cotton\", \"specifications\": \"\", \"material_needed\": \"2.5\", \"available_quantity\": 0, \"warehouse_location\": \"\"}]',NULL,NULL,NULL,NULL,400,30000.00,5.00,1500.00,5.00,1425.00,30925.00,'grn_requested','medium','{\"selected\":[\"50% Advance • 50% Before Delivery\"],\"custom_value\":\"\"}',NULL,'bhoari pune ','{\"selected\":[\"I confirm the product specifications and quantities are correct.\"],\"optional_notes\":\"\"}',NULL,'{\"selected\":[\"Add customer branding / labeling\"],\"additional_notes\":\"\"}','Linked to Sales Order: SO-20251117-0001\n\n[2025-11-19T12:11:31.278Z] Materials received - confirmed by Procurement manager',NULL,3,4,NULL,'approved',NULL,0,'2025-11-17 11:26:55',NULL,'2025-11-19 12:11:31','2025-11-17 10:59:17','2025-11-19 12:11:31','PO-20251117-D129DD',NULL,NULL,NULL,1,'[]',NULL,NULL,0,NULL,NULL,NULL,NULL,0,NULL,NULL,'pending',NULL),(3,'PO-20251117-0002',1,1,'Moze college of engineering',2,'2025-11-17 11:24:32','2025-12-10 00:00:00','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"type\": \"accessories\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',NULL,NULL,NULL,NULL,10,1000.00,0.00,0.00,12.00,120.00,1120.00,'grn_overage','medium','{\"selected\":[\"50% Advance • 50% Before Delivery\"],\"custom_value\":\"\"}',NULL,'','{\"selected\":[\"I confirm the product specifications and quantities are correct.\"],\"optional_notes\":\"\"}',NULL,'{\"selected\":[\"Separate packaging required per item\"],\"additional_notes\":\"\"}','Linked to Sales Order: SO-20251117-0001\n\n[2025-11-19T05:04:59.809Z] Materials received - confirmed by Procurement manager',NULL,3,4,NULL,'approved',NULL,0,'2025-11-17 11:26:46',NULL,'2025-11-19 05:04:59','2025-11-17 11:24:32','2025-11-19 12:17:30','PO-20251117-E342B5',NULL,NULL,NULL,1,'[]',NULL,NULL,0,NULL,NULL,NULL,NULL,0,NULL,NULL,'pending',NULL),(10,'PO-20251119-0007',1,1,'Moze college of engineering',2,'2025-11-19 07:14:45','2025-12-10 00:00:00','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"500\", \"type\": \"accessories\", \"color\": \"\", \"total\": 5000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastics \", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',NULL,NULL,NULL,NULL,10,5000.00,5.00,250.00,5.00,237.50,5087.50,'approved','medium','{\"selected\":[\"50% Advance • 50% Before Delivery\"],\"custom_value\":\"\"}',NULL,'','{\"selected\":[\"I accept the delivery timeline and schedule.\"],\"optional_notes\":\"\"}',NULL,'{\"selected\":[\"Add customer branding / labeling\"],\"additional_notes\":\"\"}','Linked to Sales Order: SO-20251117-0001',NULL,3,4,NULL,'approved',NULL,0,NULL,NULL,NULL,'2025-11-19 07:14:45','2025-11-19 11:17:18','PO-20251119-2C6E70',NULL,NULL,NULL,1,'[]',NULL,NULL,0,NULL,NULL,NULL,NULL,0,NULL,NULL,'pending',NULL);
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 17:04:11
