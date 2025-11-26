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
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: INV-YYYYMMDD-XXXX',
  `invoice_type` enum('sales','purchase','service','credit_note','debit_note') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `challan_id` int DEFAULT NULL,
  `sales_order_id` int DEFAULT NULL,
  `purchase_order_id` int DEFAULT NULL,
  `invoice_date` datetime NOT NULL,
  `due_date` datetime NOT NULL,
  `items` json NOT NULL COMMENT 'Array of invoice items with product, quantity, rate, etc.',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `tax_details` json DEFAULT NULL COMMENT 'Tax breakdown - CGST, SGST, IGST, etc.',
  `total_tax_amount` decimal(10,2) DEFAULT '0.00',
  `shipping_charges` decimal(8,2) DEFAULT '0.00',
  `other_charges` decimal(8,2) DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(12,2) DEFAULT '0.00',
  `outstanding_amount` decimal(12,2) DEFAULT '0.00',
  `status` enum('draft','generated','sent','viewed','partial_paid','paid','overdue','cancelled','recorded') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `payment_status` enum('unpaid','partial','paid','overpaid') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'unpaid',
  `payment_terms` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `exchange_rate` decimal(10,4) DEFAULT '1.0000',
  `billing_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `terms_conditions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `internal_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reference_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'External reference like PO number, etc.',
  `pdf_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sent_date` datetime DEFAULT NULL,
  `viewed_date` datetime DEFAULT NULL,
  `last_payment_date` datetime DEFAULT NULL,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `challan_id` (`challan_id`),
  KEY `sales_order_id` (`sales_order_id`),
  KEY `purchase_order_id` (`purchase_order_id`),
  KEY `approved_by` (`approved_by`),
  KEY `invoices_invoice_number` (`invoice_number`),
  KEY `invoices_invoice_type` (`invoice_type`),
  KEY `invoices_vendor_id` (`vendor_id`),
  KEY `invoices_customer_id` (`customer_id`),
  KEY `invoices_status` (`status`),
  KEY `invoices_payment_status` (`payment_status`),
  KEY `invoices_invoice_date` (`invoice_date`),
  KEY `invoices_due_date` (`due_date`),
  KEY `invoices_created_by` (`created_by`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoices_ibfk_3` FOREIGN KEY (`challan_id`) REFERENCES `challans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoices_ibfk_4` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`),
  CONSTRAINT `invoices_ibfk_5` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`),
  CONSTRAINT `invoices_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `invoices_ibfk_7` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'INV-20251117-0002','sales',NULL,1,NULL,2,NULL,'2025-11-17 06:46:38','2025-12-10 00:00:00','[{\"color\": \"sky blue shirt and nevy blue pant \", \"total\": 700000, \"remarks\": \"Uniform - cotton - sky blue shirt and nevy blue pant  - 220 GSM\", \"quantity\": 200, \"item_code\": \"UNI-UNIF-9982\", \"product_id\": \"UNI-UNIF-9982\", \"unit_price\": 3500, \"description\": \"uniform\", \"fabric_type\": \"cotton\", \"product_type\": \"Uniform\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"S\", \"quantity\": \"100\"}, {\"size\": \"M\", \"quantity\": \"100\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}]',735000.00,0.00,0.00,NULL,0.00,0.00,0.00,735000.00,0.00,735000.00,'sent','partial','Net 30','INR',1.0000,NULL,NULL,'Invoice for Sales Order SO-20251117-0001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,NULL,NULL,'2025-11-17 06:46:38','2025-11-17 06:46:38'),(2,'INV-20251118-9CRP','purchase',1,NULL,NULL,NULL,3,'2025-11-18 07:22:09','2025-12-18 07:22:09','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"type\": \"accessories\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 07:22:09','2025-11-18 07:22:09'),(3,'INV-20251118-19XA','purchase',1,NULL,NULL,NULL,3,'2025-11-18 08:05:27','2025-12-18 08:05:27','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"type\": \"accessories\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 08:05:27','2025-11-18 08:05:27'),(4,'INV-20251118-UWN5','purchase',1,NULL,NULL,NULL,3,'2025-11-18 08:34:38','2025-12-18 08:34:38','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"type\": \"accessories\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 08:34:38','2025-11-18 08:34:38'),(5,'INV-20251118-D7Q0','purchase',1,NULL,NULL,NULL,3,'2025-11-18 08:34:53','2025-12-18 08:34:53','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"type\": \"accessories\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 08:34:53','2025-11-18 08:34:53'),(6,'INV-20251118-PR4O','purchase',1,NULL,NULL,NULL,3,'2025-11-18 08:39:29','2025-12-18 08:39:29','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 08:39:29','2025-11-18 08:39:29'),(13,'INV-20251118-R92L','purchase',1,NULL,NULL,NULL,3,'2025-11-18 09:48:47','2025-12-18 09:48:47','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 09:48:47','2025-11-18 09:48:47'),(14,'INV-20251118-HJNL','purchase',1,NULL,NULL,NULL,3,'2025-11-18 09:59:04','2025-12-18 09:59:04','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 09:59:04','2025-11-18 09:59:04'),(15,'INV-20251118-M45Z','purchase',1,NULL,NULL,NULL,3,'2025-11-18 10:13:37','2025-12-18 10:13:37','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 10:13:37','2025-11-18 10:13:37'),(16,'INV-20251118-BRHZ','purchase',1,NULL,NULL,NULL,3,'2025-11-18 10:25:03','2025-12-18 10:25:03','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'recorded','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 10:25:03','2025-11-18 10:25:14'),(17,'INV-20251118-J4ID','purchase',1,NULL,NULL,NULL,3,'2025-11-18 10:27:19','2025-12-18 10:27:19','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 10:27:19','2025-11-18 10:27:19'),(18,'INV-20251118-MU6K','purchase',1,NULL,NULL,NULL,2,'2025-11-18 10:27:43','2025-12-18 10:27:43','[{\"gsm\": \"200\", \"hsn\": \"5208\", \"uom\": \"Kilograms\", \"rate\": \"30.00\", \"color\": \"sky blue\", \"total\": 15000, \"width\": \"60\", \"remarks\": \"\", \"category\": \"fabric\", \"material\": \"cotton\", \"quantity\": \"200\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"cotton\", \"product_id\": 1, \"description\": \"cotton\", \"fabric_name\": \"cotton\", \"product_type\": \"raw_material\", \"material_needed\": \"2.5\", \"available_quantity\": 0, \"warehouse_location\": \"\"}, {\"gsm\": \"200\", \"hsn\": \"5208\", \"uom\": \"Kilograms\", \"rate\": \"30\", \"color\": \"navy blue\", \"total\": 15000, \"width\": \"60\", \"remarks\": \"\", \"material\": \"\", \"quantity\": \"200\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"\", \"product_id\": null, \"description\": \"\", \"fabric_name\": \"cotton\", \"specifications\": \"\", \"material_needed\": \"2.5\", \"available_quantity\": 0, \"warehouse_location\": \"\"}]',30000.00,5.00,1500.00,NULL,1500.00,0.00,0.00,31500.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 10:27:43','2025-11-18 10:27:43'),(19,'INV-20251118-RSUX','purchase',1,NULL,NULL,NULL,3,'2025-11-18 10:29:24','2025-12-18 10:29:24','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 10:29:24','2025-11-18 10:29:24'),(20,'INV-20251118-5Y3F','purchase',1,NULL,NULL,NULL,3,'2025-11-18 10:33:23','2025-12-18 10:33:23','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 10:33:23','2025-11-18 10:33:23'),(21,'INV-20251118-ZZVF','purchase',1,NULL,NULL,NULL,3,'2025-11-18 12:26:56','2025-12-18 12:26:56','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'recorded','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-18 12:26:56','2025-11-18 12:27:12'),(30,'INV-20251119-8P0I','purchase',1,NULL,NULL,NULL,3,'2025-11-19 09:42:18','2025-12-19 09:42:18','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"100.00\", \"color\": \"\", \"total\": 1000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastic\", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',1000.00,0.00,0.00,NULL,120.00,0.00,0.00,1120.00,0.00,0.00,'recorded','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-19 09:42:18','2025-11-19 09:42:57'),(31,'INV-20251119-37NW','purchase',1,NULL,NULL,NULL,10,'2025-11-19 11:12:26','2025-12-19 11:12:26','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"500\", \"color\": \"\", \"total\": 5000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastics \", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',5000.00,5.00,250.00,NULL,250.00,0.00,0.00,5250.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-19 11:12:26','2025-11-19 11:12:26'),(32,'INV-20251120-8BVJ','purchase',1,NULL,NULL,NULL,10,'2025-11-20 04:57:51','2025-12-20 04:57:51','[{\"gsm\": \"\", \"hsn\": \"5208\", \"uom\": \"Boxes\", \"rate\": \"500\", \"color\": \"\", \"total\": 5000, \"width\": \"\", \"remarks\": \"\", \"material\": \"plastics \", \"quantity\": \"10\", \"supplier\": \"nitin kamble\", \"tax_rate\": \"5\", \"item_name\": \"button\", \"description\": \"\", \"fabric_name\": \"\"}]',5000.00,5.00,250.00,NULL,250.00,0.00,0.00,5250.00,0.00,0.00,'draft','unpaid',NULL,'INR',1.0000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'2025-11-20 04:57:51','2025-11-20 04:57:51');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
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
