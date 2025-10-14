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
-- Table structure for table `goods_receipt_notes`
--

DROP TABLE IF EXISTS `goods_receipt_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goods_receipt_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_order_id` int NOT NULL,
  `bill_of_materials_id` int DEFAULT NULL,
  `sales_order_id` int DEFAULT NULL,
  `received_date` datetime NOT NULL,
  `supplier_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_invoice_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inward_challan_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `items_received` json NOT NULL,
  `total_received_value` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','received','inspected','approved','rejected','vendor_revert_requested') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `inspection_notes` text COLLATE utf8mb4_unicode_ci,
  `quality_inspector` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approval_date` datetime DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `attachments` json DEFAULT NULL,
  `verification_status` enum('pending','verified','discrepancy','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `verified_by` int DEFAULT NULL,
  `verification_date` datetime DEFAULT NULL,
  `verification_notes` text COLLATE utf8mb4_unicode_ci,
  `discrepancy_details` json DEFAULT NULL,
  `discrepancy_approved_by` int DEFAULT NULL,
  `discrepancy_approval_date` datetime DEFAULT NULL,
  `discrepancy_approval_notes` text COLLATE utf8mb4_unicode_ci,
  `inventory_added` tinyint(1) NOT NULL DEFAULT '0',
  `inventory_added_date` datetime DEFAULT NULL,
  `vendor_revert_requested` tinyint(1) NOT NULL DEFAULT '0',
  `vendor_revert_reason` text COLLATE utf8mb4_unicode_ci,
  `vendor_revert_items` json DEFAULT NULL,
  `vendor_revert_requested_by` int DEFAULT NULL,
  `vendor_revert_requested_date` datetime DEFAULT NULL,
  `vendor_response` text COLLATE utf8mb4_unicode_ci,
  `vendor_response_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `vendor_revert_requested_at` datetime DEFAULT NULL COMMENT 'Timestamp when vendor revert was requested',
  `vendor_revert_approved_by` int DEFAULT NULL COMMENT 'User who approved/rejected the vendor revert',
  `vendor_revert_approved_at` datetime DEFAULT NULL COMMENT 'Timestamp when vendor revert was approved/rejected',
  `vendor_revert_status` enum('pending','approved','rejected','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Status of vendor revert request',
  `vendor_revert_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes from approval/rejection of vendor revert',
  `product_id` int DEFAULT NULL COMMENT 'Final product being manufactured',
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Product name for quick reference',
  PRIMARY KEY (`id`),
  UNIQUE KEY `grn_number` (`grn_number`),
  KEY `quality_inspector` (`quality_inspector`),
  KEY `created_by` (`created_by`),
  KEY `approved_by` (`approved_by`),
  KEY `verified_by` (`verified_by`),
  KEY `discrepancy_approved_by` (`discrepancy_approved_by`),
  KEY `vendor_revert_requested_by` (`vendor_revert_requested_by`),
  KEY `goods_receipt_notes_purchase_order_id` (`purchase_order_id`),
  KEY `goods_receipt_notes_bill_of_materials_id` (`bill_of_materials_id`),
  KEY `goods_receipt_notes_sales_order_id` (`sales_order_id`),
  KEY `goods_receipt_notes_status` (`status`),
  KEY `goods_receipt_notes_verification_status` (`verification_status`),
  KEY `goods_receipt_notes_grn_number` (`grn_number`),
  KEY `goods_receipt_notes_vendor_revert_approved_by_foreign_idx` (`vendor_revert_approved_by`),
  KEY `idx_goods_receipt_notes_product_id` (`product_id`),
  KEY `goods_receipt_notes_product_id` (`product_id`),
  CONSTRAINT `goods_receipt_notes_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `goods_receipt_notes_ibfk_2` FOREIGN KEY (`bill_of_materials_id`) REFERENCES `bill_of_materials` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `goods_receipt_notes_ibfk_3` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `goods_receipt_notes_ibfk_4` FOREIGN KEY (`quality_inspector`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `goods_receipt_notes_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `goods_receipt_notes_ibfk_6` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `goods_receipt_notes_ibfk_7` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `goods_receipt_notes_ibfk_8` FOREIGN KEY (`discrepancy_approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `goods_receipt_notes_ibfk_9` FOREIGN KEY (`vendor_revert_requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `goods_receipt_notes_product_id_foreign_idx` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `goods_receipt_notes_vendor_revert_approved_by_foreign_idx` FOREIGN KEY (`vendor_revert_approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goods_receipt_notes`
--

LOCK TABLES `goods_receipt_notes` WRITE;
/*!40000 ALTER TABLE `goods_receipt_notes` DISABLE KEYS */;
INSERT INTO `goods_receipt_notes` VALUES (1,'GRN-20251014-00001',1,NULL,1,'2025-10-14 00:00:00','abhijit','INV-0001','DC-0001','[{\"gsm\": \"180\", \"hsn\": \"100\", \"uom\": \"Meters\", \"rate\": 500, \"color\": \"blue\", \"total\": 50000, \"width\": \"100\", \"weight\": null, \"remarks\": \"\", \"description\": \"Formal Shirt\", \"material_name\": \"cotton\", \"quality_status\": \"pending_inspection\", \"discrepancy_flag\": false, \"ordered_quantity\": 100, \"overage_quantity\": 0, \"invoiced_quantity\": 100, \"received_quantity\": 100, \"shortage_quantity\": 0}, {\"gsm\": \"\", \"hsn\": \"\", \"uom\": \"Boxes\", \"rate\": 100, \"color\": \"\", \"total\": 1000, \"width\": \"\", \"weight\": null, \"remarks\": \"\", \"description\": \"green color \", \"material_name\": \"buttons\", \"quality_status\": \"pending_inspection\", \"discrepancy_flag\": false, \"ordered_quantity\": 10, \"overage_quantity\": 0, \"invoiced_quantity\": 10, \"received_quantity\": 10, \"shortage_quantity\": 0}]',51000.00,'approved',NULL,NULL,5,NULL,NULL,'jdhfd','[]','verified',5,'2025-10-14 12:48:33','',NULL,NULL,NULL,NULL,1,'2025-10-14 12:48:33',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-14 12:48:29','2025-10-14 12:48:33',NULL,NULL,NULL,'pending',NULL,NULL,NULL);
/*!40000 ALTER TABLE `goods_receipt_notes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14 23:25:25
