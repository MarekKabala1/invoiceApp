CREATE TABLE `Bank_Details` (
	`Id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`Account_Name` text NOT NULL,
	`Sort_Code` text NOT NULL,
	`Account_Number` text NOT NULL,
	`Bank_Name` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `My_Info`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Customer` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`email_address` text NOT NULL,
	`phone_number` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Invoice` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`customer_id` integer NOT NULL,
	`invoice_date` text NOT NULL,
	`due_date` text,
	`amount_after_tax` real NOT NULL,
	`amount_before_tax` real NOT NULL,
	`tax_rate` real NOT NULL,
	`pdf_path` text,
	FOREIGN KEY (`user_id`) REFERENCES `My_Info`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Notes` (
	`id` integer PRIMARY KEY NOT NULL,
	`invoice_id` integer NOT NULL,
	`note_date` text NOT NULL,
	`note_text` text NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Payments` (
	`id` integer PRIMARY KEY NOT NULL,
	`invoice_id` integer NOT NULL,
	`payment_date` text,
	`amount_paid` real NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `My_Info` (
	`id` integer PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`address` text NOT NULL,
	`email_address` text NOT NULL,
	`phone_number` text,
	`UTR_number` text NOT NULL,
	`NIN_number` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Work_Information` (
	`id` integer PRIMARY KEY NOT NULL,
	`invoice_id` integer NOT NULL,
	`description_of_work` text,
	`unit_price` real NOT NULL,
	`day_of_week` text NOT NULL,
	`total_to_pay_minus_tax` real NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Customer_email_address_unique` ON `Customer` (`email_address`);--> statement-breakpoint
CREATE UNIQUE INDEX `My_Info_email_address_unique` ON `My_Info` (`email_address`);