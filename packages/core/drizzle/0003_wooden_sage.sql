ALTER TABLE `requests` ADD `requestBodyType` text NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` ADD `responseBodyType` text NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` DROP COLUMN `enum`;