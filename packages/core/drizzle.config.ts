import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const { LOCAL_DB_PATH, DB_ID, D1_TOKEN, CF_ACCOUNT_ID } = process.env;

// Use better-sqlite driver for local development
export default defineConfig(
  LOCAL_DB_PATH
    ? {
        schema: "./src/**/*.sql.ts",
        dialect: "sqlite",
        dbCredentials: {
          url: LOCAL_DB_PATH,
        },
      }
    : {
        schema: "./src/**/*.sql.ts",
        dialect: "sqlite",
        driver: "d1-http",
        dbCredentials: {
          databaseId: DB_ID!,
          token: D1_TOKEN!,
          accountId: CF_ACCOUNT_ID!,
        },
      }
);
