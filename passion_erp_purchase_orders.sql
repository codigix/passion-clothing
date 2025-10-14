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
  `po_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: PO-YYYYMMDD-XXXX',
  `vendor_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL COMMENT 'Customer for independent purchase orders',
  `project_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Project name for the purchase order',
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
  `status` enum('draft','pending_approval','approved','sent','acknowledged','grn_requested','partial_received','received','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `payment_terms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_address` text COLLATE utf8mb4_unicode_ci,
  `terms_conditions` text COLLATE utf8mb4_unicode_ci,
  `materials_source` enum('sales_order','bill_of_materials','manual') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `special_instructions` text COLLATE utf8mb4_unicode_ci,
  `internal_notes` text COLLATE utf8mb4_unicode_ci,
  `bom_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approval_status` enum('not_requested','pending','in_review','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_requested' COMMENT 'Approval lifecycle status for the purchase order',
  `approval_decision_note` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes captured during procurement approval',
  `generated_from_sales_order` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Indicates if this PO originated from a sales order workflow',
  `sent_at` datetime DEFAULT NULL,
  `acknowledged_at` datetime DEFAULT NULL,
  `received_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `barcode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unique barcode for the purchase order',
  `qr_code` text COLLATE utf8mb4_unicode_ci COMMENT 'QR code data containing PO details',
  `product_id` int DEFAULT NULL COMMENT 'Final product being manufactured',
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Product name for quick reference',
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
  CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_3` FOREIGN KEY (`linked_sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_4` FOREIGN KEY (`bom_id`) REFERENCES `bill_of_materials` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_6` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_product_id_foreign_idx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
INSERT INTO `purchase_orders` VALUES (1,'PO-20251014-0001',1,1,'Insurance Management Platform',1,'2025-10-14 12:46:29','2025-10-30 00:00:00','[{\"gsm\": \"180\", \"hsn\": \"100\", \"uom\": \"Meters\", \"rate\": 500, \"type\": \"fabric\", \"color\": \"blue\", \"total\": 50000, \"width\": \"100\", \"remarks\": \"T-Shirt - cotton - blue - 220 GSM Cotton\", \"quantity\": 100, \"supplier\": \"abhijit\", \"item_name\": \"Formal Shirt\", \"description\": \"Formal Shirt\", \"fabric_name\": \"cotton\"}, {\"gsm\": \"\", \"hsn\": \"\", \"uom\": \"Boxes\", \"rate\": \"100\", \"type\": \"accessories\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"sjdhsjdsjd\", \"quantity\": \"10\", \"supplier\": \"abhijit\", \"item_name\": \"buttons\", \"description\": \"green color \", \"fabric_name\": \"\"}]',NULL,NULL,NULL,NULL,110,51000.00,10.00,5100.00,12.00,5508.00,52408.00,'received','medium','50% advance','bhoari pune ','ejhferhfeur',NULL,'hfiuhfugu','Linked to Sales Order: SO-20251014-0001\n\n[2025-10-14T12:47:19.635Z] Materials received - confirmed by Procurement manager',NULL,3,4,NULL,'approved','Submitted for approval from procurement dashboard',0,NULL,NULL,'2025-10-14 12:47:19','2025-10-14 12:46:29','2025-10-14 12:47:19','PO-20251014-E7B68F',NULL,NULL,NULL);
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

-- Dump completed on 2025-10-14 23:23:10
