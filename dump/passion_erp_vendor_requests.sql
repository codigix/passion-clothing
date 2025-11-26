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
-- Table structure for table `vendor_requests`
--

DROP TABLE IF EXISTS `vendor_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_number` varchar(50) NOT NULL COMMENT 'Format: VRQ-YYYYMMDD-XXXXX',
  `purchase_order_id` int NOT NULL,
  `grn_id` int NOT NULL COMMENT 'Original GRN that detected the shortage/overage',
  `vendor_id` int NOT NULL,
  `complaint_id` int DEFAULT NULL COMMENT 'Link to the shortage/overage complaint',
  `request_type` enum('shortage','overage') NOT NULL COMMENT 'Type of discrepancy being addressed',
  `items` json NOT NULL COMMENT 'Array of items with discrepancies',
  `total_value` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Total value of shortage/overage items',
  `status` enum('pending','sent','acknowledged','in_transit','fulfilled','cancelled') DEFAULT 'pending' COMMENT 'Current status of the vendor request',
  `message_to_vendor` text COMMENT 'Message sent to vendor explaining the discrepancy',
  `vendor_response` text COMMENT 'Vendor response or acknowledgment',
  `expected_fulfillment_date` datetime DEFAULT NULL COMMENT 'Expected date for vendor to fulfill the request',
  `fulfillment_grn_id` int DEFAULT NULL COMMENT 'GRN created when shortage items are received',
  `sent_at` datetime DEFAULT NULL COMMENT 'Timestamp when request was sent to vendor',
  `acknowledged_at` datetime DEFAULT NULL COMMENT 'Timestamp when vendor acknowledged the request',
  `fulfilled_at` datetime DEFAULT NULL COMMENT 'Timestamp when request was fulfilled',
  `created_by` int NOT NULL,
  `sent_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_number` (`request_number`),
  KEY `complaint_id` (`complaint_id`),
  KEY `sent_by` (`sent_by`),
  KEY `vendor_requests_request_number` (`request_number`),
  KEY `vendor_requests_purchase_order_id` (`purchase_order_id`),
  KEY `vendor_requests_grn_id` (`grn_id`),
  KEY `vendor_requests_vendor_id` (`vendor_id`),
  KEY `vendor_requests_status` (`status`),
  KEY `vendor_requests_request_type` (`request_type`),
  KEY `vendor_requests_fulfillment_grn_id` (`fulfillment_grn_id`),
  KEY `vendor_requests_created_by` (`created_by`),
  CONSTRAINT `vendor_requests_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `vendor_requests_ibfk_2` FOREIGN KEY (`grn_id`) REFERENCES `goods_receipt_notes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `vendor_requests_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `vendor_requests_ibfk_4` FOREIGN KEY (`complaint_id`) REFERENCES `approvals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vendor_requests_ibfk_5` FOREIGN KEY (`fulfillment_grn_id`) REFERENCES `goods_receipt_notes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vendor_requests_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `vendor_requests_ibfk_7` FOREIGN KEY (`sent_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_requests`
--

LOCK TABLES `vendor_requests` WRITE;
/*!40000 ALTER TABLE `vendor_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_requests` ENABLE KEYS */;
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
