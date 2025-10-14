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
-- Table structure for table `material_requirements`
--

DROP TABLE IF EXISTS `material_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_requirements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_order_id` int NOT NULL,
  `material_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Material ID or inventory item code',
  `description` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `required_quantity` decimal(10,3) NOT NULL,
  `allocated_quantity` decimal(10,3) DEFAULT '0.000',
  `consumed_quantity` decimal(10,3) DEFAULT '0.000',
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Meter, Kg, Pcs, etc.',
  `status` enum('available','shortage','ordered','allocated','consumed') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `material_requirements_production_order_id` (`production_order_id`),
  KEY `material_requirements_material_id` (`material_id`),
  KEY `material_requirements_status` (`status`),
  CONSTRAINT `material_requirements_ibfk_1` FOREIGN KEY (`production_order_id`) REFERENCES `production_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_requirements`
--

LOCK TABLES `material_requirements` WRITE;
/*!40000 ALTER TABLE `material_requirements` DISABLE KEYS */;
INSERT INTO `material_requirements` VALUES (5,3,'N/A','cotton plain ',100.000,0.000,0.000,'PCS','available',NULL,'2025-10-14 13:42:13','2025-10-14 13:42:13'),(6,3,'N/A','Button',4.000,0.000,0.000,'PCS','available',NULL,'2025-10-14 13:42:13','2025-10-14 13:42:13');
/*!40000 ALTER TABLE `material_requirements` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14 23:23:11
