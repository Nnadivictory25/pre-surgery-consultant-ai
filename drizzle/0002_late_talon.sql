CREATE TABLE `message_ratings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_id` text NOT NULL,
	`message_index` integer NOT NULL,
	`message_content` text NOT NULL,
	`rating` integer NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`start_time` integer,
	`end_time` integer,
	`duration_seconds` integer
);
