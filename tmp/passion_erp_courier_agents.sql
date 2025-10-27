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
-- Table structure for table `courier_agents`
--

DROP TABLE IF EXISTS `courier_agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courier_agents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique agent ID (e.g., COR-20250117-001)',
  `courier_company` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Courier company name',
  `agent_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Agent full name',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Agent email',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Agent phone number',
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Region/Territory covered by agent',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Bcrypted password',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Active/Inactive status',
  `is_verified` tinyint(1) DEFAULT '0' COMMENT 'Email verified status',
  `verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email verification token',
  `last_login` datetime DEFAULT NULL COMMENT 'Last login timestamp',
  `performance_rating` decimal(3,2) DEFAULT '0.00' COMMENT 'Average performance rating (0-5)',
  `total_shipments` int DEFAULT '0' COMMENT 'Total shipments handled',
  `on_time_deliveries` int DEFAULT '0' COMMENT 'Number of on-time deliveries',
  `failed_deliveries` int DEFAULT '0' COMMENT 'Number of failed deliveries',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Additional notes',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agent_id` (`agent_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_courier_company` (`courier_company`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_agent_id` (`agent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores courier agent information for shipment management';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courier_agents`
--

LOCK TABLES `courier_agents` WRITE;
/*!40000 ALTER TABLE `courier_agents` DISABLE KEYS */;
INSERT INTO `courier_agents` VALUES (1,'COR-20251025-001','adsasds','dsds','Ashwinikhedekar1006@gmail.com','09112706604','Maharashtra','$2b$10$Yq.ETIZ4sORb4EunZkKAO.rsesjlL6llqEX9KooPgdi5sH2DQ0yhG',1,0,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkFzaHdpbmlraGVkZWthcjEwMDZAZ21haWwuY29tIiwiaWF0IjoxNzYxMzY5MDU5LCJleHAiOjE3NjE5NzM4NTl9.gTCnPqGIp-FHzD3QpdkJAFZEEfuaizkgbbIqlAt0UH8',NULL,0.00,0,0,0,'sadsd','2025-10-25 05:10:59','2025-10-25 05:11:07'),(2,'COR-20251025-002','codigix infotech','ashwini khedekar','backendcodigix@gmail.com','9112706604','Maharashtra','$2b$10$fYF0bMteybMLtO7iu5KOQ.8kWJKitEk5uKIbVMQOLNouUDA2zNWvm',1,0,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJhY2tlbmRjb2RpZ2l4QGdtYWlsLmNvbSIsImlhdCI6MTc2MTM3MjIzOSwiZXhwIjoxNzYxOTc3MDM5fQ.BQCRCRrBOvsgGdlZFPAKTNqmqqkOSwdlGoPyR6DQZv0',NULL,0.00,0,0,0,'hgfhfhg','2025-10-25 06:03:59','2025-10-25 06:03:59');
/*!40000 ALTER TABLE `courier_agents` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-27 17:15:43
