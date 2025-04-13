/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `color`;
CREATE TABLE `color` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_price` decimal(15,0) NOT NULL,
  `status` enum('Pending','Processing','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `order_detail`;
CREATE TABLE `order_detail` (
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(15,0) NOT NULL,
  PRIMARY KEY (`order_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_detail_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_detail_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(15,0) NOT NULL,
  `description` text,
  `product_type_id` int NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `brand` varchar(255) NOT NULL DEFAULT 'MixiShop',
  `sku` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `main_image` varchar(255) NOT NULL,
  `extra_images` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `product_type_id` (`product_type_id`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`product_type_id`) REFERENCES `product_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `product_color`;
CREATE TABLE `product_color` (
  `product_id` int NOT NULL,
  `color_id` int NOT NULL,
  PRIMARY KEY (`product_id`,`color_id`),
  KEY `color_id` (`color_id`),
  CONSTRAINT `product_color_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_color_ibfk_2` FOREIGN KEY (`color_id`) REFERENCES `color` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `product_type`;
CREATE TABLE `product_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `role` enum('Admin','Guest') NOT NULL DEFAULT 'Guest',
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



INSERT INTO `order` (`id`, `user_id`, `total_price`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, '1150000', 'Pending', '2025-04-11 07:08:34', '2025-04-11 07:08:34');


INSERT INTO `order_detail` (`order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 6, 2, '320000');
INSERT INTO `order_detail` (`order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 9, 3, '170000');


INSERT INTO `product` (`id`, `name`, `price`, `description`, `product_type_id`, `stock_quantity`, `brand`, `sku`, `created_at`, `updated_at`, `main_image`, `extra_images`) VALUES
(3, 'Cốc Mixi', '250000', NULL, 1, 200, 'MixiShop', 'Mixi02', '2025-03-31 07:52:42', '2025-04-01 10:08:30', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743407561/images/iexohuwidkrhryrdlwme.png', NULL);
INSERT INTO `product` (`id`, `name`, `price`, `description`, `product_type_id`, `stock_quantity`, `brand`, `sku`, `created_at`, `updated_at`, `main_image`, `extra_images`) VALUES
(6, 'Bình giữ nhiệt Mixi', '320000', NULL, 1, 198, 'MixiShop', 'Mixi001', '2025-03-31 09:00:32', '2025-04-11 07:08:34', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743411631/images/nheju6kl7lb1q4fduzzi.jpg', NULL);
INSERT INTO `product` (`id`, `name`, `price`, `description`, `product_type_id`, `stock_quantity`, `brand`, `sku`, `created_at`, `updated_at`, `main_image`, `extra_images`) VALUES
(9, 'Bình Giữ Nhiệt Fan Cứng Mixi', '170000', '', 1, 197, 'MixiShop', 'Mixi-002', '2025-04-02 08:02:02', '2025-04-11 07:08:34', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743580921/images/mhowlylvdcpw4w7svq5c.webp', NULL);
INSERT INTO `product` (`id`, `name`, `price`, `description`, `product_type_id`, `stock_quantity`, `brand`, `sku`, `created_at`, `updated_at`, `main_image`, `extra_images`) VALUES
(10, 'Cốc sticker', '250000', '', 1, 200, 'MixiShop', 'Mixi-003', '2025-04-02 08:03:14', '2025-04-02 08:03:14', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743580993/images/l9rtku491iuunljetqm8.png', NULL),
(11, 'Phụ kiện cốc', '40000', '', 1, 200, 'MixiShop', 'Mixi-004', '2025-04-02 08:05:59', '2025-04-02 08:05:59', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743581158/images/lqw9nacyt8ucgnper65g.jpg', NULL),
(12, 'Bộ Ghép Hình Mixi – Mixi Block SS9', '399000', '', 2, 200, 'MixiShop', 'MixiLego-09', '2025-04-02 08:07:34', '2025-04-02 08:07:34', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743581253/images/zfzvy8n8qx99eslyhj9k.webp', NULL),
(13, 'Bộ Ghép Hình Mixi – Mixi Block SS8', '249000', '', 2, 200, 'MixiShop', 'MixiLego-08', '2025-04-02 08:08:46', '2025-04-02 08:08:46', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743581325/images/mw6qhqukuc2gp2gbvvra.webp', NULL),
(14, 'Dép MixiGaming 2024', '150000', '', 4, 200, 'MixiShop', 'MixiDep-01', '2025-04-02 08:10:11', '2025-04-02 08:10:11', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743581410/images/meov5tsoksihbzql38fl.webp', NULL),
(15, 'Móc vịt', '50000', '', 3, 0, 'MixiShop', 'MixiLuuNiem-01', '2025-04-02 08:11:18', '2025-04-11 07:21:55', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743581477/images/nz9jmjfrstwbewnonmjg.jpg', NULL),
(16, 'Pad chuột MixiGaming', '290000', '', 3, 200, 'MixiShop', 'MixiLuuNiem-02', '2025-04-02 08:12:15', '2025-04-02 08:12:15', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743581534/images/yylihlrh7cc5thnaclck.webp', NULL),
(17, 'Áo khoác nỉ', '350000', '', 5, 200, 'MixiShop', 'MixiThuDong-01', '2025-04-02 08:13:43', '2025-04-02 08:13:43', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743581622/images/lw5tyzcyyvzqsunyrzpl.webp', NULL),
(18, 'Áo phông Mixi – Trắng', '250000', '', 8, 200, 'MixiShop', 'MixiThuHe-001', '2025-04-02 08:14:49', '2025-04-02 08:14:49', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743581688/images/y9gnx3wmdppqklkt8pk2.jpg', NULL);



INSERT INTO `product_type` (`id`, `name`, `created_at`, `updated_at`, `image`) VALUES
(1, 'Cốc bình', '2025-03-30 03:04:18', '2025-04-01 09:40:14', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743500415/images/dvqmh3tpxabywdhacxca.webp');
INSERT INTO `product_type` (`id`, `name`, `created_at`, `updated_at`, `image`) VALUES
(2, 'Lego', '2025-04-01 09:11:59', '2025-04-01 09:57:20', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743501437/images/ewm9ftqu8rdslm4x8nia.webp');
INSERT INTO `product_type` (`id`, `name`, `created_at`, `updated_at`, `image`) VALUES
(3, 'Đồ lưu niệm', '2025-04-01 09:12:08', '2025-04-01 09:57:47', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743501467/images/wfzwnws74rkd42d7ef1v.webp');
INSERT INTO `product_type` (`id`, `name`, `created_at`, `updated_at`, `image`) VALUES
(4, 'Giày dép', '2025-04-01 09:12:20', '2025-04-01 09:58:01', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743501481/images/mbtqgkzxg8e7xk7pi7up.webp'),
(5, 'Đồ thu đông', '2025-04-01 09:12:29', '2025-04-01 09:58:27', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743501508/images/hlfpavdb8wohonehatr1.webp'),
(8, 'Đồ xuân hè', '2025-04-01 09:34:57', '2025-04-01 09:34:57', 'https://res.cloudinary.com/dfq7olhxn/image/upload/v1743500097/images/si68oini3ujilutlcjvo.webp');

INSERT INTO `user` (`id`, `name`, `email`, `password`, `phone`, `gender`, `role`, `avatar`, `created_at`, `updated_at`) VALUES
(3, 'Minh Nhân', 'admin@gmail.com', '$2b$10$9fVQbIzStCF9jebCsoj34.GQF8ARVNZsbFlgtXX5OTR4p3GICW9IW', NULL, NULL, 'Admin', NULL, '2025-03-28 06:17:35', '2025-04-01 13:23:38');
INSERT INTO `user` (`id`, `name`, `email`, `password`, `phone`, `gender`, `role`, `avatar`, `created_at`, `updated_at`) VALUES
(6, 'Kirinb', 'admin1@gmail.com', '$2b$10$Z18TLTvKmcL3yIMv7rhmBO9YkMLRmgLfc.P/LiGWVF.FQPvwQH7Hu', NULL, NULL, 'Admin', NULL, '2025-03-28 06:57:15', '2025-03-28 07:05:18');
INSERT INTO `user` (`id`, `name`, `email`, `password`, `phone`, `gender`, `role`, `avatar`, `created_at`, `updated_at`) VALUES
(10, 'Minh Nhan', 'minhnhan@gmail.com', '$2b$10$9FVKR/XK7YmMvLN6f7C8JeDI0m5yk5r3p7A52BU.RCgc0PI/.3Xbe', NULL, '', 'Guest', NULL, '2025-04-01 06:42:27', '2025-04-02 03:06:25');
INSERT INTO `user` (`id`, `name`, `email`, `password`, `phone`, `gender`, `role`, `avatar`, `created_at`, `updated_at`) VALUES
(12, '123', 'admin112@gmail.com', '$2b$10$omyd0WvXt8JK0frizOpPB.XmuPvelWO9q3OhWNd5JTOXpoF6Z0ody', '0937123123', 'Nữ', 'Admin', NULL, '2025-04-01 06:53:22', '2025-04-02 02:32:53'),
(14, 'Alexis Hoffman', 'jusydyv@mailinator.com', '$2b$10$2ZSoWUnldtT3MfCGk5.Ha.WY3bskVTH3n2O9lXlryCIA14a7mjgJC', '0937123123', 'Nam', 'Admin', NULL, '2025-04-02 03:05:58', '2025-04-02 03:05:58'),
(15, 'Alexis Hoffman', 'mubv@mailinator.com', '$2b$10$0wLKJ9cp4a650f.USafJ.u4do5rRHr1jaS5sIjQ0/pJF/H1Iz1qIK', '0937123123', 'Nam', 'Admin', NULL, '2025-04-02 03:06:34', '2025-04-02 03:06:34'),
(16, 'Alexis Hoffman', 'mub3v@mailinator.com', '$2b$10$BA7Hioqz7yM40qk8AfJGX.uvBZ2wXZ93ypqtTfADBukJUpFSo0to2', '0937123123', 'Nam', 'Admin', NULL, '2025-04-02 03:07:47', '2025-04-02 03:07:47'),
(17, 'Minh Nhân', 'lyminhnhan@gmail.com', '$2b$10$88QhJi5zYTQBVQLv9AH2uuDJRxTL.SLjEw8JiGbpYxll3lFseaoVm', '0937123123', 'Nam', 'Admin', NULL, '2025-04-02 03:10:34', '2025-04-02 03:10:34');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;