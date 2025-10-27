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
-- Table structure for table `shipments`
--

DROP TABLE IF EXISTS `shipments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shipment_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: SHP-YYYYMMDD-XXXX',
  `sales_order_id` int NOT NULL,
  `challan_id` int DEFAULT NULL,
  `shipment_date` datetime NOT NULL,
  `expected_delivery_date` datetime NOT NULL,
  `actual_delivery_date` datetime DEFAULT NULL,
  `items` json NOT NULL COMMENT 'Array of items being shipped',
  `total_quantity` int NOT NULL,
  `total_weight` decimal(8,2) DEFAULT NULL COMMENT 'Total weight in kg',
  `total_volume` decimal(8,2) DEFAULT NULL COMMENT 'Total volume in cubic meters',
  `packaging_details` json DEFAULT NULL COMMENT 'Number of boxes, bags, etc.',
  `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `courier_company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `courier_partner_id` int DEFAULT NULL,
  `courier_agent_id` int DEFAULT NULL,
  `tracking_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_cost` decimal(10,2) DEFAULT '0.00',
  `insurance_amount` decimal(10,2) DEFAULT '0.00',
  `cod_amount` decimal(10,2) DEFAULT '0.00',
  `status` enum('preparing','packed','ready_to_ship','shipped','in_transit','out_for_delivery','delivered','failed_delivery','returned','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'preparing',
  `shipping_method` enum('standard','express','overnight','same_day','pickup') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'standard',
  `payment_mode` enum('prepaid','cod','credit') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'prepaid',
  `special_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `delivery_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `recipient_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_attempts` int DEFAULT '0',
  `last_status_update` datetime DEFAULT NULL,
  `tracking_updates` json DEFAULT NULL COMMENT 'Array of tracking status updates',
  `proof_of_delivery` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Image or document path',
  `delivery_rating` int DEFAULT NULL,
  `delivery_feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `return_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shipment_number` (`shipment_number`),
  KEY `challan_id` (`challan_id`),
  KEY `courier_partner_id` (`courier_partner_id`),
  KEY `shipments_shipment_number` (`shipment_number`),
  KEY `shipments_sales_order_id` (`sales_order_id`),
  KEY `shipments_status` (`status`),
  KEY `shipments_tracking_number` (`tracking_number`),
  KEY `shipments_shipment_date` (`shipment_date`),
  KEY `shipments_expected_delivery_date` (`expected_delivery_date`),
  KEY `shipments_courier_company` (`courier_company`),
  KEY `shipments_created_by` (`created_by`),
  KEY `idx_shipments_courier_agent_id` (`courier_agent_id`),
  CONSTRAINT `fk_shipments_courier_agent_id` FOREIGN KEY (`courier_agent_id`) REFERENCES `courier_agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `shipments_ibfk_1` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipments_ibfk_2` FOREIGN KEY (`challan_id`) REFERENCES `challans` (`id`),
  CONSTRAINT `shipments_ibfk_3` FOREIGN KEY (`courier_partner_id`) REFERENCES `courier_partners` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `shipments_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipments`
--

LOCK TABLES `shipments` WRITE;
/*!40000 ALTER TABLE `shipments` DISABLE KEYS */;
INSERT INTO `shipments` VALUES (1,'SHP-20251025-541',3,NULL,'2025-10-25 07:08:14','2025-10-26 00:00:00','2025-10-25 08:01:33','[{\"color\": \"yellow\", \"total\": 30000, \"remarks\": \"T-Shirt - cotton - yellow - 220 GSM Cotton\", \"quantity\": 100, \"item_code\": \"T-S-TSHI-2512\", \"product_id\": \"T-S-TSHI-2512\", \"unit_price\": 300, \"description\": \"T-shirt printing\", \"fabric_type\": \"cotton\", \"product_type\": \"T-Shirt\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"s\", \"quantity\": \"100\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}]',100,0.00,0.00,NULL,'Gokul Nagar','codigix',NULL,NULL,'TRK-76082115-7998',0.00,0.00,0.00,'delivered','standard','prepaid',NULL,NULL,'sanika mote','09112706604','Ashwinikhedekar1006@gmail.com',0,'2025-10-25 08:01:33',NULL,NULL,NULL,NULL,NULL,7,'2025-10-25 07:08:14','2025-10-25 08:01:33'),(2,'SHP-20251025-970',1,NULL,'2025-10-25 08:13:58','2025-10-27 00:00:00','2025-10-25 08:14:50','[{\"color\": \"blue\", \"total\": 50000, \"remarks\": \"T-Shirt - cotton - blue - 220 GSM Cotton\", \"quantity\": 100, \"item_code\": \"T-S-FORM-0599\", \"product_id\": \"T-S-FORM-0599\", \"unit_price\": 500, \"description\": \"Formal Shirt\", \"fabric_type\": \"cotton\", \"product_type\": \"T-Shirt\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"s\", \"quantity\": \"100\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}]',100,0.00,0.00,NULL,'Gokul Nagar','codigix',NULL,NULL,'TRK-80025072-7005',0.00,0.00,0.00,'delivered','standard','prepaid',NULL,NULL,'nitin kamble','09112706604','Ashwinikhedekar1006@gmail.com',0,'2025-10-25 08:14:50',NULL,NULL,NULL,NULL,NULL,7,'2025-10-25 08:13:58','2025-10-25 08:14:50'),(9,'SHP-20251027-0001',2,NULL,'2025-10-27 09:14:40','2025-10-31 00:00:00','2025-10-27 11:42:12','[{\"color\": \"nevy blue\", \"total\": 100000, \"remarks\": \"T-Shirt - cotton - nevy blue - 220 GSM Cotton\", \"quantity\": 200, \"item_code\": \"T-S-TSHI-2475\", \"product_id\": \"T-S-TSHI-2475\", \"unit_price\": 500, \"description\": \"T-shirt printing\", \"fabric_type\": \"cotton\", \"product_type\": \"T-Shirt\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"s\", \"quantity\": \"100\"}, {\"size\": \"m\", \"quantity\": \"100\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}]',200,NULL,NULL,NULL,'Gokul Nagar',NULL,NULL,1,'COR-20251025-002-56131566-8735',0.00,0.00,0.00,'delivered','standard','prepaid','Bulk dispatch',NULL,'Ashwini Khedekar','sjdhfs','Ashwinikhedekar1006@gmail.com',0,'2025-10-27 11:42:12',NULL,NULL,NULL,NULL,NULL,7,'2025-10-27 09:14:40','2025-10-27 11:42:12'),(10,'SHP-20251027-0002',4,NULL,'2025-10-27 09:33:21','2025-10-31 00:00:00','2025-10-27 11:42:11','[{\"color\": \"yellow\", \"total\": 49997, \"remarks\": \"T-Shirt - cotton - yellow - 220 GSM Cotton\", \"quantity\": 100, \"item_code\": \"T-S-TSHI-1616\", \"product_id\": \"T-S-TSHI-1616\", \"unit_price\": 499.97, \"description\": \"T-shirt printing\", \"fabric_type\": \"cotton\", \"product_type\": \"T-Shirt\", \"style_number\": null, \"size_breakdown\": [{\"size\": \"s\", \"quantity\": \"20\"}, {\"size\": \"M\", \"quantity\": \"20\"}, {\"size\": \"L\", \"quantity\": \"20\"}, {\"size\": \"XL\", \"quantity\": \"20\"}, {\"size\": \"XXL\", \"quantity\": \"20\"}], \"specifications\": null, \"tax_percentage\": null, \"unit_of_measure\": \"pcs\", \"discount_percentage\": null}]',100,NULL,NULL,NULL,'Gokul Nagar',NULL,NULL,2,'COR-20251025-001-57579822-9757',0.00,0.00,0.00,'delivered','standard','prepaid','Bulk dispatch',NULL,'Ashwini Khedekar','09112706604','Ashwinikhedekar1006@gmail.com',0,'2025-10-27 11:42:11',NULL,NULL,NULL,NULL,NULL,7,'2025-10-27 09:33:21','2025-10-27 11:42:11');
/*!40000 ALTER TABLE `shipments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-27 17:16:58
