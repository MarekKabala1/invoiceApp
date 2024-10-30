CREATE TABLE `Categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_id` text NOT NULL,
	`amount` real NOT NULL,
	`date` text NOT NULL,
	`currency` text DEFAULT 'GBP',
	`description` text DEFAULT '',
	`type` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `Categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `Invoice` ADD `currency` text DEFAULT 'GBP';--> statement-breakpoint
CREATE UNIQUE INDEX `name_idx` ON `Categories` (`name`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `Transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `Transactions` (`category_id`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `Transactions` (`date`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `Bank_Details` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `Customer` (`email_address`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `Invoice` (`user_id`);--> statement-breakpoint
CREATE INDEX `customer_idx` ON `Invoice` (`customer_id`);--> statement-breakpoint
CREATE INDEX `invoice_idx` ON `Notes` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `invoice_idx` ON `Payments` (`invoice_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `User` (`email_address`);--> statement-breakpoint
CREATE INDEX `invoice_idx` ON `Work_Information` (`invoice_id`);