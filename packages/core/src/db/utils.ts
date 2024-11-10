import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";
import { customAlphabet } from "nanoid";

export const generateNanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz1234567890",
  6
);

export const nanoidGenerator = () => generateNanoid();

export const timestamps = {
  updatedAt: text()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  createdAt: text()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text(),
};
