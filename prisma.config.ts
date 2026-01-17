// Prisma config for Prisma 7
// Loads DATABASE_URL from environment variables

import * as dotenv from "dotenv";

// Load .env files for local development (Railway sets env vars directly)
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
