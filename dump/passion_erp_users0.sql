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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'EMP006','manufactor manger','manufacturemanager@company.com','$2a$12$10s091vnvgw8PSgu25eFKuyrrzPS5nx/y0xiolSJKZXi0jJsKCjcq','+919112706604','manufacturing','active','2025-11-17 05:01:41',NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-14 08:12:17','2025-11-17 05:01:41'),(2,'EMP001','sales manager','salesmanager@company.com','$2a$12$V4aDyO96.torAgAKjkZyf.dCZh2c8t1svOdQnz4Jfz0YfvZRucquu','+919112706604','sales','active','2025-11-19 11:10:43',NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-14 08:13:07','2025-11-19 11:10:43'),(3,'EMP002','Procurement manager','Procurementmanager@company.com','$2a$12$o9qi.EP5YCgT1KCQbsMo/uh88UEOwPl2oAa2/WvQDA0S6xA32kUZ.','+919112706604','procurement','active','2025-11-20 07:27:08',NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-14 08:24:12','2025-11-20 07:27:08'),(4,'EMP003','Admin','admin@company.com','$2a$12$TKOcw2Smyj58EoZHBq.JMu/zRASyf8YzA./bjMslUt/dLOIj1aRrC','+919112706604','admin','active','2025-11-19 12:11:10',NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-14 10:29:40','2025-11-19 12:11:10'),(5,'EMP004','finance','accountmanager@company.com','$2a$12$rpSuRb8userMWLlViITy/O2AhFbmtaWuGq02gABup4IRD.bI6Lyey','+919112706604','finance','active','2025-11-14 10:31:45',NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-14 10:31:36','2025-11-14 10:31:45'),(6,'EMP005','inventory manager','inventorymanager@company.com','$2a$12$io2t/LInR3KGFgE0gT.GKu6OKMM.1n6erFZyo.boBp/1NlrDUZ8mm','+919112706604','inventory','active','2025-11-19 12:12:24',NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-14 10:39:08','2025-11-19 12:12:24'),(7,'EMP008','finance','financemanager@company.com','$2a$12$FzJjso/ycBjRcFnBVWglgOXhuIogi9i7ZCz4bNvM3AvdwHf6uPnOO',NULL,'finance','active','2025-11-19 09:43:09',NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-17 08:26:21','2025-11-19 09:43:09'),(8,'ADMIN001','Administrator','admin@pashion.com','$2a$10$1q.HUBCtS7tVM/E3DK163eEMo8DKgJe9qg66Q/YiRmvb6Qnhm7YFK',NULL,'admin','active','2025-11-19 12:09:40',NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-17 09:09:57','2025-11-19 12:09:40');
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

-- Dump completed on 2025-11-26 17:04:10
