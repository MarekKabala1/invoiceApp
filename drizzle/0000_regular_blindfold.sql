CREATE TABLE `Bank_Details` (
	`Id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`Account_Name` text,
	`Sort_Code` text,
	`Account_Number` text,
	`Bank_Name` text,
	`timestamp` text DEFAULT (current_timestamp),
	FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Customer` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`address` text,
	`email_address` text,
	`phone_number` text,
	`timestamp` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `Invoice` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`customer_id` integer,
	`invoice_date` text,
	`due_date` text,
	`amount_after_tax` real,
	`amount_before_tax` real,
	`tax_rate` real,
	`pdf_path` text,
	`timestamp` text DEFAULT (current_timestamp),
	FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Notes` (
	`id` integer PRIMARY KEY NOT NULL,
	`invoice_id` integer,
	`note_date` text,
	`note_text` text,
	`timestamp` text DEFAULT (current_timestamp),
	FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Payments` (
	`id` integer PRIMARY KEY NOT NULL,
	`invoice_id` integer,
	`payment_date` text,
	`amount_paid` real,
	`timestamp` text DEFAULT (current_timestamp),
	FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` integer PRIMARY KEY NOT NULL,
	`full_name` text,
	`address` text,
	`email_address` text,
	`phone_number` text,
	`UTR_number` text,
	`NIN_number` text,
	`timestamp` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `Work_Information` (
	`id` integer PRIMARY KEY NOT NULL,
	`invoice_id` integer,
	`description_of_work` text,
	`unit_price` real,
	`day_of_week` text,
	`total_to_pay_minus_tax` real,
	`timestamp` text DEFAULT (current_timestamp),
	FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Customer_email_address_unique` ON `Customer` (`email_address`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_address_unique` ON `User` (`email_address`);