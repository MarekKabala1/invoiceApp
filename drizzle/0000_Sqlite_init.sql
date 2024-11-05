CREATE TABLE `Bank_Details` (
	`Id` text,
	`user_id` text,
	`Account_Name` text,
	`Sort_Code` text,
	`Account_Number` text,
	`Bank_Name` text,
	`timestamp` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `Categories` (
	`id` text,
	`name` text,
	`type` text
);
--> statement-breakpoint
CREATE TABLE `Customer` (
	`id` text,
	`name` text,
	`address` text,
	`email_address` text,
	`phone_number` text,
	`timestamp` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `Invoice` (
	`id` text,
	`user_id` text,
	`customer_id` text,
	`invoice_date` text,
	`due_date` text,
	`amount_after_tax` real,
	`amount_before_tax` real,
	`tax_rate` real,
	`pdf_path` text,
	`currency` text DEFAULT 'GBP',
	`timestamp` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `Notes` (
	`id` text,
	`invoice_id` text,
	`note_date` text,
	`note_text` text,
	`timestamp` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `Payments` (
	`id` text,
	`invoice_id` text,
	`payment_date` text,
	`amount_paid` real,
	`timestamp` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `Transactions` (
	`id` text,
	`user_id` text,
	`category_id` text,
	`amount` real,
	`date` text,
	`timestamp` text DEFAULT (current_timestamp),
	`currency` text DEFAULT 'GBP',
	`description` text DEFAULT '',
	`type` text
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text,
	`full_name` text,
	`address` text,
	`email_address` text,
	`phone_number` text,
	`UTR_number` text,
	`NIN_number` text,
	`timestamp` text DEFAULT (current_timestamp),
	`is_admin` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `Work_Information` (
	`id` text,
	`invoice_id` text,
	`description_of_work` text,
	`unit_price` real,
	`day_of_week` text,
	`total_to_pay_minus_tax` real,
	`timestamp` text DEFAULT (current_timestamp)
);
