import { blob, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { timestamps } from "../db/utils";
import { proxiesTable } from "../proxies/proxies.sql";

const bodyTypeEnum = ["none", "blob", "text", "json", "error"] as const;

export const requestsTable = sqliteTable("requests", {
  id: int().primaryKey({ autoIncrement: true }),

  proxyId: text()
    .notNull()
    .references(() => proxiesTable.id),

  url: text().notNull(),

  clientIp: text().notNull(),

  durationMs: int().notNull(),

  requestMethod: text().notNull(),
  requestHeaders: text({ mode: "json" })
    .$type<Record<string, string>>()
    .notNull(),
  requestBodyType: text({
    enum: bodyTypeEnum,
  }).notNull(),
  requestBodyRaw: blob(),
  requestBodyText: text(),
  requestBodyJson: text({ mode: "json" }),

  responseStatus: int().notNull(),
  responseHeaders: text({ mode: "json" })
    .$type<Record<string, string>>()
    .notNull(),
  responseBodyType: text({
    enum: bodyTypeEnum,
  }).notNull(),
  responseBodyRaw: blob(),
  responseBodyText: text(),
  responseBodyJson: text({ mode: "json" }),

  ...timestamps,
});

export type SelectRequest = typeof requestsTable.$inferSelect;
export type InsertRequest = typeof requestsTable.$inferInsert;

export const selectRequestSchema = createSelectSchema(requestsTable);
export const insertRequestSchema = createInsertSchema(requestsTable);
