CREATE TABLE `asset_class_risk_level_mapping` (
	`asset_risk_id` integer PRIMARY KEY NOT NULL,
	`asset_type` text(100) NOT NULL,
	`volatility_range_start` real NOT NULL,
	`volatility_range_end` real NOT NULL,
	`risk_score` real NOT NULL,
	`concentration` text,
	`score1` real,
	`addon1` real,
	`addon2` real
);
--> statement-breakpoint
CREATE TABLE `asset_history` (
	`asset_hist_id` integer PRIMARY KEY NOT NULL,
	`asset_id` integer NOT NULL,
	`date` text NOT NULL,
	`close_price` real NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `asset_type`(`asset_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `asset_sector` (
	`asset_sec_id` integer PRIMARY KEY NOT NULL,
	`asset_id` integer NOT NULL,
	`sector_symbol` text(200) NOT NULL,
	`sector_name` text(200) NOT NULL,
	`sector_weightage` real NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `asset_type`(`asset_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `asset_type` (
	`asset_id` integer PRIMARY KEY NOT NULL,
	`asset_ticker` text(10) NOT NULL,
	`asset_name` text(200) NOT NULL,
	`asset_class` text(100) NOT NULL,
	`net_expense_ratio` real,
	`morningstar_rating` real,
	`maturity_date` text,
	`one_yr_volatility` real,
	`similar_asset` text,
	`category` text(200),
	`asset_manager` text(200),
	`portfolio_composition` text,
	`bond_rating` real,
	`concentration` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `asset_type_asset_ticker_unique` ON `asset_type` (`asset_ticker`);--> statement-breakpoint
CREATE TABLE `default_benchmarks` (
	`benchmark_id` integer PRIMARY KEY NOT NULL,
	`benchamark_asset_id` integer NOT NULL,
	`benchmark_for_asset_class` text(100) NOT NULL,
	FOREIGN KEY (`benchamark_asset_id`) REFERENCES `asset_type`(`asset_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `order_book` (
	`order_id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`account_id` integer,
	`asset_id` integer NOT NULL,
	`order_type` text(15) NOT NULL,
	`symbol` text(10) NOT NULL,
	`description` text(200),
	`buy_sell` text(4) NOT NULL,
	`unit_price` real NOT NULL,
	`limit_price` real,
	`qty` real NOT NULL,
	`amount` real NOT NULL,
	`settlement_date` text NOT NULL,
	`order_status` text(20) NOT NULL,
	`confirmation_status` text(25) DEFAULT 'pending_confirmation' NOT NULL,
	`order_date` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `user_accounts`(`account_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset_type`(`asset_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `price_cache` (
	`cache_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text(10) NOT NULL,
	`date` text NOT NULL,
	`close_price` real NOT NULL,
	`cached_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `relative_benchmarks` (
	`id` integer PRIMARY KEY NOT NULL,
	`asset_ticker` text(10) NOT NULL,
	`asset_name` text(200) NOT NULL,
	`relative_benchmark` text(10) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `relative_benchmarks_asset_ticker_unique` ON `relative_benchmarks` (`asset_ticker`);--> statement-breakpoint
CREATE TABLE `user_accounts` (
	`account_id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`account_name` text(100) NOT NULL,
	`account_type` text(20) NOT NULL,
	`cash_balance` real DEFAULT 0 NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_portfolio` (
	`user_port_id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`asset_id` integer NOT NULL,
	`asset_total_units` real NOT NULL,
	`avg_cost_per_unit` real NOT NULL,
	`investment_amount` real NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset_type`(`asset_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_transactions` (
	`trans_id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`account_id` integer,
	`asset_id` integer,
	`trans_type` text(10) NOT NULL,
	`date` text NOT NULL,
	`units` real,
	`price_per_unit` real,
	`cost` real NOT NULL,
	`description` text(200),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `user_accounts`(`account_id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`asset_id`) REFERENCES `asset_type`(`asset_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`name` text(150) NOT NULL,
	`username` text(150) NOT NULL,
	`email` text(150) NOT NULL,
	`password` text(200) NOT NULL,
	`dob` text NOT NULL,
	`phone_number` text(11) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_number_unique` ON `users` (`phone_number`);