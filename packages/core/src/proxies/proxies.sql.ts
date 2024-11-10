import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { nanoidGenerator, timestamps } from "../db/utils";

export const proxiesTable = sqliteTable("proxies", {
  id: text().primaryKey().$defaultFn(nanoidGenerator),

  target: text().notNull(),

  ...timestamps,
});

export type SelectProxy = typeof proxiesTable.$inferSelect;
export type InsertProxy = typeof proxiesTable.$inferInsert;
