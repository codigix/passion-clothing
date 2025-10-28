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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` enum('sales','procurement','manufacturing','outsourcing','inventory','shipment','store','finance','admin','samples') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `profile_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `date_of_joining` datetime DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `emergency_contact` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`),
  KEY `created_by` (`created_by`),
  KEY `users_email` (`email`),
  KEY `users_employee_id` (`employee_id`),
  KEY `users_department` (`department`),
  KEY `users_status` (`status`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'EMP001','System Administrator','admin@pashion.com','$2a$10$1y5xhLIRiHmoOVt7dgLQdupYvatTaKC/80FbXEoN3pDpcLMm2kCzW',NULL,'admin','active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-12 16:54:18','2025-10-12 16:54:18'),(2,'EMP002','sales manager','salesmanager@company.com','$2a$12$fZl1/eKW0O.Nn20MCGfFEekSCTrmMAqpYcFNv0ETaTWDzO/xz53Ge',NULL,'sales','active','2025-10-27 06:46:00',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-12 16:55:42','2025-10-27 06:46:00'),(3,'EMP003','Procurement manager','Procurementmanager@company.com','$2a$12$9hL8wWj2jSFSbwVXsgtK5u1IDTGEF8k5PszjRcXq8rZROESHvnHJy',NULL,'procurement','active','2025-10-27 07:22:52',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-12 17:00:52','2025-10-27 07:22:52'),(4,'EMP004','admin','admin@company.com','$2a$12$ckOVYv.zXrg9BBpIg0s/T.SHjV/GJAs5aB2rqgXV0N2dN9Mwd1b0S',NULL,'admin','active','2025-10-27 07:22:21',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-12 17:06:20','2025-10-27 07:22:21'),(5,'EMP005','inventory manager','inventorymanager@company.com','$2a$12$CegD0YFh25gMaQD6HIgk5eL8Ta65RrgISi2QORTHtOP8n1xeqjzKG',NULL,'inventory','active','2025-10-28 05:38:04',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-12 17:07:31','2025-10-28 05:38:04'),(6,'EMP007','manufactor manger','manufacturemanager@company.com','$2a$12$3MPLRs0VoMHmHB59uNivqOQuFUGYGBc8MNnY/sBjTMpbWFU.1S87G',NULL,'manufacturing','active','2025-10-27 08:52:43',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-12 17:09:39','2025-10-27 08:52:43'),(7,'EMP009','Ashwini Khedekar','shipmentmanager@company.com','$2a$12$mzMfLAlKIbLmIHYIMhwjtOQV5a2QHV5zvnDm2PoJXaOjhBOH1Xyfe','09112706604','shipment','active','2025-10-28 05:39:19',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-16 06:03:12','2025-10-28 05:39:19'),(8,'EMP008','finan','financemanager@company.com','$2a$12$MdQnPTZG/liFGcv6EyvejuEW/U.rFoyV63r5lJXp3U5iEKMh1N6pC',NULL,'finance','active','2025-10-16 06:04:25',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-16 06:04:19','2025-10-16 06:04:25'),(9,'EMP0011','store manager','storemanager@company.com','$2a$12$y5fwCXziMd.UNywJffInPOUuzE..T8oZsTcdosW7Wj73zFT1ojtyG',NULL,'store','active','2025-10-16 06:08:17',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-16 06:08:04','2025-10-16 06:08:17'),(10,'EMP0012','Outsourcing ','outsource@company.com','$2a$12$MvySaDvi0yWa/LOiBihsiu/SLYGEgd7lsseB.uLl7yNjHxYHnalz6',NULL,'outsourcing','active','2025-10-16 07:24:16',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-16 07:24:12','2025-10-16 07:24:16'),(11,'EMP0020','Admin','admin@demo.com','$2a$12$CxqHVPNbeymzegS4BklTq.6ao0fqUUPmR4FbRK43VgUMraYAm8E.q','09112706604','admin','active','2025-10-24 13:24:52',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-24 13:24:46','2025-10-24 13:24:52');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28 11:44:47
