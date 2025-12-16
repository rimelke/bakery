CREATE TABLE `orderItems` (
	`id` text PRIMARY KEY NOT NULL,
	`orderId` text NOT NULL,
	`productId` text,
	`itemCode` integer NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`price` real NOT NULL,
	`subtotal` real NOT NULL,
	`cost` real NOT NULL,
	`costTotal` real NOT NULL,
	`profit` real NOT NULL,
	`profitTotal` real NOT NULL,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`code` integer NOT NULL,
	`itemsAmount` integer NOT NULL,
	`total` real NOT NULL,
	`paymentMethod` text NOT NULL,
	`paymentTotal` real NOT NULL,
	`paymentOver` real,
	`cost` real NOT NULL,
	`profit` real NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_code_key` ON `orders` (`code`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`price` real NOT NULL,
	`cost` real NOT NULL,
	`profit` real NOT NULL,
	`isFractioned` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`inventory` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_code_key` ON `products` (`code`);