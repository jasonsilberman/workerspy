import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoidGenerator, timestamps, tokenGenerator } from "../db/utils";

export const proxiesTable = sqliteTable("proxies", {
  id: text().primaryKey().$defaultFn(nanoidGenerator),

  target: text().notNull(),

  token: text().notNull().$defaultFn(tokenGenerator),

  ...timestamps,
});

export type SelectProxy = typeof proxiesTable.$inferSelect;
export type InsertProxy = typeof proxiesTable.$inferInsert;

export const selectProxySchema = createSelectSchema(proxiesTable);
export const insertProxySchema = createInsertSchema(proxiesTable);
