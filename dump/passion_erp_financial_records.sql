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
-- Table structure for table `financial_records`
--

DROP TABLE IF EXISTS `financial_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `sales_order_id` int DEFAULT NULL,
  `record_number` varchar(255) NOT NULL,
  `record_type` enum('debit','credit','journal_entry') DEFAULT 'debit',
  `account_head` varchar(255) DEFAULT NULL,
  `description` text,
  `amount` decimal(12,2) NOT NULL,
  `project_id` int DEFAULT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `status` enum('draft','recorded','approved','rejected') DEFAULT 'recorded',
  `notes` text,
  `recorded_by_id` int DEFAULT NULL,
  `recorded_by_name` varchar(255) DEFAULT NULL,
  `recorded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `approved_by_id` int DEFAULT NULL,
  `approved_by_name` varchar(255) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `record_number` (`record_number`),
  KEY `financial_records_invoice_id` (`invoice_id`),
  KEY `financial_records_sales_order_id` (`sales_order_id`),
  KEY `financial_records_record_number` (`record_number`),
  KEY `financial_records_status` (`status`),
  CONSTRAINT `financial_records_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_records`
--

LOCK TABLES `financial_records` WRITE;
/*!40000 ALTER TABLE `financial_records` DISABLE KEYS */;
INSERT INTO `financial_records` VALUES (1,14,NULL,'FR-20251118-00001','debit','Vendor Invoice','Vendor invoice INV-20251118-HJNL for processing',1120.00,NULL,'','Procurement','recorded','',3,NULL,'2025-11-18 09:59:38',NULL,NULL,NULL,'2025-11-18 09:59:38','2025-11-18 09:59:38'),(2,14,NULL,'FR-20251118-00002','debit','Vendor Invoice','Vendor invoice INV-20251118-HJNL for processing',1120.00,NULL,'','Procurement','recorded','',3,NULL,'2025-11-18 09:59:45',NULL,NULL,NULL,'2025-11-18 09:59:45','2025-11-18 09:59:45'),(3,14,NULL,'FR-20251118-00003','debit','Vendor Invoice','Vendor invoice INV-20251118-HJNL for processing',1120.00,NULL,'','Procurement','recorded','',3,NULL,'2025-11-18 10:00:05',NULL,NULL,NULL,'2025-11-18 10:00:05','2025-11-18 10:00:05'),(4,15,NULL,'FR-20251118-00004','debit','Vendor Invoice','Vendor invoice INV-20251118-M45Z for processing',1120.00,NULL,'','Procurement','recorded','',3,NULL,'2025-11-18 10:13:45',NULL,NULL,NULL,'2025-11-18 10:13:45','2025-11-18 10:13:45'),(5,15,NULL,'FR-20251118-00005','debit','Vendor Invoice','Vendor invoice INV-20251118-M45Z for processing',1120.00,NULL,'','Procurement','recorded','',3,NULL,'2025-11-18 10:13:54',NULL,NULL,NULL,'2025-11-18 10:13:54','2025-11-18 10:13:54'),(6,16,NULL,'FR-20251118-00006','debit','Vendor Invoice','Vendor invoice INV-20251118-BRHZ for processing',1120.00,NULL,'','Procurement','recorded','',3,NULL,'2025-11-18 10:25:14',NULL,NULL,NULL,'2025-11-18 10:25:14','2025-11-18 10:25:14'),(7,21,NULL,'FR-20251118-00007','debit','Vendor Invoice','Vendor invoice INV-20251118-ZZVF for processing',1120.00,NULL,'','Procurement','recorded','',3,NULL,'2025-11-18 12:27:12',NULL,NULL,NULL,'2025-11-18 12:27:12','2025-11-18 12:27:12'),(9,30,NULL,'FR-20251119-00001','debit','Vendor Invoice','Vendor invoice INV-20251119-8P0I for PO PO-20251117-0002',1120.00,NULL,'Moze college of engineering','Procurement','recorded','',3,NULL,'2025-11-19 09:42:57',NULL,NULL,NULL,'2025-11-19 09:42:57','2025-11-19 09:42:57');
/*!40000 ALTER TABLE `financial_records` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 17:04:10
