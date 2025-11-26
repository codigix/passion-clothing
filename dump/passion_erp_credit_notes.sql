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
-- Table structure for table `credit_notes`
--

DROP TABLE IF EXISTS `credit_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `credit_note_number` varchar(50) NOT NULL,
  `grn_id` int NOT NULL,
  `purchase_order_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `credit_note_date` datetime NOT NULL,
  `credit_note_type` enum('full_return','partial_credit','adjustment') NOT NULL DEFAULT 'partial_credit',
  `items` json NOT NULL,
  `subtotal_credit_amount` decimal(12,2) NOT NULL,
  `tax_percentage` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `total_credit_amount` decimal(12,2) NOT NULL,
  `status` enum('draft','issued','accepted','rejected','settled','cancelled') DEFAULT 'draft',
  `settlement_method` enum('cash_credit','return_material','adjust_invoice','future_deduction') DEFAULT NULL,
  `settlement_status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
  `settlement_date` datetime DEFAULT NULL,
  `settlement_notes` text,
  `vendor_response` text,
  `vendor_response_date` datetime DEFAULT NULL,
  `created_by` int NOT NULL,
  `issued_by` int DEFAULT NULL,
  `issued_date` datetime DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `remarks` text,
  `attachments` json DEFAULT NULL,
  `pdf_path` varchar(500) DEFAULT NULL,
  `invoice_adjustment_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `credit_note_number` (`credit_note_number`),
  KEY `issued_by` (`issued_by`),
  KEY `approved_by` (`approved_by`),
  KEY `invoice_adjustment_id` (`invoice_adjustment_id`),
  KEY `credit_notes_credit_note_number` (`credit_note_number`),
  KEY `credit_notes_grn_id` (`grn_id`),
  KEY `credit_notes_purchase_order_id` (`purchase_order_id`),
  KEY `credit_notes_vendor_id` (`vendor_id`),
  KEY `credit_notes_status` (`status`),
  KEY `credit_notes_settlement_status` (`settlement_status`),
  KEY `credit_notes_credit_note_date` (`credit_note_date`),
  KEY `credit_notes_created_by` (`created_by`),
  CONSTRAINT `credit_notes_ibfk_1` FOREIGN KEY (`grn_id`) REFERENCES `goods_receipt_notes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `credit_notes_ibfk_2` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `credit_notes_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `credit_notes_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `credit_notes_ibfk_5` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `credit_notes_ibfk_6` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `credit_notes_ibfk_7` FOREIGN KEY (`invoice_adjustment_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_notes`
--

LOCK TABLES `credit_notes` WRITE;
/*!40000 ALTER TABLE `credit_notes` DISABLE KEYS */;
INSERT INTO `credit_notes` VALUES (1,'CN-20251119-3740',2,3,1,'2025-11-19 12:21:09','adjustment','[{\"uom\": \"Boxes\", \"rate\": 100, \"unit\": \"Boxes\", \"material_id\": null, \"total_value\": 300, \"material_name\": \"button\", \"overage_quantity\": 3}]',300.00,0.00,0.00,300.00,'draft','adjust_invoice','pending',NULL,NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,'2025-11-19 12:21:09','2025-11-19 12:21:09'),(2,'CN-20251120-1227',2,3,1,'2025-11-20 04:47:46','adjustment','[{\"uom\": \"Boxes\", \"rate\": 100, \"unit\": \"Boxes\", \"material_id\": null, \"total_value\": 300, \"material_name\": \"button\", \"overage_quantity\": 3}]',300.00,0.00,0.00,300.00,'issued','adjust_invoice','pending',NULL,NULL,NULL,NULL,3,3,'2025-11-20 07:26:38',NULL,NULL,'',NULL,NULL,NULL,'2025-11-20 04:47:46','2025-11-20 07:26:38'),(3,'CN-20251120-6452',2,3,1,'2025-11-20 04:48:30','full_return','[{\"uom\": \"Boxes\", \"rate\": 100, \"unit\": \"Boxes\", \"material_id\": null, \"total_value\": 300, \"material_name\": \"button\", \"overage_quantity\": 3}]',300.00,0.00,0.00,300.00,'draft','return_material','pending',NULL,NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,'2025-11-20 04:48:30','2025-11-20 04:48:30'),(4,'CN-20251120-2087',2,3,1,'2025-11-20 05:16:00','full_return','[{\"uom\": \"Boxes\", \"rate\": 100, \"unit\": \"Boxes\", \"material_id\": null, \"total_value\": 300, \"material_name\": \"button\", \"overage_quantity\": 3}]',300.00,0.00,0.00,300.00,'draft','adjust_invoice','pending',NULL,NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,'2025-11-20 05:16:00','2025-11-20 05:16:00'),(5,'CN-20251120-7766',2,3,1,'2025-11-20 07:05:18','adjustment','[{\"uom\": \"Boxes\", \"rate\": 100, \"unit\": \"Boxes\", \"material_id\": null, \"total_value\": 300, \"material_name\": \"button\", \"overage_quantity\": 3}]',300.00,0.00,0.00,300.00,'accepted','adjust_invoice','in_progress',NULL,NULL,'Accepted','2025-11-20 07:24:51',3,3,'2025-11-20 07:20:30',NULL,NULL,'',NULL,NULL,NULL,'2025-11-20 07:05:18','2025-11-20 07:24:51'),(6,'CN-20251120-1527',2,3,1,'2025-11-20 07:25:20','full_return','[{\"uom\": \"Boxes\", \"rate\": 100, \"unit\": \"Boxes\", \"material_id\": null, \"total_value\": 300, \"material_name\": \"button\", \"overage_quantity\": 3}]',300.00,0.00,0.00,300.00,'issued','return_material','pending',NULL,NULL,NULL,NULL,3,3,'2025-11-20 07:25:36',NULL,NULL,'',NULL,NULL,NULL,'2025-11-20 07:25:20','2025-11-20 07:25:36');
/*!40000 ALTER TABLE `credit_notes` ENABLE KEYS */;
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
