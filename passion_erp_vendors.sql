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
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'India',
  `pincode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gst_number` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan_number` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor_type` enum('material_supplier','outsource_partner','service_provider','both') COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('fabric','accessories','embroidery','printing','stitching','finishing','transport','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `credit_limit` decimal(12,2) DEFAULT '0.00',
  `credit_days` int DEFAULT '0',
  `rating` decimal(3,2) DEFAULT NULL,
  `status` enum('active','inactive','blacklisted') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `bank_details` json DEFAULT NULL COMMENT 'Bank account details for payments',
  `documents` json DEFAULT NULL COMMENT 'Uploaded documents like GST certificate, PAN, etc.',
  `specializations` json DEFAULT NULL COMMENT 'List of specializations or services offered',
  `quality_rating` decimal(3,2) DEFAULT NULL,
  `delivery_rating` decimal(3,2) DEFAULT NULL,
  `price_rating` decimal(3,2) DEFAULT NULL,
  `last_order_date` datetime DEFAULT NULL,
  `total_orders` int DEFAULT '0',
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_code` (`vendor_code`),
  KEY `created_by` (`created_by`),
  KEY `vendors_vendor_code` (`vendor_code`),
  KEY `vendors_name` (`name`),
  KEY `vendors_vendor_type` (`vendor_type`),
  KEY `vendors_category` (`category`),
  KEY `vendors_status` (`status`),
  KEY `vendors_rating` (`rating`),
  KEY `vendors_city` (`city`),
  KEY `vendors_state` (`state`),
  CONSTRAINT `vendors_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,'VEN0001','abhijit','codigix','Ashwini Khedekar','Ashwinikhedekar1006@gmail.com','09112706604','','Gokul Nagar','Katraj, Pune','Maharashtra','India','411048','','','material_supplier','fabric','',0.00,0,NULL,'active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0.00,3,'2025-10-14 12:44:30','2025-10-14 12:44:30');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14 23:23:09
