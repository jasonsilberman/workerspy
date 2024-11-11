CREATE TABLE `proxies` (
	`id` text PRIMARY KEY NOT NULL,
	`target` text NOT NULL,
	`token` text NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deletedAt` text
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proxyId` text NOT NULL,
	`url` text NOT NULL,
	`clientIp` text NOT NULL,
	`durationMs` integer NOT NULL,
	`requestMethod` text NOT NULL,
	`requestHeaders` text NOT NULL,
	`requestBodyType` text NOT NULL,
	`requestBodyRaw` blob,
	`requestBodyText` text,
	`requestBodyJson` text,
	`responseStatus` integer NOT NULL,
	`responseHeaders` text NOT NULL,
	`responseBodyType` text NOT NULL,
	`responseBodyRaw` blob,
	`responseBodyText` text,
	`responseBodyJson` text,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deletedAt` text,
	FOREIGN KEY (`proxyId`) REFERENCES `proxies`(`id`) ON UPDATE no action ON DELETE no action
);
