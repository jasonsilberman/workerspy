import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { createContext } from "../contex";

export const createDb = (db: AnyD1Database) => {
  return drizzle(db, {
    // schema,
    // logger: true,
  });
};

export const DbContext = createContext<ReturnType<typeof createDb>>("db");

export const useDb = () => DbContext.use();
