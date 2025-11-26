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
-- Table structure for table `grn_mismatch_requests`
--

DROP TABLE IF EXISTS `grn_mismatch_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grn_mismatch_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_number` varchar(50) NOT NULL COMMENT 'Format: GMR-YYYYMMDD-XXXXX (GRN Mismatch Request)',
  `grn_id` int NOT NULL COMMENT 'Reference to the GRN with mismatches',
  `purchase_order_id` int NOT NULL COMMENT 'Reference to the Purchase Order',
  `grn_number` varchar(50) NOT NULL COMMENT 'GRN number for quick reference',
  `po_number` varchar(50) NOT NULL COMMENT 'PO number for quick reference',
  `vendor_name` varchar(200) NOT NULL COMMENT 'Vendor name',
  `mismatch_type` enum('shortage','overage','both') NOT NULL COMMENT 'Type of mismatch detected',
  `mismatch_items` json NOT NULL COMMENT 'Array of mismatched items',
  `total_shortage_items` int DEFAULT '0' COMMENT 'Count of items with shortages',
  `total_overage_items` int DEFAULT '0' COMMENT 'Count of items with overages',
  `total_shortage_value` decimal(12,2) DEFAULT '0.00' COMMENT 'Total value of shortage items',
  `total_overage_value` decimal(12,2) DEFAULT '0.00' COMMENT 'Total value of overage items',
  `request_description` text COMMENT 'Detailed description of mismatches and impact',
  `requested_action` enum('accept_shortage','return_overage','wait_for_remaining','accept_and_adjust','request_replacement','cancel_remaining','other') NOT NULL COMMENT 'Action requested from Procurement team',
  `requested_action_notes` text COMMENT 'Additional notes about requested action',
  `status` enum('pending','acknowledged','under_review','approved','rejected','in_progress','resolved','cancelled') DEFAULT 'pending' COMMENT 'Current status of the mismatch request',
  `approval_notes` text COMMENT 'Approval/rejection notes from procurement team',
  `created_by` int NOT NULL COMMENT 'Inventory user who created the request',
  `reviewed_by` int DEFAULT NULL COMMENT 'Procurement user who reviewed/approved',
  `reviewed_at` datetime DEFAULT NULL COMMENT 'Date when reviewed/approved',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_number` (`request_number`),
  KEY `grn_mismatch_requests_request_number` (`request_number`),
  KEY `grn_mismatch_requests_grn_id` (`grn_id`),
  KEY `grn_mismatch_requests_purchase_order_id` (`purchase_order_id`),
  KEY `grn_mismatch_requests_po_number` (`po_number`),
  KEY `grn_mismatch_requests_grn_number` (`grn_number`),
  KEY `grn_mismatch_requests_status` (`status`),
  KEY `grn_mismatch_requests_mismatch_type` (`mismatch_type`),
  KEY `grn_mismatch_requests_requested_action` (`requested_action`),
  KEY `grn_mismatch_requests_created_by` (`created_by`),
  KEY `grn_mismatch_requests_reviewed_by` (`reviewed_by`),
  KEY `grn_mismatch_requests_created_at` (`created_at`),
  CONSTRAINT `grn_mismatch_requests_ibfk_1` FOREIGN KEY (`grn_id`) REFERENCES `goods_receipt_notes` (`id`),
  CONSTRAINT `grn_mismatch_requests_ibfk_2` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`),
  CONSTRAINT `grn_mismatch_requests_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `grn_mismatch_requests_ibfk_4` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grn_mismatch_requests`
--

LOCK TABLES `grn_mismatch_requests` WRITE;
/*!40000 ALTER TABLE `grn_mismatch_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `grn_mismatch_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 17:04:14
