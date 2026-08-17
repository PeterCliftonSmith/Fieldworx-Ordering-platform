/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: fieldworx
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `order_lines`
--

DROP TABLE IF EXISTS `order_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_lines` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` varchar(64) NOT NULL,
  `supplier_id` varchar(64) NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `product_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `variation_id` varchar(64) DEFAULT NULL,
  `variation_name` varchar(255) DEFAULT NULL,
  `unit` varchar(64) NOT NULL,
  `image` text NOT NULL,
  `image_alt` varchar(255) NOT NULL,
  `price_ex_vat` decimal(12,2) NOT NULL,
  `price_incl_vat` decimal(12,2) NOT NULL,
  `quantity` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_lines_order` (`order_id`),
  CONSTRAINT `fk_order_lines_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_lines`
--

LOCK TABLES `order_lines` WRITE;
/*!40000 ALTER TABLE `order_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(64) NOT NULL,
  `created_at` datetime NOT NULL,
  `customer_id` varchar(64) NOT NULL,
  `username` varchar(64) NOT NULL,
  `trading_name` varchar(255) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'submitted',
  `subtotal_ex_vat` decimal(12,2) NOT NULL,
  `vat_total` decimal(12,2) NOT NULL,
  `total_incl_vat` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_orders_customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variations`
--

DROP TABLE IF EXISTS `product_variations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variations` (
  `id` varchar(64) NOT NULL,
  `product_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `unit` varchar(64) NOT NULL,
  `image` text NOT NULL,
  `image_alt` varchar(255) NOT NULL,
  `price_ex_vat` decimal(12,2) NOT NULL,
  `price_incl_vat` decimal(12,2) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_variations_product` (`product_id`),
  CONSTRAINT `fk_variations_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variations`
--

LOCK TABLES `product_variations` WRITE;
/*!40000 ALTER TABLE `product_variations` DISABLE KEYS */;
INSERT INTO `product_variations` VALUES
('ph-cheddar-grated','ph-cheddar','Grated','kg','https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80','Grated cheddar cheese',168.00,193.20,1),
('ph-cheddar-loaf','ph-cheddar','Loaf','kg','https://images.unsplash.com/photo-1618164436249-4473940d1f5d?auto=format&fit=crop&w=800&q=80','Cheddar cheese loaf',145.00,166.75,0);
/*!40000 ALTER TABLE `product_variations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(64) NOT NULL,
  `supplier_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `unit` varchar(64) NOT NULL,
  `category` varchar(128) NOT NULL,
  `image` text NOT NULL,
  `image_alt` varchar(255) NOT NULL,
  `price_ex_vat` decimal(12,2) NOT NULL,
  `price_incl_vat` decimal(12,2) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_products_supplier` (`supplier_id`),
  CONSTRAINT `fk_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES
('ac-calamari','atlantic-catch','Calamari tubes','kg','Shellfish','https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80','Calamari tubes',165.00,189.75,2),
('ac-kingklip','atlantic-catch','Kingklip fillets','kg','Fish','https://images.unsplash.com/photo-1519708227419-c100ac8b0d13?auto=format&fit=crop&w=800&q=80','Kingklip fillets',245.00,281.75,0),
('ac-mussels','atlantic-catch','Live mussels','kg','Shellfish','https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80','Live mussels',68.00,78.20,1),
('ac-salmon','atlantic-catch','Norwegian salmon','side','Fish','https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=800&q=80','Salmon side',520.00,598.00,3),
('gv-basil','green-valley','Fresh basil','bunch','Herbs & leaves','https://images.unsplash.com/photo-1618375569909-3cda177bb0b1?auto=format&fit=crop&w=800&q=80','Fresh basil bunch',18.00,20.70,3),
('gv-onion','green-valley','Brown onions','10kg bag','Vegetables','https://images.unsplash.com/photo-1518977956812-cd3d11ea4d15?auto=format&fit=crop&w=800&q=80','Brown onions',95.00,109.25,2),
('gv-potato','green-valley','Medium potatoes','10kg bag','Vegetables','https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80','Medium potatoes',110.00,126.50,4),
('gv-rocket','green-valley','Wild rocket','200g','Herbs & leaves','https://images.unsplash.com/photo-1622206151224-4f8848486ce0?auto=format&fit=crop&w=800&q=80','Fresh wild rocket leaves',22.00,25.30,1),
('gv-tomato','green-valley','Roma tomatoes','kg','Vegetables','https://images.unsplash.com/photo-1546470427-e212b9d31075?auto=format&fit=crop&w=800&q=80','Roma tomatoes',28.50,32.78,0),
('km-boerewors','karoo-meats','Traditional boerewors','kg','Sausage','https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?auto=format&fit=crop&w=800&q=80','Traditional boerewors',115.00,132.25,3),
('km-lamb','karoo-meats','Lamb loin chops','kg','Lamb','https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80','Lamb loin chops',265.00,304.75,1),
('km-mince','karoo-meats','Lean beef mince','kg','Beef','https://images.unsplash.com/photo-1602478067153-9b16a5b8f0d0?auto=format&fit=crop&w=800&q=80','Lean beef mince',98.00,112.70,2),
('km-rump','karoo-meats','Rump steak','kg','Beef','https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=800&q=80','Rump steak',189.00,217.35,0),
('ph-cheddar','pantry-house','Mature cheddar','kg','Dairy','https://images.unsplash.com/photo-1618164436249-4473940d1f5d?auto=format&fit=crop&w=800&q=80','Block of mature cheddar cheese',145.00,166.75,4),
('ph-flour','pantry-house','Cake flour','12.5kg','Baking','https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80','Cake flour',145.00,166.75,2),
('ph-olive','pantry-house','Extra virgin olive oil','5L','Oils','https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80','Extra virgin olive oil',420.00,483.00,0),
('ph-rice','pantry-house','Basmati rice','10kg','Grains','https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80','Basmati rice',285.00,327.75,1),
('ph-salt','pantry-house','Fine sea salt','5kg','Seasoning','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80','Fine sea salt',78.00,89.70,3);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` varchar(64) NOT NULL,
  `created_at` datetime NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `reviewed_at` datetime DEFAULT NULL,
  `username` varchar(64) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `registered_business_name` varchar(255) NOT NULL,
  `trading_name` varchar(255) NOT NULL,
  `vat_number` varchar(64) NOT NULL DEFAULT '',
  `registration_number` varchar(64) NOT NULL DEFAULT '',
  `landline_number` varchar(64) NOT NULL DEFAULT '',
  `buyer_name` varchar(255) NOT NULL,
  `buyer_phone` varchar(64) NOT NULL,
  `buyer_email` varchar(255) NOT NULL,
  `accounts_name` varchar(255) NOT NULL,
  `accounts_phone` varchar(64) NOT NULL,
  `accounts_email` varchar(255) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) NOT NULL DEFAULT '',
  `city` varchar(128) NOT NULL,
  `province` varchar(128) NOT NULL,
  `postal_code` varchar(32) NOT NULL,
  `trading_times_json` text NOT NULL,
  `trading_times_notes` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `region` varchar(255) NOT NULL,
  `specialty` varchar(255) NOT NULL,
  `lead_time` varchar(255) NOT NULL,
  `image` text NOT NULL,
  `image_alt` varchar(255) NOT NULL,
  `blurb` text NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES
('atlantic-catch','Atlantic Catch Co.','Hout Bay','Day-boat seafood','Same-day cut-off 10:00','https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80','Fresh fish displayed on ice','Line-caught fish and shellfish portioned for a la carte and banquet service.',1,'2026-08-17 17:52:15'),
('green-valley','Green Valley Produce','Stellenbosch','Fresh vegetables & herbs','Next-day delivery','https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80','Crates of fresh market vegetables','Farm-picked greens, roots, and kitchen herbs packed for restaurant volume.',0,'2026-08-17 17:52:15'),
('karoo-meats','Karoo Pasture Meats','Beaufort West','Grass-fed beef & lamb','2-day delivery','https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1600&q=80','Butcher preparing fresh meat cuts','Traceable pasture meats cut to kitchen specs — from mince to aged steaks.',2,'2026-08-17 17:52:15'),
('pantry-house','Pantry House Dry Goods','Paarden Eiland','Oils, grains & staples','Next-day delivery','https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1600&q=80','Bulk dry goods and pantry staples','Kitchen staples in trade sizes — rice, oils, flours, and service-ready dry stock.',3,'2026-08-17 17:52:15');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'fieldworx'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-17 17:52:16
