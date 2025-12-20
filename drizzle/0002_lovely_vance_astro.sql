PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_orderItems` (
	`id` text PRIMARY KEY NOT NULL,
	`orderId` text NOT NULL,
	`productId` text,
	`itemCode` integer NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`price` real NOT NULL,
	`subtotal` real NOT NULL,
	`cost` real,
	`costTotal` real,
	`profit` real,
	`profitTotal` real,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_orderItems`("id", "orderId", "productId", "itemCode", "code", "name", "amount", "price", "subtotal", "cost", "costTotal", "profit", "profitTotal") SELECT "id", "orderId", "productId", "itemCode", "code", "name", "amount", "price", "subtotal", "cost", "costTotal", "profit", "profitTotal" FROM `orderItems`;--> statement-breakpoint
DROP TABLE `orderItems`;--> statement-breakpoint
ALTER TABLE `__new_orderItems` RENAME TO `orderItems`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`price` real NOT NULL,
	`cost` real,
	`profit` real,
	`isFractioned` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`inventory` integer
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "name", "code", "price", "cost", "profit", "isFractioned", "createdAt", "updatedAt", "inventory") SELECT "id", "name", "code", "price", "cost", "profit", "isFractioned", "createdAt", "updatedAt", "inventory" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
CREATE UNIQUE INDEX `products_code_key` ON `products` (`code`);