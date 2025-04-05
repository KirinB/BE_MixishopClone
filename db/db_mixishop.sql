CREATE TABLE `user`(
	`id` INT PRIMARY KEY AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`email` VARCHAR(255) UNIQUE NOT NULL,
	`password` varchar(255) NOT NULL,
	`phone` varchar(255) DEFAULT NULL,
	`gender` varchar(255) DEFAULT NULL,
	`role` ENUM('Admin', 'Guest') NOT NULL DEFAULT 'Guest',
	`avatar` varchar(255) DEFAULT NULL,
	`created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  	`updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE `product_type` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  	`updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


ALTER TABLE `product_type` 
ADD COLUMN `image` VARCHAR(255) NULL;


CREATE TABLE `product` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(15,0) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `product_type_id` INT NOT NULL,
    `stock_quantity` INT NOT NULL DEFAULT 0,
    `brand` VARCHAR(255) NOT NULL DEFAULT 'MixiShop',
    `sku` VARCHAR(50) NOT NULL UNIQUE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_type_id`) REFERENCES `product_type`(`id`) ON DELETE CASCADE
);

CREATE TABLE `color` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE `product_color` (
    `product_id` INT,
    `color_id` INT,
    PRIMARY KEY (`product_id`, `color_id`),
    FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`color_id`) REFERENCES `color`(`id`) ON DELETE CASCADE
);

CREATE TABLE `order` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `total_price` DECIMAL(15,0) NOT NULL,
    `status` ENUM('Pending', 'Processing', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);

CREATE TABLE `order_detail` (
    `order_id` INT,
    `product_id` INT,
    `quantity` INT NOT NULL,
    `price` DECIMAL(15,0) NOT NULL,
    PRIMARY KEY (`order_id`, `product_id`),
    FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE
);

